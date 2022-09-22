import React, { useEffect, useState, useRef } from 'react';

import Settings from '../Settings/Settings';
import { SettingsObject } from '../../types/settingsTypes';
import defaultSettings from '../../constants/defaultSettings';

import defaultPressedKeys from '../../constants/pressedKeys';
import { PressedKeysObject } from '../../types/pressedKeysType';

import Board from './Board';
import Hold from './Hold';
import Queue from './Queue';

import PCFinder from '../PCFinder/PCFinder';

import { srsOffsets } from '../../constants/minodata';
import { minoType, Mino, Blocks, blockType, GameState } from '../../types/types';
import { collide, getNewMino, getMovedMino, getRotatedMino, getShuffledQueue, lowest } from '../../scripts/util';
import './Game.css';

const width = 10;
const height = 40;

const spawnX = 4;
const spawnY = 19;

function Game() {

    // board and board functions:
    const [blocks, setBlocks] = useState<Blocks>(Array.from({ length: height }, () => Array(width).fill('')));

    const setBlock = (x: number, y: number, type: blockType) => {
        if (x < width && y < height) {
            let tempBlocks = JSON.parse(JSON.stringify(blocks)) as Blocks;
            tempBlocks[y][x] = type;

            setBlocks(tempBlocks);
        }
    }

    const setMultipleBlocks = (blocklist: [number, number][], type: blockType) => {
        let tempBlocks = JSON.parse(JSON.stringify(blocks)) as Blocks;
        
        for (let block of blocklist) {
            if (block[0] < width && block[1] < height) {
                tempBlocks[block[1]][block[0]] = type;
            }
        }

        // check to clear lines:
        for (let i = 0; i < tempBlocks.length; i++){
            if (!tempBlocks[i].includes('')) {
                tempBlocks.splice(i, 1);
                tempBlocks.push(Array(width).fill(''));
                i--;
            }
        }

        setBlocks(tempBlocks);
    }

    // Mino and Mino functions:
    const [currMino, setCurrMino] = useState<Mino>();
    
    const moveCurrMino = (x: number, y: number) => {
        if (currMino) {
            const movedMino = getMovedMino(currMino, x, y);
        
            if (!collide(blocks, movedMino)) {
                setCurrMino(movedMino);
            }
        }
    }

    const moveCurrMinoToMax = (x: -1 | 0 | 1, y: -1 | 0) => {
        if (currMino) {
            let tempX = x;
            let tempY = y;
            let tempMino = getMovedMino(currMino, tempX, tempY);
        
            while (!collide(blocks, tempMino)){
                tempX += x;
                tempY += y;
                tempMino = getMovedMino(currMino, tempX, tempY);
            }
        
            setCurrMino(getMovedMino(currMino, tempX - x, tempY - y));
        }
    }

    const rotateCurrMino = (n: number) => {
        if (currMino) {
            const currOffset = srsOffsets[currMino.type];
            const rotatedMino = getRotatedMino(currMino, n);

            for (let i = 0; i < currOffset[currMino.perm].length; i++){
                const offset = [
                    currOffset[currMino.perm][i][0] - currOffset[rotatedMino.perm][i][0],
                    currOffset[currMino.perm][i][1] - currOffset[rotatedMino.perm][i][1]
                ]
                const offsetMino = getMovedMino(rotatedMino, offset[0], offset[1])

                if (!collide(blocks, offsetMino)) {
                    setCurrMino(offsetMino);
                    return;
                }
            }
        }
    }

    const placeCurrMino = () => {
        if (currMino) {
            addToPastStates(getCurrentState());
            clearFutureStates();

            const lowestCurrMino = (lowest(blocks, currMino));
            setMultipleBlocks(lowestCurrMino.blocks, lowestCurrMino.type);
            setCurrMino(getNewMino(popFromQueue(), spawnX, spawnY));
        }
    }

    // Hold Mino:
    const [holdMino, setHoldMino] = useState<minoType>();

    const swapHoldMino = () => {
        if (!holdMino) {
            setHoldMino(currMino?.type);
            setCurrMino(getNewMino(popFromQueue(), spawnX, spawnY));
        } else {
            const tempType = currMino?.type as minoType;
            setCurrMino(getNewMino(holdMino, spawnX, spawnY));
            setHoldMino(tempType);
        }
    }

    // Queue Minos:
    const [queueMinos, setQueueMinos] = useState<minoType[]>(getShuffledQueue());

    const minQueueLength = 5;

    const popFromQueue = (): minoType => {
        let newQueue = [...queueMinos];
        const removedMino = newQueue.splice(0, 1)[0];

        // refill queue if it is empty
        while (newQueue.length < minQueueLength) {
            newQueue = [...newQueue, ...getShuffledQueue()];
        }

        setQueueMinos(newQueue);
        return removedMino;
    }

    // Undo/Redo:
    const getCurrentState = (): GameState => {
        return {
            blocks: JSON.parse(JSON.stringify(blocks)),
            currMino: currMino?.type,
            holdMino: holdMino,
            queueMinos: JSON.parse(JSON.stringify(queueMinos))
        }
    }

    const setCurrentState = (state: GameState | null) => {
        if (state) {
            setBlocks(JSON.parse(JSON.stringify(state.blocks)));
            setCurrMino(state.currMino ? getNewMino(state.currMino, spawnX, spawnY) : undefined);
            setHoldMino(state.holdMino);
            setQueueMinos(state.queueMinos);
        }
    }

    // --
    const [pastStates, setPastStates] = useState<GameState[]>([]); // retrieved when you undo

    const popFromPastStates = (): GameState | null => {
        if (pastStates.length > 0) {
            const poppedState = JSON.parse(JSON.stringify(pastStates[pastStates.length - 1]));
            setPastStates(pastStates.slice(0, pastStates.length - 1));
            return poppedState;
        } else {
            return null;
        }
    }

    const addToPastStates = (state: GameState) => {
        setPastStates([...pastStates, state]);
    }

    // -- 
    const [futureStates, setFutureStates] = useState<GameState[]>([]); // retrieved when you redo

    const popFromFutureStates = (): GameState | null => {
        if (futureStates.length > 0) {
            const poppedState = JSON.parse(JSON.stringify(futureStates[0]));
            setFutureStates(futureStates.slice(1));
            return poppedState;
        } else {
            return null;
        }
    }

    const addToFutureStates = (state: GameState) => {
        setFutureStates([state, ...futureStates]);
    }

    const clearFutureStates = () => {
        setFutureStates([]);
    }
    
    // --
    const undo = () => {
        if (pastStates.length > 0) {
            addToFutureStates(getCurrentState());
            setCurrentState(popFromPastStates());
        }
    }
    
    const redo = () => {
        if (futureStates.length > 0) {
            addToPastStates(getCurrentState());
            setCurrentState(popFromFutureStates());
        }
    }

    // controls:
    const [settings, setSettings] = useState<SettingsObject>(defaultSettings);

    const saveSettings = (newSettings: SettingsObject) => {
        setSettings(newSettings);
        localStorage.setItem('settings', JSON.stringify(newSettings));
    }

    const [pressedKeys, setPressedKeys] = useState<PressedKeysObject>(defaultPressedKeys);
    const [dasStartLeft, setDasStartLeft] = useState<number | null>(null);
    const [dasStartRight, setDasStartRight] = useState<number | null>(null);
    const [arrStartLeft, setArrStartLeft] = useState<number | null>(null);
    const [arrStartRight, setArrStartRight] = useState<number | null>(null);
    const [sdStart, setSdStart] = useState<number | null>(null);

    const [recentDirection, setRecentDirection] = useState<'left' | 'right' | null>(null); // so that if both

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.ctrlKey) {
            if (e.code === 'KeyZ') {
                undo();
                return;
            }

            if (e.code === 'KeyY') {
                redo();
                return;
            }
        }

        if (!e.repeat) {
            switch (e.code) {
                case settings.left:
                    setPressedKeys({...pressedKeys, left: true});
                    setRecentDirection('left');
                    break;
                case settings.right:
                    setPressedKeys({...pressedKeys, right: true});
                    setRecentDirection('right');
                    break;
                case settings.counterClockwise:
                    setPressedKeys({...pressedKeys, counterClockwise: true});
                    break;
                case settings.clockwise:
                    setPressedKeys({...pressedKeys, clockwise: true});
                    break;
                case settings.oneEighty:
                    setPressedKeys({...pressedKeys, oneEighty: true});
                    break;
                case settings.hold:
                    setPressedKeys({...pressedKeys, hold: true});
                    break;
                case settings.softDrop:
                    setPressedKeys({...pressedKeys, softDrop: true});
                    break;
                case settings.hardDrop:
                    setPressedKeys({...pressedKeys, hardDrop: true});
                    break;
            }
        }
    }

    
    const handleKeyUp = (e: React.KeyboardEvent<HTMLDivElement>) => {
        switch (e.code) {
            case settings.left:
                setPressedKeys({...pressedKeys, left: false});
                if (pressedKeys.right) setRecentDirection('right');
                setDasStartLeft(null);
                setArrStartLeft(null);
                break;
            case settings.right:
                setPressedKeys({...pressedKeys, right: false});
                if (pressedKeys.left) setRecentDirection('left');
                setDasStartRight(null);
                setArrStartRight(null);
                break;
            case settings.counterClockwise:
                setPressedKeys({...pressedKeys, counterClockwise: false});
                break;
            case settings.clockwise:
                setPressedKeys({...pressedKeys, clockwise: false});
                break;
            case settings.oneEighty:
                setPressedKeys({...pressedKeys, oneEighty: false});
                break;
            case settings.hold:
                setPressedKeys({...pressedKeys, hold: false});
                break;
            case settings.softDrop:
                setPressedKeys({...pressedKeys, softDrop: false});
                setSdStart(null);
                break;
            case settings.hardDrop:
                setPressedKeys({...pressedKeys, hardDrop: false});
                break;
        }
    }

    const handleControls = (currTime: number) => {
        const newPressedKeys = JSON.parse(JSON.stringify(pressedKeys)) as PressedKeysObject;

        if (pressedKeys.left) {
            if (recentDirection === 'left') {
                if (dasStartLeft === null || arrStartLeft === null) {
                    setDasStartLeft(currTime);
                    setArrStartLeft(currTime + settings.das);
                    moveCurrMino(-1, 0);
                } 
                else if (dasStartLeft + settings.das < currTime && currTime >= arrStartLeft + settings.arr) {
                    if (settings.arr > 0) {
                        setArrStartLeft(arrStartLeft + settings.arr);
                        moveCurrMino(-1, 0);
                    } else if (settings.arr === 0) {
                        moveCurrMinoToMax(-1, 0);
                    }
                }
            }
        }
        
        if (pressedKeys.right) {
            if (recentDirection === 'right') {
                if (dasStartRight === null || arrStartRight === null) {
                    setDasStartRight(currTime);
                    setArrStartRight(currTime + settings.das);
                    moveCurrMino(1, 0);
                } 
                else if (dasStartRight + settings.das < currTime && currTime >= arrStartRight + settings.arr) {
                    if (settings.arr > 0) {
                        setArrStartRight(arrStartRight + settings.arr);
                        moveCurrMino(1, 0);
                    } else if (settings.arr === 0) {
                        moveCurrMinoToMax(1, 0);
                    }
                }
            }
        }
        
        if (pressedKeys.counterClockwise) {
            rotateCurrMino(-1);
            newPressedKeys.counterClockwise = false;
        }

        if (pressedKeys.clockwise) {
            rotateCurrMino(1);
            newPressedKeys.clockwise = false;
        }

        if (pressedKeys.oneEighty) {
            rotateCurrMino(2);
            newPressedKeys.oneEighty = false;
        }

        if (pressedKeys.hold) {
            swapHoldMino();
            newPressedKeys.hold = false;

        }

        if (pressedKeys.softDrop) {
            if (sdStart === null) {
                setSdStart(currTime);
                moveCurrMino(0, -1);
            } 
            else if (sdStart + settings.sd < currTime) {
                if (settings.sd > 0) {
                    setSdStart(sdStart + settings.sd);
                    moveCurrMino(0, -1);
                } else if (settings.sd === 0) {
                    moveCurrMinoToMax(0, -1);
                }
            }
        }

        if (pressedKeys.hardDrop) {
            placeCurrMino();
            newPressedKeys.hardDrop = false;
        }

        if (pressedKeys.reset) {
            // TODO
            newPressedKeys.reset = false;
        }

        setPressedKeys(newPressedKeys);
    }

    // -- Set up the game:
    const gameRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const newMino = getNewMino(popFromQueue(), spawnX, spawnY);
        setCurrMino(newMino);

        if (gameRef.current) gameRef.current.focus();
    }, [])

    useEffect(() => {
        const interval = setInterval(() => {
            handleControls(performance.now());
        }, 1000 / 60)

        return () => clearInterval(interval);
    }, [pressedKeys])

    return (
        <>
            <Settings 
                currentSettings={settings}
                setSettings={setSettings}
                saveSettings={saveSettings}
            />

            <div
                className="section"
                onKeyDown={handleKeyDown}
                onKeyUp={handleKeyUp}
                >

                <div ref={gameRef} id="traintris-game" tabIndex={1}>

                    <Hold
                        holdMino={holdMino}
                        setHoldMino={setHoldMino}
                    />

                    <Board
                        blocks={blocks}
                        currMino={currMino}
                        setBlock={setBlock}
                    />

                    <Queue
                        queueMinos={queueMinos}
                        setQueueMinos={setQueueMinos}
                    />

                </div>

                <div id='undo-redo'>

                    <button 
                        className='small-button'
                        title='Ctrl+Z'
                        onClick={e => {
                            e.currentTarget.blur();
                            undo();
                        }}
                    >
                        UNDO
                    </button>
                    <button
                        className='small-button'
                        title='Ctrl+Y'
                        onClick={e => {
                            e.currentTarget.blur();
                            redo();
                        }}
                    >
                        REDO
                    </button>

                </div>
            </div>

            <PCFinder 
                blocks={blocks}
                currMino={currMino?.type}
                holdMino={holdMino}
                queueMinos={queueMinos}
            />
        </>
    );
}

export default Game;
