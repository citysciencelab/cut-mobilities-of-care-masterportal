define([
    "underscore",
    "backbone",
    "openlayers",
    "eventbus",
    "config",
    "modules/layer/WMSLayer",
    "modules/layer/list",
    "modules/core/util"
], function (_, Backbone, ol, EventBus, config, WMSLayer, LayerList, Util) {

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
        loadAndAddLayers: function () {
            var parser = new ol.format.WMSCapabilities(),
            url = $("#wmsUrl").val(),
            context = this,
            urls = [
               url, "http://lgvfds01.fhhnet.stadt.hamburg.de/arcgis/services/FD_LGV_Map/Rasterplan/MapServer/WmsServer"
            ];

            Util.showLoader();
            _.each(urls, function (url) {
                $.ajax({
                    url: Util.getProxyURL(url) + "?request=GetCapabilities&service=WMS",
                    success: function (data) {
                        Util.hideLoader();
                       //  try {
                                context.capability = parser.read(data);
                               // var namedLayers = parser.postProcessLayers(context.capability);
                                _.each(context.findLayersInCapabillities(context.capability.Capability), function (layer) {
                                    var layerObj = context.newLayer(
                                    layer.Title,
                                    context.capability.Service.OnlineResource,
                                    layer.Name,
                                    context.capability.version,
                                    context.capability.Service.Title);

                                    EventBus.trigger("layerlist:addNewModel", layerObj);
                            });
                            EventBus.trigger("layerList:sendExternalFolders");
                        //}
                        //catch (e) {
                          //  console.log(e);
                            // $("#layer_check_box_container").text("Leider konnten zu dieser URL keine Layer geladen werden.");
                        //}
                    },
                    error: function () {
                        Util.hideLoader();
                    }

                });
            });
        },
        // crawled rekursiv durch die Capabillities und holt sich die Layer auf der untersten Ebene
        findLayersInCapabillities: function (layerObject) {
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
                        return this.findLayersInCapabillities(_.first(layerObject));
                }
                else {
                    // wenn das Array nur mehrere Einträge hat
                    return this.findLayersInCapabillities(_.first(layerObject)).concat(
                           this.findLayersInCapabillities(_.rest(layerObject, 1)));
                }
            }
            else {
                // layerObject ist kein Array hat aber ein Kind namens Layer
                if (_.has(layerObject, "Layer")) {
                    return this.findLayersInCapabillities(layerObject.Layer);
                }
                // layerObject ist kein Array und hat kein Kind namens Layer
                else {
                        return [layerObject];
                }
            }

        },
        newLayer: function (name, url, layers, version, wmsTitle) {

            return {
                // die ID wird beim hinzufügen in der layer/list.js gesetzt
                "isExternal": true,
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
                        "md_id": name,
                        "md_name": wmsTitle,
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
