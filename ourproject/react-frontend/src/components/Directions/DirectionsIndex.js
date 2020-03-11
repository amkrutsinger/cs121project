import React, { Component } from "react";
import { compose, withProps } from "recompose";
import DirectionRenderComponent from "./DirectionRenderComponent";
import { G_API_URL } from "../../utility/constants";
import DummyLocations from "../../utility/locations";

const { withScriptjs, withGoogleMap, GoogleMap } = require("react-google-maps");

const createLatLngObject = latLng => {
    return {
      lat: latLng[1],
      lng: latLng[0]
    };
  };

class Directions extends Component {
  state = {
    defaultZoom: 12,
    map: null,
    center: {
      lat: this.props.coordRoute[0][1], // [0][1] first location, second coord is latitude
      lng: this.props.coordRoute[0][0]  // [0][0] first location, first coord is longitude
    }
  };
  render() {
    return (
      <GoogleMap
        defaultZoom={this.state.defaultZoom}
        center={this.state.center}
        defaultCenter={new window.google.maps.LatLng(23.21632, 72.641219)}
      >
        <DirectionRenderComponent
              key={this.props.coordRoute}
              index=""
              strokeColor="#18ff14"
              // Send the first and last locations as latlngobjects to the directions renderer
              from={createLatLngObject(this.props.coordRoute[0])}
              to={createLatLngObject(this.props.coordRoute[this.props.coordRoute.length-1])}
              // All entries between the first and last are waypoints. They should each be mapped to their corresponding latlngobject
              wayPoints={this.props.coordRoute.slice(1,this.props.coordRoute.length-1).map(createLatLngObject)}
            />
      </GoogleMap>
    );
  }
}

export default compose(
  withProps({
    googleMapURL: G_API_URL,
    loadingElement: <div style={{ height: `100%` }} />,
    containerElement: <div style={{ height: `600px` }} />,
    mapElement: <div style={{ height: `100%` }} />
  }),
  withScriptjs,
  withGoogleMap
)(Directions);