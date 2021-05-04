import SnippetDropdownView from "../../../snippets/dropdown/view";
import ValueView from "../../../snippets/value/view";
import SnippetCheckBoxView from "../../../snippets/checkbox/view";
import Template from "text-loader!./templateDetailView.html";
import SnippetSliderView from "../../../snippets/slider/range/view";
import SnippetMultiCheckboxView from "../../../snippets/multiCheckbox/view";

const QueryDetailView = Backbone.View.extend(/** @lends QueryDetailView.prototype */{
    events: {
        "change .checkbox-toggle": "toggleIsActive",
        "click .zoom-btn": "zoomToSelectedFeatures",
        "click .remove-all": "deselectAllValueModels"
    },

    /**
     * @class QueryDetailView
     * @extends Backbone.View
     * @memberof Tools.Filter.Query
     * @constructs
     * @listens Tools.Filter.Query#renderSnippets
     * @listens Tools.Filter.Query#changeIsSelected
     * @listens Tools.Filter.Query#changeFeatureIds
     * @listens Tools.Filter.Query#changeIsLayerVisible
     * @fires Core#RadioRequestUtilIsViewMobile
     * @fires Tools.Filter.Query#valuesChanged
     * @fires Tools.Filter.Query#SnippetCollectionHideAllInfoText
     */
    initialize: function () {
        this.listenTo(this.model, {
            "rerenderSnippets": this.rerenderSnippets,
            "change:isSelected": this.removeView,
            "change:featureIds": this.updateFeatureCount,
            "change:isLayerVisible": this.render
        }, this);
        this.listenTo(this.model.get("snippetCollection"), {
            "valuesChanged": this.renderValueViews,
            "hideAllInfoText": this.hideAllInfoText
        }, this);
    },
    className: "detail-view",
    /**
     * @member Template
     * @description Template used to create QueryDetailView
     * @memberof Filter/Source
     */
    template: _.template(Template),

    /**
     * render the query detail view
     * @returns {*} todo
     */
    render: function () {
        const attr = this.model.toJSON();

        if (!this.model.get("features")) {
            return this;
        }

        this.$el.html(this.template(attr));
        this.renderSnippets();
        this.renderValueViews();
        this.renderSnippetCheckBoxView();
        return this;
    },

    /**
     * todo
     * @param {*} changedValue todo
     * @returns {void}
     */
    rerenderSnippets: function (changedValue) {
        this.model.get("snippetCollection").models.forEach(snippet => {
            if (changedValue === undefined || snippet.get("name") !== changedValue.get("attr")) {
                snippet.trigger("render");
            }
        });
    },

    /**
     * updates the display of the feature hits
     * @param  {Backbone.Model} model - QueryModel
     * @param  {string[]} value - featureIds
     * @returns {void}
     */
    updateFeatureCount: function (model, value) {
        if (value.length === 1) {
            this.$el.find(".feature-count").html(value.length + " " + this.model.get("result"));
        }
        else {
            this.$el.find(".feature-count").html(value.length + " " + this.model.get("results"));
        }
        this.$el.find(".detailview-head .zoom-btn")
            .animate({opacity: 0.6}, 500)
            .animate({opacity: 1.0}, 500);
    },

    /**
     * todo
     * @fires Core#RadioRequestUtilIsViewMobile
     * @returns {void}
     */
    zoomToSelectedFeatures: function () {
        this.model.sendFeaturesToRemote();
        if (Radio.request("Util", "isViewMobile") === true) {
            this.model.trigger("closeFilter");
        }
    },

    /**
     * reder the configured snippets
     * @returns {void}
     */
    renderSnippets: function () {
        let view;

        if (this.model.get("isLayerVisible")) {
            this.model.get("snippetCollection").models.forEach(snippet => {
                if (snippet.get("snippetType") === "checkbox-classic") {
                    view = new SnippetMultiCheckboxView({model: snippet});
                }
                else if (snippet.get("type") === "string" || snippet.get("type") === "text") {
                    // doesn't rerender on language change if dropdown is open (see render method there)
                    snippet.set("isOpen", false);
                    view = new SnippetDropdownView({model: snippet});
                }
                else if (snippet.get("type") === "boolean") {
                    // view = new SnippetDropdownView({model: snippet});
                    view = new SnippetCheckBoxView({model: snippet});
                }
                else if (snippet.get("snippetType") === "slider") {
                    view = new SnippetSliderView({model: snippet});
                }
                else {
                    view = new SnippetCheckBoxView({model: snippet});
                }

                this.$el.append(view.render().$el);
            });
        }
        else {
            this.removeView();
        }
    },

    /**
     * Renders the view containing the selected values that are currently being filtered.
     * The values are stored in the snippets.
     * @returns {void}
     */
    renderValueViews: function () {
        let countSelectedValues = 0,
            view;

        this.model.get("snippetCollection").models.forEach(snippet => {
            snippet.get("valuesCollection").models.forEach(valueModel => {
                valueModel.trigger("removeView");

                if (valueModel.get("isSelected")) {
                    countSelectedValues++;
                    view = new ValueView({model: valueModel});

                    this.$el.find(".value-views-container .text:nth-child(1)").after(view.render().$el);
                }
            });
        });

        if (countSelectedValues === 0) {
            this.$el.find(".text:last-child").show();
        }
        else {
            this.$el.find(".text:last-child").hide();
        }

        if (countSelectedValues > 1) {
            this.$el.find(".remove-all").show();
        }
        else {
            this.$el.find(".remove-all").hide();
        }
    },

    /**
     * todo
     * @returns {void}
     */
    renderSnippetCheckBoxView: function () {
        // this.$el.find(".detailview-head button").before("<label>" + this.model.get("name") + "-Filter</label>");
        let view;

        if (!this.model.get("activateOnSelection")) {
            view = new SnippetCheckBoxView({model: this.model.get("btnIsActive")});

            this.$el.find(".detailview-head").after(view.render());
        }
    },

    /**
     * todo
     * @param {*} evt todo
     * @returns {void}
     */
    toggleIsActive: function (evt) {
        this.model.setIsActive(this.$(evt.target).prop("checked"));
        this.model.runFilter();
    },

    /**
     * todo
     * @param {*} model todo
     * @param {*} value todo
     * @returns {void}
     */
    removeView: function (model, value) {
        if (value === false) {
            model.get("snippetCollection").forEach(function (mod) {
                mod.trigger("removeView");
            });
            model.get("btnIsActive").removeView();
            this.remove();
        }
    },

    /**
     * calls deselectAllValueModels in the model
     * @returns {void}
     */
    deselectAllValueModels: function () {
        this.model.deselectAllValueModels();
    },

    /**
     * hides all infotexts in the filter
     * @returns {void}
     */
    hideAllInfoText: function () {
        this.$el.find(".info-text").hide();
        this.$el.find(".info-icon").css("opacity", "0.4");
    }
});

export default QueryDetailView;
