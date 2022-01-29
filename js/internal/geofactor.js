/** 
 * Factorize and Analyse Quasiprimes
 * @module geofactor
 * 
 * This class requires the module utils.js
 * @requires module:utils
 * @requires module:polyman
*/
var geofactor = new function () {
    /**
     * Returns the intersection points of regular polygons up to sidecntmax
     * @param {number} sidecntmax Maximum amount of sides
     * @returns {Set} The ntersection Points of Unit Polygons
     */
    this.makeUnitIntersectionVectors = function (sidecntmax=12) {
        let unitPolygons = polyman.GetUnitPolygons(sidecntmax);
        return this.GetPolygonIntersections(unitPolygons);
    }
    this.makeUnitRadiiVectors = function(sidecntmax=12){
        let intersectionVectors = this.makeUnitIntersectionVectors(sidecntmax);
        let UnitRadius = Math.sqrt(1/Math.PI);

        let interiorRadii = new Array();//could probably use array for quicker implementation
        let exteriorRadii = new Array();
        intersectionVectors.forEach(function(intersection){
            let radius = utils.GetDistanceFromOrigin(intersection);
            if(radius>UnitRadius)exteriorRadii.push(radius);
            else interiorRadii.push(radius);
        });
        return new Array([...exteriorRadii, ...interiorRadii]);//they are sorted and then merged as exterior are prioritized
        
    }
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
                                if (intersection.x >= 0 && intersection.y >= 0 ||true)//only search in positive quadrant
                                {
                                    console.log("blop");
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

    this.Factorize = function (QuasiPrime, range, sidecntmax=12){//range is percentage
        let qpRadii = utils.circleAreaToRadius(QuasiPrime);
        let radiiVectors = this.makeUnitRadiiVectors(sidecntmax);
        let rangecalc = range;//temporary range hack
        var primeData = false;
        radiiVectors.some(function(radii){
            let testradius = radii*qpRadii;//apply vector, not sure if accurate implementation
            var testMean = Math.round(Math.sqrt((testradius ** 2 * Math.PI)));
            
            for (let i = -rangecalc; i <= rangecalc; i++) {
                testMean = testMean + i;
                //let testArea = testmean**2;  //for memories sake
                let distance = Math.round(Math.sqrt((testMean ** 2) - QuasiPrime));      //calculate distance of factors from mean, then round to nearest integer
                let P1 = testMean + distance;
                let P2 = testMean - distance;
                console.log("blsofje");
                if (P1 * P2 == QuasiPrime)
                {
                    console.log("bldoodg");
                    primeData = new utils.PrimeEnvelope(QuasiPrime, P1, P2);
                    primeData.Range = i;
                    primeData.testMean = testMean;
                    primeData.distance = distance;
                    return primeData;
                }

            }
            if(primeData)return primeData;
        });
        console.log(primeData);
        if(primeData)return primeData;

    }
}
//map[point, intersection]