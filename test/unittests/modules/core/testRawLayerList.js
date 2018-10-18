import {expect} from "chai";
import Model from "@modules/core/rawLayerList.js";

describe("core/rawLayerList", function () {
    var model,
        testServices = [
            {
                id: "683",
                name: "Kindertagesstaetten Details",
                url: "https://geodienste.hamburg.de/HH_WMS_KitaEinrichtung",
                typ: "WMS",
                layers: "KitaEinrichtungen_Details",
                format: "image/png",
                version: "1.3.0",
                singleTile: false,
                transparent: true,
                transparency: 0,
                tilesize: "512",
                gutter: "20",
                minScale: "0",
                maxScale: "2500000",
                gfiAttributes: "showAll",
                gfiTheme: "default",
                gfiComplex: true,
                layerAttribution: "nicht vorhanden",
                legendURL: "",
                cache: false,
                featureCount: "1",
                datasets: [{
                    md_id: "C1AC42B2-C104-45B8-91F9-DA14C3C88A1F",
                    rs_id: "HMDK/6fdc7be8-520c-44ee-8e9a-855bac1b6a6b",
                    md_name: "Kita Einrichtungen Hamburg",
                    bbox: "461468.97,5916367.23,587010.91,5980347.76",
                    kategorie_opendata: [
                        "Sonstiges"
                    ],
                    kategorie_inspire: [
                        "Versorgungswirtschaft und staatliche Dienste"
                    ],
                    kategorie_organisation: "Behörde für Arbeit, Soziales, Familie und Integration"
                }]
            },
            {
                id: "682",
                name: "Kindertagesstaetten",
                url: "https://geodienste.hamburg.de/HH_WMS_KitaEinrichtung",
                typ: "WMS",
                layers: "KitaEinrichtungen",
                format: "image/png",
                version: "1.3.0",
                singleTile: false,
                transparent: true,
                transparency: 0,
                tilesize: "512",
                gutter: "20",
                minScale: "0",
                maxScale: "2500000",
                gfiAttributes: "showAll",
                gfiTheme: "default",
                gfiComplex: true,
                layerAttribution: "nicht vorhanden",
                legendURL: "",
                cache: false,
                featureCount: "1",
                datasets: [{
                    md_id: "C1AC42B2-C104-45B8-91F9-DA14C3C88A1F",
                    rs_id: "HMDK/6fdc7be8-520c-44ee-8e9a-855bac1b6a6b",
                    md_name: "Kita Einrichtungen Hamburg",
                    bbox: "461468.97,5916367.23,587010.91,5980347.76",
                    kategorie_opendata: [
                        "Sonstiges"
                    ],
                    kategorie_inspire: [
                        "Versorgungswirtschaft und staatliche Dienste"
                    ],
                    kategorie_organisation: "Behörde für Arbeit, Soziales, Familie und Integration"
                }]
            },
            {
                id: "1731",
                name: "Krankenhaeuser",
                url: "https://geodienste.hamburg.de/HH_WMS_Krankenhaeuser",
                typ: "WMS",
                layers: "krankenhaeuser",
                format: "image/png",
                version: "1.3.0",
                singleTile: false,
                transparent: true,
                tilesize: 512,
                gutter: 7,
                transparency: 0,
                minScale: "0",
                maxScale: "2500000",
                gfiAttributes: "showAll",
                gfiTheme: "default",
                layerAttribution: null,
                legendURL: "",
                cache: false,
                featureCount: 1,
                datasets: [{
                    md_id: "9329C2CB-4552-4780-B343-0CC847538896",
                    rs_id: "https://registry.gdi-de.org/id/de.hh/010d7370-5306-4b63-983b-59cdd6e94c3c",
                    md_name: "Krankenhäuser Hamburg",
                    bbox: "461468.97,5916367.23,587010.91,5980347.76",
                    kategorie_opendata: [
                        "Gesundheit"
                    ],
                    kategorie_inspire: [
                        "Versorgungswirtschaft und staatliche Dienste"
                    ],
                    kategorie_organisation: "Behörde für Gesundheit und Verbraucherschutz"
                }]
            },
            {
                id: "1933",
                name: "Haltestellen",
                url: "http://geodienste.hamburg.de/wms_hvv",
                typ: "WMS",
                layers: "geofox_workspace:geofoxdb_stations",
                format: "image/png",
                version: "1.3.0",
                singleTile: false,
                transparent: true,
                tilesize: 512,
                gutter: 7,
                transparency: 0,
                minScale: "0",
                maxScale: "2500000",
                gfiAttributes: "showAll",
                gfiTheme: "default",
                layerAttribution: null,
                legendURL: "",
                cache: false,
                featureCount: 1,
                datasets: [{
                    md_id: "7A77D5EA-C3B4-44D9-8004-36D5D324485D",
                    rs_id: "https://registry.gdi-de.org/id/de.hh/418f6d9e-675c-493c-b56b-ea155db99464",
                    md_name: "HVV Streckennetz für Bahn-, Bus- und Fährlinien Hamburg",
                    bbox: "461468.97,5916367.23,587010.91,5980347.76",
                    kategorie_opendata: [
                        "Transport und Verkehr"
                    ],
                    kategorie_inspire: [
                        "Verkehrsnetze"
                    ],
                    kategorie_organisation: "Hamburger Verkehrsverbund GmbH"
                }]
            }
        ];

    before(function () {
        model = new Model({"url": function () {
            return "../../resources/testServices.json";
        }});
    });
    describe("parse", function () {
        it("should return an array", function () {
            expect(model.parse(testServices)).to.be.an("array");
        });
        it("shouldn't return an empty array", function () {
            expect(model.parse(testServices)).to.be.an("array").that.is.not.empty;
        });
    });
    describe("deleteLayersByIds", function () {
        it("should return an array", function () {
            expect(model.deleteLayersByIds(testServices, Config.tree.layerIDsToIgnore)).to.be.an("array");
        });
        it("shouldn't return an empty array", function () {
            expect(model.deleteLayersByIds(testServices, Config.tree.layerIDsToIgnore)).to.be.an("array").that.is.not.empty;
        });
        it("shouldn't return an empty array when param is empty string in config.js", function () {
            expect(model.deleteLayersByIds(testServices, "")).to.be.an("array").that.is.not.empty;
        });
        it("shouldn't return an empty array when param is undefined in config.js", function () {
            expect(model.deleteLayersByIds(testServices, undefined)).to.be.an("array").that.is.not.empty;
        });
        it("should return an array without id 1711", function () {
            function eachArrayObject (obj) {
                return expect(obj).to.not.have.all.property("id", "1711");
            }
            expect(model.deleteLayersByIds(testServices, Config.tree.layerIDsToIgnore).every(eachArrayObject));
        });
    });
    describe("deleteLayersByMetaIds", function () {
        it("should return an array", function () {
            expect(model.deleteLayersByMetaIds(testServices, Config.tree.metaIDsToIgnore)).to.be.an("array");
        });
        it("shouldn't return an empty array", function () {
            expect(model.deleteLayersByMetaIds(testServices, Config.tree.metaIDsToIgnore)).to.be.an("array").that.is.not.empty;
        });
        it("should return an array without Layer with Dataset md_id 9329C2CB-4552-4780-B343-0CC847538896", function () {
            function eachArrayObject (obj) {
                _.find(obj.datasets, function (dataset) {
                    return expect(dataset).to.not.have.property("9329C2CB-4552-4780-B343-0CC847538896");
                });
            }
            expect(model.deleteLayersByMetaIds(testServices, Config.tree.metaIDsToIgnore).every(eachArrayObject));
        });
        it("should return an array that is not empty when param is empty string in config.js", function () {
            expect(model.deleteLayersByMetaIds(testServices, "")).to.be.an("array").that.is.not.empty;
        });
        it("should return an array that is not empty when param is undefined in config.js", function () {
            expect(model.deleteLayersByMetaIds(testServices, undefined)).to.be.an("array").that.is.not.empty;
        });

    });
    describe("metaIDsToMerge", function () {
        it("should return an array", function () {
            expect(model.mergeLayersByMetaIds(testServices, Config.tree.metaIDsToMerge)).to.be.an("array");
        });
        it("shouldn't return an empty array", function () {
            expect(model.mergeLayersByMetaIds(testServices, Config.tree.metaIDsToMerge)).to.be.an("array").that.is.not.empty;
        });
        it("shouldn't return an empty array when param is empty string in config.js", function () {
            expect(model.mergeLayersByMetaIds(testServices, "")).to.be.an("array").that.is.not.empty;
        });
        it("shouldn't return an empty array when param is undefined in config.js", function () {
            expect(model.mergeLayersByMetaIds(testServices, undefined)).to.be.an("array").that.is.not.empty;
        });
        it("should return an object where layer objects are merged by md_id", function () {
            var mdObj;

            _.each(model.mergeLayersByMetaIds(testServices, Config.tree.metaIDsToMerge), function (obj) {
                var foundMdObj = _.findWhere(obj.datasets, {md_id: "C1AC42B2-C104-45B8-91F9-DA14C3C88A1F"});

                if (_.isUndefined(foundMdObj) === false) {
                    mdObj = foundMdObj;
                }
            });
            expect(mdObj).not.to.be.undefined;
        });
        it("should return an object where layer KitaEinrichtungen and KitaEinrichtungen_Details are merged in layers", function () {
            var layerObj;

            _.each(model.mergeLayersByMetaIds(testServices, Config.tree.metaIDsToMerge), function (obj) {
                if (obj.layers.indexOf("KitaEinrichtungen_Details") >= 0 && obj.layers.indexOf("KitaEinrichtungen") >= 0) {
                    layerObj = obj;
                }
            });
            expect(layerObj).not.to.be.undefined;
        });
    });
    describe("setStyleForHVVLayer", function () {
        it("should return an array", function () {
            expect(model.cloneByStyle(testServices)).to.be.an("array");
        });
        it("shouldn't return an empty array", function () {
            expect(model.cloneByStyle(testServices)).to.be.an("array").that.is.not.empty;
        });
        it("should return array with layerobject which includes the style geofox_stations", function () {
            function eachArrayObject (obj) {
                return _.isUndefined(obj.styles) || obj.styles === "geofox_stations";
            }
            expect(model.cloneByStyle(testServices).every(eachArrayObject));
        });
    });
});
