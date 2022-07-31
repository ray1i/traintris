import { useRef, useEffect, useState } from "react"

import { minoIndexes } from "../../data/minodata"

import board from '../../img/board.png'
import blocksheet from '../../img/blocksheet.png'

import { Mino, BoardProps } from "./types"
import { lowest, drawMino } from "./util"

const blocksheetSprite = new Image();
blocksheetSprite.src = blocksheet;
const boardSprite = new Image();
boardSprite.src = board;

const blocksize = 32

const Board = (props: BoardProps) => {

    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (canvasRef.current !== null) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            
            if (ctx !== null) {
                // clear the canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(boardSprite, 0, 0);

                // draw board blocks
                for (let i = 0; i < props.blocks.length; i++){
                    for (let j = 0; j < props.blocks[i].length; j++){
                        ctx.drawImage(
                            blocksheetSprite,
                            blocksize * minoIndexes[props.blocks[i][j] as keyof typeof minoIndexes],
                            0,
                            blocksize,
                            blocksize,
                            j * blocksize,
                            (19 - i) * blocksize,
                            blocksize,
                            blocksize);
                    }
                }

                // draw ghost piece and current Mino
                if (props.currMino) {
                    
                    // first draw the ghost piece
                    
                    ctx.globalAlpha = 0.5;
                    const ghostMino = lowest(props.blocks, props.currMino);
                    drawMino(ctx, ghostMino);

                    // draw board blocks
                    ctx.globalAlpha = 1;
                    drawMino(ctx, props.currMino);
                }
            }
        }
    }, [props.blocks, props.currMino])

    // drawing on board:

    const [drawing, setDrawing] = useState(0); // 0 for none, 1 for drawing, 2 for erasing

    const handleMouseEvent = (e: React.MouseEvent) => {
        let rect = e.currentTarget.getBoundingClientRect();
        let clientX = e.clientX - rect.left;
        let clientY = e.clientY - rect.top;

        let boardX = Math.floor(clientX / blocksize);
        let boardY = 19 - Math.floor(clientY / blocksize);

        switch (e.type) {
            case 'mousedown':
                const isDrawing = props.blocks[boardY][boardX] ? 2 : 1;

                setDrawing(isDrawing);
                props.setBlock?.(boardX, boardY, isDrawing === 1 ? 'G' : '');
                break;
            case 'mousemove':
                if (drawing) { // i.e. not 0
                    props.setBlock?.(boardX, boardY, drawing === 1 ? 'G' : '');
                }
                break;
            case 'mouseup':
            case 'mouseleave':
                setDrawing(0);
                break;
        }
    }

    return (
        <canvas
            ref={canvasRef}
            width={320}
            height={640}
            onMouseDown={handleMouseEvent}
            onMouseUp={handleMouseEvent}
            onMouseMove={handleMouseEvent}
            onMouseLeave={handleMouseEvent}
        />
    )
}

export default Board