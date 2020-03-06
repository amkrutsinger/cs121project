import React from 'react'
import './pageHeader.css'
import logo from './logo.png';

// Display our PageHeader - This includes
//  -- upper left icon
//  -- large centered black title text
//  -- smaller centered subtitle text
function PageHead() {
 return (
     <div >
        <div class="hasicon">
            <img src={logo} alt="GrassRoutes" class="icon" />
        </div>
        <header className="PageHeader">
            <h1 className="Title">G R A S S R O U T E S</h1>
            <h2 className="Subtitle">Intelligent Mapping for Political Campaigns</h2>
        </header>
    </div>
 )
}

// Display our menu
// The menu items are "Home" "How It Works" "About Us"
// Menu items should be equally spaced across page
function Menu() {
}

function PageHeader() {
    return (
        <div>
            <PageHead />
        </div>
    )
}

export default PageHeader
