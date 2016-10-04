define([
    "backbone",
    "eventbus",
    "config",
    "modules/layer/list",
    "openlayers",
    "modules/core/util"
], function (Backbone, EventBus, Config, LayerList, ol, Util) {

    var aktualisiereVerkehrsdaten = Backbone.Model.extend({
        /*
         * Lese Layer mit URL und starte refreshVerkehrsmeldungen, wobei layerid der gleichen URL entsprechen muss.
         */
        initialize: function () {
            var url;

            EventBus.on("aktualisiereverkehrsnetz", this.refreshVerkehrssituation, this);
            _.each(LayerList.models, function (layerdef) {
                if (layerdef.id === "2132") {
                    url = Util.getProxyURL(layerdef.get("url"));
                }
            });
            if (!url) {
                EventBus.trigger("alert", "<strong>Verkehrsmeldungen </strong>der TBZ momentan nicht verfügbar.");
            }
            else {
                this.set("url", url);
                this.refreshVerkehrsmeldung();
            }
        },
        /*
         *
         */
        refreshVerkehrssituation: function (attributions, layer) {
            if (!layer) {
                return;
            }
            var newEventValue = "",
                postmessage = "<wfs:GetFeature xmlns:wfs='http://www.opengis.net/wfs' service='WFS' version='1.1.0' xsi:schemaLocation='http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/wfs.xsd' xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance'>",
                url = this.get("url");

            postmessage += "<wfs:Query typeName='feature:bab_vkl' srsName='epsg:25832'>";
            postmessage += "<ogc:Filter xmlns:ogc='http://www.opengis.net/ogc'>";
            postmessage += "<ogc:PropertyIsLessThan>";
            postmessage += "<ogc:PropertyName>vkl_id</ogc:PropertyName>";
            postmessage += "<ogc:Literal>2</ogc:Literal>";
            postmessage += "</ogc:PropertyIsLessThan>";
            postmessage += "</ogc:Filter>";
            postmessage += "</wfs:Query>";
            postmessage += "</wfs:GetFeature>";
            $.ajax({
                url: url,
                type: "POST",
                data: postmessage,
                headers: {
                    "Content-Type": "application/xml; charset=UTF-8"
                },
                success: function (data) {
                    var hits = $("wfs\\:FeatureCollection,FeatureCollection", data),
                        fmNode = $(hits).find("gml\\:featureMember,featureMember"),
                        receivedNode = $(fmNode).find("app\\:received,received")[0],
                        aktualitaet = receivedNode.textContent;

                    if (aktualitaet) {
                        newEventValue = "<strong>aktuelle Meldungen der TBZ:</strong></br>Aktualität: " + aktualitaet.trim().replace("T", " ").substring(0, aktualitaet.length - 3) + "</br>";
                        this.set("eventAttribution", newEventValue);
                    }
                },
                context: layer,
                error: function () {
                    this.set("eventAttribution", "");
                }
            });
            this.refreshVerkehrsmeldung();
        },
        /*
         *
         */
        refreshVerkehrsmeldung: function () {
            var url = this.get("url");
            // diese Abfrage zeigt im Bedarfsfall eine Meldung
            $.ajax({
                url: url,
                data: "SERVICE=WFS&REQUEST=GetFeature&TYPENAME=vkl_hinweis&VERSION=1.1.0",
                async: true,
                context: this,
                success: function (data) {
                    var wfsReader = new ol.format.WFS({
                        featureNS: "http://www.deegree.org/app",
                        featureType: "vkl_hinweis"
                    });

                    try {
						var feature = wfsReader.readFeatures(data)[0],
						hinweis = feature.get("hinweis"),
                        datum = feature.get("stand");

                        if (hinweis && datum) {
                            EventBus.trigger("alert", {
                                text: "<strong>Tunnelbetrieb Hamburg: </strong>" + hinweis + " (" + datum + ")",
                                kategorie: "alert-warning"
                            });
                        }
					}
					catch (err) {
						return;
					}
                },
                error: function () {
                    EventBus.trigger("alert", "<strong>Verkehrsmeldungen </strong>der TBZ momentan nicht verfügbar.");
                }
            });
        }
    });

    return aktualisiereVerkehrsdaten;
});
