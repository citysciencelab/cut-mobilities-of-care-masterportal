define(function (require) {

    var GetCoordTemplate = require("text!modules/tools/getCoord/template.html"),
        GetCoordModel = require("modules/tools/getCoord/model"),
        GetCoord;

    GetCoord = Backbone.View.extend({
        model: new GetCoordModel(),
        className: "win-body",
        template: _.template(GetCoordTemplate),
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

        render: function () {
            if (this.model.get("isCurrentWin") === true && this.model.get("isCollapsed") === false) {
                var attr = this.model.toJSON();

                this.$el.html("");
                $(".win-heading").after(this.$el.html(this.template(attr)));
                this.model.createInteraction();
                this.delegateEvents();
            }
            else {
                this.model.setUpdatePosition(true);
                this.model.removeInteraction();
                this.undelegateEvents();
            }
        },

        changedPosition: function () {
            var targetProjectionName = $("#coordSystemField option:selected").val(),
                position = this.model.returnTransformedPosition(targetProjectionName),
                targetProjection = this.model.returnProjectionByName(targetProjectionName);

            if (position) {
                this.adjustPosition(position, targetProjection)
                this.adjustWindow(targetProjection);
            }
        },

        adjustPosition: function (position, targetProjection) {
            var coord, easting, northing;

            // geographische Koordinaten
            if (targetProjection.projName === "longlat") {
                coord = this.model.getCartesian(position);
                easting = coord.substr(0,13);
                northing = coord.substr(14);
            }
            // kartesische Koordinaten
            else {
                coord = this.model.getXY(position);
                easting = coord.split(",")[0].trim();
                northing = coord.split(",")[1].trim();
            }

            $("#coordinatesEastingField").val(easting);
            $("#coordinatesNorthingField").val(northing);
        },

        adjustWindow: function (targetProjection) {
            // geographische Koordinaten
            if (targetProjection.projName === "longlat") {
                $("#coordinatesEastingLabel").text("Breite");
                $("#coordinatesNorthingLabel").text("Länge");
            }
            // kartesische Koordinaten
            else {
                $("#coordinatesEastingLabel").text("Rechtswert");
                $("#coordinatesNorthingLabel").text("Hochwert");
            }
        },

        /**
         * Kopiert den Inhalt des Event-Buttons in die Zwischenablage, sofern der Browser das Kommando akzeptiert.
         * @param  {evt} evt Evt-Button
         */
        copyToClipboard: function (evt) {
            var textField = evt.currentTarget;

            $(textField).select();

            try {
                document.execCommand("copy");
            }
            catch (e) {
                console.warn("Unable to copy text to clipboard.");
            }
        }
    });

    return GetCoord;
});
