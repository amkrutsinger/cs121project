import React from 'react';
import axios from 'axios';
import './App.css';

class App extends React.Component {
    // Taken from Stack Overflow
    uploadFile(e) {
      var config = { headers: {'Content-Type': undefined} };

      e.preventDefault();
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
                    <input type="file"
                           ref={(input) => { this.filesInput = input }}
                           name="file"
                           label="Upload CSV" 
                           onChange={this.uploadFile}
                    />
                </div>
              </header>
            </div>
        )
    }
}

export default App;
