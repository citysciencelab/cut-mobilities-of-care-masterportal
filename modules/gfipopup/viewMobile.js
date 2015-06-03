define([
    "backbone",
    "text!modules/gfipopup/templateMobile.html",
    "modules/gfipopup/model",
    "eventbus",
    "bootstrap/modal"
], function (Backbone, Template, GFIPopup, EventBus) {

    var GFIPopupView = Backbone.View.extend({
        model: GFIPopup,
        className: "modal fade",
        template: _.template(Template),
        events: {
            "click .gfi-mobile-close": "closeModal",
            "click .pager-right": "renderNext",
            "click .pager-left": "renderPrevious",
            "click #RouteZeigenButton": "startShowingRoute",
            "click #setRoutingDestination": "setRoutingDestination"
        },

        /**
         *
         */
        initialize: function () {
            this.listenTo(this.model, "change:coordinate change:gfiCounter", this.render);
        },

        /**
         *
         */
        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
            this.$el.modal({
                show: true,
                backdrop: "static"
            });
        },

        /**
         * "Blättert" eine Seite weiter, falls mehrere GFI's vorhanden sind.
         */
        renderNext: function () {
            if ($(".pager-right").hasClass("disabled") === false) {
                this.model.set("gfiCounter", this.model.get("gfiCounter") - 1);
            }
        },

        /**
         * "Blättert eine Seite zurück".
         */
        renderPrevious: function () {
            if ($(".pager-left").hasClass("disabled") === false) {
                this.model.set("gfiCounter", this.model.get("gfiCounter") + 1);
            }
        },

        /**
         *
         */
        setRoutingDestination: function () {
            EventBus.trigger("setRoutingDestination", this.model.get("coordinate"));
            this.closeModal();
        },

        /**
         *
         */
        startShowingRoute: function (evt) {
            this.model.clearRoute();
            this.model.showRoute(evt.currentTarget.value);
            this.closeModal();
        },

        /**
         *
         */
        closeModal: function () {
            this.$el.modal("hide");
            this.model.set("isPopupVisible", false);
            this.model.unset("coordinate", {silent: true});
        }
    });

    return GFIPopupView;
});
