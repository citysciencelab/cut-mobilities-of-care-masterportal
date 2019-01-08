/**
 * @member ConfigJSON
 * @memberOf Configs
 * @description Config json needed for portal configuration
 * @class
 * @property {Configs.ConfigJSON.Baumtyp} Baumtyp
 * @property {Configs.ConfigJSON.controls} [controls]
 * @property {Configs.ConfigJSON.mapView} [mapView]
 * @property {Configs.ConfigJSON.menu} [menu]
 * @property {Configs.ConfigJSON.portalTitle} [portalTitle]
 * @property {Configs.ConfigJSON.scaleLine} [scaleLine]
 * @property {Configs.ConfigJSON.searchBar} [searchBar]
 * @property {Configs.ConfigJSON.simpleLister} [simpleLister]
 * @property {Configs.ConfigJSON.mapMarkerModul} [mapMarkerModul]
 */

/**
 * @member Baumtyp
 * @memberOf Configs.ConfigJSON
 * @description Flag to define which type of layertree is used.
 * Possible values are <b>light</b>, <b>default</b> and <b>custom</b>
 * @type {String}
 * @example "Baumtyp": "light"
 */

/**
 * @member scaleLine
 * @memberOf Configs.ConfigJSON
 * @description Flag if scaleline should be created
 * @type {Boolean}
 * @example "scaleLine": true
 */

/**
 * @member controls
 * @memberOf Configs.ConfigJSON
 * @description Defines controls to interact with map
 * @type {Object}
 * @property {Configs.ConfigJSON.attributions} [attributions]
 * @property {Configs.ConfigJSON.attributions} [fullScreen]
 * @property {Configs.ConfigJSON.mousePosition} [mousePosition]
 * @property {Configs.ConfigJSON.orientation} [orientation]
 * @property {Configs.ConfigJSON.zoom} [zoom]
 * @property {Configs.ConfigJSON.overviewmap} [overviewmap]
 * @property {Configs.ConfigJSON.totalview} [totalview]
 * @property {Configs.ConfigJSON.button3d} [button3d]
 * @property {Configs.ConfigJSON.orientation3d} [orientation3d]
 * @property {Configs.ConfigJSON.freeze} [freeze]
 */

/**
 * @member attributions
 * @memberOf Configs.ConfigJSON
 * @description <b>Boolean:</b> Flag to show attributions or not.
 * <br><b>Object:</b> Shows attributions according to object parameters
 * @type {Boolean|Object}
 * @property {Boolean} [isInitOpenDesktop=true] Flag if Attributions should be initial open in desktop mode
 * @property {Boolean} [isInitOpenMobile=false] Flag if Attributions should be initial open in mobile mode
 * @example "attributions": {
 * "isInitOpenDesktop": true,
 * "isInitOpenMobile": false
 * }
 */

/**
 * @member fullScreen
 * @memberOf Configs.ConfigJSON
 * @description Flag if fullScreen functionality should be displayed
 * @type {Boolean}
 * @example "fullScreen": true
 */

/**
 * @member mousePosition
 * @memberOf Configs.ConfigJSON
 * @description Flag if mouse position should be displayed
 * @type {Boolean}
 * @example "mousePosition": true
 */

/**
 * @member orientation
 * @memberOf Configs.ConfigJSON
 * @description Uses geolocation of browser to locate user
 * @type {Object}
 * @property {String} [zoomMode="once"] <b>none:</b> Geolocation deactivated<br><b>once:</b> Geolocation is made only once the user clicks  the button<br><b>always:</b> Geolocation is made permanently
 * @property {Boolean|Integer[]} [poiDistances] <b>Boolean:</b> Flag to load poi ("in meiner Nähe")<br><b>Interger[]:</b> Array of distances
 * @example "orientation": {
 * "zoomMode": "once",
 * "poiDistances": [500, 1000, 2000]
 * }
 */

