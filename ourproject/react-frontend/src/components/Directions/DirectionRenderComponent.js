import React, { Component } from "react";
import { convertLatLngToObj } from "../../utility/helper";
const { Marker, DirectionsRenderer } = require("react-google-maps");

class DirectionRenderComponent extends Component {
  state = {
    directions: null,
    currentLocation: null
  };
  delayFactor = 0;

  componentDidMount() {
    const startLoc = this.props.from.lat + ", " + this.props.from.lng;
    const destinationLoc = this.props.to.lat + ", " + this.props.to.lng
    this.getDirections(startLoc, destinationLoc, this.props.wayPoints);
    this.setCurrentLocation();
  }

  async getDirections(startLoc, destinationLoc, wayPoints = []) {
    const waypts = [];
    while (wayPoints.length > 0) {
      const wayPoint = wayPoints.pop()
      waypts.push({
        location: new window.google.maps.LatLng(
          wayPoint.lat,
          wayPoint.lng
        ),
        stopover: true
      });
    }
    const directionService = new window.google.maps.DirectionsService();
    directionService.route(
      {
        origin: startLoc,
        destination: destinationLoc,
        waypoints: waypts,
        optimizeWaypoints: true,
        travelMode: window.google.maps.TravelMode.WALKING
      },
      (result, status) => {
        // console.log("status", status);
        if (status === window.google.maps.DirectionsStatus.OK) {
          this.setState({
            directions: result,
            //wayPoints: result.routes[0].overview_path.filter((elem, index) => {
            //  return index % 30 === 0;
            //})
          });
        } else if (
          status === window.google.maps.DirectionsStatus.OVER_QUERY_LIMIT
        ) {
          this.delayFactor += 0.2;
          // if (this.delayFactor <= 10) this.delayFactor = 0.2;
          setTimeout(() => {
            this.getDirections(startLoc, destinationLoc, wayPoints);
          }, this.delayFactor * 200);
        } else {
          console.error(`error fetching directions ${result}`);
        }
      }
    );
  }

  setCurrentLocation = () => {
    let count = 0;
    let refreshIntervalId = setInterval(() => {
      const locations = this.state.wayPoints;
      if (locations) {
        if (count <= locations.length - 1) {
          const currentLocation = convertLatLngToObj(
            locations[count].lat(),
            locations[count].lng()
          );
          this.setState({ currentLocation });

          const wayPts = [];
          wayPts.push(currentLocation);
          const startLoc = this.props.from.lat + ", " + this.props.from.lng;
          const destinationLoc = this.props.to.lat + ", " + this.props.to.lng;
          this.delayFactor = 0;
          this.getDirections(startLoc, destinationLoc, wayPts);
          count++;
        } else {
          clearInterval(refreshIntervalId);
        }
      }
    }, 1000);
  };
  render() {
    let originMarker = null;
    let destinationMarker = null;
    if (this.state.directions && this.props.index) {
      originMarker = (
        <Marker
          defaultLabel={this.props.index.toString()}
          defaultIcon={null}
          position={{
            lat: parseFloat(this.props.from.lat),
            lng: parseFloat(this.props.from.lng)
          }}
        />
      );
      destinationMarker = (
        <Marker
          label={this.props.index.toString()}
          defaultIcon={null}
          position={{
            lat: parseFloat(this.props.to.lat),
            lng: parseFloat(this.props.to.lng)
          }}
        />
      );
    }
    return (
      <div>
        {originMarker}
        {destinationMarker}
        {this.state.currentLocation && (
          <Marker
            label={this.props.index.toString()}
            position={{
              lat: this.state.currentLocation.lat,
              lng: this.state.currentLocation.lng
            }}
          />
        )}
        {this.state.directions && (
          <DirectionsRenderer
            directions={this.state.directions}
            options={{
              polylineOptions: {
                strokeColor: this.props.strokeColor,
                strokeOpacity: 0.8,
                strokeWeight: 4
              },
              preserveViewport: true,
              suppressMarkers: false,
              icon: { scale: 3 }
            }}
          />
        )}
      </div>
    );
  }
}

export default DirectionRenderComponent;