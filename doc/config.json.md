>**[Back to the Masterportal documentation](doc.md)**.

[TOC]

***

# config.json

The *config.json* file contains all configuration of the portal interface. It controls which elements are placed where on the menu bar, how the map is to be centered initially, and which layers are to be loaded. See **[this file for an example](https://bitbucket.org/geowerkstatt-hamburg/masterportal/src/stable/portal/basic/config.json)**.

The configuration is separated into two sections, **[Portalconfig](#markdown-header-Portalconfig)** and **[Themenconfig](#markdown-header-Themenconfig)**

```json
{
   "Portalconfig": {},
   "Themenconfig": {}
}
```

>💡 Since the portal's original language was German, some on the technical keys are still in German.

***

## Portalconfig

The section *Portalconfig* controls the following properties:

1. Title & logo (*portalTitle*)
2. Type of topic selection (*treeType*)
3. Initial map view settings (*mapView*)
4. Map view buttons and interactions (*controls*)
5. Menu entries and availability as well as order of tools (*menu*)
6. Type and properties of used search services (*searchBar*)
7. Deletability of topics (*layersRemovable*)

The configuration options listed in the following table exist:

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|portalTitle|no|**[portalTitle](#markdown-header-portalconfigportaltitle)**||The portal's title and further elements to be shown in the menu bar.|false|
|treeType|no|enum["light","default","custom"]|"light"|Decides the type of topic selection tree. You may choose between `"light"` (simple list), `"default"` (FHH-Atlas), and `"custom"` (layer list defined via JSON file).|false|
|singleBaselayer|no|Boolean|false|Specifies whether only one base layer may be active at any time. Only usable in combination with treeType `"custom"`.|false|
|Baumtyp|no|enum["light","default","custom"]|"light"|_Deprecated in 3.0.0. Please use `"treeType"` instead._|false|
|mapView|no|**[mapView](#markdown-header-portalconfigmapview)**||Defines the initial map view and a background shown when no layer is selected.|false|
|controls|no|**[controls](#markdown-header-portalconfigcontrols)**||Allows setting which interactions are active in the map.|false|
|menu|no|**[menu](#markdown-header-portalconfigmenu)**||Menu entries and their order are configured in this entry. The order of tools corresponds to the order in the object specifying them; see **[Tools](#markdown-header-portalconfigmenutools)**.|false|
|searchBar|no|**[searchBar](#markdown-header-portalconfigsearchbar)**||The search bar allows requesting information from various search services at once.|false|
|layersRemovable|no|Boolean|false|Defines whether layers may be removed from a portal during its run-time.|false|

***

### Portalconfig.searchBar

Search bar configuration.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|bkg|no|**[bkg](#markdown-header-portalconfigsearchbarbkg)**||BKG search service configuration.|false|
|gazetteer|no|**[gazetteer](#markdown-header-portalconfigsearchbargazetteer)**||Gazetteer search service configuration.|false|
|gdi|no|**[gdi](#markdown-header-portalconfigsearchbargdi)**||GDI (elastic) search service configuration. _Deprecated in 3.0.0. Please use **[elasticSearch](#markdown-header-portalconfigsearchbarelasticsearch)** instead.|false|
|elasticSearch|no|**[elasticSearch](#markdown-header-portalconfigsearchbarelasticsearch)**||Elastic search service configuration.|false|
|osm|no|**[osm](#markdown-header-portalconfigsearchbarosm)**||OpenStreetMap (OSM) search service configuration.|false|
|locationFinder|no|**[locationFinder](#markdown-header-portalconfigsearchbarlocationfinder)**||LocationFinder search service configuration.|false|
|placeholder|no|String|"Suche"|Input text field placeholder shown when no input has been given yet.|false|
|recommendedListLength|no|Integer|5|Maximum amount of entries in the suggestion list.|false|
|quickHelp|no|Boolean|false|Defines whether the QuickHelp feature is offered for the search bar.|false|
|specialWFS|no|**[specialWFS](#markdown-header-portalconfigsearchbarspecialwfs)**||specialWFS search service configuration.|false|
|tree|no|**[tree](#markdown-header-portalconfigsearchbartree)**||Topic selection tree search configuration.|false|
|visibleWFS|no|**[visibleWFS](#markdown-header-portalconfigsearchbarvisiblewfs)**||Visible WFS layer search configuration.|false|
|visibleVector|no|**[visibleVector](#markdown-header-portalconfigsearchbarvisiblevector)**||Visible vector layer search configuration.|false|
|zoomLevel|no|Integer||On picking a search result, this is the maximum zoom level to be used on zooming to the chosen feature.|false|
|sortByName|no|Boolean|true|Defines whether search results are to be sorted alphanumerically.|false|
|selectRandomHits|no|Boolean|true|Is set `true`, the results are chosen randomly when the amount of hits exceeds `recommendedListLength`. If set `false`, the list of hits is cut when reaching `recomendedListLength`. This may result in only showing results of the service that first returned.|false|

***

#### Portalconfig.searchBar.bkg

[type:Extent]: # (Datatypes.Extent)

BKG search service configuration.

>**⚠️ This requires a backend!**
>
>**To avoid openly using your BKG UUID, URLs ("bkg_geosearch" and "bkg_suggest" in this case) of the restServices should be caught and redirected in a proxy.**

**Example proxy configuration**
```
ProxyPass /bkg_geosearch http://sg.geodatenzentrum.de/gdz_geokodierung__[UUID]/geosearch
<Location /bkg_geosearch>
  ProxyPassReverse http://sg.geodatenzentrum.de/gdz_geokodierung__[UUID]/geosearch
</Location>

ProxyPass /bkg_suggest http://sg.geodatenzentrum.de/gdz_geokodierung__[UUID]/suggest
<Location /bkg_suggest>
  ProxyPassReverse http://sg.geodatenzentrum.de/gdz_geokodierung__[UUID]/suggest
</Location>
```


|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|epsg|no|String|"EPSG:25832"|EPSG code of the coordinate reference system to use.|false|
|extent|no|**[Extent](#markdown-header-datatypesextent)**|[454591, 5809000, 700000, 6075769]|Coordinate extent in which search algorithms should return.|false|
|filter|no|String|"filter=(typ:*)"|Filter string sent to the BKG interface.|false|
|geosearchServiceId|yes|String||Search service id. Resolved using the **[rest-services.json](rest-services.json.md)** file.|false|
|minChars|no|Integer|3|_Deprecated in 3.0.0. Please use "minCharacters"._|false|
|minCharacters|no|Integer|3|Minimum amount of characters required to start a search.|false|
|score|no|Number|0.6|Score defining the minimum quality of search results.|false|
|suggestCount|no|Integer|20|Suggestion amount.|false|
|suggestServiceId|yes|String||Suggestion service id. Resolved using the **[rest-services.json](rest-services.json.md)** file.|false|
|zoomToResult|no|Boolean|false|_Deprecated in 3.0.0. Please use "zoomToResultOnHover" or "zoomToResultOnClick"._ Defines whether a feature is zoomed to when hovering a result list entry.|false|
|zoomToResultOnHover|no|Boolean|false|Defines whether an address is zoomed to when hovering a result list entry.|false|
|zoomToResultOnClick|no|Boolean|true|Defines whether an address is zoomed to when clicking a result list entry.|false|
|zoomLevel|no|Number|7|Defines the zoom level to use on zooming to a result.|false|

**Example**
```json
{
    "bkg": {
        "minCharacters": 3,
        "suggestServiceId": "4",
        "geosearchServiceId": "5",
        "extent": [454591, 5809000, 700000, 6075769],
        "suggestCount": 10,
        "epsg": "EPSG:25832",
        "filter": "filter=(typ:*)",
        "score": 0.6,
        "zoomToResultOnHover": false,
        "zoomToResultOnClick": true,
        "zoomLevel": 10
    }
}
```

***

#### Portalconfig.searchBar.osm

OpenStreetMap search for city, street, and house number. Only executed on clicking the search icon or pressing enter since the amount of requests to the OSM search service is limited.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|minChars|no|Number|3|Minimum amount of characters required to start a search.|false|
|serviceId|yes|String||OSM search service id. Resolved using the **[rest-services.json](rest-services.json.md)** file.|false|
|limit|no|Number|50|Maximum amount of requested unfiltered results.|false|
|states|no|string|""|May contain federal state names with arbitrary separators. Names may also be used in English depending on whether the data has been added to the free open source project **[OpenStreetMap](https://www.openstreetmap.org)**.|false|
|classes|no|string|[]|May contain the classes to search for.|false|

**Example**

```json
{
    "osm": {
        "minChars": 3,
        "serviceId": "10",
        "limit": 60,
        "states": "Hamburg, Nordrhein-Westfalen, Niedersachsen, Rhineland-Palatinate Rheinland-Pfalz",
        "classes": "place,highway,building,shop,historic,leisure,city,county"
    }
}
```

***

#### Portalconfig.searchBar.locationFinder

Search configuration to use a *ESRI CH LocationFinder*.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|incrementalSearch|no|Boolean|true|Defines whether autocomplete is enabled. If `incrementalSearch` is set to `false`, searches will only start on clicking the search icon or pressing enter, since there's a quota on requests.|false|
|serviceId|yes|String||Service id. Resolved using the **[rest-services.json](rest-services.json.md)** file.|false|
|classes|no|**[LocationFinderClass](#markdown-header-portalconfigsearchbarlocationfinderLocationFinderClass)**||May contain classes (with properties) to use in searches. If nothing is specified, all classes are considered valid.|false|
|useProxy|no|Boolean|false|_Deprecated in the next major release. [GDI-DE](https://www.gdi-de.org/en) recommends setting CORS headers on the required services instead of using proxies._ Defines whether a service URL should be requested via proxy. For this, dots in the URL are replaced with underscores.|false|
|spatialReference|no|String||Coordinate reference system to use for requests. By default, the value in `Portalconfig.mapView.epsg` is used.|false|

##### Portalconfig.searchBar.locationFinder.LocationFinderClass

Definition of classes to be taken into account for results.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|name|yes|String||Class name|false|
|icon|no|String|"glyphicon-road"|Class visualization by a glyphicon|false|
|zoom|no|String|"center"|Defines how to zoom to a hit on selection. If `center` is chosen, the center coordinate (`cx`, `cy`) is zoomed to and a marker is placed. If `bbox` is chosen, the LocationFinder's given BoundingBox (`xmin`, `ymin`, `xmax`, `ymax`) is zoomed to, and no marker is shown.|false|

**Example**

```json
{
    "locationFinder": {
        "serviceId": "10",
        "classes": [
            {
                "name": "busstop",
                "icon": "glyphicon-record"
            },
            {
                "name": "address",
                "icon": "glyphicon-home"
            },
            {
                "name": "streetname",
                "zoom": "bbox"
            }
        ]
    }
}
```

***

#### Portalconfig.searchBar.gazetteer

Gazetteer search service configuration.

>**⚠️ This requires a backend!**
>
>**A WFS's Stored Query is requested with predefined parameters.**

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|minChars|no|Integer|3|Minimum amount of characters required to start a search.|false|
|searchDistricts|no|Boolean|false|Defines whether district search is active.|false|
|searchHouseNumbers|no|Boolean|false|Defines whether house numbers should be searched for. Requires `searchStreets` to be set to `true`, too.|false|
|searchParcels|no|Boolean|false|Defines whether parcels search is active.|false|
|searchStreetKey|no|Boolean|false|Defines whether streets should be searched for by key.|false|
|searchStreet|no|Boolean|false|Defines whether street search is active. Precondition to set `searchHouseNumbers` to `true`.|false|
|serviceID|yes|String||Search service id. Resolved using the **[rest-services.json](rest-services.json.md)** file.|false|

**Example**

```json
{
    "gazetteer": {
        "minChars": 3,
        "serviceId": "6",
        "searchStreets": true,
        "searchHouseNumbers": true,
        "searchDistricts": true,
        "searchParcels": true,
        "searchStreetKey": true
    }
}
```

***

#### Portalconfig.searchBar.gdi

GFI search service configuration.

>⚠️ Deprecated in 3.0.0. Please use **[elasticSearch](#markdown-header-portalconfigsearchbarelasticsearch)** instead.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|minChars|no|Integer|3|Minimum amount of characters required to start a search.|false|
|serviceID|yes|String||Search service id. Resolved using the **[rest-services.json](rest-services.json.md)** file.|false|
|queryObject|yes|**[queryObject](#markdown-header-portalconfigsearchbargdiqueryobject)**||Query object read by the Elasticsearch model.|false|

**Example**

```json
{
    "gdi": {
        "minChars": 3,
        "serviceId": "elastic",
        "queryObject": {
            "id": "query",
            "params": {
                "query_string": "%%searchString%%"
            }
        }
    }
}
```

***

#### Portalconfig.searchBar.gdi.queryObject

Todo.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|id|yes|String|""|Todo|false|
|params|yes|**[params](#markdown-header-portalconfigsearchbargdiqueryobjectparams)**||Elasticsearch parameter object.|false|

***

#### Portalconfig.searchBar.gdi.queryObject.params
Todo

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|query_string|yes|String|"%%searchString%%"|Todo|false|

***

#### Portalconfig.searchBar.elasticSearch

Elasticsearch service configuration.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|minChars|no|Integer|3|Minimum amount of characters required to start a search.|false|
|serviceId|yes|String||Search service id. Resolved using the **[rest-services.json](rest-services.json.md)** file.|false|
|type|no|enum["POST", "GET"]|"POST"|Request type.|false|
|searchStringAttribute|no|String|"searchString"|Search string attribute name for `payload` object.|false|
|responseEntryPath|no|String|""|Response JSON attribute path to found features.|false|
|triggerEvent|no|**[triggerEvent](#markdown-header-portalconfigsearchbarelasticsearchtriggerevent)**|{}|Radio event triggered on mouse hover and click.|false|
|hitMap|no|**[hitMap](#markdown-header-portalconfigsearchbarelasticsearchhitmap)**||Object mapping result object attributes to keys.|true|
|hitType|no|String|"Elastic"|Search result type shown in the result list after the result name.|false|
|hitGlyphicon|no|String|"glyphicon-road"|CSS glyphicon class of search results, shown before the result name.|false|
|useProxy|no|Boolean|false|Defines whether the URL should be proxied.|false|

As an additional property, you may add `payload`. It is not required, and matches the **[CustomObject](#markdown-header-datatypescustomobject)** description. By default, it is set to the empty object `{}`. The object describes the payload to be sent as part of the request. It must provide the searchString attribute. This object can not be handled in the Admintool, since **[CustomObject](#markdown-header-datatypescustomobject)** is not yet supported.

**Example**

```json
{
    "elasticSearch": {
        "minChars": 3,
        "serviceId": "elastic_hh",
        "type": "GET",
        "payload": {
            "id": "query",
            "params": {
                "query_string": ""
            }
        },
        "searchStringAttribute": "query_string",
        "responseEntryPath": "hits.hits",
        "triggerEvent": {
            "channel": "Parser",
            "event": "addGdiLayer"
        },
        "hitMap": {
            "name": "_source.name",
            "id": "_source.id",
            "source": "_source"
        },
        "hitType": "Fachthema",
        "hitGlyphicon": "glyphicon-list"
    }
}
```

***

#### Portalconfig.searchBar.elasticSearch.hitMap

Object mapping result object attributes to keys.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|name|yes|String|"name"|Attribute value will be mapped to the attribute key. Required to display results.|false|
|id|yes|String|"id"|Attribute value will be mapped to the attribute key. Required to display results.|false|
|coordinate|yes|String|"coordinate"|Attribute value will be mapped to the attribute key. Required to display a map marker.|false|

***

#### Portalconfig.searchBar.elasticSearch.triggerEvent

Radio event triggered on mouse hover and click.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|channel|yes|String||Channel addressed on mouse hover and click. The hit from the recommendedList will be sent as payload.|false|
|event|yes|String||Triggered event.|false|

***

#### Portalconfig.searchBar.specialWFS

WFS search function configuration. Requests features from a WFS. The service must be configured to allow WFS 2.0 requests.

For example, on entering "Kronenmatten" the service
https://geoportal.freiburg.de/geoportal_freiburg_de/wfs/stpla_bplan/wfs_mapfile/geltungsbereiche
will be requested with the following XML attached as payload, and the service will answer with an XML FeatureCollection. The collection features will then be offered as search results.

```xml
<?xml version='1.0' encoding='UTF-8'?>
<wfs:GetFeature service='WFS' xmlns:wfs='http://www.opengis.net/wfs' xmlns:ogc='http://www.opengis.net/ogc' xmlns:gml='http://www.opengis.net/gml' traverseXlinkDepth='*' version='1.1.0'>
    <wfs:Query typeName='ms:geltungsbereiche'>
        <wfs:PropertyName>ms:planbez</wfs:PropertyName>
        <wfs:PropertyName>ms:msGeometry</wfs:PropertyName>
        <wfs:maxFeatures>20</wfs:maxFeatures>
        <ogc:Filter>
            <ogc:PropertyIsLike matchCase='false' wildCard='*' singleChar='#' escapeChar='!'>
                <ogc:PropertyName>ms:planbez</ogc:PropertyName>
                <ogc:Literal>*Kronenmatten*</ogc:Literal>
            </ogc:PropertyIsLike>
        </ogc:Filter>
    </wfs:Query>
</wfs:GetFeature>
```

The WFS 2.0 query is dynamically created by the Masterportal. No stored query configuration is required in the service.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|minChars|no|Integer|3|Minimum amount of characters required to start a search.|false|
|glyphicon|no|String|"glyhicon-home"|Default glyphicon used in the suggestion list. Overwritable by a **[definition](#markdown-header-portalconfigsearchbarspecialwfsdefinition)**.|false|
|maxFeatures|no|Integer|20|Maximum amount of features returned. Overwritable by a **[definition](#markdown-header-portalconfigsearchbarspecialwfsdefinition)**.|false|
|timeout|no|Integer|6000|Service request timeout in ms.|false|
|definitions|no|**[definition](#markdown-header-portalconfigsearchbarspecialwfsdefinition)**[]||Special WFS search definitions.|false|

**Example**

```json
{
    "specialWFS": {
        "minChars": 5,
        "timeout": 10000,
        "definitions": [
            {
                "url": "/geodienste_hamburg_de/MRH_WFS_Rotenburg",
                "typeName": "app:mrh_row_bplan",
                "propertyNames": ["app:name"],
                "name": "B-Plan",
                "namespaces": "xmlns:app='http://www.deegree.org/app'"
            },
            {
                "url": "/geodienste_hamburg_de/HH_WFS_Bebauungsplaene",
                "typeName": "app:prosin_imverfahren",
                "propertyNames": ["app:plan"],
                "geometryName": "app:the_geom",
                "name": "im Verfahren",
                "namespaces": "xmlns:app='http://www.deegree.org/app'"
            }
        ]
    }
}
```

***

#### Portalconfig.searchBar.specialWFS.definition

SpecialWFS search definition configuration.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|url|no|String||WFS URL. Depending on your proxy configuration, the relative URL from the portal server must be given.|false|
|name|no|String||Category name displayed in the suggestion list.|false|
|glyphicon|no|String|"glyhicon-home"|CSS glyphicon class of search results, shown before the result name.|false|
|typeName|no|String||The name of the WFS layer to be requested.|false|
|propertyNames|no|String[]||Array of attribute names to be searched.|false|
|geometryName|no|String|"app:geom"|Geometry attribute name required for zoom functionality.|false|
|maxFeatures|no|Integer|20|Maximum amount of features to be returned.|false|
|namespaces|no|String||XML name spaces to request `propertyNames` or `geometryName`. (`xmlns:wfs`, `xmlns:ogc`, and `xmlns:gml` are always used.)|false|
|data|no|String||_Deprecated in 3.0.0._ Filter parameter for WFS requests.|false|

**Example**

```json
{
    "url": "/geodienste_hamburg_de/HH_WFS_Bebauungsplaene",
    "typeName": "app:prosin_imverfahren",
    "propertyNames": ["app:plan"],
    "geometryName": "app:the_geom",
    "name": "im Verfahren"
}
```

***

#### Portalconfig.searchBar.tree

Searching all topic selection tree layers.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|minChars|no|Integer|3|Minimum amount of characters required to start a search.|false|

**Example**

```json
{
    "tree": {
        "minChars": 5
    }
}
```

***

#### Portalconfig.searchBar.visibleWFS

Visible WFS search configuration. _Deprecated in 3.0.0. Please use **[visibleVector](#markdown-header-portalconfigsearchbarvisiblevector)** instead._

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|minChars|no|Integer|3|Minimum amount of characters required to start a search.|false|

**Example**

```json
{
    "visibleWFS": {
        "minChars": 3
    }
}
```

***

#### Portalconfig.searchBar.visibleVector

Visible vector layer search configuration. For all vector layers supposed to be searchable, set the **[searchField](#markdown-header-themenconfiglayervector)** attribute in the layer definition object "Fachdaten".

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|minChars|no|Integer|3|Minimum amount of characters required to start a search.|false|
|layerTypes|no|enum["WFS", "GeoJSON"]|["WFS"]|Vector layer types to be used.|true|
|gfiOnClick|no|Boolean|false|Opens the GetFeatureInfo (gfi) window on clicking a search result.|false|

**Example**

```json
{
    "visibleVector": {
        "minChars": 3,
        "layerTypes": ["WFS", "GeoJSON"]
    }
}
```

***

### Portalconfig.controls

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|attributions|no|**[attributions](#markdown-header-portalconfigcontrolsattributions)**|false|Additional layer information to be shown in the portal.|false|
|fullScreen|no|Boolean|false|Allows the user to view the portal in full screen mode, that is, without the browser's tabs and address bar, by clicking a button. A second click on the element returns the view back to normal.|false|
|mousePosition|no|Boolean|false|Display mouse pointer coordinates.|false|
|orientation|no|**[orientation](#markdown-header-portalconfigcontrolsorientation)**||The orientation control uses the browser's geolocation feature to determine the user's coordinates.|false|
|zoom|no|Boolean|false|Defines whether zoom buttons should be displayed.|false|
|overviewmap|no|**[overviewMap](#markdown-header-portalconfigcontrolsoverviewmap)**|false|_Deprecated in 3.0.0. Please use `overviewMap` instead._|false|
|overviewMap|no|**[overviewMap](#markdown-header-portalconfigcontrolsoverviewmap)**|false|Overview map.|false|
|totalview|no|**[totalView](#markdown-header-portalconfigcontrolstotalview)**|false|_Deprecated in 3.0.0. Please use "totalView" instead._|false|
|totalView|no|**[totalView](#markdown-header-portalconfigcontrolstotalview)**|false|Offers a button to return to the initial view.|false|
|button3d|no|Boolean|false|Defines whether a 3D mode switch button is shown.|false|
|orientation3d|no|Boolean|false|Defines whether the 3D mode is to show a navigation element inspired by the *classical compass winds*.|false|
|freeze|no|Boolean|false|Whether a "lock view" button is shown. Within the `TABLE` style, this element is part of the tool window.|false|
|backforward|no|**[backForward](#markdown-header-portalconfigcontrolsbackforward)**|false|_Deprecated in 3.0.0. Please use "backForward" instead._|false|
|backForward|no|**[backForward](#markdown-header-portalconfigcontrolsbackforward)**|false|Shows buttons to jump to previous and next map views.|false|

***

#### Portalconfig.controls.attributions

The entry `attributions` may be of type boolean or object. If of type boolean, the flag decides whether available attributions are shown. When of type object, the following attributes may be set:

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|isInitOpenDesktop|no|Boolean|true|Defines whether the attributions are open initially in desktop mode.|false|
|isInitOpenMobile|no|Boolean|false|Defines whether the attributions are open initially in mobile mode.|false|

**Boolean example**

```json
{
    "attributions": true
}
```

**Object example**

```json
{
    "attributions": {
        "isInitOpenDesktop": true,
        "isInitOpenMobile": false
    }
}
```

***

#### Portalconfig.controls.orientation

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|zoomMode|no|enum["once", "always"]|"once"|The user's location is determined and a marker turned on or off. This requires providing the portal via **https**. Modes: *once* zooms to the user's location once, *always* zooms to the user position on each activation.|false|
|poiDistances|no|Boolean/Integer[]|true|Defines whether the feature "Close to me", which shows a list of nearby points of interest, is provided. If an array is configured, multiple such lists with the given distance in meters are offered. When simply setting `poiDistances: true`, the used distances are `[500,1000,2000]`.|false|

**Example using type boolean poiDistances**

```json
{
    "orientation": {
        "zoomMode": "once",
        "poiDistances": true
    }
}
```

**Example using type number[] porDistances**

```json
{
    "orientation": {
        "zoomMode": "once",
        "poiDistances": [500, 1000, 2000, 5000]
    }
}
```

***

#### Portalconfig.controls.overviewMap

The attribute overviewMap may be of type boolean or object. If of type boolean, an overview map is shown with a default configuration. When of type object, the following attributes may be set:

|Name|Required|Type|Default|Description|
|----|--------|----|-------|-----------|
|resolution|no|Integer||_Deprecated in 3.0.0._ Defines the overview map resolution. If not set, the map section displayed is changed on zoom automatically.|
|baselayer|no|String||_Deprecated in 3.0.0. Please use `layerId` instead._ Allows using a different layer for the overview map element. The value must be an id from the `services.json` used in the portal's `config.js` parameter `layerConf`.|
|layerId|no|String||Allows using a different layer for the overview map element. The value must be an id from the `services.json` used in the portal's `config.js` parameter `layerConf`.|
|isInitOpen|no|Boolean|true|Defines whether the overview map is initially closed or opened.|

**Example using type object overviewMap**

```json
{
    "overviewMap": {
        "resolution": 305.7487246381551,
        "layerId": "452",
        "isInitOpen": false
    }
}
```

**Example using type boolean overviewMap**

```json
{
    "overviewMap": true
}
```

***

#### Portalconfig.controls.totalView

The attribute totalView may be of type boolean or object. If of type boolean, it shows a button using the default configuration that allows the user to switch back to the initial view. When of type object, the following attributes may be set:

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|glyphicon|no|String|"glyphicon-fast-backward"|Allows changing the button's glyphicon.|false|
|tableGlyphicon|no|String|"glyphicon-home"|Allows changing the list item's glyphicon in `TABLE` style.|false|

**Example using type object totalView**

```json
{
    "totalView" : {
        "glyphicon": "glyphicon-step-forward",
        "tableGlyphicon": "glyphicon-step-forward"
    }
}
```

**Example using type boolean totalView**

```json
{
    "totalView": true
}
```

***

#### Portalconfig.controls.backForward

The attribute backForward may be of type boolean or object. If of type boolean, it shows a button using the default configuration that allows the user to switch back and forth between view states. When of type object, the following attributes may be set:

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|glyphiconFor|no|String||Allows changing the glyphicon on the forward button.|false|
|glyphiconBack|no|String||Allows changing the glyphicon on the backwards button.|false|

**Example using type object backForward**

```json
{
    "backForward" : {
        "glyphiconFor": "glyphicon-fast-forward",
        "glyphiconBack": "glyphicon-fast-backward"
    }
}
```

**Example using type boolean backForward**

```json
{
    "backForward": true
}
```

***

### Portalconfig.portalTitle

The menu bar allows showing a portal name and portal image if sufficient horizontal space is available. The elements are not shown in mobile mode.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|title|no|String|"Master"|Portal name.|false|
|logo|no|String||Path to an external image file. If no image is set, the title will be shown without an accompanying logo.|false|
|link|no|String|"https://geoinfo.hamburg.de"|URL of an external website to link to.|false|
|tooltip|no|String||_Deprecated in 3.0.0. Please use `toolTip` instead._ Shown on hovering the portal logo.|false|
|toolTip|no|String|"Landesbetrieb Geoinformation und Vermessung"|Shown on hovering the portal logo.|false|

**Example**

```json
{
    "portalTitle": {
        "title": "Master",
        "logo": "../../lgv-config/img/hh-logo.png",
        "link": "https://geoinfo.hamburg.de",
        "toolTip": "Landesbetrieb Geoinformation und Vermessung"
    }
}
```

***

### Portalconfig.mapView

[type:Extent]: # (Datatypes.Extent)
[type:Coordinate]: # (Datatypes.Coordinate)

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|backgroundImage|no|String|"https://bitbucket.org/geowerkstatt-hamburg/masterportal/src/dev/doc/config.json.md#markdown-header-portalconfigmapview"|Path to an alternative background image.|false|
|startCenter|no|**[Coordinate](#markdown-header-datatypescoordinate)**|[565874, 5934140]|Initial center coordinate.|false|
|extent|no|**[Extent](#markdown-header-datatypesextent)**|[510000.0, 5850000.0, 625000.4, 6000000.0]|Map extent - map may not be moved outside these boundaries.|false|
|resolution|no|Float|15.874991427504629|The initial map resolution from the `options` element. Used in preference to `zoomLevel`.|false|
|zoomLevel|no|Integer||The initial map zoom level from the `options` element. If `resolutions` is set, this is ignored.|false|
|epsg|no|String|"EPSG:25832"|Coordinate reference system EPSG code. The code must be defined as a `namedProjection`.|false|
|options|no|[option](#markdown-header-portalconfigmapviewoption)[]|[{"resolution":66.14579761460263,"scale":250000,"zoomLevel":0}, {"resolution":26.458319045841044,"scale":100000,"zoomLevel":1}, {"resolution":15.874991427504629,"scale":60000,"zoomLevel":2}, {"resolution": 10.583327618336419,"scale":40000,"zoomLevel":3}, {"resolution":5.2916638091682096,"scale":20000,"zoomLevel":4}, {"resolution":2.6458319045841048,"scale":10000,"zoomLevel":5}, {"resolution":1.3229159522920524,"scale":5000,"zoomLevel":6}, {"resolution":0.6614579761460262,"scale":2500,"zoomLevel":7}, {"resolution":0.2645831904584105,"scale": 1000,"zoomLevel":8}, {"resolution":0.13229159522920521,"scale":500,"zoomLevel":9}]|Available scale levels and their resolutions.|false|

**Example**

```json
{
    "mapView": {
        "backgroundImage": "/lgv-config/img/backgroundCanvas.jpeg",
        "startCenter": [561210, 5932600],
        "options": [
            {
                "resolution": 611.4974492763076,
                "scale": 2311167,
                "zoomLevel": 0
            },
            {
                "resolution": 305.7487246381551,
                "scale": 1155583,
                "zoomLevel": 1
            },
            {
                "resolution": 152.87436231907702,
                "scale": 577791,
                "zoomLevel": 2
            },
            {
                "resolution": 76.43718115953851,
                "scale": 288896,
                "zoomLevel": 3
            },
            {
                "resolution": 38.21859057976939,
                "scale": 144448,
                "zoomLevel": 4
            },
            {
                "resolution": 19.109295289884642,
                "scale": 72223,
                "zoomLevel": 5
            },
            {
                "resolution": 9.554647644942321,
                "scale": 36112,
                "zoomLevel": 6
            },
            {
                "resolution": 4.7773238224711605,
                "scale": 18056,
                "zoomLevel": 7
            },
            {
                "resolution": 2.3886619112355802,
                "scale": 9028,
                "zoomLevel": 8
            },
            {
                "resolution": 1.1943309556178034,
                "scale": 4514,
                "zoomLevel": 9
            },
            {
                "resolution": 0.5971654778089017,
                "scale": 2257,
                "zoomLevel": 10
            }
        ],
        "extent": [510000.0, 5850000.0, 625000.4, 6000000.0],
        "resolution": 15.874991427504629,
        "zoomLevel": 1,
        "epsg": "EPSG:25832"
    }
}
```

***

#### Portalconfig.mapView.option

An option defines a zoom level. Each zoom level is defined by resolution, scale number, and a unique zoom level. The higher the zoom level, the smaller the scale and the closer you have zoomed.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|resolution|yes|Number||Zoom level definition's resolution.|false|
|scale|yes|Integer||Zoom level definition's scale.|false|
|zoomLevel|yes|Integer||Zoom level definition's zoom level.|false|

**mapView option example**

```json
{
    "resolution": 611.4974492763076,
    "scale": 2311167,
    "zoomLevel": 0
}
```

***

### Portalconfig.menu

This field allows creating and ordering menu entries. The order of tools corresponds to the entry order within the *config.json* file.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|info|no|**[info](#markdown-header-portalconfigmenuinfo)**||Menu folder containing **[tools](#markdown-header-portalconfigmenutools)** or **[staticlinks](#markdown-header-portalconfigmenustaticlinks)**.|false|
|tools|no|**[tools](#markdown-header-portalconfigmenutools)**||Menu folder containing tools.|false|
|tree|no|**[tree](#markdown-header-portalconfigmenutree)**||Representation and position of the topic selection tree.|false|

***

#### Portalconfig.menu.legend

Legend configuration options.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|name|yes|String||Legend name.|false|
|glyphicon|no|String|"glyphicon-book"|Legend glyphicon.|false|
|showCollapseAllButton|no|Boolean|false|Option to en-/disable all legends.|false|

***

#### Portalconfig.menu.info

[inherits]: # (Portalconfig.menu.folder)

This is a menu tab typically containing links (`staticlinks`) to external information sources. It may also contain tools (`tools`).

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|children|no|**[children](#markdown-header-portalconfigmenuinfochildren)**||Menu tab children configuration.|false|

***

##### Portalconfig.menu.info.children

[type:staticlink]: # (Portalconfig.menu.staticlinks.staticlink)

List of tools (`tools`) or links (`staticlinks`) appearing in the menu tab `info`.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|staticlinks|no|**[staticlink](#markdown-header-portalconfigmenustaticlinks)**[]||Configuration object creating links in the menu tab.|false|

***

#### Portalconfig.menu.tree
Hier können die Menüeinträge und deren Anordnung konfiguriert werden. Die Reihenfolge der Werkzeuge ergibt sich aus der Reihenfolge in der *Config.json*.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|name|yes|String||Name des Themenbaumes.|false|
|glyphicon|no|String||CSS Klasse des glyphicons.|false|
|isInitOpen|no|Boolean|false|Gibt an ob der Themenbaum initial geöffnet ist.|false|

***

#### Portalconfig.menu.folder

[type:tool]: # (Portalconfig.menu.tool)
[type:staticlinks]: # (Portalconfig.menu.staticlinks)

A folder object defined by a name, glyphicon, and its children.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|name|yes|String||Folder's menu name.|false|
|glyphicon|yes|String|"glyphicon-folder-open"|CSS glyphicon class shown in front of the folder name.|false|
|children|no|**[tool](#markdown-header-portalconfigmenutool)**/**[staticlinks](#markdown-header-portalconfigmenustaticlinks)**||Folder child elements.|false|

**Example**

```json
{
    "tools":{
        "name": "Werkzeuge",
        "glyphicon": "glyphicon-wrench",
        "children": {
            "legend": {
                "name": "Legende",
                "glyphicon": "glyphicon-book"
            }
        }
    }
}
```

***

### Portalconfig.menu.tools

[inherits]: # (Portalconfig.menu.folder)
[type:tool]: # (Portalconfig.menu.tool)

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|children|no|**[children](#markdown-header-portalconfigmenutoolschildren)**||Tool configuration.|false|

***

#### Portalconfig.menu.tools.children

[type:tool]: # (Portalconfig.menu.tool)
[type:compareFeatures]: # (Portalconfig.menu.tool.compareFeatures)
[type:parcelSearch]: # (Portalconfig.menu.tool.parcelSearch)
[type:print]: # (Portalconfig.menu.tool.print)
[type:routing]: # (Portalconfig.menu.tool.routing)
[type:draw]: # (Portalconfig.menu.tool.draw)
[type:featureLister]: # (Portalconfig.menu.tool.featureLister)
[type:lines]: # (Portalconfig.menu.tool.lines)
[type:animation]: # (Portalconfig.menu.tool.animation)
[type:layerSlider]: # (Portalconfig.menu.tool.layerSlider)
[type:contact]: # (Portalconfig.menu.tool.contact)
[type:filter]: # (Portalconfig.menu.tool.filter)
[type:shadow]: # (Portalconfig.menu.tool.shadow)
[type:virtualcity]: # (Portalconfig.menu.tool.virtualcity)
[type:gfi]: # (Portalconfig.menu.tool.gfi)
[type:wfst]: # (Portalconfig.menu.tool.wfst)
[type:measure]: # (Portalconfig.menu.tool.measure)
[type:styleWMS]: # (Portalconfig.menu.tool.styleWMS)
[type:legend]: # (Portalconfig.menu.legend)
[type:saveSelection]: # (Portalconfig.menu.tool.saveSelection)
[type:searchByCoord]: # (Portalconfig.menu.tool.searchByCoord)

List of all configurable tools. Each tool inherits the properties of **[tool](#markdown-header-portalconfigmenutool)** and can (or must, respectively) provide the defined attributes as mentioned in that definition.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|addWMS|no|**[tool](#markdown-header-portalconfigmenutool)**||This tool allows loading specific WMS layers. This is done by providing a URL. All the service's layers are retrieved and offered in the layer tree in section "External technical data". Using this tool is only compatible with the `treeType` "custom" or "default".|true|
|animation|no|**[animation](#markdown-header-portalconfigmenutoolanimation)**||Commute animation with dot-like elements.|false|
|compareFeatures|no|**[compareFeatures](#markdown-header-portalconfigmenutoolcomparefeatures)**||Offers a comparison option for vector features. The getFeatureInfo (GFI) window will offer a clickable star symbol to put elements on the comparison list. Works when used together with the GFI theme **Default**.|false|
|contact|no|**[contact](#markdown-header-portalconfigmenutoolcontact)**||The contact form allows users to send messages to a configured mail address. For example, this may be used to allow users to submit errors and suggestions.|false|
|coord|no|**[tool](#markdown-header-portalconfigmenutool)**||_Deprecated in 3.0.0. Please use `supplyCoord` instead._ Tool to read coordinates on mouse click. When clicking once, the coordinates in the view are frozen and can be copied on clicking the displaying input elements to the clipboard, i.e. you can use them in another document/chat/mail/... with `Strg+V`.|false|
|draw|no|**[draw](#markdown-header-portalconfigmenutooldraw)**||The draw tool allows painting points, lines, polygons, circles, double circles, and texts to the map. You may download these drawing as KML, GeoJSON, or GPX.|false|
|extendedFilter|no|**[tool](#markdown-header-portalconfigmenutool)**||_Deprecated in 3.0.0. Please use "filter" instead._ Dynamic filtering of WFS features. This requires an `extendedFilter` configuration on the WFS layer object.|false|
|featureLister|no|**[featureLister](#markdown-header-portalconfigmenutoolfeaturelister)**||Lists all features of a vector layer.|false|
|fileImport|no|**[tool](#markdown-header-portalconfigmenutool)**||Import KML, GeoJSON, and GPX files with this tool.|false|
|filter|no|**[filter](#markdown-header-portalconfigmenutoolfilter)**||Allows filtering WFS vector data.|false|
|gfi|no|**[gfi](#markdown-header-portalconfigmenutoolgfi)**||Via  getFeatureInfo (GFI) information to arbitrary layers can be requested. For WMS, the data is fetched with a GetFeatureInfo request. Vector data (WFS, Sensor, GeoJSON, etc.) is already present in the client and will be shown from the already fetched information.|false|
|kmlimport|no|**[tool](#markdown-header-portalconfigmenutool)**||_Deprecated in 3.0.0. Please use `fileImport` instead._|false|
|layerSlider|no|**[layerSlider](#markdown-header-portalconfigmenutoollayerslider)**||The layerSlider tool allows showing arbitrary services in order. This can e.g. be used to show aerial footage from multiple years in succession.|false|
|layerslider|no|**[layerSlider](#markdown-header-portalconfigmenutoollayerslider)**||_Deprecated in 3.0.0. Please use `layerSlider` instead._|false|
|legend|no|**[legend](#markdown-header-portalconfigmenulegend)**||The legend for all visible layers is displayed here.|false|
|lines|no|**[lines](#markdown-header-portalconfigmenutoollines)**||Commute animation with line-like objects.|false|
|measure|no|**[measure](#markdown-header-portalconfigmenutoolmeasure)**||Allows measuring areas and distances in the units m/km resp. m²/km².|false|
|parcelSearch|no|**[parcelSearch](#markdown-header-portalconfigmenutoolparcelsearch)**||The parcel search tool allows searching for parcels by district and parcel number. Many German administrative units feature a tripartite order, hence the tool offers searching by "Gemarkung" (district), "Flur" (parcel) (not used in Hamburg), and "Flurstück" (literally "parcel piece").|false|
|print|no|**[print](#markdown-header-portalconfigmenutoolprint)**||Printing module that can be used to export the map's current view as PDF.|false|
|routing|no|**[routing](#markdown-header-portalconfigmenutoolrouting)**||Tool to compute routes.|true|
|saveSelection|no|**[saveSelection](#markdown-header-portalconfigmenutoolsaveselection)**||Tool that allows saving the map's current state as sharable URL. This will list all currently visible layers in order, transparency, and visibility, as well as saving the center coordinate.|false|
|searchByCoord|no|**[searchByCoord](#markdown-header-portalconfigmenutoolsearchbycoord)**||Coordinate search with switchable coordinate reference system. The tool will zoom to any given coordinate and set a marker on it.|false|
|selectFeatures|no|**[tool](#markdown-header-portalconfigmenutool)**||Allows selecting a set of vector features by letting the user draw a box on the map. Features in that box will be displayed with GFI information.|false|
|shadow|no|**[shadow](#markdown-header-portalconfigmenutoolshadow)**||Configuration object for the 3D mode shadow time.|false|
|styleWMS|no|**[styleWMS](#markdown-header-portalconfigmenutoolstylewms)**||Classification of WMS services. This tool is used in the commute portal of MRH (Metropolregion Hamburg, en.: Metropolitan area Hamburg). With a mask, classifications can be defined. The GetMap request will have an SLD body as payload, used by the server to render. The WMS service now delivers its tiles in the defined classifications and colors.|true|
|styleVT|no|**[tool](#markdown-header-portalconfigmenutool)**||Style selection for VT services. Allows switching between styles of a Vector Tile Layer that provides multiple stylings via the `services.json` file.|false|
|supplyCoord|no|**[tool](#markdown-header-portalconfigmenutool)**||Tool to read coordinates on mouse click. When clicking once, the coordinates in the view are frozen and can be copied on clicking the displaying input elements to the clipboard, i.e. you can use them in another document/chat/mail/... with `Strg+V`.|false|
|virtualcity|no|**[virtualcity](#markdown-header-portalconfigmenutoolvirtualcity)**||*virtualcityPLANNER* planning viewer|false|
|wfsFeatureFilter|no|**[tool](#markdown-header-portalconfigmenutool)**||_Deprecated in 3.0.0. Please use `filter` instead._ Filters WFS features. This required configuring `"filterOptions"` on the WFS layer object.|false|
|wfst|no|**[wfst](#markdown-header-portalconfigmenutoolwfst)**||WFS-T module to visualize, create, update, and delete features.|false|

***

#### Portalconfig.menu.tool

A tool's attribute key defines which tool is loaded. Each tool provides at least the following attributes. To see further configuration options, please visit the **[tools](#markdown-header-portalconfigmenutools)** section.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|active|no|Boolean|false|Whether the tool is open initially.|false|
|glyphicon|no|String||CSS glyphicon class. Glyphicon is shown before the tool name.|false|
|isVisibleInMenu|no|Boolean|true|If true, the tool is listed in the menu.|false|
|keepOpen|no|Boolean|false|Whether the tool remains open parallel to other tools.|false|
|name|yes|String||Name displayed in the menu.|false|
|onlyDesktop|no|Boolean|false|Whether the tool should only be visible in desktop mode.|false|
|renderToWindow|no|Boolean|true|Whether the tool should be displayed in the movable widget element.|false|
|resizableWindow|no|Boolean|false|Whether the tool window can be minimized/restored.|false|

**Example**

```json
{
    "legend":{
        "name": "Legende",
        "glyphicon": "glyphicon-book"
    }
}
```

***

#### Portalconfig.menu.tool.gfi

[inherits]: # (Portalconfig.menu.tool)

Displays information to a clicked feature by firing a *GetFeatureInfo* or *GetFeature* request, respectively using the loaded data on vector layers.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|name|yes|String||Name displayed in the menu.|false|
|centerMapToClickPoint|no|Boolean|false|If true, centers any clicked feature on the map. Only relevant if the `desktopType` attribute is "detached".|false|
|glyphicon|no|String|"glyphicon-info-sign"|CSS glyphicon class. Glyphicon is shown before the tool name.|false|
|isActive|no|Boolean|true|Whether GFI is active initially.|false|
|desktopType|no|String|"detached"|Used to choose a GFI template in desktop mode. If using "attached", the GFI will be positioned next to the feature. Using "detached" will place a marker on the feature and create the GFI window to the right of the map.|false|
|centerMapMarkerPolygon|no|Boolean|false|Specification of whether the clicked feature is used to get the center coordinate or the actually clicked coordinate is used.|false|
|highlightVectorRules|no|**[highlightVectorRules](#markdown-header-portalconfigmenutoolgfihighlightvectorrules)**||Rule definition to override the styling of clicked vector data.|false|

**Examples**

```json
{
    "gfi":{
        "name": "Request information",
        "glyphicon": "glyphicon-info-sign",
        "isActive": true,
        "centerMapMarkerPolygon": true,
        "highlightVectorRules": {
            "fill": {
                "color": [215, 102, 41, 0.9]
            },
            "image": {
                "scale": 1.5
            },
            "stroke": {
                "width": 4
            },
            "text": {
                "scale": 2
            }
        }
    }
}
```

```json
{
    "gfi": {
        "name": "Request information",
        "glyphicon": "glyphicon-info-sign",
        "isActive": true,
        "centerMapMarkerPolygon": true
    }
}
```

***

##### Portalconfig.menu.tool.gfi.highlightVectorRules

Configuration list to overwrite vector styles on gfi requests.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|fill|no|**[fill](#markdown-header-portalconfigmenutoolgfihighlightvectorrulesfill)**||Settable field: `color`|false|
|image|no|**[image](#markdown-header-portalconfigmenutoolgfihighlightvectorrulesimage)**||Settable field: `scale`|false|
|stroke|no|**[stroke](#markdown-header-portalconfigmenutoolgfihighlightvectorrulesstroke)**||Settable field: `width`|false|
|text|no|**[text](#markdown-header-portalconfigmenutoolgfihighlightvectorrulestext)**||Settable field: `scale`|false|

***

##### Portalconfig.menu.tool.gfi.highlightVectorRules.fill

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|color|no|Float[]|[255, 255, 255, 0.5]|RGBA value|false|

```json
{
    "fill": { "color": [215, 102, 41, 0.9] }
}
```

***

##### Portalconfig.menu.tool.gfi.highlightVectorRules.image
|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|scale|no|Float|1|Scale number|false|

```json
{
    "image": { "scale": 1.5 }
}
```

***

##### Portalconfig.menu.tool.gfi.highlightVectorRules.stroke
|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|width|no|Integer|1|Stroke line width|false|

```json
{
    "stroke": { "width": 4 }
}
```

***

##### Portalconfig.menu.tool.gfi.highlightVectorRules.text
|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|scale|no|Float|1|Text scale number|false|

```json
{
    "text": { "scale": 2 }
}
```

***

#### Portalconfig.menu.tool.filter

[inherits]: # (Portalconfig.menu.tool)

The filter tool offers a range of options to filter vector data.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|allowMultipleQueriesPerLayer|no|Boolean|false|Defines whether selecting only filters the chosen layers or if filter options regarding deselected layers are retained.|false|
|deactivateGFI|no|Boolean|false|If set `true`, the filter tool deactivates gfi requests while open.|false|
|isGeneric|no|Boolean|false|Whether filters can be created dynamically. Not yet implemented.|false|
|minScale|no|Integer||Minimum zoom level the filter zooms to when displaying filter results.|false|
|liveZoomToFeatures|no|Boolean|false|Defines whether the filter immediately zooms to filter results.|false|
|predefinedQueries|no|[predefinedQuery](#markdown-header-portalconfigmenutoolfilterpredefinedquery)[]||Filter query definition.|false|
|saveToUrl|no|Boolean|true|Saves the current filter result to the URL, allowing to save it to e.g. your bookmarks.|false|

**Example**

This example uses Hamburg's school and hospital layers, hence a lot of German technical keys are in use.

```json
{
    "filter":{
        "name": "Filter",
        "glyphicon": "glyphicon-filter",
        "deactivateGFI": false,
        "isGeneric": false,
        "isInitOpen": false,
        "allowMultipleQueriesPerLayer": false,
        "predefinedQueries": [
            {
                "layerId": "8712",
                "isActive": false,
                "isSelected": false,
                "name": "Grundschulen",
                "predefinedRules": [
                    {
                        "attrName": "kapitelbezeichnung",
                        "values": ["Grundschulen", "Langformschulen"]
                    }
                ],
                "attributeWhiteList": ["bezirk", "stadtteil", "schulform", "ganztagsform", "anzahl_schueler", "schwerpunktschule", "bilingual"]
            },
            {
                "layerId": "8712",
                "isActive": false,
                "isSelected": false,
                "name": "Stadtteilschulen",
                "predefinedRules": [
                    {
                        "attrName": "kapitelbezeichnung",
                        "values": ["Stadtteilschulen", "Langformschulen"]
                    }
                ],
                "attributeWhiteList": ["bezirk", "stadtteil", "schulform", "ganztagsform", "anzahl_schueler", "schwerpunktschule", "fremdsprache", "fremdsprache_mit_klasse", "schulische_ausrichtung"]
            },
            {
                "layerId": "8712",
                "isActive": false,
                "isSelected": false,
                "name": "Gymnasien",
                "info": "Sie finden berufliche Gymnasien ab der Klassenstufe 11 bei den Beruflichen Schulen.",
                "predefinedRules": [
                    {
                        "attrName": "kapitelbezeichnung",
                        "values": ["Gymnasien"]
                    }
                ],
                "attributeWhiteList": ["bezirk", "stadtteil", "schulform", "ganztagsform", "anzahl_schueler", "fremdsprache", "fremdsprache_mit_klasse", "schulische_ausrichtung"]
            },
            {
                "layerId": "8712",
                "isActive": false,
                "isSelected": false,
                "name": "Sonderschulen",
                "predefinedRules": [
                    {
                        "attrName": "kapitelbezeichnung",
                        "values": ["Sonderschulen"]
                    }
                ],
                "attributeWhiteList": ["bezirk", "stadtteil", "ganztagsform", "foerderart", "abschluss"]
            },
            {
            "layerId": "1711",
            "isActive": true,
            "isSelected": true,
            "name": "Krankenhäuser",
            "predefinedRules": [],
            "attributeWhiteList": ["teilnahme_geburtsklinik", "teilnahme_notversorgung"]
            }
        ]
    }
}
```

***

#### Portalconfig.menu.tool.filter.predefinedQuery

Object defining a filter query.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|layerId|yes|String||Layer id; must be configured in the `Themenconfig`.|false|
|isActive|no|Boolean|false|Defines whether this filter should be applied initially.|false|
|isSelected|no|Boolean|false|Defines whether this filter should be shown initially.|false|
|searchInMapExtent|no|Boolean|false|Defines whether the filter is only applied to features within the map's current view.|false|
|info|no|String||Short information text shown above the filter options.|false|
|predefinedRules|no|**[predefinedRule](#markdown-header-portalconfigmenutoolfilterpredefinedquerypredefinedrule)**[]||Filter rule that pre-filters the data.|true|
|attributeWhiteList|no|String[]/**[attributeWhiteListObject](#markdown-header-portalconfigmenutoolfilterpredefinedqueryattributewhitelistobject)**[]||Whitelist for applicable attributes.|true|
|snippetType|no|String||Attribute data type. When not defined, the data type is inferred. In exceptional cases, this can be overwritten manually, e.g. with "checkbox-classic". This is required on the touch tablet portal version of the DIPAS project.|true|
|useProxy|no|Boolean|false|_Deprecated in the next major release. [GDI-DE](https://www.gdi-de.org/en) recommends setting CORS headers on the required services instead of using proxies._ Defines whether the service URL should be requested via proxy. In that case, dots in the URL are replaced with underscores.|false|

**Example**

```json
{
    "layerId": "8712",
    "isActive": false,
    "isSelected": false,
    "name": "Grundschulen",
    "predefinedRules": [
        {
            "attrName": "kapitelbezeichnung",
            "values": ["Grundschulen", "Langformschulen"]
        }
    ],
    "attributeWhiteList": ["bezirk", "stadtteil", "schulform", "ganztagsform", "anzahl_schueler", "schwerpunktschule", "bilingual"]
}
```

***

#### Portalconfig.menu.tool.filter.predefinedQuery.predefinedRule

Filter rule always applied to pre-filter data.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|attrName|yes|String||Attribute name used for pre-filtering.|false|
|values|yes|String[]||Attribute value expected when pre-filtering.|false|

**Example**

```json
{
    "attrName": "kapitelbezeichnung",
    "values": ["Grundschulen", "Langformschulen"]
}
```

***

#### Portalconfig.menu.tool.filter.predefinedQuery.attributeWhiteListObject

This key may have as value either a string representing the attribute name or an object. When given as an object, the attributes to be filtered can be renamed in the process. In that case, the key is the original attribute name, and the value the new name.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|name|yes|String||Attribute name.|false|
|matchingMode|no|enum["AND", "OR"]|"OR"|Logical connection of multiple attribute values (on multiple choices) within an attribute.|false|

**String example**

```json
"Grundschulen"
```

**Object example**

```json
{
    "name": "Grundschulen",
    "matchingMode": "AND"
}
```

***

#### Portalconfig.menu.tool.compareFeatures

[inherits]: # (Portalconfig.menu.tool)

This tool allows comparing vector features.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|numberOfFeaturesToShow|no|Integer|3|Maximum amount of features selectable for comparison.|false|
|numberOfAttributesToShow|no|Integer|12|Maximum amount of attributes initially shown. If more attributes are available, they can be  shown and hidden by clicking a button.|false|

**Example**

```json
{
    "compareFeatures": {
        "name": "Vergleichsliste",
        "glyphicon": "glyphicon-th-list",
        "numberOfFeaturesToShow": 5,
        "numberOfAttributesToShow": 10
    }
}
```

***

#### Portalconfig.menu.tool.parcelSearch

[inherits]: # (Portalconfig.menu.tool)

Parcel search.

>**⚠️ This requires a backend!**
>
>**Depending on your configuration, special stored queries of a WFS are requested with given parameters.**

Example request: **https://geodienste.hamburg.de/HH_WFS_DOG?service=WFS&request=GetFeature&version=2.0.0&&StoredQuery_ID=Flurstueck&gemarkung=0601&flurstuecksnummer=00011**

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|serviceId|yes|String||Id of the service to request. Resolved using the **[rest-services.json](rest-services.json.md)** file.|false|
|storedQueryId|yes|String||Id of the stored query to use.|true|
|configJSON|yes|String||Path to the configuration file holding districts. **[Example file](https://geoportal-hamburg.de/lgv-config/gemarkungen_hh.json)**.|false|
|parcelDenominator|no|Boolean|false|Flag defining whether parcel denominators are used as a level. (Hamburg special: As a city state, Hamburg has no parcel denominators.)|false|
|styleId|no|String||Allows choosing a style id from the `style.json` file to overwrite the map marker default style.|false|
|zoomLevel|no|Number|7|Defines to which zoom level the tool should zoom.|false|

**Example**

```json
{
    "parcelSearch": {
        "name": "Flurstückssuche",
        "glyphicon": "glyphicon-search",
        "serviceId": "6",
        "storedQueryID": "Flurstueck",
        "configJSON": "/lgv-config/gemarkungen_hh.json",
        "parcelDenominator": false,
        "styleId": "flaecheninfo"
    }
}
```

***

#### Portalconfig.menu.tool.saveSelection

[inherits]: # (Portalconfig.menu.tool)

Tool to save the current map content as a url.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|simpleMap|no|Boolean|false|Adds a SimpleMap URL to the component. When calling this URL, the menu bar, layer tree, and map controls are deactivated.|false|

***

#### Portalconfig.menu.tool.searchByCoord

[inherits]: # (Portalconfig.menu.tool)

Coordinate search.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|zoomLevel|no|Number|7|Defines to which zoom level the tool should zoom.|false|

**Example**

```json
{
    "searchByCoord": {
        "name": "Flurstückssuche",
        "glyphicon": "glyphicon-record",
        "zoomLevel": 7
    }
}
```

***

#### Portalconfig.menu.tool.print

[inherits]: # (Portalconfig.menu.tool)

Print module, configurable for 3 print services: *High Resolution PlotService*, *MapfishPrint 2* (_Deprecated in 3.0.0_), and *MapfishPrint 3*. Printing vector tile layers is not supported, since the print services themselves do not support it. Should users try to print such layers, a warning will be shown.

>**⚠️ This requires a backend!**
>
>**A [Mapfish-Print2](http://www.mapfish.org/doc/print/index.html), [Mapfish-Print3](http://mapfish.github.io/mapfish-print-doc), or *HighResolutionPlotService* is required as backend.**

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|mapfishServiceId|yes|String||Print service id. Resolved using the **[rest-services.json](rest-services.json.md)** file.|false|
|currentLayoutName|no|String|""|Defines which layout is the default layout on opening the print tool, e.g. "A4 portrait format". If the given layout is not available oder none is provided, the first layout mentioned in the Capabilities is used.|false|
|printAppId|no|String|"master"|Print service print app id. This tells the print service which template(s) to use.|false|
|filename|no|String|"report"|Print result file name.|false|
|title|no|String|"PrintResult"|Document title appearing as header.|false|
|version|no|String||Flag determining which print service is in use. `"HighResolutionPlotService"` activates the *High Resolution PlotService*, if the parameter is not set, *Mapfish 2* is used. Else, *MapfishPrint 3* is used.|false|
|printID|no|String||_Deprecated in 3.0.0._ Id of the print service to use. Resolved using the **[rest-services.json](rest-services.json.md)** file.|false|
|outputFilename|no|String|"report"|_Deprecated in 3.0.0._ Print result file name.|false|
|gfi|no|Boolean|false|_Deprecated in 3.0.0._|false|
|configYAML|no|String|"/master"|_Deprecated in 3.0.0._ Configuration of the template to be used.|false|
|isLegendSelected|no|Boolean|false|Defines whether a checkbox to print the legend is offered. Only used for print services supporting legend printing (Mapfish Print 3).|false|
|legendText|no|String|"Mit Legende"|Descriptive text for the legend print checkbox.|false|
|dpiForPdf|no|Number|200|DPI resolution for the map in the PDF file.|false|
|useProxy|no|Boolean|false|_Deprecated in the next major release. [GDI-DE](https://www.gdi-de.org/en) recommends setting CORS headers on the required services instead of using proxies._ Defines whether a service URL should be requested via proxy. For this, dots in the URL are replaced with underscores.|false|

**MapfishPrint2 example configuration**

```json
{
    "print": {
        "name": "Karte drucken",
        "glyphicon": "glyphicon-print",
        "printID": "123456",
        "configYAML": "/master",
        "outputFilename": "report",
        "title": "My Title",
        "gfi": true
    }
}
```

**High Resolution PlotService example configuration**

```json
{
    "print": {
        "name": "Karte drucken",
        "glyphicon": "glyphicon-print",
        "mapfishServiceId": "123456",
        "filename": "Print",
        "title": "My Title",
        "version" : "HighResolutionPlotService"
    }
}
```

**MapfishPrint3 example configuration**

```json
{
    "print": {
        "name": "Karte drucken",
        "glyphicon": "glyphicon-print",
        "mapfishServiceId": "mapfish_printservice_id",
        "printAppId": "mrh",
        "filename": "Print",
        "title": "Mein Titel",
        "version" : "mapfish_print_3"
    }
}
```

***

#### Portalconfig.menu.tool.routing

[inherits]: # (Portalconfig.menu.tool)

Routing module.

>**⚠️ This requires a backend!**
>
>**Routing is performed on external data and included in just a few portals, e.g. the [Traffic portal](https://geoportal-hamburg.de/verkehrsportal).**

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|viomRoutingID|yes|String||ID of the routing service to use. Resolved using the **[rest-services.json](rest-services.json.md)** file.|false|
|bkgSuggestID|yes|String||BKG suggestion service id. Used to retrieve address suggestions. Resolved using the **[rest-services.json](rest-services.json.md)** file.|false|
|bkgGeosearchID|yes|String||BKG geocoding service. Used to convert chosen addresses to coordinates. Resolved using the **[rest-services.json](rest-services.json.md)** file.|false|
|isInitOpen|no|Boolean|false|Whether the tool is initially open.|false|

**Example**

```json
{
    "routing": {
        "name": "Routing Planner",
        "glyphicon": "glyphicon-road",
        "viomRoutingID": "1",
        "bkgSuggestID": "2",
        "bkgGeosearchID": "3",
        "isInitOpen": false
    }
}
```

***

#### Portalconfig.menu.tool.draw

[inherits]: # (Portalconfig.menu.tool)

Module used to draw features on the map. This includes points, which may also be represented by symbols, and (double) circles, polygons, polylines, and text.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|name|yes|String||Tool name in the menu.|false|
|iconList|no|**[icon](#markdown-header-portalconfigmenutooldrawicon)**[]|[{"id": "iconPoint", "type": "simple_point", "value": "simple_point"}, {"id": "yellow pin", "type": "image", "scale": 0.5, "value": "https://maps.google.com/mapfiles/kml/pushpin/ylw-pushpin.png"}]|List of symbols the user may choose from to draw colored symbols or dots. Images may be used, too, as shown in the example.|false|
|drawSymbolSettings|no|**[drawSymbolSet](#markdown-header-portalconfigmenutooldrawdrawsymbolset)**|{"color": [55, 126, 184, 1], "opacity": 1}|Pre-configuration for symbol drawing.|false|
|drawLineSettings|no|**[drawLineSet](#markdown-header-portalconfigmenutooldrawdrawlineset)**|{"strokeWidth": 1, "opacityContour": 1, "colorContour": [0, 0, 0, 1]}|Pre-configuration for line drawing.|false|
|drawCurveSettings|no|**[drawCurveSet](#markdown-header-portalconfigmenutooldrawdrawcurveset)**|{"strokeWidth": 1, "opacityContour": 1, "colorContour": [0, 0, 0, 1]}|Pre-configuration for freehand drawing.|false|
|drawAreaSettings|no|**[drawAreaSet](#markdown-header-portalconfigmenutooldrawdrawareaset)**|{"strokeWidth": 1, "color": [55, 126, 184, 1], "opacity": 1, "colorContour": [0, 0, 0, 1], "opacityContour": 1}|Pre-configuration for area drawing.|false|
|drawCircleSettings|no|**[drawCircleSet](#markdown-header-portalconfigmenutooldrawdrawcircleset)**|{"circleMethod": "interactive", "unit": "m", "circleRadius": null, "strokeWidth": 1, "color": [55, 126, 184, 1], "opacity": 1, "colorContour": [0, 0, 0, 1], "opacityContour": 1, "tooltipStyle": {"fontSize": "16px", "paddingTop": "3px", "paddingLeft": "3px", "paddingRight": "3px", "backgroundColor": "rgba(255, 255, 255, .9)"}}|Pre-configuration for circle drawing.|false|
|drawDoubleCircleSettings|no|**[drawDoubleCircleSet](#markdown-header-portalconfigmenutooldrawdrawdoublecircleset)**|{"circleMethod": "defined", "unit": "m", "circleRadius": 0, "circleOuterRadius": 0, "strokeWidth": 1, "color": [55, 126, 184, 1], "opacity": 1, "colorContour": [0, 0, 0, 1], "outerColorContour": [0, 0, 0, 1], "opacityContour": 1}|Pre-configuration for double circle drawing.|false|
|writeTextSettings|no|**[writeTextSet](#markdown-header-portalconfigmenutooldrawwritetextset)**|{"text": "", "fontSize": 10, "font": "Arial", "color": [55, 126, 184, 1], "opacity": 1}|Pre-configuration for text writing.|false|
|download|no|**[download](#markdown-header-portalconfigmenutooldrawdownload)**|{"preSelectedFormat": "KML"}|Pre-configuration for download.|false|

**Example**

```
#!json
{
    "draw": {
        "name": "Draw / Write",
        "glyphicon": "glyphicon-pencil",
        "iconList": [
            {
                "id": "iconPoint",
                "type": "simple_point",
                "value": "simple_point"
            },
            {
                "id": "iconMeadow",
                "type": "image",
                "scale": 0.8,
                "value": "meadow.png"
            },
            {
                "id": "yellow pin",
                "type": "image",
                "scale": 0.5,
                "value": "https://maps.google.com/mapfiles/kml/pushpin/ylw-pushpin.png"
            }
        ],
        "drawDoubleCircleSettings": {
            "circleRadius": 1500,
            "circleOuterRadius": 3000,
            "strokeWidth": 3,
            "color": [55, 126, 184, 0],
            "opacity": 0,
            "colorContour": [228, 26, 28, 1],
            "opacityContour": 1,
            "tooltipStyle": {
                "fontSize": "14px",
                "paddingTop": "3px",
                "paddingLeft": "3px",
                "paddingRight": "3px",
                "backgroundColor": "rgba(255, 255, 255, .9)"
            }
        }
    }
}
```

***

#### Portalconfig.menu.tool.draw.icon

Dot object consisting of text, type, and value.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|id|yes|String||Symbol text displayed in the select menu. The id has to be defined in the locale file (usually `common`) as `modules.tools.draw.iconList` child. The following entry should begin with `icon` and contain a representative description. If the key is not found, the `id` will appear as string on the user interface.|false|
|caption|no|String||_Deprecated in 3.0.0._ Symbol text displayed in the select menu. Unlike `id`, not only the id itself, but the whole path (`modules.tools.draw.iconList` + id) has to be given.|false|
|type|yes|enum["image", "simple_point"]||Object type to be drawn. If `image` is chosen, the PNG or SVG file from the `value` path is drawn. By default, images are to be placed in the `/img/tools/draw/` directory and should have a height and width of 96px to scale correctly. Alternatively, a working `scale` factor must be defined. The key `simple_point` will draw a simple point.|false|
|scale|no|number||Scale factor for images.|false|
|value|yes|String||Value of the object to be drawn. If no path or URL is set, a file name is expected, and the *config.js* entry `wfsImgPath` is expected to be the file's location.|false|

**Example**

```json
{
    "iconList": [
        {
            "id": "iconPoint",
            "type": "simple_point",
            "value": "simple_point"
        },
        {
            "id": "iconMeadow",
            "type": "image",
            "scale": 0.8,
            "value": "meadow.png"
        },
        {
            "id": "yellow pin",
            "type": "image",
            "scale": 0.5,
            "value": "https://maps.google.com/mapfiles/kml/pushpin/ylw-pushpin.png"
        }
    ]
}
```

***


#### Portalconfig.menu.tool.draw.drawSymbolSet

Object to change the drawing tool's configured point symbol default value.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|color|yes|Number[]|[55, 126, 184, 1]|The pre-configured color of the symbol as RGB color. The alpha channel value is used for point coloring.|false|
|opacity|yes|Number|1|The pre-configured transparency of symbols, given in range [0..1] for point data.|false|


**Example**

```json
{
    "color": [55, 126, 184, 1],
    "opacity": 1
}
```

***

#### Portalconfig.menu.tool.draw.drawLineSet

Object to change the drawing tool's configured line default value.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|strokeWidth|yes|Number|1|Pre-configured stroke width of lines in pixels.|false|
|colorContour|yes|Number[]|[0, 0, 0, 1]|Pre-configured line color in RGBA.|false|
|opacityContour|yes|Number|1|Pre-configured line transparency in range [0..1].|false|

**Example**

```json
{
    "strokeWidth": 1,
    "opacityContour": 1,
    "colorContour": [0, 0, 0, 1]
}
```

***

#### Portalconfig.menu.tool.draw.drawCurveSet

Object to change the drawing tool's configured freehand drawing default value.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|strokeWidth|yes|Number|1|Pre-configured stroke width of lines in pixels.|false|
|colorContour|yes|Number[]|[0, 0, 0, 1]|Pre-configured line color in RGBA.|false|
|opacityContour|yes|Number|1|Pre-configured line transparency in range [0..1].|false|

**Example**

```json
{
    "strokeWidth": 1,
    "opacityContour": 1,
    "colorContour": [0, 0, 0, 1]
}
```

***

#### Portalconfig.menu.tool.draw.drawAreaSet

Object to change the drawing tool's configured area default value.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|strokeWidth|yes|Number|1|Pre-configured stroke width of area borders in pixels.|false|
|color|yes|Number[]|[55, 126, 184, 1]|Pre-configured area color in RGBA.|false|
|opacity|yes|Number|1|Pre-configured area transparency in range [0..1].|false|
|colorContour|yes|Number[]|[0, 0, 0, 1]|Pre-configured area border color in RGBA.|false|
|opacityContour|yes|Number|1|Pre-configured area border transparency in range [0..1].|false|

**Example**

```json
{
    "strokeWidth": 1,
    "color": [55, 126, 184, 1],
    "opacity": 1,
    "colorContour": [0, 0, 0, 1],
    "opacityContour": 1
}
```

***

#### Portalconfig.menu.tool.draw.drawCircleSet

Object to change the drawing tool's configured circle default value.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|circleMethod|yes|String|"interactive"|Pre-configured method of circle drawing. `"interactive"`: freehand, `"defined"`: by entering fixed values|false|
|unit|yes|String|"m"|Pre-configured unit regarding the circle's Radius `circleRadius` when `"defined"` is chosen as `circleMethod`.|false|
|circleRadius|yes|Number|0|Pre-configured circle Radius when `"defined"` is chosen as `circleMethod`.|false|
|strokeWidth|yes|Number|1|Pre-configured stroke width of circle border in pixels.|false|
|color|yes|Number[]|[55, 126, 184, 1]|Pre-configured circle color in RGBA.|false|
|opacity|yes|Number|1|Pre-configured circle transparency in range [0..1].|false|
|colorContour|yes|Number[]|[0, 0, 0, 1]|Pre-configured circle border color in RGBA.|false|
|opacityContour|yes|Number|1|Pre-configured circle border transparency in range [0..1].|false|
|tooltipStyle|no|String|{}|Pre-configured style for tooltip.|false|

**Example**

```
#!json
{
    "circleMethod": "interactive",
    "unit": "m",
    "circleRadius": 0,
    "strokeWidth": 1,
    "color": [55, 126, 184, 1],
    "opacity": 1,
    "colorContour": [0, 0, 0, 1],
    "opacityContour": 1
}
```

***

#### Portalconfig.menu.tool.draw.drawDoubleCircleSet

Object to change the drawing tool's configured circle default value.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|circleMethod|yes|String|"defined"|Pre-configured method of circle drawing. `"interactive"`: freehand, `"defined"`: by entering fixed values|false|
|unit|yes|String|"m"|Pre-configured unit regarding the circle's radius `circleRadius` and `circleOuterRadius` when `"defined"` is chosen as `circleMethod`.|false|
|circleRadius|yes|Number|0|Pre-configured inner circle radius when `"defined"` is chosen as `circleMethod`.|false|
|circleOuterRadius|yes|Number|0|Pre-configured outer circle radius when `"defined"` is chosen as `circleMethod`.|false|
|strokeWidth|yes|Number|1|Pre-configured stroke width of circle border in pixels.|false|
|color|yes|Number[]|[55, 126, 184, 1]|Pre-configured circle color in RGBA.|false|
|opacity|yes|Number|1|Pre-configured double circle transparency in range [0..1].|false|
|colorContour|yes|Number[]|[0, 0, 0, 1]|Pre-configured inner circle border color in RGBA.|false|
|outerColorContour|yes|Number[]|[0, 0, 0, 1]|Pre-configured outer circle border color in RGBA.|false|
|opacityContour|yes|Number|1|Pre-configured circle border transparency in range [0..1].|false|

**Example**

```json
{
    "circleMethod": "defined",
    "unit": "m",
    "circleRadius": 0,
    "circleOuterRadius": 0,
    "strokeWidth": 1,
    "color": [55, 126, 184, 1],
    "opacity": 1,
    "colorContour": [0, 0, 0, 1],
    "opacityContour": 1
}
```

***

#### Portalconfig.menu.tool.draw.writeTextSet

Object to change the drawing tool's configured text default value.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|text|yes|String|""|Pre-configured text.|false|
|fontSize|yes|Number|10|Pre-configured font size.|false|
|font|yes|String|"Arial"|Pre-configured font. Restricted to `"Arial"`, `"Calibri"`, and `"Times New Roman"`.|false|
|color|yes|Number[]|[55, 126, 184, 1]|Pre-configured font color in RGBA.|false|
|opacity|yes|Number|1|Pre-configured font transparency in range [0..1].|false|

**Example**

```json
{
    "text": "",
    "fontSize": 10,
    "font": "Arial",
    "color": [55, 126, 184, 1],
    "opacity": 1
}
```

***

#### Portalconfig.menu.tool.draw.download

Object to change the drawing tool's download preselected format. It should be one of "KML", "GEOJSON" and "GPX".

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|preSelectedFormat|no|String|"KML"|Pre-configured pre-selected form.|false|

**Example**

```json
{
    "preSelectedFormat": "KML"
}
```

***

#### Portalconfig.menu.tool.featureLister

[inherits]: # (Portalconfig.menu.tool)

Module displaying vector features. By hovering a feature in the list, its position on the map is indicated with a marker.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|maxFeatures|no|Integer|20|Amount of features to display initially. More features of the same amount can be revealed by clicking a button.|false|

**Example**

```json
{
    "featureLister": {
        "name": "List",
        "glyphicon": "glyphicon-menu-hamburger",
        "maxFeatures": 10
    }
}
```

***

#### Portalconfig.menu.tool.lines

[inherits]: # (Portalconfig.menu.tool)

A line-like depiction of commute movement used in the MRH (Metropolregion Hamburg, en.: Metropolitan area Hamburg) commute portal. This tools extends the **[pendlerCore](#markdown-header-portalconfigmenutoolpendlercore)**.

**Example**

```json
{
    "animation": {
        "name": "Commute (Animation)",
        "glyphicon": "glyphicon-play-circle",
        "url": "https://geodienste.hamburg.de/MRH_WFS_Pendlerverflechtung",
        "params": {
            "REQUEST": "GetFeature",
            "SERVICE": "WFS",
            "TYPENAME": "app:mrh_kreise",
            "VERSION": "1.1.0",
            "maxFeatures": "10000"
        },
        "featureType": "mrh_einpendler_gemeinde",
        "attrAnzahl": "anzahl_einpendler",
        "attrGemeinde": "wohnort",
        "zoomlevel": 1
    }
}
```

***

#### Portalconfig.menu.tool.measure

[inherits]: # (Portalconfig.menu.tool)

The measure tool allows measuring distances and areas. This includes the specification of measurement inaccuracies.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|earthRadius|no|Number|6378137|Earth radius in meters. Please mind that the earth radius should be chosen in accordance with the reference ellipsoid. E.g., GRS80 should be used for ETRS89 (EPSG:25832).|false|

**Example**

```json
{
    "measure": {
        "name": "translate#common:menu.tools.measure",
        "earthRadius": 6378137
    }
}
```

***

#### Portalconfig.menu.tool.animation

[inherits]: # (Portalconfig.menu.tool.pendlerCore)

A commute animation used in the MRH (Metropolregion Hamburg, en.: Metropolitan area Hamburg) commute portal. This tools extends the **[pendlerCore](#markdown-header-portalconfigmenutoolpendlercore)**.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|steps|no|Integer|50|Amount of steps to render in each animation.|false|
|minPx|no|Integer|5|Minimum size of commuter circles in pixels.|false|
|maxPx|no|Integer|20|Maximum size of commuter circles in pixels.|false|
|colors|no|String[]|[]|Amount of colors as RGBA strings, e.g. `"rgba(255,0,0,1)"`, collected in an array.|false|
|useProxy|no|Boolean|false|_Deprecated in the next major release. [GDI-DE](https://www.gdi-de.org/en) recommends setting CORS headers on the required services instead of using proxies._ Defines whether a service URL should be requested via proxy. For this, dots in the URL are replaced with underscores.|false|

**Example**

```json
{
    "animation": {
        "name": "Commute (Animation)",
        "glyphicon": "glyphicon-play-circle",
        "steps": 30,
        "url": "https://geodienste.hamburg.de/MRH_WFS_Pendlerverflechtung",
        "params": {
            "REQUEST": "GetFeature",
            "SERVICE": "WFS",
            "TYPENAME": "app:mrh_kreise",
            "VERSION": "1.1.0",
            "maxFeatures": "10000"
        },
        "featureType": "mrh_einpendler_gemeinde",
        "attrAnzahl": "anzahl_einpendler",
        "attrGemeinde": "wohnort",
        "minPx": 5,
        "maxPx": 30,
        "zoomlevel": 1,
        "colors": [
            "rgba(255,0,0,0.5)",
            "rgba(0,255,0,0.5)",
            "rgba(0,0,255,0.5)",
            "rgba(0,255,255,0.5)"
        ]
    }
}
```

***

#### Portalconfig.menu.tool.pendlerCore

[inherits]: # (Portalconfig.menu.tool)

The `pendlerCore` is the core component used in the **[lines](#markdown-header-portalconfigmenutoollines)** and **[animation](#markdown-header-portalconfigmenutoolanimation)** tools. Its properties are overwritten by their specification.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|zoomLevel|no|Integer|1|Zoom level used on zooming to a local community.|false|
|url|no|String|"https://geodienste.hamburg.de/MRH_WFS_Pendlerverflechtung"|WFS URL to request.|false|
|params|no|**[param](#markdown-header-portalconfigmenutoolpendlercoreparam)**||Parameters to send with requests.|false|
|featureType|no|String|"mrh_einpendler_gemeinde"|WFS FeatureType (Layer).|false|
|attrAnzahl|no|String|"anzahl_einpendler"|Attribute key containing the amount of commuters per local community.|false|
|attrGemeinde|no|String|"wohnort"|Attribute key containing the local community.|false|

***

#### Portalconfig.menu.tool.pendlerCore.param

Parameters relevant to service requests.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|REQUEST|no|String|"GetFeature"|Request type.|false|
|SERVICE|no|String|"WFS"|Service type.|false|
|TYPENAME|no|String|"app:mrh_kreise"|Layer type name.|false|
|VERSION|no|String|"1.1.0"|WFS version.|false|
|maxFeatures|no|String|"10000"|Maximum amount of features to retrieve.|false|

***

#### Portalconfig.menu.tool.contact

[inherits]: # (Portalconfig.menu.tool)

The contact form allows users to send messages to a configured mail address.

>**⚠️ This requires a backend!**
>
>**Contact uses an SMTP server and calls its sendmail.php.**

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|serviceID|yes|String||Email service id. Resolved using the **[rest-services.json](rest-services.json.md)** file.|false|
|from|no|**[email](#markdown-header-portalconfigmenutoolcontactemail)**[]|[{"email": "lgvgeoportal-hilfe@gv.hamburg.de","name":"LGVGeoportalHilfe"}]|Email sender. Please mind our **[hints regarding mail safety](#markdown-header-hints-regarding-email-safety)**.|false|
|to|no|**[email](#markdown-header-portalconfigmenutoolcontactemail)**[]|[{"email": "lgvgeoportal-hilfe@gv.hamburg.de","name": "LGVGeoportalHilfe"}]|Email receiver. Please mind out **[hints regarding mail safety](#markdown-header-hints-regarding-email-safety)**.|false|
|textPlaceholder|no|String|"Bitte formulieren Sie hier Ihre Frage und drücken Sie auf &quot;Abschicken&quot;"|Placeholder text for the user message input element.|false|
|includeSystemInfo|no|Boolean|false|Flag determining if the sender's system information is to be included in the email.|false|
|deleteAfterSend|no|Boolean|false|Flag determining whether the contact form is emptied and closed after successfully sending a message.|false|
|withTicketNo|no|Boolean|true|Whether successfully sending a email retrieves a ticket number for the user.|false|

**Example**

```json
{
    "contact": {
        "name": "Kontakt",
        "glyphicon": "glyphicon-envelope",
        "serviceID": "123",
        "from": [
            {
                "email": "lgvgeoportal-hilfe@gv.hamburg.de",
                "name":"LGVGeoportalSupport"
            }
        ],
        "to": [
            {
                "email": "lgvgeoportal-hilfe@gv.hamburg.de",
                "name":"LGVGeoportalSupport"
            }
        ],
        "textPlaceholder": "Please enter your message in this field.",
        "includeSystemInfo": true,
        "deleteAfterSend": true,
        "withTicketNo": false
    }
}
```

>Hints regarding email safety

The unchecked usage of *sender (FROM)*, *recipient (TO)*, *copy (CC)*, and *blind copy (BCC)* by the SMTP server is hereby **expressly discouraged** for security reasons. The unchecked usage of the customer email as a *reply to (REPLY-TO)* by the SMTP server is warned against.

We strongly recommend setting *FROM* and *TO* manually on the SMTP server without offering an option for external configuration.

>For security reasons, *Sender (FROM)* and *Empfänger (TO)* sent by the Masterportal to the SMTP server may not be used as an email's FROM and TO without further checks. This would create a security breach that allows sending malicious emails with manipulated FROM and TO by the SMTP server. Should you need the configuration in the Masterportal anyway (as in the example above), the parameters *from* and *to* may be used after checking them against a **whistelist** on the SMTP server, preventing sending to or from email addresses not mentioned on the list.

We recommend not automatically setting the customer's email address in *CC* (or *BCC*).

>For security reasons, the user may not be automatically set as *Copy (CC)* or *Blind Copy (BCC)* of an email. Such an automatism would allow sending malicious emails by entering a foreign mail address via the SMTP server.

We strongly recommend to manually remove *CC* and *BCC* on the SMTP server.

>There must be no option to set *Copy (CC)* or *Blind Copy (BCC)* via the Masterportal. Such a feature could be misused to send malicious emails via the SMTP server.

We warn against automatically setting the customer email as *REPLY-TO*.

>The unchecked copying of data to email headers is warned against depending on the security level (resp. age) of the SMTP server, since the risk of *Carriage Return* and *Line Feed* injections may lead to e.g. allowing *REPLY-TO* from the email header line to be escaped to ultimately manipulate the email header itself. (Example: "test@example.com\r\nBCC:target1@example.com,target2@example.com,(...),target(n)@example.com"). In a more abstract case, UTF attacks may be possible, where normally harmless UTF-16 or UTF-32 characters may change the email header's behavior when interpreted as ANSI or UTF-8, having a comparable effect.

***

#### Portalconfig.menu.tool.contact.email

Email object containing a mail address and a display name.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|email|no|String||Email address.|false|
|name|no|String||Display name.|false|

**Example**

```json
{
    "email": "lgvgeoportal-hilfe@gv.hamburg.de",
    "name":"LGVGeoportalHilfe"
}
```

***

#### Portalconfig.menu.tool.layerSlider

[inherits]: # (Portalconfig.menu.tool)

The layer slider tool allows showing multiple layers in a row. This may e.g. be used to animate a time series of aerial imagery.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|title|yes|String||Name displayed in the tool.|false|
|timeInterval|no|Integer|2000|Time in ms until the next layer is shown.|false|
|layerIds|yes|**[layerId](#markdown-header-portalconfigmenutoollayersliderlayerid)**[]|[]|Array of layer information objects.|false|
|sliderType|no|enum["player","handle"]|"player"|Layer slider type. `""player"` shows start, pause, and stop buttons, while `"handle"` uses a switch. In the latter case, layer transparency is adjusted additionally.|false|

**Example**

```json
{
    "layerSlider": {
        "name": "Timeline",
        "glyphicon": "glyphicon-film",
        "title": "Example WMS simulation",
        "sliderType": "player",
        "timeInterval": 2000,
        "layerIds": [
            {
                "title": "Service 1",
                "layerId": "123"
            },
            {
                "title": "Service 2",
                "layerId": "456"
            },
            {
                "title": "Service 3",
                "layerId": "789"
            }
        ]
    }
}
```

***

#### Portalconfig.menu.tool.layerSlider.layerId

Defines a layer slider layer.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|title|yes|String||Service name to be shown in the portal.|false|
|layerId|yes|String||ID of the service to be shown in the portal. This layer ID *MUST* be configured as part of the *Themenconfig*!|false|

**Example**

```json
{
    "title": "Service 1",
    "layerId": "123"
}
```

***

#### Portalconfig.menu.tool.virtualcity

[inherits]: # (Portalconfig.menu.tool)

The virtualcity tool allows showing plans from the *virtualcityPLANNER* service in the Masterportal. The *virtualcityPLANNER* plans must be *public* to be available in this tool.

|Name|Required|Type|Default|Description|
|----|--------|----|-------|-----------|
|serviceId|yes|String||Service ID. Resolved using the **[rest-services.json](rest-services.json.md)** file.|
|useProxy|no|Boolean|false|_Deprecated in the next major release. [GDI-DE](https://www.gdi-de.org/en) recommends setting CORS headers on the required services instead of using proxies._ Defines whether a service URL should be requested via proxy. For this, dots in the URL are replaced with underscores.|false|

**Example**

```json
{
    "title": "virtualcityPLANNER",
    "serviceId": "1"
}
```

#### Portalconfig.menu.tool.shadow

[inherits]: # (Portalconfig.menu.tool)

The shadow tool provides a UI element to define a point in time. By using sliders and date pickers, you may enter it in a 30-minute grid. The chosen time allows rendering the shadows of all 3D objects in 3D mode by simulating the sun's position. By pulling the sliders or selecting a different date, a new sun position is calculated immediately. By default, the tool starts with the current time, which can be overwritten in the parameters.

|Name|Required|Type|Default|Description|
|----|--------|----|-------|-----------|
|shadowTime|no|**[shadowTime](#markdown-header-portalconfigmenutoolshadowshadowtime)**||Default time the tool is started with. Recognizes "month", "day", "hour", and "minute".|
|isShadowEnabled|no|Boolean|false|Default shadow value. `true` immediately renders shadows, `false` requires a manual confirmation.|


**Example**

```json
{
    "shadowTime": {
        "month": "6",
        "day": "20",
        "hour": "13",
        "minute": "0"
    },
    "isShadowEnabled": true
}
```

***

#### Portalconfig.menu.tool.shadow.shadowTime

Todo.

|Name|Required|Type|Default|Beschreibung|
|----|--------|----|-------|------------|
|month|no|String||month|
|day|no|String||day|
|hour|no|String||hour|
|minute|no|String||minute|

**Example**
```json
{
    "month": "6",
    "day": "20",
    "hour": "13",
    "minute": "0"
}
```

***

#### Portalconfig.menu.tool.styleWMS

[inherits]: # (Portalconfig.menu.tool)

WMS service classification. This tool is used in the MRH (Metropolregion Hamburg, en.: Metropolitan area Hamburg) commute portal. With a mask, classifications can be defined. The GetMap request will have an SLD body as payload, used by the server to render. The WMS service now delivers its tiles in the defined classifications and colors.

|Name|Required|Type|Default|Description|
|----|--------|----|-------|-----------|
|useProxy|no|Boolean|false|_Deprecated in the next major release. [GDI-DE](https://www.gdi-de.org/en) recommends setting CORS headers on the required services instead of using proxies._ Defines whether a service URL should be requested via proxy. For this, dots in the URL are replaced with underscores.|false|

***

#### Portalconfig.menu.tool.wfst

[inherits]: # (Portalconfig.menu.tool)

WFS-T module to visualize (*GetFeature*), create (*insert*), update (*update*), and delete (*delete*) features of a Web Feature Service (*WFS*). To use this tool, a WFS-T layer must be provided. See `services.json.md`.

|Name|Required|Type|Default|Description|
|----|--------|----|-------|-----------|
|name|yes|String||Tool name shown in the portal.|
|layerIds|yes|String[]||Array of layer ids.|false|
|toggleLayer|no|Boolean|false|Whether layer feature stay visible when adding a new feature.|
|layerSelect|no|String|"aktueller Layer:"|Option to change the layer selection label.|
|pointButton|no|[Button](#markdown-header-portalconfigmenutoolwfstButton)|false|Configuration of which layers allow creating points and what label the button should have.|
|lineButton|no|[Button](#markdown-header-portalconfigmenutoolwfstButton)|false|Configuration of which layers allow creating lines and what label the button should have.|
|areaButton|no|[Button](#markdown-header-portalconfigmenutoolwfstButton)|false|Configuration of which layers allow creating areas and what label the button should have.|
|edit|no|[EditDelete](#markdown-header-portalconfigmenutoolwfsteditdelete)|false|Whether the edit button should be shown, and if, with which label.|
|delete|no|[EditDelete](#markdown-header-portalconfigmenutoolwfsteditdelete)|false|Whether the delete button should be shown, and if, with which label.|
|useProxy|no|Boolean|false|_Deprecated in the next major release. [GDI-DE](https://www.gdi-de.org/en) recommends setting CORS headers on the required services instead of using proxies._ Defines whether a service URL should be requested via proxy. For this, dots in the URL are replaced with underscores.|false|

**Example**

```json
{
    "wfst": {
        "name": "WFS-T Tool",
        "glyphicon": "glyphicon-globe",
        "layerIds": ["1234", "5678"],
        "toggleLayer": true,
        "layerSelect": "TestLayer",
        "pointButton": [
            {
                "layerId":"1234",
                "caption": "Point test",
                "show": true
            },
            {
                "layerId": "5678",
                "show": true
            }
        ],
        "lineButton": false,
        "areaButton": [
            {
                "layerId": "4389",
                "show": false
            }
        ],
        "edit": "Edit",
        "delete": true
    }
}
```

***

#### Portalconfig.menu.tool.wfst.Button

The attributes `pointButton`/`lineButton`/`areaButton` may be of type boolean or object. When of type boolean, it decides whether the create function is available to all layers. Else, the following attributes may be provided:

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|layerId|yes|String||Layer to be configured.|false|
|show|yes|Boolean|true|Whether the button is available.|false|
|caption|no|String|"Erfassen"|Button text. If no value is given, the Masterportal will use, depending on circumstances, "Punkt erfassen", "Linie erfassen", or "Fläche erfassen".|false|

**Examples**

```json
{
    "pointButton": true
}
```

```json
{
    "pointButton": {
        {
            "layerId":"1234",
            "show": true,
            "caption": "Point test",
        },
        {
            "layerId": "5678",
            "show": true
        },
        {
            "layerId": "5489",
            "show": false
        }
    }
}
```

#### Portalconfig.menu.tool.wfst.EditDelete

The attributes `edit` and `delete` may be of type boolean or string. If of type boolean, it indicates whether the respective function is available. When of type string, it is offered with the string as its label.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|edit|yes|Boolean|true|Whether to show the edit button.|false|
|edit|yes|String|"Geometrie bearbeiten"|Edit button label.|false|
|delete|yes|Boolean|true|Whether to show the delete button.|false|
|delete|yes|String|"Geometrie löschen"|Delete button label.|false|

**Examples**

```json
{
    "edit": true
}
```

```json
{
    "edit": "Editieren"
}
```

***

### Portalconfig.menu.staticlinks

The staticlinks array contains objects either describing links to other web resources or triggers of defined events.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|staticlinks|no|**[staticlink](#markdown-header-portalconfigmenustaticlinksstaticlink)**[]||Static link array.|false|


**onClickTrigger example**

```json
{
    "staticlinks": [
        {
            "name": "Alert",
            "glyphicon": "glyphicon-globe",
            "onClickTrigger": [
                {
                    "channel": "Alert",
                    "event": "alert",
                    "data": "Hello World!"
                }
            ]
        }
    ]
}
```

***

#### Portalconfig.menu.staticlinks.staticlink
Ein Staticlink-Objekt enthält folgende Attribute.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|name|yes|String||Menu name of the link.|false|
|glyphicon|no|String|"glyphicon-globe"|CSS glyphicon class of link, shown before its name.|false|
|url|no|String||URL to open in a new tab.|false|
|onClickTrigger|no|**[onClickTrigger](#markdown-header-portalconfigmenustaticlinksstaticlinkonclicktrigger)**[]||Array of onClickTrigger events.|false|

**URL example**

```json
{
    "name": "Hamburg",
    "glyphicon": "glyphicon-globe",
    "url": "http://www.hamburg.de"
}
```

**onClickTrigger example**
```json
{
    "name": "Alert",
    "glyphicon": "glyphicon-globe",
    "onClickTrigger": [
        {
            "channel": "Alert",
            "event": "alert",
            "data": "Hello World!"
        }
    ]
}
```

***

#### Portalconfig.menu.staticlinks.staticlink.onClickTrigger

Defines an event trigger, possibly containing a payload.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|channel|yes|String||Radio channel name.|false|
|event|yes|String||Radio channel's event name of the event to be triggered.|false|
|data|no|String/Boolean/Number||Payload to be sent along.|false|

**Example**

```json
{
    "channel": "Alert",
    "event": "alert",
    "data": "Hello World!"
}
```

***

## Themenconfig

The `Themenconfig` entry defines the contents and their order in the topic selection. Depending on your `treeType` configuration, the [Fachdaten](#markdown-header-themenconfigfachdaten) section may also contain folder structures.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|Hintergrundkarten|yes|**[Hintergrundkarten](#markdown-header-themenconfighintergrundkarten)**||Background map definition.|false|
|Fachdaten|no|**[Fachdaten](#markdown-header-themenconfigfachdaten)**||Technical data definition.|false|
|Fachdaten_3D|no|**[Fachdaten_3D](#markdown-header-themenconfigfachdaten_3d)**||Technical data definition used in 3D mode.|false|

**Example**

```json
{
    "Themenconfig": {
        "Hintergrundkarten": {},
        "Fachdaten": {},
        "Fachdaten_3D": {}
    }
}
```

***

### Themenconfig.Hintergrundkarten

[type:Layer]: # (Themenconfig.Layer)
[type:GroupLayer]: # (Themenconfig.GroupLayer)

Background map definition.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|name|no|String|"Hintergrundkarten"|For `treeType` `default` and `custom`, name of the background map button area.|false|
|Layer|yes|**[Layer](#markdown-header-themenconfiglayer)**/**[GroupLayer](#markdown-header-themenconfiggrouplayer)**[]||Layer definition.|false|

**Example**

```json
{
    "Hintergrundkarten": {
        "name": "My background maps",
        "Layer": [
            {
                "id": "123"
            }
        ]
    }
}
```

***

### Themenconfig.Fachdaten

[type:Layer]: # (Themenconfig.Layer)
[type:GroupLayer]: # (Themenconfig.GroupLayer)
[type:Ordner]: # (Themenconfig.Ordner)

Technical data definition.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|name|no|String|"Fachdaten"|For `treeType` `default` and `custom`, name of the technical data button area.|false|
|Layer|yes|**[Layer](#markdown-header-themenconfiglayer)**/**[GroupLayer](#markdown-header-themenconfiggrouplayer)**[]||Layer definition.|false|
|Ordner|no|**[Ordner](#markdown-header-themenconfigordner)**[]||Folder definition.|false|

**Example**

```json
{
    "Fachdaten": {
        "name": "My technical data",
        "Layer": [
            {
                "id": "123"
            }
        ]
    }
}
```

***

### Themenconfig.Fachdaten_3D

[type:Layer]: # (Themenconfig.Layer)

3D data definition for the 3D mode in `treeType` `custom` and `default`. Only shown when 3D mode is active.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|name|no|String|"3D Daten"|Name of the 3D data button area.|false|
|Layer|yes|**[Layer](#markdown-header-themenconfiglayer)**[]||3D layer definition.|false|

**Example**

```json
{
    "Fachdaten_3D": {
        "name": "My technical 3D data",
        "Layer": [
            {
            "id": "12883"
            }
        ]
    }
}
```

***

### Themenconfig.Ordner

[type:Layer]: # (Themenconfig.Layer)
[type:GroupLayer]: # (Themenconfig.GroupLayer)
[type:Ordner]: # (Themenconfig.Ordner)

Folder definition. Folders may also be nested.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|Titel|yes|String||Folder title.|false|
|Layer|yes|**[Layer](#markdown-header-themenconfiglayer)**/**[GroupLayer](#markdown-header-themenconfiggrouplayer)**[]||Layer definition.|false|
|Ordner|no|**[Ordner](#markdown-header-themenconfigordner)**[]||Folder definition.|false|
|isFolderSelectable|no|Boolean|true|Defines whether all layers of a folder can be de-/activated at once by using a checkbox.|false|
|invertLayerOrder|nein|Boolean|false|Defines wheather the order of layers added to the map should be invert when clicking the folder.|false|

**Example folder with one layer**

```json
{
    "Fachdaten": {
        "Ordner": [
            {
                "Titel": "My folder",
                "Layer": [
                    {
                        "id": "123"
                    }
                ]
            }
        ]
    }
}
```

**Example folder with a sub-folder that contains a layer**

```json
{
    "Fachdaten": {
        "Ordner": [
            {
                "Titel": "My first folder",
                "isFolderSelectable": true,
                "Ordner": [
                    {
                        "Titel": "My second folder",
                        "Layer": [
                            {
                                "id": "123"
                            }
                        ]
                    }
                ]
            }
        ]
    }
}
```

**Example folder with a sub-folder holding a layer, where the first folder also has a layer defined**

```json
{
    "Fachdaten": {
        "Ordner": [
            {
                "Titel": "My first folder",
                "Ordner": [
                    {
                        "Titel": "My second folder",
                        "Layer": [
                            {
                                "id": "123"
                            }
                        ]
                    }
                ],
                "Layer": [
                    {
                        "id": "456"
                    }
                ]
            }
        ]
    }
}
```

**Example folder with an inverted order of layers**

In this example layer 123 will be added to the map first. This leads to 456 being above 123.

```json
{
    "Fachdaten": {
        "Ordner": [
            {
                "Titel": "My folder",
                "invertLayerOrder": true,
                "Layer": [
                    {
                        "id": "123"
                    },
                    {
                        "id": "456"
                    }
                ]
            }
        ]
    }
}
```


***

### Themenconfig.GroupLayer

[type:Layer]: # (Themenconfig.Layer)
[type:Extent]: # (Datatypes.Extent)

Group layer definition. Multiple ways to define group layers exist. Most attributes are defined in the **[services.json](services.json.md)**, but may be overwritten in the layer definition.

Also, type-specific attributes for **[WMS](#markdown-header-themenconfiglayerwms)** and **[VTS](#markdown-header-themenconfiglayervector)** exist.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|id|yes|String/String[]||Layer ID(s). Resolved using the **[services.json](services.json.md)** file.|false|
|children|no|**[Layer](#markdown-header-themenconfiglayer)**[]||When used, a group layer containing an arbitrary amount of layers is created. In that case, the unique `id` has to be chosen by you.|false|
|name|no|String||Layer name.|false|
|transparency|no|Integer|0|Layer transparency.|false|
|visibility|no|Boolean|false|Layer visibility.|false|
|supported|no|String[]|["2D", "3D"]|List of modes the layer may be used in.|false|
|extent|no|**[Extent](#markdown-header-datatypesextent)**|[454591, 5809000, 700000, 6075769]|Layer extent.|false|
|layerAttribution|no|String||**[services.json](services.json.md)** value. HTML string shown when the layer is active.|false|
|legendURL|no|String||**[services.json](services.json.md)** value. URL used to request the legend graphic. _Deprecated, please use "legend" instead._|false|
|legend|no|Boolean/String||**[services.json](services.json.md)** value. URL used to request the legend graphic. Use `true` to dynamically generate the legend from a WMS request or the styling. If of type string, it's expected to be a path to an image or a PDF file.|false|
|maxScale|no|String||**[services.json](services.json.md)** value. Maximum scale in which the layer is still shown.|false|
|minScale|no|String||**[services.json](services.json.md)** value. Minimum scale in which the layer is still shown.|false|
|autoRefresh|no|Integer||Automatically reload layer every `autoRefresh` ms. Minimum value is 500.|false|
|isNeverVisibleInTree|no|Boolean|false|If `true`, the layer is never visible in the topic selection tree.|false|
|urlIsVisible|no|Boolean|true|Whether the service URL should be shown in the layer information window.|false|

**Example**

```json
{
    "id": "myId",
    "name": "myGroupLayer",
    "children": [
        {
            "id": "123",
            "name": "myLayer_1"
        },
        {
            "id": "456",
            "name": "myLayer_2"
        }
    ]
}
```

***

### Themenconfig.Layer

[type:Extent]: # (Datatypes.Extent)
[type:Entity3D]: # (Themenconfig.Layer.Entity3D)
[type:WMS]: # (Themenconfig.Layer.WMS)

Layer definition. Multiple ways to define layers exist. Most attributes are defined in the **[services.json](services.json.md)**, but may be overwritten in the layer definition.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|id|yes|String/String[]||Layer ID(s). Resolved using the **[services.json](services.json.md)** file. Please mind that the given IDs **MUST** refer to the same URL, that is, use the same service. When configuring an array of IDs, setting `minScale` and `maxScale` of each layer is required to be in the `services.json`.|false|
|name|no|String||Layer name.|false|
|entities|yes|**[Entity3D](#markdown-header-themenconfiglayerentity3d)**[]||Models to be shown.|false|
|transparency|no|Integer|0|Layer transparency.|false|
|visibility|no|Boolean|false|Layer visibility.|false|
|supported|no|String[]|["2D", "3D"]|List of modes the layer may be used in.|false|
|extent|no|**[Extent](#markdown-header-datatypesextent)**|[454591, 5809000, 700000, 6075769]|Layer extent.|false|
|layerAttribution|no|String||**[services.json](services.json.md)** value. HTML string shown when the layer is active.|false|
|legendURL|no|String||**[services.json](services.json.md)** value. URL used to request the legend graphic. _Deprecated, please use "legend" instead._|false|
|legend|no|Boolean/String||**[services.json](services.json.md)** value. URL used to request the legend graphic. Use `true` to dynamically generate the legend from a WMS request or the styling. If of type string, it's expected to be a path to an image or a PDF file.|false|
|maxScale|no|String||**[services.json](services.json.md)** value. Maximum scale in which the layer is still shown.|false|
|minScale|no|String||**[services.json](services.json.md)** value. Minimum scale in which the layer is still shown.|false|
|autoRefresh|no|Integer||Automatically reload layer every `autoRefresh` ms. Minimum value is 500.|false|
|isNeverVisibleInTree|no|Boolean|false|If `true`, the layer is never visible in the topic selection tree.|false|
|urlIsVisible|no|Boolean|true|Whether the service URL should be shown in the layer information window.|false|

**Example with one ID**

```json
{
    "id": "123"
}
```

**Example with an array of IDs**

```json
{
    "id": ["123", "456", "789"],
    "name": "my test layer"
}
```

***

#### Themenconfig.Layer.WMS

[inherits]: # (Themenconfig.Layer)

List of typical WMS attributes.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|name|no|String/String[]||Layer name. If the attribute `styles` is configured, `name` must be of type String[].|false|
|attributesToStyle|no|String[]||Attribute array by which the WMS is styled. Required by the **[tool](#markdown-header-portalconfigmenutools)** `styleWMS`.|false|
|featureCount|no|Integer|1|Amount of feature to be returned at maximum on a *GetFeatureInfo* request.|false|
|geomType|no|String||Geometry type of WMS data. Currently, only `"polygon"` is supported. Required by the **[tool](#markdown-header-portalconfigmenutools)** `styleWMS`.|false|
|styleable|no|Boolean||Whether the `styleWMS` tool may use this layer. Required by the **[tool](#markdown-header-portalconfigmenutools)** `styleWMS`.|true|
|gfiAsNewWindow|no|**[gfiAsNewWindow](#markdown-header-themenconfiglayerwmsgfiAsNewWindow)**|null|Relevant if `"text/html"` is used.|true|
|styles|no|String[]||Will be sent to the server if defined. The server will interpret and apply these styles and return the corresponding styled tiles.|true|

**Example**

```json
{
    "id": "123456",
    "name": "MyWMSLayerName",
    "transparency": 0,
    "visibility": true,
    "supported": ["2D"],
    "extent": [454591, 5809000, 700000, 6075769],
    "layerAttribution": "MyBoldAttribution for layer 123456",
    "legend": "https://myServer/myService/legend.pdf",
    "maxScale": "100000",
    "minScale": "1000",
    "autoRefresh": "10000",
    "isNeverVisibleInTree": false,
    "attributesToStyle": ["MyFirstAttr"],
    "featureCount": 2,
    "geomType": "geometry",
    "gfiAsNewWindow": {
        "name": "_blank",
        "specs": "width=800,height=700"
    },
    "styleable": true,
    "styles": ["firstStyle", "secondStyle"]
}
```

***

#### Themenconfig.Layer.WMS.gfiAsNewWindow

The parameter `gfiAsNewWindow` is only in use when `infoFormat` is set to `"text/html"`.

This feature allows opening WMS HTML responses in their own window or tab rather than in an iFrame or GFI. To open HTML contents in a standard browser window, set the empty object `{}` instead of `null`.

You may change the opening behaviour by setting the parameter `name`:

**Note on SSL encryption**

If `gfiAsNewWindow` is not defined, it's applied with default values when the called URL is not SSL-encrypted (HTTPS).

Due to the *No Mixed Content* policy of all modern browsers, unencrypted content may not be displayed in an iFrame. Please mind that automatic forwarding (e.g. in Javascript) in iFrames to an insecure HTTP connection (without SSL) is not automatically recognized and may be prevented by the browser.

For such cases, define `gfiAsNewWindow` manually as described above.

|Name|Required|Type|Default|Description|Expert|
|----|-------------|---|-------|------------|------|
|name|ja|enum["_blank_","_self_"]|"_blank"|`"_blank"` opens a new browser tab or window (depending on browser) with the specified HTML content. The window appearance can be changed with the `specs` parameter. `"_self"` opens the specified HTML content within the current browser window.|true|
|specs|nein|String||You may add an arbitrary amount of comma-separated properties like `{"specs": "width=800,height=700"}`. For more options, please read the documentation regarding `javascript` and `window.open`: [W3 Schools: Met win open](https://www.w3schools.com/jsref/met_win_open.asp) (German), [JavaScript Info: Popup windows](https://javascript.info/popup-windows) (English), [MDN: Window open](https://developer.mozilla.org/en-US/docs/Web/API/Window/open) (English)|true|

**Example**

```js
{
    "id": "123456",
    // (...)
    "gfiAsNewWindow": {
        "name": "_blank",
        "specs": "toolbar=yes,scrollbars=yes,resizable=yes,top=0,left=500,width=800,height=700"
    },
    // (...)
}
```

***

#### Themenconfig.Layer.Tileset

[inherits]: # (Themenconfig.Layer)

List of attributes typically used for tilesets.

|Name|Required|Type|Default|Description|
|----|--------|----|-------|-----------|
|hiddenFeatures|no|String[]|[]|List of IDs to be hidden in the plane.|
|**[cesium3DTilesetOptions](https://cesiumjs.org/Cesium/Build/Documentation/Cesium3DTileset.html)**[]|no|**[cesium3DTilesetOption](#markdown-header-themenconfiglayertilesetcesium3dtilesetoption)**[]||Cesium 3D tileset options directly forwarded to the *Cesium tileset object*. E.g. `maximumScreenSpaceError` is relevant to the visibility.|

**Example**

```json
{
    "id": "123456",
    "name": "TilesetLayerName",
    "visibility": true,
    "hiddenFeatures": ["id1", "id2"],
    "cesium3DTilesetOptions" : {
        "maximumScreenSpaceError" : 6
    }
}
```

***

#### Themenconfig.Layer.Tileset.cesium3DTilesetOption

Todo

|Name|Required|Type|Default|Description|
|----|--------|----|-------|-----------|
|maximumScreenSpaceError|no|Number||Todo|

**Example**

```json
{
    "cesium3DTilesetOptions": {
        "maximumScreenSpaceError": 6
    }
}
```

***

#### Themenconfig.Layer.Terrain

[inherits]: # (Themenconfig.Layer)

List of attributes typically used for *Terrain*.

|Name|Required|Type|Default|Description|
|----|--------|----|-------|-----------|
|**[cesiumTerrainProviderOptions](https://cesiumjs.org/Cesium/Build/Documentation/CesiumTerrainProvider.html)**|no|**[cesiumTerrainProviderOption](#markdown-header-themenconfiglayerterraincesiumterrainprovideroption)**[]||Cesium TerrainProvider options directly forwarded to the *Cesium TerrainProvider* E.g. `requestVertexNormals` is used for object surface shading.|

**Example**

```json
{
    "id": "123456",
    "name": "TerrainLayerName",
    "visibility": true,
    "cesiumTerrainProviderOptions": {
        "requestVertexNormals" : true
    }
}
```

***

#### Themenconfig.Layer.Terrain.cesiumTerrainProviderOption

Todo

|Name|Required|Type|Default|Description|
|----|--------|----|-------|-----------|
|requestVertexNormals|no|Boolean||Todo|

**Example**

```json
{
    "cesiumTerrainProviderOptions": {
        "requestVertexNormals" : true
    }
}
```

***

#### Themenconfig.Layer.Entity3D

List of attributes typically used for *Entities 3D*.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|url|yes|String|""|Model URL, e.g. `"https://hamburg.virtualcitymap.de/gltf/4AQfNWNDHHFQzfBm.glb"`.|false|
|attributes|no|**[Attribute](#markdown-header-themenconfiglayerentities3dattribute)**||Model attributes, e.g. `{"name": "test"}`.|false|
|latitude|yes|Number||Model origin latitude in degrees. Example: `53.541831`|false|
|longitude|yes|Number||Model origin longitude in degrees. Example: `9.917963`|false|
|height|no|Number|0|Model origin height. Example: `10`|false|
|heading|no|Number|0|Model rotation in degrees. Example: `0`|false|
|pitch|no|Number|0|Model pitch in degrees. Example: `0`|false|
|roll|no|Number|0|Model roll in degrees. Example: `0`|false|
|scale|no|Number|1|Model scale. Example: `1`|false|
|allowPicking|no|Boolean|true|Whether the model may be clicked for GFI. Example: `true`|false|
|show|no|Boolean|true|Whether the model should be shown. Should be `true`. Example: `true`|false|

**Example**

```json
{
    "id": "123456",
    "name": "EntitiesLayerName",
    "visibility": true,
    "entities": [
       {
         "url": "https://hamburg.virtualcitymap.de/gltf/4AQfNWNDHHFQzfBm.glb",
         "attributes": {
           "name": "Fernsehturm.kmz"
         },
         "latitude": 53.541831,
         "longitude": 9.917963,
         "height": 10,
         "heading": -1.2502079000000208,
         "pitch": 0,
         "roll": 0,
         "scale": 5,
         "allowPicking": true,
         "show": true
       }
    ]
}
```

***

#### Themenconfig.Layer.Entity3D.Attribute

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|name|no|String|""|Todo|false|

**Example**

```json
{
   "name": "Fernsehturm.kmz"
}
```

***

#### Themenconfig.Layer.StaticImage

[inherits]: # (Themenconfig.Layer)
[type:Extent]: # (Datatypes.Extent)

This type allows loading images as georeferenced map layers. Supported formats are `jpeg` and `png`.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|id|yes|String|"Eineindeutige-ID7711"|ID required to be unique.|false|
|typ|yes|String|"StaticImage"|Sets the layer type to `StaticImage`, meaning static images will be displayed as layers.|false|
|url|yes|String|"https://meinedomain.de/bild.png"|Link to the image that is to be shown as layer.|false|
|name|yes|String|"Static Image Name"|Topic selection tree layer name.|false|
|extent|yes|**[Extent](#markdown-header-datatypesextent)**|[560.00, 5950.00, 560.00, 5945.00]|Georeferences the image. The coordinates are expected to be in EPSG:25832, and refer to the top-left and bottom-right image corner.|false|

**Example**

```json
{
    "id": "12345",
    "typ": "StaticImage",
    "url": "https://www.w3.org/Graphics/PNG/alphatest.png",
    "name": "Test PNG file",
    "visibility": true,
    "extent": [560296.72, 5932154.22, 562496.72, 5933454.22]
}
```

***

#### Themenconfig.Layer.Vector

[inherits]: # (Themenconfig.Layer)

List of attributes typically used in vector layers. Vector layers are WFS, GeoJSON (EPSG:4326 only), [SensorLayer](sensorThings.md), and Vector Tile Layer.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|clusterDistance|no|Integer||All features within this pixel radius are clustered to a single feature.|false|
|extendedFilter|no|Boolean||Defines whether the **[tool](#markdown-header-portalconfigmenutools)** `extendedFilter` may use this layer.|false|
|filterOptions|no|**[filterOption](#markdown-header-themenconfiglayervectorfilteroption)**[]||Filter options required by **[tool](#markdown-header-portalconfigmenutools)** `wfsFeatureFilter`.|false|
|mouseHoverField|no|String/String[]||Attribute name or array thereorf to be shown on mouse hovering a feature.|false|
|routable|no|Boolean||Whether die GFI request's position may be used as routing target. For this to work, the tool **[routing](#markdown-header-portalconfigmenutoolrouting)** must be configured.|false|
|searchField|no|String||Attribute name by which the searchbar would search in this layer.|false|
|additionalInfoField|no|String|"name"|Feature's attribute name to use in the search bar's hit list. Should this attribute not exist in a hit feature, the layer name is used instead.|false|
|styleId|no|String||Style ID. Resolved using the **[style.json](style.json.md)** file.|false|
|styleGeometryType|no|String/String[]||WFS style geometry type to reduce visible features to the ones sharing the given geometry types. **[More information](style.json.md#markdown-header-abbildungsvorschriften)**.|false|
|hitTolerance|no|String||Click tolerance for hits in pixels when firing a *GetFeatureInfo* request.|false|
|vtStyles|no|**[vtStyle](#markdown-header-themenconfiglayervectorvtstyle)**[]||Choosable external style definitions. Only available in a *Vector Tile Layer*.|false|

**Example**

```json
{
    "id": "123456",
    "name": "MyVectorLayerName",
    "transparency": 0,
    "visibility": true,
    "supported": ["2D"],
    "extent": [454591, 5809000, 700000, 6075769],
    "layerAttribution": "MyBoldAttribution for layer 123456",
    "legend": "https://myServer/myService/legend.pdf",
    "maxScale": "100000",
    "minScale": "1000",
    "autoRefresh": "10000",
    "isNeverVisibleInTree": false,
    "clusterDistance": 60,
    "extendedFilter": true,
    "filterOptions": [
        {
            "fieldName": "myFirstAttributeToFilter",
            "filterName": "Filter_1",
            "filterString": ["*", "value1", "value2"],
            "filterType": "combo"
        },
        {
            "fieldName": "mySecondAttributeToFilter",
            "filterName": "Filter_2",
            "filterString": ["*", "value3", "value4"],
            "filterType": "combo"
        }
    ],
    "mouseHoverField": "name",
    "routable": false,
    "searchField": "name",
    "styleId": "123456",
    "hitTolerance": 50
},
{
    "id" : "11111",
    "name" : "local GeoJSON",
    "url" : "portal/master/test.json",
    "typ" : "GeoJSON",
    "gfiAttributes" : "showAll",
    "layerAttribution" : "nicht vorhanden",
    "legend" : true
}
```

***

#### Themenconfig.Layer.Vector.filterOption

Filter options used by the **[tool](#markdown-header-portalconfigmenutools)** `wfsFeatureFilter`.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|fieldName|yes|String||Attribute name to filter by.|false|
|filterName|yes|String||Filter name in the tool.|false|
|filterString|yes|String[]||Array of attribute names filtering by is enabled. Using `"*"` will allow all values.|false|
|filterType|yes|String||Filter type. Only `"combo"` is supported.|false|

**Example**

```json
{
    "fieldName": "myFirstAttributeToFilter",
    "filterName": "Filter_1",
    "filterString": ["*", "value1", "value2"],
    "filterType": "combo"
}
```

#### Themenconfig.Layer.Vector.vtStyle

Style definitions. Available for *Vector Tile Layers* only.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|id|yes|String||Cross-service unique id.|false|
|name|yes|String||Display name, e.g. used in the selection tool.|false|
|url|yes|String||URL to load a style from. The linked JSON *must* match the [Mapbox style specification](https://docs.mapbox.com/mapbox-gl-js/style-spec/).|false|
|defaultStyle|no|String||If set `true`, this style is used initially; if no field is set `true`, the first style is used.|false|

**Example**

```json
{
    "id": "UNIQUE_ID",
    "name": "Red lines",
    "url": "https://example.com/asdf/styles/root.json",
    "defaultStyle": true
}
```

***

# Datatypes

This chapter defines expected data types.

## Datatypes.Coordinate

A coordinate is an array of two numbers. The first represents the easting, the second the northing.

**Example integer coordinate**

```json
[561210, 5932600]
```

**Example float coordinate**

```json
[561210.1458, 5932600.12358]
```

***

## Datatypes.Extent

An extent is an array of four numbers describing a rectangular scope. The rectangle is constructed from the "lower left" and "upper right" corner, so the scheme used is `[Easting lower left, Northing lower left, Easting upper right, Northing upper right]`, or `[minx, miny, maxx, maxy]`.

**Example extent**

```json
[510000.0, 5850000.0, 625000.4, 6000000.0]
```

***

## Datatypes.CustomObject

An object containing the required contents. Parameters depend on configuration, usage, and backend components.

***
