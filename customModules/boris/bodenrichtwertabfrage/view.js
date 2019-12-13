import initializeBrwAbfrageModel from "../bodenrichtwertabfrage/model";
import * as moment from "moment";
import Template from "text-loader!./template.html";
import TemplateCategoryDetails from "text-loader!./templateCategoryDetails.html";
import TemplateCategoryLage from "text-loader!./templateCategoryLage.html";
import TemplateCategoryUmrechnen from "text-loader!./templateCategoryUmrechnen.html";
import TemplateCategorySchichtwerte from "text-loader!./templateCategorySchichtwerte.html";
import TemplateInfoContainer from "text-loader!./templateInfoContainer.html";
import TemplateLanduseSelect from "text-loader!./templateLanduseSelect.html";
import TemplateLayerSelect from "text-loader!./templateLayerSelect.html";
import TemplateMobileLayerSelect from "text-loader!./templateMobileLayerSelect.html";
import "./style.less";

const BrwAbfrageView = Backbone.View.extend({
    events: {
        "click .list-group-item": "handleSelectBRWYear",
        "change #brwLayerSelect": "handleSelectBRWYear",
        "click #brwCategorySelect": "handleClickCategory",
        "change #landuseSelect": "setLanduse",
        "click .print": "preparePrint",
        "change #zBauwSelect": "handleBauwChange",
        "change #zStrassenLageSelect": "handleStrassenLageChange",
        "change #zGeschossfl_zahlInput": "handleGeschossfl_zahlChange",
        "keyup #zGeschossfl_zahlInput": "handleGeschossfl_zahlChange",
        "change #zGrdstk_flaecheInput": "handleGrdstk_flaecheChange",
        "keyup #zGrdstk_flaecheInput": "handleGrdstk_flaecheChange",
        "click button.close": function () {
            Radio.trigger("Sidebar", "toggle", false);
            Radio.trigger("Alert", "alert", {
                text: "Bitte navigieren Sie zum gesuchten Bodenrichtwert bzw. zur -zone und selektieren Sie diesen.",
                kategorie: "alert-success"
            });
        },
        "click .glyphicon-question-sign": "handleHelpButton"
    },
    initialize: function () {
        this.model = initializeBrwAbfrageModel();
        this.listenTo(this.model, {
            "change:isViewMobile": this.handleViewChange,
            "change:selectedBrwFeature": this.render,
            "change:convertedBrw": this.render,
            "change:gfiFeature": this.render,
            "change:selectedCategory": this.render
        });
        this.render(this.model, this.model.get("isActive"));
    },
    id: "boris",
    template: _.template(Template),
    templateCategoryDetails: _.template(TemplateCategoryDetails),
    templateCategoryLage: _.template(TemplateCategoryLage),
    templateCategoryUmrechnen: _.template(TemplateCategoryUmrechnen),
    templateCategorySchichtwerte: _.template(TemplateCategorySchichtwerte),
    templateInfoContainer: _.template(TemplateInfoContainer),
    templateLanduseSelect: _.template(TemplateLanduseSelect),
    templateLayerSelect: _.template(TemplateLayerSelect),
    templateMobileLayerSelect: _.template(TemplateMobileLayerSelect),
    render: function () {
        const attr = this.model.toJSON();

        Radio.trigger("Alert", "alert:remove");

        this.$el.html(this.template(attr));
        this.renderLayerlist(attr);
        Radio.trigger("Sidebar", "append", this.el);
        Radio.trigger("Sidebar", "toggle", true);
        this.delegateEvents();

        return this;
    },

    /**
     * Zeichnet die Layerlist unterschiedlich für mobil/desktop
     * @param   {object} attr Modelattribute
     * @returns {void}
     */
    renderLayerlist: function (attr) {
        if (!this.model.has("gfiFeature") && this.model.get("isViewMobile")) {
            this.$el.find(".brw-container").append(this.templateMobileLayerSelect(attr));
        }
        else {
            this.$el.find(".brw-container").append(this.templateLayerSelect(attr));
            this.renderLanduse();
        }
    },

    /**
     * Zeichne ggf. landUse Template
     * @param   {object} attr Modelattribute
     * @returns {void}
     */
    renderLanduse: function () {
        const attr = this.model.toJSON();

        if (this.model.has("gfiFeature")) {
            this.$el.find(".brw-container").append(this.templateLanduseSelect(attr));
        }
        if (Object.keys(this.model.get("selectedBrwFeature")).length !== 0) {
            this.renderInfoContainer(attr);
        }
    },

    /**
     * Zeichne ggf. BRW Template
     * @param   {object} attr Modelattribute
     * @returns {void}
     */
    renderInfoContainer: function (attr) {
        this.$el.find(".brw-container").append(this.templateInfoContainer(attr));

        if (this.model.get("selectedCategory") === "Detailinformationen") {
            this.$el.find(".info-container-content").append(this.templateCategoryDetails(attr));
        }
        else if (this.model.get("selectedCategory") === "Lagebeschreibung") {
            this.$el.find(".info-container-content").append(this.templateCategoryLage(attr));
        }
        else if (this.model.get("selectedCategory") === "Umrechnung auf individuelles Grundstück") {
            this.$el.find(".info-container-content").append(this.templateCategoryUmrechnen(attr));
            this.model.setZBauwSelect(this.$el.find("#zBauwSelect").val());
        }
        else if (this.model.get("selectedCategory") === "Schichtwerte") {
            this.$el.find(".info-container-content").append(this.templateCategorySchichtwerte(attr));
        }
    },

    handleBauwChange: function () {
        var text = document.getElementById("zBauwSelect").options[document.getElementById("zBauwSelect").selectedIndex].value;

        this.model.updateSelectedBrwFeature("zBauweise", text);
        this.model.sendWpsConvertRequest();
    },

    handleStrassenLageChange: function () {
        var text = document.getElementById("zStrassenLageSelect").options[document.getElementById("zStrassenLageSelect").selectedIndex].text;

        this.model.updateSelectedBrwFeature("zStrassenLage", text);
        this.model.sendWpsConvertRequest();
    },

    handleGeschossfl_zahlChange: function (evt) {
        if (evt.type === "change" || (evt.key === "Enter" && Radio.request("Util", "isInternetExplorer"))) {
            this.model.updateSelectedBrwFeature("zGeschossfl_zahl", parseFloat(evt.currentTarget.value.replace(",", ".")));
            this.model.sendWpsConvertRequest();
        }
    },

    handleGrdstk_flaecheChange: function (evt) {
        if (evt.type === "change" || (evt.key === "Enter" && Radio.request("Util", "isInternetExplorer"))) {
            this.model.updateSelectedBrwFeature("zGrdstk_flaeche", parseFloat(evt.currentTarget.value.replace(",", ".")));
            this.model.sendWpsConvertRequest();
        }
    },

    /**
     * Regelt das Event von isViewMobile
     * @returns {void}
     */
    handleViewChange: function () {
        this.render(this.model, false);
        this.render(this.model, this.model.get("isActive"));
    },

    /**
     * Aktionen beim Wechseln eines BRW-Jahres aus der Sidebar abhängig von mobil / desktop
     * @param {jQuery.Event} evt - select change event | button click event
     * @returns {void}
     */
    handleSelectBRWYear: function (evt) {
        var selectedLayername = evt.target.value;

        this.model.switchLayer(selectedLayername);
        if (this.model.get("isViewMobile")) {
            Radio.trigger("Alert", "alert", {
                text: "Bitte navigieren Sie zum gesuchten Bodenrichtwert bzw. zur -zone und selektieren Sie diesen.",
                kategorie: "alert-success"
            });
            Radio.trigger("Sidebar", "toggle", false);
        }
        else {
            this.model.checkBrwFeature(this.model.get("brwFeatures"), selectedLayername.split(".")[2]);
            Radio.trigger("Alert", "alert:remove");
            this.render(this.model, this.model.get("isActive"));
        }
    },

    /**
     * Togglet die Visibility des Hinweistextes
     * @param   {evt} evt Event am Glyphicon
     * @returns {void}
     */
    handleHelpButton: function (evt) {
        var helper = this.$el.find(evt.target).parent().next().next();

        if (helper.hasClass("help")) {
            helper.slideToggle();
        }
    },

    preparePrint: function () {
        this.model.preparePrint();
    },
    /**
     * Toggles the selected Landuse
     * @param {jQuery.Event} evt - select change event
     * @return {void}
     */
    setLanduse: function (evt) {
        const brwLayerSelect = this.$el.find("#brwLayerSelect").find("option:selected").val(),
            selectedBRWLayerYear = moment(brwLayerSelect, "dd.MM.YYYY").format("YYYY"),
            selectedText = evt.target.options[evt.target.selectedIndex].text,
            selectedValue = evt.target.options[evt.target.selectedIndex].value;

        this.model.setBrwLanduse(selectedText);
        this.model.sendGetFeatureRequest(selectedValue, selectedBRWLayerYear);
    },

    /**
     * Aktionen beim Wechseln der Kategorie einer BRW-Information
     * @param   {evt} evt Klickevent
     * @returns {void}
     */
    handleClickCategory: function (evt) {
        this.model.setSelectedCategory(evt.currentTarget.value);
    }
});

export default BrwAbfrageView;
