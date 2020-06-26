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
        let colNames;

        if (this.get("gfiContent") !== undefined) {
            colNames = Object.keys(this.get("gfiContent")[0]);

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
        this.get("gfiContent").forEach(element => {
            let children;

            if (element.hasOwnProperty("children")) {
                children = element.children;

                children.forEach(child => {
                    child.val.remove();
                });
            }
        });
        this.get("gfiRoutables").forEach(element => {
            if (typeof element === "object") {
                element.remove();
            }
        });
    }
});

export default TableTheme;
