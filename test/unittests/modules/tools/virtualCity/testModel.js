import VirtualCityModel from "@modules/tools/virtualCity/model.js";
import Planning from "@modules/tools/virtualCity/planning.js";
import {expect} from "chai";
import sinon from "sinon";

describe("tools/virtualCity/VirtualcityModel", function () {
    let virtualcity,
        server;
    const serviceResponse = [
            {
                "_id": "heYiQW6uqcimdKzsh",
                "public": true,
                "name": "Jannes Public Test 2",
                "description": null,
                "mapId": "BjtEA4zwBEiZeG2CX",
                "viewpoints": [
                    {
                        "distance": 626.9247041908594,
                        "cameraPosition": [
                            9.981406337095967,
                            53.53753196990922,
                            430.1009147589938
                        ],
                        "groundPosition": [
                            9.985240286957797,
                            53.54100639600626,
                            7.1572489285886185
                        ],
                        "heading": 33.3164127012332,
                        "pitch": -42.427671034342545,
                        "roll": 0.1373482179908807,
                        "animate": false,
                        "default": true,
                        "name": "VP1"
                    },
                    {
                        "distance": 629.9332119497135,
                        "cameraPosition": [
                            9.983073844743426,
                            53.53744762051688,
                            373.37366153256414
                        ],
                        "groundPosition": [
                            9.989917562975878,
                            53.539566084072355,
                            5.491185327552372
                        ],
                        "heading": 62.538996603998605,
                        "pitch": -35.7348297245556,
                        "roll": 0.20148506848612766,
                        "animate": false,
                        "default": false,
                        "name": "VP2"
                    }
                ],
                "planningObjects": [
                    {
                        "_id": "dpSsrRMRWihJDtr7h",
                        "type": "featureStore",
                        "status": "ready",
                        "name": "Vector",
                        "layerId": "PteeAtg54qw46BgY9",
                        "visibility": true
                    },
                    {
                        "_id": "qeNRRiQirepifQZqr",
                        "name": "Fernsehturm.kmz",
                        "type": "gltf",
                        "status": "ready",
                        "modelMeta": {
                            "longitude": 9.983855218485962,
                            "latitude": 53.54118328072724,
                            "height": 23.239969150439457,
                            "heading": -1.2502079000000208,
                            "pitch": 0,
                            "roll": 0,
                            "scale": 1
                        },
                        "visibility": true,
                        "url": "/models/s7S2Jwfr8GAacYsj.glb"
                    }
                ],
                "hiddenObjects": [
                    "DEHH_004f6ef3-a233-4c2b-a3fb-eaf2d2b15ce2"
                ],
                "lastUpdated": {
                    "user": "CmneWdSbr6crPj3pk",
                    "on": "2019-06-26T11:42:12.479Z"
                },
                "flights": []
            }
        ],
        serviceEntry = {
            "id": "virtualcityplanner",
            "name": "virtualcityplanner",
            "url": "https://devel.virtualcityplanner.de",
            "typ": "virtualcityPLANNER"
        };

    beforeEach(function () {
        virtualcity = new VirtualCityModel({serviceId: "virtualcityplanner"});
        virtualcity.initialize();
        server = sinon.createFakeServer();
        server.respondWith(JSON.stringify(serviceResponse));
        server.autoRespond = true;
        sinon.stub(Radio, "request").callsFake(function (channel, topic, arg) {
            if (channel === "RestReader" && topic === "getServiceById") {
                if (arg === "virtualcityplanner") {
                    return new Backbone.Model(serviceEntry);
                }
            }
            return undefined;
        });
    });

    afterEach(function () {
        sinon.restore();
        server.restore();
    });

    describe("getPlannings", function () {
        it("should reject if the serviceId is not defined", function () {
            virtualcity.set("serviceId", "notAvailable");
            return virtualcity.getPlannings().catch((err)=> {
                expect(err.toString()).to.equal("Error: Could not find service");
            });
        });
        it("should return one planningInstance", function () {
            return virtualcity.getPlannings().then((plannings)=> {
                expect(plannings).to.have.length(1);
            });
        });
        it("should use the planningCache on the second request", function () {
            return virtualcity.getPlannings().then(()=> {
                expect(server.requests).to.have.length(1);
            }).then(()=> {
                return virtualcity.getPlannings().then(()=> {
                    expect(server.requests).to.have.length(1);
                });
            });
        });
    });

    describe("getPlanningsById", function () {
        it("should reject if planning cannot be found", function () {
            return virtualcity.getPlanningById("test").catch((err)=> {
                expect(err.toString()).to.equal("Error: Could not find Planning");
            });
        });
        it("should return a planning", function () {
            return virtualcity.getPlanningById("heYiQW6uqcimdKzsh").then((planning)=> {
                expect(planning.id).to.equal("heYiQW6uqcimdKzsh");
                expect(planning).to.be.an.instanceof(Planning);
            });
        });
    });
});
