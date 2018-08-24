define(function (require) {
    var LayersliderTemplate = require("text!modules/tools/layerslider/template.html"),
        $ = require("jquery"),
        LayersliderModel = require("modules/tools/layerslider/model"),
        LayersliderView;

    LayersliderView = Backbone.View.extend({
        events: {
            "click #play": "playSlider",
            "click #stop": "stopSlider",
            "click #backward": "backwardSlider",
            "click #forward": "forwardSlider"
        },
        initialize: function (attr) {
            var layerIds = _.has(attr, "layerIds") && _.isArray(attr.layerIds) ? attr.layerIds : null,
                title = _.has(attr, "title") ? attr.title : null,
                timeInterval = _.has(attr, "timeInterval") ? attr.timeInterval : null;

            //Pflichtattribut abfragen
            if (!layerIds) {
                console.error("Konfiguration des layersliders unvollständig");
                return;
            }
            this.model = new LayersliderModel(layerIds, title, timeInterval);

            this.listenTo(this.model, {
                "change:isCollapsed change:isCurrentWin": this.render,
                "change:activeLayerId": this.layerSwitched
            });
        },
        className: "win-body",
        template: _.template(LayersliderTemplate),

        playSlider: function () {

        },

        stopSlider: function () {

        },

        backwardSlider: function () {

        },

        forwardSlider: function () {

        },
        
        render: function () {
            var attr;

            if (this.model.get("isCurrentWin") === true && this.model.get("isCollapsed") === false) {
                attr = this.model.toJSON();
                this.$el.html("");
                $(".win-heading").after(this.$el.html(this.template(attr)));
                this.delegateEvents();
            }
            else {
                this.undelegateEvents();
            }
            return this;
        },

        layerSwitched: function () {
            var index = this.model.getActiveIndex();

            console.log(index);
        }
    });

    return LayersliderView;
});
