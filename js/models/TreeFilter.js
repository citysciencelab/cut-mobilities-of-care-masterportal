define([
    'jquery',
    'underscore',
    'backbone',
    'eventbus',
    'config'
], function ($, _, Backbone, EventBus, Config) {

    var TreeFilter = Backbone.Model.extend({
        defaults: {
            filter: "",
            filterHits: "", // Filtertreffer
            errors: "",
            treeCategory: "keine Auswahl",  // Baumgattung
            treeType: "Alle Arten", // Baumart
            yearMin: "1914",    // Pflanzjahr von
            yearMax: "1985",    // Pflanzjahr bis
            diameterMin: "1",   // Kronendurchmesser[m] von
            diameterMax: "50",  // Kronendurchmesser[m] bis
            perimeterMin: "1",  // Stammumfang[cm] von
            perimeterMax: "100" // Stammumfang[cm] bis
        },
        url: '../../tree.json',
        initialize: function () {
            this.listenTo(this, 'change:SLDBody', this.updateStyleByID);
            this.listenTo(this, 'change:SLDBody', this.getFilterHits);
            this.set('layerID', '5182');

            this.fetch({
                cache: false,
                async: false,
                error: function (model, response) {
//                    console.log('Service Request failure');
                }
            });
        },
        parse: function (response) {
            this.set('trees', response.trees);
            // macht aus "Ailanthus / Götterbaum" = Götterbaum(Ailanthus) als extra Attribut in this.get('trees') für Gattung und Arten
            _.each(this.get('trees'), function (tree) {
                var split = tree.Gattung.split("/");
                var categorySplit;
                if (split[1] !== undefined) {
                    categorySplit = split[1].trim() + "(" + split[0].trim() + ")";
                }
                else {
                    categorySplit = split[0].trim();
                }
                tree['displayGattung'] = categorySplit;
                var treeArray = [];
                _.each(tree.Arten, function (type) {
                    var split = type.split("/");
                    var typeSplit;
                    if (split[1] !== undefined) {
                        typeSplit = split[1].trim() + "(" + split[0].trim() + ")";
                    }
                    else {
                        typeSplit = split[0].trim();
                    }
                    treeArray.push({species: type, display: typeSplit});
                });
                tree['Arten'] = treeArray
            }, this);
        },
        patterns: {
            digits: "[^0-9]" // any character except the range in brackets
        },
        validators: {
            minLength: function (value, minLength) {
                return value.length >= minLength;
            },
            maxLength: function (value, maxLength) {
                return value.length <= maxLength;
            },
            isLessThan: function (min, max) {
                return min <= max;
            },
            pattern: function (value, pattern) {
                return new RegExp(pattern, "gi").test(value) ? true : false;
            },
            hasCharacters: function (value) {
                return TreeFilter.prototype.validators.pattern(value, TreeFilter.prototype.patterns.digits);
            }
        },
        validate: function (attributes) {
            var errors = {};
            if (attributes.yearMax !== null && attributes.yearMin !== null) {
                if (this.validators.hasCharacters(attributes.yearMax) === true || this.validators.hasCharacters(attributes.yearMin) === true) {
                    errors.yearError = "Die Jahreszahl muss aus Ziffern bestehen";
                } else if (this.validators.minLength(attributes.yearMax, 4) === false || this.validators.minLength(attributes.yearMin, 4) === false) {
                    errors.yearError = "Bitte geben Sie eine vierstellige Zahl ein";
                } else if (this.validators.maxLength(attributes.yearMax, 4) === false || this.validators.maxLength(attributes.yearMin, 4) === false) {
                    errors.yearError = "Bitte geben Sie eine vierstellige Zahl ein";
                } else if (this.validators.isLessThan(attributes.yearMin, attributes.yearMax) === false) {
                    errors.yearError = "Logischer Fehler der Werte";
                }
            }
            this.set('errors', errors);
            if (_.isEmpty(errors) === false) {
                return errors;
            }
        },
        setCategory: function () {
            this.set('treeCategory', $('#treeCategory').val());
        },
        setFilterParams: function () {  // NOTE aufbröseln in einzelMethoden
            this.set('treeCategory', $('#treeCategory').val());
            this.set('treeType', $('#treeType').val());
            this.set('yearMax', $('#yearMax > input').val());
            this.set('yearMin', $('#yearMin > input').val());
            this.set('diameterMax', $('#diameterMax > input').val());
            this.set('diameterMin', $('#diameterMin > input').val());
            this.set('perimeterMax', $('#perimeterMax > input').val());
            this.set('perimeterMin', $('#perimeterMin > input').val());

            if (this.isValid() === true) {
                this.createFilter();
            }
        },
        updateStyleByID: function () {
            EventBus.trigger('updateStyleByID', [this.get('layerID'), this.get('SLDBody')]);
        },
        removeFilter: function () {
            this.set('SLDBody', '');
        },
        createFilter: function () {
            var filterCategory, filterType, filterYear, filterDiameter, filterPerimeter;

            // Filter Gattung und Art
            if ($('#treeCategory').val() !== "keine Auswahl") {
                filterCategory = '<ogc:PropertyIsEqualTo><ogc:PropertyName>app:botanischer_name</ogc:PropertyName><ogc:Literal>' + this.get('treeCategory') + '</ogc:Literal></ogc:PropertyIsEqualTo>';
                if ($('#treeType').val() !== "Alle Arten") {
                    filterType = '<ogc:PropertyIsEqualTo><ogc:PropertyName>app:baumart</ogc:PropertyName><ogc:Literal>' + this.get('treeType') + '</ogc:Literal></ogc:PropertyIsEqualTo>';
                } else {
                    filterType = '';
                }
            } else {
                filterCategory = '';
                filterType = '';
            }

            // Filter Pflanzjahr
            filterYear = '<ogc:PropertyIsBetween><ogc:PropertyName>app:pflanzjahr</ogc:PropertyName><ogc:LowerBoundary><ogc:Literal>' + this.get("yearMin") + '</ogc:Literal></ogc:LowerBoundary><ogc:UpperBoundary><ogc:Literal>' + this.get("yearMax") + '</ogc:Literal></ogc:UpperBoundary></ogc:PropertyIsBetween>';
            filterDiameter = '<ogc:PropertyIsBetween><ogc:PropertyName>app:kronendmzahl</ogc:PropertyName><ogc:LowerBoundary><ogc:Literal>' + this.get("diameterMin") + '</ogc:Literal></ogc:LowerBoundary><ogc:UpperBoundary><ogc:Literal>' + this.get("diameterMax") + '</ogc:Literal></ogc:UpperBoundary></ogc:PropertyIsBetween>';
            filterPerimeter = '<ogc:PropertyIsBetween><ogc:PropertyName>app:stammumfangzahl</ogc:PropertyName><ogc:LowerBoundary><ogc:Literal>' + this.get("perimeterMin") + '</ogc:Literal></ogc:LowerBoundary><ogc:UpperBoundary><ogc:Literal>' + this.get("perimeterMax") + '</ogc:Literal></ogc:UpperBoundary></ogc:PropertyIsBetween>';

            var header = "<sld:StyledLayerDescriptor xmlns:sld='http://www.opengis.net/sld' xmlns:se='http://www.opengis.net/se' xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:app='http://www.deegree.org/app' xmlns:ogc='http://www.opengis.net/ogc' xmlns='http://www.opengis.net/sld' version='1.1.0' xsi:schemaLocation='http://www.opengis.net/sld http://schemas.opengis.net/sld/1.1.0/StyledLayerDescriptor.xsd'><sld:NamedLayer><se:Name>strassenbaum</se:Name><sld:UserStyle><se:FeatureTypeStyle><se:Rule>";
            var scaleDenominator = "<MinScaleDenominator>0</MinScaleDenominator><MaxScaleDenominator>8000</MaxScaleDenominator>";
            var filter = "<ogc:Filter><ogc:And>" + filterYear + filterDiameter + filterPerimeter + "</ogc:And></ogc:Filter>";
            var symbolizer = "<se:PointSymbolizer><se:Graphic><se:Mark><se:WellKnownName>circle</se:WellKnownName><se:Fill><se:SvgParameter name='fill'>#55c61d</se:SvgParameter><se:SvgParameter name='fill-opacity'>0.78</se:SvgParameter></se:Fill><se:Stroke><se:SvgParameter name='stroke'>#36a002</se:SvgParameter><se:SvgParameter name='stroke-width'>1</se:SvgParameter></se:Stroke></se:Mark><se:Size>12</se:Size></se:Graphic></se:PointSymbolizer></se:Rule>";

//            var scaleDenominator2 = "<se:Rule><MinScaleDenominator>0</MinScaleDenominator><MaxScaleDenominator>8000</MaxScaleDenominator>";
//            var filter2 = "<ogc:Filter><ogc:And>" + filterYear + filterDiameter + filterPerimeter + "<ogc:PropertyIsGreaterThanOrEqualTo><ogc:PropertyName>app:kronendmzahl</ogc:PropertyName><ogc:Literal>3</ogc:Literal></ogc:PropertyIsGreaterThanOrEqualTo><ogc:PropertyIsLessThanOrEqualTo><ogc:PropertyName>app:kronendmzahl</ogc:PropertyName><ogc:Literal>5</ogc:Literal></ogc:PropertyIsLessThanOrEqualTo></ogc:And></ogc:Filter>";
//            var symbolizer2 = "<se:PointSymbolizer uom='Meter'><se:Graphic><se:Mark><se:WellKnownName>circle</se:WellKnownName><se:Fill><se:SvgParameter name='fill'>#a5ed81</se:SvgParameter><se:SvgParameter name='fill-opacity'>0.78</se:SvgParameter></se:Fill><se:Stroke><se:SvgParameter name='stroke'>#a5ed81</se:SvgParameter><se:SvgParameter name='stroke-width'>1</se:SvgParameter></se:Stroke></se:Mark><se:Size>5</se:Size></se:Graphic></se:PointSymbolizer></se:Rule>";
//
//            var scaleDenominator3 = "<se:Rule><MinScaleDenominator>0</MinScaleDenominator><MaxScaleDenominator>8000</MaxScaleDenominator>";
//            var filter3 = "<ogc:Filter><ogc:And>" + filterYear + filterDiameter + filterPerimeter + "<ogc:PropertyIsBetween><ogc:PropertyName>app:kronendmzahl</ogc:PropertyName><ogc:LowerBoundary><ogc:Literal>6</ogc:Literal></ogc:LowerBoundary><ogc:UpperBoundary><ogc:Literal>9</ogc:Literal></ogc:UpperBoundary></ogc:PropertyIsBetween></ogc:And></ogc:Filter>";
//            var symbolizer3 = "<se:PointSymbolizer uom='Meter'><se:Graphic><se:Mark><se:WellKnownName>circle</se:WellKnownName><se:Fill><se:SvgParameter name='fill'>#6be72c</se:SvgParameter><se:SvgParameter name='fill-opacity'>0.78</se:SvgParameter></se:Fill><se:Stroke><se:SvgParameter name='stroke'>#6be72c</se:SvgParameter><se:SvgParameter name='stroke-width'>1</se:SvgParameter></se:Stroke></se:Mark><se:Size>9</se:Size></se:Graphic></se:PointSymbolizer></se:Rule>";
//
//            var scaleDenominator4 = "<se:Rule><MinScaleDenominator>0</MinScaleDenominator><MaxScaleDenominator>8000</MaxScaleDenominator>";
//            var filter4 = "<ogc:Filter><ogc:And>" + filterYear + filterDiameter + filterPerimeter + "<ogc:PropertyIsBetween><ogc:PropertyName>app:kronendmzahl</ogc:PropertyName><ogc:LowerBoundary><ogc:Literal>10</ogc:Literal></ogc:LowerBoundary><ogc:UpperBoundary><ogc:Literal>13</ogc:Literal></ogc:UpperBoundary></ogc:PropertyIsBetween></ogc:And></ogc:Filter>";
//            var symbolizer4 = "<se:PointSymbolizer uom='Meter'><se:Graphic><se:Mark><se:WellKnownName>circle</se:WellKnownName><se:Fill><se:SvgParameter name='fill'>#4bce0a</se:SvgParameter><se:SvgParameter name='fill-opacity'>0.78</se:SvgParameter></se:Fill><se:Stroke><se:SvgParameter name='stroke'>#4bce0a</se:SvgParameter><se:SvgParameter name='stroke-width'>1</se:SvgParameter></se:Stroke></se:Mark><se:Size>12</se:Size></se:Graphic></se:PointSymbolizer></se:Rule>";
//

            var footer = "</se:FeatureTypeStyle></sld:UserStyle></sld:NamedLayer></sld:StyledLayerDescriptor>";

            var filterwfs = "<ogc:Filter><ogc:And>" + filterYear + filterDiameter + filterPerimeter + "</ogc:And></ogc:Filter>";


            this.set('filter', filterwfs);
            this.set('SLDBody', header + filter + symbolizer + footer);
        },
        getFilterHits: function () {
            $('#loader').show();
            $.ajax({
                url: Config.proxyURL + "?url=http://wscd0096/fachdaten_public/services/wfs_hh_strassenbaumkataster",
                data: '<?xml version="1.0" encoding="UTF-8"?><wfs:GetFeature version="1.1.0" resultType="hits" xmlns:app="http://www.deegree.org/app" xmlns:wfs="http://www.opengis.net/wfs" xmlns:gml="http://www.opengis.net/gml" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/wfs.xsd"><wfs:Query typeName="app:strassenbaumkataster">' + this.get('filter') + '</wfs:Query></wfs:GetFeature>',
                type: 'POST',
                context: this,  // model
                contentType: "text/xml",
                success: function (data) {
                    var hits;
                     // Firefox, IE
                    if (data.getElementsByTagName("wfs:FeatureCollection") !== undefined) {
                        hits = data.getElementsByTagName('wfs:FeatureCollection')[0].getAttribute('numberOfFeatures');
                    }
                    // WebKit
                    else if (data.getElementsByTagName("FeatureCollection") !== undefined) {
                        hits = data.getElementsByTagName('FeatureCollection')[0].getAttribute('numberOfFeatures');
                    }
                    this.set('filterHits', hits);
                    $('#loader').hide();
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log(xhr.status);
                    console.log(thrownError);
                    $('#loader').hide();
                }
            });
        }
    });

    return new TreeFilter();
});