/**
 * @member zoom
 * @memberOf Configs.ConfigJSON
 * @description Flag if zoom buttons should be displayed
 * @type {Boolean}
 * @example "zoom": true
 */

/**
 * @member overviewmap
 * @memberOf Configs.ConfigJSON
 * @description <b>Boolean:</b> Shows overviewmap to the bottom right.<br><b>Object:</b> Shows overviewmap with the given options to the bottom right
 * @type {Boolean|Object}
 * @property {Number} [resolution] Defines the resolution taken by the overviewmap
 * @property {String} [baselayer] Id of layer to be used as baselayer in overviewmap
 * @example "overviewmap":
      {
        "resolution": 611.4974492763076,
        "baselayer": "452"
      }
 */

/**
 * @member totalview
 * @memberOf Configs.ConfigJSON
 * @description Shows button to reset the map view to initially defined state
 * @type {Boolean}
 * @example "totalview": true
 */


/**
 * @member button3d
 * @memberOf Configs.ConfigJSON
 * @description Shows button to activate 3d mode
 * @type {Boolean}
 * @example "button3d": true
 */

/**
 * @member orientation3d
 * @memberOf Configs.ConfigJSON
 * @description Shows orientation for 3d mode
 * @type {Boolean}
 * @example "orientation3d": true
 */

/**
 * @member freeze
 * @memberOf Configs.ConfigJSON
 * @description Shows button to block the whole view of the application. In style=table this control appears as tool
 * @type {Boolean}
 * @example "freeze": true
 */

/**
 * @member mapView
 * @memberOf Configs.ConfigJSON
 * @description  Configuration for mapView
 * @property {String} [backgroundImage] Path for background image
 * @property {Number[]} [startCenter=[565874, 5934140]] Coordinates for the portal to start with
 * @property {Object[]} [options] Array containing of objects with resolution, scale, and zoomLevel
 * @property {Number} [options.resolution] Resolution of level
 * @property {Number} [options.scale] Scale of level
 * @property {Number} [options.zoomLevel] Zoomlevel of level
 * @property {Number[]} [extent=[510000.0, 5850000.0, 625000.4, 6000000.0]] Array defining the map extent by coordinates [xmin, ymin, xmax, ymax]
 * @property {Number} [resolution=15.874991427504629] Initial resolution. Mightier than zoomLevel
 * @property {Number} [zoomLevel] Initial zoomLevel.
 * @property {String} [epsg="EPSG:25832"] EPSG code to start with. with this code the transformation is done and the wms layers are requested with this code
 * @example "mapView": {
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
 */

/**
 * @member menu
 * @memberOf Configs.ConfigJSON
 * @description Definition of menu items and tools. The order is relevant. All tools can be put into ["tools"]{@link Configs.ConfigJSON.tools} or into "menu"
 * @type {Object}
 * @property {Configs.ConfigJSON.staticlinks} [staticlinks]
 * @property {Configs.ConfigJSON.tools} [tools]
 * @property {Object} [tree] Menu configuration of layer tree
 * @property {String} [tree.name] Display name of layer tree
 * @property {String} [tree.glyphicon] Icon to be displayed before name
 * @property {Boolean} [tree.isInitOpen=false] Flag to show if layer tree is initially opened
 * @property {Boolean} [hide=false] Flag if menu should be hided in portal
 */

/**
 * @member staticlinks
 * @memberOf Configs.ConfigJSON
 * @description Item to open url in new tab or to trigger defined events
 * @type {Object[]}
 * @property {String} name Name of item to be displayed
 * @property {String} glyphicon Glyphicon of item to be displayed before link
 * @property {String} url Url to be pointed at
 * @property {Object[]} [onClickTrigger] Defines the Radio events that are triggered in click on item.
 * @property {String} onClickTrigger.channel Radio channel for trigger
 * @property {String} onClickTrigger.event Radio event for trigger
 * @property {String|Boolean|Number} onClickTrigger.data data to be triggered
 */

