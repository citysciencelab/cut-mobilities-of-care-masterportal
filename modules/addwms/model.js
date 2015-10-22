/**
@Discription:
    Dieses Model beinhaltet die Logik, um einen WMS Capabillity Request auszuführen und die Response zu parsen.
    Aus dem geparseten Objekt werden die Layer ausgelesen und aus diesen Informationen Layerobjekte erzeugt und an die Collection,
    die die Layer verwaltet geschickt
@Autor: RL
**/

define([
    "jquery",
    "underscore",
    "backbone",
    "openlayers",
    "eventbus",
    "config",
    "modules/core/util"
], function (jquery, _, Backbone, ol, EventBus, config, Util) {

    var AddWMSModel = Backbone.Model.extend({
        layers: [],
        capability: {},
        initialize: function () {
            EventBus.on("winParams", this.setStatus, this); // Fenstermanagement
        },
        setStatus: function (args) { // Fenstermanagement
            if (args[2] === "addwms") {
                this.set("isCollapsed", args[1]);
                this.set("isCurrentWin", args[0]);
            }
            else {
                this.set("isCurrentWin", false);
            }
        },
        // Diese funktion wird benutzt, um Fehlermeldungen im WMSView darzustellen
        displayError: function (text) {
                if (text === "" || typeof text === "undefined") {
                    text = "Leider konnte unter der angegebenen URL kein (gültiger) WMS gefunden werden!";
                }
             jquery(".addWMS.win-body").prepend("<div class=\"addwms_error\">" + text + "</div>");
        },

        // Lädt die Capabillities, parsed sie und extrahiert die Daten-Layer
        loadAndAddLayers: function () {
            jquery(".addwms_error").remove();
            var parser = new ol.format.WMSCapabilities(),
            url = $("#wmsUrl").val(),
            context = this;

            if (url === "") {
                context.displayError("Bitte die URL eines WMS in das Textfeld eingeben!");
                return;
            }
            Util.showLoader();
            $.ajax({
                timeout: 4000,
                url: Util.getProxyURL(url) + "?request=GetCapabilities&service=WMS",
                success: function (data) {
                    Util.hideLoader();
                    try {
                        context.capability = parser.read(data);
                        // Für jede unterste Layer in den Capabillities erzeuge ein neues Layer objekt und schicke es an die Layermodelcollection
                        _.each(context.findLayersInCapabillities(context.capability.Capability.Layer.Layer, "noParent"), function (layer) {
                            var layerObj = context.newLayer(
                            layer.Title,
                            context.capability.Service.OnlineResource,
                            layer.Name,
                            context.capability.version,
                            context.capability.Service.Title,
                            layer.parent);
                            // Schickt das neues Layerobjekt an die Layercollection
                            EventBus.trigger("layerlist:addNewModel", layerObj);
                        });
                        // Wenn alle Layer hinzugefügt wurden das Erzeugen von Ordner in Catalogextern getriggert
                        EventBus.trigger("layerList:sendExternalFolders");
                    }
                    catch (e) {
                       context.displayError();
                    }
                },
                error: function () {
                    Util.hideLoader();
                    context.displayError();
                }
            });

        },
        // crawled rekursiv durch die Capabillities und holt sich die Layer auf der untersten Ebene
        // gibt den Layern den direkten Überordner als Attribut mit
        findLayersInCapabillities: function (layerObject, parent) {
            /*
                Wenn layer Object ein array ist rufe diese function für jedes Element auf
            */
            if (_.isArray(layerObject)) {
                // wenn das Array keinen Eintrag hat
                if (layerObject.length === 0) {
                    return [];
                }
                // wenn das Array nur einen Eintrag hat
                if (layerObject.length === 1) {
                        return this.findLayersInCapabillities(_.first(layerObject), parent);
                }
                else {
                    // wenn das Array nur mehrere Einträge hat
                    return this.findLayersInCapabillities(_.first(layerObject), parent).concat(
                           this.findLayersInCapabillities(_.rest(layerObject, 1), parent));
                }
            }
            else {
                // layerObject ist kein Array hat aber ein Kind namens Layer
                if (_.has(layerObject, "Layer")) {
                    if (parent === "noParent") {
                        parent = layerObject.Title;
                    }
                    return this.findLayersInCapabillities(layerObject.Layer, parent);
                }
                // layerObject ist kein Array und hat kein Kind namens Layer
                else {
                        return [_.extend(layerObject, {"parent": parent})];
                }
            }

        },
        // Erzeugt ein neues Layerobjekt, dabei werden
        // die Meta Daten benutzt, um die Hierarchie der Layer abzubilden
        newLayer: function (name, url, layers, version, wmsTitle, parent) {

            return {
                // die ID wird beim hinzufügen in der layer/list.js gesetzt
                "isExternal": true,
                // gibt den Direkten überordner an
                "parent": parent,
                "name": name,
                "url": url,
                "typ": "WMS",
                "layers": layers,
                "format": "image/png",
                "version": version,
                "singleTile": false,
                "transparent": true,
                "tilesize": "512",
                "gutter": "0",
                "minScale": "0",
                "maxScale": "350000",
                "gfiAttributes": "showAll",
                "layerAttribution": "nicht vorhanden",
                "legendURL": "",
                "isbaselayer": false,
                "cache": false,
                "folder": wmsTitle,
                "datasets": [
                    {
                        "md_id": parent,
                        "md_name": name,
                        "bbox": "nicht vorhanden",
                        "kategorie_opendata": [
                            "Externe"
                        ],
                        "kategorie_inspire": "Kein INSPIRE-Thema"
                    }
                ],
                "kategorieOpendata": "Externe"
                };
        }
    });

    return new AddWMSModel();

});
