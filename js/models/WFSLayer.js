define([
    'underscore',
    'backbone',
    'openlayers',
    'eventbus',
    'config',
    'models/Layer',
    'collections/stylelist'

], function (_, Backbone, ol, EventBus, Config, Layer, StyleList) {
    // Definition der Projektion EPSG:25832
    ol.proj.addProjection(new ol.proj.Projection({
        code: 'EPSG:25832',
        units: 'm',
        extent: [265948.8191, 6421521.2254, 677786.3629, 7288831.7014],
        axisOrientation: 'enu', // default
        global: false  // default
    }));
    var proj25832 = ol.proj.get('EPSG:25832');
    proj25832.setExtent([265948.8191, 6421521.2254, 677786.3629, 7288831.7014]);
    /**
     *
     */
    var WFSLayer = Layer.extend({
        /**
         *
         */
        setAttributionLayerSource: function () {
            var getrequest = this.buildGetRequest();
            // Finde layerIDs zu dieser Layer-Id, hole Infos und weise sie dem Layer zu
            var id = this.get('id');
            var layerIDs = _.find(Config.layerIDs, function(num) {
                if (num.id == id) {
                    return num;
                }
            });
            if (!layerIDs) {
                alert('Layer ' + id + ' nicht konfiguriert.');
                return;
            }
            this.set('styleId', layerIDs.style);
            this.set('clusterDistance', layerIDs.clusterDistance);
            this.set('searchField', layerIDs.searchField);
            this.set('styleField', layerIDs.styleField);
            // Lade Daten der Datenquelle
            var pServerVector = new ol.source.ServerVector({
                format: new ol.format.WFS({
                    featureNS: this.get('featureNS'),
                    featureType: this.get('featureType')
                }),
                loader: function (extent, resolution, projection) {
                    // im Loader wird der Ajax-Request nicht bei Cluster aufgerufen, daher ausgelagert.
                },
                extractStyles: false,
                /* experimental in OL3
                strategy: ol.loadingstrategy.createTile(new ol.tilegrid.XYZ({
                    maxZoom: 19
                })),*/
                projection: proj25832 //'EPSG:25832'
            });
            $.ajax({
                url: 'http://wscd0096/cgi-bin/proxy.cgi?url=' + encodeURIComponent(getrequest),
                async: false,
                context: this,
                success: function (data, textStatus, jqXHR) {
                    var docEle = data.documentElement.nodeName;
                    if (docEle.indexOf('Exception') != -1) {
                        alert('Fehlermeldung beim Laden von Daten: \n' + jqXHR.responseText);
                    }
                    else {
                        pServerVector.addFeatures(pServerVector.readFeatures(data));
                        // hinzufügen der LayerId für MouseHover und wfsFeatureFilter
                        pServerVector.forEachFeature(function (ele) {
                            ele.layerId = this.get('id');
                        }, this);
                    }
                },
                error: function (data, textStatus, jqXHR) {
                    alert('Fehlermeldung beim Laden von Daten: \n' + data.responseText);
                }
            });
            // NOTE Hier werden die Styles zugeordnet
            if(this.get('styleField')) {
                if (this.get('clusterDistance') <= 0 || !this.get('clusterDistance')) {
                    this.set('source', pServerVector);
                    this.set('style', function (feature, resolution) {
                        var styleFieldValue = _.values(_.pick(feature.getProperties(), layerIDs.styleField))[0];
                        var stylelistmodel = StyleList.returnModelByName(styleFieldValue);
                        return stylelistmodel.getSimpleStyle();
                    });
                }
                else {
                    var pCluster = new ol.source.Cluster({
                        source : pServerVector,
                        distance : this.get('clusterDistance')
                    });
                    var size;
                    this.set('source', pCluster);
                    this.set('style', function (feature, resolution) {
                        var styleFieldValue = _.values(_.pick(feature.get('features')[0].getProperties(), layerIDs.styleField))[0];
                        var stylelistmodel = StyleList.returnModelByName(styleFieldValue);
                        return stylelistmodel.returnClusterStyle(feature);
                    });
                }
            }
            else {
                var stylelistmodel = StyleList.returnModelById(layerIDs.style);
                if (this.get('clusterDistance') <= 0 || !this.get('clusterDistance')) {
                    this.set('source', pServerVector);
                    this.set('style', stylelistmodel.getSimpleStyle());
                }
                else {
                    var pCluster = new ol.source.Cluster({
                        source : pServerVector,
                        distance : this.get('clusterDistance')
                    });
                    var styleCache = {};
                    this.set('source', pCluster);
                    this.set('style', function (feature, resolution) {
                        return stylelistmodel.returnClusterStyle(feature);
                    });
                }
//                console.log(stylelistmodel.getLabeledStyle('test'));
            }
        },
        /**
         *
         */
        setAttributionLayer: function () {
            this.set('layer', new ol.layer.Vector({
                source: this.get('source'),
                name: this.get('name'),
                typ: this.get('typ'),
                style: this.get('style'),
                gfiAttributes: this.get('gfiAttributes')
//                gfiAttributes: this.convertGFIAttributes()
            }));
        },
        buildGetRequest : function () {
            // Stelle GetRequest zusammen
            var getrequest = this.get('url')
                + '?REQUEST=GetFeature'
                + '&SERVICE=WFS'
                + '&TYPENAME=' + this.get('featureType');
            if (this.get('version') && this.get('version') !== '' && this.get('version') !== 'nicht vorhanden') {
                getrequest += '&VERSION=' + this.get('version');
            }
            else {
                getrequest += '&VERSION=1.1.0';
            }
            if (this.get('srsname') && this.get('srsname') !== '' && this.get('srsname') !== 'nicht vorhanden') {
                getrequest += '&SRSNAME=' + this.get('srsname');
            }
            else {
                getrequest += '&SRSNAME=EPSG:25832';
            }
            return getrequest;
        }
    });
    return WFSLayer;
});
