define([
    "backbone",
    "config",
    "modules/core/util"
], function (Backbone, Config, Util) {
    "use strict";
    var GFIModel = Backbone.Model.extend({
        /**
         * Das Model des Mietenspiegels instanziiert sich einmalig sofort.
         */
        defaults: {
            readyState: false,
            msDaten: [],
            msErhebungsstand: '',
            msHerausgeber: '',
            msHinweis: '',
            msTitel: '',
            msMerkmaleText: []
        },

        initialize: function () {
            this.ladeDaten();
        },
        ladeDaten: function() {
            // lade Mietenspiegel-Metadaten
            $.ajax({
                url: Util.getProxyURL('http://wscd0096/fachdaten_public/services/wfs_hh_mietenspiegel'),
                data: 'REQUEST=GetFeature&SERVICE=WFS&VERSION=1.1.0&TYPENAME=app:mietenspiegel_metadaten',
                async: false,
                type: "GET",
                dataType: 'xml',
                context: this,
                success: function (data) {
                    this.set('mietenspiegel-metadaten', data);
                    this.set('msErhebungsstand', $(data).find('erhebungsstand').text());
                    this.set('msHerausgeber', $(data).find('herausgeber').text());
                    this.set('msHinweis', $(data).find('hinweis').text());
                    this.set('msTitel', $(data).find('titel').text());
                    this.set('msMerkmaleText', $(data).find('merkmaletext').text().split('|'));
                },
                error: function (jqXHR, errorText, error) {
                    alert("Fehler beim Laden von Daten: \n" + errorText + error);
                }
            });
            // Lade Mietenspiegel-Daten
            $.ajax({
                url: Util.getProxyURL('http://wscd0096/fachdaten_public/services/wfs_hh_mietenspiegel'),
                data: 'REQUEST=GetFeature&SERVICE=WFS&VERSION=1.1.0&TYPENAME=app:mietenspiegel_daten',
                async: false,
                type: "GET",
                context: this,
                success: function (data) {
                    var daten = [];
                    var keys = this.get('msMerkmaleText');
                    $(data).find('mietenspiegel_daten').each(function (index, value) {
                        daten.push({
                            mittelwert: parseFloat($(value).find('mittelwert').text()),
                            spanne_min: parseFloat($(value).find('spanne_min').text()),
                            spanne_max: parseFloat($(value).find('spanne_max').text()),
                            datensaetze: parseInt($(value).find('datensaetze').text()),
                            merkmale: _.object(keys, $(value).find('merkmale').text().split('|'))
                        });
                    });
                    this.set('msDaten', daten);
                    // Prüfe den Ladevorgang
                    if (daten.length > 0 && this.get('msTitel') !== '') {
                        this.set('readyState', true);
                    }
                },
                error: function (jqXHR, errorText, error) {
                    alert("Fehler beim Laden von Daten: \n" + errorText + error);
                }
            });
        },
        reset: function (layer, response) {
            this.set('id', _.uniqueId("defaultTheme"));
            this.set('layer', layer);
            this.set('gfiContent', response);
        }
    });

    return new GFIModel();
});
