import React from 'react';
import axios from 'axios';
import './App.css';
import { Map, GoogleApiWrapper } from 'google-maps-react';
import PageHeader from './pageHeader'

const mapStyles = {
    position: 'relative',
    width: '50vw',
    height: '50vw',
};


// Display our Welcome - This includes
//  - introductory text
//  - button to get started (initiates steps)
function Welcome() {
    return (
        <div className="about">
           <p className ="welcome"> Welcome, </p>
           <p className ="text"> We understand that planning routes for volunteers to canvas is a difficult and time-consuming task. As such, we have created this site to help with all your canvasing needs. Using state-of-the-art algorithms techniques, we can plan an efficient route for your volunteers to visit all canvassing locations in just a few short minutes. Happy campaigning! </p>
           <button className="button">Get Started!</button>
       </div>
    )
}


// Display Step 1 of the process - This includes
//  - explanation of step 1
//  - button to upload csv
function Step1() {
    return (
        <div className="step1">
           <p className ="text"> Step 1: Upload a CSV file of the locations you want visited. </p>
           <div>Choose a CSV:</div>
           <input type="file"
               ref={(input) => { this.filesInput = input }}
               name="file"
               label="Upload CSV"
               onChange={this.uploadFile}
           />
       </div>
    )
}


class App extends React.Component {

    // Use: upload .csv file to flask/python for further analysis
    // Taken from Stack Overflow
    uploadFile(e) {
      e.preventDefault();
      let file = e.target.files[0];
      const formData = new FormData();

      formData.append("file", file);

      axios
        .post("/findRoutes", formData)
        .then(res => console.log(res))
        .catch(err => console.warn(err));
    }

    // TODO: make background image only go to end of screen
    render() {
        return (
            <div className="App">
                <PageHeader />
                <html>
                    <div className="page">
                        <div className="container">
                            <Welcome />
                        </div>
                    </div> 
                </html>
            </div>

              	//  <div className="App-about">
                //     Welcome.
                //     <br/>
                //     We understand that planning routes for volunteers to canvas is a difficult and time-consuming task. As such, we have created this site to help with all your canvasing needs. Using state-of-the-art algorithms techniques, we can plan an efficient route for your volunteers to visit all canvassing locations with just the click of a button.
                //     <br/>
                //     In order to get started, upload a csv file of the your canvassing locations. Our algorithm will do the rest. Once our algorithm has finished running, you can change the number of volunteers, view the generated routes, and get individual links to directions for each volunteer.
                //     <br/>
                //     Happy campaigning!
                // </div>
                //
                // <table className="App-header">
                //     <tr className="App-row">
                //         <th className="App-Sides">
                //             <Map style={mapStyles} google={this.props.google} zoom={4} initialCenter={{ lat: 47.444, lng: -122.176}}></Map>
                //         </th>
                //         <th className="App-Sides">
                //             <div>Choose a CSV:</div>
                //             <input type="file"
                //                 ref={(input) => { this.filesInput = input }}
                //                 name="file"
                //                 label="Upload CSV"
                //                 onChange={this.uploadFile}
                //             />
                //         </th>
                //     </tr>
                // </table>
                //
                // <div className="App-credits">This site uses OpenStreetRoute.</div>
        )
    }
}

export default GoogleApiWrapper({
    apiKey: 'AIzaSyCOhukeA-4msXp_y45e1ZekcXC-oPP2y9I'
  })(App);
