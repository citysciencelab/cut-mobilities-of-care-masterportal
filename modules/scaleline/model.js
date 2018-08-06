define(function () {

    var ScaleLine = Backbone.Model.extend({

        defaults: {
            // Maßstabszahl
            scaleNumber: "",
            // Wert in der Maßstabsleiste
            scaleLineValue: ""
        },

        initialize: function () {
            this.listenTo(Radio.channel("MapView"), {
                "changedOptions": this.modifyScale
            });

            this.listenTo(this, {
                "change:scaleNumber": this.createScaleLineValue
            });

            this.modifyScale(Radio.request("MapView", "getOptions"));
        },

        /**
         * Ist die Maßstabszahl größer als vier Ziffern, wird die Zahl in Tausenderblöcken gruppiert
         * @param  {Object} obj - Resolution, Zoomlevel und Scale aus der MapView
         * @returns {void}
         */
        modifyScale: function (obj) {
            var scaleNumber = obj.scale.toString();

            if (scaleNumber >= 10000) {
                scaleNumber = scaleNumber.substring(0, scaleNumber.length - 3) + " " + scaleNumber.substring(scaleNumber.length - 3);
            }
            this.setScaleNumber(scaleNumber);
        },

        /**
        * Berechnet den Wert für die Maßstabsleiste in Bezug auf eine 2cm lange Linie
        * Ist der Wert größer als 1000m ist, wird er km angegeben
        * @returns {void}
        */
        createScaleLineValue: function () {
            var scaleLineValue,
                scaleNumber = Math.round(0.02 * this.get("scaleNumber").replace(" ", ""));

            if (scaleNumber >= 1000) {
                scaleLineValue = (scaleNumber / 1000).toString() + " km";
            }
            else {
                scaleLineValue = scaleNumber.toString() + " m";
            }

            this.setScaleLineValue(scaleLineValue);
        },

        setScaleNumber: function (value) {
            this.set("scaleNumber", value);
        },

        setScaleLineValue: function (value) {
            this.set("scaleLineValue", value);
        }

    });

    return ScaleLine;
});