/**
 * @member tools
 * @memberOf Configs.ConfigJSON
 * @description Tools to be used in the portal. The order is relevant. All tools can be put into ["menu"]{@link Configs.ConfigJSON.menu} or into "tools". Every tool extends [tool]{@link Configs.ConfigJSON.tool}.
 * @type {Object}
 * @property {Configs.ConfigJSON.tool[]} children Tool definitions
 * @property {String} glyphicon Glyphicon of tollbox
 * @property {String} name Name of toolbox
 * @property {Configs.ConfigJSON.contact} [children.contact]
 * @property {Configs.ConfigJSON.tool} [children.legend] Legend of visible layers
 * @property {Configs.ConfigJSON.animation} [children.animation]
 * @property {Configs.ConfigJSON.tool} [children.coord] Tool to find coordinates using the cursor. All CRSs from [namedProjections]{@link Configs.Config.namedProjections} are possible. There the "+title"-attribute is taken. if no "+title" is available the epsg code is used.
 * @property {Configs.ConfigJSON.tool} [children.draw] Tool to draw Points, Lines, Polygons, Circles and Text on map and to download them as KML.
 * @property {Configs.ConfigJSON.tool} [children.extendedFilter] Tool to dynamically filter all visible vector layers. The user gets guided through the filtering process. The layer must be prpared to be filterable. This is done via the layer attribute [extendedFilter]{@link Configs.Config.Layer}
 * @property {Configs.ConfigJSON.featureLister} [children.featureLister]
 * @property {Configs.ConfigJSON.filter} [children.filter]
 * @property {Configs.ConfigJSON.tool} [children.gfi] Tool to get feature information by clicking on feature in map
 * @property {Configs.ConfigJSON.tool} [children.kmlimport] Tool to import kml files.
 * @property {Configs.ConfigJSON.lines} [children.lines]
 * @property {Configs.ConfigJSON.tool} [children.measure] Tool to measure distances or areas by creating the measuring geometry directly on the map
 * @property {Configs.ConfigJSON.parcelSearch} [children.parcelSearch]
 * @property {Configs.ConfigJSON.print} [children.print]
 * @property {Configs.ConfigJSON.routing} [children.routing]
 * @property {Configs.ConfigJSON.tool} [children.searchByCoord] Tool to locate a map marker in the map based on coordinated given by user.
 * @property {Configs.ConfigJSON.tool} [children.wfsFeatureFilter] Tool to filter defined layers by defined attributes. Parameters can be found at the [layer]{@link Configs.Config.Layer}
 * @property {Configs.ConfigJSON.schulwegrouting} [children.schulwegrouting]
 * @property {Configs.ConfigJSON.compareFeatures} [children.compareFeatures]
 * @property {Configs.ConfigJSON.layerslider} [children.layerslider]
 * @property {Configs.ConfigJSON.tool} [children.addWMS] Tool to add external wms layers using the layer url. Only works in portals with config [Baumtyp]{@link Configs.ConfigJSON.Baumtyp} = "custom"
 */

/**
 * @member tool
 * @memberOf Configs.ConfigJSON
 * @description Basic vonfig for every tool
 * @type {Object}
 * @property {String} name Name of tool to be displayed
 * @property {String} glyphicon Glyphicon of tool to be displayed before toolname
 * @property {Boolean} [isVisibleInMenu=true] Flag if tool is visible in menu
 * @property {Boolean} [isInitOpen=false] Flag if tool is initially activated
 * @property {Boolean} [onlyDesktop=false] Flag if tool is only available in desktop mode
 */

/**
 * @member email
 * @memberOf Configs.ConfigJSON
 * @description Email definition
 * @type {Object}
 * @property {String} email Email
 * @property {String} name Name
 */

