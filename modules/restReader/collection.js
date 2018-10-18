const RestList = Backbone.Collection.extend({
    initialize: function () {
        var channel = Radio.channel("RestReader");

        channel.reply({
            "getAllServices": this.getAllServices,
            "getServiceById": this.getServiceById
        }, this);

        this.url = Config.restConf;
        this.fetch({
            cache: false,
            async: false,
            success: function () {
                channel.trigger("isReady", true);
            },
            error: function () {
                Radio.trigger("Alert", "alert", {
                    text: "Fehler beim Laden von: " + Config.restConf,
                    kategorie: "alert-warning"
                });
            }
        });
    },
    getAllServices: function () {
        return this;
    },
    getServiceById: function (id) {
        return this.findWhere({id: id});
    }
});

export default RestList;
