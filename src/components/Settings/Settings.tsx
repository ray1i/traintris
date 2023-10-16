import React from "react"

import defaultSettings from "../../constants/defaultSettings";
import { SettingsObject } from "../../types/settingsTypes";
import ControlsButton from "./ControlsButton";
import TuningInput from "./TuningInput";

import './Settings.css'

interface SettingsProps {
    currentSettings: SettingsObject;
    setSettings: (settings: SettingsObject) => void;
    saveSettings: (settings: SettingsObject) => void;
}

const Settings = (props: SettingsProps) => {

    const getSetControlFunction = (control: Exclude<keyof SettingsObject, "das" | "arr" | "sd">) => {
        return (value: string | null) => {
            const newSettings = { ...props.currentSettings };
            newSettings[control] = value;
            props.setSettings(newSettings);
        }
    }
    
    const getSetTuningFunction = (control: "das" | "arr" | "sd") => {
        return (value: number) => {
            const newSettings = { ...props.currentSettings };
            newSettings[control] = value;
            props.setSettings(newSettings);
        }
    }

    return (
        <div id='settings' className="section">

            <h1 className="section-title">SETTINGS:</h1>

            <h2>TUNING:</h2>
            <div id='tuning-settings'>
                <TuningInput
                    label="DAS"
                    value={props.currentSettings.das}
                    setTuning={getSetTuningFunction("das")}
                />

                <TuningInput
                    label="ARR"
                    value={props.currentSettings.arr}
                    setTuning={getSetTuningFunction("arr")}
                />

                <TuningInput
                    label="SD"
                    value={props.currentSettings.sd}
                    setTuning={getSetTuningFunction("sd")}
                />
            </div>

            <h2>CONTROLS:</h2>
            <div id='controls-settings'>
                <ControlsButton
                    label='MOVE LEFT'
                    value={props.currentSettings.left}
                    setControl={getSetControlFunction('left')}
                />

                <ControlsButton
                    label='MOVE RIGHT'
                    value={props.currentSettings.right}
                    setControl={getSetControlFunction('right')}
                />

                <ControlsButton
                    label='ROTATE LEFT'
                    value={props.currentSettings.counterClockwise}
                    setControl={getSetControlFunction('counterClockwise')}
                />

                <ControlsButton
                    label='ROTATE RIGHT'
                    value={props.currentSettings.clockwise}
                    setControl={getSetControlFunction('clockwise')}
                />

                <ControlsButton
                    label='ROTATE 180'
                    value={props.currentSettings.oneEighty}
                    setControl={getSetControlFunction('oneEighty')}
                />

                <ControlsButton
                    label='HOLD PIECE'
                    value={props.currentSettings.hold}
                    setControl={getSetControlFunction('hold')}
                />

                <ControlsButton
                    label='SOFT DROP'
                    value={props.currentSettings.softDrop}
                    setControl={getSetControlFunction('softDrop')}
                />

                <ControlsButton
                    label='HARD DROP'
                    value={props.currentSettings.hardDrop}
                    setControl={getSetControlFunction('hardDrop')}
                />

                <ControlsButton
                    label='RESET BOARD'
                    value={props.currentSettings.reset}
                    setControl={getSetControlFunction('reset')}
                />
            </div>

            <div id='settings-buttons'>
                <button
                    className='button-large'
                    onClick={() => props.saveSettings(props.currentSettings)}
                >
                    SAVE
                </button>
                <button
                    className='button-large'
                    onClick={() => props.setSettings(defaultSettings)}
                >
                    DEFAULT
                </button>
            </div>
        </div>
    )
}

export default Settings;