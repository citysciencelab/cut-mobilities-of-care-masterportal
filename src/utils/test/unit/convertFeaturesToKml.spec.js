import {expect} from "chai";
import {Style, Text} from "ol/style.js";
import Icon from "ol/style/Icon";

import * as actions from "../../convertFeaturesToKml";

import {KML} from "ol/format";
import Feature from "ol/Feature";
import Line from "ol/geom/LineString";
import Point from "ol/geom/Point";
import Polygon from "ol/geom/Polygon";
import Circle from "ol/geom/Circle";

describe("src/utils/convertFeaturesToKml.js", () => {
    let features;

    describe("convertFeaturesToKml", () => {
        // As these don't need to be transformed for this test, they are already in EPSG:4326
        beforeEach(() => {
            const line = new Line([
                    [11.553402467114491, 48.18048612894288],
                    [11.575007532544808, 48.18114662023035],
                    [11.581260790292623, 48.18657710798541]
                ]),
                point = new Point([11.557298950358712, 48.19011266676286]),
                polygon = new Polygon([[
                    [11.549606597773037, 48.17285700012215],
                    [11.600757126507961, 48.179280978813836],
                    [11.57613610823175, 48.148267667042006],
                    [11.549606597773037, 48.17285700012215]
                ]]),
                style = new Style({
                    text: new Text({
                        text: "Text",
                        textAlign: "center",
                        textBaseline: "middle",
                        offsetY: 7,
                        font: "12px sans-serif"
                    }),
                    image: new Icon({
                        src: "https://geofos.fhhnet.stadt.hamburg.de/lgv-config/img/Vorlage_bombe.jpg",
                        scale: 1,
                        opacity: 1
                    }),
                    zIndex: 0
                });

            features = [point, line, polygon].map(geometry => new Feature({geometry}));

            features[0].setStyle(style);
        });

        it("should convert features to a KML String", async () => {
            const resultStr = await actions.convertFeatures(features, new KML({extractStyles: true})),
                expectedStr = "<kml xmlns=\"http://www.opengis.net/kml/2.2\" xmlns:gx=\"http://www.google.com/kml/ext/2.2\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"http://www.opengis.net/kml/2.2 https://developers.google.com/kml/schema/kml22gx.xsd\"><Document><Placemark><name>Text</name><Style><IconStyle><Icon><href>https://geofos.fhhnet.stadt.hamburg.de/lgv-config/img/Vorlage_bombe.jpg</href></Icon></IconStyle><LabelStyle><color>ff333333</color></LabelStyle></Style><Point><coordinates>4.51135965729457,0.00043464479558792565</coordinates></Point></Placemark><Placemark><LineString><coordinates>4.511359622386033,0.00043455797019284264 4.511359815945773,0.0004345639275288218 4.511359871968666,0.00043461290717897535</coordinates></LineString></Placemark><Placemark><Polygon><outerBoundaryIs><LinearRing><coordinates>4.5113595883788875,0.00043448916018316755 4.511360046636338,0.0004345471007437477 4.511359826056848,0.00043426737985943244 4.5113595883788875,0.00043448916018316755</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark></Document></kml>";

            expect(resultStr).to.equal(expectedStr);
        });
    });

    describe("transformCoordinates", () => {
        it("should transform point coordinates from EPSG:25832 to EPSG:4326", () => {
            const geometry = new Point([690054.1273707711, 5340593.1785796825]);

            expect(actions.transformCoordinates(geometry)).to.eql(
                [11.557298950358712, 48.19011266676286]
            );
        });

        it("should transform line coordinates from EPSG:25832 to EPSG:4326", () => {
            const geometry = new Line([
                [689800.1275079311, 5339513.679162612],
                [691403.501642109, 5339640.679094031],
                [691848.0014020792, 5340259.803759704]
            ]);

            expect(actions.transformCoordinates(geometry)).to.eql(
                [
                    [11.553402467114491, 48.18048612894288],
                    [11.575007532544808, 48.18114662023035],
                    [11.581260790292623, 48.18657710798541]
                ]
            );
        });

        it("should transform polygon coordinates from EPSG:25832 to EPSG:4326", () => {
            const geometry = new Polygon([[
                [689546.127645091, 5338656.429625526],
                [693324.3756048371, 5339497.804171184],
                [691609.8765306666, 5335989.431065706],
                [689546.127645091, 5338656.429625526]
            ]]);

            expect(actions.transformCoordinates(geometry)).to.eql(
                [[
                    [11.549606597773037, 48.17285700012215],
                    [11.600757126507961, 48.179280978813836],
                    [11.57613610823175, 48.148267667042006],
                    [11.549606597773037, 48.17285700012215]
                ]]
            );
        });

        it("should not transform the geometry if it is neither a Line, Point or Polygon and return an empty Array", () => {
            const geometry = new Circle([690054.1273707711, 5340593.1785796825], 5);

            expect(actions.transformCoordinates(geometry)).to.eql([]);
        });
    });
});
