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
            "change #districtField": "setDistrictNumber",
            "change #cadastralDistrictField": "setCadastralDistrictName",
            "keyup #parcelField": "setParcelNumber",
            "click button": "validateParcelNumber"
        },
        initialize: function () {
            this.listenTo(this.model, {
                "change:isCollapsed change:isCurrentWin": this.render,
                "change:districtNumber": this.setFocusToParcelInput
            });
        },
        render: function () {
            var attr = this.model.toJSON();

            if (this.model.get("isCurrentWin") === true && this.model.get("isCollapsed") === false) {
                this.$el.html("");
                $(".win-heading").after(this.$el.html(this.template(attr)));
                this.delegateEvents();
            }
            else {
                this.undelegateEvents();
            }
        },
        setCadastralDistrictName: function () {
            var value = $("#cadastralDistrictField").val();
        },
        setDistrictNumber: function () {
            var value = $("#districtField").val();

            if (value !== 0) {
                this.model.setDistrictNumber($("#districtField").val());
                this.setCadastralDistricts($("#districtField").val());
            }
            else {
                $("#cadastralDistrictFieldSet").attr("disabled", true);
                $("#parcelField").attr("disabled", true);
            }
        },
        /*
         * Setzt die gültigen Fluren für die ausgewählte Gemarkung in select.
         * cadastralDistricts kann undefined sein, wenn keine Fluren verwendet werden.
         */
        setCadastralDistricts: function (districtNumber) {
            var cadastralDistricts = this.model.get("cadastralDistricts");

            if (cadastralDistricts !== undefined) {
                $("#cadastralDistrictField").empty();
                _.each((_.values(_.pick(cadastralDistricts, districtNumber))[0]), function (cadastralDistrict) {
                    $("#cadastralDistrictField").append("<option value=" + cadastralDistrict + ">" + cadastralDistrict + "</option>");
                });
                $("#cadastralDistrictField").focus();
                $("#cadastralDistrictFieldSet").attr("disabled", false);
            }
            else {
                $("#parcelField").attr("disabled", false);
            }
        },
        setParcelNumber: function (evt) {
            if (evt.keyCode === 13) {
                this.model.validateParcelNumber();
            }
            this.model.setParcelNumber(evt.target.value);
        },
        setFocusToParcelInput: function () {
            $("#parcelField").focus();
        },
        validateParcelNumber: function () {
            this.model.validateParcelNumber();
        }
    });

    return ParcelSearchView;
});
