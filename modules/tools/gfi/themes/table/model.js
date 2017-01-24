define(function (require) {

    var Theme = require("modules/tools/gfi/themes/model"),
        TableTheme;

    TableTheme = Theme.extend({

        initialize: function () {
            this.listenTo(this, {
                "change:isReady": this.identifyColNames
            });
        },

        /**
         * Ermittelt alle Namen(=Spaltennamen) der Eigenschaften der Objekte
         */
        identifyColNames: function () {
            console.log(this.getGfiContent());
            if (_.isUndefined(this.get("gfiContent")) === false) {
                var colNames = _.keys(this.getGfiContent()[0]);

                this.setColNames(colNames);
            }
        },

        /**
         * Setter für Attribut "colNames"
         * @param {string[]} value - die Spaltennamen
         */
        setColNames: function (value) {
            this.set("colNames", value);
        },

        /**
         * Alle children und Routable-Button (alles Module) im gfiContent müssen hier removed werden.
         */
        destroy: function () {
            _.each(this.get("gfiContent"), function (element) {
                if (_.has(element, "children")) {
                    var children = _.values(_.pick(element, "children"))[0];

                    _.each(children, function (child) {
                        child.val.remove();
                    }, this);
                }
            }, this);
            _.each(this.get("gfiRoutables"), function (element) {
                if (_.isObject(element) === true) {
                    element.remove();
                }
            }, this);
        }
    });

    return TableTheme;
});
