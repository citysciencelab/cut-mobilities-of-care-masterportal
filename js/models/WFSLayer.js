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
            var layerIDs = _.find(Config.layerIDs, function(num) {return num.id === id});
            this.set('styleId', layerIDs.style);
            this.set('clusterDistance', layerIDs.clusterDistance);
            this.set('searchField', layerIDs.searchField);
            this.set('styleField', layerIDs.styleField);
            this.set('styleLabelField', layerIDs.styleLabelField);
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
            $('#loader').show();
            $.ajax({
                url: Config.proxyURL + '?url=' + encodeURIComponent(getrequest),
                async: false,
                context: this,
                success: function (data, textStatus, jqXHR) {
                    $('#loader').hide();
                    var docEle = data.documentElement.nodeName;
                    if (docEle.indexOf('Exception') != -1) {
                        alert('Fehlermeldung beim Laden von Daten: \n' + jqXHR.responseText);
                        return;
                    }
                    pServerVector.addFeatures(pServerVector.readFeatures(data));
                    this.styling(pServerVector, layerIDs);
                },
                error: function (data, textStatus, jqXHR) {
                    $('#loader').hide();
                    alert('Fehlermeldung beim Laden von Daten: \n' + data.responseText);
                }
            });
        },
        styling: function (pServerVector, layerIDs) {
            // NOTE Hier werden die Styles zugeordnet
            if(this.get('styleField') && this.get('styleField') != '') {
                if (this.get('clusterDistance') <= 0 || !this.get('clusterDistance')) {
                    if (this.get('styleLabelField') && this.get('styleLabelField') != '') {
                        //TODO
                    }
                    else {
                        this.setSimpleStyleForStyleField(pServerVector, layerIDs);
                    }
                }
                else {
                    if (this.get('styleLabelField') && this.get('styleLabelField') != '') {
                        //TODO
                    }
                    else {
                        this.setClusterStyleForStyleField(pServerVector, layerIDs);
                    }
                }
            }
            else {
                if (this.get('clusterDistance') <= 0 || !this.get('clusterDistance')) {
                    if (this.get('styleLabelField') && this.get('styleLabelField') != '') {
                        this.setSimpleCustomLabeledStyle(pServerVector, layerIDs);
                    }
                    else {
                        this.setSimpleStyle(pServerVector, layerIDs);
                    }
                }
                else {
                    if (this.get('styleLabelField') && this.get('styleLabelField') != '') {
                        this.getClusterStyle(pServerVector, layerIDs);
                    }
                    else {
                        this.setClusterStyle(pServerVector, layerIDs);
                    }
                }
            }
        },
        setSimpleCustomLabeledStyle: function (pServerVector, layerIDs) {
            this.set('source', pServerVector);
            this.set('style', function (feature, resolution) {
                var stylelistmodel = StyleList.returnModelById(layerIDs.style);
                try {
                    var label = _.values(_.pick(feature.getProperties(), layerIDs.styleLabelField))[0].toString();
                    return stylelistmodel.getCustomLabeledStyle(label);
                }
                catch (error) {
                    this.setSimpleStyle(pServerVector, layerIDs);
                }
            });
        },
        setSimpleStyleForStyleField: function (pServerVector, layerIDs) {
            this.set('source', pServerVector);
            this.set('style', function (feature, resolution) {
                var styleFieldValue = _.values(_.pick(feature.getProperties(), layerIDs.styleField))[0];
                var stylelistmodel = StyleList.returnModelByName(styleFieldValue);
                return stylelistmodel.getSimpleStyle();
            });
        },
        setClusterStyleForStyleField: function (pServerVector, layerIDs) {
            var pCluster = new ol.source.Cluster({
                source : pServerVector,
                distance : this.get('clusterDistance')
            });
            this.set('source', pCluster);
            this.set('style', function (feature, resolution) {
                var styleFieldValue = _.values(_.pick(feature.get('features')[0].getProperties(), layerIDs.styleField))[0];
                var stylelistmodel = StyleList.returnModelByName(styleFieldValue);
                return stylelistmodel.getClusterStyle(feature);
            });
        },
        setSimpleStyle: function (pServerVector, layerIDs) {
            var stylelistmodel = StyleList.returnModelById(layerIDs.style);
            this.set('source', pServerVector);
            this.set('style', stylelistmodel.getSimpleStyle());
        },
        setClusterStyle: function (pServerVector, layerIDs) {
            var stylelistmodel = StyleList.returnModelById(layerIDs.style);
            var pCluster = new ol.source.Cluster({
                source : pServerVector,
                distance : this.get('clusterDistance')
            });
            this.set('source', pCluster);
            this.set('style', function (feature, resolution) {
                return stylelistmodel.getClusterStyle(feature);
            });
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
