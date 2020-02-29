import React from 'react';
import axios from 'axios';
import './App.css';
import logo from './logo.png'

class App extends React.Component {

    // Use: upload .csv file to flask/python for further analysis
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
                <div className="App-logo">
                    <img src={logo} alt="GrassRoutes"/>
                </div>

                <div className="App-title">GrassRoutes</div>
                <div className="App-subtitle">Intelligent Mapping for Political Campaigns</div>

              	 <div className="App-about">
                    Welcome.
                    <br/>
                    We understand that planning routes for volunteers to canvas is a difficult and time-consuming task. As such, we have created this site to help with all your canvasing needs. Using state-of-the-art algorithms techniques, we can plan an efficient route for your volunteers to visit all canvassing locations with just the click of a button.
                    <br/>
                    In order to get started, upload a csv file of the your canvassing locations. Our algorithm will do the rest. Once our algorithm has finished running, you can change the number of volunteers, view the generated routes, and get individual links to directions for each volunteer.
                    <br/>
                    Happy campaigning!
                </div>

                <div className="App-header">
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
                </div>

                <div className="App-credits">This site uses OpenStreetRoute.</div>

            </div>
        )
    }
}

export default App;
