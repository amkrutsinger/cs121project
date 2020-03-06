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


// Display our introductory text (w/ styling)
function Welcome() {
    return (
        <div className="description">
           <p className="big-text"> Welcome, </p>
           <p className="text"> We understand that planning routes for volunteers to canvas is a difficult and time-consuming task. As such, we have created this site to help with all your canvasing needs. Using state-of-the-art algorithms techniques, we can plan an efficient route for your volunteers to visit all canvassing locations in just a few short minutes. Happy campaigning! </p>
       </div>
    )
}


// Display instructions for step 1 of the process (uploading csv file)
function Step1() {
    return (
        <div className="description">
            <p className="big-text"> Step 1 </p>
            <p className ="text"> Where do you want to campaign? </p>
       </div>
    )
}

// Display instructions for step 2 of the process (verifying addresses)
function Step2() {
    return (
        <div className="description">
            <p className="big-text"> Step 2 </p>
            <p className ="text"> Here are the locations we got. Do you want to change anything? </p>
       </div>
    )
}



class App extends React.Component {

    // Overview:
    //    Welcome: introductory message, get started button
    //    Step 1: Upload CSV file
    //    Step 2: Add/Remove addresses
    //    Step 3: Set Parameters (e.g. number of campaigners)
    //    Result: display path, statistics

    // Initialize states (what parts are visible)
    state = {
        isWelcomeActive: true,
        isStep1Active: false,
        isStep2Active: false,
    }

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

    // Show only Welcome component
    showWelcome = () => {
        this.setState({
          isWelcomeActive: true,
          isStep1Active: false,
          isStep2Active: false
        })
    }

    // Show only Step 1 component
    showStep1 = () => {
        this.setState({
          isWelcomeActive: false,
          isStep1Active: true,
          isStep2Active: false
        })
    }

    // Show only Step 2 component
    showStep2 = () => {
        this.setState({
          isWelcomeActive: false,
          isStep1Active: false,
          isStep2Active: true
        })
    }



    render() {
        return (
            <div className="App">
                <PageHeader />
                <html>
                    <div className="page">
                        <div className="container">

                            {this.state.isWelcomeActive &&
                                <div className="welcome">
                                    <Welcome />
                                    <button className="button" onClick={this.showStep1}>Get Started!</button>
                                </div>
                            }

                            {this.state.isStep1Active &&
                                <div className="step1">
                                    <button className="button-alt" onClick={this.showWelcome}>Back</button>
                                    <Step1 />

                                    {/* Input File Button */}
                                    <input
                                        type="file"
                                        name="file"
                                        id="file"
                                        class="inputfile"
                                        ref={(input) => { this.filesInput = input }}
                                        onChange={e => { this.uploadFile(e); this.showStep2() }}
                                    />
                                    <label for="file">Choose a CSV file</label>
                                </div>
                            }

                            {this.state.isStep2Active &&
                                <div className="step2">
                                    <button className="button-alt" onClick={this.showStep1}>Back</button>
                                    <Step2 />

                                    {/* Display Map  */}
                                    {/* TODO: Show locations  */}
                                    {/* TODO: Add Functionality to Add/Remove Addresses */}
                                    <table className="App-header">
                                        <tr className="App-row">
                                            <th className="App-Sides">
                                                <Map style={mapStyles} google={this.props.google} zoom={4} initialCenter={{ lat: 47.444, lng: -122.176}}></Map>
                                            </th>
                                            <th className="App-Sides">
                                                <div className="text">Add Address</div>
                                                <div className="text">Remove Address</div>
                                            </th>
                                        </tr>
                                    </table>
                                </div>
                            }

                        </div>
                    </div>
                </html>
            </div>
        )
    }
}

export default GoogleApiWrapper({
    apiKey: 'AIzaSyCOhukeA-4msXp_y45e1ZekcXC-oPP2y9I'
  })(App);
