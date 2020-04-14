import React, {useState, useEffect} from 'react';
import axios from 'axios';
import './App.css';
import Directions from "./components/Directions/DirectionsIndex";
import PageHeader from './pageHeader'
import { withState, setDisplayName } from 'recompose';
import { CSVLink, CSVDownload } from "react-csv";

import loading from './loading.gif';

// This is the width at which the screen with the map switches between side by side and vertical organization.
const critWidth = 1000;


/** TITLE AND BODY TEXT FOR PAGES **/

// Text for Home Page
const homeTitle = 'Welcome,'
const homeBody = 'We understand that planning routes for volunteers to canvas is a difficult and time-consuming task. As such, we have created this site to help with all your canvasing needs. Using state-of-the-art algorithms techniques, we can plan an efficient route for your volunteers to visit all canvassing locations in just a few short minutes. Happy campaigning!'

// Text for Upload CSV Page
const uploadCSVTitle = 'Step 1'
const uploadCSVBody = 'Where do you want to campaign?'

// Text for Map Page
const mapPageTitle = 'Step 2'
const mapPageBody = 'Here are the locations we got. Do you want to change anything?'

// Text for About Page
const aboutTitle = 'About Us'
const aboutBody = 'Hello, we are Anna, Eric and Sophia. We made this site for our Software Development Project at Harvey Mudd College. We hope you enjoy it!'

// Text for How It Works Page
const howTitle = 'How It Works'
const howBody = 'This site was created using OpenStreetRoute and GoogleMaps for the mapping services. To calculate the specific routes, we used an algorithm which approximates a solution to the Vehicle Routing Problem. If you want to learn more, the following paragraphs ellaborate on the exact method:'
const howBody2 = 'The solution implemented uses Google’s OR-tools which is, “open source software for combinatorial optimization, which seeks to find the best solution to a problem out of a very large set of possible solutions.” We set up an OR-tool vehicle routing problem solver and tell it we want it to create some number of loops (paths for canvassers to travel) from our start location and to find a solution that minimizes the maximum cost (which in our case is time) anyone has to travel. Using the maximum cost of anyone’s path achieves both equitable distribution of labor amongst canvassers and efficiency of each path.'
const howBody3 = 'All possible cycles in the graph of perhaps very many nodes is a gigantic solution space, so we use OR-tools to search this space efficiently for a solution that minimizes the maximum travel time. We tell it first to search for the solution using the solution strategy, path cheapest arc. This means our algorithm first finds a solution by, “Starting from a route ‘start’ node, connect it to the node which produces the cheapest route segment, then extend the route by iterating on the last node added to the route.” Then it uses many of the complicated techniques developed in OR-tools to search the solution space for an optimal solution.'
const howBody4 = 'To understand all the techniques OR-tools uses to find the optimal solution would be a huge undertaking in itself so here’s an overview of the methods. OR-tools uses local search optimization which defines a neighborhood of local solutions, which likely means a set of solutions with only one or a few node changes in the path(s). It then tries to do what is called hill climbing which means to find the “best” solution in the local area and then repeat until a peak is found. This technique only finds a locally optimal solution which is not necessarily the one true best solution. There are techniques we could try that OR-tools has to not stop at locally optimal solutions, and keep searching to increase the likelihood of finding the global best, or true optimal but benefits are likely small and have large runtime increases.'


/** FUNCTIONS TO DISPLAY TITLE AND BODY ON PAGES **/

// A simple template to display text for pages on site
function SimpleTemplate(props) {
    return (
        <div className="description">
            <p className="big-text"> {props.title} </p>
            <p className="text"> {props.body} </p>
        </div>
    )
}

