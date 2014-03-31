var http = require("http");
var url = require("url");
var fs = require("fs");
var io = require("C:\\Program Files\\nodejs\\node_modules\\socket.io")
var qs = require("querystring")

GameWindowConnectionObject = {};
HandWindowConnectionObject = {};
CommandWindowConnectionObject = {};
DirectoryStructureObject = {};
ConnectedUserObject = {}

IDReaperArray = [];

MasterCardAndDeckStateObject = {}

//Likely the main deck array needs to be replaced by an object, whos values are composed of 4 elements
//1 An array that describes either the single card, or all of the cards in a deck
//3 The room the card belong to
//4 The x position
//5 The y position


CurrentlySelectedDeckID = -1
UniqueIDCounter = 1
RoomCount = 0

PopulateDirectoryStructure("C:\\AANode\\pictures")

function DeckOrCardObject()
{
	this.x = null
	this.y = null
	this.room = null
	this.deck = null
	this.owner = null
	this.facedown = null
	this.quantity = null
	this.cardarray = new Array()
}

function start(route, handle)
{
	function onRequest(request, response) {
	var postData = "";
	//console.log(request)
	var pathname = url.parse(request.url).pathname;
	var querystring = request.url.split('?')[1];

		if(pathname.indexOf("picture") > -1)
		{
			postData = pathname;
			pathname = "/picture"
			console.log("We have found a picture request")
			console.log(pathname + "<-- this is the path name")
		}

		/*
		if(pathname.indexOf("CheckDeck") > -1)
		{
			postData = pathname;
			pathname = "/checkdeck"
			console.log("We have found a picture request")
			console.log(pathname + "<-- this is the path name")
		}
		*/

	console.log("Request for." + pathname + " received");
	request.setEncoding("utf8");


	request.addListener("data", function(postDataChunk){
	postData += postDataChunk;
	console.log("Received POST data chunk '"+ postDataChunk + "'.");
	});


	request.addListener("end", function() {
	route(handle, pathname, response, postData);
	});

	}

	var server = http.createServer(onRequest);
	sio = io.listen(server)
	sio.set("log level", 1)
	server.listen("80")


	sio.sockets.on('connection', function(socket){
	var address = socket.handshake.address;

	console.log("***************************")
	console.log(address.address + ":" + address.port)
	console.log("***************************")

	//MasterConnectionObject[address.address + ":" + address.port] = socket

	socket.on('disconnect', function () {
		//delete MasterConnectionObject[address.address + ":" + address.port]
		sio.sockets.emit("RoomCounters", sio.sockets.manager.rooms)
		console.log("**" + address.address + ":" + address.port + " has disconnected from the server");
    });

	socket.on("MainWindowCreated", function(){
		GameWindowConnectionObject[address.address] = socket
		socket.join("mainwindows")
		console.log("Main Window has been created");
		for(var key in MasterCardAndDeckStateObject)
		{
			if(MasterCardAndDeckStateObject[key].deck == 0 && MasterCardAndDeckStateObject[key].owner == null){
				//socket.emit("CreateObject", {"ObjectSrc":MasterCardAndDeckStateObject[key].cardarray[0], "ObjectID":key, "x":MasterCardAndDeckStateObject[key].x, "y":MasterCardAndDeckStateObject[key].y, "type":"card"})
				socket.emit("CreateObject", {"ObjectSrc":MasterCardAndDeckStateObject[key].cardarray[0], "ObjectID":key, "x":MasterCardAndDeckStateObject[key].x, "y":MasterCardAndDeckStateObject[key].y})
			}

			if(MasterCardAndDeckStateObject[key].deck == 1 && MasterCardAndDeckStateObject[key].owner == null){
				socket.emit("CreateObject", {"ObjectSrc":"null", "ObjectID":key, "x":MasterCardAndDeckStateObject[key].x, "y":MasterCardAndDeckStateObject[key].y, "type":"deck"})
			}
		}
	})

	socket.on("HandWindowCreated", function(){
		HandWindowConnectionObject[address.address] = socket
		socket.join("handwindows")
		console.log("Hand Window has been created");
		for(var key in MasterCardAndDeckStateObject)
		{
			if(MasterCardAndDeckStateObject[key].owner != null){
				socket.emit("CreateObject", {"ObjectSrc":MasterCardAndDeckStateObject[key].cardarray[0], "ObjectID":key, "x":MasterCardAndDeckStateObject[key].x, "y":MasterCardAndDeckStateObject[key].y, "type":"card"})
			}
		}
	})

	socket.on("CommandWindowCreated", function(){
		CommandWindowConnectionObject[address.address] = socket

		socket.join("commandwindows")
		console.log("Command window has been created");

	})

/*
	socket.on("JoinLobby", function(){
		MasterConnectionObject[address.address + ":" + address.port].join("lobby")
		//sio.sockets.in("lobby").emit("RoomCounters", sio.sockets.manager.rooms)
		sio.sockets.emit("RoomCounters", sio.sockets.manager.rooms)
		console.log("**" + address.address + ":" + address.port + " has connected to the lobby");
	})

	socket.on("JoinRoom", function(data){
		//console.log("\n")
		//MasterConnectionObject[address.address + ":" + address.port].leave("lobby")
		MasterConnectionObject[address.address + ":" + address.port].join("room" + data.room)
		console.log(address.address + ":" + address.port + " has joined room " + data.room)
		sio.sockets.emit("RoomCounters", sio.sockets.manager.rooms)
		//sio.sockets.in("lobby").emit("RoomCounters", sio.sockets.manager.rooms)
	})
*/

	socket.on("LeaveRoom", function(){
		console.log(address.address + " has left a room, now which one... lulz")
	})

	socket.on('CreateObject', function(data){
		console.log("----------------")
		console.log(data)
		console.log("++++++++++++++++")


		switch(data.type){
			case "newdeck":
				console.log("THIS IS IN THE NEWDECK THING?")
				console.log(data.deck)
				//fs.readdir("C:\\AANode\\pictures\\" + data.deck, function(err, cards){

				var ObjectID = null
				if(IDReaperArray.length > 0){
					console.log(IDReaperArray + "<-- thisi s the id reaper array")
					ObjectID = IDReaperArray.splice(0,1)}
				else{
					ObjectID = UniqueIDCounter
					UniqueIDCounter = UniqueIDCounter + 1
				}

				fs.readdir(data.deck, function(err, cards){
					var CardsNoDirectories = []
					var ReplacePathFowardSlash = (data.deck).replace(/\\/g, "/")
					ReplacePathFowardSlash  = ReplacePathFowardSlash.replace("C:/AANode", "")
					for(var i = 0; i < cards.length; ++i)
					{
						if(cards[i].indexOf(".jpg") == cards[i].length - 4 || cards[i].indexOf(".png") == cards[i].length - 4 || cards[i].indexOf(".bmp") == cards[i].length - 4){
							CardsNoDirectories.push(ReplacePathFowardSlash + "/" + cards[i])
							//cards[i] = ReplacePathFowardSlash + "/" + cards[i]
						}
					}
					cards = shuffle(cards)

					MasterCardAndDeckStateObject[ObjectID] = new DeckOrCardObject()
					MasterCardAndDeckStateObject[ObjectID].cardarray = CardsNoDirectories
					MasterCardAndDeckStateObject[ObjectID].deck = 1
					MasterCardAndDeckStateObject[ObjectID].x = "0px"
					MasterCardAndDeckStateObject[ObjectID].y = "200px"
					console.log(MasterCardAndDeckStateObject)
					sio.sockets.in("mainwindows").emit("CreateObject", {"ObjectID":ObjectID, "ObjectSrc":data.deck, "x":"0px", "y":"200px", "type":"deck"})
					//sio.sockets.emit("CreateObject", {"ObjectID":ObjectID, "ObjectSrc":data.deck, "x":"0px", "y":"200px", "type":"deck"})
					//GameWindowConnectionObject[address.address].emit("CreateObject", {"ObjectID":ObjectID, "ObjectSrc":data.deck, "x":"0px", "y":"200px", "type":"deck"})
				})
				break

			case "newcard":
					var ObjectID = null
					if(IDReaperArray.length > 0){
						console.log(IDReaperArray + "<-- thisi s the id reaper array")
						ObjectID = IDReaperArray.splice(0,1)}
					else{
						ObjectID = UniqueIDCounter
						UniqueIDCounter = UniqueIDCounter + 1
					}

					var ReplacePathFowardSlash = (data.src).replace(/\\/g, "/")
					ReplacePathFowardSlash  = ReplacePathFowardSlash.replace("C:/AANode", "")
					MasterCardAndDeckStateObject[ObjectID] = new DeckOrCardObject()
					MasterCardAndDeckStateObject[ObjectID].deck = 0
					MasterCardAndDeckStateObject[ObjectID].x = "0px"
					MasterCardAndDeckStateObject[ObjectID].y = "0px"
					console.log("This hit the new card case!")
					sio.sockets.in("mainwindows").emit("CreateObject", {"ObjectSrc":ReplacePathFowardSlash, "ObjectID":ObjectID, "x":MasterCardAndDeckStateObject[ObjectID].x, "y":MasterCardAndDeckStateObject[ObjectID].y})

				break
			case "drawboard":
				var CDObject = MasterCardAndDeckStateObject[GameWindowConnectionObject[address.address].BoundDeckObject]
				console.log(CDObject + "<-- this is the CDObject")
				console.log(CDObject + "<-- this is the CDObject")
				if(CDObject.cardarray.length > 0){

					var ObjectID = null
					if(IDReaperArray.length > 0){
						console.log(IDReaperArray + "<-- thisi s the id reaper array")
						ObjectID = IDReaperArray.splice(0,1)}
					else{
						ObjectID = UniqueIDCounter
						UniqueIDCounter = UniqueIDCounter + 1
					}
					MasterCardAndDeckStateObject[ObjectID] = new DeckOrCardObject()
					MasterCardAndDeckStateObject[ObjectID].deck = 0
					MasterCardAndDeckStateObject[ObjectID].x = (Number((CDObject.x).replace("px", "")) + 360) + "px"
					MasterCardAndDeckStateObject[ObjectID].y = Number((CDObject.y).replace("px", "")) + "px"
					//sio.sockets.emit("CreateObject", {"ObjectSrc":CDObject.cardarray[0], "ObjectID":ObjectID, "x":MasterCardAndDeckStateObject[ObjectID].x, "y":MasterCardAndDeckStateObject[ObjectID].y, "type":"card"})
					sio.sockets.in("mainwindows").emit("CreateObject", {"ObjectSrc":CDObject.cardarray[0], "ObjectID":ObjectID, "x":MasterCardAndDeckStateObject[ObjectID].x, "y":MasterCardAndDeckStateObject[ObjectID].y})
					//GameWindowConnectionObject[address.address].emit("CreateObject", {"ObjectSrc":CDObject.cardarray[0], "ObjectID":ObjectID, "x":MasterCardAndDeckStateObject[ObjectID].x, "y":MasterCardAndDeckStateObject[ObjectID].y, "type":"card"})
					MasterCardAndDeckStateObject[ObjectID].cardarray = CDObject.cardarray.splice(0,1)
				}
				break
			case "drawhand":
				var CDObject = MasterCardAndDeckStateObject[GameWindowConnectionObject[address.address].BoundDeckObject]
				console.log(CDObject + "<-- this is the CDObject")
				if(CDObject.cardarray.length > 0){

					var ObjectID = null
					if(IDReaperArray.length > 0){
						console.log(IDReaperArray + "<-- thisi s the id reaper array")
						ObjectID = IDReaperArray.splice(0,1)}
					else{
						ObjectID = UniqueIDCounter
						UniqueIDCounter = UniqueIDCounter + 1
					}
					MasterCardAndDeckStateObject[ObjectID] = new DeckOrCardObject()
					MasterCardAndDeckStateObject[ObjectID].deck = 0
					MasterCardAndDeckStateObject[ObjectID].x = "0px"
					MasterCardAndDeckStateObject[ObjectID].y = "0px"
					HandWindowConnectionObject[address.address].emit("CreateObject", {"ObjectSrc":MasterCardAndDeckStateObject[data.ObjectID].cardarray[0], "ObjectID":ObjectID, "x":MasterCardAndDeckStateObject[ObjectID].x, "y":MasterCardAndDeckStateObject[ObjectID].y})
					MasterCardAndDeckStateObject[ObjectID].cardarray = CDObject.cardarray.splice(0,1)
					MasterCardAndDeckStateObject[ObjectID].owner = address.address
				}
				break
			case "boardtohand":
				sio.sockets.in("mainwindows").emit("DeleteObject", {"ObjectSrc":data.ObjectSrc, "ObjectID":data.ObjectID})
				MasterCardAndDeckStateObject[data.ObjectID].owner = address.address
				HandWindowConnectionObject[address.address].emit("CreateObject", {"ObjectSrc":data.ObjectSrc, "ObjectID":data.ObjectID})
				break
			case "handtoboard":
				//HandWindowConnectionObject[address.address].emit("DeleteObject", {"ObjectSrc":data.ObjectSrc, "ObjectID":data.ObjectID})
				MasterCardAndDeckStateObject[data.ObjectID].owner = null
				sio.sockets.in("mainwindows").emit("CreateObject", {"ObjectSrc":data.ObjectSrc, "ObjectID":data.ObjectID})
				break
		}
    })

	socket.on("PositionDeck", function(data){
		if(typeof(MasterCardAndDeckStateObject[data.DeckID]) === "object" && MasterCardAndDeckStateObject[data.DeckID] != null)
		{
			console.log("WHat is going on in this position deck in server?!? this is the deck ID -->" + data.DeckID)
			console.log(MasterCardAndDeckStateObject)
			MasterCardAndDeckStateObject[data.DeckID].x = data.x
			MasterCardAndDeckStateObject[data.DeckID].y = data.y
			sio.sockets.in("mainwindows").emit("PositionDeck", {"DeckID":data.DeckID, "x": data.x, "y": data.y})
		}
	})

	socket.on("PositionCardHand", function(data){
		console.log(MasterCardAndDeckStateObject)
		if(MasterCardAndDeckStateObject[data.DeckID] != "undefined"){
			MasterCardAndDeckStateObject[data.DeckID].x = data.x
			MasterCardAndDeckStateObject[data.DeckID].y = data.y
		}
		//socket.broadcast.emit("PositionDeck", {"DeckID":data.DeckID, "x": data.x, "y": data.y})
	})

	socket.on("UpdateCounterDiv", function(data){
		console.log(data.ObjectID + "<-- this is the object ID")
		console.log(data.Quantity + "<-- this is the update value")
		sio.sockets.in("mainwindows").emit("UpdateCounterDiv", {"ObjectID":data.ObjectID, "Quantity":data.Quantity})
	})

	socket.on("ShuffleDeck", function(data){
		console.log("Shuffling deck with deck ID =" + GameWindowConnectionObject[address.address].BoundDeckObject)
		console.log(MasterCardAndDeckStateObject)
		console.log("\n")
		MasterCardAndDeckStateObject[GameWindowConnectionObject[address.address].BoundDeckObject].cardarray = shuffle(MasterCardAndDeckStateObject[GameWindowConnectionObject[address.address].BoundDeckObject].cardarray)
		console.log(MasterCardAndDeckStateObject)
	})

	socket.on("FlipCard", function(data){
		console.log("Flip card called")
		console.log(MasterCardAndDeckStateObject[data.ObjectID].facedown + "<--this fuck is this face down flag?!? called")
		if(MasterCardAndDeckStateObject[data.ObjectID].facedown == 1){
			console.log("Flip card up!")
			sio.sockets.in("mainwindows").emit("FlipCardUp", {"ObjectID":data.ObjectID})
			MasterCardAndDeckStateObject[data.ObjectID].facedown = 0
			return
		}

		if(MasterCardAndDeckStateObject[data.ObjectID].facedown == 0 || MasterCardAndDeckStateObject[data.ObjectID].facedown == null){
			console.log("Flip card down!")
			sio.sockets.in("mainwindows").emit("FlipCardDown", {"ObjectID":data.ObjectID})
			MasterCardAndDeckStateObject[data.ObjectID].facedown = 1
			return
		}
	})


	socket.on("AddToDeck", function(data){
		console.log(MasterCardAndDeckStateObject)
		console.log("\n")
		console.log(data.Key +"<-- This is the key!")
		switch(data.Key){
			case "a": //add to deck and shuffle
				MasterCardAndDeckStateObject[GameWindowConnectionObject[address.address].BoundDeckObject].cardarray.push(data.ObjectSrc)
				MasterCardAndDeckStateObject[GameWindowConnectionObject[address.address].BoundDeckObject].cardarray = shuffle(MasterCardAndDeckStateObject[GameWindowConnectionObject[address.address].BoundDeckObject].cardarray)
				break
			case "t": //place card on top of deck
				MasterCardAndDeckStateObject[GameWindowConnectionObject[address.address].BoundDeckObject].cardarray.unshift(data.ObjectSrc)
				break
			case "m": //place card on bottom of deck
				MasterCardAndDeckStateObject[GameWindowConnectionObject[address.address].BoundDeckObject].cardarray.push(data.ObjectSrc)
				break
		}

		delete MasterCardAndDeckStateObject[data.ObjectID]
		IDReaperArray.push(data.ObjectID)
		console.log(MasterCardAndDeckStateObject)
		sio.sockets.emit("DeleteObject", {"ObjectID":data.ObjectID})
	})

	socket.on("CurrentBoundDeckObject", function(data)
	{
		GameWindowConnectionObject[address.address].BoundDeckObject = data.DeckID
		console.log(data.DeckID + "<--- THIS IS CURRENTLY BOUND DECK!!!")
		console.log(GameWindowConnectionObject[address.address].BoundDeckObject + "<-- this is the bound deck object for the player connection")
	})


	socket.on("DeleteObject", function(data){
		console.log(MasterCardAndDeckStateObject)
		delete MasterCardAndDeckStateObject[data.ObjectID]
		IDReaperArray.push(data.ObjectID)
		//This will send the delete object command to all windows, this isn't a problem because the hand windows do not have a "DeleteObject" method, but the code is bad
		sio.sockets.emit("DeleteObject", {"ObjectID":data.ObjectID})
		console.log(MasterCardAndDeckStateObject)
	})

	socket.on("login", function(data){
		console.log("This has hit the login with ->" + data.name)
		if(data.name in ConnectedUserObject){
			if(ConnectedUserObject[data.name] == 1){
				sio.sockets.in("commandwindows").emit("CommandWindowUpdate", {"UpdateString":data.name + " is already taken.", "type":"function"})
			}

			if(ConnectedUserObject[data.name] == 0){
				socket.emit("login", {"name":data.name})
				ConnectedUserObject[data.name] = 1
				ConnectedUserObject[data.oldname] = 0
				sio.sockets.in("commandwindows").emit("CommandWindowUpdate", {"UpdateString":data.name + " has logged in.", "type":"function"})
				sio.sockets.in("commandwindows").emit("CommandWindowUpdate", {"UpdateString":data.oldname + " has logged out.", "type":"function"})
			}
		}else{
			console.log("Object not in the shit! ->" + data.name)
			ConnectedUserObject[data.name] = 1
			ConnectedUserObject[data.oldname] = 0
			socket.emit("login", {"name":data.name})
			sio.sockets.in("commandwindows").emit("CommandWindowUpdate", {"UpdateString":data.name + " has logged in.", "type":"function"})
		}

	})

	socket.on("logout", function(data){
		sio.sockets.in("commandwindows").emit("CommandWindowUpdate", {"UpdateString":data.oldname + " has logged out.", "type":"function"})
		if(data.name in ConnectedUserObject){
			ConnectedUserObject[data.name] = 0
		}
	})

	socket.on("Clear", function(){
		console.log("This has hit the clear functionality!")
		for(key in MasterCardAndDeckStateObject){
			console.log("is something wrong with the foreach loop?")
			IDReaperArray.push(key)
			if(MasterCardAndDeckStateObject[key].owner == null){
				socket.broadcast.to("mainwindows").emit("DeleteObject", {"ObjectID":key})
			}else{
				socket.broadcast.to("handwindows").emit("DeleteObject", {"ObjectID":key})
			}
			delete MasterCardAndDeckStateObject[key]
		}
		console.log(MasterCardAndDeckStateObject + "<-- this is master object after clear")
	})

	socket.on("CommandWindowUpdate", function(data){
		console.log(data.UpdateString + "<-- this is the command line")
		sio.sockets.in("commandwindows").emit("CommandWindowUpdate", {"UpdateString":data.UpdateString, "type":data.type})
		//socket.broadcast.to("commandwindows").emit("CommandWindowUpdate", {"UpdateString":data.UpdateString, "type":data.type})

	})

	socket.on("GetDirectoryStructure", function(){
		socket.emit("DirectoryStructure", {"DirectoryStructure": DirectoryStructureObject})
	})
	/*
	//This is called when the client starts, it looks through the deck folder and gathers up all the directory names and card names, this info is passed to the client which then
	//creates a button that can be used to view the decks of cards
	socket.on("PopulateDecks", function(){
		var PopulateDecksString = ""
		fs.readdir("C:\\AANode\\pictures", function(err, files){

			console.log(files.length + "<-- this is the FILES LENGTH THIS HAS TO BE SOMETHIGN!")
			for(var i = 0; i<files.length; ++i)
			{
				(function(i) {
					console.log("--> this is I " + i)
					var cards = fs.readdir("C:\\AANode\\pictures\\" + files[i], function(err, cards){
						PopulateDecksString = PopulateDecksString + files[i] + ","
						console.log(PopulateDecksString + "<- this is the populate decks string")
						PopulateDecksString = PopulateDecksString + cards.length + "," + cards.join() + ";";
						//ReturnArray.push(files[i], cards.length)
						//ReturnArray = ReturnArray.concat(cards);
						//ReturnArray.push(":")
						//console.log(i + "<-- this is i inside other asynch")
						//console.log(PopulateDecksString + "<- this is the populate decks string")

					if(i == (files.length-1))
					{
						//console.log(ReturnArray)
						//console.log(ReturnArray.length + "<-- this is the return array length")
						//console.log(PopulateDecksString + "<-- this is the passed string")
						//PopulateDecksString = PopulateDecksString.slice(0, PopulateDecksString.length - 1)
						//console.log(PopulateDecksString + "<-- this is the populate decks string")
						socket.emit('DecksDir', PopulateDecksString);

					}


					})
					//console.log(files[i] + "<--- this is the files I TRUE!!!!")
					//console.log(i + "<--- this is I TRUE!!!!")
					//console.log(files.length + "<-- this is the files length")

				})(i)
			}

		})
	})
*/
})

	console.log("Server has started.");
}

