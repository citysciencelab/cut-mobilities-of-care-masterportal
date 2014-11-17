define([
    'jquery',
    'underscore',
    'backbone',
    'eventbus',
    'config'
], function ($, _, Backbone, EventBus, Config) {

    var TreeFilter = Backbone.Model.extend({
        initialize: function () {
            this.listenTo(this, 'change:SLDBody', this.updateStyleByID);
            this.listenTo(this, 'invalid', this.showError);

            this.set('layerID', '5182');
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
                }
                else if (this.validators.minLength(attributes.yearMax, 4) === false || this.validators.minLength(attributes.yearMin, 4) === false) {
                    errors.yearError = "Bitte geben Sie eine vierstellige Zahl ein";
                }
                else if (this.validators.maxLength(attributes.yearMax, 4) === false || this.validators.maxLength(attributes.yearMin, 4) === false) {
                    errors.yearError = "Bitte geben Sie eine vierstellige Zahl ein";
                }
                else if (this.validators.isLessThan(attributes.yearMin, attributes.yearMax) === false) {
                    errors.yearError = "Logischer Fehler der Werte";
                }
            }
            if (_.isEmpty(errors) === false) {
                return errors;
            }
        },
        showError: function () {
            _.each(this.validationError, function (value, key) {
                $('#' + key).show().text(value);
                $('#' + key).parent().children().each(function (index, element) {
                    if($(element).is("div")) {
                        $(element).addClass("has-error").show();
                    }
                });
            }, this);
        },
        setFilterParams: function () {
            this.set('yearMax', $('#yearMax > input').val());
            this.set('yearMin', $('#yearMin > input').val());
            this.set('diameterMax', $('#diameterMax > input').val());
            this.set('diameterMin', $('#diameterMin > input').val());
            this.set('perimeterMax', $('#perimeterMax > input').val());
            this.set('perimeterMin', $('#perimeterMin > input').val());

            if (this.isValid() === true) {
                $("input").parent().removeClass('has-error');
                $("span").each(function (index, element) {
                    if($(element).hasClass("treeFilterError") === true) {
                        $(element).hide();
                    }
                });
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
                filterCategory = '<ogc:PropertyIsEqualTo><ogc:PropertyName>app:botanischer_name</ogc:PropertyName><ogc:Literal>' + $('#treeCategory').val() + '</ogc:Literal></ogc:PropertyIsEqualTo>';
                if ($('#treeType').val() !== "Alle Arten") {
                    filterType = '<ogc:PropertyIsEqualTo><ogc:PropertyName>app:baumart</ogc:PropertyName><ogc:Literal>' + $('#treeType').val() + '</ogc:Literal></ogc:PropertyIsEqualTo>';
                } else {
                    filterType = '';
                }
            } else {
                filterCategory = '';
                filterType = '';
            }

             // Filter Pflanzjahr
            filterYear = '<ogc:PropertyIsBetween><ogc:PropertyName>app:pflanzjahr</ogc:PropertyName><ogc:LowerBoundary><ogc:Literal>' + $('#yearMin > input').val() + '</ogc:Literal></ogc:LowerBoundary><ogc:UpperBoundary><ogc:Literal>' + $('#yearMax > input').val() + '</ogc:Literal></ogc:UpperBoundary></ogc:PropertyIsBetween>';
            filterDiameter = '<ogc:PropertyIsBetween><ogc:PropertyName>app:kronendmzahl</ogc:PropertyName><ogc:LowerBoundary><ogc:Literal>' +$('#diameterMin > input').val() + '</ogc:Literal></ogc:LowerBoundary><ogc:UpperBoundary><ogc:Literal>' + $('#diameterMax > input').val() + '</ogc:Literal></ogc:UpperBoundary></ogc:PropertyIsBetween>';
            filterPerimeter = '<ogc:PropertyIsBetween><ogc:PropertyName>app:stammumfangzahl</ogc:PropertyName><ogc:LowerBoundary><ogc:Literal>' + $('#perimeterMin > input').val() + '</ogc:Literal></ogc:LowerBoundary><ogc:UpperBoundary><ogc:Literal>' + $('#perimeterMax > input').val() + '</ogc:Literal></ogc:UpperBoundary></ogc:PropertyIsBetween>';
            var header = "<sld:StyledLayerDescriptor xmlns:sld='http://www.opengis.net/sld' xmlns:se='http://www.opengis.net/se' xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:app='http://www.deegree.org/app' xmlns:ogc='http://www.opengis.net/ogc' xmlns='http://www.opengis.net/sld' version='1.1.0' xsi:schemaLocation='http://www.opengis.net/sld http://schemas.opengis.net/sld/1.1.0/StyledLayerDescriptor.xsd'><sld:NamedLayer><se:Name>strassenbaum</se:Name><sld:UserStyle><se:FeatureTypeStyle><se:Rule>";
            var filter = "<ogc:Filter><ogc:And>" + filterCategory + filterType + filterYear + filterDiameter + filterPerimeter + "</ogc:And></ogc:Filter>";
            var symbolizer = "<se:PointSymbolizer><se:Graphic><se:Mark><se:WellKnownName>circle</se:WellKnownName><se:Fill><se:SvgParameter name='fill'>#24ac3b</se:SvgParameter></se:Fill><se:Stroke><se:SvgParameter name='stroke'>#24ac3b</se:SvgParameter></se:Stroke></se:Mark><se:Size>12</se:Size></se:Graphic></se:PointSymbolizer>";
            var footer = "</se:Rule></se:FeatureTypeStyle></sld:UserStyle></sld:NamedLayer></sld:StyledLayerDescriptor>";
            this.set('SLDBody', header + filter + symbolizer + footer);
            console.log(this.get('SLDBody'));

//            $.ajax({
//                url: Config.proxyURL + "?url=http://lgvfds01.fhhnet.stadt.hamburg.de/arcgis/services/FD_FHH_Map/BSU_LP_Baumkataster/MapServer/WFSServer" +  encodeURIComponent("?service=WFS&version=1.1.0&typeName=BSU_LP_Baumkataster:Strassenbaumkataster_2013&resultType=hits&request=GetFeature&Filter=<ogc:Filter>" + filterCategory + "</ogc:Filter>"),
//                async: true,
//                type: 'GET',
//                success: function (data) {
//                        console.log(data);
//                },
//                error: function (err) {
//                    console.log(err)
//                }
//            });
            }
    });
//    http://lgvfds01/arcgis/services/FD_FHH_Map/BSU_LP_Baumkataster/MapServer/WFSServer?request=GetFeature&service=wfs&version=1.1&typeName=BSU_LP_Baumkataster:Strassenbaumkataster_2013&resultType=hits&Filter=%3Cogc:Filter%3E%3Cogc:PropertyIsBetween%3E%3Cogc:PropertyName%3Eapp:pflanzjahr%3C/ogc:PropertyName%3E%3Cogc:LowerBoundary%3E%3Cogc:Literal%3E1974%3C/ogc:Literal%3E%3C/ogc:LowerBoundary%3E%3Cogc:UpperBoundary%3E%3Cogc:Literal%3E1974%3C/ogc:Literal%3E%3C/ogc:UpperBoundary%3E%3C/ogc:PropertyIsBetween%3E%3C/ogc:Filter%3E

    return new TreeFilter();
});
