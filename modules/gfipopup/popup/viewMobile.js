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
            this.listenTo(this.model, "change:coordinate", this.render);

            EventBus.on("closeGFIParams", this.closeModal, this); // trigger in map.js
        },

        /**
         *
         */
        render: function () {
            var attr = this.model.toJSON(),
                content = this.model.get("gfiContent")[this.model.get("gfiCounter") - 1].$el,
                title = this.model.get("gfiTitles")[this.model.get("gfiCounter") - 1];

            this.$el.html(this.template(attr));
            this.$el.find(".gfi-mobile-content").append(content);
            this.$el.find(".modal-title").text(title);
            this.$el.modal({
                show: true,
                backdrop: "static"
            });
            EventBus.trigger("GFIPopupVisibility", true);
        },

        /**
         * "BlÃ¤ttert" eine Seite weiter, falls mehrere GFI's vorhanden sind.
         */
        renderNext: function () {
            if ($(".pager-right").hasClass("disabled") === false) {
                this.model.set("gfiCounter", this.model.get("gfiCounter") - 1);
                this.render();
            }
        },

        /**
         * "BlÃ¤ttert eine Seite zurÃ¼ck".
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
        closeModal: function () {
            $("#popovermin").remove();
            this.$el.modal("hide");
            this.model.set("isPopupVisible", false);
            this.model.unset("coordinate", {silent: true});
            this.model.destroyPopup();
        }
    });

    return GFIPopupView;
});
