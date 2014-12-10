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
            // Finde wfsconfig zu dieser Layer-Id, hole Infos und weise sie dem Layer zu
            var id = this.get('id');
            var wfsconfig = _.find(Config.wfsconfig, function(num) {
                if (num.layer == id) {
                    return num;
                }
            });
            if (!wfsconfig) {
                alert('Layer ' + id + ' nicht konfiguriert.');
                return;
            }
            this.set('styleId', wfsconfig.style);
            this.set('clusterDistance', wfsconfig.clusterDistance);
            this.set('searchField', wfsconfig.searchField);
            this.set('styleField', wfsconfig.styleField);
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

            // Wenn styleField gesetzt ist, wird anhand des Arrays der möglichen Styles die Zuordnung getroffen
            if(this.get('styleField')){
                // Prüfe Symbolisierung nach ClusterDistance
                if (this.get('clusterDistance') <= 0 || !this.get('clusterDistance')) {
                    this.set('source', pServerVector);
                    // Lade Style
                    this.set('style', function (feature, resolution) {
                        var wfsStyle = new Array();
                        for(var i = 0; i<wfsconfig.style.length;i++){
                            style=_.find(StyleList.models, function (num) {
                                if (num.id == wfsconfig.style[i]) {
                                    return num;
                                }
                            });
                             wfsStyle.push(style);
                        }
                        for(var i = 0; i<wfsStyle.length;i++){
                            for(var j = 0; j<StyleList.models.length; j++){
                                if(feature.getProperties().features[0].values_.Kategorie==StyleList.models[j].attributes.name && StyleList.models[j].id==wfsStyle[i].id){
                                    feature.setStyle(wfsStyle[i].attributes.style[0]);
                                }
                                else{
                                    //alert('No Style found');
                                };
                            }
                        };
                    });
                }
                else {
                     // Lade Style
                    var pCluster = new ol.source.Cluster({
                        source : pServerVector,
                        distance : this.get('clusterDistance')
                    });
                    var size;
                    this.set('source', pCluster);
                    this.set('style', function (feature, resolution) {
                        var size;
                        var size = feature.get('features').length;
                            if (size != '1') {
                                var wfsStyle = new Array();
                                for(var i = 0; i<wfsconfig.style.length;i++){
                                    wfsStyle=_.find(StyleList.models, function (num) {
                                        if (num.id == id+"_cluster") {
                                            return num;
                                        }
                                    });
                                }
                                style=wfsStyle.getClusterSymbol(size);
                            }
                            else {
                                var wfsStyle = new Array();
                                for(var i = 0; i<wfsconfig.style.length;i++){
                                    style=_.find(StyleList.models, function (num) {
                                        if (num.id == wfsconfig.style[i]) {
                                            return num;
                                        }
                                    });
                                     wfsStyle.push(style);
                                }
                                for(var i = 0; i<wfsStyle.length;i++){
                                    for(var j = 0; j<StyleList.models.length; j++){
                                        if(feature.getProperties().features[0].values_.Kategorie==StyleList.models[j].attributes.name && StyleList.models[j].id==wfsStyle[i].id){
                                            feature.setStyle(wfsStyle[i].attributes.style[0]);
                                            return wfsStyle[i].attributes.style[0];
                                        }
                                        else{
                                            //alert('No Style found');
                                        };
                                    }
                                };
                            }
                        return style;
                    });
                }
            }
            else {
                // wenn Stylefield nicht gesetzt ist, werden alle Features identisch behandelt
                var stylelistmodel = _.find(StyleList.models, function (slmodel) {
                    if (slmodel.id == wfsconfig.style) {
                        return slmodel;
                    }
                });
                var pStyle = stylelistmodel.get('style');
                if (this.get('clusterDistance') <= 0 || !this.get('clusterDistance')) {
                    this.set('source', pServerVector);
                    this.set('style', pStyle);
                }
                else{
                    var pCluster = new ol.source.Cluster({
                        source : pServerVector,
                        distance : this.get('clusterDistance')
                    });
                    var styleCache = {};
                    this.set('source', pCluster);
                    this.set('style', function (feature, resolution) {
                        var size = feature.get('features').length;
                        var style = styleCache[size];
                        if (!style) {
                            if (size != '1') {
                                style = stylelistmodel.getClusterSymbol(size);
                            }
                            else {
                                style = pStyle;
                            }
                            styleCache[size] = style;
                        }
                        return style;
                    });
                }
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
        }
    });
    return WFSLayer;
});
