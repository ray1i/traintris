import { useRef, useEffect } from "react"

import blocksheet from '../../img/blocksheet.png'

import { minoType } from "../../types/types"
import { getNewMino, drawMino, getMinoWidth, getMinoHeight } from "../../scripts/util"

const blocksheetSprite = new Image();
blocksheetSprite.src = blocksheet;

const Queue = (props: {queueMinos: minoType[], setQueueMinos: React.Dispatch<React.SetStateAction<minoType[]>>}) => {

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

    const editQueueByPrompt = () => {
        let newQueueInput = prompt("Enter the new queue", "TIOSLT")?.toUpperCase();
        const tempQueue: minoType[] | undefined = newQueueInput?.split('')?.filter(char => "TIOSZLJ".includes(char)) as minoType[];

        if (!tempQueue || tempQueue.length <= 0) {
            alert("Put at least 1 valid piece")
            return;
        } else {
            // // add current state to undo history
            // let temp_state = get_current_state()
            // temp_state.queue = [...queue.blocks]
            // undo_history.push(temp_state)

            // if (undo_history > history_size) undo_history.shift()

            let newQueue: minoType[];
            if (tempQueue.length > props.queueMinos.length) {
                newQueue = tempQueue;
            } else {
                newQueue = props.queueMinos.map((mino, index) => tempQueue[index] ?? mino)
            }

            props.setQueueMinos(newQueue);
        }
    }

    return (
        <div id="queue-container">
            <canvas
                id="queue"
                className="traintris-canvas"
                ref={canvasRef}
                width={128}
                height={640}
                onClick={editQueueByPrompt}
            />
        </div>   
    )
}

export default Queue