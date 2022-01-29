/** 
 * Generate regular polygons
 * @module polyman
 * 
 * This class requires the module utils.js
 * @requires module:utils
*/
var polyman = new function(){//implement two.js display option for debugging purposes
    /**
     * Returns regular Polygon with given area, side count, and origin
     * @param {number} area Area of Polygon
     * @param {number} sidecount Amount of sides
     * @param {Point} origin Center Point
     * @returns {Polygon} Polygon with given area, side count, and origin
     */
    this.GetPolygon = function(area, sidecount, origin=utils.Origin) 
    {
        var points = new Array(); 
        var radius = utils.areaToRadius(area,sidecount);      //(float/double)
        var f = new utils.Point(0, radius); //first point{x=0,y=radius} 
        points.push(f);
        for (var i = 1; i < sidecount; i++)//point [0] already calculated, start at [1]
        {                                      
            var ang = 360 / sidecount;
            points.push(utils.Rotate(origin, points[i - 1], ang));

        }
        return new utils.Polygon(points);
    }
    /**
     * Returns Array of Polygon groups, each with polygons (and rotations) of given area starting at 3gon iterating until given side count
     * @param {number} area Area of Polygons
     * @param {Point} origin Center Point
     * @param {boolean} genrotations Generate rotated polygons?
     * @param {number} sidecntmax amount of sides on last polygon in array
     * @returns {[PolygonGroup]} Array containing PolygonGroups (1 for every shape) with given area starting at 3gon iterating until given side count 
     */
    this.GetPolygons = function(area, origin, genrotations, sidecntmax = 12){//integer area, Point origin, bool rotations (include rotated polygons)
        var polygons = new Array();
        //var polyGroup = new utils.PolygonGroup();
        for(var i = 3; i <= sidecntmax; i++)//start at 3 sided polygon through 12 (sidecntmax)
        {
            var temp = new Array();//List<polygon>
            temp.push(this.GetPolygon(area, i, origin));

            if (genrotations)//there is probably a much simpler way to achieve this
            {
                var rdegrees = (360 / (i)) / 2; //calculate how many degrees to rotate
                for (var o = 0; o < (Math.floor((24 / i) / 2) - 1); o++)//calculate how many times each polygon type is rotated
                {
                    var temp2 = new Array();
                    var degrees;
                    if (o == 0) //avoid divide by 0
                    {
                        degrees = rdegrees;
                    }
                    else
                    {
                        degrees = rdegrees / (2 * o);
                    }
                    temp.forEach (p =>  //rotate every previously rotated polygon p by half of last rotation in degrees
                    {
                        temp2.push(p.Rotate(degrees)); 
                    });
                    //console.log(temp2);
                    temp = temp.concat(temp2);//add values from <array<polygon>> temp2 to <array<polygon>> temp


                }
            }
            var pgroup = new utils.PolygonGroup();
            pgroup.addArray(temp);
            polygons.push(pgroup);
            //polyGroup.add(unitp);
            
        }
        return polygons;
    }
    /**
     * Returns an Array containing unit area Polygons up to given side count
     * @param {number} sidecntmax Maximum amount of sides
     * @returns {Array<Polygon>} Array containing unit area Polygons up to given side count 
     */
    this.GetUnitPolygons = function(sidecntmax = 12){
        return this.GetPolygons(1,utils.Origin,true,sidecntmax);
    }
    /**
     * Pushes unit Polygons to ggbApplet
     * @param {ggbApplet} ggbApplet ggbApplet where polygons are pushed
     */
    this.ggbRenderUnitPolygons = function(ggbApplet){
        var unitpolys = this.GetPolygons(1, utils.Origin, true);
        //console.log(unitpolys);
        unitpolys.forEach(poly =>{
            //console.log(poly);
            console.log(poly.GGBRender(ggbApplet, true));
        });

    };
    //useless?
    this.generateTwoRepresentation = function(area, genrotations, pathoptions = utils.two.DefaultPath){ //creates area based polygons, converts into two.js paths, then returns two group with children two groups for each type of polygon and its rotations. requires two.js
        var rootArray = new Array();
        this.GetPolygons(area,utils.Origin,genrotations, 12).forEach(polygongroup=>{
            rootArray.push(utils.two.polygonGroupToGroup(polygongroup, pathoptions));
        });
        var rootGroup = new Two.Group(rootArray);
        rootGroup.fill = pathoptions.fillColor;
        rootGroup.stroke = pathoptions.strokeColor;
        rootGroup.linewidth = pathoptions.linewidth;
        rootGroup.opacity = pathoptions.opacity;
        rootGroup.visible = pathoptions.visible;
        return rootGroup;
    }
    this.getTwoRepresentation = function(polygroupArray, pathoptions){//turns existing polygongroups from a polygongrouparray into two.js groups, then puts those groups in a group
        rootArray = new Array();
        polygroupArray.forEach(polygongroup=>{
            rootArray.push(utils.two.polygonGroupToGroup(polygongroup, pathoptions));
        });
        var rootGroup = new Two.Group(rootArray);
        rootGroup.fill = pathoptions.fillColor;
        rootGroup.stroke = pathoptions.strokeColor;
        rootGroup.linewidth = pathoptions.linewidth;
        rootGroup.opacity = pathoptions.opacity;
        rootGroup.visible = pathoptions.visible;
        return rootGroup;
    }
}