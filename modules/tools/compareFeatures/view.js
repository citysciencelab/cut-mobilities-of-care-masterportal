define(function (require) {

    var CompareFeaturesModel = require("modules/tools/compareFeatures/model"),
        CompareFeaturesTemplateFeedback = require("text!modules/tools/compareFeatures/templateFeedback.html"),
        CompareFeaturesTemplateNoFeatures = require("text!modules/tools/compareFeatures/templateNoFeatures.html"),
        CompareFeaturesTemplate = require("text!modules/tools/compareFeatures/template.html"),
        CompareFeaturesView;

    require("bootstrap/modal");

    CompareFeaturesView = Backbone.View.extend({
        className: "compare-feature-modal modal fade",

        events: {
            "hidden.bs.modal": "setIsActivatedToFalse",
            "click .btn-open-list": "setIsActivatedToTrue",
            "click .btn-infos": "toggleRows"
        },

        initialize: function () {
            this.model = new CompareFeaturesModel();
            this.template = _.template(CompareFeaturesTemplate);
            this.templateNoFeatures = _.template(CompareFeaturesTemplateNoFeatures);
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
            var layerModel;

            if (value) {
                if (model.get("featureList").length === 0) {
                    this.$el.html(this.templateNoFeatures());
                }
                else {
                    layerModel = Radio.request("ModelList", "getModelByAttributes", {id: model.get("layerId")});

                    this.$el.html(this.template({featureList: model.prepareFeatureListToShow(layerModel.get("gfiAttributes")), rowsToShow: model.get("numberOfAttributesToShow")}));
                }
                this.$el.modal("show");
            }
            else {
                this.$el.empty();
            }
            return this;
        },

        /**
         * @param {ol.feature} feature -
         * @returns {void}
         */
        renderFeedbackModal: function (feature) {
            this.$el.html(this.templateFeedback({feature: feature}));
            this.$el.modal("show");
        },

        /**
         * shows or hides the rows wiht the class toggle-row
         * and sets the button text
         * @param {MouseEvent} evt - click event
         * @returns {void}
         */
        toggleRows: function (evt) {
            var text = "mehr Infos";

            this.$el.find(".toggle-row").toggle();
            if (evt.target.textContent === "mehr Infos") {
                text = "weniger Infos";
            }
            evt.target.textContent = text;
        },

        /**
         * @returns {void}
         */
        setIsActivatedToFalse: function () {
            this.model.setIsActivated(false);
            Radio.trigger("ModelList", "setModelAttributesById", "compareFeatures", {isActive: false});
        },

        /**
         * @returns {void}
         */
        setIsActivatedToTrue: function () {
            this.model.setIsActivated(true);
            Radio.trigger("ModelList", "setModelAttributesById", "compareFeatures", {isActive: true});
        }
    });

    return CompareFeaturesView;
});
