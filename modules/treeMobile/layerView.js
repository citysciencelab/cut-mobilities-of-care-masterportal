define([
    "backbone"
], function () {

    var Backbone = require("backbone"),
        LayerView;

    LayerView = Backbone.View.extend({
        tagName: "li",
        initialize: function () {
            this.listenTo(this.model, {
                 "change:isVisible": this.render
            });
        },
        render: function () {
            if (this.model.getIsVisible() === true) {
                $(this.model.get("targetElement")).append(this.$el.html("<span>dummyLiJones</span>"));
                // Events müssen wieder zugewiesen werden!! aber warum??
                this.delegateEvents(this.events);
            }
        }
    });

    return LayerView;
});
