define([
    "jquery",
    "underscore",
    "backbone",
    "text!modules/tools/download/template.html",
    "modules/tools/download/model",
    "backbone.radio",
    "eventbus"
], function ($, _, Backbone, DownloadWin, DownloadModel, Radio, EventBus) {
    var DownloadView = Backbone.View.extend({
        model: DownloadModel,
        template: _.template(DownloadWin),
        events: {
        "click button.download": "triggerDownload",
        "click button.back": "back"
        },
        initialize: function () {
            this.model.on("change:isCollapsed change:isCurrentWin", this.render, this); // Fenstermanagement
            var channel = Radio.channel("download");

            channel.on({
                "start": this.start
            }, this);
        },
        /**
         * Startet das Download modul
         * @param  {ol.feature} features die Features die heruntergeladen werden sollen
         */
        start: function (features) {
            if (features.data.length === 0) {
                EventBus.trigger("alert", "Bitte erstellen sie zuerst eine Zeichnung oder eínen Text!");
                return;
            }
            this.model.setData(features.data);
            this.model.setFormats(features.formats);
            this.model.setCaller(features.caller);
            EventBus.trigger("toggleWin", ["download", "Download", "glyphicon-plus"]);
        },
        /**
         * Ruft das Tool auf, das den Download gestartet hat
         */
        back: function () {
            EventBus.trigger("toggleWin", [this.model.getCaller().name, this.model.getCaller().name, "glyphicon-pencil"]);
        },
        /**
         * startet den Download, wenn auf den Button geklickt wird
         */
        triggerDownload: function () {
              this.model.download();
        },
        render: function () {
            if (this.model.get("isCurrentWin") === true && this.model.get("isCollapsed") === false) {
                var attr = this.model.toJSON();

                this.$el.html("");
                $(".win-heading").after(this.$el.html(this.template(attr)));
                this.appendOptions();
                this.delegateEvents();
            }
            else {
                this.undelegateEvents();
            }
        },
        /**
         * Hängt die wählbaren Dateiformate als Option an das Formate-Dropdown
         */
        appendOptions: function () {
            var options = this.model.getFormats();

            _.each(options, function (option) {
                $(".file-endings").append($("<option>", {
                    value: option,
                    text: option
                }));
            });
            if (options.length === 1) {
                $(".file-endings").val(options[0]);
            }
        }
    });

    return DownloadView;

});
