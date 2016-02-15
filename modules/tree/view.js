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
                "click .rotate-adjust": "greyBackground",
                "click .rotate-adjust-back": "whiteBackground",
                "click .base-layer-catalog > .header > .glyphicon-question-sign": function () {
                    EventBus.trigger("showWindowHelp", "tree");
                },
                "click .layer-catalog > .header > .glyphicon-minus-sign, .layer-catalog > .header > .glyphicon-plus-sign, .layer-catalog > .header > .control-label": "toggleCatalogAndBaseLayer",
                "click .layer-selection > .header > .glyphicon-minus-sign, .layer-selection > .header > .glyphicon-plus-sign, .layer-selection > .header > .control-label": "toggleSelection",
                "click .base-layer-catalog > .header > .control-label, .base-layer-catalog > .header > .glyphicon-minus-sign, .base-layer-catalog > .header > .glyphicon-plus-sign": "toggleCatalogAndBaseLayer",
                "click .layer-selection-save": function () {
                    EventBus.trigger("mapView:getCenterAndZoom");
                },
                "click .layer-catalog-extern > .header > span": "toggleExternLayer"
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
                $(".layer-catalog > .header > .glyphicon").toggleClass("glyphicon-minus-sign");
                $(".layer-catalog > .header > .glyphicon").toggleClass("glyphicon-plus-sign");
            },
            toggleSelection: function () {
                $(".layer-selected-list").toggle("slow");
                $(".layer-selection > .header > .glyphicon").toggleClass("glyphicon-minus-sign");
                $(".layer-selection > .header > .glyphicon").toggleClass("glyphicon-plus-sign");
            },
            toggleBaseLayer: function () {
                $(".base-layer-list").toggle("slow");
                $(".base-layer-catalog > .header > .glyphicon").toggleClass("glyphicon-minus-sign");
                $(".base-layer-catalog > .header > .glyphicon").toggleClass("glyphicon-plus-sign");
            },
            toggleCatalogAndBaseLayer: function() {
              this.toggleCatalog();
              this.toggleBaseLayer();
            },
            toggleExternLayer: function () {
                $(".layer-extern-list").toggle("slow");
                $(".layer-catalog-extern > .header > .glyphicon").toggleClass("glyphicon-minus-sign");
                $(".layer-catalog-extern > .header > .glyphicon").toggleClass("glyphicon-plus-sign");
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
            whiteBackground: function () {
                this.model.set("defaultBackground", $("#map").css("background"));
                $("#map").css("background", "white");
                $(".glyphicon-adjust").addClass("rotate-adjust");
                $(".glyphicon-adjust").removeClass("rotate-adjust-back");
            },
            greyBackground: function () {
                $("#map").css("background", this.model.get("defaultBackground"));
                $(".glyphicon-adjust").removeClass("rotate-adjust");
                $(".glyphicon-adjust").addClass("rotate-adjust-back");
            },
            helpForFixing: function (evt) {
                evt.stopPropagation();
            }
        });

    return TreeView;
});
