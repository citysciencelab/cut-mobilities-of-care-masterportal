define([
    "backbone",
    "backbone.radio",
    "modules/core/util",
    "config"
], function () {

    var Backbone = require("backbone"),
    Radio = require("backbone.radio"),
    Util = require("modules/core/util"),
    Config = require("config"),
    DummyModel = Backbone.Model.extend({
        defaults: {
            isVisible: false,
            type: "dummy",
            parentID: -1
        },
        initialize: function (parentID) {
            this.setParentID(parentID);
        },
        setIsVisible: function (value) {
            this.set("isVisible", value);
        },
        getIsVisible: function () {
            this.get("isVisible");
        },
        getType: function () {
            return this.get("type");
        },
        getParentID: function () {
            return this.get("parentID");
        },
        setParentID: function (value) {
            return this.set("parentID", value);
        }
    });

    return DummyModel;
});
