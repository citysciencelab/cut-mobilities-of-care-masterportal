define([
    "jquery",
    "backbone",
    "eventbus",
    "modules/alerting/model",
    "bootstrap/alert"
], function ($, Backbone, EventBus, Model) {
    /*
     * Dieses Modul reagiert auf Events vom EventBus, nimmt als Parameter des Events ein hmtl-String oder ein Konfigurationsobjekt entgegen und stellt dies dar.
     * Das Konfigurationsobjekt kann folgende Einstellungen überschrieben:
     * text: das html
     * kategorie: {alert-success|alert-info|alert-warning|alert-danger}
     * dismissable: {true|false}
     */
    var AlertingView = Backbone.View.extend({
        model: Model,
        initialize: function () {
            EventBus.on("alert", this.checkVal, this);
            EventBus.on("alert:remove", this.remove, this);
        },
        /**
        * @memberof config
        * @type {String|Object}
        * @desc entweder ein String und die Defaultwerte werden verwendet oder ein Konfigurationsobjekt
        */
        checkVal: function (val) {
            if (_.isString(val)) {
                var html = val,
                    kategorie = this.model.get("kategorie"),
                    dismissable = this.model.get("dismissable");
            }
            else if (_.isObject(val)) {
                var html = val.text,
                    kategorie = val.kategorie,
                    dismissable = val.dismissable;
            }
            this.render(html, kategorie, dismissable);
        },
        render: function (message, kategorie, dismissable) {
            var dismissablestring = (dismissable === true) ? " alert-dismissable" : "",
                html = "<div id='alertmessage' class='alert " + kategorie + dismissablestring + "' role='alert'>";

            if (dismissable === true) {
                html += "<button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times</span></button>";
            }
            html += message;
            html += "</div>";
            $("body").prepend(html);
        },
        remove: function () {
            $("#alertmessage").remove();
        }
    });

    return new AlertingView;
});
