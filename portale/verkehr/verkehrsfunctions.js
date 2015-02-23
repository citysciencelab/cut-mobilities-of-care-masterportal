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
                    //layer 45 hat gleiche URL
                    url = layerdef.get('url');
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
            $.ajax({
                url: Config.proxyURL + "?url=" + url,
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
                        if (node[0]) {
                            newEventValue = '<strong>Verkehrslage der TBZ:</strong></br><p>Aktualität: ' + node[0].textContent.trim().replace('T', ' ').substring(0, node[0].textContent.length - 3) + '</p>';
                        }
                    }
                    $.ajax({
                        url: Config.proxyURL + '?url=' + url + encodeURIComponent('?SERVICE=WFS&REQUEST=GetFeature&TYPENAME=vkl_hinweis&VERSION=1.1.0'),
                        async: true,
                        context: layer,
                        success: function (data, textStatus, jqXHR) {
                            if (data.getElementsByTagName('wfs:FeatureCollection')[0]) {
                                var nodeList = data.getElementsByTagName('wfs:FeatureCollection')[0].childNodes[0];//.nextSibling.childNodes;
                                if (nodeList[0]) {
                                    newEventValue = newEventValue + '<strong>' + nodeList[0].textContent.trim() + '</strong>';
                                }
                            }
                            this.set('eventValue', newEventValue);
                        },
                        error: function (data, textStatus, jqXHR) {
                            this.set('eventValue', newEventValue);
                        }
                    });
                },
                context: layer,
                error: function (err) {
//                    alert('Dienst zur Darstellung der Aktualität derzeit gestört.');
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
