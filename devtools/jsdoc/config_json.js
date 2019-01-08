/**
 * @member ConfigJSON
 * @memberOf Configs
 * @description Config json needed for portal configuration
 * @class
 * @property {Configs.ConfigJSON.Baumtyp} Baumtyp
 * @property {Configs.ConfigJSON.controls} [controls]
 * @property {Configs.ConfigJSON.mapView} [mapView]
 * @property {Configs.ConfigJSON.menu} [menu]
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
 * @property {String} [children.routing]*
 * @property {String} [children.searchByCoord]*
 * @property {String} [children.wfsFeatureFilter]*
 * @property {String} [children.schulwegrouting]*
 * @property {String} [children.compareFeatures]*
 * @property {String} [children.layerslider]*
 * @property {String} [children.addWMS]*
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
 * @description Tool to print map with all layers to PDF. This tool uses the MapFish3 technology Extends [tool]{@link Configs.ConfigJSON.tool}
 * @type {Object}
 * @deprecated in 3.0.0. Some Parameters are deprecated
 * @property {String} [mapfishServiceId] ID of print. Id gets resolved over {@link Configs.RestServices}
 * @property {String} [title="PrintResult"] Default title of created PDF. Can be manipulated by user
 * @property {String} [printAppId="master"] Name of print app. Used for mapfish to use the correct template and to require the correct attributes
 * @property {String} [version] @deprecated in 3.0.0. Flag for mapfish_print_3. If "mapfish_print_3" then the mapfish 3 is used otherwise the mapfish 2 is used with old config
 * @property {Boolean} [gfi] @deprecated in 3.0.0. Flag if gfi should be printed.
 * @property {String} [printID="9999"] @deprecated in 3.0.0. ID of print service. Id gets resolved over {@link Configs.RestServices}
 * @property {Object} [gfiMarker] @deprecated in 3.0.0. Definition of gfiMarker in pdf
 * @property {String} [configYAML="master"] @deprecated in 3.0.0. Name of config YAML used in mapfish print 2
 * @property {String} [outputFilename="Ausdruck"] @deprecated in 3.0.0. Default filename of PDF. Can be changed by user.
 */
