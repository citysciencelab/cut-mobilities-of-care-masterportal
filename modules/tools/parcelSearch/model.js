define([
    "backbone",
    "eventbus",
    "config",
    "modules/core/util"
], function (Backbone, EventBus, Config, Util) {

    var ParcelSearch = Backbone.Model.extend({
        defaults: {
            "districtNumber": "0601",
            "parcelNumber": ""
        },
        url: Util.getPath(Config.parcelSearch),
        initialize: function () {
            this.listenTo(EventBus, {
                "winParams": this.setStatus
            });
            this.fetch();
        },
        validate: function (attributes) {
            var onlyNumbers = /^\d+$/;

            if (attributes.parcelNumber.length < 1) {
                return "Bitte geben Sie eine Flurstücksnummer ein";
            }
            if (!attributes.parcelNumber.match(onlyNumbers)) {
                return "Bitte geben Sie nur Ziffern ein";
            }
        },
        setStatus: function (args) {
            if (args[2] === "parcelSearch") {
                this.set("isCollapsed", args[1]);
                this.set("isCurrentWin", args[0]);
            }
            else {
                this.set("isCurrentWin", false);
            }
        },
        setDistrictNumber: function (value) {
            this.set("districtNumber", value);
        },
        setParcelNumber: function (value) {
            this.set("parcelNumber", value);
        },
        validateParcelNumber: function () {
            if (this.isValid()) {
                $("#parcelField + .text-danger").html("");
                $("#parcelField").parent().removeClass("has-error");
                console.log(this.get("parcelNumber"));
                console.log(this.get("districtNumber"));
            }
            else {
                $("#parcelField + .text-danger").html("");
                $("#parcelField").after("<span class='text-danger'><small>" + this.validationError + "</small></span>");
                $("#parcelField").parent().addClass("has-error");
            }
        }
    });

    return ParcelSearch;
});
