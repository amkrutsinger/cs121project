import React from 'react';
import axios from 'axios';
import './App.css';

class App extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            onChangeFile: null,
            fileToBeSent: null
        };
        this.uploadFile = this.uploadFile.bind(this)
    }

    uploadFile(e) {
      console.log(this.state.fileToBeSent)
      console.log(this.state.onChangeFile)
      console.log(this.state.file)
      console.log(e.target.files[0])

      var config = { headers: {'Content-Type': undefined} };

      e.preventDefault();
      //let file = this.state.fileToBeSent;
      let file = e.target.files[0];
      const formData = new FormData();

      formData.append("file", file);

      axios
        .post("/findRoutes", formData)
        .then(res => console.log(res))
        .catch(err => console.warn(err));
    }

    render() {
        return (
            <div className="App">
              <header className="App-header">
                <div className="App-map">Map</div>
                <div className="App-rightSide">
                  <div>Choose a CSV:</div>
                    <input type="file" ref={(input) => { this.filesInput = input }} name="file" label="Upload CSV" onChange={this.uploadFile}/>
                </div>
              </header>
            </div>
        )
    }
}

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <div className="App-map">Map</div>
//         <div className="App-rightSide">
//           <div>Choose a CSV:</div>
//           <form action="/findRoutes" method="post">
//             <input type="file" name="file" onChange={this.onChangeFile}/>
//                 <button onClick={this.uploadFile}>
//                     Upload
//                 </button>
//              // <input type="file" id="placesCSV" name="placesCSV"></input>
//              // <input type="submit"/>
//           </form>
//         </div>
//       </header>
//       {/*
//       <div className="App">
//         <header className="App-header">
//           <img src={logo} className="App-logo" alt="logo" />
//           <p>
//             Edit <code>src/App.js</code> and save to reload.
//           </p>
//           <p>My routes = {window.routes}</p>
//           <p>My map = {window.map}</p>
//           <p>My errors = {window.errors}</p>
//           <a
//             className="App-link"
//             href="https://reactjs.org"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             Learn React
//           </a>
//         </header>
//       </div>
//
//       <div class="form">
//               <form action="/findRoutes" method="get">
//                   <input type="text" name="place" />
//                   <input type="submit" />
//               </form>
//       </div>
//     */}
//     </div>
//   );
// }


export default App;
