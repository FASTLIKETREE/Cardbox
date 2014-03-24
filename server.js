var http = require("http");
var url = require("url");
var fs = require("fs");
var io = require("C:\\Program Files\\nodejs\\node_modules\\socket.io")
var qs = require("querystring")

GameWindowConnectionObject = {};
HandWindowConnectionObject = {};
CommandWindowConnectionObject = {};
DirectoryStructureObject = {};

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
	server.listen(80)


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
		var CDObject = MasterCardAndDeckStateObject[GameWindowConnectionObject[address.address].BoundDeckObject]
		console.log(CDObject + "<-- this is the CDObject")

		var ObjectID = null
		if(IDReaperArray.length > 0){
			console.log(IDReaperArray + "<-- thisi s the id reaper array")
			ObjectID = IDReaperArray.splice(0,1)}
		else{
			ObjectID = UniqueIDCounter
			UniqueIDCounter = UniqueIDCounter + 1
		}

		switch(data.type){
			case "newdeck":
				console.log("THIS IS IN THE NEWDECK THING?")
				fs.readdir("C:\\AANode\\pictures\\" + data.deck, function(err, cards){
					cards = shuffle(cards)
					for(var i = 0; i < cards.length; ++i)
					{
						cards[i] = "/pictures/" + data.deck + "/" + cards[i]
					}

					MasterCardAndDeckStateObject[ObjectID] = new DeckOrCardObject()
					MasterCardAndDeckStateObject[ObjectID].cardarray = cards
					MasterCardAndDeckStateObject[ObjectID].deck = 1
					MasterCardAndDeckStateObject[ObjectID].x = "0px"
					MasterCardAndDeckStateObject[ObjectID].y = "200px"
					console.log(MasterCardAndDeckStateObject)
					sio.sockets.in("mainwindows").emit("CreateObject", {"ObjectID":ObjectID, "ObjectSrc":data.deck, "x":"0px", "y":"200px", "type":"deck"})
					//sio.sockets.emit("CreateObject", {"ObjectID":ObjectID, "ObjectSrc":data.deck, "x":"0px", "y":"200px", "type":"deck"})
					//GameWindowConnectionObject[address.address].emit("CreateObject", {"ObjectID":ObjectID, "ObjectSrc":data.deck, "x":"0px", "y":"200px", "type":"deck"})
				})
				break
			case "drawboard":
				console.log(CDObject + "<-- this is the CDObject")
				if(CDObject.cardarray.length > 0){
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
				if(CDObject.cardarray.length > 0){
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
			console.log(MasterCardAndDeckStateObject)
			MasterCardAndDeckStateObject[data.DeckID].x = data.x
			MasterCardAndDeckStateObject[data.DeckID].y = data.y
			socket.broadcast.emit("PositionDeck", {"DeckID":data.DeckID, "x": data.x, "y": data.y})
		}
	})

	socket.on("PositionCardHand", function(data){
		console.log(MasterCardAndDeckStateObject)
		MasterCardAndDeckStateObject[data.DeckID].x = data.x
		MasterCardAndDeckStateObject[data.DeckID].y = data.y
		//socket.broadcast.emit("PositionDeck", {"DeckID":data.DeckID, "x": data.x, "y": data.y})
	})

	socket.on("ShuffleDeck", function(data){
		console.log("Shuffling deck with deck ID =" + GameWindowConnectionObject[address.address].BoundDeckObject)
		console.log(MasterCardAndDeckStateObject)
		console.log("\n")
		MasterCardAndDeckStateObject[GameWindowConnectionObject[address.address].BoundDeckObject].cardarray = shuffle(MasterCardAndDeckStateObject[GameWindowConnectionObject[address.address].BoundDeckObject].cardarray)
		console.log(MasterCardAndDeckStateObject)
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

	socket.on("CommandLineSend", function(data){
		console.log(data.CommandLineRaw + "<-- this is the command line")
		//console.log(io.sockets.manager.rooms)
		//socket.broadcast.to("commandwindows").emit("CommandLineRecv", {"CommandlineRaw":data.CommandLineRaw})
		socket.broadcast.to("commandwindows").emit("CommandLineRecv", {"CommandlineRaw":data.CommandLineRaw})
		//socket.emit("CommandLineRecv", {"CommandlineRaw":data.CommandLineRaw})
	})

	socket.on("GetDirectoryStructure", function(){
		socket.emit("DirectoryStructure", {"DirectoryStructure": DirectoryStructureObject})
	})
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

})

	console.log("Server has started.");
}

function PopulateDirectoryStructure(BaseDirectories){
	//$CurrentDirectoryFileIteration = ""
	console.log("STARTING ITERATION-----------------")

	Directories = BaseDirectories.split(",")
	console.log(BaseDirectories)
	console.log(Directories)
	for(var i = 0; i < Directories.length; ++i)
	{
		FilesString = ""
		DirectoryString = ""
		DirectoryPassString = ""

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
		DirectoryPassString = DirectoryPassString.substring(0, (DirectoryPassString.length - 1))

		console.log("--------")
		console.log(FilesString)
		console.log(DirectoryString)
		console.log(DirectoryPassString)
		console.log("++++++++")

		DirectoryStructureObject[Directories[i]] = DirectoryString + ";" + FilesString
	}
	console.log(DirectoryStructureObject)
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