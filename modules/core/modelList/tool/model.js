define([
    "modules/core/modelList/item",
    "eventbus"
], function () {

    var Item = require("modules/core/modelList/item"),
        EventBus = require("eventbus"),
        Tool;

    Tool = Item.extend({
        defaults: {
            // true wenn die Node sichtbar
            isVisible: false,
            // true wenn die Node zur ersten Ebene gehört
            isRoot: false,
            // welcher Node-Type - folder/layer/item
            type: "",
            // die ID der Parent-Node
            parentId: "",
            // Bootstrap Glyphicon Class
            glyphicon: "",
            // Email Adresse
            email: undefined,
            // Name (Überschrift) der Funktion
            name: "",
            // true wenn das Tool aktiviert ist
            isActive: false
        },

        initialize: function () {
            this.listenTo(this, {
                "change:isActive": this.activateTool
            });
        },

        activateTool: function () {
            if (this.getIsActive() === true) {
                this.collection.setActiveToolToFalse(this);
                EventBus.trigger("activateClick", this.getId());
                if (this.getId() === "legend") {
                    EventBus.trigger("toggleLegendWin");
                }
                else if (this.getId() === "contact") {
                    var email = this.getEmail() || "LGVGeoPortal-Hilfe@gv.hamburg.de",
                        mailto = encodeURI("mailto:" + email + "?subject=Frage zum Portal: " + document.title + "&body=Zur weiteren Bearbeitung bitten wir Sie die nachstehenden Angaben zu machen. Bei Bedarf fügen Sie bitte noch einen Screenshot hinzu. Vielen Dank! \n \n Name:\t\t\n Telefon:\t\n Anliegen:\t\n\n Systeminformationen: \n Platform: " + navigator.platform + "\n CookiesEnabled: " + navigator.cookieEnabled + "\n UserAgent: " + navigator.userAgent);

                    document.location.href = mailto;
                }
                else if (this.getId() !== "gfi" && this.getId() !== "coord") {
                    EventBus.trigger("toggleWin", [this.getId(), this.get("name"), this.get("glyphicon")]);
                }

                else {
                    EventBus.trigger("closeWindow", false);
                    EventBus.trigger("winParams", [false, false, ""]);
                }
            }
        },

        /**
         * Setter für das Attribut "isActive"
         * @param {boolean} value
         * @param {Object} [options] - {silent: true} unterbindet das "change-Event"
         */
        setIsActive: function (value, options) {
            this.set("isActive", value, options);
        },

        /**
         * Getter für das Attribut "isActive"
         * @return {boolean}
         */
        getIsActive: function () {
            return this.get("isActive");
        },

        getEmail: function () {
            return this.get("email");
        }
    });

    return Tool;
});
