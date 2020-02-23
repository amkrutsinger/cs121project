import requests, json

# needed to interact with OpenRouteService
headers = {
'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
}
beginningOfUrl = 'https://api.openrouteservice.org/geocode/autocomplete?'
api_key = '5b3ce3597851110001cf6248aa99e3ffa6984f3390e3f886fc85a33c'

# Input: a list of addresses
# Output: a list of [longitude, latitude] coordinates corresponding to those addresses
def addressesToCoordinates(list):
    errors = []
    coords = []

    for addr in list:
        result = addressToCoord(addr)
        if len(result) != 2:
            errors.append(result)
        else:
            coords.append(result)
    return coords, errors

# Input: an addresses
# Output: the [longitude, latitude] returned by searching for that address on
# OpenRouteService
def addressToCoord(addr):
    # this gets a JSON formatted list of locations matching input from OpenRouteService
    call = requests.get(beginningOfUrl + 'api_key=' + api_key + '&text=' + addr, headers=headers)

    # Error with OpenRouteService
    if call.status_code != 200:
        return "Error: " + call.reason
    else:
        # get list of all returned locations
        call_dict = json.loads(call.text)
        features = call_dict["features"]

        if len(features) is 0:
            return "Error: No result found for " + addr
        else:
            # return the coordinates of the top search result
            return features[0]["geometry"]["coordinates"]
