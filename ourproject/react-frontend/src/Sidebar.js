import React, { Component } from "react";
import './Menu.css';

// modified from CodePen React Slide In Menu from Lakston
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
  toggleMenu(e) {
    e.stopPropagation();
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
    if (!this.refs.pageHead.contains(e.target) && this.state.isVisible == true) {
      this.setState({ isVisible: false });
      console.log("clicked");
    }
  }

  render() {
    let status = this.state.isVisible ? 'isVisible': '';

    return (
      <div ref="pageHead">
        <div className="menuBar"> 
          <div className="hclicker" onClick={ this.toggleMenu }></div>
          <div id="hmenu" className={ status }>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      <SideBarRoutes status={ status }/>
    </div>
    )
  }
}

export default Sidebar;