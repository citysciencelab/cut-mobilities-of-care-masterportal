define([
    "underscore",
    "backbone",
    "models/Tree",
    "text!templates/Tree.html"
], function (_, Backbone, TreeSelection, TreeSelectionTemplate) {

        var TreeView = Backbone.View.extend({
            model: new TreeSelection(),
            template: _.template(TreeSelectionTemplate),
            events: {
                "change select": "setSelection",
                "click .selectionLabel, .selectionFormButton": "toggleTree",
                "click .layer-selection-label, .layer-selection-button": "toggle"
            },
            initialize: function () {
                this.$el.on({
                    "click": function (e) {
                        e.stopPropagation();
                    }
                });
                this.render();
            },
            render: function () {
                var attr = this.model.toJSON();
                $(".dropdown-tree").append(this.$el.html(this.template(attr)));
            },
            setSelection: function (evt) {
                this.model.setSelection(evt.target.value);
            },
            toggleTree: function () {
                $("#tree").toggle("slow");
                $(".selectionFormButton").toggleClass("glyphicon-triangle-bottom");
                $(".selectionFormButton").toggleClass("glyphicon-triangle-right");
            },
            toggle: function () {
                $(".layer-selected-list").toggle("slow");
                $(".layer-selection-button").toggleClass("glyphicon-triangle-bottom");
                $(".layer-selection-button").toggleClass("glyphicon-triangle-right");
            }
        });

        return TreeView;
    });
