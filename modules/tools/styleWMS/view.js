define([
    "backbone",
    "text!modules/tools/styleWMS/template.html",
    "modules/tools/styleWMS/model",
    "colorpicker"
], function () {

    var Backbone = require("backbone"),
        StyleWMS = require("modules/tools/styleWMS/model"),
        StyleWMSTemplate = require("text!modules/tools/styleWMS/template.html"),
        StyleWMSView;

    StyleWMSView = Backbone.View.extend({
        model: new StyleWMS(),
        className: "style-wms-win",
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
            "click button": "createSLD",
            "click .glyphicon-remove": "hide"
        },

        /**
        * Wird aufgerufen wenn die View erzeugt wird
        * Registriert Listener auf das Model
        */
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

            $("body").append(this.$el.html(this.template(attr)));
            this.$el.draggable({
                containment: "#map",
                handle: ".header > .title"
            });
            this.$el.show();
            // aktiviert den/die colorpicker
            this.$el.find("[class*=selected-color]").parent().colorpicker({format: "hex"});
        },

        /**
         * Ruft setAttributeName im Model auf und übergibt den Attributnamen
         * @param {ChangeEvent} evt
         */
        setAttributeName: function (evt) {
            this.model.setAttributeName(evt.target.value);
        },

        /**
         * Ruft setNumberOfClasses im Model auf und übergibt die Anzahl der Klassen
         * Alle Colorpicker werden scharf geschaltet
         * @param {ChangeEvent} evt
         */
        setNumberOfClasses: function (evt) {
            this.model.setNumberOfClasses(evt.target.value);
        },

        /**
         * Erstellt die Style-Klassen und übergibt sie an die Setter Methode im Model
         */
        setStyleClassAttributes: function () {
            var styleClassAttributes = [];

            this.removeErrorMessages();
            for (var i = 0; i < this.model.get("numberOfClasses"); i++) {
                styleClassAttributes.push({
                    startRange: $(".start-range" + i).val(),
                    stopRange: $(".stop-range" + i).val(),
                    color: $(".selected-color" + i).val()
                });
            }
            this.model.setStyleClassAttributes(styleClassAttributes);
        },

        /**
         * Ruft createSLD im Model auf
         */
        createSLD: function () {
            this.model.createSLD();
        },

        /**
         * zeigt die Error Meldungen im Formular an
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
         */
        removeErrorMessages: function () {
            this.$el.find(".error").remove();
            this.$el.find("[class*=selected-color], [class*=start-range], [class*=stop-range]").parent().removeClass("has-error");
        },

        /**
         * Versteckt das Fenster
         */
        hide: function () {
            this.$el.hide();
        }
    });

    return StyleWMSView;
});
