import ClickCounterModel from "./model";
const ClickCounterView = Backbone.View.extend(
    /** @lends ClickCounterView.prototype */
    {
        /**
        * @memberof ClickCounter
        * @event RadioChannel("ClickCounter")#"toolChanged"
        */
        /**
        * @class ClickCounterView
        * @extends Backbone.View
        * @memberOf ClickCounter
        * @constructs
        * @param {String} desktopURL [description]
        * @param {String} mobileURL  [description]
        * @listens RadioChannel("ClickCounter","toolChanged")
        * @listens ClickCounter#calcRoute
        * @listens ClickCounter#zoomChanged
        * @listens ClickCounter#layerVisibleChanged
        * @listens ClickCounter#gfi
        */
        initialize: function (desktopURL, mobileURL) {
            var channel = Radio.channel("ClickCounter");

            this.model = new ClickCounterModel(desktopURL, mobileURL);

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

        /**
         * Refreshes iframe url
         * @return {void}
         */
        registerClick: function () {
            this.model.refreshIframe();
        }
    });

export default ClickCounterView;
