define([
    "backbone"
], function (Backbone) {

    var AlertingModel = Backbone.Model.extend({
        defaults: {
            kategorie: "alert-info",
            dismissable: true
        },
        initialize: function () {
        }
    });

    return new AlertingModel();
});
