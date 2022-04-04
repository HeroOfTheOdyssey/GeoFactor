/** 
 * Factorize and Analyse Quasiprimes
*/
var geofactor = new function () {
    var EPS = 12;
    math.config({
        epsilon: 1e-12,
        number: 'BigNumber',      // Default type of number:
        // 'number' (default), 'BigNumber', or 'Fraction'
        precision: 100             // Number of significant digits for BigNumbers
    });
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
            let UnitRadius = math.evaluate(`sqrt(1 / pi)`); //allows for bignumber implementation

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


    this.test = function (primes, bits, accuracy, sidecntmax, resetIntersections = false) {
        var testResults = new Array();
        if (resetIntersections) this.clearLocalStorage();
        for (let i = 0; i < primes; i++) {
            utils.retrieveRandomPrimeEnvelope(bits).then(function (PrimeEnvelope) {
                //console.log(PrimeEnvelope);
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
        let qpRadii = math.sqrt(QuasiPrime);//no idea how this works tbh...
        let radiiVectors = this.makeUnitRadiiVectors(sidecntmax);
        let rangecalc = range;//temporary range hack
        //let rangecalc = Math.round(Math.round(QuasiPrime ** 0.25) / 2 * range);
        var primeData = false;
        //console.log(radiiVectors);
        let testedMeans = new Array();
        let testedTests = new Array();
        
        //console.log(`1e-${EPS.toString()}`);
        var bigmath = math.create({
            number: 'BigNumber',    // Choose 'number' (default), 'BigNumber', or 'Fraction'
            precision: 64,           // 64 by default, only applicable for BigNumbers
            epsilon: math.number(`1e-${EPS.toString()}`)
        });
        //console.log(radiiVectors);
        radiiVectors.some(function (radii) {
            let scope = { testradius: bigmath.multiply(math.bignumber(radii), math.bignumber(qpRadii)) };//apply vector, should be accurate

            var testMean = math.number(math.evaluate(`round(sqrt(((bignumber(testradius) ^ 2) * bignumber(number(pi)))))`, scope));
            if (!testedMeans.includes(testMean.toString())) {//checks if we've evaluated this value
                testedMeans.push(testMean.toString());
                //console.log("blop");
                //console.log(rangecalc);
                for (let i = -rangecalc; i<=rangecalc; i++) {
                    //console.log(i);
                    let test = math.evaluate(`number(${testMean}) + ${i}`);//use bignumber?
                    //console.log("test: " + test, " i: " + i);
                    if (!primeData && !testedTests.includes(test.toString()) && bigmath.larger(test, 0)) {//checks if we've evaluated this value...use bignumber?
                        testedTests.push(test.toString());

                        //let testArea = testmean**2;  //for memories sake
                        let distance = bigmath.evaluate(`round(sqrt(abs((${test} ^ 2) - ${QuasiPrime})))`);      //calculate distance of factors from mean, then round to nearest integer

                        let P1 = bigmath.add(test, distance);
                        let P2 = bigmath.subtract(test, distance);

                        //console.log(P1 + " " + P2);
                        //console.log(testMean.toString());
                        //console.log(distance.toString());

                        if (bigmath.equal(bigmath.multiply(P1, P2), bignumber(QuasiPrime))) {
                            //console.log("bldoodg");
                            primeData = new utils.PrimeEnvelope(QuasiPrime, P1.toString(), P2.toString(), true);
                            primeData.Range = i;
                            primeData.testMean = test;
                            primeData.distance = distance;
                            console.log(primeData);
                            return primeData;
                        }
                    }

                }
            }
            //console.log("b");
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