//Requires (in order): jquery.js, geogebra.js, utils.js, polyman.js
var params = {"appName": "geometry", "width": 500, "height": 300, "showToolBar": true, "showAlgebraInput": true, "showMenuBar": true };
var applet = new GGBApplet(params, true);

var onLoad = function(){
    applet.inject('geogeb');//inject geogebra applet
}

window.onload = onLoad;
