

/*<HEAD>*/
//Requires (in order): jquery.js, two.js, utils.js, polyman.js


var Rendered = false;

var generationOptions = {
    makeRotations: true,
    maxSideCount: 12
};

var renderOptions = {
    params: {
        fitted: true,
        type: Two.Types.SVG,
        autostart: true
    },
    element: document.getElementById("twojs"),
    showXAxis: true,
    showYAxis: true,
    showAreaCircle: true,
    boundingRadius: undefined, //how far away from origin rendering goes, aka 10000 from side to side (assuming square renderbox)
    QPCircleRadius: 1000, //how far away from origin quasiprime circle goes
    pathOptions: utils.two.DefaultPath
};

var twoObj = {
    two: new Two(renderOptions.params).appendTo(renderOptions.element),
    xAxis: undefined,
    yAxis: undefined,
    circle: new Two.Circle(0, 0, renderOptions.QPCircleRadius),
    rootGroup: null
};


function RenderPolygons() {//clears the scene, loads root two group from localStorage (or generates a root two group if localstorage empty), sets bounding radius, then adds to scene
    twoObj.two.clear();
    lsitem = utils.retrievePolysLocalStorage();
    if (lsitem == false) {
        lsitem = polyman.GetPolygons(utils.circleRadiusToArea(renderOptions.QPCircleRadius), utils.Origin, generationOptions.makeRotations, generationOptions.maxSideCount);
        utils.savePolysToLocalStorage(lsitem);
    }
    renderOptions.boundingRadius = lsitem[0].Polygons[0].Points[0].y; //finds y value for first point of first triangle, which should be the farthest point from center
    twoObj.rootGroup = polyman.getTwoRepresentation(lsitem, renderOptions.pathOptions);
    twoObj.two.add(twoObj.rootGroup);
}

/* fillRenderGroups(width, height) {
    this.renderPolys.twoGroup.translation.set(width / 2, height / 2); //translate coords for cartesian representation
    this.renderPolys.twoGroup.rotation = Math.PI;//Rotate 180 degrees for cartesian representation
    this.renderPolys.twoGroup.scale = height / 2 / (this.renderRadius * 3); //fit to page
} */

function Render() {
    //twoObj.two.scene.translation.set(twoObj.two.width / 2, twoObj.two.height / 2); //translate coords for cartesian representation
    twoObj.two.scene.rotation = Math.PI;//Rotate 180 degrees for cartesian representation
    //two.scene.scale = height / 2 / (this.renderRadius * 3); //fit to page
    
    RenderPolygons();//clears scene then adds root two polygon group to scene
    twoObj.two.scene.scale = twoObj.two.height / 2 / (renderOptions.boundingRadius); //fit to page, should work
    twoObj.xAxis = new Two.Line(-(renderOptions.boundingRadius), 0, renderOptions.boundingRadius, 0);
    twoObj.yAxis = new Two.Line(0, renderOptions.boundingRadius, 0, -(renderOptions.boundingRadius));

    twoObj.two.add(twoObj.xAxis);
    twoObj.two.add(twoObj.yAxis);
    twoObj.two.add(twoObj.circle);
    if (renderOptions.showXAxis) twoObj.xAxis.visible = true;
    else twoObj.xAxis.visible = false;
    if (renderOptions.showYAxis) twoObj.yAxis.visible = true;
    else twoObj.yAxis.visible = false;
    if (renderOptions.showAreaCircle) twoObj.circle.visible = true;
    else twoObj.circle.visible = false;
    twoObj.circle.noFill();

    addZUI();
    //twoObj.two.update();
    Rendered = true;
}
function zoom(){}
function resetRender() {

}


