import React, { Component } from "react";
import './App.css';
 
class SideBarRoutes extends React.Component {
  constructor(props) {
    super(props);
    // Any number of links can be added here
    this.state = {
      routes: [{
        text: 'Home',
        route: '',
      }, {
        text: 'How it Works',
        route: '',
      }, {
        text: 'About Us',
        route: '',
      }]
    }
  }
  render() {
    // map each route to a particular target link
    let routes = this.state.routes.map((route, i) => 
      <li ref={i + 1}>
        <a href={routes.route} target="_blank">{routes.text}</a>
      </li>
    );

    return (
        <div className={this.props.menuStatus} id='menu'>
          <ul>
            { routes }
          </ul>
        </div>
    )
  }
}

class Sidebar extends Component {
  constructor(props, context) {
    super(props, context); 

    this.state = {
        isVisible: false
    };

    this.toggleMenu = this.toggleMenu.bind(this);
    this.onMouseClick = this.onMouseClick.bind(this);
  }
    
  // logic behind toggling menu
  toggleMenu() {
    this.setState({
      visible: !this.state.visible
    });
  }

  componentDidMount() {
    document.addEventListener('click', this.onMouseClick, false);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.onMouseClick, false);
  }

  onMouseClick(e) {
        this.toggleMenu();
        console.log("clicked");
        e.stopPropagation();
  }

  render() {
    let status = this.state.isVisible;

    return (
      <div ref="root">
        <div className="menuBar">
          <div className="hclicker" onClick={ this.toggleMenu }></div>
          <div id="hmenu" className={ status }><span></span><span></span><span></span><span></span></div>
          {/* <div className="title">
            <span>{ this.props.title }</span>
          </div> */}
        </div>
        <SideBarRoutes status={ status }/>
      </div>
    )
  }
}
 
export default Sidebar;