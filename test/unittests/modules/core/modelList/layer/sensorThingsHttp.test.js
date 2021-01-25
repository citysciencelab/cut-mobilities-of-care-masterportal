import {expect} from "chai";
import {SensorThingsHttp} from "@modules/core/modelList/layer/sensorThingsHttp";


describe("core/modelList/layer/SensorThingsHttp", () => {
    let http = null,
        lastError = false;

    /**
     * a function to change lastError when an error occurs
     * @param {String} error the error
     * @returns {Void}  -
     */
    function onerror (error) {
        lastError = error;
    }

    beforeEach(() => {
        http = new SensorThingsHttp();
        lastError = false;
    });

    describe("getPolygonQueryWithPoints", () => {
        it("should return a url query with the given points in a correct format", () => {
            const points = [
                {x: "foo", y: "bar"},
                {x: "baz", y: "qux"}
            ];

            expect(http.getPolygonQueryWithPoints(points)).to.equal("st_within(Thing/Locations/location,geography'POLYGON ((foo bar,baz qux))')");
            expect(http.getPolygonQueryWithPoints([{}, {}])).to.equal("st_within(Thing/Locations/location,geography'POLYGON (())')");
            expect(http.getPolygonQueryWithPoints([])).to.equal("st_within(Thing/Locations/location,geography'POLYGON (())')");
        });
        it("should return false if some damaged points are given", () => {
            const points = [
                {x: "foo", y: "bar"},
                {x: "baz", foobar: "qux"}
            ];

            expect(http.getPolygonQueryWithPoints(points)).to.equal("st_within(Thing/Locations/location,geography'POLYGON ((foo bar))')");
            expect(http.getPolygonQueryWithPoints(undefined)).to.be.false;
            expect(http.getPolygonQueryWithPoints(null)).to.be.false;
            expect(http.getPolygonQueryWithPoints(1)).to.be.false;
            expect(http.getPolygonQueryWithPoints("foo")).to.be.false;
            expect(http.getPolygonQueryWithPoints({})).to.be.false;
        });
    });

    describe("convertExtentIntoPoints", () => {
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

        it("should convert the given extent into a polygon transforming the projections", () => {
            expect(http.convertExtentIntoPoints(extent, sourceProjection, targetProjection)).to.deep.equal(expectedOutcome);
        });

        it("should return false and sends an error if anything unexpected is given as extent", () => {
            expect(http.convertExtentIntoPoints(false, sourceProjection, targetProjection, onerror)).to.be.false;
            expect(lastError).to.be.a("string");
            expect(http.convertExtentIntoPoints(undefined, sourceProjection, targetProjection, onerror)).to.be.false;
            expect(http.convertExtentIntoPoints(1, sourceProjection, targetProjection, onerror)).to.be.false;
            expect(http.convertExtentIntoPoints("foo", sourceProjection, targetProjection, onerror)).to.be.false;
            expect(http.convertExtentIntoPoints(null, sourceProjection, targetProjection, onerror)).to.be.false;
            expect(http.convertExtentIntoPoints([1, 2, 3], sourceProjection, targetProjection, onerror)).to.be.false;
            expect(http.convertExtentIntoPoints([1, 2, 3, 4, 5], sourceProjection, targetProjection, onerror)).to.be.false;
        });

        it("should return false and send an error if anything unexpected is given as sourceProjection", () => {
            expect(http.convertExtentIntoPoints(extent, false, targetProjection, onerror)).to.be.false;
            expect(lastError).to.be.a("string");
            expect(http.convertExtentIntoPoints(extent, undefined, targetProjection, onerror)).to.be.false;
            expect(http.convertExtentIntoPoints(extent, 1, targetProjection, onerror)).to.be.false;
            expect(http.convertExtentIntoPoints(extent, null, targetProjection, onerror)).to.be.false;
        });

        it("should return false and send an error if anything unexpected is given as targetProjection", () => {
            expect(http.convertExtentIntoPoints(extent, sourceProjection, false, onerror)).to.be.false;
            expect(lastError).to.be.a("string");
            expect(http.convertExtentIntoPoints(extent, sourceProjection, undefined, onerror)).to.be.false;
            expect(http.convertExtentIntoPoints(extent, sourceProjection, 1, onerror)).to.be.false;
            expect(http.convertExtentIntoPoints(extent, sourceProjection, null, onerror)).to.be.false;
        });

        it("should not call the error callback function on error if anything but a function is given as error handler", () => {
            expect(http.convertExtentIntoPoints(false, false, false, undefined)).to.be.false;
            expect(lastError).to.be.false;
        });
    });

    describe("addPointsToUrl", () => {
        const polygon = [
                {x: 9.869432803790303, y: 53.47946522163486},
                {x: 10.102382514144907, y: 53.47754336682167},
                {x: 10.10613018673993, y: 53.62149474831524},
                {x: 9.872388814958066, y: 53.623426671455626},
                {x: 9.869432803790303, y: 53.47946522163486}
            ],
            expectedOutcome = "https://iot.hamburg.de/v1.1/Things?%24filter=st_within(Thing%2FLocations%2Flocation%2Cgeography'POLYGON%20((9.869432803790303%2053.47946522163486%2C10.102382514144907%2053.47754336682167%2C10.10613018673993%2053.62149474831524%2C9.872388814958066%2053.623426671455626%2C9.869432803790303%2053.47946522163486))')";

        it("should return the expected url with a well formed input", () => {
            expect(http.addPointsToUrl("https://iot.hamburg.de/v1.1/Things", polygon)).to.equal(expectedOutcome);
        });

        it("should return false and call an error if a funny url is given", () => {
            expect(http.addPointsToUrl(false, polygon, onerror)).to.be.false;
            expect(lastError).to.be.a("string");
            expect(http.addPointsToUrl(undefined, polygon, onerror)).to.be.false;
            expect(http.addPointsToUrl(null, polygon, onerror)).to.be.false;
            expect(http.addPointsToUrl("foo", polygon, onerror)).to.be.false;
            expect(http.addPointsToUrl(123456, polygon, onerror)).to.be.false;
            expect(http.addPointsToUrl([], polygon, onerror)).to.be.false;
            expect(http.addPointsToUrl({}, polygon, onerror)).to.be.false;
        });

        it("should return false and call an error if a broken polygon is given", () => {
            const url = "https://iot.hamburg.de/v1.0/Things";

            expect(http.addPointsToUrl(url, false, onerror)).to.be.false;
            expect(lastError).to.be.a("string");
            expect(http.addPointsToUrl(url, undefined, onerror)).to.be.false;
            expect(http.addPointsToUrl(url, null, onerror)).to.be.false;
            expect(http.addPointsToUrl(url, "foo", onerror)).to.be.false;
            expect(http.addPointsToUrl(url, 123456, onerror)).to.be.false;
            expect(http.addPointsToUrl(url, {}, onerror)).to.be.false;
        });

        it("should not call the error callback function on error if anything but a function is given", () => {
            expect(http.addPointsToUrl("foo", "bar", undefined)).to.be.false;
            expect(lastError).to.be.false;
        });
    });

    describe("addCountToUrl", () => {
        it("should add $count=true to and conform a given url - no matter what", () => {
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

    describe("fetchTopX", () => {
        it("should return 0 if anything unknown is given", () => {
            expect(http.fetchTopX(undefined)).to.equal(0);
            expect(http.fetchTopX(null)).to.equal(0);
            expect(http.fetchTopX(1234)).to.equal(0);
            expect(http.fetchTopX([])).to.equal(0);
            expect(http.fetchTopX({})).to.equal(0);
        });
        it("should not find $top=X in url notation %24top%3DX", () => {
            const url = "https://iot.hamburg.de/v1.0/Things?%24top%3D1&$count=true",
                expected = 0;

            expect(http.fetchTopX(url)).to.equal(expected);
        });
        it("should find out the number X in $top=X", () => {
            const url = "https://iot.hamburg.de/v1.0/Things?$top=1&$count=true",
                expected = 1;

            expect(http.fetchTopX(url)).to.equal(expected);
        });
        it("should find out the number X in %24top=X", () => {
            const url = "https://iot.hamburg.de/v1.0/Things?%24top=1&%24count=true",
                expected = 1;

            expect(http.fetchTopX(url)).to.equal(expected);
        });
    });

    describe("fetchSkipX", () => {
        it("should return 0 if anything unknown is given", () => {
            expect(http.fetchSkipX(undefined)).to.equal(0);
            expect(http.fetchSkipX(null)).to.equal(0);
            expect(http.fetchSkipX(1234)).to.equal(0);
            expect(http.fetchSkipX([])).to.equal(0);
            expect(http.fetchSkipX({})).to.equal(0);
        });
        it("should not find $skip=X in url notation %24skip%3DX", () => {
            const url = "https://iot.hamburg.de/v1.0/Things?%24skip%3D1&$count=true",
                expected = 0;

            expect(http.fetchSkipX(url)).to.equal(expected);
        });
        it("should find out the number X in $skip=X", () => {
            const url = "https://iot.hamburg.de/v1.0/Things?$skip=1&$count=true",
                expected = 1;

            expect(http.fetchSkipX(url)).to.equal(expected);
        });
        it("should find out the number X in %24skip=X", () => {
            const url = "https://iot.hamburg.de/v1.0/Things?%24skip=1&%24count=true",
                expected = 1;

            expect(http.fetchSkipX(url)).to.equal(expected);
        });
    });

    describe("getProgress", () => {
        it("should return 0 if the total count of progress is 0 (test: prohibit devision by zero)", () => {
            const progressList = [
                {
                    count: 0,
                    progress: 1
                },
                {
                    count: 0,
                    progress: 2
                }
            ];

            expect(http.getProgress(progressList)).to.equal(0);
        });
        it("should calculate the progress from a given progress list down to 2 decimal numbers", () => {
            const progressList = [
                {
                    count: 50,
                    progress: 1
                },
                {
                    count: 50,
                    progress: 2
                }
            ];

            // 1 / (50+50) * (1+2) = 0.030000000001 (with floating point error) should be rounded to 0.03
            expect(http.getProgress(progressList)).to.equal(0.03);
        });
    });

    describe("callHttpClient", () => {
        it("should call the (via constructor) given http handler - test: onsuccess", () => {
            let lastResponse = "";

            http.setHttpClient((url, onsuccess) => {
                onsuccess(url);
            });
            http.callHttpClient("url", response => {
                lastResponse = response;
            });

            expect(lastResponse).to.equal("url");
        });
        it("should call the (via constructor) given http handler - test: onerror", () => {
            let lastResponse = "";

            http.setHttpClient((url, onsuccess, onerrorShadow) => {
                onerrorShadow(url);
            });
            http.callHttpClient("url", (response) => {
                lastResponse = response;
            }, onerror);

            expect(lastResponse).to.be.empty;
            expect(lastError).to.equal("url");
        });
    });

    describe("getNextFiFoObj", () => {
        it("should return false on any unexpected input", () => {
            expect(http.getNextFiFoObj(undefined)).to.be.false;
            expect(http.getNextFiFoObj(null)).to.be.false;
            expect(http.getNextFiFoObj(123)).to.be.false;
            expect(http.getNextFiFoObj("string")).to.be.false;
            expect(http.getNextFiFoObj({})).to.be.false;
        });
        it("should return false if an empty array is given", () => {
            expect(http.getNextFiFoObj([])).to.be.false;
        });
        it("should return false if the next item in the given list has no key nextLink", () => {
            const nextLinkFiFo = [
                {key: "nextLink"}
            ];

            expect(http.getNextFiFoObj(nextLinkFiFo)).to.be.false;
        });
        it("should shift the first item of an array of objects and reduce the list", () => {
            const nextLinkFiFo = [
                    {nextLink: "nextLinkA"},
                    {nextLink: "nextLinkB"}
                ],
                expectedResult = {nextLink: "nextLinkA"},
                expectedList = [
                    {nextLink: "nextLinkB"}
                ];

            expect(http.getNextFiFoObj(nextLinkFiFo)).to.deep.equal(expectedResult);
            expect(nextLinkFiFo).to.deep.equal(expectedList);
        });
        it("should ignore any item which nextLink has a $top=X value with X in the range of 1 to Y of $skip=Y", () => {
            const nextLinkFiFo = [
                    {nextLink: "nextLinkA?$top=1&$skip=1"},
                    {nextLink: "nextLinkB?$top=1&$skip=2"},
                    {nextLink: "nextLinkB?$top=2&$skip=1"}
                ],
                expectedResult = {nextLink: "nextLinkB?$top=2&$skip=1"};

            expect(http.getNextFiFoObj(nextLinkFiFo)).to.deep.equal(expectedResult);
            expect(nextLinkFiFo).to.be.empty;
        });
    });

    describe("collectNextLinks", () => {
        it("should refuse to walk through anything but an object, but should call onfinish to move on", () => {
            const nextLinkFiFo = [],
                progressList = [];
            let hasFinished = false;

            http.collectNextLinks(undefined, nextLinkFiFo, progressList, () => {
                hasFinished = true;
            });
            expect(hasFinished).to.be.true;
            expect(nextLinkFiFo).to.be.empty;
            expect(progressList).to.be.empty;

            hasFinished = false;
            http.collectNextLinks(null, nextLinkFiFo, progressList, () => {
                hasFinished = true;
            });
            expect(hasFinished).to.be.true;
            expect(nextLinkFiFo).to.be.empty;
            expect(progressList).to.be.empty;

            hasFinished = false;
            http.collectNextLinks(1234, nextLinkFiFo, progressList, () => {
                hasFinished = true;
            });
            expect(hasFinished).to.be.true;
            expect(nextLinkFiFo).to.be.empty;
            expect(progressList).to.be.empty;

            hasFinished = false;
            http.collectNextLinks("string", nextLinkFiFo, progressList, () => {
                hasFinished = true;
            });
            expect(hasFinished).to.be.true;
            expect(nextLinkFiFo).to.be.empty;
            expect(progressList).to.be.empty;
        });

        it("should walk through any given object and remove IotLinks if flag removeIotLinks is set via constructor", () => {
            const resultRef = {
                "@iot.navigationLink": true,
                "@iot.selfLink": true,
                "test@iot.navigationLink": true,
                "test@iot.selfLink": true
            };

            http.setRemoveIotLinks(true);
            http.collectNextLinks(resultRef);

            expect(resultRef).to.be.empty;
        });

        it("should walk recursively through multi dimensions", () => {
            const resultRef = {
                    test: {
                        "@iot.navigationLink": true,
                        "@iot.selfLink": true
                    },
                    "test@iot.navigationLink": true,
                    "test@iot.selfLink": true
                },
                expected = {
                    test: {}
                };

            http.setRemoveIotLinks(true);
            http.collectNextLinks(resultRef);

            expect(resultRef).to.deep.equal(expected);
        });

        it("should push any key bound with a @iot.nextLink onto the fifo list, should push a new object to the progress list", () => {
            const resultRef = {
                    test: {
                        key: "value"
                    },
                    "test@iot.nextLink": "nextLink"
                },
                expected = {
                    test: resultRef.test
                },
                progressList = [],
                progressListExpected = [{
                    count: 1,
                    progress: 0
                }],
                nextLinkFiFo = [],
                nextLinkFiFoExpected = [{
                    nextLink: "nextLink",
                    resultRef: expected.test,
                    progressRef: progressListExpected[0]
                }];

            http.setRemoveIotLinks(true);
            http.collectNextLinks(resultRef, nextLinkFiFo, progressList);

            expect(resultRef).to.deep.equal(expected);
            expect(nextLinkFiFo).to.deep.equal(nextLinkFiFoExpected);
            expect(progressList).to.deep.equal(progressListExpected);
        });
    });

    describe("callNextLink", () => {
        describe("check resultRef", () => {
            let resultRef = "";

            it("should not process anything if the given resultRef is anything but an array", () => {
                resultRef = null;
                http.callNextLink("nextLink", "nextLinkFiFo", "onfinish", onerror, "onprogress", resultRef, "progressList", "progressRef");
                expect(lastError).to.be.a("string");

                lastError = false;
                resultRef = undefined;
                http.callNextLink("nextLink", "nextLinkFiFo", "onfinish", onerror, "onprogress", resultRef, "progressList", "progressRef");
                expect(lastError).to.be.a("string");

                lastError = false;
                resultRef = 1234;
                http.callNextLink("nextLink", "nextLinkFiFo", "onfinish", onerror, "onprogress", resultRef, "progressList", "progressRef");
                expect(lastError).to.be.a("string");

                lastError = false;
                resultRef = "string";
                http.callNextLink("nextLink", "nextLinkFiFo", "onfinish", onerror, "onprogress", resultRef, "progressList", "progressRef");
                expect(lastError).to.be.a("string");

                lastError = false;
                resultRef = {};
                http.callNextLink("nextLink", "nextLinkFiFo", "onfinish", onerror, "onprogress", resultRef, "progressList", "progressRef");
                expect(lastError).to.be.a("string");
            });
        });

        describe("handling of $count=true", () => {
            it("should add $count=true to the given nextLink and call the link via httpClient", () => {
                const resultRef = [],
                    nextLink = "https://iot.hamburg.de/v1.0/Things",
                    nextLinkExpected = "https://iot.hamburg.de/v1.0/Things?%24count=true";
                let lastUrl = "";

                http.setHttpClient(url => {
                    lastUrl = url;
                });
                http.callNextLink(nextLink, "nextLinkFiFo", "onfinish", "onerror", "onprogress", resultRef, "progressList", "progressRef");

                expect(lastUrl).to.equal(nextLinkExpected);
            });
            it("should not add another $count=true if the given nextLink has $count=true already", () => {
                const resultRef = [],
                    nextLink = "https://iot.hamburg.de/v1.0/Things?$count=true",
                    nextLinkExpected = "https://iot.hamburg.de/v1.0/Things?%24count=true";
                let lastUrl = "";

                http.setHttpClient(url => {
                    lastUrl = url;
                });
                http.callNextLink(nextLink, "nextLinkFiFo", "onfinish", "onerror", "onprogress", resultRef, "progressList", "progressRef");

                expect(lastUrl).to.equal(nextLinkExpected);
            });
        });

        describe("httpClient response", () => {
            it("should not process anything if the response from httpClient is anything but an object and not null", () => {
                const resultRef = [];

                http.setHttpClient((url, onsuccess) => {
                    onsuccess(null);
                });
                http.callNextLink("nextLink", "nextLinkFiFo", "onfinish", onerror, "onprogress", resultRef, "progressList", "progressRef");
                expect(lastError).to.be.a("string");

                lastError = false;
                http.setHttpClient((url, onsuccess) => {
                    onsuccess(undefined);
                });
                http.callNextLink("nextLink", "nextLinkFiFo", "onfinish", onerror, "onprogress", resultRef, "progressList", "progressRef");
                expect(lastError).to.be.a("string");

                lastError = false;
                http.setHttpClient((url, onsuccess) => {
                    onsuccess("string");
                });
                http.callNextLink("nextLink", "nextLinkFiFo", "onfinish", onerror, "onprogress", resultRef, "progressList", "progressRef");
                expect(lastError).to.be.a("string");

                lastError = false;
                http.setHttpClient((url, onsuccess) => {
                    onsuccess(1234);
                });
                http.callNextLink("nextLink", "nextLinkFiFo", "onfinish", onerror, "onprogress", resultRef, "progressList", "progressRef");
                expect(lastError).to.be.a("string");

                lastError = false;
                http.setHttpClient((url, onsuccess) => {
                    onsuccess([]);
                });
                http.callNextLink("nextLink", "nextLinkFiFo", "onfinish", onerror, "onprogress", resultRef, "progressList", "progressRef");
                expect(lastError).to.be.a("string");
            });
        });

        describe("handling of progressRef", () => {
            it("should not set count nor progress on progressRef object if response has no iot.count", () => {
                const progressRef = {},
                    progressRefExpected = progressRef,
                    resultRef = [];

                http.setHttpClient((url, onsuccess) => {
                    onsuccess({
                        "test": true
                    });
                });
                http.callNextLink("nextLink", "nextLinkFiFo", "onfinish", "onerror", "onprogress", resultRef, "progressList", progressRef);
                expect(progressRef).to.deep.equal(progressRefExpected);
            });
            it("should not set count nor progress on progressRef if progressRef is anything but an object (no null, no array)", () => {
                const resultRef = [];
                let progressRef;

                http.setHttpClient((url, onsuccess) => {
                    onsuccess({
                        "@iot.count": 1
                    });
                });

                progressRef = null;
                http.callNextLink("nextLink", "nextLinkFiFo", "onfinish", "onerror", "onprogress", resultRef, "progressList", progressRef);
                expect(progressRef).to.equal(null);

                progressRef = undefined;
                http.callNextLink("nextLink", "nextLinkFiFo", "onfinish", "onerror", "onprogress", resultRef, "progressList", progressRef);
                expect(progressRef).to.equal(undefined);

                progressRef = 1234;
                http.callNextLink("nextLink", "nextLinkFiFo", "onfinish", "onerror", "onprogress", resultRef, "progressList", progressRef);
                expect(progressRef).to.equal(1234);

                progressRef = "string";
                http.callNextLink("nextLink", "nextLinkFiFo", "onfinish", "onerror", "onprogress", resultRef, "progressList", progressRef);
                expect(progressRef).to.equal("string");

                progressRef = [];
                http.callNextLink("nextLink", "nextLinkFiFo", "onfinish", "onerror", "onprogress", resultRef, "progressList", progressRef);
                expect(progressRef).to.be.an("array").and.to.be.empty;
            });
            it("should set count and progress on progressRef object if response has iot.count and progressRef is an object and not null", () => {
                const progressRef = {},
                    progressRefExpected = {
                        count: 1,
                        progress: 0
                    },
                    resultRef = [];

                http.setHttpClient((url, onsuccess) => {
                    onsuccess({
                        "@iot.count": 1
                    });
                });
                http.callNextLink("nextLink", "nextLinkFiFo", "onfinish", "onerror", "onprogress", resultRef, "progressList", progressRef);
                expect(progressRef).to.deep.equal(progressRefExpected);
            });
        });

        describe("handling of $top=X within progressRef", () => {
            it("should set $top=X as progressRef.count if $top=X is greater than 0 and less than the value of @iot.count", () => {
                const progressRef = {},
                    progressRefExpected = {
                        count: 1,
                        progress: 0
                    },
                    resultRef = [],
                    nextLink = "https://iot.hamburg.de/v1.0/Things?$top=1";

                http.setHttpClient((url, onsuccess) => {
                    onsuccess({
                        "@iot.count": 2
                    });
                });
                http.callNextLink(nextLink, "nextLinkFiFo", "onfinish", "onerror", "onprogress", resultRef, "progressList", progressRef);

                expect(progressRef).to.deep.equal(progressRefExpected);
            });
            it("should set @iot.count as progressRef.count if $top=X is zero", () => {
                const progressRef = {},
                    progressRefExpected = {
                        count: 2,
                        progress: 0
                    },
                    resultRef = [],
                    nextLink = "https://iot.hamburg.de/v1.0/Things";

                http.setHttpClient((url, onsuccess) => {
                    onsuccess({
                        "@iot.count": 2
                    });
                });
                http.callNextLink(nextLink, "nextLinkFiFo", "onfinish", "onerror", "onprogress", resultRef, "progressList", progressRef);

                expect(progressRef).to.deep.equal(progressRefExpected);
            });
            it("should set @iot.count as progressRef.count if $top=X is greater than @iot.count", () => {
                const progressRef = {},
                    progressRefExpected = {
                        count: 1,
                        progress: 0
                    },
                    resultRef = [],
                    nextLink = "https://iot.hamburg.de/v1.0/Things?$top=2";

                http.setHttpClient((url, onsuccess) => {
                    onsuccess({
                        "@iot.count": 1
                    });
                });
                http.callNextLink(nextLink, "nextLinkFiFo", "onfinish", "onerror", "onprogress", resultRef, "progressList", progressRef);

                expect(progressRef).to.deep.equal(progressRefExpected);
            });
        });
    });

    describe("handling of $skip=X within progressRef", () => {
        it("should set $skip=X as progressRef.progress if $skip=X is given via nextLink", () => {
            const progressRef = {},
                progressRefExpected = {
                    count: 1,
                    progress: 1
                },
                resultRef = [],
                nextLink = "https://iot.hamburg.de/v1.0/Things?$skip=1";

            http.setHttpClient((url, onsuccess) => {
                onsuccess({
                    "@iot.count": 1
                });
            });
            http.callNextLink(nextLink, "nextLinkFiFo", "onfinish", "onerror", "onprogress", resultRef, "progressList", progressRef);

            expect(progressRef).to.deep.equal(progressRefExpected);
        });
        it("should set $skip=X as progressRef.progress=0 if $skip=X is not given via nextLink", () => {
            const progressRef = {},
                progressRefExpected = {
                    count: 1,
                    progress: 0
                },
                resultRef = [],
                nextLink = "https://iot.hamburg.de/v1.0/Things";

            http.setHttpClient((url, onsuccess) => {
                onsuccess({
                    "@iot.count": 1
                });
            });
            http.callNextLink(nextLink, "nextLinkFiFo", "onfinish", "onerror", "onprogress", resultRef, "progressList", progressRef);

            expect(progressRef).to.deep.equal(progressRefExpected);
        });
    });

    describe("handling of response", () => {
        it("should add response onto resultRef as it is if response is a simple object", () => {
            const resultRef = [],
                response = {
                    test: true
                },
                resultRefExpected = [response];

            http.setHttpClient((url, onsuccess) => {
                onsuccess(response);
            });
            http.callNextLink("nextLink", "nextLinkFiFo", "onfinish", "onerror", "onprogress", resultRef, "progressList", "progressRef");

            expect(resultRef).to.deep.equal(resultRefExpected);
        });
        it("should add response onto resultRef as it is if response is an object with property value but content of value is no array", () => {
            const resultRef = [],
                response = {
                    value: true
                },
                resultRefExpected = [response];

            http.setHttpClient((url, onsuccess) => {
                onsuccess(response);
            });
            http.callNextLink("nextLink", "nextLinkFiFo", "onfinish", "onerror", "onprogress", resultRef, "progressList", "progressRef");

            expect(resultRef).to.deep.equal(resultRefExpected);
        });
        it("should add values of response.value onto resultRef if response.value is an array of anything", () => {
            const resultRef = [],
                response = {
                    value: [1, 2, 3, 4]
                },
                resultRefExpected = response.value;

            http.setHttpClient((url, onsuccess) => {
                onsuccess(response);
            });
            http.callNextLink("nextLink", "nextLinkFiFo", "onfinish", "onerror", "onprogress", resultRef, "progressList", "progressRef");

            expect(resultRef).to.deep.equal(resultRefExpected);
        });

        it("should add a new entry into fifo list if response has a property value and a plain @iot.nextLink", () => {
            const resultRef = [],
                nextLinkFiFo = [],
                response = {
                    "@iot.nextLink": "nextLink2",
                    value: [1, 2, 3, 4]
                },
                nextLinkFiFoExpected = [{
                    nextLink: "nextLink2",
                    resultRef: [1, 2, 3, 4],
                    progressRef: "progressRef"
                }];

            http.setHttpClient((url, onsuccess) => {
                onsuccess(response);
            });
            http.callNextLink("nextLink", nextLinkFiFo, "onfinish", "onerror", "onprogress", resultRef, "progressList", "progressRef", () => {
                // stop recursion: do nothing
            });

            expect(nextLinkFiFo).to.deep.equal(nextLinkFiFoExpected);
        });
        it("should leave fifo list as it is if fifo list isn't an array", () => {
            const resultRef = [],
                nextLinkFiFo = {},
                response = {
                    "@iot.nextLink": "nextLink2",
                    value: [1, 2, 3, 4]
                },
                nextLinkFiFoExpected = {};

            http.setHttpClient((url, onsuccess) => {
                onsuccess(response);
            });
            http.callNextLink("nextLink", nextLinkFiFo, "onfinish", "onerror", "onprogress", resultRef, "progressList", "progressRef", () => {
                // stop recursion: do nothing
            });

            expect(nextLinkFiFo).to.deep.equal(nextLinkFiFoExpected);
        });

        it("should set progressRef.progress to maximum if no further @iot.nextLink is received", () => {
            const resultRef = [],
                progressRef = {
                    count: 2,
                    progress: 1
                },
                progressRefExpected = {
                    count: 2,
                    progress: 2
                },
                response = {
                    value: [1, 2, 3, 4]
                };

            http.setHttpClient((url, onsuccess) => {
                onsuccess(response);
            });
            http.callNextLink("nextLink", "nextLinkFiFo", "onfinish", "onerror", "onprogress", resultRef, "progressList", progressRef, () => {
                // stop recursion: do nothing
            });

            expect(progressRef).to.deep.equal(progressRefExpected);
        });

        it("should call collectNextLinks with resultRef, nextLinkFiFo and progressList", () => {
            const resultRef = [],
                nextLinkFiFo = [],
                progressList = [{
                    count: 2,
                    progress: 1
                }],
                progressRef = progressList[0],
                response = {
                    value: [1, 2, 3, 4]
                },
                resultRefExpected = [1, 2, 3, 4],
                nextLinkFiFoExpected = [],
                progressListExpected = [{
                    count: 2,
                    progress: 2
                }];
            let lastResultRef = null,
                lastNextLinkFiFo = null,
                lastProgressList = null;

            http.setHttpClient((url, onsuccess) => {
                onsuccess(response);
            });
            http.callNextLink("nextLink", nextLinkFiFo, "onfinish", "onerror", "onprogress", resultRef, progressList, progressRef, (resultRefShadow, nextLinkFiFoShadow, progressListShadow) => {
                lastResultRef = resultRefShadow;
                lastNextLinkFiFo = nextLinkFiFoShadow;
                lastProgressList = progressListShadow;
            });

            expect(lastResultRef).to.deep.equal(resultRefExpected);
            expect(lastNextLinkFiFo).to.deep.equal(nextLinkFiFoExpected);
            expect(lastProgressList).to.deep.equal(progressListExpected);
        });
        it("should reduce nextLinkFiFo and start a recursion, following @iot.nextLink, adding result onto resultRef, should call onfinish if depth barrier is reached", () => {
            const resultRef = [],
                nextLinkFiFo = [],
                responseA = {
                    "@iot.nextLink": "https://iot.hamburg.de/v1.0/Things2",
                    value: [1, 2, 3, 4]
                },
                responseB = {
                    value: [5, 6, 7, 8]
                },
                resultRefExpected = [1, 2, 3, 4, 5, 6, 7, 8];
            let hasFinished = false;

            http.setHttpClient((url, onsuccess) => {
                if (url === "https://iot.hamburg.de/v1.0/Things?%24count=true") {
                    onsuccess(responseA);
                }
                else if (url === "https://iot.hamburg.de/v1.0/Things2?%24count=true") {
                    onsuccess(responseB);
                }
            });
            http.callNextLink("https://iot.hamburg.de/v1.0/Things", nextLinkFiFo, () => {
                // onfinish
                hasFinished = true;
            }, "onerror", "onprogress", resultRef, "progressList", "progressRef");

            expect(hasFinished).to.be.true;
            expect(resultRef).to.deep.equal(resultRefExpected);
        });
        it("should calc the progressList and call onprogress with the current overall value of progress", () => {
            const resultRef = [],
                nextLinkFiFo = [],
                progressList = [{
                    count: 1,
                    progress: 0
                }],
                progressRef = progressList[0],
                responseA = {
                    "@iot.count": 9,
                    "@iot.nextLink": "https://iot.hamburg.de/v1.0/Things2?$skip=4",
                    value: [1, 2, 3, 4]
                },
                responseB = {
                    "@iot.count": 9,
                    "@iot.nextLink": "https://iot.hamburg.de/v1.0/Things3?$skip=8",
                    value: [5, 6, 7, 8]
                },
                responseC = {
                    "@iot.count": 9,
                    value: [9]
                },
                receivedProgress = [],
                receivedProgressExpected = [0, 0.44, 1];

            http.setHttpClient((url, onsuccess) => {
                if (url === "https://iot.hamburg.de/v1.0/Things?%24count=true") {
                    onsuccess(responseA);
                }
                else if (url === "https://iot.hamburg.de/v1.0/Things2?%24skip=4&%24count=true") {
                    onsuccess(responseB);
                }
                else if (url === "https://iot.hamburg.de/v1.0/Things3?%24skip=8&%24count=true") {
                    onsuccess(responseC);
                }
            });
            http.callNextLink("https://iot.hamburg.de/v1.0/Things", nextLinkFiFo, "onfinish", "onerror", progress => {
                // onprogress
                receivedProgress.push(progress);
            }, resultRef, progressList, progressRef);

            expect(receivedProgress).to.deep.equal(receivedProgressExpected);
        });
    });

    describe("get", () => {
        it("should call this.callNextLink with specific parameters", () => {
            const lastNextLinkExpected = "url",
                lastResultRefExpected = [],
                lastNextLinkFiFoExpected = [],
                lastProgressListExpected = [{
                    count: 1,
                    progress: 0
                }],
                lastProgressRefExpected = {
                    count: 1,
                    progress: 0
                };
            let lastNextLink = null,
                onstartCalled = false,
                onsuccessCalled = false,
                oncompleteCalled = false,
                lastResultRef = null,
                lastNextLinkFiFo = null,
                lastProgressList = null,
                lastProgressRef = null;

            http.get("url", () => {
                // onsuccess
                onsuccessCalled = true;
            }, () => {
                // onstart
                onstartCalled = true;
            }, () => {
                // oncomplete
                oncompleteCalled = true;
            }, "onerror", "onprogress", (nextLink, nextLinkFiFo, onfinish, onerrorShadow, onprogress, resultRef, progressList, progressRef) => {
                lastNextLink = nextLink;
                lastNextLinkFiFo = nextLinkFiFo;
                lastResultRef = resultRef;
                lastProgressList = progressList;
                lastProgressRef = progressRef;
                onfinish();
            });

            expect(lastNextLink).to.equal(lastNextLinkExpected);
            expect(lastNextLinkFiFo).to.deep.equal(lastNextLinkFiFoExpected);
            expect(lastResultRef).to.deep.equal(lastResultRefExpected);
            expect(lastProgressList).to.deep.equal(lastProgressListExpected);
            expect(lastProgressRef).to.deep.equal(lastProgressRefExpected);
            expect(onstartCalled).to.be.true;
            expect(onsuccessCalled).to.be.true;
            expect(oncompleteCalled).to.be.true;
        });
        it("should call oncomplete if an error occurs", () => {
            let oncompleteCalled = false;

            http.get("url", "onsuccess", "onstart", () => {
                // oncomplete
                oncompleteCalled = true;
            }, "onerror", "onprogress", (nextLink, nextLinkFiFo, onfinish, onerrorShadow) => {
                onerrorShadow();
            });

            expect(oncompleteCalled).to.be.true;
        });
    });

    describe("getInExtent", () => {
        it("should add the extent to the url and call this.get", () => {
            const extentObj = {
                    extent: [557698.8791748052, 5925961.066824824, 573161.1208251948, 5941978.933175176],
                    sourceProjection: "EPSG:25832",
                    targetProjection: "EPSG:4326"
                },
                url = "https://iot.hamburg.de/v1.0/Things",
                lastUrlExpected = "https://iot.hamburg.de/v1.0/Things?%24filter=st_within(Thing%2FLocations%2Flocation%2Cgeography'POLYGON%20((9.869432803790303%2053.47946522163486%2C10.102382514144907%2053.47754336682167%2C10.10613018673993%2053.62149474831524%2C9.872388814958066%2053.623426671455626%2C9.869432803790303%2053.47946522163486))')";
            let lastUrl = null;

            http.getInExtent(url, extentObj, "onsuccess", "onstart", "oncomplete", "onerror", "onprogress", urlShadow => {
                lastUrl = urlShadow;
            });

            expect(lastUrl).to.equal(lastUrlExpected);
        });
    });
});
