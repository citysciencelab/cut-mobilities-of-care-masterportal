define(function (require) {

    var SnippetDropdownView = require("modules/Snippets/dropDown/view"),
        ValueView = require("modules/Snippets/value/view"),
        CheckBoxView = require("modules/Snippets/checkbox/view"),
        Template = require("text!modules/tools/filter/query/templateDetailView.html"),
        SnippetSliderView = require("modules/Snippets/slider/range/view"),
        QueryDetailView;

    QueryDetailView = Backbone.View.extend({
        className: "detail-view-container",
        template: _.template(Template),
        events: {
            "change .checkbox-toggle": "toggleIsActive",
            "click .detailview-head button": "zoomToSelectedFeatures",
            "click .remove-all": "deselectAllValueModels",
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
                "valuesChanged": function () {
                    this.renderValueViews();
                }
            }, this);
        },
        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
            this.renderSnippets();
            this.renderValueViews();
            this.renderCheckboxView();
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
            this.$el.find(".detailview-head .btn")
                .animate({opacity: 0.4}, 500)
                .animate({opacity: 0.8}, 500);
        },

        zoomToSelectedFeatures: function () {
            this.model.zoomToSelectedFeatures();
            if (Radio.request("Util", "isViewMobile") === true) {
                this.model.trigger("closeFilter");
            }
        },
        renderSnippets: function () {
            var view;

            _.each(this.model.get("snippetCollection").models, function (snippet) {
                if(this.model.get("isLayerVisible")) {
                    if (snippet.get("type") === "string") {
                        view = new SnippetDropdownView({model: snippet});
                        this.$el.append(view.render());
                    }
                    else if (snippet.get("type") === "boolean") {
                        view = new SnippetDropdownView({model: snippet});
                        this.$el.append(view.render());
                    }
                    else {
                        view = new SnippetSliderView({model: snippet});
                        this.$el.append(view.render());
                    }
                }
                else {
                    snippet.removeView();
                }
            }, this);
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
        renderCheckboxView: function () {
            var view = new CheckBoxView({model: this.model.get("btnIsActive")});

                this.$el.find(".div-checkbox-isActive").after(view.render());
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
                this.remove();
            }
        },

        /**
         * calls deselectAllValueModels in the model
         */
        deselectAllValueModels: function () {
            this.model.deselectAllValueModels();
        }
    });

    return QueryDetailView;
});
