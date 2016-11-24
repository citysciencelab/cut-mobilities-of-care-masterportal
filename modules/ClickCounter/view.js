define([
    "backbone",
    "backbone.radio",
    "eventbus",
    "modules/clickCounter/model"
], function (Backbone, Radio, EventBus, ClickCounterModel) {

    var ClickCounterView = Backbone.View.extend({
        initialize: function (desktopURL, mobileURL) {
            this.model = new ClickCounterModel(desktopURL, mobileURL);

            // Radio Events
            var channel = Radio.channel("ClickCounter");

            channel.on({
                "toolChanged": this.registerClick,
                "calcRoute": this.registerClick
            }, this);

            // Warte auf Zufügen von Layern in Layertree
            EventBus.on("registerLayerTreeInClickCounter", this.registerLayerEvent, this);
            EventBus.on("registerZoomButtonsInClickCounter", this.registerZoomButtonsClickEvent, this);

            this.registerMap();
            // fired beim Öffnen der Seite
            this.registerClick();
        },
        registerZoomButtonsClickEvent: function (zoomButtons) {
            // fired beim Zoomen über zoombuttons
            if (zoomButtons.length > 0) {
                zoomButtons.click(function () {
                  this.registerClick();
                }.bind(this));
            }
        },
        registerLayerEvent: function (layertree) {
            // fired beim LayerChange, Info-Button, Einstellungen auf dem Layertree
            if (layertree.length > 0) {
                layertree.click(function () {
                     this.registerClick();
                }.bind(this));
            }
        },
        registerMap: function () {
            // fired beim Ausschnitt-Move und Klickabfragen auf Features
            $("#map").click(function () {
              this.registerClick();
            }.bind(this));
        },
        registerClick: function () {
            console.log(1);
            this.model.refreshIframe();
        }
    });

    return ClickCounterView;
});
