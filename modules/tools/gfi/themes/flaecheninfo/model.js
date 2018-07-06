define(function (require) {

    var Theme = require("modules/tools/gfi/themes/model"),
        FlaecheninfoTheme;

    FlaecheninfoTheme = Theme.extend({
        initialize: function () {
            this.listenTo(this, {
                "change:isReady": this.parseGfiContent
            });
        },
        /**
         * sets title and gfiContent attributes
         */
        parseGfiContent: function () {
            this.setGfiContent(this.getGfiContent()[0]);
        },
        createReport: function () {
            var flurst = this.getGfiContent().Flurstück,
                gemarkung = this.getGfiContent().Gemarkung;

            Radio.trigger("ParcelSearch", "createReport", flurst, gemarkung);
        }
    });

    return FlaecheninfoTheme;
});
