/**
 * A 2D Point
 * @typedef {Object} Point 
 * @property {number} x - x coordinate
 * @property {number} y - y coordinate
 * @property {string} ID Unique identifier for object
 */
/**
 * A 2D Line Segment
 * @typedef {Object} Line
 * @property {Point} from Start Point of Line
 * @property {Point} to End Point of Line
 */
/**
 * A 2D Polygon
 * @typedef {Object} Polygon
 * @property {Array<Point>} Points Array containing Points representing Polygon's vertices
 * @property {string} ID Unique identifier for object
 */
/**
 * A group of 2D Polygons
 * @typedef {Object} PolygonGroup
 * @property {Array<Polygon>} Polygons Array of Polygons
 * @property {string} ID Unique identifier for object
 */
/**
 * @typedef {Object} PrimeEnvelope
 * @property {number} PrimeA
 * @property {number} PrimeB
 * @property {number} QuasiPrime
 * @property {bool} Factored
 */
/** 
 * Polygon helper class
 */
 var utils = new function () {

    var internalFunction = function () {

    };
    /** 
    * Helper class for using two with normal polygons
    * @module utils.two
    */
    this.two = new function () {//helpers specific to two.js library
        this.PathOptions = function (fillColor, strokeColor, linewidth, opacity, visible, cssClass) {
            this.fillColor = fillColor;
            this.strokeColor = strokeColor;
            this.linewidth = linewidth;
            this.opacity = opacity;
            this.visible = visible;
            this.cssClass = cssClass;
        }
        this.DefaultPath = new this.PathOptions('transparent', 'black', 1, 1.0, true, '');
        this.pointToAnchor = function (point) {
            return new Two.Anchor(point.x, point.y);
        }
        this.polygonToPath = function (polygon, pathoptions = this.DefaultPath) {
            var anchors = new Array();
            polygon.Points.forEach(point => {
                anchors.push(this.pointToAnchor(point));
            });
            var Path = new Two.Path(anchors, true, false, false);
            Path.fill = pathoptions.fillColor;
            Path.stroke = pathoptions.strokeColor;
            Path.linewidth = pathoptions.linewidth;
            Path.opacity = pathoptions.opacity;
            Path.visible = pathoptions.visible;
            Path.className = pathoptions.cssClass;
            return Path;
        }
        this.polygonGroupToGroup = function (polygongroup, pathoptions = this.DefaultPath) {
            childrenpaths = new Array();
            polygongroup.Polygons.forEach(polygon => {
                childrenpaths.push(this.polygonToPath(polygon, pathoptions));
            });
            var Group = new Two.Group(childrenpaths);
            Group.fill = pathoptions.fillColor;
            Group.stroke = pathoptions.strokeColor;
            Group.linewidth = pathoptions.linewidth;
            Group.opacity = pathoptions.opacity;
            Group.visible = pathoptions.visible;
            //Group.className = pathoptions.cssClass; no css class for groups
            return Group;
        }
    }
    this.storage = new function () {
        polygonGroupKey = "POLY";
        renderGroupsKey = "RENDER";
    }
    var generateUUID = function () {
        var d = new Date().getTime();
        var d2 = (performance && performance.now && (performance.now() * 1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
        var uuid = 'xyxxxyxxxy'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16;
            if (d > 0) {
                var r = (d + r) % 16 | 0;
                d = Math.floor(d / 16);
            } else {
                var r = (d2 + r) % 16 | 0;
                d2 = Math.floor(d2 / 16);
            }
            return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
        });
        return uuid;
    }
    const storageKey = "POLY";
    this.savePolysToLocalStorage = function (polygroupArray) {
        var json = JSON.stringify(polygroupArray);
        localStorage.setItem(storageKey, json);
        return true;
    }
    this.retrievePolysLocalStorage = function () {
        lsitem = localStorage.getItem(storageKey);
        if (lsitem === null) return false;
        else return JSON.parse(localStorage.getItem(storageKey));
    }
    this.clearLocalStorage = function () {
        localStorage.removeItem(storageKey);
    }
    this.publicFunction = function () {

    }

    /**
     * Internal helper Function to allow values to be precalculated
     * @param {number} sidecount polygon side count
     * @returns {number} calculated value of sidecount*sin(2*pi/sidecount) for Ngons
     */
    var radiusprecalc = function (sidecount) {
        //(Ngon)         R = sqrt( (2*area) / (N*sin(2*pi/N)))
        //area to radius for regular polygon


        //this is calculated value of (N*sin(2*pi/N)) for Ngons 3-12
        var output = (sidecount * Math.sin(2 * Math.PI / sidecount));

        /*         switch (sides)                                                              //using precalculated values is quicker
                {
                    case 3:
                        output = 2.598076211353315940291169512258808550414207880715570942083710469177899525363200055621719280135872863513439212123110054544954917642;
                        break;
                    case 4:
                        output = 4.0;
                        break;
                    case 5:
                        output = 4.755282581475767860582196666896910717028493170628751112236528222150765850425967508593964054854056908379498587757015021044935330969;
                        break;
                    case 6:
                        output = 5.196152422706631880582339024517617100828415761431141884167420938355799050726400111243438560271745727026878424246220109089909835285;
                        break;
                    case 7:
                        output = 5.47282037727620866095911168671840425162634163096081270286444470631564212143755509190607604823693687562583105412376610130567479932;
                        break;
                    case 8:
                        output = 5.656854249492380195206754896838792314278687501507792292706718951962929913848428155401550137310566290940055384923649188099699344223;
                        break;
                    case 9:
                        output = 5.785088487178853936903790689165370896168038957851136112924795292040015526168627757394394049458349164581330224053818184868533577086;
                        break;
                    case 10:
                        output = 5.877852522924731291687059546390727685976524376431459910722724807572784741623519575085040498627413359600531316027526593663389303259;
                        break;
                    case 11:
                        output = 5.947048992011573403183995497505608649749476686879252240393248782436206099599726794598869594916058376045645521836846503647704830438;
                        break;
                    case 12:
                        output = 6.0;
                        break;
                } */

        return output;
    }
    /**
     * Returns the calculated radius for regular polygon given area and sidecount
     * @param {number} area area of polygon
     * @param {int} sidecount amount of sides on polygon
     * @returns {number} calculated radius for regular polygon given area and sidecount
     */
    this.areaToRadius = function (area, sidecount) {
        return Math.sqrt((2 * area) / radiusprecalc(sidecount));
    }
    this.circleRadiusToArea = function (radius) {
        return Math.PI * (radius * radius); //pi*r^2
    }
    this.circleAreaToRadius = function (area) {
        return Math.sqrt(area / Math.PI);
    }
    /**
     * Represents a point in 2D space
     * @this {Point}
     * @param {number} x x coordinate
     * @param {number} y y coordinate
     */
    this.Point = function (x, y) { //x and y are cartesien coordinates
        /** @type {number} */
        this.x = x;
        /** @type {number} */
        this.y = y;
        this.ID = generateUUID(); //necasarry?
    };

    /**
     * Represents a QuasiPrime number and its parts
     * @this {PrimeEnvelope} 
     * @param {number} QuasiPrime
     * @param {number} PrimeA 
     * @param {number} PrimeB
     */
    this.PrimeEnvelope = function (QuasiPrime = 0, PrimeA = 0, PrimeB = 0) {
        /** @type {number} */
        this.QuasiPrime = QuasiPrime;
        /** @type {number} */
        this.PrimeA = PrimeA;
        /** @type {number} */
        this.PrimeB = PrimeB;
        /** @type {bool} */
        this.Factored = false;
        if (this.PrimeA != 0 && this.PrimeB != 0) {
            if (this.PrimeA * this.PrimeB != this.QuasiPrime) {
                console.log("Prime envelope error"); //throw error because there should be equality
                this.QuasiPrime = this.PrimeA * this.PrimeB; //fix error
            }
            this.Factored = true;
        }

    }
    this.retrieveRandomPrimeEnvelope = function (bits) {
        return $.getJSON(`https://rsagen.crownsterling.io/gen/${bits}`).then(function (data) {
            PE = new utils.PrimeEnvelope(data.pk, data.p1, data.p2);
            return PE
        });

        return PE;
    }
    /**
     * Represents a line segment in 2D space
     * @constructor
     * @param {Point} from Start Point of Line
     * @param {Point} to End Point of Line
     */
    this.Line = function (from, to) { //a and b are points
        /** @type {Point} */
        this.from = from;
        /** @type {Point} */
        this.to = to;
    };
    /**
     * Returns subject rotated about origin given degrees
     * @param {Point} origin Point central to rotation 
     * @param {Point} subject Point to rotate
     * @param {number} degrees Angle of rotation
     * @returns {Point} subject rotated about origin given degrees
     */
    this.Rotate = function (origin, subject, degrees) //kept origin variable for future understanding and use
    {

        var radians = Math.PI / 180 * degrees;                                                              //replace with bignumber math class if needed      
        var cos = Math.cos(radians);                                                                     //replace with bignumber math class if needed       
        var sin = Math.sin(radians);
        var OutputX = (cos * (subject.x - origin.x)) + (sin * (subject.y - origin.y)) + origin.x;
        var OutputY = (cos * (subject.y - origin.y)) - (sin * (subject.x - origin.x)) + origin.y;
        return new this.Point(OutputX, OutputY);

    };
    /** Class representing a Polygon.
     * @constructor
     * @param {Array<Point>} points - Points representing polygon vertices
     * @returns {Polygon}
     */
    this.Polygon = class {
        constructor(points) {
            /** @type {Array<Point>} */
            this.Points = points;
            this.ID = generateUUID();
        }

        /**
         * Renders current polygon to ggbApplet
         * @param {ggbApplet} ggbApplet - GeoGebra applet where objects are rendered 
         * @param {bool} renderPoints - Push individual points to ggbApplet?
         * @returns {[string]} List of the names of objects created in ggbApplet
         */
        GGBRender(ggbApplet, renderPoints) {//Polygon({(0, 0), (2, 1), (1, 3)})
            if (renderPoints) {

            }
            var cmd = "Polygon({";
            for (var i = 0; i < this.Points.length; i++) {
                if (i == 0) {
                    cmd = cmd + "(" + this.Points[i].x.toFixed(14) + ", " + this.Points[i].y.toFixed(14) + ")";
                }
                else {
                    cmd = cmd + ", (" + this.Points[i].x.toFixed(14) + ", " + this.Points[i].y.toFixed(14) + ")"
                }
            }
            cmd = cmd + "})";
            return ggbApplet.evalCommandGetLabels(cmd);
        }
        /**
         * Returns string containing polygon vertices in SVG Point format
         * @returns {string} string containing polygon vertices in SVG Point format
         */
        SVGPoints() {
            var data = "";
            this.Points.forEach(Point => {
                data += Point.x + "," + Point.y + " ";
            });
            return data;
        }
        /**
         * Returns list of line segments generated from polygon points
         * @returns {[Line]} List of line segments representing polygon
         */
        GetSegments() {
            var lines = new Array();

            for (var i = 0; i < this.Points.length; i++) {
                if (i < this.Points.length - 1) {
                    lines.push(new utils.Line(this.Points[i], this.Points[i + 1]));
                }
                else                //connect last point to first point
                {
                    lines.push(new utils.Line(this.Points[i], this.Points[0]));
                }
            }

            return lines;
        }
        /**
         * Returns Polygon rotated about (0,0) given degrees
         * @param {number} degrees - degrees to rotate polygon
         * @returns Polygon rotated about origin given degrees
         */
        Rotate(degrees) {
            var rotatedPoly = new Array();
            this.Points.forEach(p => {
                rotatedPoly.push(utils.Rotate(utils.Origin, p, degrees));
            });
            return new utils.Polygon(rotatedPoly);
        }

    };
    this.PolygonGroup = class {
        constructor() {
            this.Polygons = new Array();//array<polygons>
            this.ID = generateUUID();
        }
        add(Polygon) {
            this.Polygons.push(Polygon);
            return true;
        }
        addArray(Polygons) {
            Polygons.forEach(Polygon => {
                this.add(Polygon);
            });
            return true;
        }
        remove(Polygon) {
            const index = this.Polygons.indexOf(Polygon);
            if (index > -1) {
                this.Polygons.splice(index, 1);
                this.twoGroup.remove(Polygon.twoPath);
            }
            else { return false; }//element not in array
            return true;
        }
    }
    this.consolidatePolygonGroups = function (polygonGroupArray) {
        consolidatedPGroup = new this.PolygonGroup();
        polygonGroupArray.forEach(function (pgroup) {
            consolidatedPGroup.addArray(pgroup.Polygons);
        });
        return consolidatedPGroup;
    }
    /**
     * Represents (0,0)
     * @type {Point} 
     */
    this.Origin = new this.Point(0, 0);

    /**
     * Returns the distance a point is from 0,0
     * @param {Point} Point
     * @returns the distance a point is from 0,0
     */
    this.GetDistanceFromOrigin = function (Point) {
        return Math.sqrt(Point.x ** 2 + Point.y ** 2);
    }
    /**
     * Returns intersection Point of two line segments if they intersect. Returns false if they don't intersect.
     * @param {Line} L1 Line segment to intersect.
     * @param {Line} L2 Line segment to intersect.
     * @returns {(Point|boolean)} Intersection Point of two line segments. Returns false if they don't intersect.
     */
    this.GetIntersection = function (L1, L2)  //Line1, Line2
    {
        // Denominator for ua and ub are the same, so store this calculation
        var zero = false;
        var d =
            (L2.to.y - L2.from.y) * (L1.to.x - L1.from.x)
            -
            (L2.to.x - L2.from.x) * (L1.to.y - L1.from.y);

        //n_a and n_b are calculated as seperate values for readability
        var n_a =
            (L2.to.x - L2.from.x) * (L1.from.y - L2.from.y)
            -
            (L2.to.y - L2.from.y) * (L1.from.x - L2.from.x);

        var n_b =
            (L1.to.x - L1.from.x) * (L1.from.y - L2.from.y)
            -
            (L1.to.y - L1.from.y) * (L1.from.x - L2.from.x);

        // Make sure there is not a division by zero - this also indicates that
        // the lines are parallel.  
        // If n_a and n_b were both equal to zero the lines would be on top of each 
        // other (coincidental).  This check is not done because it is not 
        // necessary for this implementation (the parallel check accounts for this).
        if (d == 0) {
            return zero;
        }
        // Calculate the intermediate fractional point that the lines potentially intersect.
        var ua = n_a / d;
        var ub = n_b / d;

        // The fractional point will be between 0 and 1 inclusive if the lines
        // intersect.  If the fractional calculation is larger than 1 or smaller
        // than 0 the lines would need to be longer to intersect.
        if (ua >= 0 && ua <= 1 && ub >= d && ub <= 1) {
            return new utils.Point(L1.from.x + (ua * (L1.to.x - L1.from.x)), L1.from.y + (ua * (L1.to.y - L1.from.y)));

        }
        return zero;
    }

    /**
     * Given an array of line segments, retrieves the intersection points
     * @param {[Line]} Lines Line segments to intersect
     * @returns {[Point]} Intersection points
     */
    this.GetIntersections = function (Lines) {//currently returns array of points, can be modified to return the associated segments
        console.log(Lines);
        let prep = isect.bush(Lines);
        let output = prep.run();
        let returnval = new Array();
        output.forEach(intersection => {
            returnval.push(intersection.point);
        });
        return returnval;
    }
    /**
     * Given an array of PolygonGroups, calculate and return their intersections
     * @param {[PolygonGroup]} polygroups Array of PolygonGroups to intersect
     * @returns {[Point]} Intersection points of given polygongroups
     */
    this.GetPolygonIntersections = function (polygroups) {
        var intersections = new Array();
        polygroup = utils.consolidatePolygonGroups(polygroups);
        polygroup.Polygons.forEach(function (P1) {
            polygroup.Polygons.forEach(function (P2) {
                if (P1.ID != P2.ID) {
                    //console.log(P2);
                    P1.GetSegments().forEach(function (L1) {
                        P2.GetSegments().forEach(function (L2) {//unsure if this is proper
                            let intersection = utils.GetIntersection(L1, L2);

                            //Point intersection = DoLinesIntersect(L1, L2); //test
                            if (intersection == false || intersection.x == 0 && intersection.y == 0) {
                                //Debug.WriteLine("0");
                                //console.log(intersection);
                            }
                            else {
                                //console.log(intersection);
                                //Debug.WriteLine("found");
                                if (intersection.x >= 0 && intersection.y >= 0 || true)//only search in positive quadrant
                                {
                                    //console.log("blop");
                                    intersections.push(intersection);
                                }
                            }
                        });
                    });
                }
            });
        });
        //in c# used distinct here. transferred over by using javascript set. not all duplicates are removed, as {a:2, b:1}!={a:2, b:1}
        console.log(intersections);//log the size, how many intersections
        return intersections;
    }

    /**
    * Given an array of PolygonGroups, calculate and return their intersections
    * @param {[PolygonGroup]} polygroups Array of PolygonGroups to intersect
    * @returns {[Point]} Intersection points of given polygongroups
    */
    this.GetPolygonIntersectionsNew = function (polygroups) {
        let polygroup = utils.consolidatePolygonGroups(polygroups);
        console.log(polygroup);
        let segments = new Array();
        polygroup.Polygons.forEach(polygon => {
            segments.push(...polygon.GetSegments());
        });
        return utils.GetIntersections(segments);
    }

};