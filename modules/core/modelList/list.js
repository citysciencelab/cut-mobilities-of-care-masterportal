define([
    "backbone",
    "backbone.radio",
    "modules/core/modelList/layer/model",
    "modules/core/modelList/folder/model",
    "modules/core/modelList/tool/model"
], function () {

    var Backbone = require("backbone"),
        Layer = require("modules/core/modelList/layer/model"),
        Folder = require("modules/core/modelList/folder/model"),
        Tool = require("modules/core/modelList/tool/model"),
        Radio = require("backbone.radio"),
        ModelList = Backbone.Collection.extend({
            initialize: function () {
               var channel = Radio.channel("ModelList");
               channel.reply("getCollection", this);
            },
            getItems: function (attr) {

            },

            /**
             * erzeugt die Werkzeugliste im Baum
             */
            addToolItems: function () {},
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
