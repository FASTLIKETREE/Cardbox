var http = require("http");
var url = require("url");
var fs = require("fs");
var io = require("C:\\Program Files\\nodejs\\node_modules\\socket.io")
var qs = require("querystring")

MasterConnectionObject = {};
GameWindowConnectionObject = {};
HandWindowConnectionObject = {};
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
function DeckOrCardObject()
{
	this.x = null
	this.y = null
	this.room = null
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
		var xRender = 0
		var yRender = 200

		console.log(data)
		console.log(data.deck)
		fs.readdir("C:\\AANode\\pictures\\" + data.deck, function(err, cards){
			cards = shuffle(cards)
			for(var i = 0; i < cards.length; ++i)
			{
				cards[i] = "/pictures/" + data.deck + "/" + cards[i]
			}

			MasterCardAndDeckStateObject[UniqueIDCounter] = new DeckOrCardObject()
			MasterCardAndDeckStateObject[UniqueIDCounter].cardarray = cards
			MasterCardAndDeckStateObject[UniqueIDCounter].x = xRender
			MasterCardAndDeckStateObject[UniqueIDCounter].y = yRender
			console.log(MasterCardAndDeckStateObject)
			//console.log(MasterCardAndDeckStateObject.cardarray)
			sio.sockets.emit("DeckID", {"DeckID":UniqueIDCounter, "DeckName":data.deck, "x":xRender, "y":yRender})
			UniqueIDCounter = UniqueIDCounter + 1
			console.log("----------------")
		})
    })

	socket.on("DrawCard", function(){
		console.log(MasterCardAndDeckStateObject)
		//MasterCardAndDeckStateObject[UniqueIDCounter] = new DeckOrCardObject()
		var CDObject = MasterCardAndDeckStateObject[GameWindowConnectionObject[address.address].BoundDeckObject]
		/*
		console.log(MasterCardAndDeckStateObject[GameWindowConnectionObject[address.address].BoundDeckObject].cardarray)
		console.log("----------")
		console.log(CDObject.x)
		console.log(Number((CDObject.x).replace("px", "")))
		console.log((Number((CDObject.x).replace("px", "")) + 360) + "px")
		console.log(Number((CDObject.y).replace("px", "")) + "px")
		*/
		if(CDObject.cardarray.length > 0)
		{
			MasterCardAndDeckStateObject[UniqueIDCounter] = new DeckOrCardObject()
			MasterCardAndDeckStateObject[UniqueIDCounter].x = (Number((CDObject.x).replace("px", "")) + 360) + "px"
			MasterCardAndDeckStateObject[UniqueIDCounter].y = Number((CDObject.y).replace("px", "")) + "px"
			sio.sockets.emit("DrawCard", {"CardSrc":CDObject.cardarray[0], "CardID":UniqueIDCounter, "x":MasterCardAndDeckStateObject[UniqueIDCounter].x, "y":MasterCardAndDeckStateObject[UniqueIDCounter].y})
			MasterCardAndDeckStateObject[UniqueIDCounter].cardarray = CDObject.cardarray.splice(0,1)
			console.log(MasterCardAndDeckStateObject)
			UniqueIDCounter = UniqueIDCounter + 1
		}
	})

	socket.on("DrawCardHand", function(data){
		var CDObject = MasterCardAndDeckStateObject[GameWindowConnectionObject[address.address].BoundDeckObject]
		if(CDObject.cardarray.length > 0)
		{
			MasterCardAndDeckStateObject[UniqueIDCounter] = new DeckOrCardObject()
			MasterCardAndDeckStateObject[UniqueIDCounter].x = "0px"
			MasterCardAndDeckStateObject[UniqueIDCounter].y = "0px"
			HandWindowConnectionObject[address.address].emit("CardToHand", {"CardSrc":MasterCardAndDeckStateObject[data.DeckID].cardarray[0], "CardID":UniqueIDCounter, "x":MasterCardAndDeckStateObject[UniqueIDCounter].x, "y":MasterCardAndDeckStateObject[UniqueIDCounter].y})
			MasterCardAndDeckStateObject[UniqueIDCounter].cardarray = CDObject.cardarray.splice(0,1)
			MasterCardAndDeckStateObject[UniqueIDCounter].owner = address.address
			//sio.sockets.emit("DeleteActiveCardObject", {"CardID":data.CardID})
			UniqueIDCounter = UniqueIDCounter + 1
		}
	})


	socket.on("ToBoard", function(data){
		console.log("To BOARD CALLED!!" + data.CardID)
		console.log("To BOARD CALLED!!" + data.CardSrc)
		console.log(MasterCardAndDeckStateObject)
		MasterCardAndDeckStateObject[data.CardID].owner = null
		sio.sockets.emit("ToBoard", {"CardSrc":data.CardSrc, "CardID":data.CardID})
	})

	socket.on("GrabCard", function(data){
		console.log("Grab card to hand called!!!" + data.CardID)
		console.log("Grab card to hand called!!!" + data.CardSRC)
		//sio.sockets.emit("GrabCard", {"CardSRC":data.CardSRC, "CardID":data.CardID})
		sio.sockets.emit("DeleteObject", {"CardSRC":data.CardSRC, "ObjectID":data.CardID})
		MasterCardAndDeckStateObject[data.CardID].owner = address.address
		HandWindowConnectionObject[address.address].emit("CardToHand", {"CardSrc":data.CardSRC, "CardID":data.CardID})
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
			case "a":
				MasterCardAndDeckStateObject[GameWindowConnectionObject[address.address].BoundDeckObject].cardarray.push(data.CardSrc)
				MasterCardAndDeckStateObject[GameWindowConnectionObject[address.address].BoundDeckObject].cardarray = shuffle(MasterCardAndDeckStateObject[GameWindowConnectionObject[address.address].BoundDeckObject].cardarray)
				break
			case "t":
				console.log("IS THIS GETTINGINTO THE T CODE?!?!?")
				MasterCardAndDeckStateObject[GameWindowConnectionObject[address.address].BoundDeckObject].cardarray.unshift(data.CardSrc)
				break
			case "m":
				MasterCardAndDeckStateObject[GameWindowConnectionObject[address.address].BoundDeckObject].cardarray.push(data.CardSrc)
				break
		}

		delete MasterCardAndDeckStateObject[data.CardID]
		IDReaperArray.push(data.CardID)
		console.log(MasterCardAndDeckStateObject)
		sio.sockets.emit("DeleteObject", {"ObjectID":data.CardID})
	})

	/*
	socket.on("TopDeckActiveCard", function(data){
		console.log(MasterCardAndDeckStateObject)
		console.log("\n")
		MasterCardAndDeckStateObject[GameWindowConnectionObject[address.address].BoundDeckObject].cardarray.unshift(data.CardSrc)

		delete MasterCardAndDeckStateObject[data.CardID]
		IDReaperArray.push(data.CardID)
		console.log(MasterCardAndDeckStateObject)
		sio.sockets.emit("DeleteObject", {"CardID":data.CardID})
	})

	socket.on("BottomDeckActiveCard", function(data){
		console.log(MasterCardAndDeckStateObject)
		console.log("\n")
		MasterCardAndDeckStateObject[GameWindowConnectionObject[address.address].BoundDeckObject].cardarray.push(data.CardSrc)

		delete MasterCardAndDeckStateObject[data.CardID]
		IDReaperArray.push(data.CardID)
		console.log(MasterCardAndDeckStateObject)
		sio.sockets.emit("DeleteObject", {"CardID":data.CardID})
	})
*/

	socket.on("CurrentBoundDeckObject", function(data)
	{
		GameWindowConnectionObject[address.address].BoundDeckObject = data.DeckID
		console.log(data.DeckID + "<--- THIS IS CURRENTLY BOUND DECK!!!")
		console.log(GameWindowConnectionObject[address.address].BoundDeckObject + "<-- this is the bound deck object for the player connection")
	})


//WHEN THE DELETE FUNCTIONS ARE CALLED WE NEED TO ADD THEIR UNIQUE IDs BACK INTO AN ARRAY THAT CAN BE CONSUMED LATER, NO
//REASON TO DIG THROUGH AN ARRAY FOR UNUSED IDS, JUST ADD THEM TO ANOTHER ARRAY/OBJECT AND SEARCH THROUGH THE REAPED ID ARRAY/OBJECT
/*
	socket.on("DeleteBoundDeckObject", function(data){
		sio.sockets.emit("DeleteBoundDeckObject", {"DeckID":data.DeckID})
	})

	socket.on("DeleteActiveCardObject", function(data){
		sio.sockets.emit("DeleteActiveCardObject", {"CardID":data.CardID})
	})
	*/

	socket.on("DeleteObject", function(data){
		console.log(MasterCardAndDeckStateObject)
		delete MasterCardAndDeckStateObject[data.ObjectID]
		sio.sockets.emit("DeleteObject", {"ObjectID":data.ObjectID})
		console.log(MasterCardAndDeckStateObject)
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