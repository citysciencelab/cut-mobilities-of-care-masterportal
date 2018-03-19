define(function (require) {
    require("bootstrap/tab");
    require("bootstrap/modal");
    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        Template = require("text!modules/controls/orientation/poi/template.html"),
        POIModel = require("modules/controls/orientation/poi/model"),
        POIView;

    POIView = Backbone.View.extend({
        model: POIModel,
        id: "base-modal",
        className: "modal fade in poi",
        template: _.template(Template),
        events: {
            "click .glyphicon-remove": "hide",
            "click tr": "zoomFeature",
            "click li": "changedCategory"
        },
        initialize: function () {
            var channel = Radio.channel("POI");

            channel.on({
                "showPOIModal": this.show,
                "hidePOIModal": this.hide
            }, this);
        },

        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
        },

        show: function () {
            Radio.trigger("Util", "showLoader");
            this.model.calcInfos();
            this.render();

            this.$el.modal({
                backdrop: true,
                show: true
            });
            $(function () {
                Radio.trigger("Util", "hideLoader");
            });
        },

        hide: function () {
            this.$el.modal("hide");
            this.model.reset();
            Radio.trigger("geolocation", "removeOverlay");
        },

        zoomFeature: function (evt) {
            this.model.zoomFeature(evt.currentTarget.id);
            this.hide();
        },

        changedCategory: function (evt) {
            var a = $(evt.currentTarget).children("a")[0],
                cat = $(a).attr("aria-controls");

            this.model.setActiveCategory(parseFloat(cat));
        }
    });

    return POIView;
});
