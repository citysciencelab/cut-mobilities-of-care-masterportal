    define(function (require) {
    var Backbone = require("backbone"),
        SummaryModel;

    SummaryModel = Backbone.Model.extend({
        defaults: {
            params: {},
            nutzung: "",
            produkt: "",
            jahr: "",
            lage: "",
            page: ""
        },
        initialize: function () {
        },
        produktChanged: function (produkt) {
            var produktName = $("#" + produkt)[0].innerHTML;

            produktName = produktName + " (" + produkt + ")";
            this.set("produkt", produktName);
        },
        paramsChanged: function (params) {
            var newParams = {};

            _.each(params, function (value, key) {
                var formGroup = $("#" + key).closest(".form-group");

                if (formGroup.length !== 0) {
                    var keyString = $(formGroup).find("h5")[0].innerHTML,
                        isSelect = $("#" + key).is("select") ? true : false;

                    if (key === "MEAN") {
                        var meazVal = $("#MEAZ")[0].value;

                        value = value + " / " + meazVal;
                    }
                    else if (key === "MEAZ") {
                        return;
                    }
                    else if (isSelect) {
                        value = $("#" + key + " option:selected" ).text();
                    }
                    else if (value === "true") {
                        value = "Ja";
                    }
                    else if (value === "false") {
                        value = "Nein";
                    }

                    newParams[keyString] = value;
                }
            });
            this.set("params", newParams);
        },
        nutzungChanged: function (nutzung) {
            var newNutzung = $("#" + nutzung)[0].innerHTML + " (" + nutzung + ")";

            this.set("nutzung", newNutzung);
        },
        lageChanged: function (lage) {
            var newLage = lage;

            if (newLage.type !== "Adresse") {
                newLage.gemarkung = newLage.gemarkung.name + " (" + newLage.gemarkung.nummer + ")";
                newLage["zuwegung"] = newLage.strassendefinition.streetname + " (" + newLage.strassendefinition.streetkey + ")";
            }

            var newLage = _.omit(lage, ["strassendefinition","strassenschluessel", "rechtswert", "hochwert"]);
            this.set("lage", newLage);
        }
    });

    return SummaryModel;
});
