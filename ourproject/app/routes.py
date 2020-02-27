from flask import Flask, render_template, request
from app import app
import csv, io, requests, json

# --- ROUTES --- #

# Set up the homepage with the routes, map, and errors
# This will be set to null initialize and change when input is given
@app.route('/')
@app.route('/index')
def index():
    return render_template("index.html")

# Parse user input and return result
@app.route('/findRoutes', methods = ['POST'])
def findRoutes():
    if request.method == 'POST':
        placesList = getInput()
        distances, errors = parseInput(placesList)

        # For Testing
        print (', '.join(errors))
    return render_template("index.html")



# --- INTERFACE FUNCTIONS --- #

# Input: .csv file (passed through request)
# Output: list of items in .csv file
def getInput():
    # open .csv file
    placesFile = request.files['file']
    stream = io.StringIO(placesFile.stream.read().decode("UTF8"), newline=None)
    places_csv = csv.reader(stream)

    # Convert .csv file first to list of lists and then just list
    placesListOfLists = list(places_csv)
    placesList = [elt for lst in placesListOfLists for elt in lst]
    return placesList

# Input: a list of places (as strings)
# Output: the distance matrix for those places
def parseInput(placesList):
    coords, errors = addressesToCoordinates(placesList)
    distances = distMatrix(coords)
    return distances, errors

# Input: a list of distances
# Output: order to visit locations in in order to visit all locations
#         in shortest amount of time
def findShortestPath(distances):
    return null



# --- OPEN ROUTE SERVICE FUNCTIONS --- #

# Authorization key and other information to allow request for matrix data to process
headers = {
'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
'Authorization': '5b3ce3597851110001cf6248093639b34bd24267af2380b1d72d66d6',
'Content-Type': 'application/json; charset=utf-8'
}

beginningOfUrl = 'https://api.openrouteservice.org/geocode/autocomplete?'
api_key = '5b3ce3597851110001cf6248aa99e3ffa6984f3390e3f886fc85a33c'


# return a matrix of distances given an input of coordinates
# the output is a square matrix formatted as an array of a arrays
def distMatrix(listOfCoords):
    body = {"locations": listOfCoords}
    print(body)

    call = requests.post('https://api.openrouteservice.org/v2/matrix/driving-car', json=body, headers=headers)

    # Unwrap json to get a dictionary and access durations matrix
    return call.json()["durations"]


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
