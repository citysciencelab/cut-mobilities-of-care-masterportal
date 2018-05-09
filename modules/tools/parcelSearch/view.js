define(function (require) {
    var Backbone = require("backbone"),
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
                // this.model.readConfig(psconfig);
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

            if (this.model.getIsCurrentWin() === true && this.model.getIsCollapsed() === false) {
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
            if (this.model.getDistrictNumber() !== "0" &&
                (this.model.getCadastralDistrictField() === false || this.model.getCadastralDistrictNumber() !== "0") &&
                this.model.getParcelNumber() !== "" &&
                _.isNumber(parseInt(this.model.getParcelNumber(), 10)) &&
                (this.model.getParcelDenominatorField() === false || this.model.getParcelDenominatorNumber() !== "")) {
                $("#submitbutton").attr("disabled", false);
                $("#reportbutton").attr("disabled", false);
            }
            else {
                $("#submitbutton").attr("disabled", true);
                $("#reportbutton").attr("disabled", true);
            }
        },
        cadastralDistrictFieldChanged: function () {
            var value = $("#cadastralDistrictField").val();

            if (value !== "0") {
                this.model.setCadastralDistrictNumber($("#cadastralDistrictField").val());
                $("#parcelFieldDenominator").attr("disabled", false);
                $("#parcelField").attr("disabled", false);
            }
            else {
                $("#parcelFieldDenominator").attr("disabled", true);
                $("#parcelField").attr("disabled", true);
            }
        },
        districtFieldChanged: function () {
            var value = $("#districtField").val();

            if (value !== "0") {
                if (this.model.getCadastralDistrictField() === true) {
                    this.insertCadastralDistricts($("#districtField").val());
                    $("#cadastralDistrictFieldSet").attr("disabled", false);
                    $("#parcelField").attr("disabled", true);
                    $("#parcelFieldDenominator").attr("disabled", true);
                    $("#parcelField").val("").trigger("change");
                    $("#parcelFieldDenominator").val("0").trigger("change");
                }
                else {
                    $("#parcelField").attr("disabled", false);
                    $("#parcelFieldDenominator").attr("disabled", false);
                }
                this.model.setDistrictNumber($("#districtField").val());
            }
            else {
                $("#cadastralDistrictFieldSet").attr("disabled", true);
                $("#parcelField").attr("disabled", true);
                $("#parcelFieldDenominator").attr("disabled", true);
            }
        },
        /*
         * Setzt die gültigen Fluren für die ausgewählte Gemarkung in select.
         */
        insertCadastralDistricts: function (districtNumber) {
            var cadastralDistricts = this.model.getCadastralDistricts();

            this.model.setCadastralDistrictNumber("0");
            $("#cadastralDistrictField").empty();
            $("#cadastralDistrictField").append("<option selected disabled value='0'>bitte wählen</option>");
            _.each((_.values(_.pick(cadastralDistricts, districtNumber))[0]), function (cadastralDistrict) {
                $("#cadastralDistrictField").append("<option value=" + cadastralDistrict + ">" + cadastralDistrict + "</option>");
            });
            $("#cadastralDistrictField").focus();
        },
        setParcelNumber: function (evt) {
            if ($("#parcelField")[0].checkValidity() === false) {
                $("input#parcelField").val("");
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
