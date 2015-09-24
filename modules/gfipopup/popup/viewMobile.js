define([
    "backbone",
    "text!modules/gfipopup/popup/templateMobile.html",
    "modules/gfipopup/popup/model",
    "eventbus",
    "bootstrap/modal"
], function (Backbone, Template, GFIPopup, EventBus) {
    "use strict";
    var GFIPopupView = Backbone.View.extend({
        model: GFIPopup,
        className: "modal fade",
        template: _.template(Template),
        events: {
            "click .gfi-mobile-close": "closeModal",
            "click .pager-right": "renderNext",
            "click .pager-left": "renderPrevious"
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
            this.$el.find(".gfi-mobile-content").append(this.model.get("gfiContent")[this.model.get("gfiCounter") - 1].$el);
            this.$el.find(".modal-title").text(this.model.get("gfiTitles")[this.model.get("gfiCounter") - 1]);
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
        closeModal: function () {
            this.removeTemplateModels();
            this.$el.modal("hide");
            this.model.set("isPopupVisible", false);
            this.model.unset("coordinate", {silent: true});
        },
        /**
         *
         */
        removeTemplateModels: function () {
            this.model.removeChildObjects();
        }
    });

    return GFIPopupView;
});
