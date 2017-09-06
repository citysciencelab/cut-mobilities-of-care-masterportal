define(function (require) {

    var SnippetDropdownView = require("modules/Snippets/dropDown/view"),
        QueryValuesView = require("modules/tools/filter/query/valuesView"),
        Template = require("text!modules/tools/filter/query/templateDetailView.html"),
        SnippetSliderView = require("modules/Snippets/slider/range/view"),
        SnippetCheckboxView = require("modules/Snippets/checkbox/view"),
        QueryDetailView;

    QueryDetailView = Backbone.View.extend({
        template: _.template(Template),
        events: {
            "change .checkbox-toggle": "toggleIsActive"
        },
        initialize: function () {
            this.listenTo(this.model, {
                "rerenderSnippets": this.rerenderSnippets,
                "renderSnippets": this.renderSnippets,
                "render": this.render,
                "change:isSelected": this.runFilter,
                "change:isSelected": this.removeView
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
            this.$el.find(".toggle").append(new SnippetCheckboxView({
                values: [{
                        size: "small",
                        label: "Filter:",
                        labelChecked: "An",
                        labelUnchecked: "Aus",
                        isChecked: this.model.get("isActive")
                    }]
            }).render());
            return this.$el;
        },
        rerenderSnippets: function (changedValue) {
            _.each(this.model.get("snippetCollection").models, function (snippet) {
                if (_.isUndefined(changedValue) || snippet.get("name") !== changedValue.get("attr")) {
                    snippet.trigger("render");
                }
            });
        },
        runFilter: function () {
            this.model.runFilter();
        },
        renderSnippets: function () {
            var view;

            _.each(this.model.get("snippetCollection").models, function (snippet) {
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
                        var view = new QueryValuesView({model: valueModel});

                        this.$el.find(".value-views-container").append(view.render());
                    }
                }, this);
            }, this);

            countSelectedValues === 0 ? this.$el.find(".default-text").show() : this.$el.find(".default-text").hide();
        },
        toggleIsActive: function (evt) {
            this.model.setIsActive($(evt.target).prop("checked"));
        },
        removeView: function (model, value) {
            if (value === false) {
                this.remove();
            }
        }
    });

    return QueryDetailView;
});
