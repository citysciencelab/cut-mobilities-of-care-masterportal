define([
    "backbone",
    "text!modules/gfipopup/template.html",
    "modules/gfipopup/model",
    "eventbus"
], function (Backbone, GFIPopupTemplate, GFIPopup, EventBus) {
    "use strict";
    var GFIPopupView = Backbone.View.extend({
        model: GFIPopup,
        template: _.template(GFIPopupTemplate),
        events: {
            "click .gfi-close": "destroy",
            "click .gfi-toggle": "minMaximizePop",
            "click .pager-right": "renderNext",
            "click .pager-left": "renderPrevious",
            "click #setRoutingDestination": "setRoutingDestination"
        },
        /**
         * Wird aufgerufen wenn die View erzeugt wird.
         */
        initialize: function () {
            $("#popovermin").remove();
            this.listenTo(this.model, "change:coordinate", this.render);
            EventBus.on("closeGFIParams", this.destroy, this); // trigger in map.js
            EventBus.on("showGFIParams", this.minMaximizePop, this);
        },
        setRoutingDestination: function () {
            EventBus.trigger("setRoutingDestination", this.model.get("coordinate"));
        },
        /**
         * Toggle des Popovers in minimiert oder maximiert
         */
        minMaximizePop: function () {
            var overlay = this.model.get("gfiOverlay"),
                html;

            if (overlay.getPosition() === undefined) {
                overlay.setPosition(this.model.get("coordinate"));
                $("#popovermin").fadeOut(500, function () {
                    $("#popovermin").remove();
                });
            } else {
                overlay.setPosition(undefined);
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
         *
         */
        render: function () {
            var attr = this.model.toJSON();
            this.$el.html(this.template(attr));
            $(this.model.get("element")).popover({
                placement: function () {
                    if (this.getPosition().top > window.innerHeight / 2) {
                        return "top";
                    } else {
                        return "bottom";
                    }
                },
                html: true,
                content: this.$el
            });
            this.model.showPopup();
            EventBus.trigger("closeMouseHoverPopup", this);
            EventBus.trigger("GFIPopupVisibility", true);
            this.appendChildren();
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
            this.removeChildren();
            $("#popovermin").remove();
            this.model.destroyPopup();
            EventBus.trigger("GFIPopupVisibility", false);
        },
        /**
         * Alle Children des gfiContent werden dem gfi-content appended. Eine Übernahme in dessen table ist nicht HTML-konform (<div> kann nicht in <table>).
         * Nur $.append, $.replaceWith usw. sorgen für einen korrekten Zusammenbau eines <div>. Mit element.val.el.innerHTML wird HTML nur kopiert, sodass Events
         * nicht im view ankommen.
         */
        appendChildren: function () {
            var gfiContent = this.model.get('gfiContent')[this.model.get('gfiContent').length - this.model.get('gfiCounter')],
                children;
            if (_.has(gfiContent, 'children')) {
                children = _.values(_.pick(gfiContent, 'children'))[0];
                _.each(children, function (element) {
                    $('.gfi-content').append(element.val.$el);
                }, this);
            }
        },
        /**
         * Alle children im gfiContent müssen hier removed werden.
         * Das gfipopup.model wird nicht removed - nur reset.
         */
        removeChildren: function () {
            _.each(this.model.get('gfiContent'), function (element) {
                if (_.has(element, 'children')) {
                    var children = _.values(_.pick(element, 'children'))[0];
                    _.each(children, function (child) {
                        child.val.remove();
                    }, this);
                }
            }, this);
        }
    });

    return GFIPopupView;
});
