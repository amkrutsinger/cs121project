import React, {useState, useEffect} from 'react';
import axios from 'axios';
import './App.css';
import Directions from "./components/Directions/DirectionsIndex";
import PageHeader from './pageHeader'
import { withState } from 'recompose';
import { CSVLink, CSVDownload } from "react-csv";

// This is the width at which the screen with the map switches between side by side and vertical organization.
const critWidth = 1000;
const locationsRoutes = [[[-117.7103941, 34.1069287], [-117.709978, 34.124954], [-117.709978, 34.124954], [-117.709978, 34.124954], [-117.709978, 34.124954], [-117.7326799, 34.1029753], [-117.732929, 34.103057], [-117.732929, 34.103057], [-117.7301553, 34.1021421], [-117.712313, 34.106128], [-117.7103941, 34.1069287]], [[-117.7103941, 34.1069287], [-117.706468, 34.107061], [-117.71376, 34.127773], [-117.71376, 34.127773], [-117.71376, 34.127773], [-117.71376, 34.127773], [-117.718033, 34.118387], [-117.7163543, 34.1183734], [-117.7153621, 34.1183494], [-117.718033, 34.118387], [-117.724298, 34.116698], [-117.7258054, 34.1166113], [-117.733133, 34.116757], [-117.733133, 34.116757], [-117.7111516, 34.1069425], [-117.7103941, 34.1069287]]];


/** TITLE AND BODY TEXT FOR PAGES **/

// Text for Home Page
const homeTitle = 'Welcome,'
const homeBody = 'We understand that planning routes for volunteers to canvas is a difficult and time-consuming task. As such, we have created this site to help with all your canvasing needs. Using state-of-the-art algorithms techniques, we can plan an efficient route for your volunteers to visit all canvassing locations in just a few short minutes. Happy campaigning!'
const homeButton = 'Get Started!'

// Text for Upload CSV Page
const uploadCSVTitle = 'Step 1'
const uploadCSVBody = 'Where do you want to campaign? \n Note: our algorithm assumes that all campaigners start at the first location listed'

// Text for Map Page
const mapPageTitle = 'Step 2'
const mapPageBody = 'Here are the locations we got. Do you want to change anything?'

// Text for About Page
const aboutTitle = 'About'
const aboutBody = 'about stuff?'

// Text for How It Works Page
const howTitle = 'How It Works'
const howBody = 'more stuf'


/** FUNCTIONS TO DISPLAY TITLE AND BODY ON PAGES **/

// A basic template to display text for pages on site
function Template(title, body) {
    return (
        <div className="description">
            <p className="big-text"> { title } </p>
            <p className="text"> { body } </p>
        </div>
    )
}

// The Home Page
function Home() {
    return Template(homeTitle, homeBody)
}

// Step 1 - Uploding the CSV file
function Step1() {
    return Template(uploadCSVTitle, uploadCSVBody)
}

// Step 2 - Verifying the Route
function Step2() {
    return Template(mapPageTitle, mapPageBody)
}

// The Home Page
function About() {
    return Template(aboutTitle, aboutBody)
}

// The Home Page
function How() {
    return Template(howTitle, howBody)
}

// A Loading Screen
function LoadingScreen() {
    return (
        <div className="description">
            <p className="big-text">LOADING...</p>
        </div>
    )
}



