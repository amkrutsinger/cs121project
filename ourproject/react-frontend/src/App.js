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
          <form action="/findRoutes" method="get">
            <input type="file" id="placesCSV" name="placesCSV"></input>
            <input type="submit" />
          </form>
        </div>
      </header>
      {/*
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <p>My routes = {window.routes}</p>
          <p>My map = {window.map}</p>
          <p>My errors = {window.errors}</p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
      </div>

      <div class="form">
              <form action="/findRoutes" method="get">
                  <input type="text" name="place" />
                  <input type="submit" />
              </form>
      </div>
    */}
    </div>
  );
}

export default App;
