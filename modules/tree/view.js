define([
    "backbone",
    "modules/tree/model",
    "text!modules/tree/template.html",
    "eventbus"
], function (Backbone, LayerTree, LayerTreeTemplate, EventBus) {

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
                "click .layer-selection-label > .glyphicon-minus-sign, .layer-selection-label > .glyphicon-plus-sign, .layer-selection-label > .control-label": "toggleSelection",
                "click .base-layer-selection > .control-label, .base-layer-selection > .glyphicon-minus-sign, .base-layer-selection > .glyphicon-plus-sign": "toggleBaseLayer",
                "click .layer-selection-save": function () {
                    EventBus.trigger("mapView:getCenterAndZoom");
                },
                "click .layer-extern-label": "toggleExternLayer"
            },
            initialize: function () {
                require(["modules/tree/selection/listView", "modules/tree/catalogLayer/listView", "modules/tree/catalogBaseLayer/listView", "modules/tree/catalogExtern/listView"], function (LayerSelectionListView, LayerTreeView, BaseLayerListView, CataExView) {
                    new LayerSelectionListView();
                    new LayerTreeView();
                    new BaseLayerListView();
                    new CataExView();
                });
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
                $(".layer-catalog-label > .glyphicon").addClass("glyphicon-minus-sign");
                $(".layer-catalog-label > .glyphicon").removeClass("glyphicon-plus-sign");
            },
            toggleCatalog: function () {
                $(".layer-catalog-list").toggle("slow");
                $(".layer-catalog-label > .glyphicon").toggleClass("glyphicon-minus-sign");
                $(".layer-catalog-label > .glyphicon").toggleClass("glyphicon-plus-sign");
            },
            toggleSelection: function () {
                $(".layer-selected-list").toggle("slow");
                $(".layer-selection-label > .glyphicon").toggleClass("glyphicon-minus-sign");
                $(".layer-selection-label > .glyphicon").toggleClass("glyphicon-plus-sign");
            },
            toggleBaseLayer: function () {
                $(".base-layer-list").toggle("slow");
                $(".base-layer-selection > .glyphicon:first").toggleClass("glyphicon-minus-sign");
                $(".base-layer-selection > .glyphicon:first").toggleClass("glyphicon-plus-sign");
            },
            toggleExternLayer: function () {
                $(".layer-extern-list").toggle("slow");
                $(".layer-extern-label > .glyphicon:first").toggleClass("glyphicon-minus-sign");
                $(".layer-extern-label > .glyphicon:first").toggleClass("glyphicon-plus-sign");
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
