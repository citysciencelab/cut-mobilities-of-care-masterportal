define(function (require) {
    var ol = require("openlayers"),
        $ = require("jquery"),
        WFS_T;

    WFS_T = Backbone.Model.extend({

        // activeButton --> Aktuell aktvivierte Funktion.
        // formatWFS --> Zum Lesen und Schreiben von WFS-Features.
        // editInteraction --> Wird zum Bearbeiten der Feature-Geometrie benötigt.
        // showAttrTable --> Sichtbarkeit der Feature-Attributtabelle.
        defaults: {
            activeButton: "",
            formatWFS: new ol.format.WFS(),
            editInteraction: new ol.interaction.Select(),
            showAttrTable: false
        },

        //
        initialize: function () {
            this.listenTo(Radio.channel("Window"), {
                "winParams": this.setStatus
            });

            this.listenTo(this, {
                "change:url": this.getDescribeFeatureType,
                "change:activeButton": function () {
                    Radio.trigger("Map", "removeInteraction", this.get("interaction"));
                    Radio.trigger("Map", "removeInteraction", this.get("editInteraction"));
                    this.set("showAttrTable", false);
                    this.setInteraction();
                },
                "change:interaction": function () {
                    Radio.trigger("Map", "addInteraction", this.get("interaction"));
                },
                "change:recordData": this.sendTransaction
            });
        },

        // Hört auf "winParams".
        // Verwaltet den Status des Fensters.
        setStatus: function (args) {
            if (args[2] === "record" && args[0] === true) {
                this.set("isCollapsed", args[1]);
                this.set("isCurrentWin", args[0]);
            }
            else {
                this.set("isCurrentWin", false);
                this.set("activeButton", "");
                Radio.trigger("Map", "removeInteraction", this.get("interaction"));
            }
        },

        // Hört auf "change:url".
        // Führt ein DescribeFeatureType-Request aus.
        // Schreibt die möglichen Feature-Attribute in ein Array.
        getDescribeFeatureType: function () {
            var attributions = [];

            $.ajax(this.get("url") + "?SERVICE=WFS&VERSION=1.1.0&REQUEST=DescribeFeatureType", {
                type: "Get",
                context: this,
                success: function (response) {
                    $(response).find("element").each(function () {
                        if ($(this).attr("type") === "string") {
                            attributions.push($(this).attr("name"));
                        }
                    });
                    this.set("attributions", attributions);
                }
            });
        },

        // Wird aus der View heraus aufgerufen.
        // Setzt das Atribut "activeButton".
        setActive: function (value) {
            switch (value) {
                case "record-button-point": {
                    this.set("activeButton", "point");
                    break;
                }
                case "record-button-line": {
                    this.set("activeButton", "line");
                    break;
                }
                case "record-button-area": {
                    this.set("activeButton", "area");
                    break;
                }
                case "record-button-edit": {
                    this.set("activeButton", "edit");
                    break;
                }
                case "record-button-delete": {
                    this.set("activeButton", "delete");
                    break;
                }
                case "record-button-select": {
                    this.set("activeButton", "select");
                    break;
                }
                default: {
                    break;
                }
            }
        },

        // Hört auf "change:activeButton".
        // Die entsprechende Funktion zum aktvieren der Interaction wird aufgerufen.
        setInteraction: function () {
            switch (this.get("activeButton")) {
                case "point": {
                    this.setDrawInteraction("Point");
                    break;
                }
                case "line": {
                    this.setDrawInteraction("LineString");
                    break;
                }
                case "area": {
                    this.setDrawInteraction("Polygon");
                    break;
                }
                case "edit": {
                    this.setModifyInteraction();
                    break;
                }
                case "delete": {
                    this.setDeleteInteraction();
                    break;
                }
                case "select": {
                    this.setSelectInteraction();
                    break;
                }
                default: {
                    break;
                }
            }
        },

        // Die Interaction für das Zeichnen wird gesetzt.
        // Registriert eine Listener-Funktion für "drawend".
        setDrawInteraction: function (value) {
            this.set("interaction", new ol.interaction.Draw({
                type: value,
                source: this.get("source")
            }));
            this.get("interaction").on("drawend", function (evt) {
                this.transactionWFS("insert", evt.feature);
            }, this);
        },

        // Die Interaction für das Löschen wird gesetzt.
        // Registriert eine Listener-Funktion für "change:length" der Feature-Collection.
        setDeleteInteraction: function () {
            this.set("interaction", new ol.interaction.Select());
            this.get("interaction").getFeatures().on("change:length", function (evt) {
                this.transactionWFS("delete", evt.target.item(0));
                this.get("interaction").getFeatures().clear();
            }, this);
        },

        // Die Interaction für das Bearbeiten der Feature-Attribute wird gesetzt.
        // Registriert eine Listener-Funktion für "select".
        setSelectInteraction: function () {
            this.set("interaction", new ol.interaction.Select());
            this.get("interaction").on("select", function (evt) {
                if (evt.deselected.length) {
                    evt.deselected[0].setProperties(this.get("featureProperties"));
                    this.transactionWFS("update", evt.deselected[0]);
                    this.set("showAttrTable", false);
                }
                if (evt.selected.length) {
                    _.each(this.get("attributions"), function (attribut) {
                        if (_.has(evt.selected[0].getProperties(), attribut) === false) {
                            evt.selected[0].set(attribut, "");
                        }
                    });
                    this.set("featureProperties", _.omit(evt.selected[0].getProperties(), "geometry"));
                    this.set("showAttrTable", true);
                }
            }, this);
        },

        // Die Interactions für das Bearbeiten der Geometrie werden gesetzt.
        // Registriert eine Listener-Funktion für "remove" der Feature-Collection.
        setModifyInteraction: function () {
            Radio.trigger("Map", "addInteraction", this.get("editInteraction"));
            this.set("interaction", new ol.interaction.Modify({
                features: this.get("editInteraction").getFeatures()
            }));
            this.get("editInteraction").getFeatures().on("remove", function (evt) {
                this.transactionWFS("update", evt.element);
            }, this);
        },

        // Erstellt das Transaction-XML für "insert", "delete" und "update".
        transactionWFS: function (todo, feature) {
            var domNode,
                xmlDoc,
                xmlSerializer = new XMLSerializer(),
                xmlString,
                writeOptions = {
                    featureNS: this.get("featureNS"),
                    featureType: this.get("featureType"),
                    featurePrefix: "app",
                    srsName: "EPSG:25832"
                };

            switch (todo) {
                case "insert": {
                    domNode = this.get("formatWFS").writeTransaction([feature], null, null, writeOptions);
                    xmlString = xmlSerializer.serializeToString(domNode);
                    break;
                }
                case "delete": {
                    domNode = this.get("formatWFS").writeTransaction(null, null, [feature], writeOptions);
                    xmlString = xmlSerializer.serializeToString(domNode);
                    break;
                }
                case "update": {
                    domNode = this.get("formatWFS").writeTransaction(null, [feature], null, writeOptions);
                    xmlString = xmlSerializer.serializeToString(domNode);

                    xmlDoc = $.parseXML(xmlString);
                    $(xmlDoc).find("wfs\\:name,name").each(function () {
                        var oldText = $(this).text();

                        $(this).text("app:" + oldText);
                    });
                    xmlString = xmlSerializer.serializeToString(xmlDoc);
                    break;
                }
                default: {
                    break;
                }
            }
            this.set("recordData", xmlString);
        },

        // Führt die Transaction aus.
        sendTransaction: function () {
            $.ajax(this.get("url"), {
                type: "POST",
                dataType: "xml",
                processData: false,
                contentType: "text/xml",
                data: this.get("recordData")
            });
        },

        // Wird aus der View aufgerufen.
        // Die Werte aus der Attributtabelle werden in das Attribut "featureProperties" geschrieben.
        setFeatureAttributions: function (id, inputValue) {
            _.each(this.get("featureProperties"), function (value, key, list) {
                if (id === key) {
                    list[key] = inputValue;
                }
                else {
                    list[key] = value;
                }
            });
        }
    });

    return WFS_T;
});
