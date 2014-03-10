
<html>

<head>
<meta http-equiv="imagetoolbar" content="no" />
<title>Hand</title>

<link rel="stylesheet" type="text/css" href="menu.css" />
<script src="menu.js" type="text/javascript"></script>
<script src="dragdrop.js" type="text/javascript"></script>
<script src="functions.js" type="text/javascript"></script>

</head>

<body bgcolor="#ffffff" style="font-family:arial" onLoad='placeImages()'>

<div style="display:none" id="dummy">dummy</div>

<script type="text/javascript">

//Below here needs updating
 var scale=1;
try{scale=window.opener.handscale;}catch(err){};
var handnumber=2 //Don't forget to set different for different htmls

var father='dhand';
var takencard2='';
var takentime=100;
function placeImages(){
  newImage('occ-x1EmploymentAgent_4465_2-j','0','0','0',1,1);
var dothis=false;

try{
  if (window.opener.gameboard.father=='draft' && window.opener.gameboard.takencard!='' && window.opener.gameboard.takencard!=null && father=='dhand')
    dothis=true;
}catch(err){}

if (dothis){
  takencard2=window.opener.gameboard.takencard;
  //takentime=window.opener.gameboard.created;
  takentime=window.opener.gameboard.need2[handnumber];
  //alert('doing');
  newImage(takencard2,0,-2,-1);
}//Above here needs updating
  };

//window.onunload=window.opener.end2;

var bmenu=false;
try{window.opener.handloaded=true;}catch(err){};
try{document.title=window.opener.playernames[handnumber]+"'s Hand";}catch(err){};
//var father='hand';
var mycolor='red';
try{mycolor=window.opener.playercolors[handnumber];}catch(err){};
var readyfornewkey=true;
var ie4=document.all;
var ns6=document.getElementById&&!document.all;
if (ie4) document.body.onkeydown=processKeys; //for ie4
else if (ns6) window.onkeydown=processKeys; // for ns6 send firefox browser keyboard hotkeys to my method

function processKeys(e){
  if (readyfornewkey){ //prevent double call
    readyfornewkey=false;
    setTimeout('readyfornewkey=true;',1);
    if (!e) e=window.event;
    var char=e.keyCode;
    var disablekey=false;
    //alert(char);
    if (char==173 || char==189 || char==188) char=109; //convert IE's minus to firefox minus (and <)
    else if (char==187 || char==107 || char==190) char=61;  //convert IE's plus to firefox plus (also >)
    switch (char){
      case 61: // '+'
        shrink(1.11);
        break;
      case 109: // '-'
        shrink(0.9);
        break;
    }
    //checkKey(char);
    if (disablekey) return false;
    else return true;
    }
  else return true; // else for readyfornewkey
}
function shrink(factor){
  scale*=factor;
  try{
   window.opener.handscale=scale;
   //window.opener.farmscale=scale;
  }catch(err){};
  var images=document.getElementsByTagName('img');
  var index,index2,identifier;
  for (i=0;i<images.length;i++){

  identifier=images[i].identifier;
  index=findIndex(sizes,identifier)+1;
  //if (index==0) alert("Can't find size width for "+identifier);

  index2=findIndex(sizes2,identifier)+1;
  //if (index2==0) alert("Can't find size height for "+identifier);

  if (identifier!='free'){
    images[i].style.height=sizes2[index2]*scale;
    images[i].style.width=sizes[index]*scale;
  }
  else{
    images[i].style.height=images[i].offsetHeight*factor;
    images[i].style.width=images[i].offsetWidth*factor;
  }

    images[i].xpos=images[i].xpos*factor;
    images[i].ypos=images[i].ypos*factor;
    images[i].style.left=images[i].xpos;
    images[i].style.top=images[i].ypos;


//    images[i].style.left=images[i].offsetLeft*factor;
//    images[i].style.top=images[i].offsetTop*factor;
    if (images[i].numbered){
      var imagediv=document.getElementById(images[i].id+'num');
      imagediv.xpos=imagediv.xpos*factor;
      imagediv.ypos=imagediv.ypos*factor;
      imagediv.style.left=imagediv.xpos;
      imagediv.style.top=imagediv.ypos;
//      imagediv.style.left=imagediv.offsetLeft*factor;
//      imagediv.style.top=imagediv.offsetTop*factor;
    }
  }
}

</script>


</body>

</html>