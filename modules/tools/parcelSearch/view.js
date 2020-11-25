import ParcelSearchTemplate from "text-loader!./template.html";
import store from "../../../src/app-store";

const ParcelSearchView = Backbone.View.extend({
    events: {
        "change #districtField": "districtFieldChanged",
        "change #cadastralDistrictField": "cadastralDistrictFieldChanged",
        "change #parcelField": "setParcelNumber",
        "change #parcelFieldDenominator": "setParcelDenominatorNumber",
        "keyup #parcelField": function (evt) {
            if (evt.keyCode === 13) {
                this.submitClicked();
            }
            else {
                this.setParcelNumber(evt);
            }
        },
        "keyup #parcelFieldDenominator": "setParcelDenominatorNumber",
        "click #submitbutton": "submitClicked",
        "click #reportbutton": "reportClicked"
    },
    /*
     * In init wird configuration nach "renderToDOM" untersucht.
     * Switch Window oder render2DOM - Modus
     */
    initialize: function () {
        this.listenTo(this.model, {
            "change:parcelNumber": this.checkInput,
            "change:parcelDenominatorNumber": this.checkInput,
            "change:districtNumber": this.checkInput,
            "change:cadastralDistrictNumber": this.checkInput,
            "change:districtText": () => {
                if (this.model.has("renderToDOM")) {
                    this.render2DOM();
                }
                else if (this.model.get("isActive") === true) {
                    this.render2Window(this.model, true);
                }
            }
        });
        if (this.model.has("renderToDOM")) {
            this.setElement(this.model.get("renderToDOM"));
            this.listenTo(this.model, {
                "change:fetched": function () {
                    this.render2DOM();
                }
            });
        }
        else {
            this.listenTo(this.model, {
                "change:isActive": this.render2Window
            });
        }
        if (this.model.get("isActive") === true) {
            this.render2Window(this.model, true);
        }
    },
    template: _.template(ParcelSearchTemplate),
    /*
     * Standard-Renderer, wenn parcelSearch in Window über Menubar angezeigt wird.
     */
    render2Window: function (model, value) {
        if (value) {
            this.setElement(document.getElementsByClassName("win-body")[0]);
            this.$el.html(this.template(model.toJSON()));
            this.delegateEvents();
        }
        else {
            this.$el.empty();
            store.dispatch("MapMarker/removePointMarker");
        }

        return this;
    },
    /*
     * Renderer, wenn parcelSearch ohne Menubar angezeigt wird, z.B. in IDA
     */
    render2DOM: function () {
        const attr = this.model.toJSON();

        this.$el.html(this.template(attr));
    },
    checkInput: function () {
        if (this.model.get("districtNumber") !== "0" &&
            (this.model.get("cadastralDistrictField") === false || this.model.get("cadastralDistrictNumber") !== "0") &&
            this.model.get("parcelNumber") !== "" &&
            typeof parseInt(this.model.get("parcelNumber"), 10) === "number" &&
            (this.model.get("parcelDenominatorField") === false || this.model.get("ParcelDenominatorNumber") !== "")) {
            this.$("#submitbutton").attr("disabled", false);
            this.$("#reportbutton").attr("disabled", false);
        }
        else {
            this.$("#submitbutton").attr("disabled", true);
            this.$("#reportbutton").attr("disabled", true);
        }
    },
    cadastralDistrictFieldChanged: function () {
        const value = this.$("#cadastralDistrictField").val();

        if (value !== "0") {
            this.model.setCadastralDistrictNumber(this.$("#cadastralDistrictField").val());
            this.$("#parcelFieldDenominator").attr("disabled", false);
            this.$("#parcelField").attr("disabled", false);
        }
        else {
            this.$("#parcelFieldDenominator").attr("disabled", true);
            this.$("#parcelField").attr("disabled", true);
        }
    },
    districtFieldChanged: function () {
        const value = this.$("#districtField").val();

        if (value !== "0") {
            if (this.model.get("cadastralDistrictField") === true) {
                this.insertCadastralDistricts(this.$("#districtField").val());
                this.$("#cadastralDistrictFieldSet").attr("disabled", false);
                this.$("#parcelField").attr("disabled", true);
                this.$("#parcelFieldDenominator").attr("disabled", true);
                this.$("#parcelField").val("").trigger("change");
                this.$("#parcelFieldDenominator").val("0").trigger("change");
            }
            else {
                this.$("#parcelField").attr("disabled", false);
                this.$("#parcelFieldDenominator").attr("disabled", false);
            }
            this.model.setDistrictNumber(this.$("#districtField").val());
        }
        else {
            this.$("#cadastralDistrictFieldSet").attr("disabled", true);
            this.$("#parcelField").attr("disabled", true);
            this.$("#parcelFieldDenominator").attr("disabled", true);
        }
    },
    /*
     * Setzt die gültigen Fluren für die ausgewählte Gemarkung in select.
     */
    insertCadastralDistricts: function (districtNumber) {
        const cadastralDistricts = this.model.get("cadastralDistricts");

        this.model.setCadastralDistrictNumber("0");
        this.$("#cadastralDistrictField").empty();
        this.$("#cadastralDistrictField").append("<option selected disabled value='0'>bitte wählen</option>");
        if (cadastralDistricts[districtNumber]) {
            cadastralDistricts[districtNumber].forEach(function (cadastralDistrict) {
                this.$("#cadastralDistrictField").append("<option value=" + cadastralDistrict + ">" + cadastralDistrict + "</option>");
            }, this);
        }
        this.$("#cadastralDistrictField").focus();
    },
    setParcelNumber: function (evt) {
        if (this.$("#parcelField")[0].checkValidity() === false) {
            this.$("input#parcelField").val("");
            this.model.setParcelNumber("");
            this.checkInput();
        }
        else {
            this.model.setParcelNumber(evt.target.value);
        }
    },
    setParcelDenominatorNumber: function (evt) {
        this.model.setParcelDenominatorNumber(evt.target.value);
    },
    submitClicked: function () {
        this.model.sendRequest();
    },
    reportClicked: function () {
        this.model.createReport();
    }
});

export default ParcelSearchView;
