define(function (require) {
    var expect = require("chai").expect,
        Util = require("util"),
        Model = require("../../../../../modules/tools/schulwegrouting_hh/model.js");

    describe("tools/schulwegrouting_hh", function () {
        var model,
            utilModel,
            schoolFeatures,
            addressList = [
                {
                    affix: "a",
                    joinAddress: "NeuenfelderStraße13a",
                    number: "13",
                    position: [566326.134, 5928222.917],
                    street: "Neuenfelder Straße"
                },
                {
                    affix: "a",
                    joinAddress: "NeuenfelderStraße15a",
                    number: "15",
                    position: [566376.183, 5928211.680],
                    street: "Neuenfelder Straße"
                },
                {
                    affix: "b",
                    joinAddress: "NeuenfelderStraße84b",
                    number: "84",
                    position: [567147.825, 5927969.049],
                    street: "Neuenfelder Straße"
                },
                {
                    affix: "a",
                    joinAddress: "KielerStraße160a",
                    number: "160",
                    position: [562202.187, 5936669.860],
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
            it("should have a school with the id 'APP_STAATLICHE_SCHULEN_172968'", function () {
                var schoolList = model.sortSchoolsByName(schoolFeatures);

                expect(schoolList[0].get("schulname")).to.equal("Adolph-Schönfelder-Schule");
            });
        });

        describe("filterSchoolById", function () {
            it("should have a school with the id 'APP_STAATLICHE_SCHULEN_172968'", function () {
                var schoolFeature = model.filterSchoolById(schoolFeatures, "APP_STAATLICHE_SCHULEN_172968");

                expect(schoolFeature.getId()).to.equal("APP_STAATLICHE_SCHULEN_172968");
            });
            it("should be undefined for a school with the id 'AP_STTCHE_SHLEN_268'", function () {
                var schoolFeature = model.filterSchoolById(schoolFeatures, "AP_STTCHE_SHLEN_268");

                expect(schoolFeature).to.be.undefined;
            });
        });

        describe("setRoutePositionById", function () {
            it("should have the coordinates '567147.825 5927969.049' for the startpoint", function () {
                var feature;

                model.setRoutePositionById("startPoint", model.get("layer").getSource(), [567147.825, 5927969.049]);
                feature = model.get("layer").getSource().getFeatureById("startPoint");
                expect(feature.getGeometry().getCoordinates()).to.deep.equal([567147.825, 5927969.049]);
            });

            it("should have the coordinates '566326.134 5928222.917' for the endpoint", function () {
                var feature;

                model.setRoutePositionById("endPoint", model.get("layer").getSource(), [566326.134, 5928222.917]);
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
    });
});
