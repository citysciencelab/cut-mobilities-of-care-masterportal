export function getPropertyIsLike (property, literal) {
    return `<ogc:PropertyIsLike wildCard="*" singleChar="#" escapeChar="!">
<ogc:PropertyName>${property}</ogc:PropertyName>
<ogc:Literal>*${literal}/*</ogc:Literal>
</ogc:PropertyIsLike>`;
}

export function getOrFilter (layerName, orFilter) {
return `<StyledLayerDescriptor xmlns='http://www.opengis.net/se'
xmlns:app='http://www.deegree.org/app'
xmlns:deegreeogc='http://www.deegree.org/ogc'
xmlns:ogc='http://www.opengis.net/ogc'
xmlns:sed='http://www.deegree.org/se'
xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xsi:schemaLocation='http://www.opengis.net/se http://schemas.opengis.net/se/1.1.0/FeatureStyle.xsd http://www.deegree.org/se http://schemas.deegree.org/se/1.1.0/Symbolizer-deegree.xsd'>
<NamedLayer>
<Name>${layerName}</Name>
<UserStyle>
<FeatureTypeStyle>
<Name>style</Name>
<Rule>
<ogc:Filter>
<ogc:Or>
${orFilter}
</ogc:Or>
</ogc:Filter>
<PointSymbolizer>
<Graphic>
<Mark>
<WellKnownName>square</WellKnownName>
<Fill>
<SvgParameter name="fill">#FF0000</SvgParameter>
</Fill>
<Stroke>
<SvgParameter name="stroke">#000000</SvgParameter>
<SvgParameter name="stroke-width">1</SvgParameter>
</Stroke>
</Mark>
<Size>13</Size>
</Graphic>
</PointSymbolizer>
</Rule>
</FeatureTypeStyle>
</UserStyle>
</NamedLayer>
</StyledLayerDescriptor>`;
}

export function getFilter (layerName, orFilter) {
    return `<StyledLayerDescriptor xmlns='http://www.opengis.net/se'
xmlns:app='http://www.deegree.org/app'
xmlns:deegreeogc='http://www.deegree.org/ogc'
xmlns:ogc='http://www.opengis.net/ogc'
xmlns:sed='http://www.deegree.org/se'
xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xsi:schemaLocation='http://www.opengis.net/se http://schemas.opengis.net/se/1.1.0/FeatureStyle.xsd http://www.deegree.org/se http://schemas.deegree.org/se/1.1.0/Symbolizer-deegree.xsd'>
<NamedLayer>
<Name>${layerName}</Name>
<UserStyle>
<FeatureTypeStyle>
<Name>style</Name>
<Rule>
<ogc:Filter>
${orFilter}
</ogc:Filter>
<PointSymbolizer>
<Graphic>
<Mark>
<WellKnownName>square</WellKnownName>
<Fill>
<SvgParameter name="fill">#FF0000</SvgParameter>
</Fill>
<Stroke>
<SvgParameter name="stroke">#000000</SvgParameter>
<SvgParameter name="stroke-width">1</SvgParameter>
</Stroke>
</Mark>
<Size>13</Size>
</Graphic>
</PointSymbolizer>
</Rule>
</FeatureTypeStyle>
</UserStyle>
</NamedLayer>
</StyledLayerDescriptor>`;
}

export function getWithoutFilter (layerName, orFilter) {
    return `<StyledLayerDescriptor xmlns='http://www.opengis.net/se'
xmlns:app='http://www.deegree.org/app'
xmlns:deegreeogc='http://www.deegree.org/ogc'
xmlns:ogc='http://www.opengis.net/ogc'
xmlns:sed='http://www.deegree.org/se'
xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xsi:schemaLocation='http://www.opengis.net/se http://schemas.opengis.net/se/1.1.0/FeatureStyle.xsd http://www.deegree.org/se http://schemas.deegree.org/se/1.1.0/Symbolizer-deegree.xsd'>
<NamedLayer>
<Name>${layerName}</Name>
<UserStyle>
<FeatureTypeStyle>
<Name>style</Name>
<Rule>
<PointSymbolizer>
<Graphic>
<Mark>
<WellKnownName>square</WellKnownName>
<Fill>
<SvgParameter name="fill">#FF0000</SvgParameter>
</Fill>
<Stroke>
<SvgParameter name="stroke">#000000</SvgParameter>
<SvgParameter name="stroke-width">1</SvgParameter>
</Stroke>
</Mark>
<Size>13</Size>
</Graphic>
</PointSymbolizer>
</Rule>
</FeatureTypeStyle>
</UserStyle>
</NamedLayer>
</StyledLayerDescriptor>`;
}
