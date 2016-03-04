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
    DummView = Backbone.View.extend({
        model: {},
        targetElement: "",
        initialize: function (DummyModel, el) {
            this.model = DummyModel;
            this.listenTo(this.model, "change:isVisible", this.render);
            this.targetElement = el;
        },
        render: function () {
            if (this.model.attributes.isVisible) {
                this.$el.html("");
                this.targetElement.append($("<li>dummyLiJones</li>"));
            }
        }
    });

    return DummView;
});
