define([
    "modules/treeMobile/nodeModel",
    "backbone.radio",
    "eventbus"
], function () {

    var Node = require("modules/treeMobile/nodeModel"),
        EventBus = require("eventbus"),
        Radio = require("backbone.radio"),
        ItemModel;

    ItemModel = Node.extend({
        defaults: {
            // true wenn die Node sichtbar
            isVisible: false,
            // true wenn die Node zur ersten Ebene gehört
            isRoot: false,
            // welcher Node-Type - folder/layer/item
            type: "",
            // die ID der Parent-Node
            parentId: "",
            // Titel (Überschrift) der Funktion
            title: "",
            // Bootstrap Glyphicon Class
            glyphicon: "",
            // Email Adresse
            email: undefined,
            // Name der Funktion
            name: ""
        },
        checkItem: function () {
            switch (this.getTitle()) {
                case "Legende": {
                    EventBus.trigger("toggleLegendWin");
                    break;
                }
                case "Kontakt": {
                    var email = this.getEmail() || "LGVGeoPortal-Hilfe@gv.hamburg.de",
                        mailto = encodeURI("mailto:" + email + "?subject=Frage zum Portal: " + document.title + "&body=Zur weiteren Bearbeitung bitten wir Sie die nachstehenden Angaben zu machen. Bei Bedarf fügen Sie bitte noch einen Screenshot hinzu. Vielen Dank! \n \n Name:\t\t\n Telefon:\t\n Anliegen:\t\n\n Systeminformationen: \n Platform: " + navigator.platform + "\n CookiesEnabled: " + navigator.cookieEnabled + "\n UserAgent: " + navigator.userAgent);

                    document.location.href = mailto;
                    break;
                }
                // Tools
                default: {
                    Radio.trigger("ToolList", "setActiveByName", this.getName());
                    break;
                }
            }
        },
        getEmail: function () {
            return this.get("email");
        },
        getName: function () {
            return this.get("name");
        }
    });

    return ItemModel;
});
