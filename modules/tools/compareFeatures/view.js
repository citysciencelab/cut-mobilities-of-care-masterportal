define(function (require) {

    var CompareFeaturesModel = require("modules/tools/compareFeatures/model"),
        CompareFeaturesTemplateFeedback = require("text!modules/tools/compareFeatures/templateFeedback.html"),
        CompareFeaturesTemplate = require("text!modules/tools/compareFeatures/template.html"),
        CompareFeaturesView;

    require("bootstrap/modal");

    CompareFeaturesView = Backbone.View.extend({
        className: "compare-feature-modal modal fade",

        events: {
            "hidden.bs.modal": "setIsActivatedToFalse",
            "click .btn-open-list": "setIsActivatedToTrue"
        },

        initialize: function () {
            this.model = new CompareFeaturesModel();
            this.template = _.template(CompareFeaturesTemplate);
            this.templateFeedback = _.template(CompareFeaturesTemplateFeedback);

            this.listenTo(this.model, {
                "change:isActivated": this.render,
                "renderFeedbackModal": this.renderFeedbackModal
            });
            document.getElementsByClassName("lgv-container")[0].appendChild(this.el);
        },

        /**
         * @param {Backbone.Model} model - CompareFeaturesModel
         * @param {boolean} value - isActivated
         * @returns {void}
         */
        render: function (model, value) {
            var attr = this.model.toJSON();

            if (value) {
                this.$el.html(this.template(attr));
                this.$el.modal("show");
            }
            else {
                this.$el.empty();
            }
            return this;
        },

        renderFeedbackModal: function (feature) {
            this.$el.html(this.templateFeedback({feature: feature}));
            this.$el.modal("show");
        },

        setIsActivatedToFalse: function () {
            this.model.setIsActivated(false);
            Radio.trigger("ModelList", "setModelAttributesById", "compareFeatures", {isActive: false});
        },

        setIsActivatedToTrue: function () {
            this.model.setIsActivated(true);
            Radio.trigger("ModelList", "setModelAttributesById", "compareFeatures", {isActive: true});
        }
    });

    return CompareFeaturesView;
});
