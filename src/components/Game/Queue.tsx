import { useRef, useEffect, useState } from "react"

import { minoIndexes, blocksize } from "../../data/minodata"

import board from '../../img/board.png'
import blocksheet from '../../img/blocksheet.png'

import { minoType, Mino } from "./types"
import { getNewMino, drawMino } from "./util"

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
                props.queueMinos.forEach((type, i) => {
                    const tempMino = getNewMino(type, 1.5, 2.5 * i);
                    drawMino(ctx, tempMino);
                })
            }
        }
    }, [props.queueMinos])

    return (
        <canvas
            ref={canvasRef}
            width={128}
            height={640}
        />
    )
}

export default Queue