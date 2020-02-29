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

        # algorithm assumes starting at first location
        # BUG: currently returns a path but not the shortest-path 
        path = dijsktra(distances, placesList)
        print(path)

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
# Method: Dijkstra's Algorithm
# Source: Internet
def dijsktra(distances, placesList):
    # shortest paths is a dict of nodes
    # whose value is a tuple of (previous node, weight)
    initial = 0
    shortest_paths = {initial: (None, 0)}
    current_node = initial
    visited = set()

    unvisited = set()
    for i in range(len(distances[0])):
        unvisited.add(i)
    unvisited.remove(0)

    path = []

    while len(unvisited) is not 0:
        path.append(placesList[current_node])
        visited.add(current_node)
        destinations = unvisited
        weight_to_current_node = shortest_paths[current_node][1]

        for next_node in destinations:
            weight = distances[current_node][next_node] + weight_to_current_node
            if next_node not in shortest_paths:
                shortest_paths[next_node] = (current_node, weight)
            else:
                current_shortest_weight = shortest_paths[next_node][1]
                if current_shortest_weight > weight:
                    shortest_paths[next_node] = (current_node, weight)

        next_destinations = {node: shortest_paths[node] for node in shortest_paths if node not in visited}
        if not next_destinations:
            return "Route Not Possible"

        # next node is the destination with the lowest weight
        current_node = min(next_destinations, key=lambda k: next_destinations[k][1])
        unvisited.remove(current_node)

    return path



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
