define([
    "jquery",
    "underscore",
    "backbone",
    "text!modules/gfipopup/template.html",
    "modules/gfipopup/model",
    "eventbus"
], function ($, _, Backbone, GFIPopupTemplate, GFIPopup, EventBus) {

    var GFIPopupView = Backbone.View.extend({
        model: GFIPopup,
        template: _.template(GFIPopupTemplate),
        events: {
            "click .gfi-close": "destroy",
            "click .gfi-toggle": "minMaximizePop",
            "click .pager-right": "renderNext",
            "click .pager-left": "renderPrevious",
            "click #RouteZeigenButton": "startShowingRoute",
            "click #setRoutingDestination": "setRoutingDestination"
        },
        /**
         * Wird aufgerufen wenn die View erzeugt wird.
         */
        initialize: function () {
            $("#popovermin").remove();
            this.listenTo(this.model, "change:coordinate", this.render);
            // this.listenTo(this.model, "change:gfiContent", this.routingButton);
            EventBus.on("closeGFIParams", this.destroy, this); // trigger in map.js
            EventBus.on("showGFIParams", this.minMaximizePop, this);
        },
        setRoutingDestination: function () {
            EventBus.trigger("setRoutingDestination", this.model.get("coordinate"));
        },
        startShowingRoute: function (evt) {
            // lösche alte Route
            this.model.clearRoute();
            var gesuchteRoute = evt.currentTarget.value;

            this.model.showRoute(gesuchteRoute);
            this.minMaximizePop();
        },
        /**
         * Toggle des Popovers in minimiert oder maximiert
         */
        minMaximizePop: function () {
            var overlay = this.model.get("gfiOverlay");

            if (overlay.getPosition() === undefined) {
                overlay.setPosition(this.model.get("coordinate"));
                $("#popovermin").fadeOut(500, function () {
                    $("#popovermin").remove();
                });
            }
            else {
                overlay.setPosition(undefined);
                var html;

                html = "<div id='popovermin' class='popover-min'>";
                html += "<span class='glyphicon glyphicon-info-sign gfi-icon'></span>";
                html += "<span class='gfi-title'>Informationen</span>";
                html += "</div>";
                $("#map").append(html);
                $("#popovermin").fadeIn(500);
                $("#popovermin").click(function () {
                    EventBus.trigger("showGFIParams", this);
                });
            }
        },
        /**
         * beim setzen des GFIContent werden evtl. Buttons zum zeigen von Routen gezeigt.
         */
        routingButton: function (values) {
            var gfiContent = values.get("gfiContent");

            for (var i = 0; i < gfiContent.length; i++) {
                var values = _.pairs(gfiContent[i]);
                // Verändern des vorherigen Eintrags der Route
                for (var j = 0; j < values.length; j++) {
                    if (_.isObject(values[j][1]) && values[j][1].getCoordinates().length > 0 && _.isString(values[j - 1][1])) {
                        var config;

                        config = "<button id='RouteZeigenButton' title='Schnellste Route zeigen' value='" + values[j][0] + "' style='min-width: 130px; width:100%' type='button' class='btn btn-info btn-sm'>";
                        config = config + "<span style='float:left;' class='' aria-hidden='true'>" + values[j - 1][1] + "</span>";
                        config = config + "<span style='float:right; top:3px;' class='glyphicon glyphicon-road' aria-hidden='true'></span>";
                        config = config + "</button>";
                        values[j - 1][1] = config;
                    }
                }
                gfiContent[i] = _.object(values);
            }
            this.model.set("gfiContent", gfiContent);
        },
        /**
         *
         */
        render: function () {
            // Erzeuge für Video
            if (_.has(this.model.get("gfiContent")[0], "video")) {
                this.model.set("uniqueId", _.uniqueId("gfi"));
            }
            var attr = this.model.toJSON();
            this.$el.html(this.template(attr));
            $(this.model.get("element")).popover({
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
            // Starte Streaming des Videos über Id
            if (_.has(this.model.get("gfiContent")[0], "video")) {
                this.model.starteStreaming(this.model.get('uniqueId'));
            }
            EventBus.trigger("closeMouseHoverPopup", this);
            EventBus.trigger("GFIPopupVisibility", true);
        },
        /**
         *
         */
        renderNext: function () {
            if ($(".pager-right").hasClass("disabled") === false) {
                this.model.set("gfiCounter", this.model.get("gfiCounter") - 1);
                this.render();
            }
        },
        /**
         *
         */
        renderPrevious: function () {
            if ($(".pager-left").hasClass("disabled") === false) {
                this.model.set("gfiCounter", this.model.get("gfiCounter") + 1);
                this.render();
            }
        },
        /**
         *
         */
        destroy: function () {
            $("#popovermin").remove();
            this.model.destroyPopup();
            EventBus.trigger("GFIPopupVisibility", false);
            this.model.clearRoute();
        }
    });

    return GFIPopupView;
});
