define([
    "backbone",
    "backbone.radio",
    "text!modules/controls/orientation/poi/template.html",
    "modules/controls/orientation/poi/collection",
    "modules/controls/orientation/poi/feature/view",
    "bootstrap/tab",
    "bootstrap/modal"
], function (Backbone, Radio, PointOfInterestListTemplate, PointOfInterestList, PointOfInterestView) {

    var PointOfInterestListView = Backbone.View.extend({
        collection: PointOfInterestList,
        id: "base-modal",
        className: "modal fade in",
        template: _.template(PointOfInterestListTemplate),
        events: {
            "click .close, button,table,#500m,#1000m,#2000m": "removeAllModels",
            "click #500m": "onClick500m",
            "click #1000m": "onClick1000m",
            "click #2000m": "onClick2000m",
            "click #tablePOI": "destroy"
        },
        initialize: function () {
            var channel = Radio.channel("poi");

            channel.on({
                "showPOIModal": this.show,
                "hidePOIModal": this.hide
            }, this);

            this.listenTo(this.collection, "sort", this.addPOIS);
            this.render();
        },
        render: function () {
            this.$el.html(this.template());
        },
        addPOIS: function (collection) {
            this.$("table").html("");
            _.each(collection.models, function (model) {
                var poiView = new PointOfInterestView({model: model});

                this.$("table").append(poiView.render().el);
            }, this);
        },
        removeAllModels: function () {
            this.collection.removeAllModels();
            this.render();
        },
        show: function () {
            this.$el.modal({
                backdrop: true,
                show: true
            });
            $(function () {
                $("#loader").hide();
            });
        },
        hide: function () {
            this.$el.modal("hide");
        },
        onClick500m: function () {
            Radio.trigger("geolocation", "getPOI", 500);
            $("#500m a[href='#500Meter']").tab("show");
        },
        onClick1000m: function () {
            Radio.trigger("geolocation", "getPOI", 1000);
            $("#1000m a[href='#1000Meter']").tab("show");
        },
        onClick2000m: function () {
            Radio.trigger("geolocation", "getPOI", 2000);
            $("#2000m a[href='#2000Meter']").tab("show");
        },
        destroy: function () {
            Radio.trigger("geolocation", "removeOverlay");
        }
    });

    return PointOfInterestListView;
});
