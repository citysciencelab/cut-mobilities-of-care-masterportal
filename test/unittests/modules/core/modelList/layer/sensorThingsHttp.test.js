import {expect} from "chai";
import {SensorThingsHttp} from "@modules/core/modelList/layer/sensorThingsHttp";


describe("core/modelList/layer/SensorThingsHttp", function () {
    let lastResponse = false,
        hasStarted = false,
        isComplete = false,
        lastError = false,
        lastProgress = false,
        httpClientLastUrl = false;
    const http = new SensorThingsHttp(),
        url = "https://iot.hamburg.de/v1.0/Things";

    /**
     * test function
     * @param {*} response -
     * @returns {Void}  -
     */
    function onsuccess (response) {
        lastResponse = response;
    }

    /**
     * test function
     * @returns {Void}  -
     */
    function onstart () {
        hasStarted = true;
    }

    /**
     * test function
     * @returns {Void}  -
     */
    function oncomplete () {
        isComplete = true;
    }

    /**
     * test function
     * @param {*} error -
     * @returns {Void}  -
     */
    function onerror (error) {
        lastError = error;
    }

    /**
     * test function
     * @param {*} progress -
     * @returns {Void}  -
     */
    function onwait (progress) {
        lastProgress = progress;
    }

    describe("getPolygonQueryWithPoints", function () {
        it("should return a url query with the given points in a correct format", function () {
            const points = [
                {x: "foo", y: "bar"},
                {x: "baz", y: "qux"}
            ];

            expect(http.getPolygonQueryWithPoints(points)).to.equal("st_within(Locations/location,geography'POLYGON ((foo bar,baz qux))')");
            expect(http.getPolygonQueryWithPoints([{}, {}])).to.equal("st_within(Locations/location,geography'POLYGON (())')");
            expect(http.getPolygonQueryWithPoints([])).to.equal("st_within(Locations/location,geography'POLYGON (())')");
        });
        it("should return false if some damaged points are given", function () {
            const points = [
                {x: "foo", y: "bar"},
                {x: "baz", foobar: "qux"}
            ];

            expect(http.getPolygonQueryWithPoints(points)).to.equal("st_within(Locations/location,geography'POLYGON ((foo bar))')");
            expect(http.getPolygonQueryWithPoints(undefined)).to.be.false;
            expect(http.getPolygonQueryWithPoints(null)).to.be.false;
            expect(http.getPolygonQueryWithPoints(1)).to.be.false;
            expect(http.getPolygonQueryWithPoints("foo")).to.be.false;
            expect(http.getPolygonQueryWithPoints({})).to.be.false;
        });
    });

    describe("convertExtentIntoPoints", function () {
        const extent = [557698.8791748052, 5925961.066824824, 573161.1208251948, 5941978.933175176],
            sourceProjection = "EPSG:25832",
            targetProjection = "EPSG:4326",
            expectedOutcome = [
                {x: 9.869432803790303, y: 53.47946522163486, z: 0},
                {x: 10.102382514144907, y: 53.47754336682167, z: 0},
                {x: 10.10613018673993, y: 53.62149474831524, z: 0},
                {x: 9.872388814958066, y: 53.623426671455626, z: 0},
                {x: 9.869432803790303, y: 53.47946522163486, z: 0}
            ];

        it("should convert the given extent into a polygon transforming the projections", function () {
            expect(http.convertExtentIntoPoints(extent, sourceProjection, targetProjection)).to.deep.equal(expectedOutcome);
        });

        it("should return false and sends an error if anything unexpected is given as extent", function () {
            lastError = false;
            expect(http.convertExtentIntoPoints(false, sourceProjection, targetProjection, onerror)).to.be.false;
            expect(lastError).to.be.a("string");
            expect(http.convertExtentIntoPoints(undefined, sourceProjection, targetProjection, onerror)).to.be.false;
            expect(http.convertExtentIntoPoints(1, sourceProjection, targetProjection, onerror)).to.be.false;
            expect(http.convertExtentIntoPoints("foo", sourceProjection, targetProjection, onerror)).to.be.false;
            expect(http.convertExtentIntoPoints(null, sourceProjection, targetProjection, onerror)).to.be.false;
            expect(http.convertExtentIntoPoints([1, 2, 3], sourceProjection, targetProjection, onerror)).to.be.false;
            expect(http.convertExtentIntoPoints([1, 2, 3, 4, 5], sourceProjection, targetProjection, onerror)).to.be.false;
        });

        it("should return false and send an error if anything unexpected is given as sourceProjection", function () {
            lastError = false;
            expect(http.convertExtentIntoPoints(extent, false, targetProjection, onerror)).to.be.false;
            expect(lastError).to.be.a("string");
            expect(http.convertExtentIntoPoints(extent, undefined, targetProjection, onerror)).to.be.false;
            expect(http.convertExtentIntoPoints(extent, 1, targetProjection, onerror)).to.be.false;
            expect(http.convertExtentIntoPoints(extent, null, targetProjection, onerror)).to.be.false;
        });

        it("should return false and send an error if anything unexpected is given as targetProjection", function () {
            lastError = false;
            expect(http.convertExtentIntoPoints(extent, sourceProjection, false, onerror)).to.be.false;
            expect(lastError).to.be.a("string");
            expect(http.convertExtentIntoPoints(extent, sourceProjection, undefined, onerror)).to.be.false;
            expect(http.convertExtentIntoPoints(extent, sourceProjection, 1, onerror)).to.be.false;
            expect(http.convertExtentIntoPoints(extent, sourceProjection, null, onerror)).to.be.false;
        });

        it("should not call the error callback function on error if anything but a function is given as error handler", function () {
            lastError = false;
            expect(http.convertExtentIntoPoints(false, false, false, undefined)).to.be.false;
            expect(lastError).to.be.false;
        });
    });

    describe("addPointsToUrl", function () {
        const polygon = [
                {x: 9.869432803790303, y: 53.47946522163486},
                {x: 10.102382514144907, y: 53.47754336682167},
                {x: 10.10613018673993, y: 53.62149474831524},
                {x: 9.872388814958066, y: 53.623426671455626},
                {x: 9.869432803790303, y: 53.47946522163486}
            ],
            expectedOutcome = "https://iot.hamburg.de/v1.0/Things?%24filter=st_within(Locations%2Flocation%2Cgeography'POLYGON%20((9.869432803790303%2053.47946522163486%2C10.102382514144907%2053.47754336682167%2C10.10613018673993%2053.62149474831524%2C9.872388814958066%2053.623426671455626%2C9.869432803790303%2053.47946522163486))')";

        it("should return the expected url with a well formed input", function () {
            expect(http.addPointsToUrl(url, polygon)).to.equal(expectedOutcome);
        });

        it("should return false and call an error if a funny url is given", function () {
            lastError = false;
            expect(http.addPointsToUrl(false, polygon, onerror)).to.be.false;
            expect(lastError).to.be.a("string");
            expect(http.addPointsToUrl(undefined, polygon, onerror)).to.be.false;
            expect(http.addPointsToUrl(null, polygon, onerror)).to.be.false;
            expect(http.addPointsToUrl("foo", polygon, onerror)).to.be.false;
            expect(http.addPointsToUrl(123456, polygon, onerror)).to.be.false;
            expect(http.addPointsToUrl([], polygon, onerror)).to.be.false;
            expect(http.addPointsToUrl({}, polygon, onerror)).to.be.false;
        });

        it("should return false and call an error if a broken polygon is given", function () {
            lastError = false;
            expect(http.addPointsToUrl(url, false, onerror)).to.be.false;
            expect(lastError).to.be.a("string");
            expect(http.addPointsToUrl(url, undefined, onerror)).to.be.false;
            expect(http.addPointsToUrl(url, null, onerror)).to.be.false;
            expect(http.addPointsToUrl(url, "foo", onerror)).to.be.false;
            expect(http.addPointsToUrl(url, 123456, onerror)).to.be.false;
            expect(http.addPointsToUrl(url, {}, onerror)).to.be.false;
        });

        it("should not call the error callback function on error if anything but a function is given", function () {
            lastError = false;
            expect(http.addPointsToUrl("foo", "bar", undefined)).to.be.false;
            expect(lastError).to.be.false;
        });
    });

    describe("addCountToUrl", function () {
        it("should add $count=true to and conform a given url - no matter what", function () {
            expect(http.addCountToUrl("https://iot.hamburg.de/v1.0/Things")).to.equal("https://iot.hamburg.de/v1.0/Things?%24count=true");
            expect(http.addCountToUrl("https://iot.hamburg.de/v1.0/Things?$filter=foo")).to.equal("https://iot.hamburg.de/v1.0/Things?%24filter=foo&%24count=true");
            expect(http.addCountToUrl("https://iot.hamburg.de/v1.0/Things?$count=false")).to.equal("https://iot.hamburg.de/v1.0/Things?%24count=true");
            expect(http.addCountToUrl(false)).to.include("%24count=true");
            expect(http.addCountToUrl(undefined)).to.include("%24count=true");
            expect(http.addCountToUrl(null)).to.include("%24count=true");
            expect(http.addCountToUrl(123456)).to.include("%24count=true");
            expect(http.addCountToUrl("foo")).to.include("%24count=true");
        });
    });

    describe("getSkipProgress", function () {
        it("should calculate the progress given by an url with a skip param and a total number", function () {
            const skipUrl = url + "?$skip=100";

            expect(http.getSkipProgress(skipUrl, 10000)).to.equal(0.01);
            expect(http.getSkipProgress(skipUrl, 5000)).to.equal(0.02);
            expect(http.getSkipProgress(skipUrl, 1000)).to.equal(0.1);
            expect(http.getSkipProgress(skipUrl, 100)).to.equal(1.0);
            expect(http.getSkipProgress(skipUrl, 50)).to.equal(1.0);
            expect(http.getSkipProgress(skipUrl, 10)).to.equal(1.0);
            expect(http.getSkipProgress(skipUrl, 1)).to.equal(1.0);
            expect(http.getSkipProgress(skipUrl, 0)).to.equal(1.0);
            expect(http.getSkipProgress(skipUrl, -1)).to.equal(1.0);
            expect(http.getSkipProgress(false, 1)).to.equal(0.0);
            expect(http.getSkipProgress(undefined, 1)).to.equal(0.0);
            expect(http.getSkipProgress(null, 1)).to.equal(0.0);
            expect(http.getSkipProgress(123456, 1)).to.equal(0.0);
            expect(http.getSkipProgress("foo", 1)).to.equal(0.0);
            expect(http.getSkipProgress([], 1)).to.equal(0.0);
            expect(http.getSkipProgress({}, 1)).to.equal(0.0);
            expect(http.getSkipProgress("?skip=foo", 1)).to.equal(0.0);
        });
    });

    describe("getHelper", function () {
        lastResponse = false;
        isComplete = false;
        lastError = false;
        lastProgress = false;
        httpClientLastUrl = false;

        it("should call oncomplete no matter what happened", function () {
            isComplete = false;
            http.getHelper("", false, oncomplete, false, false, function (httpClientUrl, httpOnSuccess) {
                httpOnSuccess();
            });
            expect(isComplete).to.be.true;

            isComplete = false;
            http.getHelper("", false, oncomplete, false, false, function (httpClientUrl, httpOnSuccess, httpOnError) {
                httpOnError();
            });
            expect(isComplete).to.be.true;
        });

        it("should call onerror if an error occurs", function () {
            lastError = false;
            http.getHelper("", false, false, onerror, false, function (httpClientUrl, httpOnSuccess, httpOnError) {
                httpOnError("foo");
            });
            expect(lastError).to.equal("foo");
        });

        it("should add $count=true to the url and call the url with the given httpClient", function () {
            httpClientLastUrl = false;
            http.getHelper(url, false, false, false, false, function (httpClientUrl) {
                httpClientLastUrl = httpClientUrl;
            });
            expect(httpClientLastUrl).to.equal("https://iot.hamburg.de/v1.0/Things?%24count=true");
        });

        it("should return any array from the response that was found under the value key ereasing the value key", function () {
            lastResponse = false;
            http.getHelper(url, onsuccess, false, false, false, function (httpClientUrl, httpClientOnSuccess) {
                httpClientOnSuccess({
                    value: ["foo", "bar"]
                });
            });
            expect(lastResponse).to.deep.equal(["foo", "bar"]);
        });
        it("should return anything as array if response does not include a key value as array", function () {
            lastResponse = false;
            http.getHelper(url, onsuccess, false, false, false, function (httpClientUrl, httpClientOnSuccess) {
                httpClientOnSuccess({
                    value: "foo"
                });
            });
            expect(lastResponse).to.deep.equal([{value: "foo"}]);

            lastResponse = false;
            http.getHelper(url, onsuccess, false, false, false, function (httpClientUrl, httpClientOnSuccess) {
                httpClientOnSuccess(undefined);
            });
            expect(lastResponse).to.deep.equal([undefined]);
        });

        it("should call any url that was found under the @iot.nextLink key recursive", function () {
            let skip = 0;

            lastResponse = false;
            http.getHelper(url, onsuccess, false, false, false, function (httpClientUrl, httpClientOnSuccess) {
                if (skip === 0) {
                    skip = 100;
                    httpClientOnSuccess({
                        "@iot.nextLink": "https://iot.hamburg.de/v1.0/Things?$skip=" + skip,
                        "value": ["foo"]
                    });
                }
                else if (skip === 100) {
                    skip = 200;
                    httpClientOnSuccess({
                        "@iot.nextLink": "https://iot.hamburg.de/v1.0/Things?$skip=" + skip,
                        "value": ["bar"]
                    });
                }
                else if (skip === 200) {
                    skip = 300;
                    httpClientOnSuccess({
                        "value": ["baz"]
                    });
                }
            });
            expect(lastResponse).to.deep.equal(["foo", "bar", "baz"]);
        });

        it("should set the progress and call onwait if the request skips recursive", function () {
            let skip = 0;

            lastProgress = false;
            http.getHelper(url, false, false, false, function (progress) {
                if (progress !== 1.0) {
                    lastProgress = progress;
                }
            }, function (httpClientUrl, httpClientOnSuccess) {
                if (skip === 0) {
                    skip = 100;
                    httpClientOnSuccess({
                        "@iot.count": 1000,
                        "@iot.nextLink": "https://iot.hamburg.de/v1.0/Things?$skip=" + skip,
                        "value": ["foo"]
                    });
                }
                else if (skip === 100) {
                    skip = 200;
                    httpClientOnSuccess({
                        "@iot.count": 1000,
                        "@iot.nextLink": "https://iot.hamburg.de/v1.0/Things?$skip=" + skip,
                        "value": ["bar"]
                    });
                }
            });
            expect(lastProgress).to.equal(0.2);
        });
    });

    describe("get", function () {
        lastResponse = false;
        hasStarted = false;
        isComplete = false;
        lastError = false;
        lastProgress = false;
        httpClientLastUrl = false;

        it("should call onstart, call onwait with 0 progress and call oncomplete no matter what", function () {
            http.get(false, false, onstart, oncomplete, false, onwait, function () {
                return false;
            });
            expect(hasStarted).to.be.true;
            expect(lastProgress).to.equal(0.0);
            expect(isComplete).to.be.true;
        });

        it("should run through with all expected functions to be called and with the expected result", function () {
            let skip = 0;

            hasStarted = false;
            lastProgress = false;
            isComplete = false;
            lastError = false;

            http.get(url, onsuccess, onstart, oncomplete, onerror, onwait, function (httpClientUrl, httpClientOnSuccess) {
                httpClientLastUrl = httpClientUrl;
                if (skip === 0) {
                    skip = 100;
                    httpClientOnSuccess({
                        "@iot.count": 1000,
                        "@iot.nextLink": "https://iot.hamburg.de/v1.0/Things?$skip=" + skip,
                        "value": ["foo"]
                    });
                }
                else if (skip === 100) {
                    skip = 200;
                    httpClientOnSuccess({
                        "@iot.count": 1000,
                        "@iot.nextLink": "https://iot.hamburg.de/v1.0/Things?$skip=" + skip,
                        "value": ["bar"]
                    });
                }
                else if (skip === 200) {
                    skip = 300;
                    httpClientOnSuccess({
                        "@iot.count": 1000,
                        "value": ["baz"]
                    });
                }
            });

            expect(lastResponse).to.deep.equal(["foo", "bar", "baz"]);
            expect(hasStarted).to.be.true;
            expect(isComplete).to.be.true;
            expect(lastError).to.be.false;
            expect(lastProgress).to.equal(1.0);
            expect(httpClientLastUrl).to.equal("https://iot.hamburg.de/v1.0/Things?%24skip=200&%24count=true");
        });
    });

    describe("getInExtent", function () {
        const extent = [557698.8791748052, 5925961.066824824, 573161.1208251948, 5941978.933175176],
            sourceProjection = "EPSG:25832",
            targetProjection = "EPSG:4326";

        lastResponse = false;
        hasStarted = false;
        isComplete = false;
        lastError = false;
        lastProgress = false;
        httpClientLastUrl = false;

        it("should call onstart, call onwait with 0 progress and call oncomplete no matter what", function () {
            http.getInExtent(false, false, false, onstart, oncomplete, false, onwait, function () {
                return false;
            });
            expect(hasStarted).to.be.true;
            expect(lastProgress).to.equal(0.0);
            expect(isComplete).to.be.true;
        });

        it("should run through with all expected functions to be called and with the expected result", function () {
            let skip = 0;

            hasStarted = false;
            lastProgress = false;
            isComplete = false;
            lastError = false;

            http.getInExtent(url, {
                extent: extent,
                sourceProjection: sourceProjection,
                targetProjection: targetProjection
            }, onsuccess, onstart, oncomplete, onerror, onwait, function (httpClientUrl, httpClientOnSuccess) {
                httpClientLastUrl = httpClientUrl;
                if (skip === 0) {
                    skip = 100;
                    httpClientOnSuccess({
                        "@iot.count": 1000,
                        "@iot.nextLink": "https://iot.hamburg.de/v1.0/Things?$skip=" + skip,
                        "value": ["foo"]
                    });
                }
                else if (skip === 100) {
                    skip = 200;
                    httpClientOnSuccess({
                        "@iot.count": 1000,
                        "@iot.nextLink": "https://iot.hamburg.de/v1.0/Things?$skip=" + skip,
                        "value": ["bar"]
                    });
                }
                else if (skip === 200) {
                    skip = 300;
                    httpClientOnSuccess({
                        "@iot.count": 1000,
                        "value": ["baz"]
                    });
                }
            });

            expect(lastResponse).to.deep.equal(["foo", "bar", "baz"]);
            expect(hasStarted).to.be.true;
            expect(isComplete).to.be.true;
            expect(lastError).to.be.false;
            expect(lastProgress).to.equal(1.0);
            expect(httpClientLastUrl).to.equal("https://iot.hamburg.de/v1.0/Things?%24skip=200&%24count=true");
        });
    });
});
