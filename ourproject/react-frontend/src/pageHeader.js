import React from 'react'
import './pageHeader.css'
import logo from './logo.png';
import Sidebar from "./Sidebar";

// Display our PageHeader - This includes
//  -- upper left icon
//  -- large centered black title text
//  -- smaller centered subtitle text

// TODO: Add a menu with "Home" "How it Works" "About Us" tabs
function PageHeader() {
 return (
     <div >
        <div class="hasicon">
            <img src={logo} alt="GrassRoutes" class="icon" />
        </div>
        <header className="PageHeader">
            <h1 className="Title">G R A S S R O U T E S</h1>
            <h2 className="Subtitle">Intelligent Mapping for Political Campaigns</h2>
        </header>
        {/* <div>
            <Sidebar />
        </div> */}

    </div>
 )
}

export default PageHeader
