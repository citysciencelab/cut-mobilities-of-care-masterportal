define(function (require) {
    var $ = require("jquery"),
        ParcelSearchTemplate = require("text!modules/tools/parcelSearch/template.html"),
        ParcelSearch = require("modules/tools/parcelSearch/model"),
        ParcelSearchView;

    ParcelSearchView = Backbone.View.extend({
        model: new ParcelSearch(),
        className: "win-body",
        template: _.template(ParcelSearchTemplate),
        events: {
            "change #districtField": "districtFieldChanged",
            "change #cadastralDistrictField": "cadastralDistrictFieldChanged",
            "change #parcelField": "setParcelNumber",
            "change #parcelFieldDenominator": "setParcelDenominatorNumber",
            "keyup #parcelField": "setParcelNumber",
            "keyup #parcelFieldDenominator": "setParcelDenominatorNumber",
            "click #submitbutton": "submitClicked",
            "click #reportbutton": "reportClicked"
        },
        /*
         * In init wird configuration nach "renderToDOM" untersucht.
         * Switch Window oder render2DOM - Modus
         */
        initialize: function (psconfig) {
            var renderToDOM = psconfig && psconfig.renderToDOM ? psconfig.renderToDOM : null;

            this.listenTo(this.model, {
                "change:parcelNumber": this.checkInput,
                "change:parcelDenominatorNumber": this.checkInput,
                "change:districtNumber": this.checkInput,
                "change:cadastralDistrictNumber": this.checkInput
            });

            if (_.isString(renderToDOM)) {
                this.setElement(renderToDOM);
                this.listenTo(this.model, {
                    "change:fetched": function () {
                        this.render2DOM();
                    }
                });
            }
            else {
                this.listenTo(this.model, {
                    "change:isCollapsed change:isCurrentWin": this.render2Window
                });
            }
        },
        /*
         * Standard-Renderer, wenn parcelSearch in Window über Menubar angezeigt wird.
         */
        render2Window: function () {
            var attr = this.model.toJSON();

            if (this.model.get("isCurrentWin") === true && this.model.get("isCollapsed") === false) {
                $(".win-heading").after(this.$el.html(this.template(attr)));
                this.delegateEvents();
            }
            else {
                this.undelegateEvents();
            }
        },
        /*
         * Renderer, wenn parcelSearch ohne Menubar angezeigt wird, z.B. in IDA
         */
        render2DOM: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
        },
        checkInput: function () {
            if (this.model.get("districtNumber") !== "0" &&
                (this.model.get("cadastralDistrictField") === false || this.model.get("cadastralDistrictNumber") !== "0") &&
                this.model.get("parcelNumber") !== "" &&
                _.isNumber(parseInt(this.model.get("parcelNumber"), 10)) &&
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
            var value = this.$("#cadastralDistrictField").val();

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
            var value = this.$("#districtField").val();

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
            var cadastralDistricts = this.model.get("cadastralDistricts");

            this.model.setCadastralDistrictNumber("0");
            this.$("#cadastralDistrictField").empty();
            this.$("#cadastralDistrictField").append("<option selected disabled value='0'>bitte wählen</option>");
            _.each(_.values(_.pick(cadastralDistricts, districtNumber))[0], function (cadastralDistrict) {
                this.$("#cadastralDistrictField").append("<option value=" + cadastralDistrict + ">" + cadastralDistrict + "</option>");
            });
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

    return ParcelSearchView;
});
