define([
    'underscore',
    'backbone',
    'openlayers',
    'eventbus',
    'config',
    'modules/layer/Layer',
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
        updateData: function () {
            $('#loader').show();
            this.buildGetRequest();
            $.ajax({
                url: this.get('url'),
                data: this.get('data'),
                async: true,
                type: "GET",
                context: this,
                success: function (data, textStatus, jqXHR) {
                    $('#loader').hide();
                    try {                        
                        var wfsReader = new ol.format.WFS({
                            featureNS : this.get('featureNS'),
                            featureType : this.get('featureType')
                        });
                        if (this.get('source').distance_) { // Erkennungszeichen für Clustersource
                            this.get('source').source_.addFeatures(wfsReader.readFeatures(data));
                        }
                        else {
                            this.get('source').addFeatures(wfsReader.readFeatures(data));
                        }
                    }
                    catch(e) {
                        alert('Fehlermeldung beim Laden von Daten: \n' + e.message);
                    }
                },
                error: function (data, textStatus, jqXHR) {
                    $('#loader').hide();
                    console.log(data);
                    alert('Fehler beim Laden von Daten: \n' + data.responseText);
                }
            });
        },
        setAttributionLayerSource: function () {
            // Finde layerIDs zu dieser Layer-Id, hole Infos und weise sie dem Layer zu
            var id = this.get('id');
            var layerIDs = _.find(Config.layerIDs, function(num) {return num.id === id});
            this.set('styleId', layerIDs.style);
            this.set('clusterDistance', layerIDs.clusterDistance);
            this.set('searchField', layerIDs.searchField);
            this.set('styleField', layerIDs.styleField);
            this.set('styleLabelField', layerIDs.styleLabelField);
            this.set('source', new ol.source.Vector({
                projection: proj25832,
                attributions: this.get('olAttribution')
            }));
            this.styling(this.get('source'), layerIDs);
        },
        /**
         * wird von Layer.js aufgerufen
         */
        setAttributionLayer: function () {
            this.set('layer', new ol.layer.Vector({
                source: this.get('source'),
                name: this.get('name'),
                typ: this.get('typ'),
                style: this.get('style'),
                gfiAttributes: this.get('gfiAttributes'),
                routable: this.get('routable')
            }))
            this.setVisibility();
        },
        setVisibility: function () {
            EventBus.trigger('returnBackboneLayerForSearchbar', this);
            var visibility = this.get('visibility');
            this.toggleEventAttribution(visibility);
            if (visibility === true) {
                if (this.get('layer').getSource().getFeatures().length === 0) {
                    this.updateData();
                }
                this.get('layer').setVisible(true);
            }
            else {
                this.get('layer').setVisible(false);
            }
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
                var label = _.values(_.pick(feature.getProperties(), layerIDs.styleLabelField))[0].toString();
                return stylelistmodel.getCustomLabeledStyle(label);
            });
        },
        setSimpleStyleForStyleField: function (pServerVector, layerIDs) {
            this.set('source', pServerVector);
            this.set('style', function (feature, resolution) {
                var styleFieldValue = _.values(_.pick(feature.getProperties(), layerIDs.styleField))[0];
                var stylelistmodel = StyleList.returnModelByValue(layerIDs.style, styleFieldValue);
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
                var size = feature.get('features').length;
                if (size > 1){
                	var stylelistmodel = StyleList.returnModelById(layerIDs.style + '_cluster');
                }
                if (!stylelistmodel) {
                    var stylelistmodel = StyleList.returnModelByValue(layerIDs.style, styleFieldValue);
                }
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
        buildGetRequest : function () {
            // Umwandeln der diensteAPI-URLs in lokale URL gemäß httpd.conf
            if (this.get('url').indexOf('http://WSCA0620.fhhnet.stadt.hamburg.de') != -1) {
                var newURL = this.get('url').replace('http://WSCA0620.fhhnet.stadt.hamburg.de', '/wsca0620');
            }
            else if (this.get('url').indexOf('http://bsu-ims.fhhnet.stadt.hamburg.de') != -1) {
                var newURL = this.get('url').replace('http://bsu-ims.fhhnet.stadt.hamburg.de', '/bsu-ims');
            }
            else if (this.get('url').indexOf('http://bsu-ims') != -1) {
                var newURL = this.get('url').replace('http://bsu-ims', '/bsu-ims');
            }
            else if (this.get('url').indexOf('http://bsu-uio.fhhnet.stadt.hamburg.de') != -1) {
                var newURL = this.get('url').replace('http://bsu-uio.fhhnet.stadt.hamburg.de', '/bsu-uio');
            }
            else if (this.get('url').indexOf('http://geofos.fhhnet.stadt.hamburg.de') != -1) {
                var newURL = this.get('url').replace('http://geofos.fhhnet.stadt.hamburg.de', '/geofos');
            }
            else if (this.get('url').indexOf('http://geofos') != -1) {
                var newURL = this.get('url').replace('http://geofos', '/geofos');
            }
            else if (this.get('url').indexOf('http://wscd0095') != -1) {
                var newURL = this.get('url').replace('http://wscd0095', '/geofos');
            }
            else if (this.get('url').indexOf('http://hmbtg.geronimus.info') != -1) {
                var newURL = this.get('url').replace('http://hmbtg.geronimus.info', '/hmbtg');
            }
            else if (this.get('url').indexOf('http://lgvfds01.fhhnet.stadt.hamburg.de') != -1) {
                var newURL = this.get('url').replace('http://lgvfds01.fhhnet.stadt.hamburg.de', '/lgvfds01');
            }
            else if (this.get('url').indexOf('http://lgvfds02.fhhnet.stadt.hamburg.de') != -1) {
                var newURL = this.get('url').replace('http://lgvfds02.fhhnet.stadt.hamburg.de', '/lgvfds02');
            }
            else if (this.get('url').indexOf('http://wsca0620.fhhnet.stadt.hamburg.de') != -1) {
                var newURL = this.get('url').replace('http://wsca0620.fhhnet.stadt.hamburg.de', '/wsca0620');
            }
            // ab hier Internet
			else if (this.get('url').indexOf('http://extmap.hbt.de') != -1) {
                var newURL = this.get('url').replace('http://extmap.hbt.de', '/extmap');
            }
			else if (this.get('url').indexOf('http://gateway.hamburg.de') != -1) {
                var newURL = this.get('url').replace('http://gateway.hamburg.de', '/gateway-hamburg');
            }
			else if (this.get('url').indexOf('http://geodienste-hamburg.de') != -1) {
                var newURL = this.get('url').replace('http://geodienste-hamburg.de', '/geodienste-hamburg');
            }

            this.set('url', newURL);
            var data = 'REQUEST=GetFeature'
                + '&SERVICE=WFS'
                + '&TYPENAME=' + this.get('featureType');
            if (this.get('version') && this.get('version') !== '' && this.get('version') !== 'nicht vorhanden') {
                data += '&VERSION=' + this.get('version');
            }
            else {
                data += '&VERSION=1.1.0';
            }
            if (this.get('srsname') && this.get('srsname') !== '' && this.get('srsname') !== 'nicht vorhanden') {
                data += '&SRSNAME=' + this.get('srsname');
            }
            else {
                data += '&SRSNAME=EPSG:25832';
            }
            this.set('data', data);
        }
    });
    return WFSLayer;
});
