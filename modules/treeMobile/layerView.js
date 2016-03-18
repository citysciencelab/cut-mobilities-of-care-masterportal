define([
    "backbone",
    "text!modules/treeMobile/templateLayer.html"
], function () {

    var Backbone = require("backbone"),
        LayerTemplate = require("text!modules/treeMobile/templateLayer.html"),
        LayerView;

    LayerView = Backbone.View.extend({
        tagName: "li",
        className: "list-group-item",
        template: _.template(LayerTemplate),
        events: {
            "click .layer-item": "toggleIsSelected"
        },
        initialize: function () {
            this.listenTo(this.model, {
                 "change:isVisible": this.render
            });
        },
        render: function () {
            if (this.model.getIsVisible() === true) {
                var attr = this.model.toJSON();

                $(this.model.get("targetElement")).append(this.$el.html(this.template(attr)));
                this.delegateEvents(this.events);
            }
            else {
                this.$el.remove();
            }
        },
        toggleIsSelected: function () {
            $(".layer-item > .glyphicon").toggleClass("glyphicon-unchecked");
            $(".layer-item > .glyphicon").toggleClass("glyphicon-check");
            this.model.toggleIsSelected();
        }
    });

    return LayerView;
});
