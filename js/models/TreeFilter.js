define([
    'underscore',
    'backbone',
    'eventbus'
], function (_, Backbone, EventBus) {

    var TreeFilter = Backbone.Model.extend({
        initialize: function () {
            this.set('showContent', true);
            this.set('layerID', '5182');
        },
        setFormChecker: function (value) {
            // NOTE nocht nicht sehr schön programmiert --> listener
            this.set('isFormValid', value);
            this.updateStyle();
        },
        updateStyle: function () {
            this.createSLD();
            EventBus.trigger('updateStyleByID', [this.get('layerID'), this.get('SLDBody')]);
        },
        createSLD: function () {
            var filterCategory, filterType, filterYear;
            // Filter Gattung und Art
            if ($('#treeCategory').val() !== "keine Auswahl") {
                filterCategory = '<ogc:PropertyName>app:gattung</ogc:PropertyName><ogc:Literal>' + $('#treeCategory').val() + '</ogc:Literal></ogc:PropertyIsEqualTo>';
                if ($('#treeType').val() !== "Alle Arten") {
                    filterType = '<ogc:PropertyName>app:art</ogc:PropertyName><ogc:Literal>' + $('#treeType').val() + '</ogc:Literal></ogc:PropertyIsEqualTo>';
                } else {
                    filterType = '';
                }
            } else {
                filterCategory = '';
                filterType = '';
            }

            // Filter Pflanzjahr
            filterYear = '<ogc:PropertyIsBetween><ogc:PropertyName>app:pflanzjahr</ogc:PropertyName><ogc:LowerBoundary><ogc:Literal>' + $('#yearStart').val() + '</ogc:Literal></ogc:LowerBoundary><ogc:UpperBoundary><ogc:Literal>' + $('#yearEnd').val() + '</ogc:Literal></ogc:UpperBoundary></ogc:PropertyIsBetween>';
console.log(filterYear);
            // TODO Filter Kronendurchmesser und Stammumfang <ogc:PropertyIsLike wildCard="*" singleChar="?" escape="\">

            var header = "<sld:StyledLayerDescriptor xmlns:sld='http://www.opengis.net/sld' xmlns:se='http://www.opengis.net/se' xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:app='http://www.deegree.org/app' xmlns:ogc='http://www.opengis.net/ogc' xmlns='http://www.opengis.net/sld' version='1.1.0' xsi:schemaLocation='http://www.opengis.net/sld http://schemas.opengis.net/sld/1.1.0/StyledLayerDescriptor.xsd'><sld:NamedLayer><se:Name>strassenbaum</se:Name><sld:UserStyle><se:FeatureTypeStyle><se:Rule>";
            var filter = "<ogc:Filter>" + filterYear + "</ogc:Filter>";
            var symbolizer = "<se:PointSymbolizer><se:Graphic><se:Mark><se:WellKnownName>circle</se:WellKnownName><se:Fill><se:SvgParameter name='fill'>#00ff00</se:SvgParameter></se:Fill><se:Stroke><se:SvgParameter name='stroke'>#00ff00</se:SvgParameter></se:Stroke></se:Mark><se:Size>12</se:Size></se:Graphic></se:PointSymbolizer>";
            var footer = "</se:Rule></se:FeatureTypeStyle></sld:UserStyle></sld:NamedLayer></sld:StyledLayerDescriptor>";
            this.set('SLDBody', header + filter + symbolizer + footer);
        }
    });

    return new TreeFilter();
});
