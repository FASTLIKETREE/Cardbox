<html>
<head>
<title>Dragdrop.js demo</title>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<link rel="stylesheet" type="text/css" href="demo.css">
</head>
<body class="advanced">

<div id="green" class="draggable">Green</div>
<div id="blue" class="draggable">Blue</div>
<div id="red" class="draggable">Red</div>
<div id="orange" class="draggable">Orange</div>
<div id="magenta" class="draggable">Magenta</div>
<div id="yellow" class="draggable">Yellow</div>
<div id="lightgreen" class="draggable">Light green</div>

<textarea id="info"></textarea>

<script type="text/javascript" src="Event.js"></script>
<script type="text/javascript" src="Dragdrop.js"></script>
<script>
"use strict";
var evt         = new Event(),
    dragdrop    = new Dragdrop(evt),
    info        = document.getElementById('info'),
    green       = document.getElementById('green'),
    blue        = document.getElementById('blue'),
    red         = document.getElementById('red'),
    orange      = document.getElementById('orange'),
    magenta     = document.getElementById('magenta'),
    yellow      = document.getElementById('yellow'),
    lightgreen  = document.getElementById('lightgreen'),
    message     = function (name, element) {
        var x = parseInt(element.style.left, 10),
            y = parseInt(element.style.top, 10);

        info.value += name + ': ' + element.id + ' at position ' + x + ',' + y + "\r\n";
        info.scrollTop = info.scrollHeight;
    },
    start       = function (element) {message('Started', element); },
    move        = function (element) {message('Moving', element); },
    stop        = function (element) {message('Stopped', element); };

dragdrop.set(green, {mode: 1, onstart: start, onmove: move, onstop: stop, snap: 72});
dragdrop.set(blue, {onstart: start, onmove: move, onstop: stop});
dragdrop.set(red, {onstart: start, onmove: move, onstop: stop});
dragdrop.set(orange, {onstart: start, onmove: move, onstop: stop});
dragdrop.set(magenta, {onstart: start, onmove: move, onstop: stop});
dragdrop.set(yellow, {onstart: start, onmove: move, onstop: stop, minX: 50, maxX: 350, minY: 50, maxY: 350});
dragdrop.set(lightgreen, {mode: 2, onstart: start, onmove: move, onstop: stop, snap: 18});
</script>
</body>
</html>