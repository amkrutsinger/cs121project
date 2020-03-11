import React, {useEffect} from 'react';
import axios from 'axios';
import './App.css';
import Directions from "./components/Directions/DirectionsIndex";
import PageHeader from './pageHeader'


const locationsRoutes = [[[-117.7103941, 34.1069287], [-117.709978, 34.124954], [-117.709978, 34.124954], [-117.709978, 34.124954], [-117.709978, 34.124954], [-117.7326799, 34.1029753], [-117.732929, 34.103057], [-117.732929, 34.103057], [-117.7301553, 34.1021421], [-117.712313, 34.106128], [-117.7103941, 34.1069287]], [[-117.7103941, 34.1069287], [-117.706468, 34.107061], [-117.71376, 34.127773], [-117.71376, 34.127773], [-117.71376, 34.127773], [-117.71376, 34.127773], [-117.718033, 34.118387], [-117.7163543, 34.1183734], [-117.7153621, 34.1183494], [-117.718033, 34.118387], [-117.724298, 34.116698], [-117.7258054, 34.1166113], [-117.733133, 34.116757], [-117.733133, 34.116757], [-117.7111516, 34.1069425], [-117.7103941, 34.1069287]]];

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

export default class App extends React.Component {


    // Overview:
    //    Welcome: introductory message, get started button
    //    Step 1: Upload CSV file
    //    Step 2: Add/Remove addresses
    //    Step 3: Set Parameters (e.g. number of campaigners)
    //    Loading page (depending on time of algorithm)
    //    Result: display path, statistics

    // Potentially also add menu. Ideas for sections ...
    // "Home" - The initial homepage and essential interactions
    // "How it Works" - Explain algorithm, steps to use step, credit sources
    // "About Us" - Explain that we are HMC students working on a school project

    // Initialize states (what parts are visible)
    constructor(props) {
        super(props);
        this.state = 
        {
            isWelcomeActive: true,
            isStep1Active: false,
            isStep2Active: false,
            numPeople: 1,
            currentMap: 0,
        };
    }

    // Use: upload .csv file to flask/python for further analysis
    // Taken from Stack Overflow
    uploadFile(e) {
      e.preventDefault();
      let file = e.target.files[0];
      const formData = new FormData();

      formData.append("file", file);
      formData.append("numPeople", this.state.numPeople.toString())

      axios
        .post("/findRoutes", formData)
        .then(res => console.log(res))
        .catch(err => console.warn(err));
    }

    // This allows the input field for the number of canvassers to change 
    // and updates the state accordingly
    changeNumCanvassers(e) {
        e.preventDefault();
        this.setState({numPeople: e.target.value})
    }

    changeCurrentMap(e) {
        e.preventDefault();
        this.setState({currentMap: this.state.currentMap + 1})
    }

    // This updates the routing algorithm when number of canvasser changes is applied
    updateRoutes(e) {
        const numCanvassers = {"numPeople": this.state.numPeople};

        axios
          .post("/numCanvassersChanged", numCanvassers)
          .then(res => console.log(res))
          .catch(err => console.warn(err));
    }

    // Show only Welcome component, hide others
    showWelcome = () => {
        this.setState({
          isWelcomeActive: true,
          isStep1Active: false,
          isStep2Active: false
        })
    }

    // Show only Step 1 component, hide others
    showStep1 = () => {
        this.setState({
          isWelcomeActive: false,
          isStep1Active: true,
          isStep2Active: false
        })
    }

    // Show only Step 2 component, hide others
    showStep2 = () => {
        this.setState({
          isWelcomeActive: false,
          isStep1Active: false,
          isStep2Active: true
        })
    }



    render() {
        console.log("rendered")
        console.log(this.state.currentMap % locationsRoutes.length)
        return (
            <div className="App">
                <PageHeader />
                <html>
                    <div className="page">
                        {/* Everything in this div will be displayed in the white box */}
                        <div className="container">

                            {/* This is the initial message you see */}
                            {this.state.isWelcomeActive &&
                                <div className="welcome">
                                    <Welcome />
                                    <button className="button" onClick={this.showStep1}>Get Started!</button>
                                </div>
                            }

                            {/* This is what you see after clicking the "Get Started" button */}
                            {this.state.isStep1Active &&
                                <div className="step1">
                                    <button className="button-alt" onClick={this.showWelcome}>Back</button>
                                    <Step1 />
                                    <div className="Button-Container">
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
                                    <p className ="text"> How many canvassers do you have? </p>
                                    <div>
                                        <input type="number"
                                                        name="numCanvassers"
                                                        id="numCanvassers"
                                                        class="inputNum"
                                                        value={this.state.numPeople}
                                                        ref={(input) => { this.filesInput = input }}
                                                        onChange={e => {this.changeNumCanvassers(e)}}>
                                        </input>
                                    </div>
                                </div>
                            }

                            {/* This is what you see after selected a CSV file */}
                            {this.state.isStep2Active &&
                                <div className="step2">
                                    <button className="button-alt" onClick={this.showStep1}>Back</button>
                                    <Step2 />

                                    {/* Display Map  */}
                                    {/* TODO: Show locations  */}
                                    {/* TODO: Add Functionality to Add/Remove Addresses */}
                                    <table className="App-header">
                                        <tr className="App-row">
                                            <th className="App-Sides" id="mapBox">
                                                <Directions coordRoute={locationsRoutes[this.state.currentMap % locationsRoutes.length]}/>
                                                <button class="button" onClick={e => {this.changeCurrentMap(e)}}>Next Route</button>
                                            </th>
                                            <th className="App-Sides">
                                                {/* Add ability to adjust more paramaters of route */}
                                                <div className="text">Add Address</div>
                                                <div className="text">Remove Address</div>
                                                <div className="text">Number Of Canvassers:</div>
                                                <div class="description">
                                                    <input type="number"
                                                        name="numCanvassers"
                                                        id="numCanvassers"
                                                        class="inputNum"
                                                        value={this.state.numPeople}
                                                        ref={(input) => { this.filesInput = input }}
                                                        onChange={e => {this.changeNumCanvassers(e)}}>
                                                    </input>
                                                </div>
                                                <button class="button" onClick={e => {this.updateRoutes(e)}}>Apply Changes</button>
                                            </th>
                                        </tr>
                                    </table>
                                </div>
                            }

                            {/* Add section to display route */}
                            {/* When adding code, move as much as possible to outside functions to avoid clutter */}

                        </div>
                    </div>
                </html>
            </div>
        )
    }
}
