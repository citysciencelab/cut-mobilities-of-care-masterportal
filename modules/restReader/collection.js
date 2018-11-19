const RestList = Backbone.Collection.extend({
    model: Backbone.Model,
    initialize: function (models, options) {
        var channel = Radio.channel("RestReader");

        channel.reply({
            "getServiceById": this.getServiceById
        }, this);

        this.url = options.url;
        this.fetch({
            cache: false,
            async: false,
            error: function () {
                Radio.trigger("Alert", "alert", {
                    text: "Fehler beim Laden von: " + options.url,
                    kategorie: "alert-warning"
                });
            }
        });
    },

    /**
     * returns the model in the collection that matches the passed id
     * @param {string} id - the service id
     * @returns {Backbone.Model} - service model
     */
    getServiceById: function (id) {
        return this.get(id);
    }
});

export default RestList;
