define(function (require) {
    var $ = require("jquery"),
        DownloadWin = require("text!modules/tools/download/template.html"),
        DownloadModel = require("modules/tools/download/model"),
        ol = require("openlayers"),
        DownloadView;

    DownloadView = Backbone.View.extend({
        events: {
            "click button.back": "back",
            "change .file-endings": "prepareData"
        },
        initialize: function () {
            var channel = Radio.channel("download");

            this.listenTo(this.model, {
                "change:isCollapsed change:isCurrentWin": this.render
            }); // Fenstermanagement

            channel.on({
                "start": this.start
            }, this);
        },
        model: new DownloadModel(),
        className: "win-body",
        template: _.template(DownloadWin),
        /**
         * Startet das Download modul
         * @param  {ol.feature} features die Features die heruntergeladen werden sollen
         * @returns {void}
         */
        start: function (features) {
            if (features.data.length === 0) {
                Radio.trigger("Alert", "alert", "Bitte erstellen Sie zuerst eine Zeichnung oder einen Text!");
                return;
            }
            _.each(features.data, function (feature) {
                if (feature.getGeometry() instanceof ol.geom.Circle) {
                // creates a regular polygon from a circle with 32(default) sides
                    feature.setGeometry(ol.geom.Polygon.fromCircle(feature.getGeometry()));
                }
            });

            this.model.setData(features.data);
            this.model.setFormats(features.formats);
            this.model.setCaller(features.caller);
            this.model.set("id", "download");
            this.model.set("name", "Download");
            this.model.set("glyphicon", "glyphicon-plus");
            Radio.trigger("Window", "toggleWin", this.model);
        },
        /**
         * Ruft das Tool auf, das den Download gestartet hat
         * @returns {void}
         */
        back: function () {
            Radio.trigger("Window", "toggleWin", Radio.request("ModelList", "getModelByAttributes", {id: "draw"}));
        },
        /**
         *
         * @return {[type]} [description]
         */
        prepareDownloadButton: function () {
            this.model.setSelectedFormat();
            if (this.model.prepareData() !== "invalid Format") {

                if (this.model.isInternetExplorer()) {
                    this.model.prepareDownloadButtonIE();
                }
                else {
                    this.model.prepareDownloadButtonNonIE();
                }
            }
        },
        /**
         * startet den Download, wenn auf den Button geklickt wird
         * @returns {void}
         */
        triggerDownload: function () {
            this.model.download();
        },
        render: function () {
            var attr = this.model.toJSON();

            if (this.model.get("isCurrentWin") === true && this.model.get("isCollapsed") === false) {

                this.$el.html("");
                $(".win-heading").after(this.$el.html(this.template(attr)));
                this.appendOptions();
                this.delegateEvents();
            }
            else {
                this.undelegateEvents();
            }
            return this;
        },
        /**
         * Hängt die wählbaren Dateiformate als Option an das Formate-Dropdown
         * @returns {void}
         */
        appendOptions: function () {
            var options = this.model.getFormats();

            _.each(options, function (option) {
                this.$(".file-endings").append($("<option>", {
                    value: option,
                    text: option
                }));
            });
            if (options.length === 1) {
                this.$(".file-endings").val(options[0]);
                this.prepareDownloadButton();
            }
        }
    });

    return DownloadView;

});
