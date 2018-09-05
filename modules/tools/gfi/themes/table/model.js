import Theme from "../model";

const TableTheme = Theme.extend({

    initialize: function () {
        this.listenTo(this, {
            "change:isReady": this.identifyColNames
        });
    },

    /**
     * Ermittelt alle Namen(=Spaltennamen) der Eigenschaften der Objekte
     * @returns {void}
     */
    identifyColNames: function () {
        var colNames;

        if (_.isUndefined(this.get("gfiContent")) === false) {
            colNames = _.keys(this.get("gfiContent")[0]);

            this.setColNames(colNames);
        }
    },

    /**
     * Setter für Attribut "colNames"
     * @param {string[]} value - die Spaltennamen
     * @returns {void}
     */
    setColNames: function (value) {
        this.set("colNames", value);
    },

    /**
     * Alle children und Routable-Button (alles Module) im gfiContent müssen hier removed werden.
     * @returns {void}
     */
    destroy: function () {
        _.each(this.get("gfiContent"), function (element) {
            var children;

            if (_.has(element, "children")) {
                children = _.values(_.pick(element, "children"))[0];

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

export default TableTheme;
