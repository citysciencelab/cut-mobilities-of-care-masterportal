define([
    "underscore",
    "backbone",
    "modules/layertree/model",
    "text!modules/layertree/template.html"
], function (_, Backbone, LayerTree, LayerTreeTemplate) {

        var TreeView = Backbone.View.extend({
            model: new LayerTree(),
            el: ".dropdown-tree",
            template: _.template(LayerTreeTemplate),
            events: {
                "change select": "setSelection",
                "click .rotate-pin": "unfixTree",
                "click .rotate-pin-back": "fixTree",
                "click .layer-catalog-label": "toggleCatalog",
                "click .layer-selection-label": "toggleSelection"
            },
            initialize: function () {
                this.$el.on({
                    click: function (e) {
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
            toggleCatalog: function () {
                $("#tree").toggle("slow");
                $(".layer-catalog-label > .glyphicon").toggleClass("glyphicon-triangle-bottom");
                $(".layer-catalog-label > .glyphicon").toggleClass("glyphicon-triangle-right");
            },
            toggleSelection: function () {
                $(".layer-selected-list").toggle("slow");
                $(".layer-selection-label > .glyphicon").toggleClass("glyphicon-triangle-bottom");
                $(".layer-selection-label > .glyphicon").toggleClass("glyphicon-triangle-right");
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
