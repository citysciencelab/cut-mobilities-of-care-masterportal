/**
 * todo
 * @param {String} property Todo
 * @param {String} literal Todo
 * @returns {String} Todo
 */
export function getPropertyIsLike (property, literal) {
    return `<ogc:PropertyIsLike wildCard="*" singleChar="#" escapeChar="!">
<ogc:PropertyName>${property}</ogc:PropertyName>
<ogc:Literal>${literal}</ogc:Literal>
</ogc:PropertyIsLike>`;
}

/**
 * todo
 * @param {String} layerName Todo
 * @param {String} orFilter Todo
 * @param {String} year Todo
 * @param {String} wohneinheiten Todo
 * @returns {String} Todo
 */
export function getOrFilter (layerName, orFilter, year, wohneinheiten) {
    return `<StyledLayerDescriptor xmlns='https://www.opengis.net/se' xmlns:ogc='https://www.opengis.net/ogc' xmlns:xsi='https://www.w3.org/2001/XMLSchema-instance' xsi:schemaLocation='https://www.opengis.net/se https://schemas.opengis.net/se/1.1.0/FeatureStyle.xsd https://schemas.deegree.org/se/1.1.0/Symbolizer-deegree.xsd'>
<NamedLayer>
<Name>${layerName}</Name>
<UserStyle>
<FeatureTypeStyle>
<Name>style</Name>
<Rule>
<ogc:Filter>
<ogc:And>
<ogc:Or>
${orFilter}
</ogc:Or>
<ogc:PropertyIsLike wildCard="*" singleChar="#" escapeChar="!">
<ogc:PropertyName>de.hh.up:genehmigungsdatum</ogc:PropertyName>
<ogc:Literal>*${year}*</ogc:Literal>
</ogc:PropertyIsLike>
<ogc:PropertyIsGreaterThanOrEqualTo>
<ogc:PropertyName>anzahl_der_wohneinheiten</ogc:PropertyName>
<ogc:Literal>${wohneinheiten}</ogc:Literal>
</ogc:PropertyIsGreaterThanOrEqualTo>
</ogc:And>
</ogc:Filter>
<PointSymbolizer>
<Graphic>
<ExternalGraphic>
<OnlineResource xmlns:xlink="https://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="https://localhost/bauvorhaben/${year}.svg"/>
<Format>image/svg</Format>
</ExternalGraphic>
<Size>20</Size>
</Graphic>
</PointSymbolizer>
</Rule>
</FeatureTypeStyle>
</UserStyle>
</NamedLayer>
</StyledLayerDescriptor>`;
}

/**
 * todo
 * @param {String} layerName Todo
 * @param {String} orFilter Todo
 * @param {String} year Todo
 * @param {String} wohneinheiten Todo
 * @returns {String} Todo
 */
export function getFilter (layerName, orFilter, year, wohneinheiten) {
    return `<StyledLayerDescriptor xmlns='https://www.opengis.net/se' xmlns:ogc='https://www.opengis.net/ogc' xmlns:xsi='https://www.w3.org/2001/XMLSchema-instance' xsi:schemaLocation='https://www.opengis.net/se https://schemas.opengis.net/se/1.1.0/FeatureStyle.xsd https://schemas.deegree.org/se/1.1.0/Symbolizer-deegree.xsd'>
<NamedLayer>
<Name>${layerName}</Name>
<UserStyle>
<FeatureTypeStyle>
<Name>style</Name>
<Rule>
<ogc:Filter>
<ogc:And>
${orFilter}
<ogc:PropertyIsLike wildCard="*" singleChar="#" escapeChar="!">
<ogc:PropertyName>de.hh.up:genehmigungsdatum</ogc:PropertyName>
<ogc:Literal>*${year}*</ogc:Literal>
</ogc:PropertyIsLike>
<ogc:PropertyIsGreaterThanOrEqualTo>
<ogc:PropertyName>anzahl_der_wohneinheiten</ogc:PropertyName>
<ogc:Literal>${wohneinheiten}</ogc:Literal>
</ogc:PropertyIsGreaterThanOrEqualTo>
</ogc:And>
</ogc:Filter>
<PointSymbolizer>
<Graphic>
<ExternalGraphic>
<OnlineResource xmlns:xlink="https://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="https://localhost/bauvorhaben/${year}.svg"/>
<Format>image/svg</Format>
</ExternalGraphic>
<Size>20</Size>
</Graphic>
</PointSymbolizer>
</Rule>
</FeatureTypeStyle>
</UserStyle>
</NamedLayer>
</StyledLayerDescriptor>`;
}
