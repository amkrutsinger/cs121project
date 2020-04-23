import React, {useState} from 'react';
import axios from 'axios';
import './App.css';
import Directions from "./components/Directions/DirectionsIndex";
import PageHeader from './pageHeader'
import { CSVLink } from "react-csv";

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


/** FUNCTIONS TO DISPLAY CONTENT ON PAGES **/

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
                <img src={loading} alt=""></img>
        </div>
    )
}

// Displays the current map with buttons to flip to other maps (different canvassers routes)
function DisplayMap(props) {
    const [currentMap, setCurrentMap] = useState(0)
    let numRoutes = props.locationsRoutes[0][0].length

    return (
        <div>
            <Directions coordRoute={props.locationsRoutes[0][0][currentMap % numRoutes]}/>
            {(numRoutes > 1) && <div className="text"> Route: {currentMap % numRoutes + 1} </div> }
            {(numRoutes > 1) && <button class="button" onClick={() => setCurrentMap((currentMap - 1) >= 0 ? currentMap - 1 : numRoutes - 1)}> Previous </button> }
            {(numRoutes > 1) && <button class="button" onClick={() => setCurrentMap((currentMap + 1) >= 0 ? currentMap + 1 : 0)}> Next </button> }
        </div>
    )
}

// Displays all components on the right/bottom side of the step2 page
function DisplayEditingAndSharing(props) {
    return (
        <div>
            <DisplayAddresses addressList={props.addressList} callback={props.removeAddress} />
            <AddAddress callback={props.addAddress} />

            <div className="text">Number Of Canvassers:</div>
            <ChangeCanvassers numPeople={props.numPeople} callback={props.changeNumCanvassers} />

            <div> <button class="button" onClick={props.updateRoutes}>Apply Changes</button> </div>

            <CSVLink class="button" filename="your-routes.csv" data={props.urls}>Route Directions</CSVLink>
        </div>
    )
}


/** HELPER FUNCTIONS FOR DISPLAY_EDITING_AND_SHARING **/

// Display list of addresses with button to toggle visibility of list
// And buttons to remove addresses
function DisplayAddresses(props) {
    const [show, setShow] = useState(false);

    return (
        <div>
            {show && <button class="button" onClick={() => setShow(!show)}> Hide Addresses </button>}
            {!show && <button class="button" onClick={() => setShow(!show)}> View Addresses </button>}
            {show &&
                <ul className = 'addressList'>
                    {/* print each address in the addressList */}
                    {props.addressList.map(function(item) {
                        return (
                            <li key={item}>
                                <div align = 'left'>
                                    <input
                                        type="button"
                                        className="button"
                                        id="removeAddress"
                                        value="-"
                                        onClick={() => {props.callback(item)}}>
                                    </input>
                                    &nbsp; {item}
                                </div>
                            </li>
                        )
                    })}
                </ul>
            }
        </div>
    )
}

// Display a button to update the number of canvassers
function ChangeCanvassers(props) {
    return (
        <input type="number"
               name="numCanvassers"
               id="numCanvassers"
               class="inputNum"
               value={props.numPeople}
               onChange={props.callback}>
        </input>
    )
}


