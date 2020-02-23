from app import getLatLong

inputStr = ""

# takes in .csv file
def getInput():
    if request.method == 'GET':
        place = request.args.get('place', None)
        if place:
            # this allows us to modify global variable
            global inputStr
            inputStr = place

# return routes
def routes():
    if inputStr != "":
        return inputStr + " route"
    else:
        return ""

# return map of area
def mapArea():
    if inputStr != "":
        return inputStr + " map"
    else:
        return ""

# return errors
def errors():
    if inputStr != "":
        return inputStr + " errors"
    else:
        return ""
