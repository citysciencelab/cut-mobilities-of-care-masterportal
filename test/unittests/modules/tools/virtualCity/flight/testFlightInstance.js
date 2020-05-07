import {expect} from "chai";
import FlightInstance, {parseFlightOptions} from "@modules/tools/virtualcity/flight";


describe("flightInstance", function () {
    let flightInstance;
    const viewpoints = [{
            "distance": 1660.0290142521517,
            "cameraPosition": [
                9.982163927085617,
                53.532817572762475,
                1180.9805498821436
            ],
            "groundPosition": [
                9.983171185370468,
                53.54328139366739,
                -0.00449886760542777
            ],
            "heading": 3.281512334248587,
            "pitch": -45.35612834848329,
            "roll": 0.015054499334397243,
            "animate": false,
            "duration": 6.006336273348537
        },
        {
            "distance": 1705.907088455769,
            "cameraPosition": [
                9.96041221854439,
                53.542118113676594,
                873.4567728474242
            ],
            "groundPosition": [
                9.982398029904456,
                53.540770835322895,
                -0.00460393526485022
            ],
            "heading": 95.86491739737984,
            "pitch": -30.805154901441753,
            "roll": 0.21319256465688782,
            "animate": false,
            "duration": 6.750587435155612
        }],
        invalidViewpoints = [{
            "distance": 1660.0290142521517,
            "groundPosition": [
                9.983171185370468,
                53.54328139366739,
                -0.00449886760542777
            ],
            "heading": 3.281512334248587,
            "pitch": -45.35612834848329,
            "roll": 0.015054499334397243,
            "animate": false,
            "duration": 6.006336273348537
        },
        {
            "distance": 1705.907088455769,
            "cameraPosition": [
                9.96041221854439,
                53.542118113676594,
                873.4567728474242
            ],
            "groundPosition": [
                9.982398029904456,
                53.540770835322895,
                -0.00460393526485022
            ],
            "heading": 95.86491739737984,
            "pitch": -30.805154901441753,
            "roll": 0.21319256465688782,
            "animate": false,
            "duration": 6.750587435155612
        }],
        flightOptions = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "properties": {
                        "distance": 1660.0290142521517,
                        "cameraPosition": [
                            9.982163927085617,
                            53.532817572762475,
                            1180.9805498821436
                        ],
                        "groundPosition": [
                            9.983171185370468,
                            53.54328139366739,
                            -0.00449886760542777
                        ],
                        "heading": 3.281512334248587,
                        "pitch": -45.35612834848329,
                        "roll": 0.015054499334397243,
                        "animate": false,
                        "duration": 6.006336273348537
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [
                            9.982163927085617,
                            53.53281757276244,
                            1180.9805498821436
                        ]
                    },
                    "vcsMeta": {}
                },
                {
                    "type": "Feature",
                    "properties": {
                        "distance": 1705.907088455769,
                        "cameraPosition": [
                            9.96041221854439,
                            53.542118113676594,
                            873.4567728474242
                        ],
                        "groundPosition": [
                            9.982398029904456,
                            53.540770835322895,
                            -0.00460393526485022
                        ],
                        "heading": 95.86491739737984,
                        "pitch": -30.805154901441753,
                        "roll": 0.21319256465688782,
                        "animate": false,
                        "duration": 6.750587435155612
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [
                            9.96041221854439,
                            53.542118113676594,
                            873.4567728474242
                        ]
                    },
                    "vcsMeta": {}
                },
                {
                    "type": "Feature",
                    "properties": {
                        "distance": 1721.9241572409096,
                        "cameraPosition": [
                            9.96741704029211,
                            53.55979021716194,
                            1000.3674142046754
                        ],
                        "groundPosition": [
                            9.976594426460109,
                            53.54844621820403,
                            -0.00455025970730299
                        ],
                        "heading": 154.27408943822633,
                        "pitch": -35.52452990189671,
                        "roll": 0.09797416457143884,
                        "animate": false,
                        "duration": 10.164973046635186
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [
                            9.96741704029211,
                            53.55979021716195,
                            1000.3674142046754
                        ]
                    },
                    "vcsMeta": {}
                },
                {
                    "type": "Feature",
                    "properties": {
                        "distance": 1718.8341567940654,
                        "cameraPosition": [
                            10.013016284898717,
                            53.55614227861584,
                            979.2726750181796
                        ],
                        "groundPosition": [
                            9.995089524833372,
                            53.549279147554216,
                            -0.003979305788798702
                        ],
                        "heading": 237.27037454138943,
                        "pitch": -34.73796369256651,
                        "roll": 359.8117797719654,
                        "animate": false,
                        "duration": null
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [
                            10.013016284898718,
                            53.55614227861585,
                            979.2726750181796
                        ]
                    },
                    "vcsMeta": {}
                }
            ],
            "vcsMeta": {
                "flightOptions": {
                    "name": "Name | Name eingeben",
                    "loop": false,
                    "interpolation": "spline"
                },
                "version": "1.0"
            }
        };

    describe("constructor", function () {
        it("should set name property", function () {
            flightInstance = new FlightInstance({"name": "name"});
            expect(flightInstance.get("name")).to.be.equal("name");
        });
        it("should set loop property", function () {
            flightInstance = new FlightInstance({"loop": true});
            expect(flightInstance.get("loop")).to.be.true;
        });
        it("should set viewpoints property", function () {
            flightInstance = new FlightInstance({"viewpoints": viewpoints});
            expect(flightInstance.get("viewpoints")).to.be.equal(viewpoints);
        });
        it("should set interpolation property", function () {
            flightInstance = new FlightInstance({"interpolation": "linear"});
            expect(flightInstance.get("interpolation")).to.be.equal("linear");
        });
    });

    describe("isValid", function () {
        it("should return true on valid viewpoints", function () {
            flightInstance = new FlightInstance({"viewpoints": viewpoints});
            expect(flightInstance.isValid()).to.be.true;
        });
        it("should return false on invalid viewpoints", function () {
            flightInstance = new FlightInstance({"viewpoints": invalidViewpoints});
            expect(flightInstance.isValid()).to.be.false;
        });
    });

    describe("parseFlightOptions", function () {
        it("should set name property", function () {
            flightInstance = parseFlightOptions(flightOptions);
            expect(flightInstance.get("name")).to.be.equal("Name | Name eingeben");
        });
        it("should set loop property", function () {
            flightInstance = parseFlightOptions(flightOptions);
            expect(flightInstance.get("loop")).to.be.false;
        });
        it("should set viewpoints property", function () {
            flightInstance = parseFlightOptions(flightOptions);
            expect(flightInstance.get("viewpoints")).to.be.length(4);
        });
        it("should set interpolation property", function () {
            flightInstance = parseFlightOptions(flightOptions);
            expect(flightInstance.get("interpolation")).to.be.equal("spline");
        });
    });
});