/**
 * @member contact
 * @memberOf Configs.ConfigJSON
 * @description Tool to create an email mask. Used so that the user can write a feedback or report a bug. Extends [tool]{@link Configs.ConfigJSON.tool}
 * @type {Object}
 * @property {Configs.ConfigJSON.email[]} [bcc] Bcc Emails
 * @property {Configs.ConfigJSON.email[]} [cc] Cc Emails
 * @property {Boolean} [ccToUser] Flag to send email also to sender
 * @property {Configs.ConfigJSON.email[]} [from] List of senders
 * @property {Boolean} [includeSystemInfo] Flag to send system information in email
 * @property {String} [serviceID] Id of email service. Id gets resolved over {@link Configs.RestServices}
 * @property {String} [subject="Supportanfrage zum Portal " + portalTitle] Subject of email
 * @property {String} [textPlaceholder] Placeholder for user text in email mask
 * @property {Configs.ConfigJSON.email[]} [to] To Emails
 * @property {String} [contactInfo] Information to be displayed above the email mask
 */

/**
 * @member animation
 * @memberOf Configs.ConfigJSON
 * @description Tool to animate commuter data. Creates circles (size depending on amount of commuters) that move from resident municipality to working municipality or otherwise. Extends [tool]{@link Configs.ConfigJSON.tool}
 * @type {Object}
 * @property {String} [attrAnzahl="anzahl_einpendler"] Attribute for the amount of inbound commuters
 * @property {String} [attrGemeinde="wohnort"] Attribute for municipality name
 * @property {String[]} [colors] Colors used for animation of different municipalities. Have to be written in rgba()-notation. (look [here]{@link https://www.w3.org/TR/css-color-3/#rgba-color} or [here]{@link https://developer.mozilla.org/de/docs/Web/CSS/Farben#rgba})
 * @property {String} [featureType="mrh_einpendler_gemeinde"] FeatureType of wfs whose data should animated
 * @property {Number} [maxPx=20] Max pixel size of biggest circle
 * @property {Number} [minPx=1] Min pixel size of smallest circle
 * @property {Object} [params] WFS Params needed for request
 * @property {String} [params.REQUEST="GetFeature"] WFS request type
 * @property {String} [params.SERVICE="WFS"] WFS service type
 * @property {String} [params.TYPENAME="app_mrh_kreise"] Feature type name of wfs
 * @property {String} [params.VERSION="1.1.0"] WFS version
 * @property {String} [params.maxFeatures="10000"] Maximum amount of features to be loaded
 * @property {Number} [steps=50] Amount of animation steps
 * @property {Number} [url="http://geodienste.hamburg.de/Test_MRH_WFS_Pendlerverflechtung"] Url of wfs to be requested
 * @property {Number} [zoomLevel=1] Zoomlevel to which the portal should zoom, after the user has chosen a municipality
 */

/**
 * @member featureLister
 * @memberOf Configs.ConfigJSON
 * @description Tool to list all features for every vector layer. Extends [tool]{@link Configs.ConfigJSON.tool}
 * @type {Object}
 * @property {Number} [lister=20] Amount of features to be loaded initially. This is also the step size the features can manually be reloaded
 */

/**
 * @member filter
 * @memberOf Configs.ConfigJSON
 * @description Tool to filter by predefined filtering rules. Extends [tool]{@link Configs.ConfigJSON.tool}
 * @type {Object}
 * @property {Boolean} [isGeneric=false] Flag if filter can be built up generically.
 * @property {Number} [minScale] Minimum Scale for the filtering process to zoom in
 * @property {Boolean} [liveZoomToFeatures=false] Flag to zoom to filter result immediately after user action
 * @property {Configs.ConfigJSON.predefinedQuery[]} [predefinedQueries] Predefined queries that are automatically called when activating the filter
 * @property {Boolean} [allowMultipleQueriesPerLayer] Flag to allow more than one filter query per layer
 */

