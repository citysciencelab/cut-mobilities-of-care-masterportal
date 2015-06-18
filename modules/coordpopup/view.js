define([
    "backbone",
    "modules/coordpopup/model",
    "text!modules/coordpopup/template.html"
], function (Backbone, CoordPopup, CoordPopupTemplate) {

    var CoordPopupView = Backbone.View.extend({
        model: CoordPopup,
        template: _.template(CoordPopupTemplate),
        events: {
            "click .coord-close": "destroy"
        },
        initialize: function () {
            this.listenTo(this.model, "change:coordinateGeo", this.render);
        },
        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
            $(this.model.get("element")).popover({
                placement: function () {
                    if (this.getPosition().y > window.innerWidth / 2) {
                        return "top";
                    }
                    else {
                        return "bottom";
                    }
                },
                html: true,
                content: this.$el,
                viewport: "canvas"
            });
            this.model.showPopup();
        },
        destroy: function () {
            this.model.destroyPopup();
        }
    });

    return CoordPopupView;
});