/** THE MAIN SITE DRIVER **/

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
            // Used to keep track of current page displayed
            page: "home",

            numPeople: 1,
            currentMap: 0,
            // temporary list to overwrite
            locationsRoutes: "unset",
            urls: "unset",
            //TO DO: ADD LOADING Feature
            // isLoading: true,
            // error: null,
            wide: window.innerWidth > critWidth,
        };
    }


    // Use: upload .csv file to flask/python for further analysis
    // Taken from Stack Overflow
    uploadFile(e) {
      e.preventDefault();
      let file = e.target.files[0];
      const formData = new FormData();

      formData.append("file", file);
      formData.append("numPeople", this.state.numPeople.toString());

      var self = this;
      axios
        .post("/findRoutes", formData)
        .then(res => {
            const locations = res.data.actual;
            const urls = res.data.urls;
            // update state and getting location routes from backend
            self.setState({locationsRoutes: locations});
            self.setState({urls: urls});
            //self.showStep2();
        })
        .catch(err => console.warn(err));
    }

    // This allows the input field for the number of canvassers to change
    // and updates the state accordingly
    changeNumCanvassers(e) {
        e.preventDefault();
        this.setState({numPeople: e.target.value})
    }

    changeCurrentMap(e, changer) {
        e.preventDefault();
        this.setState({currentMap: ((this.state.currentMap + changer) >= 0 ? this.state.currentMap + changer : 0)})
    }

    // This updates the routing algorithm when number of canvasser changes is applied
    updateRoutes(e) {
        this.setState({locationsRoutes: "unset"})
        const numCanvassers = {"numPeople": this.state.numPeople};

        axios
          .post("/numCanvassersChanged", numCanvassers)
          .then(res => console.log(res))
          .catch(err => console.warn(err));
    }


    // Deal with narrow windows better

    /**
     * Calculate & Update state of new dimensions
     */
    updateDimensions() {
      if (window.innerWidth > critWidth && !this.state.wide) {
        this.setState({ wide: true});
      } else if (this.state.wide && window.innerWidth < critWidth) {
        this.setState({ wide: false});
      }
    }

    /**
     * Add event listener
     */
    componentDidMount() {
      this.updateDimensions();
      window.addEventListener("resize", this.updateDimensions.bind(this));
    }

    render() {
        console.log("rendered")
        console.log(this.state.locationsRoutes)
        // const { isLoading, users, error } = this.state;
        return (
            <div className="App">
                <html>
                    <PageHeader/>

                    {/* Create a sidebar menu (manually) */}
                    <div className="sidebar">
                        <button className="button-side" onClick={() => {this.setState({page: "home"})}}> Home </button>
                        <button className="button-side" onClick={() => {this.setState({page: "about"})}}> About Us </button>
                        <button className="button-side" onClick={() => {this.setState({page: "how"})}}> How It Works </button>
                    </div>

                    <div className="page">
                        {/* Everything in this div will be displayed in the white box */}
                        <div className="container">
                            {/* This is the initial message you see */}
                            {(this.state.page === "home") &&
                                <div className="welcome">
                                    <Home />
                                    <button className="button" onClick={() => {this.setState({page: "step1"})}}> { homeButton } </button>
                                </div>
                            }

                            {/* This is what you see after clicking the "Get Started" button */}
                            {(this.state.page === "step1") &&
                                <div className="step1">
                                    <button className="button-alt" onClick={() => {this.setState({page: "home"})}}>Back</button>
                                    <Step1 />
                                    <div className="Button-Container">
                                        {/* Input File Button */}
                                        <input
                                            type="file"
                                            name="file"
                                            id="file"
                                            class="inputfile"
                                            ref={(input) => { this.filesInput = input }}
                                            onChange={e => { this.uploadFile(e); this.setState({page: "step2"}) }}
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
                            {/* conditional rendering ?*/}
                            {(this.state.page === "step2") &&
                                <div className="processingLocations">
                                    {(this.state.locationsRoutes == "unset") &&
                                        <div className="loading">
                                            <LoadingScreen></LoadingScreen>
                                        </div>
                                    }
                                    {(this.state.locationsRoutes != "unset") &&
                                        <div className="step2">
                                            <p> {this.state.locationsRoutes} </p>
                                            <p> {this.state.urls} </p>
                                            <button className="button-alt" onClick={() => {this.setState({page: "step1"})}}>Back</button>
                                            <Step2 />

                                            {/* Display Map  */}
                                            {/* TODO: Show locations  */}
                                            {/* TODO: Add Functionality to Add/Remove Addresses */}
                                            {/* When screen is wide side by side map and editor*/}
                                            {this.state.wide &&
                                                <table className="App-header">
                                                    <tr className="App-row">
                                                        <th className="App-Sides" id="mapBox">
                                                            <Directions coordRoute={this.state.locationsRoutes[0][0][this.state.currentMap % this.state.locationsRoutes[0][0].length]}/>
                                                            <div className="text"> Route: {this.state.currentMap % this.state.locationsRoutes[0][0].length + 1}</div>
                                                            <button class="button" onClick={e => {this.changeCurrentMap(e, -1)}}>Previous</button>
                                                            <button class="button" onClick={e => {this.changeCurrentMap(e, 1)}}>Next</button>
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
                                                            <div> <button class="button" onClick={e => {this.updateRoutes(e)}}>Apply Changes</button> </div>
                                                            <CSVLink class="button" filename="your-routes.csv" data={this.state.urls}>Route Directions</CSVLink>
                                                        </th>
                                                    </tr>
                                                </table>
                                            }
                                            {/* When screen is narrow show map above editors */}
                                            {!this.state.wide &&
                                                <div>
                                                    <div>
                                                        <Directions coordRoute={this.state.locationsRoutes[0][0][this.state.currentMap % this.state.locationsRoutes[0][0].length]}/>
                                                        <div className="text"> Route: {this.state.currentMap % this.state.locationsRoutes[0][0].length + 1}</div>
                                                        <button class="button" onClick={e => {this.changeCurrentMap(e, -1)}}>Previous</button>
                                                        <button class="button" onClick={e => {this.changeCurrentMap(e, 1)}}>Next</button>
                                                    </div>
                                                    <div>
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
                                                        <div> <button class="button" onClick={e => {this.updateRoutes(e)}}>Apply Changes</button> </div>
                                                        <CSVLink class="button" data={this.state.urls}>Route Directions</CSVLink>
                                                    </div>
                                                </div>
                                            }
                                        </div>
                                    }
                                </div>
                            }

                            {/* About Us Page */}
                            {(this.state.page === "about") && <About /> }

                            {/* How It Works Page */}
                            {(this.state.page === "how") && <How /> }

                            {/* Add section to display route */}
                            {/* When adding code, move as much as possible to outside functions to avoid clutter */}
                        </div>
                    </div>
                </html>
            </div>
        )
    }
}