/**
 * @member predefinedQuery
 * @memberOf Configs.ConfigJSON
 * @description Object defining one query
 * @type {Object}
 * @property {String} layerId Id of vector layer to be filtered
 * @property {Boolean} [isActive=false] Flag if filter on this query is initially run
 * @property {Boolean} [isSelected=false] Flag if filter on this query if initially shown
 * @property {Boolean} [searchinMapExtent=false] Flag if filter should only consider the features in the current map extent
 * @property {String} [info] Info text that is shown on top of query
 * @property {Configs.ConfigJSON.predefinedRule[]} [predefinedRules] Rules that are always used for the filter
 * @property {Configs.ConfigJSON.attributeWhiteListObject[]} [attributeWhitelist] Attributes of features that can be filtered
 * @property {String} [snippetType] Snippet type of attribute. Normally the attribut typed of the layer are derived and thus the snippet type defined. This flag overwrites the derived snippetType, eg. with: "checkbox-classic"
 */

/**
 * @member predefinedRule
 * @memberOf Configs.ConfigJSON
 * @description Rule to be called on every filter process of this query
 * @type {Object}
 * @property {String} attrName Name of the attribute
 * @property {String[]} values Attribute values that pass the filtering test
 */

/**
 * @member attributeWhiteListObject
 * @memberOf Configs.ConfigJSON
 * @description Whitelist of attributes to be filtered by. If it is an String[], then the different selected values of one attribute are joined with a logical "OR". Otherwise defined in the object
 * @type {String[]|Object[]}
 * @property {String} name Name of the attribute
 * @property {String} matchingMode="OR" Matching mode of multiple selected values of same attribute. "OR" for logical OR and "AND" for logical AND
 */

/**
 * @member lines
 * @memberOf Configs.ConfigJSON
 * @description Tool to display commuter data as lines. Extends [tool]{@link Configs.ConfigJSON.tool}
 * @type {Object}
 * @property {String} [attrAnzahl="anzahl_einpendler"] Attribute for the amount of inbound commuters
 * @property {String} [attrGemeinde="wohnort"] Attribute for municipality name
 * @property {String} [featureType="mrh_einpendler_gemeinde"] FeatureType of wfs whose data should animated
 * @property {Number} [url="http://geodienste.hamburg.de/Test_MRH_WFS_Pendlerverflechtung"] Url of wfs to be requested
 * @property {Number} [zoomLevel=1] Zoomlevel to which the portal should zoom, after the user has chosen a municipality
 */

/**
 * @member parcelSearch
 * @memberOf Configs.ConfigJSON
 * @description Tool to to search for specific parcels. Extends [tool]{@link Configs.ConfigJSON.tool}
 * @type {Object}
 * @property {String} [configJSON] Path to [gemarkungen_xx.json]{@link Configs.Gemarkungen}
 * @property {Boolean} [parcelDenominator=false] Flag if cadastral district are also send to stored query
 * @property {String} [serviceId] ID of gazetteer wfs. Id gets resolved over {@link Configs.RestServices}
 * @property {String} [storedQueryID] Name of storedQuery to be called
 * @property {Boolean} [createReport=false] Flag if report should be created
 * @property {String} [resportServiceId] Id of report service. Id gets resolved over {@link Configs.RestServices}
 * @property {String} [mapMarkerType="Parcel"] Flag how the [MapMarker]{@link MapMarker} module should mark and zoom onto parcel
 */

/**
 * @member print
 * @memberOf Configs.ConfigJSON
 * @description Tool to print map with all layers to PDF. This tool uses the MapFish3 technology. Extends [tool]{@link Configs.ConfigJSON.tool}
 * @type {Object}
 * @deprecated in 3.0.0. Some Parameters are deprecated
 * @property {String} [mapfishServiceId] ID of print. Id gets resolved over {@link Configs.RestServices}
 * @property {String} [title="PrintResult"] Default title of created PDF. Can be manipulated by user
 * @property {String} [printAppId="master"] Name of print app. Used for mapfish to use the correct template and to require the correct attributes
 * @property {String} [version] @deprecated in 3.0.0. Flag for mapfish_print_3. If "mapfish_print_3" then the mapfish 3 is used otherwise the mapfish 2 is used with old config
 * @property {Boolean} [gfi] @deprecated in 3.0.0. Flag if gfi should be printed.
 * @property {String} [printID="9999"] @deprecated in 3.0.0. Id of print service. Id gets resolved over {@link Configs.RestServices}
 * @property {Object} [gfiMarker] @deprecated in 3.0.0. Definition of gfiMarker in pdf
 * @property {String} [configYAML="master"] @deprecated in 3.0.0. Name of config YAML used in mapfish print 2
 * @property {String} [outputFilename="Ausdruck"] @deprecated in 3.0.0. Default filename of PDF. Can be changed by user.
 */

