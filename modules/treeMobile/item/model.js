define([
    "modules/treeMobile/nodeModel",
    "eventbus"
], function () {

    var Node = require("modules/treeMobile/nodeModel"),
        EventBus = require("eventbus"),
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
            // Name der Funktion
            title: "",
            // Bootstrap Glyphicon Class
            glyphicon: "",
            // Email Adresse
            email: undefined
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
                    // alles quatsch backbone radio an Tools --> setActiveToTrue
                    //
                    //
                    console.log(this.getTitle());
                }
            }
        },
        getEmail: function () {
            return this.get("email");
        }
    });

    return ItemModel;
});
