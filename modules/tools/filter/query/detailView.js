define(function (require) {

    var SnippetDropdownView = require("modules/snippets/dropdown/view"),
        ValueView = require("modules/snippets/value/view"),
        SnippetCheckBoxView = require("modules/snippets/checkbox/view"),
        Template = require("text!modules/tools/filter/query/templateDetailView.html"),
        SnippetSliderView = require("modules/snippets/slider/range/view"),
        QueryDetailView;

    QueryDetailView = Backbone.View.extend({
        className: "detail-view-container",
        template: _.template(Template),
        events: {
            "change .checkbox-toggle": "toggleIsActive",
            "click .zoom-btn": "zoomToSelectedFeatures",
            "click .remove-all": "deselectAllValueModels"
        },
        initialize: function () {
            this.listenTo(this.model, {
                "rerenderSnippets": this.rerenderSnippets,
                "renderSnippets": this.renderSnippets,
                "change:isSelected": this.removeView,
                "change:featureIds": this.updateFeatureCount,
                "change:isLayerVisible": this.render
            }, this);
            this.listenTo(this.model.get("snippetCollection"), {
                "valuesChanged": this.renderValueViews,
                "hideAllInfoText": this.hideAllInfoText
            }, this);
        },
        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
            this.renderSnippets();
            this.renderValueViews();
            this.renderSnippetCheckBoxView();
            return this.$el;
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
         */
        updateFeatureCount: function (model, value) {
            this.$el.find(".feature-count").html(value.length + " Treffer");
            this.$el.find(".detailview-head .zoom-btn")
                .animate({opacity: 0.6}, 500)
                .animate({opacity: 1.0}, 500);
        },

        zoomToSelectedFeatures: function () {
            this.model.zoomToSelectedFeatures();
            if (Radio.request("Util", "isViewMobile") === true) {
                this.model.trigger("closeFilter");
            }
        },
        renderSnippets: function () {
            var view;

            if (this.model.get("isLayerVisible")) {
                _.each(this.model.get("snippetCollection").models, function (snippet) {
                    if (snippet.get("type") === "string") {
                        view = new SnippetDropdownView({model: snippet});
                    }
                    else if (snippet.get("type") === "boolean") {
                        view = new SnippetDropdownView({model: snippet});
                    }
                    else if (snippet.get("type") === "interger") {
                        view = new SnippetSliderView({model: snippet});
                    }
                    else {
                        view = new SnippetCheckBoxView({model: snippet});
                    }
                    this.$el.append(view.render());
                }, this);
            }
            else {
                this.removeView();
            }
        },
        /**
         * Rendert die View in der die ausgewählten Werte stehen, nach denen derzeit gefiltert wird.
         * Die Werte werden in den Snippets gespeichert.
         */
        renderValueViews: function () {
            var countSelectedValues = 0;

            _.each(this.model.get("snippetCollection").models, function (snippet) {
                _.each(snippet.get("valuesCollection").models, function (valueModel) {
                    valueModel.trigger("removeView");

                    if (valueModel.get("isSelected")) {
                        countSelectedValues++;
                        var view = new ValueView({model: valueModel});

                        this.$el.find(".value-views-container .text:nth-child(1)").after(view.render());
                    }
                }, this);
            }, this);

            countSelectedValues === 0 ? this.$el.find(".text:last-child").show() : this.$el.find(".text:last-child").hide();
            countSelectedValues > 1 ? this.$el.find(".remove-all").show() : this.$el.find(".remove-all").hide();
        },
        renderSnippetCheckBoxView: function () {
            // this.$el.find(".detailview-head button").before("<label>" + this.model.get("name") + "-Filter</label>");
            if (!this.model.get("activateOnSelection")) {
                var view = new SnippetCheckBoxView({model: this.model.get("btnIsActive")});

                this.$el.find(".detailview-head").after(view.render());
            }
        },
        toggleIsActive: function (evt) {
            this.model.setIsActive($(evt.target).prop("checked"));
            this.model.runFilter();
        },
        removeView: function (model, value) {
            if (value === false) {
                model.get("snippetCollection").forEach(function (model) {
                    model.trigger("removeView");
                });
                model.get("btnIsActive").removeView();
                this.remove();
            }
        },

        /**
         * calls deselectAllValueModels in the model
         */
        deselectAllValueModels: function () {
            this.model.deselectAllValueModels();
        },

        /**
         * hides all infotexts in the filter
         */
        hideAllInfoText: function () {
            this.$el.find(".info-text").hide();
        }
    });

    return QueryDetailView;
});
