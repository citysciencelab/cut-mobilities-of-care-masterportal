import Template from "text-loader!./templateCatalog.html";

const FolderView = Backbone.View.extend({
    events: {
        "change select": "setSelection",
        "click .header > .glyphicon, .header > .control-label": "toggleIsExpanded",
        // "click .header > .glyphicon, .header > .control-label": "toggleCatalogs",
        "click .Baselayer .catalog_buttons .glyphicon-question-sign": function () {
            Radio.trigger("Quickhelp", "showWindowHelp", "tree");
        },
        "click .glyphicon-adjust": "toggleBackground",
        "click .rotate-pin": "unfixTree",
        "click .rotate-pin-back": "fixTree",
        "click .layer-selection-save": function () {
            Radio.trigger("ModelList", "setModelAttributesById", "saveSelection", {isActive: true});
            // Schließt den Baum
            $(".nav li:first-child").removeClass("open");
            // Schließt die Mobile Navigation
            $(".navbar-collapse").removeClass("in");
            // Selektiert die URL
            $(".input-save-url").select();
        }
    },
    initialize: function () {
        this.listenTo(Radio.channel("Map"), {
            "change": function (mode) {
                if (mode === "Oblique") {
                    this.model.setIsExpanded(false);
                }
                this.togle3dCatalog(mode);
            }
        });
        this.listenTo(this.model, {
            "change:isExpanded": this.toggleGlyphicon
        }, this);

        this.$el.on({
            click: function (e) {
                e.stopPropagation();
            }});
        this.render();
        this.togle3dCatalog(Radio.request("Map", "getMapMode"));
    },
    tagName: "li",
    className: "layer-catalog",
    template: _.template(Template),
    render: function () {
        var attr = this.model.toJSON();

        attr.treeType = Radio.request("Parser", "getTreeType");
        attr.category = Radio.request("Parser", "getCategory");
        attr.categories = Radio.request("Parser", "getCategories");
        attr.backgroundImage = Radio.request("Parser", "getItemByAttributes", {id: "backgroundImage"});
        this.$el.find(".header").toggleClass("closed");
        $("#" + this.model.get("parentId")).append(this.$el.html(this.template(attr)));
        return this;
    },
    toggleIsExpanded: function () {
        this.model.toggleIsExpanded();
    },
    toggleGlyphicon: function () {
        var elem = $("ul#" + this.model.get("id")).prev().find(".glyphicon:first");

        if (!this.model.get("isExpanded")) {
            elem.removeClass("glyphicon-minus-sign");
            elem.addClass("glyphicon-plus-sign");
        }
        else {
            elem.removeClass("glyphicon-plus-sign");
            elem.addClass("glyphicon-minus-sign");
        }
        // Hässlicher IE Bugfix, weil IE 11 mit overflow: auto und remove probleme macht (leerer Katalog wird sehr hoch und bekommt die Höhe -0.01)
        if (!this.model.get("isExpanded")) {
            this.$el.find(".LayerListMaxHeight").css("overflow", "visible");
        }
        else {
            this.$el.find(".LayerListMaxHeight").css("overflow", "auto");
        }
    },
    toggleBackground: function () {
        Radio.trigger("MapView", "toggleBackground");
        $(".glyphicon-adjust").toggleClass("rotate-adjust");
        $(".glyphicon-adjust").toggleClass("rotate-adjust-back");
    },
    togle3dCatalog: function (mode) {
        if (mode === "3D" && this.model.get("id") === "3d_daten") {
            this.$el.show();
        }
        else if (mode !== "3D" && this.model.get("id") === "3d_daten") {
            this.$el.hide();
        }
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
    },
    setSelection: function (evt) {
        Radio.trigger("Parser", "setCategory", evt.currentTarget.value);
    }
});

export default FolderView;