function addZUI() {

    var domElement = twoObj.two.renderer.domElement;
    var zui = new Two.ZUI(twoObj.two.scene);
    var mouse = new Two.Vector();
    var touches = {};
    var distance = 0;
    zui.translateSurface(twoObj.two.width / 2, twoObj.two.height / 2);
    zui.zoomSet(twoObj.two.height / 2 / (renderOptions.boundingRadius), twoObj.two.width / 2, twoObj.two.height / 2);
    zui.addLimits(0.1, 1);

    domElement.addEventListener('mousedown', mousedown, false);
    domElement.addEventListener('mousewheel', mousewheel, false);
    domElement.addEventListener('wheel', mousewheel, false);

    domElement.addEventListener('touchstart', touchstart, false);
    domElement.addEventListener('touchmove', touchmove, false);
    domElement.addEventListener('touchend', touchend, false);
    domElement.addEventListener('touchcancel', touchend, false);

    function mousedown(e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        window.addEventListener('mousemove', mousemove, false);
        window.addEventListener('mouseup', mouseup, false);
    }

    function mousemove(e) {
        var dx = e.clientX - mouse.x;
        var dy = e.clientY - mouse.y;

        zui.translateSurface(dx, dy);

        mouse.set(e.clientX, e.clientY);
    }

    function mouseup(e) {
        window.removeEventListener('mousemove', mousemove, false);
        window.removeEventListener('mouseup', mouseup, false);
    }

    function mousewheel(e) {
        var dy = (e.wheelDeltaY || - e.deltaY) / 2000;
        zui.zoomBy(dy, e.clientX/2, e.clientY/2);
    }

    function touchstart(e) {
        switch (e.touches.length) {
            case 2:
                pinchstart(e);
                break;
            case 1:
                panstart(e)
                break;
        }
    }

    function touchmove(e) {
        switch (e.touches.length) {
            case 2:
                pinchmove(e);
                break;
            case 1:
                panmove(e)
                break;
        }
    }

    function touchend(e) {
        touches = {};
        var touch = e.touches[0];
        if (touch) {  // Pass through for panning after pinching
            mouse.x = touch.clientX;
            mouse.y = touch.clientY;
        }
    }

    function panstart(e) {
        var touch = e.touches[0];
        mouse.x = touch.clientX;
        mouse.y = touch.clientY;
    }

    function panmove(e) {
        var touch = e.touches[0];
        var dx = touch.clientX - mouse.x;
        var dy = touch.clientY - mouse.y;
        zui.translateSurface(dx, dy);
        mouse.set(touch.clientX, touch.clientY);
    }

    function pinchstart(e) {
        for (var i = 0; i < e.touches.length; i++) {
            var touch = e.touches[i];
            touches[touch.identifier] = touch;
        }
        var a = touches[0];
        var b = touches[1];
        var dx = b.clientX - a.clientX;
        var dy = b.clientY - a.clientY;
        distance = Math.sqrt(dx * dx + dy * dy);
        mouse.x = dx / 2 + a.clientX;
        mouse.y = dy / 2 + a.clientY;
    }

    function pinchmove(e) {
        for (var i = 0; i < e.touches.length; i++) {
            var touch = e.touches[i];
            touches[touch.identifier] = touch;
        }
        var a = touches[0];
        var b = touches[1];
        var dx = b.clientX - a.clientX;
        var dy = b.clientY - a.clientY;
        var d = Math.sqrt(dx * dx + dy * dy);
        var delta = d - distance;
        zui.zoomBy(delta / 250, mouse.x, mouse.y);
        distance = d;
    }
}


(function () {

    // when we are ready then start up the main workflow
    //$(document).ready(workflow);
    $(document).ready(Render);
    $('#twojs').hover(function() {
        $(".content-wrapper").css("overflow","hidden");
    }, function() {
         $(".content-wrapper").css("overflow","auto");
    });
})();
/*</HEAD>*/
//
//
/*<BODY>*/

function workflow() {
    $("#grt")[0].oninput = updateRotationRender;
    $("#showXAxis")[0].oninput = updateXAxisRender;
    $("#showYAxis")[0].oninput = updateYAxisRender;
    $("#darkmodeTGL")[0].oninput = toggleDM;
}

/*</BODY>*/
//
//
/*<FOOT>*/

//Copyright Dekwan Perry 2021
/*</FOOT>*/


