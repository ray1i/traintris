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

import './Game.css';
import { useGameState } from '../../hooks/useGameState';

function Game() {

    const {
        blocks,
        setBlock,
        currMino,
        holdMino,
        setHoldMino,
        queueMinos,
        setQueueMinos,
        moveCurrMino,
        moveCurrMinoToMax,
        rotateCurrMino,
        swapHoldMino,
        placeCurrMino,
        undo,
        redo,
    } = useGameState();

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

                    {/* <h2>HOLD</h2> */}
                    <Hold
                        holdMino={holdMino}
                        setHoldMino={setHoldMino}
                    />

                    <Board
                        blocks={blocks}
                        currMino={currMino}
                        setBlock={setBlock}
                    />

                    {/* <h2>NEXT</h2> */}
                    <Queue
                        queueMinos={queueMinos}
                        setQueueMinos={setQueueMinos}
                    />

                </div>

                <div id='undo-redo'>

                    <button 
                        className='button-small'
                        title='Ctrl+Z'
                        onClick={e => {
                            e.currentTarget.blur();
                            undo();
                        }}
                    >
                        UNDO
                    </button>
                    <button
                        className='button-small'
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
