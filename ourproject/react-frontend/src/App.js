import React from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <div className="App-map">Map</div>
        <div className="App-rightSide">
          <div>Choose a CSV:</div>
          <input type="file" id="avatar" name="avatar" accept=".csv">
          </input>
        </div>
      </header>
    </div>
  );
}

export default App;
