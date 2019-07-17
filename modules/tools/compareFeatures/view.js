import CompareFeaturesTemplateFeedback from "text-loader!./templateFeedback.html";
import CompareFeaturesTemplateNoFeatures from "text-loader!./templateNoFeatures.html";
import CompareFeaturesTemplate from "text-loader!./template.html";
import "bootstrap/js/modal";

const CompareFeaturesView = Backbone.View.extend({
    className: "compare-feature-modal modal fade",
    events: {
        // is fired when the modal has finished being hidden
        "hidden.bs.modal": "setIsActivatedToFalse",
        "click .btn-open-list": "setIsActivatedToTrue",
        "click .btn-infos": "toggleRows",
        "click .btn-print": "preparePrint",
        "click table .glyphicon-remove": "removeFeatureFromList",
        "change select": function (evt) {
            this.model.setLayerId(evt.target.value);
            this.renderListModal(this.model);
        }
    },

    initialize: function () {
        // this.model = new CompareFeaturesModel();
        this.template = _.template(CompareFeaturesTemplate);
        this.templateNoFeatures = _.template(CompareFeaturesTemplateNoFeatures);
        this.templateFeedback = _.template(CompareFeaturesTemplateFeedback);

        this.listenTo(this.model, {
            "change:isActive": this.render,
            "renderFeedbackModal": this.renderFeedbackModal
        });
        document.getElementsByClassName("masterportal-container")[0].appendChild(this.el);

        if (this.model.get("isActive") === true) {
            this.render(this.model, true);
        }
    },

    /**
     * @param {Backbone.Model} model - CompareFeaturesModel
     * @param {boolean} value - isActive
     * @returns {void}
     */
    render: function (model, value) {
        if (value) {
            if (model.get("featureList").length === 0) {
                this.renderErrorModal();
            }
            else {
                this.renderListModal(model);
            }
            this.$el.modal("show");
        }
        else {
            this.$el.empty();
        }
        return this;
    },

    /**
     * @param {Backbone.Model} model - this.model
     * @returns {void}
     */
    renderListModal: function (model) {
        // In reaction to modules/tools/gfi/model.js @ prepareVectorGfiParam(), only use 1st part of underscore delimited layerId
        var realLayerId = model.get("layerId").split("_")[0],
            layerModel = Radio.request("ModelList", "getModelByAttributes", {"id": realLayerId}),
            attr = {
                list: model.prepareFeatureListToShow(layerModel.get("gfiAttributes")),
                rowsToShow: model.get("numberOfAttributesToShow"),
                featureIds: model.getFeatureIds(model.get("groupedFeatureList"), model.get("layerId")),
                layerSelection: model.getLayerSelection(model.get("groupedFeatureList")),
                layerId: model.get("layerId")
            };

        this.$el.html(this.template(attr));
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
     * @returns {void}
     */
    renderErrorModal: function () {
        var comparableLayerModels = Radio.request("ModelList", "getModelsByAttributes", {isComparable: true}),
            displayText = "Objekte";

        if (comparableLayerModels.length > 0 && comparableLayerModels.length < 2) {
            displayText = comparableLayerModels[0].get("name");
        }
        this.$el.html(this.templateNoFeatures({text: displayText}));
    },

    /**
     * removes the clicked column from the table
     * and finds the feature to be removed
     * @param {MouseEvent} evt - click event
     * @returns {void}
     */
    removeFeatureFromList: function (evt) {
        var featureToRemoved = _.find(this.model.get("featureList"), function (feature) {
            return feature.getId() === evt.target.id;
        });

        this.$el.find("." + evt.target.classList[0]).remove();
        this.model.removeFeatureFromList(featureToRemoved);
        if (this.model.get("featureList").length === 0) {
            this.renderErrorModal();
        }
    },
    preparePrint: function () {
        var rowsToShow = this.$el.find("tr:visible").length;

        this.model.preparePrint(rowsToShow);
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
        this.model.setIsActive(false);
    },

    /**
     * @returns {void}
     */
    setIsActivatedToTrue: function () {
        this.model.setIsActive(true);
    }
});


export default CompareFeaturesView;
