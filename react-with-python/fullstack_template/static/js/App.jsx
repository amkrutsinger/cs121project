import React from "react";
import Hello from "./Hello";

//require('../css/fullstack.css');
var $ = require('jquery');

import HeaderBackgroundImage from '../images/header.jpg';

export default class App extends React.Component {
    constructor(props) {
        super(props);
    }

    addHeaderImg() {
        let headerBg = new Image();
        headerBg.src = HeaderBackgroundImage;
    }

    render() {
        return (
            <div className='header-contents'>
                {this.addHeaderImg()}
                <Hello name='Rimini' />
            </div>
        );
    }
}
