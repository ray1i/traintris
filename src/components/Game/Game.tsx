import React, { useEffect, useState } from 'react';

import Board from './Board';
import Hold from './Hold';
import Queue from './Queue';

import { srsOffsets } from '../../data/minodata';
import { minoType, Mino } from './types';
import { collide, getNewMino, getMovedMino, getRotatedMino, getShuffledQueue } from './util';

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
            const currOffset = srsOffsets[currMino.type];
            const rotatedMino = getRotatedMino(currMino, n);

            for (let i = 0; i < currOffset.length; i++){
                const offset = [currOffset[currMino.perm][i][0] - currOffset[rotatedMino.perm][i][0], currOffset[currMino.perm][i][1] - currOffset[rotatedMino.perm][i][1]]
                const offsetMino = getMovedMino(rotatedMino, offset[0], offset[1])

                if (!collide(blocks, offsetMino)) {
                    setCurrMino(offsetMino);
                    return;
                }
            }
        }
    }

    // Hold Mino:
    const [holdMino, setHoldMino] = useState<minoType>();

    const swapHoldMino = () => {
        if (!holdMino) {
            setHoldMino(currMino?.type);
            setCurrMino(getNewMino(queueMinos[0], 4, 5));
            
            let newQueue = [...queueMinos];
            newQueue.splice(0, 1);
            setQueueMinos(newQueue);
        } else {
            const tempType = currMino?.type as minoType;
            setCurrMino(getNewMino(holdMino, 4, 5));
            setHoldMino(tempType);
        }
    }

    // Queue Minos:
    const [queueMinos, setQueueMinos] = useState<minoType[]>(getShuffledQueue());

    const minQueueLength = 5;

    // useEffect(() => {
    //     while (queueMinos.length < minQueueLength) {
    //         setQueueMinos([...queueMinos, ...getShuffledQueue()])
    //     }
    // }, [queueMinos])

    // controls:
    const default_settings = {
        das: 10, 
        arr: 1, 
        sd: 1, 
        left: 'ArrowLeft',
        right: 'ArrowRight',
        ccw: 'KeyZ',
        c: 'ArrowUp',
        one_eighty: 'KeyA',
        hold: 'KeyC',
        soft_drop: 'ArrowDown',
        hard_drop: 'Space',
        reset: 'F4'
    }

    const handleControls = (e: React.KeyboardEvent<HTMLDivElement>) => {
        switch (e.code) {
            case default_settings.left:
                moveCurrMino(-1, 0);
                break;
            case default_settings.right:
                moveCurrMino(1, 0);
                break;
            case default_settings.ccw:
                rotateCurrMino(-1);
                break;
            case default_settings.c:
                rotateCurrMino(1);
                break;
            case default_settings.one_eighty:
                rotateCurrMino(2);
                break;
            case default_settings.hold:
                swapHoldMino();
                break;
        }
    }

    return (
        <div
            className="section"
            onKeyDown={handleControls}>

            <div id="traintris-game" tabIndex={1}>

                <Hold 
                    holdMino={holdMino}
                />

                <Board
                    blocks={blocks}
                    currMino={currMino}
                    setBlock={setBlock}
                />

                <Queue 
                    queueMinos={queueMinos}
                />

            </div>

            <div id='undo-redo'>

                <button className='small-button' title='Ctrl+Z'>UNDO</button>
                <button className='small-button' title='Ctrl+Y'>REDO</button>

            </div>

        </div>
    );
}

export default Game;
