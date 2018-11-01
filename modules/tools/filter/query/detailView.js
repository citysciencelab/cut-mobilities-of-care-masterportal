import SnippetDropdownView from "../../../snippets/dropdown/view";
import ValueView from "../../../snippets/value/view";
import SnippetCheckBoxView from "../../../snippets/checkbox/view";
import Template from "text-loader!./templateDetailView.html";
import SnippetSliderView from "../../../snippets/slider/range/view";

const QueryDetailView = Backbone.View.extend({
    events: {
        "change .checkbox-toggle": "toggleIsActive",
        "click .zoom-btn": "zoomToSelectedFeatures",
        "click .remove-all": "deselectAllValueModels"
    },
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
    template: _.template(Template),
    render: function () {
        var attr;

        if (!this.model.get("features")) {
            this.$el.html("<div id='filter-loader'><img src='../../img/ajax-loader.gif'></div>");
            return this.$el;
        }
        attr = this.model.toJSON();

        this.$el.html(this.template(attr));
        this.renderSnippets();
        this.renderValueViews();
        this.renderSnippetCheckBoxView();
        return this;
    },
    rerenderSnippets: function (changedValue) {
        _.each(this.model.get("snippetCollection").models, function (snippet) {
            if (_.isUndefined(changedValue) || snippet.get("name") !== changedValue.get("attr")) {
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
        this.$el.find(".feature-count").html(value.length + " Treffer");
        this.$el.find(".detailview-head .zoom-btn")
            .animate({opacity: 0.6}, 500)
            .animate({opacity: 1.0}, 500);
    },

    zoomToSelectedFeatures: function () {
        this.model.sendFeaturesToRemote();
        if (Radio.request("Util", "isViewMobile") === true) {
            this.model.trigger("closeFilter");
        }
    },
    renderSnippets: function () {
        var view;

        if (this.model.get("isLayerVisible")) {
            _.each(this.model.get("snippetCollection").models, function (snippet) {
                if (snippet.get("type") === "string" || snippet.get("type") === "text") {
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
            }, this);
        }
        else {
            this.removeView();
        }
    },
    /**
     * Rendert die View in der die ausgewählten Werte stehen, nach denen derzeit gefiltert wird.
     * Die Werte werden in den Snippets gespeichert.
     * @returns {void}
     */
    renderValueViews: function () {
        var countSelectedValues = 0,
            view;

        _.each(this.model.get("snippetCollection").models, function (snippet) {
            _.each(snippet.get("valuesCollection").models, function (valueModel) {
                valueModel.trigger("removeView");

                if (valueModel.get("isSelected")) {
                    countSelectedValues++;
                    view = new ValueView({model: valueModel});

                    this.$el.find(".value-views-container .text:nth-child(1)").after(view.render().$el);
                }
            }, this);
        }, this);

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
    renderSnippetCheckBoxView: function () {
        // this.$el.find(".detailview-head button").before("<label>" + this.model.get("name") + "-Filter</label>");
        var view;

        if (!this.model.get("activateOnSelection")) {
            view = new SnippetCheckBoxView({model: this.model.get("btnIsActive")});

            this.$el.find(".detailview-head").after(view.render());
        }
    },
    toggleIsActive: function (evt) {
        this.model.setIsActive(this.$(evt.target).prop("checked"));
        this.model.runFilter();
    },
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
