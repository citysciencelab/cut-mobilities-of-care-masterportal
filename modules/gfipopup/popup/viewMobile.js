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
            this.appendChildren(); //vor $el.modal (reisezeiten)
            this.appendRoutableButton();
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
            this.removeChildren();
            this.$el.modal("hide");
            this.model.set("isPopupVisible", false);
            this.model.unset("coordinate", {silent: true});
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
                    $('.gfi-mobile-content').append(element.val.$el);
                }, this);
            }
        },
        /**
         * Fügt den Button dem gfiContent hinzu
         */
        appendRoutableButton: function () {
            if (this.model.get('gfiRoutables') && this.model.get('gfiRoutables').length > 0) {
                var rb = this.model.get('gfiRoutables')[this.model.get('gfiRoutables').length - this.model.get('gfiCounter')];
                if (rb) {
                    $('.gfi-mobile-content').append(rb.$el);
                }
            }
        },
        /**
         *
         */
        removeChildren: function () {
            this.model.removeChildObjects();
        }
    });

    return GFIPopupView;
});
