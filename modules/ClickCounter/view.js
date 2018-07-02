define([
    "backbone",
    "backbone.radio",
    "modules/ClickCounter/model"
], function (Backbone, Radio, ClickCounterModel) {

    var ClickCounterView = Backbone.View.extend({
        initialize: function (desktopURL, mobileURL) {
            this.model = new ClickCounterModel(desktopURL, mobileURL);

            // Radio Events
            var channel = Radio.channel("ClickCounter");

            channel.on({
                "toolChanged": this.registerClick,
                "calcRoute": this.registerClick,
                "zoomChanged": this.registerClick,
                "layerVisibleChanged": this.registerClick,
                "gfi": this.registerClick
            }, this);

            // fired beim Öffnen der Seite
            this.registerClick();
        },
        registerLayerEvent: function (layertree) {
            // fired beim LayerChange, Info-Button, Einstellungen auf dem Layertree
            if (layertree.length > 0) {
                layertree.click(function () {
                    this.registerClick();
                }.bind(this));
            }
        },
        registerClick: function () {
            this.model.refreshIframe();
        }
    });

    return ClickCounterView;
});
