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
handle["/roomselect"] = requestHandlers.roomselect
handle["/commandwindow"] = requestHandlers.commandwindow
//handle["/Laboratory.png"] = requestHandlers.lab;


server.start(router.route, handle);