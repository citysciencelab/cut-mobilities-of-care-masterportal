define(function (require) {

    var Theme = require("modules/tools/gfi/themes/model"),
        FlaecheninfoTheme;

    FlaecheninfoTheme = Theme.extend({
        initialize: function () {
            this.listenTo(this, {
                "change:isReady": this.parseGfiContent
            });
        },
        parseGfiContent: function () {
            this.setGfiContent(this.get("gfiContent")[0]);
        },
        createReport: function () {
            var flurst = this.get("gfiContent").Flurstück,
                gemarkung = this.get("gfiContent").Gemarkung;

            Radio.trigger("ParcelSearch", "createReport", flurst, gemarkung);
        }
    });

    return FlaecheninfoTheme;
});
