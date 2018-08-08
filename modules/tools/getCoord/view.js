define(function (require) {

    var GetCoordTemplate = require("text!modules/tools/getCoord/template.html"),
        $ = require("jquery"),
        GetCoordModel = require("modules/tools/getCoord/model"),
        GetCoord;

    GetCoord = Backbone.View.extend({
        events: {
            "click .glyphicon-remove": "destroy",
            "change #coordSystemField": "changedPosition",
            "click #coordinatesEastingField": "copyToClipboard",
            "click #coordinatesNorthingField": "copyToClipboard"
        },
        initialize: function () {
            this.listenTo(this.model, {
                "change:isCollapsed change:isCurrentWin change:url": this.render,
                "change:positionMapProjection": this.changedPosition
            });
        },
        model: new GetCoordModel(),
        className: "win-body",
        template: _.template(GetCoordTemplate),

        render: function () {
            if (this.model.get("isCurrentWin") === true && this.model.get("isCollapsed") === false) {
                this.$el.html("");
                $(".win-heading").after(this.$el.html(this.template(this.model.toJSON())));
                this.model.createInteraction();
                this.changedPosition();
                this.delegateEvents();
            }
            else {
                this.model.setUpdatePosition(true);
                this.model.removeInteraction();
                this.undelegateEvents();
            }
            return this;
        },

        changedPosition: function () {
            var targetProjectionName = this.$("#coordSystemField option:selected").val(),
                position = this.model.returnTransformedPosition(targetProjectionName),
                targetProjection = this.model.returnProjectionByName(targetProjectionName);

            this.model.setCurrentProjectionName(targetProjectionName);
            if (position) {
                this.adjustPosition(position, targetProjection);
                this.adjustWindow(targetProjection);
            }
        },

        adjustPosition: function (position, targetProjection) {
            var coord, easting, northing;

            // geographische Koordinaten
            if (targetProjection.projName === "longlat") {
                coord = this.model.getHDMS(position);
                easting = coord.substr(0, 13);
                northing = coord.substr(14);
            }
            // kartesische Koordinaten
            else {
                coord = this.model.getCartesian(position);
                easting = coord.split(",")[0].trim();
                northing = coord.split(",")[1].trim();
            }

            this.$("#coordinatesEastingField").val(easting);
            this.$("#coordinatesNorthingField").val(northing);
        },

        adjustWindow: function (targetProjection) {
            // geographische Koordinaten
            if (targetProjection.projName === "longlat") {
                this.$("#coordinatesEastingLabel").text("Breite");
                this.$("#coordinatesNorthingLabel").text("Länge");
            }
            // kartesische Koordinaten
            else {
                this.$("#coordinatesEastingLabel").text("Rechtswert");
                this.$("#coordinatesNorthingLabel").text("Hochwert");
            }
        },

        copyToClipboard: function (evt) {
            Radio.trigger("Util", "copyToClipboard", evt.currentTarget);
        }
    });

    return GetCoord;
});
