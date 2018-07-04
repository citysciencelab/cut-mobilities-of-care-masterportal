define(function (require) {
    var Backbone = require("backbone"),
        Model = require("modules/tools/extendedFilter/model"),
        Template = require("text!modules/tools/extendedFilter/template.html"),
        ExtendedFilterView;

    ExtendedFilterView = Backbone.View.extend({
        model: new Model(),
        template: _.template(Template),
        initialize: function () {
            this.listenTo(this.model, {
                "change:isCurrentWin": this.render,
                "change:isCollapsed": this.render
            }, this); // Fenstermanagement
        },
        events: {
            "change #dropdown": "nextStep",
            "click .btn_remove": "removeAttrFromFilter",
            "click #btn_back": "previousStep"
        },
        removeAttrFromFilter: function (evt) {
            this.model.removeAttrFromFilter(evt);
            this.render();
        },

        nextStep: function (evt) {
            this.model.nextStep(evt);
            this.render();
        },
        previousStep: function (evt) {
            this.model.previousStep(evt);
            this.render();
        },

        render: function () {
            if (this.model.get("isCurrentWin") === true && this.model.get("isCollapsed") === false) {

                var attr = this.model.toJSON();

                this.$el.html("");
                $(".win-heading").after(this.$el.html(this.template(attr)));

                this.delegateEvents();
            }
            else {
                this.undelegateEvents();
            }
        }
    });
    return ExtendedFilterView;
});
