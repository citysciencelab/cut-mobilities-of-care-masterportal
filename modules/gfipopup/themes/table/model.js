define(function (require) {

    var Backbone = require("backbone"),
        GFITableModel;

    GFITableModel = Backbone.Model.extend({

        initialize: function () {
            this.identifyColNames();
        },

        /**
         * Ermittelt alle Namen(=Spaltennamen) der Eigenschaften der Objekte
         */
        identifyColNames: function () {
            var colNames = _.keys(this.getContent()[0]);

            this.setColNames(colNames);
        },

        /**
         * Setter für Attribut "colNames"
         * @param {string[]} value - die Spaltennamen
         */
        setColNames: function (value) {
            this.set("colNames", value);
        },

        /**
         * Getter für Attribut "content"
         * @return {Object[]}
         */
        getContent: function () {
            return this.get("content");
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

    return GFITableModel;
});
