define([
    'jquery',
    'backbone',
    'eventbus',
    'modules/ClickCounter/model'
], function ($, Backbone, EventBus, ClickCounter) {

    var ClickCounterView = Backbone.View.extend({
        model: ClickCounter,
        initialize: function () {
            if (this.model.get('srcUrl') !== '') {
                // Warte auf Zufügen von Layern in Layertree
                EventBus.on('registerLayerTreeInClickCounter', this.registerLayerEvent, this);
                EventBus.on('registerToolsClickInClickCounter', this.registerToolsClickEvent, this);
                EventBus.on('registerRoutingClickInClickCounter', this.registerRoutingClickEvent, this);
                EventBus.on('registerZoomButtonsInClickCounter', this.registerZoomButtonsClickEvent, this);
                // Erzeuge iFrame
                $('<iframe " src="' + this.model.get('srcUrl') + '" id="' + this.model.get('countframeid') + '" width="0" height="0" frameborder="0"/>').appendTo('body');
                this.registerMap();
                // fired beim Öffnen der Seite
                this.registerClick();
            }
        },
        registerZoomButtonsClickEvent: function (zoomButtons) {
            // fired beim Zoomen über zoombuttons
            if (zoomButtons.length > 0) {
                zoomButtons.click(function() {
                  this.registerClick();
                }.bind(this));
            }
        },
        registerRoutingClickEvent: function (routingTool) {
            // fired beim Klicken in der Routenberechnung
            if (routingTool.length > 0) {
                routingTool.click(function() {
                  this.registerClick();
                }.bind(this));
            }
        },
        registerLayerEvent: function (layertree) {
            // fired beim LayerChange, Info-Button, Einstellungen auf dem Layertree
            if (layertree.length > 0) {
                layertree.click(function() {
                     this.registerClick();
                }.bind(this));
            }
        },
        registerToolsClickEvent: function (toolsmenu) {
            // fired beim ToolChange
            if (toolsmenu.length > 0) {
                toolsmenu.click(function() {
                  this.registerClick();
                }.bind(this));
            }
        },
        registerMap: function () {
            // fired beim Ausschnitt-Move und Klickabfragen auf Features
            $('#map').click(function() {
              this.registerClick();
            }.bind(this));
        },
        registerClick: function () {
            this.model.refreshIframe();
        }
    });

    return ClickCounterView;
});
