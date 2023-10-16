import React, { useState, useEffect, useRef } from 'react';

import { minoIndexes, blocksize } from "../../constants/minodata"

import { Mino, Blocks, PCFinderProps, minoType } from '../../types/types';

import { getBoardWithPlacedMinos } from '../../scripts/util';

import board from '../../img/board.png'
import blocksheet from '../../img/blocksheet.png'

import './PCFinder.css';

// eslint-disable-next-line import/no-webpack-loader-syntax
import Worker from "worker-loader!../../scripts/pc-finder.worker.ts";

const blocksheetSprite = new Image();
blocksheetSprite.src = blocksheet;
const boardSprite = new Image();
boardSprite.src = board;

const PCFinder = (props: PCFinderProps) => {

    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [existingBlocks, setExistingBlocks] = useState<Blocks>([]);
    const [solutions, setSolutions] = useState<Blocks[]>([]);
    const [solutionIndex, setSolutionIndex] = useState<number>(0);
    
    const [isSolving, setIsSolving] = useState<boolean>(false);
    const [isSolved, setIsSolved] = useState<boolean>(false);
    const [isError, setIsError] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const resetMessageState = () => {
        setIsSolving(false);
        setIsSolved(false)
        setIsError(false);
        setErrorMessage('');
    }

    const startPCWorker = () => {
        if (props.queueMinos) {
            resetMessageState();
            setIsSolving(true)

            const pcWorker: Worker = new Worker();

            // save this for later
            const oldBlocks: Blocks = JSON.parse(JSON.stringify(props.blocks));

            const state = {
                b: props.blocks,
                hold: props.holdMino,
                queue: [props.currMino, ...props.queueMinos]
            }

            pcWorker.postMessage(state)

            pcWorker.onmessage = (e: MessageEvent) => {
                console.log('done', e);

                resetMessageState();
                setIsSolved(true);

                loadSolutions(oldBlocks, e.data as Mino[][]);
                pcWorker.terminate();
            }
            pcWorker.onerror = (e: ErrorEvent) => {
                console.log('error', e);

                resetMessageState();
                
                setIsError(true);
                setErrorMessage(e.message);

                pcWorker.terminate();
            }
        }
    }

    const loadSolutions = (oldBlocks: Blocks, solutions: Mino[][]) => {
        setExistingBlocks(oldBlocks);

        const newSolutions = solutions.map((solution: Mino[]) => getBoardWithPlacedMinos(oldBlocks, solution));
        setSolutions(newSolutions);

        setSolutionIndex(0);
    }

    const goToPrevSolution = () => { 
        setSolutionIndex(solutionIndex - 1 < 0 ? solutions.length - 1 : solutionIndex - 1);
    }

    const goToNextSolution = () => { 
        setSolutionIndex(solutionIndex + 1 >= solutions.length ? 0 : solutionIndex + 1);
    }

    useEffect(() => {
        // draw the current solution 
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        
        if (canvas && ctx) {
            // clear the canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(boardSprite, 0, 0);

            // draw existing board blocks
            for (let i = 0; i < existingBlocks?.length; i++){
                for (let j = 0; j < existingBlocks[i].length; j++){
                    ctx.drawImage(
                        blocksheetSprite,
                        blocksize * minoIndexes[existingBlocks[i][j] as minoType],
                        0,
                        blocksize,
                        blocksize,
                        j * blocksize,
                        (19 - i) * blocksize,
                        blocksize,
                        blocksize);
                }
            }

            // draw current solution
            if (solutions.length > 0) { 
                ctx.globalAlpha = 0.5;
                for (let i = 0; i < solutions[solutionIndex].length; i++){
                    for (let j = 0; j < solutions[solutionIndex][i].length; j++){
                        ctx.drawImage(
                            blocksheetSprite,
                            blocksize * minoIndexes[solutions[solutionIndex][i][j] as minoType],
                            0,
                            blocksize,
                            blocksize,
                            j * blocksize,
                            (19 - i) * blocksize,
                            blocksize,
                            blocksize);
                    }
                }
                ctx.globalAlpha = 1;
            }
        }
    }, [solutions, solutionIndex, existingBlocks]);

    return (
        <div id="pc-finder" className="section">
            {/* <h1 className="section-title">PC FINDER</h1> */}

            <button
                id="pc-start-button"
                className="button-large"
                onClick={startPCWorker}
            >
                FIND PC
            </button>

            <div id="board-container">
                <canvas
                    id="pc-canvas"
                    ref={canvasRef}
                    width={320}
                    height={640}
                />
            </div>

            <div id="pc-buttons">
                <button className="button-large" onClick={goToPrevSolution}>PREV</button>
                <button className="button-large" onClick={goToNextSolution}>NEXT</button>
            </div>

            <p id='pc-message'>
                {isSolving && 'Searching...'}
                {solutions.length > 0 ?
                    `Solution ${solutionIndex + 1} of ${solutions.length}`
                : isSolved ? 'No solutions found' : ''}
                {isError && errorMessage }
            </p>
        </div>
    )
}

export default PCFinder;