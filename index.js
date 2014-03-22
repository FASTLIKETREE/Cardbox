var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");

var handle = {}
handle["/"] = requestHandlers.start;
//handle["/"] = requestHandlers.roomselect;
handle["/upload"] = requestHandlers.upload;
handle["/game"] = requestHandlers.start;
handle["/picture"] = requestHandlers.pictures;
handle["/viewdeck"] = requestHandlers.viewdeck;
handle["/createhand"] = requestHandlers.createhand;
<<<<<<< HEAD
handle["/roomselect"] = requestHandlers.roomselect
handle["/commandwindow"] = requestHandlers.commandwindow
=======
handle["/roomselect"] = requestHandlers.roomselect;
handle["/commandwindow"] = requestHandlers.commandwindow;
>>>>>>> 7c544da38390b4e3aee90f041ddf977da83b82f3
//handle["/Laboratory.png"] = requestHandlers.lab;


server.start(router.route, handle);