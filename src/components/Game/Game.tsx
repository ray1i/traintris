import React, { useEffect, useState } from 'react';

import Board from './Board';

import { minoTypes, srsOffsets } from '../../data/minodata';
import { Mino } from './types';
import { collide, getNewMino, getMovedMino, getRotatedMino } from './util';

const blocksize = 32

const width = 10;
const height = 40;

function Game() {

    // board and board functions:

    const [blocks, setBlocks] = useState(Array.from({ length: height }, () => Array(width).fill('')));

    const setBlock = (x: number, y: number, type: string) => {
        if (x < width && y < height) {
            let tempBlocks = JSON.parse(JSON.stringify(blocks));
            tempBlocks[y][x] = type;

            setBlocks(tempBlocks);
        }
    }

    const setMultipleBlocks = (blocklist: {x: number, y: number}[], type: string) => {
        let tempBlocks = JSON.parse(JSON.stringify(blocks));
        
        for (let block of blocklist) {
            if (block.x < width && block.y < height) {
                tempBlocks[block.y][block.x] = type;
            }
        }

        setBlocks(tempBlocks);
    }

    // Mino and Mino functions:

    const [currMino, setCurrMino] = useState<Mino>();

    useEffect(() => {
        const newMino = getNewMino('S', 4, 5);
        setCurrMino(newMino);
    }, [])
    
    const moveCurrMino = (x: number, y: number) => {
        if (currMino) {
            const movedMino = getMovedMino(currMino, x, y);
        
            if (!collide(blocks, movedMino)) {
                setCurrMino(movedMino);
            }
        }   
    }

    const rotateCurrMino = (n: number) => {
        if (currMino) {
            const newperm = (currMino.perm + n) % 4
            const currOffset = srsOffsets[currMino.type as keyof typeof srsOffsets];
            const rotatedMino = getRotatedMino(currMino, n);

            for (let i = 0; i < currOffset.length; i++){
                const offset = [currOffset[currMino.perm][i][0] - currOffset[newperm][i][0], currOffset[currMino.perm][i][1] - currOffset[newperm][i][1]]
                const offsetMino = getMovedMino(rotatedMino, offset[0], offset[1])

                if (!collide(blocks, offsetMino)) {
                    setCurrMino(offsetMino);
                    return;
                }
            }
        }
    }

    return (
        <div className="section">

            <div id="traintris-game" tabIndex={1}>

                <div id="hold-container">
                    <canvas id="hold" className='traintris-canvas' width="128" height="128"></canvas>
                </div>

                <Board
                    blocks={blocks}
                    currMino={currMino}
                    setBlock={setBlock}
                />

                <div id="queue-container">
                    <canvas id="queue" className='traintris-canvas' width="128" height="640"></canvas>
                </div>

            </div>

            <div id='undo-redo'>

                <button className='small-button' title='Ctrl+Z'>UNDO</button>
                <button className='small-button' title='Ctrl+Y'>REDO</button>

            </div>

        </div>
    );
}

export default Game;
