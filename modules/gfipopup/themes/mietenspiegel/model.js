define([
    "backbone",
    "config",
    "modules/core/util",
    "bootstrap/dropdown",
    "bootstrap/button",
    "bootstrap/collapse"
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
            msMerkmaleText: [],
            msMerkmale: {},
            msMittelwert: '',
            msSpanneMin: '',
            msSpanneMax: '',
            msDatensaetze: '> 30'
        },
        /*
         * Initialize wird immer ausgeführt, auch wenn kein mietenspiegel angezeigt wird.
         * Deshalb prüfen, ob Layerdefinition im Config mit gfiTheme: mietenspiegel gesetzt.
         */
        initialize: function () {
            var ms = _.find(Config.layerIDs, function(layer) {
                if (_.values(_.pick(layer, 'gfiTheme'))[0] === 'mietenspiegel') {
                    return true;
                }
            });
            if (ms) {
                this.ladeDaten();
                this.calculateMerkmale();
            }
        },
        /*
         * Lese Mietenspiegel-Daten aus.
         */
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
                    var datum = $(data).find('erhebungsstand').text().split('-');
                    this.set('msErhebungsstand', datum[2] + '.' + datum[1] + '.' + datum[0]);
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
        /*
         * Bestimmt alle Inhalte der Comboboxen für die Merkmale anhand der ausgelesenen Daten.
         */
        calculateMerkmale: function() {
            var daten = this.get('msDaten'),
                merkmalnamen = _.object(_.keys(daten[0].merkmale), []);
            var merkmale = _.map(daten, function(value, key){
                return value.merkmale;
            });
            var merkmaleReduced = _.mapObject(merkmalnamen, function(value, key) {
                return _.unique(_.pluck(merkmale, key));
            });
            this.set('msMerkmale', merkmaleReduced);
        },
        /*
         * Berechnet die Vergleichsmiete anhand der gesetzten Merkmale aus msDaten
         */
        calculateVergleichsmiete: function(merkmale) {
            var vergleichsmiete = _.find(this.get('msDaten'), function(item) {
                var tester = [], uniq;
                _.each(merkmale, function(merkmal, index, list) {
                    var result = _.values(_.pick(item.merkmale, merkmal.name))[0];
                    if (result === merkmal.value) {
                        tester.push(true);
                    } else {
                        tester.push(false);
                    }
                });
                uniq = _.uniq(tester);
                if (uniq.length === 1 && uniq[0] === true) {
                    return item;
                }
            }, this);
            if (vergleichsmiete) {
                this.set('msMittelwert', vergleichsmiete.mittelwert.toString());
                this.set('msSpanneMin', vergleichsmiete.spanne_min.toString());
                this.set('msSpanneMax', vergleichsmiete.spanne_max.toString());
                if (vergleichsmiete.datensaetze > 0) {
                    this.set('msDatensaetze', vergleichsmiete.datensaetze);
                } else {
                    this.set('msDatensaetze', '> 30');
                }
            } else {
                this.set('msMittelwert', '-');
                this.set('msSpanneMin', '-');
                this.set('msSpanneMax', '-');
                this.set('msDatensaetze', '-');
            }
        },
        reset: function (layer, response) {
            this.set('id', _.uniqueId("mietenspiegelTheme"));
            this.set('layer', layer);
            this.set('gfiContent', response);
        }
    });

    return new GFIModel;
});
