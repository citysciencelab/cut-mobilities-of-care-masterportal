define(function (require) {

    var Theme = require("modules/tools/gfi/themes/model"),
        TableTheme;

    TableTheme = Theme.extend({
        initialize: function () {
            this.listenTo(this, {
                "change:isReady": this.identifyRowNames
            });
        },

        /**
         * Ermittelt alle Namen(=Zeilennamen) der Eigenschaften der Objekte
         */
        identifyRowNames: function () {
            if (_.isUndefined(this.get("gfiContent")) === false) {
                console.log(this.getGfiContent()[0]);
                var rowNames = _.keys(this.getGfiContent()[0]);
                _.each(rowNames, function (rowName) {
                    if (rowName === "Zählstelle" || rowName === "Bezeichnung"){
                        console.log("header gefunden");
                    }
                });
                this.setRowNames(rowNames);
            }
        },

        /**
         * Setter für Attribut "rowNames"
         * @param {string[]} value - die Zeilennamen
         */
        setRowNames: function (value) {
            this.set("rowNames", value);
        },
        getRowNames: function () {
            return this.get("rowNames");
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
