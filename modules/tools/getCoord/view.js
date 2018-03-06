define(function (require) {

    var GetCoordTemplate = require("text!modules/tools/getCoord/template.html"),
        GetCoordModel = require("modules/tools/getCoord/model"),
        GetCoord;

    SearchByCoordView = Backbone.View.extend({
        model: new GetCoordModel(),
        className: "win-body",
        template: _.template(GetCoordTemplate),
        events: {
            "click .glyphicon-remove": "destroy"
        },
        initialize: function () {
            this.listenTo(this.model, {
                "change:isCollapsed change:isCurrentWin change:url": this.render,
                "change:positionMapProjection": this.changedPosition
            });
            this.listenTo(this.model, "change:coordinateGeo", this.render);
        },

        render: function () {
            if (this.model.get("isCurrentWin") === true && this.model.get("isCollapsed") === false) {
                var attr = this.model.toJSON();

                this.$el.html("");
                $(".win-heading").after(this.$el.html(this.template(attr)));
                this.model.createInteraction();
                this.delegateEvents();
            }
            else {
                this.model.removeInteraction();
                this.undelegateEvents();
            }
        },

        changedPosition: function () {
            var targetProjection = $("#coordSystemField option:selected").text(),
                position = this.model.transformPosition(targetProjection),
                easting = (Math.round(position[0] * 100) / 100).toFixed(2);
                northing = (Math.round(position[1] * 100) / 100).toFixed(2);

            if (position) {
                $("#coordinatesEastingField").val(easting);
                $("#coordinatesNorthingField").val(northing);
            }
        }
    });

    return SearchByCoordView;
});
