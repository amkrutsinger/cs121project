import React, { Component } from "react";
import './Menu.css';
import logo from './logo.png';
 
class SideBarRoutes extends React.Component {
  constructor(props) {
    super(props);
    // Any number of links can be added here
    this.state = {
      routes: [{
        text: 'Home',
        path: 'https://www.google.com',
      }, {
        text: 'How it Works',
        path: 'https://www.google.com',
      }, {
        text: 'About Us',
        path: 'https://www.google.com',
      }]
    }
  }
  render() {
    // map each route to a particular target link
    let routes = this.state.routes.map((path, i) => 
      <li ref={i + 1}>
        <a href={path.path} target="_blank">{path.text}</a>
      </li>
    );

    return (
        <div className={this.props.status} id='menu'>
          <ul>
            { routes }
          </ul>
        </div>
    )
  }
}

class Sidebar extends Component {
  constructor(props) {
    super(props); 
    this.state = {
        isVisible: false
    };

    this.toggleMenu = this.toggleMenu.bind(this);
    this.onMouseClick = this.onMouseClick.bind(this);
  }
    
  /*
  * Update whether sidebar is visible or not
  */ 
  toggleMenu() {
    this.setState({
      isVisible: !this.state.isVisible
    });
  }

  /*
  * Determine if mouse has been clicked
  */
  componentDidMount() {
    document.addEventListener('click', this.onMouseClick, false);
  }

  /*
  * Determine if mouse has been unclicked
  */
  componentWillUnmount() {
    document.removeEventListener('click', this.onMouseClick, false);
  }

  onMouseClick(e) {
    this.toggleMenu();
    console.log("clicked");
    e.stopPropagation();
  }

  render() {
    let status = this.state.isVisible ? 'isVisible': '';

    return (
      <div ref="root">
        <div className="menuBar">
          <div className="hclicker" onClick={ this.toggleMenu }></div>
          <div id="hmenu" className={ status }>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div class="hasicon">
            <img src={logo} alt="GrassRoutes" class="icon" />
          </div>
          <div className="PageHeader">
              <div className="Title">G R A S S R O U T E S</div>
              <div className="Subtitle">Intelligent Mapping for Political Campaigns</div>
          </div>
          </div>
        <SideBarRoutes status={ status }/>
      </div>
    )
  }
}

export default Sidebar;