import React, {useEffect} from 'react';
import axios from 'axios';
import './App.css';
import Directions from "./components/Directions/DirectionsIndex";
import PageHeader from './pageHeader'
import { withState } from 'recompose';
import Sidebar from "./Sidebar";

// This is the width at which the screen with the map switches between side by side and vertical organization.
const critWidth = 1000;
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

function LoadingScreen() {
    return (
        <div className="description">
            <p className="big-text">LOADING...</p>
        </div>
    )
}

function AboutUs() {
    return (
        <div className="description">
            <p className="big-text"> About Us </p>
            <p className ="text"> 
                Here are the locations we got. Do you want to change anything? 
            </p>
        </div>
    )
}

function HowItWorks() {
    return (
        <div className="description">
            <p className="big-text"> How It Works </p>
            <p className ="text"> 
                The solution implemented uses Google’s OR-tools which is, “open source software for combinatorial optimization, which seeks to find the best solution to a problem out of a very large set of possible solutions.” We set up an OR-tool vehicle routing problem solver and tell it we want it to create some number of loops (paths for canvassers to travel) from our start location and to find a solution that minimizes the maximum cost (which in our case is time) anyone has to travel. Using the maximum cost of anyone’s path achieves both equitable distribution of labor amongst canvassers and efficiency of each path. 
                
                All possible cycles in the graph of perhaps very many nodes is a gigantic solution space, so we use OR-tools to search this space efficiently for a solution that minimizes the maximum travel time. We tell it first to search for the solution using the solution strategy, path cheapest arc. This means our algorithm first finds a solution by, “Starting from a route ‘start’ node, connect it to the node which produces the cheapest route segment, then extend the route by iterating on the last node added to the route.” Then it uses many of the complicated techniques developed in OR-tools to search the solution space for an optimal solution.

                Our site works like this:
                <p> 
                    <li> Step 1: Upload CSV file </li>
                    <li> Step 2: Add/Remove addresses </li>
                    <li> Step 3: Set Parameters (e.g. number of campaigners) </li>
                    <li> Result: display path, statistics </li>
                </p>
            </p>
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
            // temporary list to overwrite 
            locationsRoutes: "unset",
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
            // update state and getting location routes from backend
            self.setState({locationsRoutes: locations});
            self.showStep2();
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
          isStep2Active: false,
          locationsRoutes: "unset"
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
        return (
            <div className="App">
                <html>
                    <PageHeader/>
                    <Sidebar/>
                    {/* TO DO: Fix overlay */}
                    {/* if I put Sidebar here, the formatting of each subsection looks funky... */}
                    {/* <Sidebar/> */}
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
                            {/* conditional rendering ?*/}
                            {this.state.isStep2Active && 
                                <div className="processingLocations">
                                    {(this.state.locationsRoutes == "unset") && 
                                        <div className="loading">
                                            <LoadingScreen></LoadingScreen>
                                        </div>
                                    }
                                    {(this.state.locationsRoutes != "unset") && 
                                        <div className="step2">
                                            <p> {this.state.locationsRoutes} </p>
                                            <button className="button-alt" onClick={this.showStep1}>Back</button>
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
                                                            <button class="button" onClick={e => {this.updateRoutes(e)}}>Apply Changes</button>
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
                                                        <button class="button" onClick={e => {this.updateRoutes(e)}}>Apply Changes</button>
                                                    </div>
                                                </div>
                                            }
                                        </div>
                                    }
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
