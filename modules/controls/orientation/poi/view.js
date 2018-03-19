define([
    "backbone",
    "backbone.radio",
    "text!modules/controls/orientation/poi/template.html",
    "modules/controls/orientation/poi/model",
    "bootstrap/tab",
    "bootstrap/modal"
], function (Backbone, Radio, Template, POIModel) {

    var PointOfInterestListView = Backbone.View.extend({
        model: POIModel,
        id: "base-modal",
        className: "modal fade in",
        template: _.template(Template),
        events: {
            "click .close,button,table": "removeAllModels",
            "click #tablePOI": "destroy"
        },
        initialize: function (poiDistances) {
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
        },
        destroy: function () {
            Radio.trigger("geolocation", "removeOverlay");
        }
    });

    return PointOfInterestListView;
});
