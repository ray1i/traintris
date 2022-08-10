import React, { useEffect, useState } from 'react';

import Board from '../Game/Board';

import { Blocks } from '../../types/types';

import { PCFinderProps } from '../../types/types';

// eslint-disable-next-line import/no-webpack-loader-syntax
import Worker from "worker-loader!../../scripts/pc-finder.worker.ts";

const PCFinder = (props: PCFinderProps) => {

    const startPCWorker = () => {
        if (props.queueMinos) {
            const pcWorker: Worker = new Worker();

            const state = {
                b: props.blocks,
                hold: props.holdMino,
                queue: [props.currMino, ...props.queueMinos]
            }

            pcWorker.postMessage(state)

            pcWorker.onmessage = (e: MessageEvent) => {
                console.log('done', e);
            }
            pcWorker.onerror = (e: ErrorEvent) => {
                console.log('error', e);
            }
        }
    }

    return (
        <div id="pc-finder" className="section">
            <h1 className="section-title" hidden>PC FINDER</h1>

            <button
                id="pc-start-button"
                className="button"
                onClick={startPCWorker}
            >
                FIND PC
            </button>

            <Board
                blocks={props.blocks}
            />

            <div id="pc-buttons">
                <button className="button">PREV</button>
                <button className="button">NEXT</button>
            </div>

            <p id='pc-result'></p>
            <p id='pc-progress' hidden></p>
        </div>
    )
}

export default PCFinder;