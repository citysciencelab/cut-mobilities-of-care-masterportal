>[Return to the Masterportal documentation](doc.md)

# URL parameters

Special URL parameters exist to change configuration details or execute initial actions on opening the Masterportal. The URL parameter list begins with a `"?"`, and individual parameters are separated with `"&"` characters.

**Example: [https://geoportal-hamburg.de/Geoportal/geo-online/?layerIDs=453,1731,2426&visibility=true,true,false&transparency=0,40,0&center=565874,5934140&zoomlevel=2](https://geoportal-hamburg.de/Geoportal/geo-online/?layerIDs=453,1731,2426&visibility=true,true,false&transparency=0,40,0&center=565874,5934140&zoomlevel=2 "Example URL with parameters set")**

## Parameter list

|Name|Description|Example|
|----|-----------|-------|
|BEZIRK|_Deprecated in 3.0.0. Please use `"ZOOMTOGEOMETRY"` instead._ Zooms to a feature requested from a WFS. Allowed parameters depend on **[config.zoomToGeometry](config.js.md)**. As an alternative to the feature name, features may also be addressed by their `geometries` array index, starting at 1.|`&bezirk=wandsbek`|
|CENTER|Moves the view to center the given coordinate. If `PROJECTION` is given as parameter, the `CENTER` coordinates are expected to be given in it, and are translated to the map's coordinate reference system before usage. If `PROJECTION` is not given, the `CENTER` coordinates must be given in the map's configured coordinate reference system; see **[config.namedProjections.epsg](config.js.md)**.|`&center=565874,5934140`|
|CLICKCOUNTER|Overrides the `clickCounter` module default behavior; see **[config.clickCounter](config.js.md)**. A fixed URL type `desktop` or `mobile` may be given here. This switch can e.g. be used if the portal runs within an iFrame and the integrating page is to evaluate the desktop/mobile view.|`&clickcounter=desktop`|
|CONFIG|Sets the configuration file to use. This is done by either providing an absolute URL (`http://...` resp. `https://...`) or a relative path. In the second case, the relative path is combined with the path given in the **[config.portalConf](config.js.md)**, and the resulting path must link to a config.json file.|`&config=config.json`|
|FEATUREID|Zooms to the features of a WFS configured via **[config.zoomtofeature](config.js.md)**.|`&featureid=18,26`|
|FEATUREVIAURL|Creates the given features and adds them to a GeoJSON layer. A `layerId` should be given for each feature set, and each feature must provide the fields `coordinates` and `label`. The coordinates should match the respective *GeometryType* according to the [GeoJSON specification RFC7946](https://tools.ietf.org/html/rfc7946). The parameters also depend on the module's configuration in **[config.featureviaurl](config.js.md)**.|`&featureviaurl=[{"layerId":"42","features":[{"coordinates":[10,53.5],"label":"TestPunkt"}]}]`|
|HIGHLIGHTFEATURE|Describes a layer's feature that is to be highlighted. Layer and feature id are given separated by a comma. |`&highlightfeature=layerid,featureId`|
|ISINITOPEN|The module matching the given module id is opened initially. Please mind that only one of the windowed tools may be open at a time.|`&isinitopen=draw`|
|LAYERIDS|Overrides the initially visible layers. The effect depends on the **[config.Portalconfig.treeType](config.json.md)**. If set to `"light"`, layers are set visible *additionally*. In other trees, the base configuration is overwritten. This can be complemented with the `VISIBILITY` and `TRANSPARENCY` flags.|`&layerids=453,2128`|
|MARKER|Sets a marker to the given coordinate and zooms to it. If `PROJECTION` is given as parameter, the marker coordinates are to be expected in that coordinate reference system and are translated before application. Else, the given coordinates must match the map's coordinate reference system. See **[config.namedProjections.epsg](config.js.md)**.|`&marker=565874,5934140`|
|MDID|Activates the layer with the given metadata id. Only usable in tree mode `"default"`.|`&mdid=6520CBEF-D2A6-11D5-88C8-000102DCCF41`|
|PROJECTION|Coordinate reference system EPSG code. `PROJECTION` affects other parameters, see `ZOOMTOEXTENT` and `MAPMARKER`.|`&projection=EPSG:4326`|
|QUERY|Starts an address search via the search slot with any string given. House numbers must be given separated with a comma.|`&query=Neuenfelder Straße,19`|
|STARTUPMODUL|_Deprecated in major release 3.0.0. Please use the parameter `ISINITOPEN` instead_. The module matching the given module id is opened initially. Please mind that only one of the windowed tools may be open at a time.|`&isinitopen=draw`|
|STYLE|Activates a special UI variant. E.g. `simple` may be set to hide all UI elements in an iFrame scenario.|`&style=simple`|
|TRANSPARENCY|Only works when used in combination with `LAYERIDS`. Transparency can be set separated by commas from 0 to 100; the transparency will be applied to the `LAYERIDS` layer of the same index.|`&layerids=453,2128&transparency=0,40`|
|VISIBILITY|Only works when used in combination with `LAYERIDS`. Visibility can be set separated by commas as true or false; the visibility will be applied to the `LAYERIDS` layer of the same index.|`&layerids=453,2128&visibility=true,false`|
|ZOOMLEVEL|The initial zoom level is the given zoom level; see **[config.view.options](config.js.md)**.|`&zoomlevel=2`|
|ZOOMTOEXTENT|Zooms to an extent.|`&zoomToExtent=510000,5850000,625000,6000000`|
|ZOOMTOGEOMETRY|Zooms to a feature requested from a WFS. Allowed parameters depend on **[config.zoomToGeometry](config.js.md)**. As an alternative to the feature name, features may also be addressed by their `geometries` array index, starting at 1.|`&zoomToGeometry=bergedorf`|
