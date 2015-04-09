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
                "click .rotate-pin": "unfixTree",
                "click .rotate-pin-back": "fixTree",
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
            },
            fixTree: function () {
                $("body").on("click", "#map", this.helpForFixing);
                $("body").on("click", "#searchbar", this.helpForFixing);
                $(".glyphicon-pushpin").addClass("rotate-pin");
                $(".glyphicon-pushpin").removeClass("rotate-pin-back");
            },
            unfixTree: function () {
                $("body").off("click", "#map", this.helpForFixing);
                $("body").off("click", "#searchbar", this.helpForFixing);
                $(".glyphicon-pushpin").removeClass("rotate-pin");
                $(".glyphicon-pushpin").addClass("rotate-pin-back");
            },
            helpForFixing: function (evt) {
                evt.stopPropagation();
            }
        });

        return TreeView;
    });
