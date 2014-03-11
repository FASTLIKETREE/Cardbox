var http = require("http");
var url = require("url");
var fs = require("fs");
var io = require("C:\\Program Files\\nodejs\\node_modules\\socket.io")
var qs = require("querystring")

MasterConnectionObject = {};

GameWindowConnectionObject = {};
HandWindowConnectionObject = {};


MasterDeckArray = [];
MasterCardAndDeckStateObject = {}

//Likely the main deck array needs to be replaced by an object, whos values are objects which are composed of 5 elements
//1 An array that describes either the single card, or all of the cards in a deck

//3 The room the card belong to
//4 The x position
//5 The y position
//6 The number of card elements in the array


CurrentlySelectedDeckID = -1
UniqueIDCounter = 1
RoomCount = 0
function DeckOrCardObject()
{
	this.x = null
	this.y = null
	this.room = null
	this.cardarray = null
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
	server.listen(80);



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
		console.log("Main Window has been created");
	})

	socket.on("HandWindowCreated", function(){
		HandWindowConnectionObject[address.address] = socket
		console.log("Hand Window has been created");
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

	socket.on('CreateDeck', function(data){
		console.log("----------------")
		console.log(data)
		console.log(data.deck)
		fs.readdir("C:\\AANode\\pictures\\" + data.deck, function(err, cards){
			cards = shuffle(cards)
			for(var i = 0; i < cards.length; ++i)
			{
				cards[i] = "/pictures/" + data.deck + "/" + cards[i]
			}
			cards.unshift(UniqueIDCounter)

			MasterDeckArray.push(cards)
			MasterCardAndDeckStateObject[UniqueIDCounter] = new DeckOrCardObject()
			console.log(MasterDeckArray)
			sio.sockets.emit("DeckID", {"DeckID":UniqueIDCounter, "DeckName":data.deck})
			UniqueIDCounter = UniqueIDCounter + 1
			console.log("----------------")
		})
		socket.emit("TestBothSockets", {"Number":"What"})
    })

	socket.on("DrawCard", function(data){
		for(var i = 0; i < MasterDeckArray.length; ++i)
		{
			if(MasterDeckArray[i][0] == data.DeckID)
			{
				if(MasterDeckArray[i].length > 1)
				{
					sio.sockets.emit("DrawCard", {"CardName":MasterDeckArray[i][1], "CardID":UniqueIDCounter})
					UniqueIDCounter = UniqueIDCounter + 1
					MasterDeckArray[i].splice(1,1)
					console.log(MasterDeckArray)
					break
				}
			}
		}
		console.log(data)
		console.log(data.DeckID)
	})

	socket.on("ToBoard", function(data){
		console.log("To BOARD CALLED!!" + data.CardID)
		UniqueIDCounter = UniqueIDCounter + 1
		//MasterConnectionObject[address.address].emit("ToBoard", {"CardName":data.CardName, "CardID":UniqueIDCounter})
		sio.sockets.emit("ToBoard", {"CardName":data.CardName, "CardID":UniqueIDCounter})
	})

	socket.on("GrabCard", function(data){
		console.log("Grab card to hand called!!!" + data.CardID)
		console.log("Grab card to hand called!!!" + data.CardSRC)
		console.log(address.address)
		sio.sockets.emit("GrabCard", {"CardSRC":data.CardSRC, "CardID":data.CardID})
		//MasterConnectionObject[address.address + ":" + address.port].emit("GrabCardToHand", {"CardSRC":data.CardSRC, "CardID":data.CardID})
		HandWindowConnectionObject[address.address].emit("GrabCardToHand", {"CardSRC":data.CardSRC, "CardID":data.CardID})
	})

	socket.on("DrawCardHand", function(data){
		for(var i = 0; i < MasterDeckArray.length; ++i)
		{
			if(MasterDeckArray[i][0] == data.DeckID)
			{
				if(MasterDeckArray[i].length > 1)
				{

					//MasterConnectionObject[address.address + ":" + address.port].emit("DrawCardHand", {"DrawCard":MasterDeckArray[i][1]})
					HandWindowConnectionObject[address.address].emit("DrawCardHand", {"DrawCard":MasterDeckArray[i][1]})
					//PopupPageSocket.emit("popup", {"DrawCard":MasterDeckArray[i][1]})
					//socket.broadcast.emit("popup", {"DrawCard":MasterDeckArray[i][1]})
					MasterDeckArray[i].splice(1,1)
					console.log(MasterDeckArray)
					break
				}
			}
		}
		console.log(data)
		console.log(data.DeckID)
	})

	socket.on("PositionDeck", function(data){
		//console.log("DeckID:" + data.DeckID)
		//console.log("x:" + data.x)
		//console.log("y:" + data.y)
		socket.broadcast.emit("PositionDeck", {"DeckID":data.DeckID, "x": data.x, "y": data.y})
	})

	socket.on("ShuffleDeck", function(data){
		for(var i = 0; i < MasterDeckArray.length; ++i)
		{
			if(MasterDeckArray[i][0] == data.DeckID)
			{
				console.log("Shuffling deck with deck ID =" + data.DeckID)
				//console.log(MasterDeckArray[i])
				MasterDeckArray[i].splice(0,1)
				MasterDeckArray[i] = shuffle(MasterDeckArray[i])
				MasterDeckArray[i].unshift(data.DeckID)
				//console.log(MasterDeckArray[i])
			}
		}
	})


	socket.on("AddDeckActiveCardAndShuffle", function(data){
		for(var i = 0; i < MasterDeckArray.length; ++i)
		{
			if(MasterDeckArray[i][0] == data.DeckID)
			{
				console.log("Adding to top of deck =" + data.DeckID)
				console.log(MasterDeckArray[i])
				MasterDeckArray[i].push(data.CardID)
				MasterDeckArray[i].splice(0,1)
				MasterDeckArray[i] = shuffle(MasterDeckArray[i])
				MasterDeckArray[i].unshift(data.DeckID)
				console.log(MasterDeckArray[i])
			}
		}
	})


	socket.on("TopDeckActiveCard", function(data){
		console.log(data.DeckID)
		console.log(data.CardID)
		console.log("LOOOK HERE CAREFULLY")
		for(var i = 0; i < MasterDeckArray.length; ++i)
		{
			if(MasterDeckArray[i][0] == data.DeckID)
			{
				console.log(MasterDeckArray[i])
				MasterDeckArray[i].splice(1, 0, data.CardID);
				console.log(MasterDeckArray[i])
			}
		}
	})

	socket.on("BottomDeckActiveCard", function(data){
		for(var i = 0; i < MasterDeckArray.length; ++i)
		{
			if(MasterDeckArray[i][0] == data.DeckID)
			{
				console.log(MasterDeckArray[i])
				MasterDeckArray[i].push(data.CardID)
				console.log(MasterDeckArray[i])
			}
		}
	})

	socket.on("CurrentBoundDeckObject", function(data)
	{
		CurrentlySelectedDeckID = data.DeckID
		console.log(data.DeckID + "<--- THIS IS CURRENTLY BOUND DECK!!!")
	})

	socket.on("AddDeckActiveCardAndShuffleFromHand", function(data){
		console.log(CurrentlySelectedDeckID + "<--- this is the current deck ID!!!")
		for(var i = 0; i < MasterDeckArray.length; ++i)
		{
			if(MasterDeckArray[i][0] == CurrentlySelectedDeckID)
			{
				console.log("Adding to top of deck =" + data.CardID)
				console.log(MasterDeckArray[i])
				MasterDeckArray[i].push(data.CardID)
				MasterDeckArray[i].splice(0,1)
				MasterDeckArray[i] = shuffle(MasterDeckArray[i])
				MasterDeckArray[i].unshift(CurrentlySelectedDeckID)
				console.log(MasterDeckArray[i])
			}
		}
	})


	socket.on("TopDeckActiveCardFromHand", function(data){
		for(var i = 0; i < MasterDeckArray.length; ++i)
		{
			if(MasterDeckArray[i][0] == CurrentlySelectedDeckID)
			{
				console.log(MasterDeckArray[i])
				MasterDeckArray[i].splice(1, 0, data.CardID);
				console.log(MasterDeckArray[i])
			}
		}
	})

	socket.on("BottomDeckActiveCardFromHand", function(data){
		for(var i = 0; i < MasterDeckArray.length; ++i)
		{
			if(MasterDeckArray[i][0] == CurrentlySelectedDeckID)
			{
				console.log(MasterDeckArray[i])
				MasterDeckArray[i].push(data.CardID)
				console.log(MasterDeckArray[i])
			}
		}
	})

	socket.on("DeleteBoundDeckObject", function(data){
		sio.sockets.emit("DeleteBoundDeckObject", {"DeckID":data.DeckID})
	})

	socket.on("DeleteActiveCardObject", function(data){
		sio.sockets.emit("DeleteActiveCardObject", {"CardID":data.CardID})
	})


	socket.on("DeleteDeck", function(data){
		console.log("We are about to delete a deck!")
		console.log(data)
		console.log(data.DeckID)
		var IndexToDelete
		for(var i = 0; i < MasterDeckArray.length; ++i)
		{
			if(MasterDeckArray[i][0] == data.DeckID)
			{
				IndexToDelete = i
				break;
			}
		}
		//This function will need to do something about the unique deck IDs and recyle them, always starting from 1 and counting up.
		MasterDeckArray.splice(IndexToDelete, 1)
		CurrentlySelectedDeckID = -1
		console.log(IndexToDelete + "<-- this is the index to delete")
		console.log(MasterDeckArray)
	})


	//This is called when the client starts, it looks through the deck folder and gathers up all the directory names and card names, this info is passed to the client which then
	//creates a button that can be used to view the decks of cards
	socket.on("PopulateDecks", function(){
		var PopulateDecksString = ""
		fs.readdir("C:\\AANode\\pictures", function(err, files){

			//console.log(files.length + "<-- this is the FILES LENGTH THIS HAS TO BE SOMETHIGN!")
			for(var i = 0; i<files.length; ++i)
			{


				(function(i) {
					console.log("-")
					var cards = fs.readdir("C:\\AANode\\pictures\\" + files[i], function(err, cards){
						PopulateDecksString = PopulateDecksString + files[i] + ","
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


function shuffle(array) {
  var m = array.length, t, i;

  // While there remain elements to shuffle�
  while (m) {

    // Pick a remaining element�
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