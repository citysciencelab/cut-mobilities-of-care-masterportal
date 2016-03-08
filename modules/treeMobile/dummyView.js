define([
    "backbone"
], function () {

    var Backbone = require("backbone"),
        DummView;

    DummView = Backbone.View.extend({
        tagName: "li",
        events: {
            "click": "test"
        },
        initialize: function () {
            this.listenTo(this.model, {
                 "change:isVisible": this.render
            });
        },
        test: function (t) {
            // this.setParentID();
            console.log(t);
        },
        render: function () {
            if (this.model.getIsVisible() === true) {
                $(this.model.get("targetElement")).append(this.$el.html("<span>dummyLiJones</span>"));
                // Events müssen wieder zugewiesen werden!! aber warum??
                this.delegateEvents(this.events);
            }
        }
    });

    return DummView;
});
