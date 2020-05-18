const RestList = Backbone.Collection.extend({
    model: Backbone.Model,
    initialize: function (models, options) {
        const channel = Radio.channel("RestReader");

        channel.reply({
            "getServiceById": this.getServiceById
        }, this);

        if (options.url !== undefined) {
            this.url = options.url;
            this.fetch({
                cache: false,
                async: false,
                error: function (model, xhr, error) {
                    const statusText = xhr.statusText;
                    let message,
                        position,
                        snippet;

                    // SyntaxError for consoletesting, propably because of older version.
                    if (statusText === "Not Found" || statusText.indexOf("SyntaxError") !== -1) {
                        Radio.trigger("Alert", "alert", {
                            text: "<strong>Die Datei '" + model.url + "' ist nicht vorhanden!</strong>",
                            kategorie: "alert-warning"
                        });
                    }
                    else {
                        message = error.errorThrown.message;
                        position = parseInt(message.substring(message.lastIndexOf(" ")), 10);
                        snippet = xhr.responseText.substring(position - 30, position + 30);
                        Radio.trigger("Alert", "alert", {
                            text: "<strong>Die Datei '" + model.url + "' konnte leider nicht geladen werden!</strong> <br> " +
                            "<small>Details: " + error.textStatus + " - " + error.errorThrown.message + ".</small><br>" +
                            "<small>Auszug:" + snippet + "</small>",
                            kategorie: "alert-warning"
                        });
                    }
                }
            });
        }
        else {
            Radio.trigger("Alert", "alert", {
                text: "Der Parameter 'restConf' wurde in der config.js nicht gefunden oder ist falsch geschrieben",
                kategorie: "alert-warning"
            });
        }
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
