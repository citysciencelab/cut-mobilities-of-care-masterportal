import testServices from "../../resources/testServices.json";
import {expect} from "chai";
import {deleteLayersByIds, deleteLayersByMetaIds, mergeLayersByMetaIds, cloneByStyle} from "../../../../js/layerList.js";

describe("js/layerList", function () {
    describe("deleteLayersByIds", function () {
        it("should return an array", function () {
            expect(deleteLayersByIds(testServices, Config.tree.layerIDsToIgnore)).to.be.an("array");
        });
        it("shouldn't return an empty array", function () {
            expect(deleteLayersByIds(testServices, Config.tree.layerIDsToIgnore)).to.be.an("array").that.is.not.empty;
        });
        it("shouldn't return an empty array when param is empty string in config.js", function () {
            expect(deleteLayersByIds(testServices, "")).to.be.an("array").that.is.not.empty;
        });
        it("shouldn't return an empty array when param is undefined in config.js", function () {
            expect(deleteLayersByIds(testServices, undefined)).to.be.an("array").that.is.not.empty;
        });
        it("should return an array without id 1711", function () {
            /**
             *
             * check the id
             * @param {object} obj - the test object
             * @returns {string} result
             */
            function eachArrayObject (obj) {
                return expect(obj).to.not.have.all.property("id", "1711");
            }
            expect(deleteLayersByIds(testServices, Config.tree.layerIDsToIgnore).every(eachArrayObject));
        });
    });
    describe("deleteLayersByMetaIds", function () {
        it("should return an array", function () {
            expect(deleteLayersByMetaIds(testServices, Config.tree.metaIDsToIgnore)).to.be.an("array");
        });
        it("shouldn't return an empty array", function () {
            expect(deleteLayersByMetaIds(testServices, Config.tree.metaIDsToIgnore)).to.be.an("array").that.is.not.empty;
        });
        it("should return an array without Layer with Dataset md_id 9329C2CB-4552-4780-B343-0CC847538896", function () {
            /**
             *
             * check the property
             * @param {object} obj - the test object
             * @returns {string} result
             */
            function eachArrayObject (obj) {
                _.find(obj.datasets, function (dataset) {
                    return expect(dataset).to.not.have.property("9329C2CB-4552-4780-B343-0CC847538896");
                });
            }
            expect(deleteLayersByMetaIds(testServices, Config.tree.metaIDsToIgnore).every(eachArrayObject));
        });
        it("should return an array that is not empty when param is empty string in config.js", function () {
            expect(deleteLayersByMetaIds(testServices, "")).to.be.an("array").that.is.not.empty;
        });
        it("should return an array that is not empty when param is undefined in config.js", function () {
            expect(deleteLayersByMetaIds(testServices, undefined)).to.be.an("array").that.is.not.empty;
        });

    });
    describe("metaIDsToMerge", function () {
        it("should return an array", function () {
            expect(mergeLayersByMetaIds(testServices, Config.tree.metaIDsToMerge)).to.be.an("array");
        });
        it("shouldn't return an empty array", function () {
            expect(mergeLayersByMetaIds(testServices, Config.tree.metaIDsToMerge)).to.be.an("array").that.is.not.empty;
        });
        it("shouldn't return an empty array when param is empty string in config.js", function () {
            expect(mergeLayersByMetaIds(testServices, "")).to.be.an("array").that.is.not.empty;
        });
        it("shouldn't return an empty array when param is undefined in config.js", function () {
            expect(mergeLayersByMetaIds(testServices, undefined)).to.be.an("array").that.is.not.empty;
        });
        it("should return an object where layer objects are merged by md_id", function () {
            var mdObj;

            _.each(mergeLayersByMetaIds(testServices, Config.tree.metaIDsToMerge), function (obj) {
                var foundMdObj = _.findWhere(obj.datasets, {md_id: "C1AC42B2-C104-45B8-91F9-DA14C3C88A1F"});

                if (_.isUndefined(foundMdObj) === false) {
                    mdObj = foundMdObj;
                }
            });
            expect(mdObj).not.to.be.undefined;
        });
        it("should return an object where layer KitaEinrichtungen and KitaEinrichtungen_Details are merged in layers", function () {
            var layerObj;

            _.each(mergeLayersByMetaIds(testServices, Config.tree.metaIDsToMerge), function (obj) {
                if (obj.layers.indexOf("KitaEinrichtungen_Details") >= 0 && obj.layers.indexOf("KitaEinrichtungen") >= 0) {
                    layerObj = obj;
                }
            });
            expect(layerObj).not.to.be.undefined;
        });
    });
    describe("setStyleForHVVLayer", function () {
        it("should return an array", function () {
            expect(cloneByStyle(testServices)).to.be.an("array");
        });
        it("shouldn't return an empty array", function () {
            expect(cloneByStyle(testServices)).to.be.an("array").that.is.not.empty;
        });
        it("should return array with layerobject which includes the style geofox_stations", function () {
            /**
             *
             * check the style
             * @param {object} obj - the test object
             * @returns {string} result
             */
            function eachArrayObject (obj) {
                return _.isUndefined(obj.styles) || obj.styles === "geofox_stations";
            }
            expect(cloneByStyle(testServices).every(eachArrayObject));
        });
    });
});
