import {expect} from "chai";
import sinon from "sinon";
import {parseFlightOptions} from "@modules/tools/virtualCity/flight";
import FlightPlayer from "@modules/tools/virtualCity/flightPlayer";

describe("flightPlayer", function () {
    let flightInstance,
        flightPlayer;
    const flightOptions = {
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
                    "duration": 1
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
                    "duration": 2
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
                    "duration": 3
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
                    "duration": 6
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

    afterEach(function () {
        sinon.restore();
    });

    describe("updateSplines", function () {
        it("should set DestinationSpline", function () {
            flightPlayer = new FlightPlayer({});
            flightInstance = parseFlightOptions(flightOptions);

            flightPlayer.setActiveFlightInstance(flightInstance);
            // 4 viewpoints
            expect(flightPlayer.get("destinationSpline").times).to.be.length(4);
            expect(flightPlayer.get("destinationSpline").points).to.be.length(4);
            // summed up duration between viewpoints = 1+2+3
            expect(flightPlayer.get("destinationSpline").times[flightPlayer.get("destinationSpline").times.length - 1]).to.be.equal(6);
        });

        it("should set take look into account for DestinationSpline", function () {
            flightPlayer = new FlightPlayer({});
            flightInstance = parseFlightOptions(flightOptions);

            flightInstance.set("loop", true);
            flightPlayer.setActiveFlightInstance(flightInstance);
            // 4 viewpoints + Loop
            expect(flightPlayer.get("destinationSpline").times).to.be.length(5);
            expect(flightPlayer.get("destinationSpline").points).to.be.length(5);
            // summed up duration between viewpoints = 1+2+3+6
            expect(flightPlayer.get("destinationSpline").times[flightPlayer.get("destinationSpline").times.length - 1]).to.be.equal(12);
        });

        it("should set QuaternionSpline", function () {
            flightPlayer = new FlightPlayer({});
            flightInstance = parseFlightOptions(flightOptions);

            flightPlayer.setActiveFlightInstance(flightInstance);
            // 4 viewpoints
            expect(flightPlayer.get("quaternionSpline").times).to.be.length(4);
            expect(flightPlayer.get("quaternionSpline").points).to.be.length(4);
            // summed up duration between viewpoints = 1+2+3
            expect(flightPlayer.get("quaternionSpline").times[flightPlayer.get("destinationSpline").times.length - 1]).to.be.equal(6);
        });

        it("should set endTime to summed up duration", function () {
            flightPlayer = new FlightPlayer({});
            flightInstance = parseFlightOptions(flightOptions);

            flightPlayer.setActiveFlightInstance(flightInstance);
            // 4 viewpoints
            expect(flightPlayer.get("endTime")).to.be.equal(6);
        });

        it("should set clock Times", function () {
            flightPlayer = new FlightPlayer({});
            flightInstance = parseFlightOptions(flightOptions);

            flightPlayer.setActiveFlightInstance(flightInstance);
            // 4 viewpoints
            expect(flightPlayer.get("times")).to.be.length(4);
        });
    });

    describe("play/stop", function () {
        let scene;

        beforeEach(function () {
            scene = new Cesium.Scene({
                canvas: document.createElement("canvas"),
                creditContainer: document.createElement("div")
            });
            sinon.stub(Radio, "request").callsFake(function (channel, topic) {
                if (topic === "isMap3d") {
                    return true;
                }
                else if (topic === "getMap3d") {
                    return {
                        getCesiumScene () {
                            return scene;
                        }
                    };
                }
                return null;
            });
        });
        it("should set playing", function () {
            flightPlayer = new FlightPlayer({});
            flightInstance = parseFlightOptions(flightOptions);

            flightPlayer.play(flightInstance);
            expect(flightPlayer.get("playing")).to.be.true;
        });
        it("should setup postRenderHandler", function () {
            flightPlayer = new FlightPlayer({});
            flightInstance = parseFlightOptions(flightOptions);

            flightPlayer.play(flightInstance);
            expect(flightPlayer.get("postRenderHandler")).to.be.not.null;
            expect(scene.postRender.numberOfListeners).to.be.equal(1);
        });
        it("should remove postRenderHandler on stop", function () {
            flightPlayer = new FlightPlayer({});
            flightInstance = parseFlightOptions(flightOptions);

            flightPlayer.play(flightInstance);
            expect(flightPlayer.get("postRenderHandler")).to.be.not.null;
            expect(scene.postRender.numberOfListeners).to.be.equal(1);
            flightPlayer.stop(flightInstance);
            expect(flightPlayer.get("postRenderHandler")).to.be.null;
            expect(scene.postRender.numberOfListeners).to.be.equal(0);
        });
        it("should set playing to false on stop", function () {
            flightPlayer = new FlightPlayer({});
            flightInstance = parseFlightOptions(flightOptions);

            flightPlayer.play(flightInstance);
            expect(flightPlayer.get("playing")).to.be.true;
            flightPlayer.stop(flightInstance);
            expect(flightPlayer.get("playing")).to.be.false;
        });
    });

    describe("cesiumPostRender", function () {
        let scene,
            clock;

        beforeEach(function () {
            scene = new Cesium.Scene({
                canvas: document.createElement("canvas"),
                creditContainer: document.createElement("div")
            });
            sinon.stub(Radio, "request").callsFake(function (channel, topic) {
                if (topic === "isMap3d") {
                    return true;
                }
                else if (topic === "getMap3d") {
                    return {
                        getCesiumScene () {
                            return scene;
                        }
                    };
                }
                return null;
            });
            clock = sinon.useFakeTimers(1);
        });
        it("should set the currentSystemTime", function () {
            flightPlayer = new FlightPlayer({});
            flightInstance = parseFlightOptions(flightOptions);

            flightPlayer.play(flightInstance);
            flightPlayer.cesiumPostRender(scene);
            expect(flightPlayer.get("currentSystemTime")).to.be.equal(1 / 1000);
            clock.tick(1);
            flightPlayer.cesiumPostRender(scene);
            expect(flightPlayer.get("currentSystemTime")).to.be.equal(2 / 1000);
        });
        it("should forward internal clock time", function () {
            flightPlayer = new FlightPlayer({});
            flightInstance = parseFlightOptions(flightOptions);

            flightPlayer.play(flightInstance);
            flightPlayer.cesiumPostRender(scene);
            clock.tick(1);
            flightPlayer.cesiumPostRender(scene);
            expect(flightPlayer.get("currentTime")).to.be.equal(1 / 1000);
        });
        it("should call stop if the end of the flight has been reached", function () {
            flightPlayer = new FlightPlayer({});
            flightInstance = parseFlightOptions(flightOptions);

            const spy = sinon.spy(flightPlayer, "stop");

            flightPlayer.play(flightInstance);
            flightPlayer.cesiumPostRender(scene);
            clock.tick(100000);
            flightPlayer.cesiumPostRender(scene);
            expect(spy.called).to.be.true;
        });
        it("should not call stop if the flight is set to repeat", function () {
            flightPlayer = new FlightPlayer({});
            flightInstance = parseFlightOptions(flightOptions);

            const spy = sinon.spy(flightPlayer, "stop");

            flightInstance.set("loop", true);
            flightPlayer.play(flightInstance);
            flightPlayer.cesiumPostRender(scene);
            clock.tick(100000);
            flightPlayer.cesiumPostRender(scene);
            expect(spy.called).to.be.false;
        });
    });
});
