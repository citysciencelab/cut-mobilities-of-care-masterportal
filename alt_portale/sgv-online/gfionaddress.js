define(function (require) {

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        EventBus = require("eventbus"),
        ol = require("openlayers");

    gfiOnAddressSearch = Backbone.Model.extend({

        /*
         * Events werden von searchbar getriggert.
         */
        initialize: function () {
            EventBus.on("searchbar:hit", this.searchbarhit, this);
            EventBus.on("gaz:getAdress", this.adressHit, this);
        },
        /*
         * Wird eine Adresse ausgewählt (über findeStrasse), müssen Detailinforationen abgerufen werden.
         */
        searchbarhit: function (address) {
            if (address && address.type === "Adresse") {
                EventBus.trigger("gaz:adressSearch", address.adress);
            }
        },
        /*
         * Verarbeiten der GAGES-Informationen und öffnen des GFI
         */
        adressHit: function (data) {
            var gages = $("gages\\:Hauskoordinaten,Hauskoordinaten", data)[0],
                coordinates = [],
                attributes = {},
                coordinates = $(gages).find("gml\\:pos, pos")[0].textContent.split(" ");

            $(gages).find("*").filter(function () {
                return this.nodeName.indexOf("dog") !== -1 || this.nodeName.indexOf("gages") !== -1;
            }).each(function (i, obj) {
                _.extend(attributes, _.object([this.nodeName.split(":")[1]], [this.textContent]));
            });

            Radio.trigger("Map", "setGFIParams", [[{
                typ: "WFS",
                feature: new ol.Feature(attributes),
                attributes: "showAll",
                name: "Adressinformation",
                ol_layer: new ol.layer.Vector({
                    typ: this.get("typ")
                })
            }], coordinates]);
        }
    });

    return gfiOnAddressSearch;
});
