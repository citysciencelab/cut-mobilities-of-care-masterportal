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
            treeCategory: "",  // Baumgattung
            treeType: "", // Baumart
            yearMin: "1914",    // Pflanzjahr von
            yearMax: "1985",    // Pflanzjahr bis
            diameterMin: "1",   // Kronendurchmesser[m] von
            diameterMax: "50",  // Kronendurchmesser[m] bis
            perimeterMin: "1",  // Stammumfang[cm] von
            perimeterMax: "100", // Stammumfang[cm] bis
            searchCategoryString: "",   // Treffer für die Vorschalgsuche der Baumgattung
            searchTypeString: ""    // Treffer für die Vorschalgsuche der Baumart
        },
        url: '../../tree.json',
        initialize: function () {
            this.listenTo(this, 'change:searchCategoryString', this.setCategoryArray);
            this.listenTo(this, 'change:treeCategory', this.setTypeArray);
            this.listenTo(this, 'change:searchTypeString', this.setTypeArray);
            this.listenTo(this, 'change:SLDBody', this.updateStyleByID);
            this.listenTo(this, 'change:SLDBody', this.getFilterHits);
            this.set('layerID', '5182');

            this.fetch({
                cache: false,
                async: false,
                error: function (model, response) {
//                    console.log('Service Request failure');
                },
                success: function (model, response) {
                    // speichert alle Baumgattung in ein Array
                    var catArray = [];
                    _.each(model.get('trees'), function(tree, index) {
                        catArray.push(tree.displayGattung);
                    }, model);
                    model.set('categoryArray', catArray);
                    model.set('typeArray', []);  // speichert später jeweils zur Category die Types
                }
            });
        },
        parse: function (response) {
            this.set('trees', response.trees);
            // macht aus "Ailanthus / Götterbaum" = Götterbaum(Ailanthus)
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
                // Arten nach den deutschen Namen sortierien
                tree['Arten'] = _.sortBy(treeArray, function(type) { return type.display});
            }, this);
            // Bäume nach Gattung sortieren
            this.set('trees', _.sortBy(this.get('trees'), function (tree) { return tree.displayGattung }));
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
            this.set('treeCategory', $('#categoryInput').val());
        },
        setSearchCategoryString: function (value) {
            this.set('searchCategoryString', value);
            $('#categoryInput').val(this.get('searchCategoryString'));
        },
        setCategoryArray: function () {
            var catArray = [];
            _.each(this.get('trees'), function(tree, index) {
                if(tree.displayGattung.indexOf(this.get('searchCategoryString')) !== -1) {
                    catArray.push(tree.displayGattung);
                }
            }, this);
            if (catArray.length === 0) {
                catArray.push("Keine Treffer");
            }
            this.set('categoryArray', catArray);
        },
        setType: function () {
            this.set('treeType', $('#typeInput').val());
        },
        setSearchTypeString: function (value) {
            this.set('searchTypeString', value);
            $('#typeInput').val(this.get('searchTypeString'));
        },
        setTypeArray: function () {
            var typeArray = [];
            var tree = _.where(this.get('trees'), {displayGattung: this.get('treeCategory')});
            if (tree[0] !== undefined) {
                _.each(tree[0].Arten, function(type, index) {
                    if (this.get('searchTypeString').length === 0) {
                        typeArray.push(type.display);
                    }
                    else {
                        if(type.display.indexOf(this.get('searchTypeString')) !== -1) {
                            typeArray.push(type.display);
                        }
                    }
                }, this);
            }
            this.set('typeArray', typeArray);
        },
        setFilterParams: function () {  // NOTE aufbröseln in einzelMethoden
            var tree = _.where(this.get('trees'), {displayGattung: $('#categoryInput').val()});
            if (tree[0] === undefined) {
                this.set('treeFilterCategory', "");
                this.set('treeFilterType', "");
            }
            else {
                this.set('treeFilterCategory', tree[0].Gattung);
                var treeType = _.where(tree[0].Arten, {display: $('#typeInput').val()});
                if (treeType[0] !== undefined) {
                    this.set('treeFilterType', treeType[0].species);
                }
                else {
                    this.set('treeFilterType', "");
                }
            }
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
            this.set('filter', '');
            this.set('SLDBody', '');
        },
        createFilter: function () {
            var filterCategory, filterType, filterYear, filterDiameter, filterPerimeter;

            // Filter Gattung und Art
            if (this.get('treeFilterCategory').length !== 0) {
                filterCategory = '<ogc:PropertyIsEqualTo><ogc:PropertyName>app:botanischer_name</ogc:PropertyName><ogc:Literal>' + this.get('treeFilterCategory') + '</ogc:Literal></ogc:PropertyIsEqualTo>';
                if (this.get('treeFilterType').length !== 0) {
                    filterType = '<ogc:PropertyIsEqualTo><ogc:PropertyName>app:baumart</ogc:PropertyName><ogc:Literal>' + this.get('treeFilterType') + '</ogc:Literal></ogc:PropertyIsEqualTo>';
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
            var filter = "<ogc:Filter><ogc:And>" + filterCategory + filterType + filterYear + filterDiameter + filterPerimeter + "</ogc:And></ogc:Filter>";
            var symbolizer = "<se:PointSymbolizer><se:Graphic><se:Mark><se:WellKnownName>circle</se:WellKnownName><se:Fill><se:SvgParameter name='fill'>#55c61d</se:SvgParameter><se:SvgParameter name='fill-opacity'>0.78</se:SvgParameter></se:Fill><se:Stroke><se:SvgParameter name='stroke'>#36a002</se:SvgParameter><se:SvgParameter name='stroke-width'>1</se:SvgParameter></se:Stroke></se:Mark><se:Size>12</se:Size></se:Graphic></se:PointSymbolizer></se:Rule>";

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
                    $('#loader').hide();
                }
            });
        }
    });

    return new TreeFilter();
});
