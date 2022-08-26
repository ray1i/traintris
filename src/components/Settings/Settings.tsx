import React from "react"

import defaultSettings from "../../constants/defaultSettings";
import { SettingsObject } from "../../types/settingsTypes";
import ControlsButton from "./ControlsButton";

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

    return (
        <>
            <div id='settings' className="section">

                <h1 className="section-title">SETTINGS:</h1>

                <table id='tuning-settings'>
                    <thead>
                        <tr>
                            <td><h2>TUNING:</h2></td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><p>DAS:</p></td>
                            <td><input className='tuning-box' type='text' /></td>
                        </tr>
                        <tr>
                            <td><p>ARR:</p></td>
                            <td><input className='tuning-box' type='text' /></td>
                        </tr>
                        <tr>
                            <td><p>SD:</p></td>
                            <td><input className='tuning-box' type='text' /></td>
                        </tr>
                    </tbody>
                </table>

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
                        className='button'
                        onClick={e => props.saveSettings(props.currentSettings)}
                    >
                        SAVE
                    </button>
                    <button
                        className='button'
                        onClick={e => props.setSettings(defaultSettings)}
                    >
                        DEFAULT
                    </button>
                </div>
            </div>
        </>
    )
}

export default Settings;