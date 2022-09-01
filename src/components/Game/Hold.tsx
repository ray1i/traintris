import { useRef, useEffect } from "react"

import blocksheet from '../../img/blocksheet.png'

import { minoType } from "../../types/types"
import { getNewMino, drawMino, getMinoWidth, getMinoHeight } from "../../scripts/util"

const blocksheetSprite = new Image();
blocksheetSprite.src = blocksheet;

const Hold = (props: {holdMino?: minoType | undefined, setHoldMino: React.Dispatch<React.SetStateAction<minoType | undefined>>}) => {

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
                    const tempMino = getNewMino(props.holdMino);

                    const offsetX = getMinoWidth(tempMino) % 2 === 0 ? 1 : 1.5;
                    const offsetY = getMinoHeight(tempMino) % 2 === 0 ? 1 : 1.5;

                    const drawingMino = getNewMino(props.holdMino, offsetX, offsetY);
                    drawMino(ctx, drawingMino);
                }
            }
        }
    }, [props.holdMino])

    const editHoldByPrompt = () => {
        let newHoldInput = prompt("Enter the hold piece", "T")?.toUpperCase();
        const newHold: minoType[] | undefined = newHoldInput?.split('')?.filter(char => "TIOSZLJ".includes(char)) as minoType[];

        props.setHoldMino(newHold?.[0] ?? null);
    }

    return (
        <div id="hold-container">
            <canvas
                id="hold"
                className="traintris-canvas"
                ref={canvasRef}
                width={128}
                height={128}
                onClick={editHoldByPrompt}
            />
        </div>
    )
}

export default Hold