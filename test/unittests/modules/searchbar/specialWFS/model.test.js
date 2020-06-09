import Model from "@modules/searchbar/specialWFS/model.js";
import Util from "@testUtil";
import {expect} from "chai";

describe("modules/searchbar/specialWFS", function () {
    var model = {},
        multiPolygonFeaturesWithInteriorPolygons,
        multiPolygonFeaturesWithoutInteriorPolygons,
        config = {
            "minChars": 5,
            "maxFeatures": 1,
            "timeout": 10000,
            "definitions": [
                {
                    "url": "/geodienste_hamburg_de/MRH_WFS_Rotenburg",
                    "typeName": "app:mrh_row_bplan",
                    "propertyNames": ["app:name"],
                    "name": "B-Plan"
                },
                {
                    "url": "/geodienste_hamburg_de/HH_WFS_Bebauungsplaene",
                    "typeName": "app:prosin_festgestellt",
                    "propertyNames": ["app:planrecht"],
                    "geometryName": "app:geom",
                    "name": "festgestellt"
                },
                {
                    "url": "/geodienste_hamburg_de/HH_WFS_Bebauungsplaene",
                    "typeName": "app:prosin_imverfahren",
                    "propertyNames": ["app:plan"],
                    "geometryName": "app:the_geom",
                    "name": "im Verfahren"
                },
                {
                    "url": "/geodienste_hamburg_de/HH_WFS_KitaEinrichtung",
                    "typeName": "app:KitaEinrichtungen",
                    "propertyNames": ["app:Name"],
                    "name": "Kita"
                },
                {
                    "url": "/geodienste_hamburg_de/HH_WFS_Stoerfallbetriebe",
                    "typeName": "app:stoerfallbetrieb",
                    "propertyNames": ["app:standort"],
                    "name": "Störfallbetrieb"
                },
                {
                    "url": "/geodienste_hamburg_de/HH_WFS_Bebauungsplaene",
                    "data": "service=WFS&request=GetFeature&version=2.0.0&typeNames=prosin_festgestellt&propertyName=planrecht",
                    "name": "festgestellt"
                }]
        };

    before(function () {
        const utilModel = new Util();

        multiPolygonFeaturesWithInteriorPolygons = utilModel.getDescribeFeatureTypeResponse("resources/testFeaturesBplanMultiPolygonWithInteriorPolygon.xml");
        multiPolygonFeaturesWithoutInteriorPolygons = utilModel.getDescribeFeatureTypeResponse("resources/testFeaturesBplanMultiPolygonWithoutInteriorPolygon.xml");
        model = new Model(config);
    });

    describe("config", function () {
        it("should set timeout", function () {
            expect(model.get("timeout")).to.equal(10000);
        });
        it("should set minchar", function () {
            expect(model.get("minChars")).to.equal(5);
        });
        it("should set maxFeatures", function () {
            expect(model.get("maxFeatures")).to.equal(1);
        });
        it("should have definitions length of 6", function () {
            expect(model.get("definitions").length).to.equal(6);
        });
        it("should have set definition url", function () {
            expect(model.get("definitions")[0].url).to.equal("/geodienste_hamburg_de/MRH_WFS_Rotenburg");
        });
        it("should have set definition typeName", function () {
            expect(model.get("definitions")[0].typeName).to.equal("app:mrh_row_bplan");
        });
        it("should have set definition name", function () {
            expect(model.get("definitions")[0].name).to.equal("B-Plan");
        });
        it("should have set definition propertyNames", function () {
            expect(model.get("definitions")[0].propertyNames).to.be.an("array").that.includes("app:name");
        });
        it("should have set deprecated propertyNames", function () {
            expect(model.get("definitions")[5].propertyNames).to.be.an("array").that.includes("planrecht");
        });
        it("should have set deprecated typeName", function () {
            expect(model.get("definitions")[5].typeName).to.equal("prosin_festgestellt");
        });
        it("should set geometryName", function () {
            expect(model.get("definitions")[2].geometryName).to.equal("app:the_geom");
            expect(model.get("definitions")[1].geometryName).to.equal("app:geom");
        });
        it("should have set deprecated typeName", function () {
            expect(model.get("definitions")[5].typeName).to.equal("prosin_festgestellt");
        });
    });

    describe("getWFS110Xml", function () {
        it("should return WFS POST string", function () {
            expect(model.getWFS110Xml(model.get("definitions")[0], "Ham")).to.equal("<?xml version='1.0' encoding='UTF-8'?><wfs:GetFeature service='WFS' xmlns:wfs='http://www.opengis.net/wfs' xmlns:ogc='http://www.opengis.net/ogc' xmlns:gml='http://www.opengis.net/gml' traverseXlinkDepth='*' version='1.1.0'><wfs:Query typeName='app:mrh_row_bplan'><wfs:PropertyName>app:name</wfs:PropertyName><wfs:PropertyName>app:geom</wfs:PropertyName><wfs:maxFeatures>1</wfs:maxFeatures><ogc:Filter><ogc:PropertyIsLike matchCase='false' wildCard='*' singleChar='#' escapeChar='!'><ogc:PropertyName>app:name</ogc:PropertyName><ogc:Literal>*Ham*</ogc:Literal></ogc:PropertyIsLike></ogc:Filter></wfs:Query></wfs:GetFeature>");
        });
    });

    describe("getInteriorAndExteriorPolygonMembers", function () {
        it("should return an array with two arrays. First one with coordiantes, second one with indices", function () {
            const elements = Array.from(multiPolygonFeaturesWithInteriorPolygons.getElementsByTagNameNS("*", "polygonMember")),
                expectedResult = [
                    [
                        [
                            "560313.401", "5934298.407",
                            "560294.587", "5934301.811",
                            "560285.063", "5934303.535",
                            "560271.224", "5934294.941",
                            "560268.175", "5934295.831",
                            "560258.461", "5934229.981"
                        ],
                        [
                            "561016.997", "5933835.861",
                            "561017.451", "5933843.541",
                            "561061.576", "5933841.794"
                        ],
                        [
                            "561099.048", "5933643.820",
                            "561099.267", "5933651.168",
                            "561323.539", "5933598.007",
                            "561323.352", "5933600.283"
                        ]
                    ],
                    [1, 2]
                ];

            expect(model.getInteriorAndExteriorPolygonMembers(elements)).to.deep.equal(expectedResult);
        });
        it("should return an array with two arrays. First one with, second one without content", function () {
            const elements = Array.from(multiPolygonFeaturesWithoutInteriorPolygons.getElementsByTagNameNS("*", "polygonMember")),
                expectedResult = [
                    [
                        [
                            "560313.401", "5934298.407",
                            "560294.587", "5934301.811",
                            "560285.063", "5934303.535",
                            "560271.224", "5934294.941",
                            "560268.175", "5934295.831",
                            "560258.461", "5934229.981"
                        ]
                    ],
                    []
                ];

            expect(model.getInteriorAndExteriorPolygonMembers(elements)).to.deep.equal(expectedResult);
        });
        it("should return two empty arrays within an array", function () {
            expect(model.getInteriorAndExteriorPolygonMembers([])).to.deep.equal([[], []]);
        });
        it("should return two empty arrays within an array", function () {
            expect(model.getInteriorAndExteriorPolygonMembers("")).to.deep.equal([[], []]);
        });
        it("should return two empty arrays within an array", function () {
            expect(model.getInteriorAndExteriorPolygonMembers(false)).to.deep.equal([[], []]);
        });
        it("should return two empty arrays within an array", function () {
            expect(model.getInteriorAndExteriorPolygonMembers(NaN)).to.deep.equal([[], []]);
        });


    });
});
