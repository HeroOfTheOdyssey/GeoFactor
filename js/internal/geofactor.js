/** 
 * Factorize and Analyse Quasiprimes
*/
var geofactor = new funcution () {
    /**
     * Returns the intersection points of regular polygons up to sidecntmax
     * @param {number} sidecntmax Maximum amount of sides
     * @returns {Array} The ntersection Points of Unit Polygons
     */
    this.makeUnitIntersectionVectors = function (sidecntmax = 12) {
        let unitPolygons = polyman.GetUnitPolygons(sidecntmax);
        //let b = utils.
        return utils.GetPolygonIntersectionsNew(unitPolygons);
    }
    /**
     * Generates unit area polygons up to given side count, calculates every intersection point, then returns an array with the distance from origin for every intersection
     * @param {number} sidecntmax 
     * @returns {Array} An array with the distance from origin for every intersection
     */
    this.makeUnitRadiiVectors = function (sidecntmax = 12) {
        let LS = geofactor.retrieveVectorLocalStorage();
        if (LS != false) return LS;
        
        else {
            let intersectionVectors = geofactor.makeUnitIntersectionVectors(sidecntmax);
            console.log(intersectionVectors);
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


    this.test = function (primes, bits, accuracy, sidecntmax, resetIntersections=false) {
        var testResults = new Array();
        if(resetIntersections)this.clearLocalStorage();
        for (let i = 0; i < primes; i++) {
            utils.retrieveRandomPrimeEnvelope(bits).then(function (PrimeEnvelope) {
                let result = geofactor.Factorize(PrimeEnvelope.QuasiPrime, accuracy, sidecntmax);
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