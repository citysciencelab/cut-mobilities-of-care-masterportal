define([
    'backbone',
    'eventbus',
    'config',
    'collections/LayerList'
], function (Backbone, EventBus, Config, LayerList) {

    var aktualisiereVerkehrsdaten = Backbone.Model.extend({
        initialize: function () {
            var url;
            EventBus.on('aktualisiereverkehrsnetz', this.refreshVerkehrssituation, this);
            _.each(LayerList.models, function (layerdef) {
                if (layerdef.id === '45') {
                    //layer 45 hat gleiche URL und wurde geladen.
                    url = layerdef.get('url');
                    url = url.replace('http://geofos.fhhnet.stadt.hamburg.de', locations.host + '/geofos');
                    url = url.replace('http://geofos', locations.host + '/geofos');
                    url = url.replace('http://geodienste-hamburg.de', locations.host + '/geodienste-hamburg');
                }
            });
            this.set('url', url);
//            EventBus.on('aktualisierebaustellen', this.refreshBaustellen, this);
        },
        refreshVerkehrssituation: function (attributions, layer) {
            if (!layer) {
                return
            }
            var newEventValue= '';
            var postmessage = '<wfs:GetFeature xmlns:wfs="http://www.opengis.net/wfs" service="WFS" version="1.1.0" xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/wfs.xsd" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">';
            postmessage += '<wfs:Query typeName="feature:bab_vkl" srsName="epsg:25832">';
            postmessage += '<ogc:Filter xmlns:ogc="http://www.opengis.net/ogc">';
            postmessage += '<ogc:PropertyIsLessThan>';
            postmessage += '<ogc:PropertyName>vkl_id</ogc:PropertyName>';
            postmessage += '<ogc:Literal>2</ogc:Literal>';
            postmessage += '</ogc:PropertyIsLessThan>';
            postmessage += '</ogc:Filter>';
            postmessage += '</wfs:Query>';
            postmessage += '</wfs:GetFeature>';
            var url = this.get('url');
            // diese Abfrage füllt die Attribution
            $.ajax({
                url: url,
                type: 'POST',
                data: postmessage,
                headers: {
                    "Content-Type": "application/xml; charset=UTF-8"
                },
                success: function (data) {
                    if (data.getElementsByTagName('gml:featureMember')[0]) {
                        var nodeList = data.getElementsByTagName('gml:featureMember')[0].childNodes[0].nextSibling.childNodes;
                        var node = _.filter(nodeList, function (element) {
                            return element.localName === "received";
                        });
                    }
                    if (data.getElementsByTagName('featureMember')[0]) {
                        var nodeList = data.getElementsByTagName('featureMember')[0].childNodes[0].nextSibling.childNodes;
                        var node = _.filter(nodeList, function (element) {
                            return element.localName === "received";
                        });
                    }
                    if (node && node[0]) {
                        newEventValue = '<strong>aktuelle Meldungen der TBZ:</strong></br>Aktualität: ' + node[0].textContent.trim().replace('T', ' ').substring(0, node[0].textContent.length - 3) + '</br>';
                        this.set('eventValue', newEventValue);
                    }
                },
                context: layer,
                error: function (err) {
                    this.set('eventValue', '');
                }
            });
            // diese Abfrage zeigt im Bedarfsfall eine Meldung
            $.ajax({
                url: url,
                data: 'SERVICE=WFS&REQUEST=GetFeature&TYPENAME=vkl_hinweis&VERSION=1.1.0',
                async: true,
                context: layer,
                success: function (data, textStatus, jqXHR) {
                    var wfsReader = new ol.format.WFS({
                        featureNS : 'http://www.deegree.org/app',
                        featureType : 'vkl_hinweis'
                    });
                    try {
						var feature = wfsReader.readFeatures(data)[0];
						var hinweis = feature.get('hinweis');
                        var datum =  feature.get('stand');
                        if (hinweis && datum) {
                            newEventValue = newEventValue + '<p class="alert alert-danger"><strong>' + hinweis + '</strong></p>';
                            var html = '<div class="alert alert-warning alert-dismissible" role="alert" style="position: absolute; left: 25%; bottom: 50px;width: 50%;">';
                            html += '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times';
                            html += '</span></button>';
                            html += '<strong>Tunnelbetrieb Hamburg: </strong>' + hinweis + ' (' + datum + ')';
                            html += '</div>';
                            $('body').append(html);
                        }
					}
					catch (err) {
						return;
					}
                },
                error: function (data, textStatus, jqXHR) {
                    var html = '<div class="alert alert-info alert-dismissible" role="alert" style="position: absolute; left: 25%; bottom: 50px;width: 50%;">';
                    html += '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times';
                    html += '</span></button>';
                    html += '<strong>Verkehrsmeldungen </strong>der TBZ momentan nicht verfügbar.';
                    html += '</div>';
                    $('body').append(html);
                }
            });
        }/*,
        refreshBaustellen: function (attributions, layer) {
            if (!layer) {
                return
            }
            layer.set('eventValue', '<strong>aktuelle Baustellen:</strong></br><p><a href="http://geoportal-hamburg.de/verkehr/static/baustellenliste.htm" target="_blank">Liste anzeigen</a></p>');
        }*/
    });
    return aktualisiereVerkehrsdaten;
});
