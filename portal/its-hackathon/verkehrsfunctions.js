define([
    "backbone",
    "openlayers",
    "backbone.radio"
], function (Backbone, ol, Radio) {

    var aktualisiereVerkehrsdaten = Backbone.Model.extend({

        default: {
            proxyURLVerkehrssituation: "",
            proxyURLVerkehrsmeldung: ""
        },
        /*
         * Lese Layer mit URL und starte refreshVerkehrsmeldungen, wobei layerid der gleichen URL entsprechen muss.
         */
        initialize: function () {
            var proxyURLVerkehrssituation = Radio.request("Util", "getProxyURL", "http://geodienste.hamburg.de/HH_WFS_Verkehr_opendata"),
                proxyURLVerkehrsmeldung = Radio.request("Util", "getProxyURL", "http://geodienste.hamburg.de/HH_WFS_Verkehr_opendata"),
                channel = Radio.channel("Verkehrsfunctions"),
                verkehrslagelayer = Radio.request("ModelList", "getModelByAttributes", {id: "947"});

            this.set("proxyURLVerkehrssituation", proxyURLVerkehrssituation);
            this.set("proxyURLVerkehrsmeldung", proxyURLVerkehrsmeldung);
            this.listenTo(channel, {
                "aktualisiereverkehrsnetz": this.refreshVerkehrssituation
            }, this);

            if (verkehrslagelayer && verkehrslagelayer.get("isVisibleInMap") === true) {
                this.refreshVerkehrssituation(verkehrslagelayer);
            }
            this.refreshVerkehrsmeldung();
        },

        /**
         * [refreshVerkehrssituation description]
         * @param  {Backbone.Model} model
         */
        refreshVerkehrssituation: function (model) {
            var postmessage = "<wfs:GetFeature xmlns:wfs='http://www.opengis.net/wfs' service='WFS' version='1.1.0' xsi:schemaLocation='http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/wfs.xsd' xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance'>" +
                "<wfs:Query typeName='feature:bab_vkl' srsName='epsg:25832'>" +
                    "<ogc:Filter xmlns:ogc='http://www.opengis.net/ogc'>" +
                        "<ogc:PropertyIsLessThan>" +
                            "<ogc:PropertyName>vkl_id</ogc:PropertyName>" +
                            "<ogc:Literal>2</ogc:Literal>" +
                        "</ogc:PropertyIsLessThan>" +
                    "</ogc:Filter>" +
                "</wfs:Query>" +
            "</wfs:GetFeature>";

            $.ajax({
                url: this.get("proxyURLVerkehrssituation"),
                type: "POST",
                data: postmessage,
                context: model,
                headers: {
                    "Content-Type": "application/xml; charset=UTF-8"
                },
                success: function (data) {
                    var hits = $("wfs\\:FeatureCollection,FeatureCollection", data),
                        fmNode = $(hits).find("gml\\:featureMember,featureMember"),
                        receivedNode = $(fmNode).find("app\\:received,received")[0],
                        aktualitaet = receivedNode.textContent;

                    if (aktualitaet) {
                        var newEventValue = "<strong>aktuelle Meldungen der TBZ:</strong></br>Aktualität: " + aktualitaet.trim().replace("T", " ").substring(0, aktualitaet.length - 3) + "</br>";
                        model.getAttributions().text = newEventValue;
                        Radio.trigger("AttributionsView", "renderAttributions");
                    }
                },
                error: function () {
                    Radio.trigger("Alert", "alert", "<strong>Verkehrsmeldungen </strong>der TBZ momentan nicht verfügbar.");
                }
            });
            this.refreshVerkehrsmeldung();
        },

        /**
         * [refreshVerkehrsmeldung description]
         */
        refreshVerkehrsmeldung: function () {
            // diese Abfrage zeigt im Bedarfsfall eine Meldung
            $.ajax({
                url: this.get("proxyURLVerkehrsmeldung"),
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
                            Radio.trigger("Alert", "alert", {
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
                    Radio.trigger("Alert", "alert", "<strong>Verkehrsmeldungen </strong>der TBZ momentan nicht verfügbar.");
                }
            });
        }
    });

    return aktualisiereVerkehrsdaten;
});
