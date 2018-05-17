define([
    "backbone",
    "backbone.radio",
    "modules/coordpopup/model",
    "text!modules/coordpopup/template.html"
], function (Backbone, Radio, CoordPopup, CoordPopupTemplate) {

    var CoordPopupView = Backbone.View.extend({
        model: new CoordPopup(),
        id: "coord-popup",
        template: _.template(CoordPopupTemplate),
        events: {
            "click .glyphicon-remove": "destroy"
        },
        initialize: function () {
            this.listenTo(this.model, "change:coordinateGeo", this.render);
        },
        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
            this.model.getElement().popover({
                placement: function () {
                    if (this.getPosition().top > window.innerHeight / 2) {
                        return "top";
                    }
                    else {
                        return "bottom";
                    }
                },
                html: true,
                content: this.$el
            });
            this.model.showPopup();
        },
        destroy: function () {
            var coordModel = Radio.request("ModelList", "getModelByAttributes", {id: "coord"});

            if (coordModel) {
                coordModel.setIsActive(false);
            }
            this.model.destroyPopup();
            Radio.trigger("ModelList", "setModelAttributesById", "gfi", {isActive: true});
        }
    });

    return CoordPopupView;
});
