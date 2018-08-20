define(function (require) {
    var $ = require("jquery"),
        Model = require("modules/tools/extendedFilter/model"),
        Template = require("text!modules/tools/extendedFilter/template.html"),
        ExtendedFilterView;

    ExtendedFilterView = Backbone.View.extend({
        events: {
            "change #dropdown": "nextStep",
            "click .btn_remove": "removeAttrFromFilter",
            "click #btn_back": "previousStep"
        },
        initialize: function (attr) {
            this.model = new Model(attr);
            this.listenTo(this.model, {
                "change:isCurrentWin": this.render,
                "change:isCollapsed": this.render
            }, this); // Fenstermanagement
        },
        template: _.template(Template),
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
            var attr = this.model.toJSON();

            if (this.model.get("isCurrentWin") === true && this.model.get("isCollapsed") === false) {


                this.$el.html("");
                $(".win-heading").after(this.$el.html(this.template(attr)));

                this.delegateEvents();
            }
            else {
                this.undelegateEvents();
            }
            return this;
        }
    });
    return ExtendedFilterView;
});
