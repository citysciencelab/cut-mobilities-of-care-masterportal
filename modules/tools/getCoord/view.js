define([
    "backbone",
    "backbone.radio",
    "modules/tools/getCoord/model",
    "text!modules/tools/getCoord/template.html"
], function (Backbone, Radio, CoordPopup, CoordPopupTemplate) {

    var CoordPopupView = Backbone.View.extend({
        model: new CoordPopup(),
        id: "coord-popup",
        template: _.template(CoordPopupTemplate),
        events: {
            "click .glyphicon-remove": "destroy"
        },
        initialize: function () {
            this.listenTo(this.model, {
                "change:isCollapsed change:isCurrentWin change:url": this.render
            });
            this.listenTo(this.model, "change:coordinateGeo", this.render);
        },
        render: function () {
            if (this.model.get("isCurrentWin") === true && this.model.get("isCollapsed") === false) {
                var attr = this.model.toJSON();

                this.$el.html("");
                $(".win-heading").after(this.$el.html(this.template(attr)));
                this.delegateEvents();
            }
            else {
                this.undelegateEvents();
            }
        }/*,
        destroy: function () {
            var coordModel = Radio.request("ModelList", "getModelByAttributes", {id: "coord"});

            if (coordModel) {
                coordModel.setIsActive(false);
            }
            this.model.destroyPopup();
            Radio.trigger("ModelList", "setModelAttributesById", "gfi", {isActive: true});
        }*/
    });

    return CoordPopupView;
});