function PopulateDirectoryStructure(BaseDirectories){
	//$CurrentDirectoryFileIteration = ""
	console.log("STARTING ITERATION-----------------")

	Directories = BaseDirectories.split(",")
	console.log(BaseDirectories)
	//console.log(Directories)

	DirectoryPassString = ""
	for(var i = 0; i < Directories.length; ++i)
	{
		FilesString = ""
		DirectoryString = ""

		DirectoryReturnArray = fs.readdirSync(Directories[i])
		console.log(DirectoryReturnArray)
		for(j = 0; j<DirectoryReturnArray.length; ++j)
		{
			StatObject = fs.statSync(Directories[i] + "\\" + DirectoryReturnArray[j])

			if(StatObject.isFile()){
				//FilesString = FilesString + Directories[i] + "\\" + DirectoryReturnArray[j] + ","
				FilesString = FilesString + DirectoryReturnArray[j] + ","
			}

			if(StatObject.isDirectory()){
				DirectoryPassString = DirectoryPassString + Directories[i] + "\\" + DirectoryReturnArray[j] + ","
				DirectoryString = DirectoryString + DirectoryReturnArray[j] + ","
			}
		}

		FilesString = FilesString.substring(0, (FilesString.length - 1))
		DirectoryString = DirectoryString.substring(0, (DirectoryString.length - 1))


		/*
		console.log("--------")
		console.log(FilesString)
		console.log(DirectoryString)
		console.log(DirectoryPassString)
		console.log("++++++++")
		*/
		DirectoryStructureObject[Directories[i]] = DirectoryString + ";" + FilesString
	}

	DirectoryPassString = DirectoryPassString.substring(0, (DirectoryPassString.length - 1))
	console.log("-&&&&&&&&&&&&&&-")
	console.log(DirectoryPassString)
	console.log("ENDING ITERATION-----------------")
	if(DirectoryPassString.length > 0){
		PopulateDirectoryStructure(DirectoryPassString)
	}

}

function shuffle(array) {
  var m = array.length, t, i;

  // While there remain elements to shuffle…
  while (m) {

    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);

    // And swap it with the current element.
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }

  return array;
}

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

exports.start = start;