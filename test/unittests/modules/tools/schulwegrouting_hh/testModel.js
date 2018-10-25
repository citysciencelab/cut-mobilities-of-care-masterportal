import {expect} from "chai";
import Model from "@modules/tools/schulwegRouting_hh/model.js";
import Util from "@testUtil";
import {MultiLineString, Point} from "ol/geom.js";

describe("tools/schulwegrouting_hh", function () {
    var model,
        utilModel,
        schoolFeatures,
        routeParts = [
            {id: "513087", wkt: "LINESTRING(566318.249463363 5928187.98622225,566329.228 5928182.69)", length: "0.012"},
            {id: "500163", wkt: "LINESTRING(566329.228 5928182.69,566340.464 5928177.176,566350.576 5928172.392)", length: "0.024"},
            {id: "487902", wkt: "LINESTRING(566350.576 5928172.392,566355.385 5928170.072)", length: "0.005"},
            {id: "511351", wkt: "LINESTRING(566355.385 5928170.072,566399.619 5928149.21,566408.222 5928145.158)", length: "0.058"},
            {id: "495787", wkt: "LINESTRING(566408.222 5928145.158,566422.752 5928138.326)", length: "0.016"},
            {id: "507002", wkt: "LINESTRING(566422.752 5928138.326,566451.387 5928127,566459.758 5928120.884,566462.705 5928119.483)", length: "0.044"}
        ],
        addressList = [
            {
                affix: "a",
                joinAddress: "NeuenfelderStraße13a",
                number: "13",
                geometry: new Point([566326.134, 5928222.917]),
                street: "Neuenfelder Straße"
            },
            {
                affix: "a",
                joinAddress: "NeuenfelderStraße15a",
                number: "15",
                geometry: new Point([566376.183, 5928211.680]),
                street: "Neuenfelder Straße"
            },
            {
                affix: "b",
                joinAddress: "NeuenfelderStraße84b",
                number: "84",
                geometry: new Point([567147.825, 5927969.049]),
                street: "Neuenfelder Straße"
            },
            {
                affix: "a",
                joinAddress: "KielerStraße160a",
                number: "160",
                geometry: new Point([562202.187, 5936669.860]),
                street: "Kieler Straße"
            }
        ];

    before(function () {
        utilModel = new Util();
        schoolFeatures = utilModel.createTestFeatures("resources/testFeaturesSchulen.xml");
        model = new Model();
        model.setLayer(Radio.request("Map", "createLayerIfNotExists", "school_route_layer"));
        model.addRouteFeatures(model.get("layer").getSource());
        model.get("layer").setStyle(model.routeStyle);
    });

    describe("filteredAddressList", function () {
        it("should have the length of 3", function () {
            var filteredAddressList = model.filterAddressList(addressList, /neuenfelder/i);

            expect(filteredAddressList).to.have.lengthOf(3);
        });
        it("should have the length of 1", function () {
            var filteredAddressList = model.filterAddressList(addressList, /kiel/i);

            expect(filteredAddressList).to.have.lengthOf(1);
        });
        it("should have the attribute street with the value 'Neuenfelder Straße", function () {
            var filteredAddressList = model.filterAddressList(addressList, /neuenfelder/i);

            filteredAddressList.forEach(function (address) {
                expect(address).to.have.property("street", "Neuenfelder Straße");
            });
        });
        it("should have the attribute joinAddress with the value 'KielerStraße160a", function () {
            var filteredAddressList = model.filterAddressList(addressList, /kiel/i);

            expect(filteredAddressList[0]).to.have.property("joinAddress", "KielerStraße160a");
        });
    });

    describe("sortSchoolsByName", function () {
        it("should have a school with name 'Adolph-Schönfelder-Schule'", function () {
            var schoolList = model.sortSchoolsByName(schoolFeatures);

            expect(schoolList[0].get("schulname")).to.equal("Adolph-Schönfelder-Schule");
        });
    });

    describe("filterSchoolById", function () {
        it("should have a school with the id '5928-0'", function () {
            var schoolFeature = model.filterSchoolById(schoolFeatures, "5928-0");

            expect(schoolFeature.get("schul_id")).to.equal("5928-0");
        });
        it("should be undefined for a school with the id '5928-'", function () {
            var schoolFeature = model.filterSchoolById(schoolFeatures, "5928-");

            expect(schoolFeature).to.be.undefined;
        });
    });

    describe("setRoutePositionById", function () {
        it("should have the coordinates '567147.825 5927969.049' for the startpoint", function () {
            var feature;

            model.setGeometryByFeatureId("startPoint", model.get("layer").getSource(), new Point([567147.825, 5927969.049]));
            feature = model.get("layer").getSource().getFeatureById("startPoint");
            expect(feature.getGeometry().getCoordinates()).to.deep.equal([567147.825, 5927969.049]);
        });

        it("should have the coordinates '566326.134 5928222.917' for the endpoint", function () {
            var feature;

            model.setGeometryByFeatureId("endPoint", model.get("layer").getSource(), new Point([566326.134, 5928222.917]));
            feature = model.get("layer").getSource().getFeatureById("endPoint");
            expect(feature.getGeometry().getCoordinates()).to.deep.equal([566326.134, 5928222.917]);
        });
    });

    describe("startSearch", function () {
        it("should have no addresses if more than one street exists", function () {
            model.startSearch(["Neuenfelder Straße", "Neuenfelder Fährdeich", "Neuenfelder Hauptdeich"]);
            expect(model.get("addressList")).to.be.empty;
        });
        it("should have no filtered addresses if more than one street exists", function () {
            model.startSearch(["Neuenfelder Straße", "Neuenfelder Fährdeich", "Neuenfelder Hauptdeich"]);
            expect(model.get("addressListFiltered")).to.be.empty;
        });
        it("should have three filtered addresses with the search value 'Neuenf' if only one street exists", function () {
            model.setSearchRegExp("Neuenf");
            model.startSearch(["Neuenfelder Straße"], addressList);
            expect(model.get("addressListFiltered")).to.have.lengthOf(3);
        });
        it("should have one filtered addresses with the search value 'Kiel' if only one street exists", function () {
            model.setSearchRegExp("Kiel");
            model.startSearch(["Kieler Straße"], addressList);
            expect(model.get("addressListFiltered")).to.have.lengthOf(1);
        });
        it("should have one filtered addresses with the search value 'Kielerstraße1' if no streets exists", function () {
            model.setSearchRegExp("Kielerstraße1");
            model.startSearch([], addressList);
            expect(model.get("addressListFiltered")).to.have.lengthOf(1);
        });
        it("should have two filtered addresses with the search value 'neuenfelderstraße1' if no streets exists", function () {
            model.setSearchRegExp("neuenfelderstraße1");
            model.startSearch([], addressList);
            expect(model.get("addressListFiltered")).to.have.lengthOf(2);
        });
        it("should have one filtered addresses with the search value 'neuenfelderstraße13' if no streets exists", function () {
            model.setSearchRegExp("neuenfelderstraße13");
            model.startSearch([], addressList);
            expect(model.get("addressListFiltered")).to.have.lengthOf(1);
        });
    });

    describe("parseRoute", function () {
        it("should return a MultiLineString geometry", function () {
            var geometry = model.parseRoute(routeParts);

            expect(geometry instanceof MultiLineString).to.be.true;
        });
        it("should return a MultiLineString geometry with six LineStrings", function () {
            var geometry = model.parseRoute(routeParts);

            expect(geometry.getLineStrings()).to.have.length(6);
        });
        it("should return a MultiLineString geometry with an extent of '[566318.249463363, 5928119.483, 566462.705, 5928187.98622225]'", function () {
            var geometry = model.parseRoute(routeParts);

            expect(geometry.getExtent()).to.deep.equal([566318.249463363, 5928119.483, 566462.705, 5928187.98622225]);
        });

    });
    describe("prepareRouteDesc", function () {
        it("should return an array for empty array input", function () {
            expect(model.prepareRouteDesc([])).to.be.an("array");
        });
        it("should return an array for undefined input", function () {
            expect(model.prepareRouteDesc(undefined)).to.be.an("array");
        });
        it("should return an array for empty object input", function () {
            expect(model.prepareRouteDesc({})).to.be.an("array");
        });
        it("should return an array for given array[object] input", function () {
            var array = [
                {
                    anweisung: "test1"
                },
                {
                    anweisung: "test2"
                }
            ];

            expect(model.prepareRouteDesc(array)).to.be.an("array").to.deep.equal([["1", "test1"], ["2", "test2"]]);
        });

    });
});
