define([
    "backbone",
    "modules/core/modelList/layer",
    "modules/core/modelList/folder",
    "modules/core/modelList/tool"
], function () {

    var Backbone = require("backbone"),
        Layer = require("modules/core/modelList/layer"),
        Folder = require("modules/core/modelList/folder"),
        Tool = require("modules/core/modelList/tool"),
        ModelList;

    ModelList = Backbone.Collection.extend({
        model: function (attrs, options) {
            if (attrs.type === "layer") {
                return new Layer(attrs, options);
            }
            else if (attrs.type === "folder") {
                return new Folder(attrs, options);
            }
            else if (attrs.type === "tool") {
                return new Tool(attrs, options);
            }
        }
    });

    return ModelList;
});
