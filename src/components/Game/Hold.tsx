import { useRef, useEffect, useState } from "react"

import { minoIndexes, blocksize } from "../../data/minodata"

import board from '../../img/board.png'
import blocksheet from '../../img/blocksheet.png'

import { minoType, Mino } from "./types"
import { getNewMino, drawMino } from "./util"

const blocksheetSprite = new Image();
blocksheetSprite.src = blocksheet;

const Hold = (props: {holdMino?: minoType | undefined}) => {

    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (canvasRef.current !== null) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            
            if (ctx !== null) {
                // clear the canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // draw holdMino
                if (props.holdMino) {
                    
                    const holdMino = getNewMino(props.holdMino, 1.5, 1.5);
                    drawMino(ctx, holdMino);
                }
            }
        }
    }, [props.holdMino])

    return (
        <canvas
            ref={canvasRef}
            width={128}
            height={128}
        />
    )
}

export default Hold