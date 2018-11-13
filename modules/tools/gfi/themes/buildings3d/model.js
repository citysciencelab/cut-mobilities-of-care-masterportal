import Theme from "../model";

const DefaultTheme = Theme.extend({
    defaults: _.extend({}, Theme.prototype.defaults, {
        roofTypes: {
            "1000": "Flachdach",
            "2100": "Pultdach",
            "2200": "Versetztes Pultdach",
            "3100": "Satteldach",
            "3200": "Walmdach",
            "3300": "Krüppelwalmdach",
            "3400": "Mansardendach",
            "3500": "Zeltdach",
            "3600": "Kegeldach",
            "3700": "Kuppeldach",
            "3800": "Sheddach",
            "3900": "Bogendach",
            "4000": "Turmdach",
            "5000": "Mischform",
            "9999": "Sonstiges Dach"
        }
    }),

    initialize: function () {
        var channel = Radio.channel("defaultTheme");

        this.listenTo(this, {
            "change:isReady": function () {
                this.translateProperties();
            }
        });
        this.listenTo(channel, {
            "changeGfi": function () {
                Radio.trigger("gfiView", "render");
            }
        });
    },

    translateProperties: function () {
        this.get("gfiContent").forEach(function (element) {
            const roofTypes = this.get("roofTypes");

            Object.keys(element).forEach(function (attribute) {
                if (attribute === "Dachtyp") {
                    element[attribute] = roofTypes[element[attribute]];
                }
                else if (attribute === "Dachhöhe") {
                    const t = Number.parseFloat(element[attribute]).toFixed(2);

                    element[attribute] = t.toString() + "m";
                }
            });
        }, this);
    }
});

export default DefaultTheme;
