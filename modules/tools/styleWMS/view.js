define(function (require) {

    var StyleWMS = require("modules/tools/styleWMS/model"),
        StyleWMSTemplate = require("text!modules/tools/styleWMS/template.html"),
        StyleWMSView;

    require("colorpicker");
    StyleWMSView = Backbone.View.extend({
        model: new StyleWMS(),
        className: "style-wms-win ui-widget-content",
        template: _.template(StyleWMSTemplate),
        events: {
            // Auswahl der Attribute
            "change #attributField": "setAttributeName",
            // Auswahl Anzahl der Klassen
            "change #numberField": "setNumberOfClasses",
            // Eingabe der Wertebereiche
            "keyup [class*=start-range], [class*=stop-range]": "setStyleClassAttributes",
            // Auswahl der Farbe
            "changeColor [id*=style-wms-colorpicker]": "setStyleClassAttributes",
            // Anwenden Button
            "click .btn-panel-submit": "createSLD",
            "click .btn-panel-reset": "reset",
            "click .glyphicon-remove": "hide"
        },

        initialize: function () {
            this.listenTo(this.model, {
                // ändert sich der Fensterstatus wird neu gezeichnet
                "change:isCollapsed change:isCurrentWin sync": this.render,
                // ändert sich eins dieser Attribute wird neu gezeichnet
                "change:model change:attributeName change:numberOfClasses": this.render,
                // Liefert die validate Methode Error Meldungen zurück, werden diese angezeigt
                "invalid": this.showErrorMessages
            });
        },

        /**
         * [render description]
         * @return {[type]} [description]
         */
        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
            document.getElementsByTagName("body")[0].appendChild(this.el);
            this.$el.draggable({
                containment: "#map",
                handle: ".header > .title"
            });
            this.$el.show();
            // aktiviert den/die colorpicker
            this.$el.find("[class*=selected-color]").parent().colorpicker({format: "hex"});
            return this;
        },

        reset: function () {
            this.model.resetModel();
            this.render();
        },

        /**
         * Ruft setAttributeName im Model auf und übergibt den Attributnamen
         * @param {ChangeEvent} evt -
         * @returns {void}
         */
        setAttributeName: function (evt) {
            this.model.setAttributeName(evt.target.value);
        },

        /**
         * Ruft setNumberOfClasses im Model auf und übergibt die Anzahl der Klassen
         * Alle Colorpicker werden scharf geschaltet
         * @param {ChangeEvent} evt -
         * @returns {void}
         */
        setNumberOfClasses: function (evt) {
            this.model.setNumberOfClasses(evt.target.value);

            // Update attribute values
            this.setStyleClassAttributes();
        },

        /**
         * Erstellt die Style-Klassen und übergibt sie an die Setter Methode im Model
         * @returns {void}
         */
        setStyleClassAttributes: function () {
            var styleClassAttributes = [],
                i;

            this.removeErrorMessages();
            for (i = 0; i < this.model.get("numberOfClasses"); i++) {
                styleClassAttributes.push({
                    startRange: this.$(".start-range" + i).val(),
                    stopRange: this.$(".stop-range" + i).val(),
                    color: this.$(".selected-color" + i).val()
                });
            }
            this.model.setStyleClassAttributes(styleClassAttributes);
        },

        createSLD: function () {
            this.model.createSLD();
        },

        /**
         * zeigt die Error Meldungen im Formular an
         * @returns {void}
         */
        showErrorMessages: function () {
            _.each(this.model.get("errors"), function (error) {
                if (_.has(error, "colorText") === true) {
                    this.$el.find(".selected-color" + error.colorIndex).parent().addClass("has-error");
                    this.$el.find(".selected-color" + error.colorIndex).parent().after("<span class='error'>" + error.colorText + "</span>");
                }
                if (_.has(error, "rangeText") === true) {
                    this.$el.find(".start-range" + error.rangeIndex).parent().addClass("has-error");
                    this.$el.find(".stop-range" + error.rangeIndex).parent().addClass("has-error");
                    this.$el.find(".start-range" + error.rangeIndex).after("<span class='error'>" + error.rangeText + "</span>");
                }
                if (_.has(error, "intersectText") === true) {
                    this.$el.find(".start-range" + error.intersectIndex).parent().addClass("has-error");
                    this.$el.find(".stop-range" + error.prevIndex).parent().addClass("has-error");
                    this.$el.find(".start-range" + error.intersectIndex).after("<span class='error'>" + error.intersectText + "</span>");
                    this.$el.find(".stop-range" + error.prevIndex).after("<span class='error'>" + error.intersectText + "</span>");
                }
                if (_.has(error, "minText") === true) {
                    this.$el.find(".start-range" + error.minIndex).parent().addClass("has-error");
                    this.$el.find(".start-range" + error.minIndex).after("<span class='error'>" + error.minText + "</span>");
                }
                if (_.has(error, "maxText") === true) {
                    this.$el.find(".stop-range" + error.maxIndex).parent().addClass("has-error");
                    this.$el.find(".stop-range" + error.maxIndex).after("<span class='error'>" + error.maxText + "</span>");
                }
            }, this);
        },

        /**
         * löscht die Error Meldungen aus dem Formular
         * @returns {void}
         */
        removeErrorMessages: function () {
            this.$el.find(".error").remove();
            this.$el.find("[class*=selected-color], [class*=start-range], [class*=stop-range]").parent().removeClass("has-error");
        },

        hide: function () {
            this.$el.hide();
        }
    });

    return StyleWMSView;
});
