define([
    "backbone",
    "eventbus",
    "config",
    "modules/alerting/view"
], function (Backbone, EventBus, Config) {
    "use strict";
    var NetcheckerModel = Backbone.Model.extend({
        defaults: {
            filepath: ""
        },
        initialize: function (filepath) {
            this.listenTo(this, "change:filepath", this.redirect);

            this.set("filepath", filepath);
        },
        /*
        * liest aus externer PHP ein JSON ein und leitet auf diese Seite weiter, um hier den switch zwischen Intra- und Internet hinzubekommen.
        */
        redirect: function () {
            $.ajax({
                url: Config.netcheckerURL,
                data: {url: this.get("filepath")},
                async: true,
                type: "POST",
                cache: false,
                dataType: "json",
                context: this,
                error: function (response) {
                    EventBus.trigger("alert", {
                        text: "Informationen zurzeit nicht verfügbar: " + response.responseText,
                        kategorie: "alert-warning"
                    });
                },
                success: function (data) {
                    window.location.href = data.url;
                }
            });
        }
    });

    return NetcheckerModel;
});