/**
 * @member routing
 * @memberOf Configs.ConfigJSON
 * @description Tool to perform a routing based on BKG-Address data and viom routing data. Used for verkehsportal. Extends [tool]{@link Configs.ConfigJSON.tool}
 * @type {Object}
 * @property {String} bkgGeosearchID Id of bkg geosearch service that geocode address data. Id gets resolved over {@link Configs.RestServices}
 * @property {String} bkgSuggestID Id of bkg suggest service that returns a suggest list based on the users input. Id gets resolved over {@link Configs.RestServices}
 * @property {String} viomRoutingID Id of routing service that returns a suggest list based on the users input. Id gets resolved over {@link Configs.RestServices}
 */

/**
 * @member schulwegrouting
 * @memberOf Configs.ConfigJSON
 * @description Tool to perform a routing from a given address to a predefined school entry. Extends [tool]{@link Configs.ConfigJSON.tool}
 * @type {Object}
 * @property {String} layerId="" Id of layer that contains the school positions. Needed to derive the coordinates for each school.
 */

/**
 * @member compareFeatures
 * @memberOf Configs.ConfigJSON
 * @description Tool to compare attributes of vector data. entry point is the [gfi]{@link Configs.ConfigJSON.gfi}. Used in schulinfosystem. Extends [tool]{@link Configs.ConfigJSON.tool}
 * @type {Object}
 * @property {Number} [numberOfFeaturesToShow=3] Maximum features to be compared.
 * @property {Number} [numberOfAttributesToShow=12] Number of attributes to be shown. There is always a toggle button to show all attributes and to show the top number of attributes defined here
 */

/**
 * @member layerslider
 * @memberOf Configs.ConfigJSON
 * @description Tool to slide between a configured stack of layers. Interactions are "play", "pause", "stop", "forward" and "backbward". The layers need to be configured in the portal and get toggled via Backbone.Radio. Extends [tool]{@link Configs.ConfigJSON.tool}
 * @type {Object}
 * @property {Number} [timeInterval=2000] Time interval in millis where the layers get switches. Minimum is 500
 * @property {Object[]} layerIds Array with defined layers.
 * @property {Object} layer defined layer object.
 * @property {String} layer.title Title of layer to be displayed in tool.
 * @property {String} layer.layerId Id of layer to be displayed or hided
 */

/**
 * @member portalTitle
 * @memberOf Configs.ConfigJSON
 * @description Title object  defining the header of the portal.
 * @type {Object}
 * @property {String} [title="Master"] Name of the portal
 * @property {String} [logo] Url to extern image file. Positioned before title
 * @property {String} [link="http://geoinfo.hamburg.de"] Url to extern page. Opend when user klicks on title
 * @property {String} [tooltip="Landesbetrieb Geoinformation und Vermessung"] Tooltip that if shown when hovering over title
 * @example "portalTitle": {
  "title": "Master",
  "logo": "/lgv-config/img/hh-logo.png",
  "link": "http://geoinfo.hamburg.de",
  "tooltip": "Landesbetrieb Geoinformation und Vermessung"
 */

