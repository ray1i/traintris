import React from "react";

import './ControlsButton.css';

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
            <p className="controls-button">{props.label}:</p>
            <button
                className={`controls-button button-small ${props.value === null ? 'editing' : ''}`}
                onClick={props.value === null ? undefined : handleClick}
                onKeyDown={props.value === null ? handleKeyDown : undefined}
            >
                {props.value === null ? '[PRESS NEW KEY]' : props.value.toUpperCase()}
            </button>
        </>
    )
}

export default ControlsButton;