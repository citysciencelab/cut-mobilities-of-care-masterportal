define([
    "underscore",
    "backbone",
    "modules/tree/model",
    "text!modules/tree/template.html",
    "eventbus"
], function (_, Backbone, LayerTree, LayerTreeTemplate, EventBus) {

        var TreeView = Backbone.View.extend({
            model: new LayerTree(),
            el: ".dropdown-tree",
            template: _.template(LayerTreeTemplate),
            events: {
                "change select": "setSelection",
                "click .rotate-pin": "unfixTree",
                "click .rotate-pin-back": "fixTree",
                "click .base-layer-selection > .glyphicon-question-sign": function () {
                    EventBus.trigger("showWindowHelp", "tree");
                },
                "click .layer-catalog-label": "toggleCatalog",
                "click .layer-selection-label > .glyphicon-triangle-bottom, .layer-selection-label > .glyphicon-triangle-right, .layer-selection-label > .control-label": "toggleSelection",
                "click .base-layer-selection > .control-label, .base-layer-selection > .glyphicon-triangle-bottom, .base-layer-selection > .glyphicon-triangle-right": "toggleBaseLayer",
                "click .layer-selection-save": function () {
                    EventBus.trigger("mapView:getCenterAndZoom");
                },
                "click .layer-extern-label": "toggleExternLayer"
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
                $(".layer-catalog-list").show("slow");
                $(".layer-catalog-label > .glyphicon").addClass("glyphicon-triangle-bottom");
                $(".layer-catalog-label > .glyphicon").removeClass("glyphicon-triangle-right");
            },
            toggleCatalog: function () {
                $(".layer-catalog-list").toggle("slow");
                $(".layer-catalog-label > .glyphicon").toggleClass("glyphicon-triangle-bottom");
                $(".layer-catalog-label > .glyphicon").toggleClass("glyphicon-triangle-right");
            },
            toggleSelection: function () {
                $(".layer-selected-list").toggle("slow");
                $(".layer-selection-label > .glyphicon").toggleClass("glyphicon-triangle-bottom");
                $(".layer-selection-label > .glyphicon").toggleClass("glyphicon-triangle-right");
            },
            toggleBaseLayer: function () {
                $(".base-layer-list").toggle("slow");
                $(".base-layer-selection > .glyphicon:first").toggleClass("glyphicon-triangle-bottom");
                $(".base-layer-selection > .glyphicon:first").toggleClass("glyphicon-triangle-right");
            },
            toggleExternLayer: function () {
                $(".layer-extern-list").toggle("slow");
                $(".layer-extern-label > .glyphicon:first").toggleClass("glyphicon-triangle-bottom");
                $(".layer-extern-label > .glyphicon:first").toggleClass("glyphicon-triangle-right");
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