/**
 * @member searchBar
 * @memberOf Configs.ConfigJSON
 * @description Definition of the contents of the searchbar. Multiple search alorithms and date to be search through can be defined.
 * @type {Object}
 * @property {Configs.ConfigJSON.bkg} [bkg] Bkg search.
 * @property {Configs.ConfigJSON.gazetteer} [gazeteer] Gazetteer search.
 * @property {Number} [minChars=3] Minimum numbers of chars when search should start
 * @property {String} [placeholder="Suche"] Placeholder for input field. Shows the user what search algorithms can be used
 * @property {Number} [recommendedListlength=5] Maximum of suggestions
 * @property {Boolean} [quickHelp=false] Flag if quick help should be shown in searchbar
 * @property {Configs.ConfigJSON.specialWFS} [specialWFS] SpecialWFS search.
 * @property {Configs.ConfigJSON.tree} [tree] Tree search.
 * @property {Configs.ConfigJSON.visibleWFS} [visibleWFS] VisibleWFS search
 * @property {Configs.ConfigJSON.visibleVector} [visibleVector] VisibleVector search
 * @property {Number} [zoomLevel] Zoom level to be zoomed to, on click of search suggestion
 * @property {String} [renderToDOM] Html-id to which object the searchbar gets appended. On "#searchbarInMap", the searchbar gets rendered on the map.
 */

/**
 * @member bkg
 * @memberOf Configs.ConfigJSON
 * @description Search algorithm over data containing the whole of germany.
 * @type {Object}
 * @property {String} [epsg="EPSG:25832"] Epsg copde of the used Coordinate reference system
 * @property {Number[]} [extent=[454591, 5809000, 700000, 6075769]] Coordinate based extent of search algorithm. [minx, miny, maxx, maxy]
 * @property {String} [filter="filter=(typ:*)"] Filter string send to bkg interface
 * @property {String} geosearchServiceId Id of search service. Id gets resolved over {@link Configs.RestServices}
 * @property {Number} [minChars=3] Minimum numbers of chars when search should start
 * @property {Number} [score=0.6] Score value defining the quality of search results
 * @property {Number} [suggestCount=20] Number of suggestions for inout search string
 * @property {String} suggestServiceId Id of suggest service. Id gets resolved over {@link Configs.RestServices}
 * @example "bkg": {
            "minChars": 3,
            "suggestServiceId": "4",
            "geosearchServiceId": "5",
            "extent": [454591, 5809000, 700000, 6075769],
            "suggestCount": 10,
            "epsg": "EPSG:25832",
            "filter": "filter=(typ:*)",
            "score": 0.6
        }
 */

/**
 * @member gazetteer
 * @memberOf Configs.ConfigJSON
 * @description Search algorithm that uses the gazetteer servicee of hamburg.
 * @type {Object}
 * @property {Number} [minChars=3] Minimum numbers of chars when search should start
 * @property {Boolean} [searchDistricts=false] Flag if gazetteer should search for districts
 * @property {Boolean} [searchHouseNumbers=false] Flag if gazetteer should search for streets with housnumbers. Needs searchStreets=true
 * @property {Boolean} [searchParcels=false] Flag if gazetteer should search for parcels.
 * @property {Boolean} [searchStreetKey=false] Flag if gazetteer should search for streetkeys.
 * @property {Boolean} [searchStreets=false] Flag if gazetteer should search for streetnames. Requirement for searchHouseNumbers
 * @property {String} serviceID Id of gazetteer service. Id gets resolved over {@link Configs.RestServices}
 * @example "gazetteer": {
            "minChars": 3,
            "serviceId": "6",
            "searchStreets": true,
            "searchHouseNumbers": true,
            "searchDistricts": true,
            "searchParcels": true,
            "searchStreetKey": true
        }
 */

