const convertLatLngToObj = (lat, lng) => {
    return {
      lat,
      lng
    };
  };
  
  const createLatLngObject = latLng => {
    const latLngArray = latLng.split(",");
    return {
      lat: latLngArray[0],
      lng: latLngArray[1]
    };
  };
  
  const createLocationObject = (
    from,
    fromTitle,
    to,
    toTitle,
    strokeColor
  ) => {
    return {
      from: { ...createLatLngObject(from), fromTitle },
      to: { ...createLatLngObject(to), toTitle },
      strokeColor: strokeColor
    };
  };
  
  export { convertLatLngToObj, createLocationObject, createLatLngObject };