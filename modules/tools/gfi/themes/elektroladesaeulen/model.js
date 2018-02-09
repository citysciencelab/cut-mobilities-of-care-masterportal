define(function (require) {

    var Theme = require("modules/tools/gfi/themes/model"),
        ElektroladesaeulenTheme;

    ElektroladesaeulenTheme = Theme.extend({

        initialize: function () {
            this.listenTo(this, {
                "change:isReady": this.parseAttributes
            });
        },

        parseAttributes: function () {
            var attributes = this.get("gfiContent")[0],
                rowNames = _.keys(attributes),
                attributesObj = {};

            _.each(attributes, function (value, key) {
                if (_.contains(value, "|")) {
                    attributesObj[key] = String(value).split(" | ");
                }
                else {
                    attributesObj[key] = [String(value)];
                }
            });

        this.set("attributesObj", attributesObj);
        this.isElektroladesauele(attributesObj);
        },

        isElektroladesauele: function (attributesObj) {
            if (this.attributes.name.indexOf("Elektro") !== -1) {
                var len = _.values(attributesObj)[0].length,
                    headArray = [];

                for (var i = 0; i < len; i++) {
                    headArray.push("Steckplatz: " + i);
                }

                this.set("headArray", headArray);
            }
        }
    });

    return ElektroladesaeulenTheme;
});