/**
 * @member specialWFS
 * @memberOf Configs.ConfigJSON
 * @description Search algorithm that uses defined wfs. This module manages a direct wfs search without adding data to the portal or the layertree.
 * If search gets triggered, the wfs is called per post request with filterparameters. Thus the portal is also with huge datasets performant.
 * The search resulte are added to the suggest list with defined text and glyphicon. By clicking on this suggestion, the default function for clicking on search result is used and zoomed on thát feature.
 * @deprecated in 3.0.0 Some attributes are deprecated
 * @type {Object}
 * @property {definition[]} definitions Definitions of wfs objects to be searched through
 * @property {Object} definition One wfs object to be searched through
 * @property {String} definition.url Url of wfs
 * @property {String} definition.name Name of category. Used in suggest list
 * @property {String} [definition.glyphicon="glyphicon-home"] Glyphicon used in suggest list
 * @property {String} [definition.typeName] Typename of layer to be requested
 * @property {String[]} [definition.propertyNames] Array of attribute names ot be used for filtering
 * @property {String} [definition.geometryName="app:geom"] Attribute name of geometry. Used to zoom onto
 * @property {Number} [definition.maxFeatures=20] Maximum of features to be returned
 * @property {String} [definition.data] @deprecated in 3.0.0 Parameter of wfs request to filter
 * @property {Number} [minChars=3] Minimum numbers of chars when search should start
 * @property {String} [glyphicon="glyphicon-home"] Glyphicon used in suggest list. Can be overwritten by definition.glyphicon
 * @property {Number} [maxFeatures=20] Maximum of features to be returned. Can be overwritten by definition.maxFeatures
 * @property {Number} [timeout=6000] Timeout for ajax request
 * @example "specialWFS":
      {
        "minChars": 5,
        "timeout": 10000,
        "definitions": [
          {
            "url": "/geodienste_hamburg_de/MRH_WFS_Rotenburg",
            "typeName": "app:mrh_row_bplan",
            "propertyNames": ["app:name"],
            "name": "B-Plan"
          },
          {
            "url": "/geodienste_hamburg_de/HH_WFS_Bebauungsplaene",
            "typeName": "app:prosin_imverfahren",
            "propertyNames": ["app:plan"],
            "geometryName": "app:the_geom",
            "name": "im Verfahren"
          }
        ]
      }
 */

/**
 * @member tree
 * @memberOf Configs.ConfigJSON
 * @description Search algorithm that searches the layer tree
 * @type {Object}
 * @property {Number} [minChars=3] Minimum numbers of chars when search should start
 * @example "tree": {
           "minChars": 3
         }
 */

/**
 * @member visibleWFS
 * @memberOf Configs.ConfigJSON
 * @description Search algorithm that searches the visible WFS layers in the layertree
 * @type {Object}
 * @deprecated in 3.0.0 use [visibleVector]{@link Configs.ConfigJSON.visibleVector} instead
 * @property {Number} [minChars=3] Minimum numbers of chars when search should start
 * @example "visibleWFS": {
           "minChars": 3
       }
 */

/**
 * @member visibleVector
 * @memberOf Configs.ConfigJSON
 * @description Search algorithm that searches the visible vector layers in the layertree
 * @type {Object}
 * @property {Number} [minChars=3] Minimum numbers of chars when search should start
 * @property {String[]} [layerTypes=["WFS"]] Vector layer types to be searched by
 * @example "visibleVector": {
           "minChars": 3,
           "layerTypes": ["WFS", "GeoJSON"]
       }
 */

/**
 * @member simpleLister
 * @memberOf Configs.ConfigJSON
 * @description Tool that lists all vector features and their attributes, that are within the map extent
 * @type {Object}
 * @property {String} layerName Name of layer whos features should be shown
 * @property {String} [errortxt="Keine Features im Kartenausschnitt"] Error text to be shown if no features are in the current map extent
 */

/**
 * @member mapMarkerModul
 * @memberOf Configs.ConfigJSON
 * @description Flag that steers the mapmarker to be draggable or not. Used in MeldeMichel
 * @type {Object}
 * @property {String} marker On "dragMarker" the mapMarker gets draggable.
 * @property {Boolean} visible Flag if marker is visible initially
 */
