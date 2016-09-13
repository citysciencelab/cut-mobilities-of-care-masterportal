define(function (require) {

    var Backbone = require("backbone"),
        Animation = require("modules/tools/animation/model"),
        AnimationTemplate = require("text!modules/tools/animation/template.html"),
        AnimationView;

    AnimationView = Backbone.View.extend({
        model: new Animation(),
        template: _.template(AnimationTemplate),
        events: {
            "click .start": "start",
            "click .stop": "stop"
        },
        initialize: function () {
            this.listenTo(this.model, {
                "change:isCollapsed change:isCurrentWin": this.render
            });
        },
        render: function () {
            var attr = this.model.toJSON();

            if (this.model.get("isCurrentWin") === true && this.model.get("isCollapsed") === false) {
                this.$el.html("");
                $(".win-heading").after(this.$el.html(this.template(attr)));
                this.delegateEvents();
            }
            else {
                this.undelegateEvents();
            }
        },
        start: function () {
            this.model.startAnimation();
        },
        stop: function () {
            this.model.stopAnimation();
        }
    });

    return AnimationView;
});
