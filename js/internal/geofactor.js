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
    this.makeUnitIntersectionVectors = function (sidecntmax = 12) {
        let unitPolygons = polyman.GetUnitPolygons(sidecntmax);
        return this.GetPolygonIntersections(unitPolygons);
    }
    this.makeUnitRadiiVectors = function (sidecntmax = 12) {
        let LS = this.retrieveVectorLocalStorage();
        if (LS != false) return LS;
        else {
            let intersectionVectors = this.makeUnitIntersectionVectors(sidecntmax);
            let UnitRadius = Math.sqrt(1 / Math.PI);

            let interiorRadii = new Set();//could probably use array for quicker implementation
            let exteriorRadii = new Set();
            intersectionVectors.forEach(function (intersection) {
                let radius = utils.GetDistanceFromOrigin(intersection);
                if (radius > UnitRadius) exteriorRadii.add(radius);
                else interiorRadii.add(radius);
            });
            let vects = Array.from([...exteriorRadii, ...interiorRadii]);
            this.saveVectorToLocalStorage(vects);
            return vects;//they are sorted and then merged as exterior are prioritized
        }
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
                                if (intersection.x >= 0 && intersection.y >= 0 || true)//only search in positive quadrant
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
    this.test = function (primes, bits) {
        var testResults = new Array();
        for (let i = 0; i < primes; i++) {
            utils.retrieveRandomPrimeEnvelope(bits).then(function (PrimeEnvelope) {
                let result = geofactor.Factorize(PrimeEnvelope.QuasiPrime, 30);
                //console.log(result);
                if (result) {
                    testResults.push(result);
                }
            }
            );
        }
        return testResults;
    }
    this.Factorize = function (QuasiPrime, range, sidecntmax = 12) {//range is percentage
        //let qpRadii = utils.circleAreaToRadius(QuasiPrime);
        let ms1 = performance.now();
        let qpRadii = Math.sqrt(QuasiPrime);//no idea how this works tbh
        let radiiVectors = this.makeUnitRadiiVectors(sidecntmax);
        let rangecalc = range;//temporary range hack
        //let rangecalc = Math.round(Math.round(QuasiPrime ** 0.25) / 2 * range);
        var primeData = false;
        //console.log(radiiVectors);
        let testedMeans = new Array();
        let testedTests = new Array();
        radiiVectors.some(function (radii) {
            let testradius = radii * qpRadii;//apply vector, not sure if accurate implementation
            var testMean = Math.round(Math.sqrt((testradius ** 2 * Math.PI)));

            if (!testedMeans.includes(testMean)) {//checks if we've evaluated this value
                testedMeans.push(testMean);

                for (let i = -rangecalc; i <= rangecalc; i++) {
                    testMean = testMean + i;
                    if (!testedTests.includes(testMean) && testMean > 0) {//checks if we've evaluated this value
                        testedTests.push(testMean);

                        //let testArea = testmean**2;  //for memories sake
                        let distance = Math.round(Math.sqrt(Math.abs((testMean ** 2) - QuasiPrime)));      //calculate distance of factors from mean, then round to nearest integer

                        let P1 = testMean + distance;
                        let P2 = testMean - distance;
                        //console.log(P1 + " " + P2);
                        //console.log(testMean);
                        //console.log(distance);
                        if (P1 * P2 == QuasiPrime) {
                            //console.log("bldoodg");
                            primeData = new utils.PrimeEnvelope(QuasiPrime, P1, P2);
                            primeData.Range = i;
                            primeData.testMean = testMean;
                            primeData.distance = distance;
                            return primeData;
                        }
                    }

                }
            }

            if (primeData) return primeData;
        });
        let ms2 = performance.now();
        let time = Math.round(ms2 - ms1);
        console.log(`completed in ${time}ms`);
        //console.log(primeData);
        if (primeData) {
            primeData.time = time;
            return primeData;
        }


    }
    const vectorStorageKey = "VECTORS";//
    this.saveVectorToLocalStorage = function (vectorArray) {
        var json = JSON.stringify(vectorArray);
        localStorage.setItem(vectorStorageKey, json);
        return true;
    }
    this.retrieveVectorLocalStorage = function () {
        let lsitem = localStorage.getItem(vectorStorageKey);
        if (lsitem === null) return false;
        else return JSON.parse(lsitem);
    }
    this.clearLocalStorage = function () {
        localStorage.removeItem(vectorStorageKey);
    }
}
//map[point, intersection]