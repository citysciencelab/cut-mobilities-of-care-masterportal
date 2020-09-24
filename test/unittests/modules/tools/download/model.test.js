import Model from "@modules/tools/download/model.js";
import {expect} from "chai";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import Line from "ol/geom/LineString";
import Polygon from "ol/geom/Polygon";
import {KML, GeoJSON, GPX} from "ol/format";

describe("downloadModel", function () {
    let model;

    before(function () {
        model = new Model();
    });
    describe("validateFileNameAndExtension", function () {
        it("should return undefined for unset fileName and unset selectedFormat", function () {
            expect(model.validateFileNameAndExtension()).to.be.undefined;
        });
        it("should return filename with format", function () {
            model.setFileName("Foo");
            model.setSelectedFormat("bar");
            expect(model.validateFileNameAndExtension()).to.equal("Foo.bar");
        });
        it("should return filename with format on user input with fileextension", function () {
            model.setFileName("Foo.bar");
            model.setSelectedFormat("bar");
            expect(model.validateFileNameAndExtension()).to.equal("Foo.bar");
        });
        it("should return undefined for empty filename", function () {
            model.setFileName("");
            model.setSelectedFormat("bar");
            expect(model.validateFileNameAndExtension()).to.be.undefined;
        });
        it("should return undefined for empty format", function () {
            model.setFileName("foo");
            model.setSelectedFormat("");
            expect(model.validateFileNameAndExtension()).to.be.undefined;
        });
    });
    describe("convertFeatures", function () {
        it("should convert features to kml string", function () {
            const features = [
                    new Feature({
                        geometry: new Point(
                            [690054.1273707711, 5340593.1785796825]
                        )
                    }),
                    new Feature({
                        geometry: new Line([
                            [689800.1275079311, 5339513.679162612],
                            [691403.501642109, 5339640.679094031],
                            [691848.0014020792, 5340259.803759704]
                        ])
                    }),
                    new Feature({
                        geometry: new Polygon([[
                            [689546.127645091, 5338656.429625526],
                            [693324.3756048371, 5339497.804171184],
                            [691609.8765306666, 5335989.431065706],
                            [689546.127645091, 5338656.429625526]
                        ]])
                    })

                ],
                format = new KML({extractStyles: true, showPointNames: false});

            expect(model.convertFeatures(features, format)).to.equal(
                "<kml xmlns=\"http://www.opengis.net/kml/2.2\" xmlns:gx=\"http://www.google.com/kml/ext/2.2\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"http://www.opengis.net/kml/2.2 https://developers.google.com/kml/schema/kml22gx.xsd\"><Document><Placemark><Point><coordinates>11.557298950358712,48.19011266676286</coordinates></Point></Placemark><Placemark><LineString><coordinates>11.553402467114491,48.18048612894288 11.575007532544808,48.18114662023035 11.581260790292623,48.18657710798541</coordinates></LineString></Placemark><Placemark><Polygon><outerBoundaryIs><LinearRing><coordinates>11.549606597773037,48.17285700012215 11.600757126507961,48.179280978813836 11.57613610823175,48.148267667042006 11.549606597773037,48.17285700012215</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark></Document></kml>"
            );
        });
        it("should convert features to geojson string", function () {
            const features = [
                    new Feature({
                        geometry: new Point(
                            [690054.1273707711, 5340593.1785796825]
                        )
                    }),
                    new Feature({
                        geometry: new Line([
                            [689800.1275079311, 5339513.679162612],
                            [691403.501642109, 5339640.679094031],
                            [691848.0014020792, 5340259.803759704]
                        ])
                    }),
                    new Feature({
                        geometry: new Polygon([[
                            [689546.127645091, 5338656.429625526],
                            [693324.3756048371, 5339497.804171184],
                            [691609.8765306666, 5335989.431065706],
                            [689546.127645091, 5338656.429625526]
                        ]])
                    })
                ],
                format = new GeoJSON();

            expect(model.convertFeatures(features, format)).to.equal(
                "{\"type\":\"FeatureCollection\",\"features\":[{\"type\":\"Feature\",\"geometry\":{\"type\":\"Point\",\"coordinates\":[11.557298950358712,48.19011266676286]},\"properties\":null},{\"type\":\"Feature\",\"geometry\":{\"type\":\"LineString\",\"coordinates\":[[11.553402467114491,48.18048612894288],[11.575007532544808,48.18114662023035],[11.581260790292623,48.18657710798541]]},\"properties\":null},{\"type\":\"Feature\",\"geometry\":{\"type\":\"Polygon\",\"coordinates\":[[[11.549606597773037,48.17285700012215],[11.600757126507961,48.179280978813836],[11.57613610823175,48.148267667042006],[11.549606597773037,48.17285700012215]]]},\"properties\":null}]}"
            );
        });
        it("should convert features to gpx string", function () {
            const features = [
                    new Feature({
                        geometry: new Point(
                            [690054.1273707711, 5340593.1785796825]
                        )
                    }),
                    new Feature({
                        geometry: new Line([
                            [689800.1275079311, 5339513.679162612],
                            [691403.501642109, 5339640.679094031],
                            [691848.0014020792, 5340259.803759704]
                        ])
                    }),
                    new Feature({
                        geometry: new Polygon([[
                            [689546.127645091, 5338656.429625526],
                            [693324.3756048371, 5339497.804171184],
                            [691609.8765306666, 5335989.431065706],
                            [689546.127645091, 5338656.429625526]
                        ]])
                    })
                ],
                format = new GPX();

            expect(model.convertFeatures(features, format)).to.equal(
                "<gpx xmlns=\"http://www.topografix.com/GPX/1/1\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd\" version=\"1.1\" creator=\"OpenLayers\"><wpt lat=\"48.19011266676286\" lon=\"11.557298950358712\"/><rte><rtept lat=\"48.18048612894288\" lon=\"11.553402467114491\"/><rtept lat=\"48.18114662023035\" lon=\"11.575007532544808\"/><rtept lat=\"48.18657710798541\" lon=\"11.581260790292623\"/></rte></gpx>"
            );
        });
    });
    describe("getProjections", function () {
        it("should object with properties sourceProj and destProj", function () {
            expect(model.getProjections("EPSG:25832", "EPSG:4326", "32")).to.be.an("object").to.have.ownPropertyDescriptor("sourceProj");
            expect(model.getProjections("EPSG:25832", "EPSG:4326", "32")).to.be.an("object").to.have.ownPropertyDescriptor("destProj");
        });
    });
    describe("transformCoords", function () {
        it("should transform coords for point input", function () {
            const geometry = new Point(
                    [690054.1273707711, 5340593.1785796825]
                ),
                projections = model.getProjections("EPSG:25832", "EPSG:4326", "32");

            expect(model.transformCoords(geometry, projections)).to.deep.equal(
                [11.557298950358712, 48.19011266676286]
            );
        });
        it("should transform coords for line input", function () {
            const geometry = new Line([
                    [689800.1275079311, 5339513.679162612],
                    [691403.501642109, 5339640.679094031],
                    [691848.0014020792, 5340259.803759704]
                ]),
                projections = model.getProjections("EPSG:25832", "EPSG:4326", "32");

            expect(model.transformCoords(geometry, projections)).to.deep.equal(
                [
                    [11.553402467114491, 48.18048612894288],
                    [11.575007532544808, 48.18114662023035],
                    [11.581260790292623, 48.18657710798541]
                ]
            );
        });
        it("should transform coords for polygon input", function () {
            const geometry = new Polygon([[
                    [689546.127645091, 5338656.429625526],
                    [693324.3756048371, 5339497.804171184],
                    [691609.8765306666, 5335989.431065706],
                    [689546.127645091, 5338656.429625526]
                ]]),
                projections = model.getProjections("EPSG:25832", "EPSG:4326", "32");

            expect(model.transformCoords(geometry, projections)).to.deep.equal(
                [[
                    [11.549606597773037, 48.17285700012215],
                    [11.600757126507961, 48.179280978813836],
                    [11.57613610823175, 48.148267667042006],
                    [11.549606597773037, 48.17285700012215]
                ]]
            );
        });
    });
    describe("transformPoint", function () {
        it("should transform coords for point input", function () {
            const coord = [690054.1273707711, 5340593.1785796825],
                projections = model.getProjections("EPSG:25832", "EPSG:4326", "32");

            expect(model.transformPoint(coord, projections)).to.deep.equal(
                [11.557298950358712, 48.19011266676286]
            );
        });
    });
    describe("transformLine", function () {
        it("should transform coords for line input", function () {
            const coord = [
                    [689800.1275079311, 5339513.679162612],
                    [691403.501642109, 5339640.679094031],
                    [691848.0014020792, 5340259.803759704]
                ],
                projections = model.getProjections("EPSG:25832", "EPSG:4326", "32");

            expect(model.transformLine(coord, projections)).to.deep.equal(
                [
                    [11.553402467114491, 48.18048612894288],
                    [11.575007532544808, 48.18114662023035],
                    [11.581260790292623, 48.18657710798541]
                ]
            );
        });
    });
    describe("transformPolygon", function () {
        it("should transform coords for polygon input", function () {
            const coord = [[
                    [689546.127645091, 5338656.429625526],
                    [693324.3756048371, 5339497.804171184],
                    [691609.8765306666, 5335989.431065706],
                    [689546.127645091, 5338656.429625526]
                ]],
                projections = model.getProjections("EPSG:25832", "EPSG:4326", "32");

            expect(model.transformPolygon(coord, projections)).to.deep.equal(
                [[
                    [11.549606597773037, 48.17285700012215],
                    [11.600757126507961, 48.179280978813836],
                    [11.57613610823175, 48.148267667042006],
                    [11.549606597773037, 48.17285700012215]
                ]]
            );
        });
    });
});