// Display input button to add address
function AddAddress(props) {
    return (
        <div>
            <div className="text">Add Address</div>
            {/* <form onSubmit = {props.handleSubmit}> */}
            {/* input box for adding an address */}
            {/* <div class = "description"> */}
                <input
                    type="text"
                    name="newAddress"
                    id = "newAddress"
                    class = "inputAddress"
                    placeholder = "Enter address"
                    onChange = {props.callback}>
                </input>
                {/* <input type='submit'/> */}
            {/* </div> */}
            {/* </form> */}
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

            wide: window.innerWidth > critWidth,
            develop: false,

            // temporary list to overwrite
            locationsRoutes: undefined,
            urls: undefined,
            addressList: undefined,

            numPeople: 1,
        };
        this.removeAddress = this.removeAddress.bind(this);
    }

    // Use: upload .csv file to flask/python for further analysis
    // Taken from Stack Overflow
    uploadFile(e) {
      e.preventDefault();
      let file = e.target.files[0];
      const formData = new FormData();

      formData.append("file", file);
      formData.append("numPeople", this.state.numPeople.toString());
      formData.append("develop", this.state.develop);

      var self = this;
      // for testing purposes
      const time = window.performance.now();
      axios
        .all([axios.post("/getAddresses", formData), axios.post("/findRoutes", formData)])
        .then(axios.spread(function (addresses, route) {
            // update state and getting location routes from backend
            let address = addresses.data;
            let routes = route.data
            self.setState({
                addressList: address.placesList,
                locationsRoutes: routes.actual,
                urls: routes.urls,
                page: "step2"
            })
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

    /**
     * This updates the routing algorithm when number of canvassers
     * changes or address is added is applied
     */
    updateRoutes(e) {
        this.setState({page: "loading"})

        // make a "package" with relevant info
        const newData = {
            data: this.state.addressList,
            canvassers: this.state.numPeople,
            develop: this.state.develop
        }
        var self = this;
        axios
            .post("/applyChanges", newData)
            .then(res => {
                self.setState({
                    locationsRoutes: res.data.actual,
                    urls: res.data.urls,
                    // Might not need to update addressList because already changed in frontend
                    // addressList: res.data.addresslist,
                    page: "step 2"
                })
                console.log(this.state.locationsRoutes);
            })
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

    /**
     * adds the inputted address to the addressList
     */
    addAddress(e) {
        e.preventDefault();
        // TO DO: figure out a way to only have this happen WHEN the person is done entering in the address
        var newaddress = e.target.value;
        let toAdd = { address: newaddress }
        // TO DO: fix this!
        if (e.key === 'Enter') {
            const finalAddress = this.state.newAddress[-1];
            this.setState({addressList: [...this.state.addressList, finalAddress]});
        }
        // add the current state to this new array
        this.setState({addressList: [...this.state.addressList, toAdd['address']]});
    }

    /**
     * removes the inputted address from the addressList
     */
    removeAddress (address){
        const newList = this.state.addressList;
        // filter out old address
        const updatedList = newList.filter(item => item !== address);
        this.setState({
            addressList: updatedList
        });
    }

    handleSubmit(e) {
        e.preventDefault();
        console.log("submitted");
        var newAddress = e.target.value;
        let toAdd = { address: newAddress }
        // add the current state to this new array
        this.setState({addressList: [...this.state.addressList, toAdd['address']]});
        console.log(this.state.addressList);
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
        // console.log(this.state.develop);
        // console.log(this.state.addressList);
        // console.log(this.state.locationsRoutes);
        return (
            <div className="App">
                <html>
                    <PageHeader/>
                    {/* Create a sidebar menu (manually) */}
                    <div className="sidebar">
                        <button className="button-side" onClick={() => {this.goToPage("home")}}> Home </button>
                        <button className="button-side" onClick={() => {this.goToPage("about")}}> About Us </button>
                        <button className="button-side" onClick={() => {this.goToPage("how")}}> How It Works </button>
                        {!this.state.develop && <button className="button-side" onClick={() => {this.setState({develop: true})}}> Developer Mode </button>}
                        {this.state.develop && <button className="button-side" onClick={() => {this.setState({develop: false})}}> User Mode </button>}
                    </div>

                    <div className="page">
                        {/* Everything in this div will be displayed in the white box */}
                        <div className="container">

                            {/* A back button - when user has a page in their history */}
                            {(this.state.back.length > 0) &&
                                <button className="button-alt" onClick={() => {this.goBack()}}> Back </button>
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

                            {/* The Loading Screen */}
                            {(this.state.page === "loading") && <LoadingScreen /> }

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
                                            onChange={e => {this.uploadFile(e); this.goToPage("loading")}}
                                        />
                                        <label for="file">Choose a CSV file</label>
                                    </div>

                                    <p className ="text"> How many canvassers do you have? </p>
                                    <ChangeCanvassers numPeople={this.state.numPeople} callback={e => {this.changeNumCanvassers(e)}} />
                                </div>
                            }

                            {/* This is what you see after selecting a CSV file */}
                            {(this.state.page === "step2") &&
                                <div className="step2">
                                    <SimpleTemplate title={mapPageTitle} body={mapPageBody} />

                                    {/* When screen is wide side by side map and editor*/}
                                    {this.state.wide &&
                                        <table className="App-header">
                                            <tr className="App-row">
                                                <th className="App-Sides" id="mapBox">
                                                    <DisplayMap locationsRoutes={this.state.locationsRoutes} />
                                                </th>
                                                <th className="App-Sides">
                                                    <DisplayEditingAndSharing
                                                        addressList={this.state.addressList}  
                                                        removeAddress={this.removeAddress}
                                                        addAddress={e => {this.addAddress(e)}}
                                                        numPeople={this.state.numPeople}  
                                                        changeNumCanvassers={e => {this.changeNumCanvassers(e)}}
                                                        updateRoutes={e => {this.updateRoutes(e)}}
                                                        urls={this.state.urls}
                                                    />
                                                </th>
                                            </tr>
                                        </table>
                                    }

                                    {/* When screen is narrow show map above editors */}
                                    {!this.state.wide &&
                                        <div>
                                            <DisplayMap locationsRoutes={this.state.locationsRoutes} />
                                            <DisplayEditingAndSharing
                                                addressList={this.state.addressList}  removeAddress={this.removeAddress}
                                                addAddress={e => {this.addAddress(e)}}
                                                numPeople={this.state.numPeople}  changeNumCanvassers={e => {this.changeNumCanvassers(e)}}
                                                updateRoutes={e => {this.updateRoutes(e)}}
                                                urls={this.state.urls}
                                            />
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
