var exec = require("child_process").exec;
var querystring = require("querystring");
var fs = require("fs");

function start(response, postData)
{
	console.log("Request handler for start was called");
	/*
	fs.readFile('./drawingProgram.html', function(error, drawingprogram){
		console.log(error);
		});

	var body = '<html>'+
	 '<head>'+
	 '<meta http-equiv="Content-Type" content="text/html; '+
	 'charset=UTF-8" />'+
	 '</head>'+
	 '<body>'+
	 '<form action="/upload" method="post">'+
	 '<textarea name="text" rows="20" cols="60"></textarea>'+
	 '<input type="submit" value="Submit text" />'+
	 '</form>'+
	 '</body>'+
	 '</html>';
	*/

	fs.readFile("C:/AANode/drawingProgram.html", "utf8", function(err, data) {
		//console.log(data)
	response.writeHead(200, {"Content-Type": "text/html"});
	response.write(data);
	response.end();
	});
}


function roomselect(response, postData)
{
	console.log("Request handler for start was called");
	fs.readFile("C:/AANode/RoomSelect.html", "utf8", function(err, data) {
	response.writeHead(200, {"Content-Type": "text/html"});
	response.write(data);
	response.end();
	});
}


function createhand(response, postData)
{
	console.log("Request handler for hand was called");
	fs.readFile("C:/AANode/CreateHand.html", "utf8", function(err, data) {
		//console.log(data)
	response.writeHead(200, {"Content-Type": "text/html"});
	response.write(data);
	response.end();
	});
}

function viewdeck(response, postData)
{
	console.log(postData + "<--- this is the post data")
	fs.readFile("C:/AANode/ViewDeckCards.html", "utf8", function(err, data) {
	response.writeHead(200, {"Content-Type": "text/html"});
	console.log(data + "<--- this is the data")
	console.log(err + "<-- this is the error")
	response.write(data);
	response.end();
	});
}

function upload(response, postData)
{
	console.log("Request handler for upload was called");
	response.writeHead(200, {"Content-Type": "text/plain"});
	response.write(querystring.parse(postData).text);
	response.end();
}

function pictures(response, postData)
{
	var FilePath = 'C:/AANode' + unescape(postData)
	var LabImage = fs.readFile(FilePath, function(error, data)
	{
		console.log("C:/AANode" + unescape(postData))
		response.writeHead(200, {'Content-Type': 'image/gif'});
		response.write(data, "binary");
		response.end();
	});
}

/*
function checkdeck(response, postData)
{
	console.log("we are in the pictures function with postdata ->" + postData)
	var LabImage = fs.readFile("C:/AANode" + postData, function(error, data)
	{
		console.log("DO WE EVER GET INTO THE CALL BACK FUNCTION?")
		response.writeHead(200, {'Content-Type': 'image/gif'});
		response.write(data, "binary");
		response.end();
	});
}
*/


function carddir(response, postData)
{
	fs.readdir(postData, function(err, files)
	{
		var reponseText = ""
		if(files.length > 0)
		{
			for(i = 0; i<files.length; ++i)
			{
				reponseText = reponseText + files[i] + ","
			}
			console.log("Request handler for carddir was called");
			console.log(reponseText + "<-- these are files in directory")
			response.writeHead(200, {"Content-Type": "text/plain"});
			response.write(reponseText);
			response.end();
		}
		else
		{
			console.log("This has found no files");
			response.writeHead(200, {"Content-Type": "text/plain"});
			response.write("No Files Found");
			response.end();
		}
	})
}

exports.roomselect = roomselect
exports.viewdeck = viewdeck;
exports.start = start;
exports.upload = upload;
exports.pictures = pictures;
exports.carddir = carddir;
exports.createhand = createhand;