define([
    "backbone",
    "text!modules/tools/parcelSearch/template.html",
    "modules/tools/parcelSearch/model"
], function (Backbone, parcelSearchTemplate, ParcelSearch) {

    var ParcelSearchView = Backbone.View.extend({
        model: new ParcelSearch(),
        className: "win-body",
        template: _.template(parcelSearchTemplate),
        events: {
            "change #districtField": "districtFieldChanged",
            "change #cadastralDistrictField": "cadastralDistrictFieldChanged",
            "change #parcelField": "setParcelNumber",
            "change #parcelFieldDenominator": "setParcelDenominatorNumber",
            "keyup #parcelField": "setParcelNumber",
            "keyup #parcelFieldDenominator": "setParcelDenominatorNumber",
            "click #submitbutton": "submitClicked"
        },
        initialize: function () {
            this.listenTo(this.model, {
                "change:isCollapsed change:isCurrentWin": this.render,
                "change:parcelNumber": this.checkInput,
                "change:parcelDenominatorNumber": this.checkInput,
                "change:districtNumber": this.checkInput,
                "change:cadastralDistrictNumber": this.checkInput
            });
        },
        render: function () {
            var attr = this.model.toJSON();

            if (this.model.get("isCurrentWin") === true && this.model.get("isCollapsed") === false) {
                $(".win-heading").after(this.$el.html(this.template(attr)));
                this.delegateEvents();
            }
            else {
                this.undelegateEvents();
            }
        },
        checkInput: function () {
            if (this.model.get("districtNumber") !== "0" &&
                (this.model.get("cadastralDistrictField") === false || this.model.get("cadastralDistrictNumber") !== "0") &&
                this.model.get("parcelNumber") !== "" &&
                (this.model.get("parcelDenominatorField") === false || this.model.get("parcelDenominatorNumber") !== "")) {
                $("#submitbutton").attr("disabled", false);
            }
            else {
                $("#submitbutton").attr("disabled", true);
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
                if (this.model.get("cadastralDistrictField") === true) {
                    this.insertCadastralDistricts($("#districtField").val());
                    $("#cadastralDistrictFieldSet").attr("disabled", false);
                    $("#parcelField").attr("disabled", true);
                    $("#parcelFieldDenominator").attr("disabled", true);
                    $("#parcelField").val("").trigger("change");
                    $("#parcelFieldDenominator").val("").trigger("change");
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
            var cadastralDistricts = this.model.get("cadastralDistricts");

            this.model.setCadastralDistrictNumber("0");
            $("#cadastralDistrictField").empty();
            $("#cadastralDistrictField").append("<option selected disabled value='0'>bitte wählen</option>");
            _.each((_.values(_.pick(cadastralDistricts, districtNumber))[0]), function (cadastralDistrict) {
                $("#cadastralDistrictField").append("<option value=" + cadastralDistrict + ">" + cadastralDistrict + "</option>");
            });
            $("#cadastralDistrictField").focus();
        },
        setParcelNumber: function (evt) {
            this.model.setParcelNumber(evt.target.value);
        },
        setParcelDenominatorNumber: function (evt) {
            this.model.setParcelDenominatorNumber(evt.target.value);
        },
        submitClicked: function () {
            this.model.sendRequest();
        }
    });

    return ParcelSearchView;
});
