import { useRef, useEffect, useState } from "react"

import blocksheet from '../../img/blocksheet.png'

import { minoType, Mino } from "./types"
import { getNewMino, drawMino, getMinoWidth, getMinoHeight } from "./util"

const blocksheetSprite = new Image();
blocksheetSprite.src = blocksheet;

const Queue = (props: {queueMinos: minoType[]}) => {

    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (canvasRef.current !== null) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            
            if (ctx !== null) {
                // clear the canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // draw queueMinos
                for (let i = 0; i < 5; i++){
                    const tempMino = getNewMino(props.queueMinos[i]);

                    const offsetX = getMinoWidth(tempMino) % 2 === 0 ? 1 : 1.5;
                    const offsetY = getMinoHeight(tempMino) % 2 === 0 ? 1 : 1.5;

                    const drawingMino = getNewMino(props.queueMinos[i], offsetX, 19 - (4 * i) - offsetY);
                    drawMino(ctx, drawingMino);
                }
            }
        }
    }, [props.queueMinos])

    return (
        <div id="queue-container">
            <canvas
                id="queue"
                className="traintris-canvas"
                ref={canvasRef}
                width={128}
                height={640}
            />
        </div>   
    )
}

export default Queue