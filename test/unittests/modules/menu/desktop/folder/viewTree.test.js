import {expect} from "chai";
import ViewTree from "@modules/menu/desktop/folder/viewTree.js";

describe("menu/desktop/folder/viewTree", function () {
    var viewTree;

    before(function () {
        var fakeModel = {
            get: function () {
                return true;
            },
            getIsVisibleInTree: function () {
                return true;
            },

            getId: function () {
                return "getID";
            },

            isFolderSelectable: false,

            setIsFolderSelectable: function (value) {
                this.isFolderSelectable = value;
            },

            toJSON: function () {
                return {
                    "isFolderSelectable": this.isFolderSelectable,
                    "isLeafFolder": true,
                    "isSelected": false,
                    "name": "testFolder"
                };
            },

            getParentId: function () {
                return "parentID";
            },

            getLevel: function () {
                return 3;
            },

            getIsExpanded: function () {
                return true;
            }
        };

        viewTree = new ViewTree({
            model: fakeModel
        });
    });

    describe("the \"SelectAll\" checkbox", function () {
        it("should be hidden if the folder-property \"isFolderSelectable\" is false", function () {
            viewTree.model.setIsFolderSelectable(false);
            viewTree.render();
            expect(viewTree.$el.find(".selectall").length).to.be.equal(0);
        });
        it("should be visible if the folder-property \"isFolderSelectable\" is true", function () {
            viewTree.model.setIsFolderSelectable(true);
            viewTree.render();
            expect(viewTree.$el.find(".selectall").length).to.be.equal(1);
        });
    });
});
