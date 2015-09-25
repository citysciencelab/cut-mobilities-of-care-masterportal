define([
    "backbone",
    "openlayers",
    "eventbus",
    "modules/layer/list",
    "modules/core/util"
], function (Backbone, ol, EventBus, LayerList, Util) {
    "use strict";
    var RoutingModel = Backbone.Model.extend({
        /**
         *
         */
        defaults: {
            standort: "",
            projection: "",
            routeLayer: "", // Layer, in dem die Route dargestellt wird
            routenLayer: "", // WFS-Layer, der zum Abfragen der Routen verwendet wird
            verkehrslagelayer: "", // WFS-Layer, der zur Abfrage des LOS verwendet wird
            ziele: [],
            source: ""
        },
        /**
         *
         */
        initialize: function (response) {
            this.set("id", _.uniqueId("reisezeiten"));

            this.set("routenLayer", _.find(LayerList.models, function (layer) {
                return layer.id === "2713";
            }));
            this.set("verkehrslagelayer", _.find(LayerList.models, function (layer) {
                return layer.id === "2715";
            }));
            this.set("standort", response.Standort);
            EventBus.on("mapView:replyProjection", this.setProjection, this);
            EventBus.trigger("mapView:requestProjection");
            this.requestRouten();
            this.sortRouten();
        },
        /**
         * Sortiert das Array der übermittelten Routen in die Reihenfolge, wie sie im GFI angezeigt werden sollen.
         */
        sortRouten: function () {
            this.set("ziele", _.sortBy(this.get("ziele"), "zielort"));
        },
        /**
         * Fragt Layer mit Routeninformationen ab, um Template rendern zu können
         */
        requestRouten: function () {
            var layer = this.get("routenLayer"),
                standort = this.get("standort"),
                request_str = "<?xml version='1.0' encoding='UTF-8'?><wfs:GetFeature service='WFS' version='1.1.0' xmlns:app='http://www.deegree.org/app' xmlns:wfs='http://www.opengis.net/wfs' xmlns:gml='http://www.opengis.net/gml' xmlns:ogc='http://www.opengis.net/ogc' xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xsi:schemaLocation='http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/wfs.xsd'><wfs:Query typeName='app:reisezeit_routen'><Filter xmlns='http://www.opengis.net/ogc'><PropertyIsLike wildCard='*' singleChar='#' escapeChar='!'><PropertyName>app:start_ort</PropertyName><Literal>" + standort + "</Literal></PropertyIsLike></Filter></wfs:Query></wfs:GetFeature>";

            Util.showLoader();
            $.ajax({
                url: Util.getProxyURL(layer.get("url")),
                data: request_str,
                headers: {
                    "Content-Type": "text/xml; charset=UTF-8"
                },
                cache: false,
                context: this,
                async: false,
                method: "POST",
                dataType: "xml",
                complete: function () {
                    Util.hideLoader();
                },
                success: function (data) {
                    var hits = $("wfs\\:FeatureCollection,FeatureCollection", data),
                        routen = $(hits).find("app\\:reisezeit_routen,reisezeit_routen"),
                        ziele = [];

                    _.each(routen, function (route) {
                        var zielort = $(route).find("app\\:ziel_ort,ziel_ort")[0].textContent,
                            anzeige = $(route).find("app\\:anzeige,anzeige")[0].textContent,
                            routenid = $(route).find("app\\:id,id")[0].textContent;

                        ziele.push({
                            zielort: zielort,
                            anzeige: anzeige,
                            routenid: routenid
                        });
                    });
                    this.set("ziele", ziele);
                },
                error: function () {
                    // TODO
                }
            });
        },
        setProjection: function (proj) {
            this.set("projection", proj);
        },
        /**
         * Erzeugt einen leeren VactorLayer mit default-style
         */
        createRouteLayer: function () {
            this.set("routeLayer", new ol.layer.Vector({
                source: new ol.source.Vector({
                    projection: this.get("projection")
                }),
                style: new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: "blue",
                        width: 5
                    })
                })
            }));
        },
        /**
         * Enfernt den "Route-Layer" von der Karte.
         */
        clearRoute: function () {
            this.get("routeLayer").getSource().clear();
            EventBus.trigger("removeLayer", this.get("routeLayer"));
            this.set("routeLayer", '');
        },
        /*
         * Fragt Layer mit LevelOfService Info ab, um Geometrien anzeigen zu können
         */
        requestVerkehrslagelayer: function (routenid) {
            var layer = this.get("routenLayer"),
                request_str = "<?xml version='1.0' encoding='UTF-8'?><wfs:GetFeature service='WFS' version='1.1.0' xmlns:app='http://www.deegree.org/app' xmlns:wfs='http://www.opengis.net/wfs' xmlns:gml='http://www.opengis.net/gml' xmlns:ogc='http://www.opengis.net/ogc' xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xsi:schemaLocation='http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/wfs.xsd'><wfs:Query typeName='app:reisezeit_verkehrslage'><Filter xmlns='http://www.opengis.net/ogc'><PropertyIsLike wildCard='*' singleChar='#' escapeChar='!'><PropertyName>app:route_id</PropertyName><Literal>" + routenid + "</Literal></PropertyIsLike></Filter></wfs:Query></wfs:GetFeature>";

            Util.showLoader();
            $.ajax({
                url: Util.getProxyURL(layer.get("url")),
                data: request_str,
                headers: {
                    "Content-Type": "text/xml; charset=UTF-8"
                },
                cache: false,
                context: this,
                async: false,
                method: "POST",
                dataType: "xml",
                complete: function () {
                    Util.hideLoader();
                },
                success: function (data) {
                    var wfsReader = new ol.format.WFS({
                            featureNS: this.get("verkehrslagelayer").get("featureNS"),
                            featureType: this.get("verkehrslagelayer").get("featureType")
                        }),
                        src = new ol.source.Vector();

                    src.addFeatures(wfsReader.readFeatures(data));
                    this.set("source", src);
                },
                error: function () {
                    // TODO
                }
            });
        },
        /**
         * Zeigt die ausgewählte Route.
         * @param  {String} target - Ziel der Route
         */
        showRoute: function (routeId) {
            var strokestyle,
                features = [],
                source;

            this.requestVerkehrslagelayer(routeId);
            source = this.get("source");
            this.createRouteLayer();
            _.each(source.getFeatures(), function (feature) {
                switch (feature.get("farbe")) {
                    case "rot": {
                        strokestyle = new ol.style.Stroke({
                            color: [255, 0, 0],
                            width: 5
                        });
                        break;
                    }
                    case "gelb": {
                        strokestyle = new ol.style.Stroke({
                            color: [255, 255, 0],
                            width: 5
                        });
                        break;
                    }
                    case "schwarz": {
                        strokestyle = new ol.style.Stroke({
                            color: [0, 0, 0],
                            width: 5
                        });
                        break;
                    }
                    // grün
                    default: {
                        strokestyle = new ol.style.Stroke({
                            color: [0, 255, 0],
                            width: 5
                        });
                        break;
                    }
                }
                feature.setStyle(new ol.style.Style({
                    stroke: strokestyle
                }));
            });
            console.log(source.getFeatures());
            this.set("source", source);
            this.get("routeLayer").setSource(source);
            EventBus.trigger("addLayer", this.get("routeLayer"));
//            EventBus.trigger("zoomToExtent", features.getGeometries().getExtent());
        },
        /*
         * Zerstört das Modul vollständig.
         */
        destroy: function () {
            this.clearRoute();
            this.unbind();
            this.clear({silent: true});
        }
    });
    return RoutingModel;
});
