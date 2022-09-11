import React from "react";

interface ControlsButtonProps {
    label: string,
    value: string | null,
    setControl: (control: string | null) => void
}

const ControlsButton = (props: ControlsButtonProps) => {

    const handleClick = () => {
        props.setControl(null);
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
        e.preventDefault();
        props.setControl(e.code);
    }

    return (
        <>
            <p>{props.label}:</p>
            <button
                className="controls-button"
                onClick={props.value === null ? undefined : handleClick}
                onKeyDown={props.value === null ? handleKeyDown : undefined}
            >
                {props.value === null ? '[PRESS NEW KEY]' : props.value.toUpperCase()}
            </button>
        </>
    )
}

export default ControlsButton;