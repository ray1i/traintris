import { useRef, useEffect } from "react"

import { minoIndexes } from "../data/minodata"

import board from '../img/board.png'
import blocksheet from '../img/blocksheet.png'

const blocksheetSprite = new Image();
blocksheetSprite.src = blocksheet;
const boardSprite = new Image();
boardSprite.src = board;

const blocksize = 32

interface BoardProps {
    blocks: string[][],
    handleMouseEvent?: (e: React.MouseEvent) => void,
}

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
                        ctx.drawImage(blocksheetSprite, blocksize * minoIndexes[props.blocks[i][j] as keyof typeof minoIndexes], 0, blocksize, blocksize, j*blocksize, (19 - i)*blocksize, blocksize, blocksize);
                    }
                }
            }
        }
    }, [props.blocks])

    return (
        <canvas
            ref={canvasRef}
            width={320}
            height={640}
            onMouseDown={(e) => props.handleMouseEvent?.(e)}
            onMouseUp={(e) => props.handleMouseEvent?.(e)}
            onMouseMove={(e) => props.handleMouseEvent?.(e)}
            onMouseLeave={(e) => props.handleMouseEvent?.(e)}
        />
    )
}

export default Board