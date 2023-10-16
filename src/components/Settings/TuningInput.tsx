import React from "react";

import './TuningInput.css';

interface TuningInputProps {
    label: string,
    value: number,
    setTuning: (control: number) => void
}

const TuningInput = ({label, value, setTuning}: TuningInputProps) => {

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = parseInt(e.target.value);
        setTuning(newValue);
    }

    return (
        <>
            <p className='tuning-box'>{label}:</p>
            <input
                className='tuning-box'
                type='number'
                value={value}
                onChange={handleChange}
            />
        </>
    )
}

export default TuningInput;