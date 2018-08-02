define(function (require) {

    var TemplateShow = require("text!modules/controls/attributions/templateShow.html"),
        TemplateHide = require("text!modules/controls/attributions/templateHide.html"),
        Attributions = require("modules/controls/attributions/model"),
        AttributionsView;

    AttributionsView = Backbone.View.extend({
        model: new Attributions(),
        templateShow: _.template(TemplateShow),
        templateHide: _.template(TemplateHide),
        events: {
            "click .attributions-button": "toggleIsContentVisible"
        },
        initialize: function () {
            var channel = Radio.channel("AttributionsView"),
                isViewMobile = Radio.request("Util", "isViewMobile");

            this.listenTo(channel, {
                "renderAttributions": this.renderAttributions
            });

            this.listenTo(this.model, {
                "change:isContentVisible": this.renderAttributions,
                "change:modelList": this.renderAttributions,
                "change:isVisibleInMap": this.toggleIsVisibleInMap
            });

            channel.on({
                "ovmShow": this.ovmShow, // Icon auf Karte wird angepast wenn Overviewmap sichtbar
                "ovmHide": this.ovmHide // Icon auf Karte wird angepast wenn Overviewmap versteckt
            }, this);

            this.listenTo(Radio.channel("Util"), {
                "isViewMobileChanged": this.isViewMobileChanged
            });

            this.render();

            if (isViewMobile === true) {
                this.model.setIsContentVisible(this.model.get("isInitOpenMobile"));
            }
            else {
                this.model.setIsContentVisible(this.model.get("isInitOpenDesktop"));
            }
        },

        render: function () {
            var attr = this.model.toJSON(),
                isOverviewmap = this.model.get("isOverviewmap"),
                isViewMobile = Radio.request("Util", "isViewMobile");

            this.$el.html(this.templateShow(attr));
            if (this.model.get("isVisibleInMap") === true) {
                this.$el.show();
                this.$el.addClass("attributions-view attributions-background-color");
            }
            else {
                this.$el.hide();
            }

            this.isViewMobile(isViewMobile, isOverviewmap);

            if (attr.modelList.length === 0) {
                this.$(".attributions-div").removeClass("attributions-div");
            }
            return this;
        },

        renderAttributions: function () {
            var attr = this.model.toJSON();

            if (this.model.get("isContentVisible") === true) {
                this.$el.html(this.templateShow(attr));
                this.$el.addClass("attributions-background-color");
            }
            else {
                this.$el.html(this.templateHide(attr));
                this.$el.removeClass("attributions-background-color");
            }
            if (_.isEmpty(attr.modelList) === true) {
                this.$(".attributions-div").removeClass("attributions-div");
            }
            else {
                this.$(".attributions-div").addClass("attributions-div");
            }
        },

        toggleIsContentVisible: function () {
            this.model.toggleIsContentVisible();
        },

        toggleIsVisibleInMap: function () {
            this.$el.toggle();
        },

        /**
         * Wenn die Overviewmap offen ist wird die Position des buttons über hinzufügen/entfernen
         * von css angepasst.
         * @returns {void}
         */
        ovmShow: function () {
            this.addWithOverviewmapClass();
            this.$(".attributions-view").removeClass("attributions-view-withOverviewmapHidden");
        },

        /**
         * Wenn die Overviewmap versteckt ist wird die Position des buttons über hinzufügen/entfernen
         * von css angepasst.
         * @returns {void}
         */
        ovmHide: function () {
            this.$(".attributions-view").addClass("attributions-view-withOverviewmapHidden");
            this.removeWithOverviewmapClass();
        },

        /**
         * Fügt den attributions eine Klasse hinzu, um attributions weiter oben zu zeichnen
         * Wird benutzt bei vorhandener Overviewmap
         * @returns {void}
         */
        addWithOverviewmapClass: function () {
            this.$el.addClass("attributions-view-withOverviewmap");
        },

        /**
         * Entfernt die Klasse für das positionieren mit Overviewmap
         * @returns {void}
         */
        removeWithOverviewmapClass: function () {
            this.$el.removeClass("attributions-view-withOverviewmap");
        },

        /**
         * Wird aufgerufen wenn vie mobile ist und die wiederum ruft isViewMobile
         * @param {boolean} isViewMobile -
         * @returns {void}
         */
        isViewMobileChanged: function (isViewMobile) {
            var isOverviewmap = this.model.get("isOverviewmap");

            this.isViewMobile(isViewMobile, isOverviewmap);
        },

        /**
         * Testet, ob Overviewmap vorhanden ist und fügt entsprechend eien Klasse hinzu
         * oder entfernt diese.
         * @param {boolean} isViewMobile -
         * @param {boolean} isOverviewmap -
         * @returns {void}
         */
        isViewMobile: function (isViewMobile, isOverviewmap) {
            if (isViewMobile === false && isOverviewmap === true) {
                this.addWithOverviewmapClass();
            }
            else {
                this.removeWithOverviewmapClass();
            }
        }

    });

    return AttributionsView;
});
