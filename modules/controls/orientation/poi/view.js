import Template from "text-loader!./template.html";
import POIModel from "./model";
import "bootstrap/js/tab";
import "bootstrap/js/modal";

const POIView = Backbone.View.extend({
    events: {
        "click .glyphicon-remove": "hide",
        "click tr": "zoomFeature",
        "click li": "changedCategory"
    },
    initialize: function () {
        var channel = Radio.channel("POI");

        this.model = POIModel;

        channel.on({
            "showPOIModal": this.show,
            "hidePOIModal": this.hide
        }, this);
    },
    id: "surrounding_vectorfeatures",
    className: "modal fade in poi",
    template: _.template(Template),
    render: function () {
        var attr = this.model.toJSON();

        this.$el.html(this.template(attr));
        return this;
    },

    show: function () {
        Radio.trigger("Util", "showLoader");
        this.model.calcInfos();
        this.render();

        this.$el.modal({
            backdrop: true,
            show: true
        });
        Radio.trigger("Util", "hideLoader");
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
        var a = this.$(evt.currentTarget).children("a")[0],
            cat = this.$(a).attr("aria-controls");

        this.model.setActiveCategory(parseFloat(cat));
    }
});

export default POIView;
