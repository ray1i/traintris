import React from "react";

interface TuningInputProps {
    label: string,
    value: number,
    setTuning: (control: number) => void
}

const TuningInput = (props: TuningInputProps) => {

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = parseInt(e.target.value);
        props.setTuning(newValue);
    }

    return (
        <>
            <p>{props.label}:</p>
            <input
                className='tuning-box'
                type='number'
                value={props.value}
                onChange={handleChange}
            />
        </>
    )
}

export default TuningInput;