import React, { useState } from 'react';

import './App.css';

import Game from './components/Game/Game';

function App() {
    return (
        <div className='main-content'>
            <div id='settings' className="section">

                <h1 className="section-title">SETTINGS:</h1>

                <table id='tuning-settings'>
                    <th><h2>TUNING:</h2></th>
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
                </table>

                <div id='settings-buttons'>
                    <button className='button'>SAVE</button>
                    <button className='button'>DEFAULT</button>
                </div>

                <h2>CONTROLS:</h2>
                <div id='controls-settings'>
                    <p>MOVE LEFT:</p>
                    <button className="controls-button">---</button>

                    <p>MOVE RIGHT:</p>
                    <button className="controls-button">---</button>

                    <p>ROTATE LEFT:</p>
                    <button className="controls-button">---</button>

                    <p>ROTATE RIGHT:</p>
                    <button className="controls-button">---</button>

                    <p>ROTATE 180:</p>
                    <button className="controls-button">---</button>

                    <p>HOLD PIECE:</p>
                    <button className="controls-button">---</button>

                    <p>SOFT DROP:</p>
                    <button className="controls-button">---</button>

                    <p>HARD DROP:</p>
                    <button className="controls-button">---</button>

                    <p>RESET BOARD:</p>
                    <button className="controls-button">---</button>
                </div>

            </div>

            <Game />
        </div>
    );
}

export default App;