// A Loading Screen
function LoadingScreen() {
    return (
        <div className="description">
            <p className="big-text">LOADING...</p>
                {/* added a loading gif */}
                <img src={loading}></img>
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

            // Used to keep track of visited pages - last item is the most recently visited page
            // (excluding the current one)
            back: [],
            isLoading: undefined,
            showAddress: false,
            wide: window.innerWidth > critWidth,

            // temporary list to overwrite
            locationsRoutes: "unset",
            urls: "unset",
            numPeople: 1,
            currentMap: 0,
            addressList: undefined
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
      // for testing purposes
      const time = window.performance.now();
      this.isLoading = true;
      axios
        .all([axios.post("/getAddresses", formData), axios.post("/findRoutes", formData)])
        .then(axios.spread(function (addresses, route) {
            self.isLoading = true;
            // update state and getting location routes from backend
            let address = addresses.data;
            let routes = route.data
            self.setState({
                addressList: address.placesList,
                locationsRoutes: routes.actual, 
                urls: routes.urls
            })
            self.isLoading = false;
            // for testing purposes, tells us how long request took
            console.log(window.performance.now() - time);
        }))
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

    /**
     * This updates the routing algorithm when number of canvassers 
     * changes or address is added is applied
     */ 
    updateRoutes(e) {
        this.setState({locationsRoutes: 'unset'})
        const numCanvassers = {"numPeople": this.state.numPeople};
        // make a "package" with relevant info
        const newAddresses = {
            data: this.state.addressList,
            canvassers: this.state.numPeople
        }
        console.log(this.state.addressList)
        var self = this;
        axios
            .all[axios.post("/numCanvassersChanged", numCanvassers), axios.post("/addressChanged", newAddresses)]
            .then(axios.spread(function (addresses, route) {
                self.isLoading = true;
                // update state and getting location routes from backend
                let address = addresses.data;
                let routes = route.data
                self.setState({
                    addressList: address.placesList,
                    locationsRoutes: routes.actual, 
                    urls: routes.urls
                })
                self.isLoading = false;
            }))
            // TO DO: delete when done
            // for testing purposes
            console.log("update")
            console.log(this.state.addressList)
            
            .catch(err => console.warn(err));
    }

    // Used for back button
    // Sends user to latest page in back array and then updates back array to remove that value
    goBack() {
        let array = this.state.back.slice()   // make a separate copy of the array
        let priorPage = array.splice(array.length - 1, 1)
        this.setState({page: priorPage[0], back: array})
    }

    // Performs all functions necessary to change page displayed
    // (updates page and back)
    goToPage(newPage) {
        this.setState({back: this.state.back.concat(this.state.page), page: newPage})
    }

    // Updates showAddress state upon click
    toggleShowAddresses(e) {
        e.preventDefault();
        this.setState({showAddress: !this.state.showAddress});
    }

    /**
     * adds the inputted address to the addressList
     */
    addAddress(e) {
        e.preventDefault();
        // TO DO: figure out a way to only have this happen WHEN the person is done entering in the address
        var newAddress = e.target.value;
        let toAdd = {
            address: newAddress
        }
        // add the current state to this new array using the spread
        this.setState({addressList: [...this.state.addressList, toAdd['address']]});
    }

    /**
     * Calculate & Update state of new dimensions
     * This helps to deal with narrow windows
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
        console.log(this.state.numPeople)
        return (
            <div className="App">
                <html>
                    <PageHeader/>

                    {/* Create a sidebar menu (manually) */}
                    <div className="sidebar">
                        <button className="button-side" onClick={() => {this.goToPage("home")}}> Home </button>
                        <button className="button-side" onClick={() => {this.goToPage("about")}}> About Us </button>
                        <button className="button-side" onClick={() => {this.goToPage("how")}}> How It Works </button>
                    </div>

                    <div className="page">

                        {/* Everything in this div will be displayed in the white box */}
                        <div className="container">

                            {/* A back button - when user has a page in their history */}
                            {(this.state.back.length > 0) &&
                                <button className="button-alt" onClick={() => {this.goBack()}}>Back</button>
                            }

                            {/* The Home Page */}
                            {(this.state.page === "home") &&
                                <div className="welcome">
                                    <SimpleTemplate title={homeTitle} body={homeBody} />
                                    <button className="button" onClick={() => {this.goToPage("step1")}}> Get Started! </button>
                                </div>
                            }

                            {/* About Us Page */}
                            {(this.state.page === "about") && <SimpleTemplate title={aboutTitle} body={aboutBody} /> }

                            {/* How It Works Page */}
                            {(this.state.page === "how") &&
                                <div>
                                    <SimpleTemplate title={howTitle} body={howBody} />
                                    <p className="text"> {howBody2} </p>
                                    <p className="text"> {howBody3} </p>
                                    <p className="text"> {howBody4} </p>
                                </div>
                            }

                            {/* This is what you see after clicking the "Get Started" button */}
                            {(this.state.page === "step1") &&
                                <div className="step1">
                                    <SimpleTemplate title={uploadCSVTitle} body={uploadCSVBody} />

                                    {/* Input File Button - For Uploading the CSV */}
                                    <div className="Button-Container">
                                        <input
                                            type="file"
                                            name="file"
                                            id="file"
                                            class="inputfile"
                                            ref={(input) => { this.filesInput = input }}
                                            onChange={e => {this.uploadFile(e); this.goToPage("step2")}}
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
                            {(this.state.page === "step2") &&
                                <div className="processingLocations">
                                    {/* The Loading Screen */}
                                    {(this.state.locationsRoutes == "unset" && this.isLoading) &&
                                        <div className="loading">
                                            <LoadingScreen></LoadingScreen>
                                        </div>
                                    }
                                    {(this.state.locationsRoutes != "unset") &&
                                        <div className="step2">
                                            <SimpleTemplate title={mapPageTitle} body={mapPageBody} />

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
                                                            <button class="button" onClick={e => {this.toggleShowAddresses(e)}}>View Addresses</button> 
                                                            {/* TO DO: Fix toggle ability */}
                                                            {(this.state.showAddress == true) && 
                                                                <div>
                                                                    <ul>
                                                                        {/* print each address in the addressList */}
                                                                        {this.state.addressList.map(function(item) {
                                                                            return <li key={item}>{item}</li>;
                                                                        })}
                                                                    </ul>
                                                                </div>
                                                            }
                                                            <div className="text">Add Address</div>
                                                            {/* input box for adding an address */}
                                                            <div class = "description">
                                                                <input type="text"
                                                                    name="newAddress"
                                                                    id = "newAddress"
                                                                    class = "inputAddress"
                                                                    value = {this.state.address}
                                                                    ref={(input) => { this.filesInput = input }}
                                                                    onChange={e => {this.addAddress(e)}}>
                                                                </input>
                                                            </div>
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
                                                        <button class="button" onClick={e => this.toggleShowAddresses(e)}>View Addresses</button>
                                                        {(this.state.addressIsVisible == true) && 
                                                            <div>
                                                                <ul>
                                                                    {this.state.addressList.map(function(item) {
                                                                        return <li key={item}>{item}</li>;
                                                                    })}
                                                                </ul>
                                                            </div>
                                                        }
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
                                                    </div>
                                                </div>
                                            }
                                        </div>
                                    }
                                </div>
                            }
                        </div>
                    </div>
                </html>
            </div>
        )
    }
}
