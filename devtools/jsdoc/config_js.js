/**
 * @member Config
 * @memberOf Configs
 * @description Config needed for basic and technical portal configuration
 * @class
 * @property {Configs.Config.clickCounter} [clickCounter]
 * @property {Configs.Config.cswId} [cswId]
 * @property {Configs.Config.footer} [footer]
 * @property {Configs.Config.gfiWindow} [gfiWindow]
 * @property {Configs.Config.ignoredKeys} [ignoredKeys]
 * @property {Configs.Config.layerConf} layerConf
 * @property {Configs.Config.mouseHover} [mouseHover]
 * @property {Configs.Config.namedProjections} namedProjections
 * @property {Configs.Config.proxyUrl} proxyUrl
 * @property {Configs.Config.proxyHost} [proxyHost]
 * @property {Configs.Config.quickHelp} [quickHelp]
 * @property {Configs.Config.portalConf} [portalConf]
 * @property {Configs.Config.restConf} restConf
 * @property {Configs.Config.scaleLine} [scaleLine]
 * @property {Configs.Config.simpleMap} [simpleMap]
 * @property {Configs.Config.uiStyle} [uiStyle]
 * @property {Configs.Config.styleConf} styleConf
 * @property {Configs.Config.infoJson} [infoJson]
 * @property {Configs.Config.wfsImgPath} [wfsImgPath]
 * @property {Configs.Config.wpsID} [wpsID]
 * @property {Configs.Config.zoomToFeature} [zoomToFeature]
 * @property {Configs.Config.startingMap3D} [startingMap3D]
 * @property {Configs.Config.obliqueMap} [obliqueMap]
 * @property {Configs.Config.cameraParameter} [cameraParameter]
 * @property {Configs.Config.cesiumParameter} [cesiumParameter]
 * @property {Configs.Config.remoteInterface} [remoteInterface]
 * @property {Configs.Config.defaultToolId} [defaultToolId]
 */

/**
 * @member clickCounter
 * @memberOf Configs.Config
 * @type {Object}
 * @property {String} desktop Url of iframe in desktop mode.
 * @property {String} mobile Url of iframe in mobile mode.
 * @description Loads an iframe for each registered Click.
 * Depending on the mode of the app (desktop/mobile) a different given url is used.
 * @example clickCounter:{
     desktop: "http://static.hamburg.de/countframes/verkehrskarte_count.html",
     mobil: "http://static.hamburg.de/countframes/verkehrskarte-mobil_count.html"
   }
 */

/**
 * @member cswId
 * @memberOf Configs.Config
 * @type {String}
 * @description Reference id to a CS-W interface. Id gets resolved over [rest-services.json]{@link Configs.RestServices}
 * @default "1"
 * @example cswId: "1"
 */

/**
 * @member footer
 * @memberOf Configs.Config
 * @description Configuration of app footer. The links are created according to the order in the array
 * @type {Object}
 * @property {Configs.Config.footerObject[]} urls Array of footer objects
 */

/**
 * @member footerObject
 * @memberOf Configs.Config
 * @type {Object}
 * @property {String} bezeichnung Label text positioned before link
 * @property {String} url Url of link
 * @property {String} alias Alias of link to be shown in desktop portal
 * @property {String} alias_mobil Alias of link to be shown in mobile portal
 */

/**
 * @member gfiWindow
 * @memberOf Configs.Config
 * @type {String}
 * @description Flag where the gfi window has to be rendered.
 * <br><b>attached:</b> The gfi window gets rendered at click point.
 * <br><b>detached:</b> The gfi window is opened on the top right of the map. The clickpoint gets marked
 * @default "detached"
 * @example gfiWindow: "attached"
 */

/**
 * @member ignoredKeys
 * @memberOf Configs.Config
 * @type {String[]}
 * @description List of feature attributes to be ignored in the portal
 * @default ["BOUNDEDBY", "SHAPE", "SHAPE_LENGTH", "SHAPE_AREA", "OBJECTID", "GLOBALID", "GEOMETRY", "SHP", "SHP_AREA", "SHP_LENGTH", "GEOM"]
 * @example ignoredKeys: ["BOUNDEDBY", "SHAPE", "SHAPE_LENGTH", "SHAPE_AREA", "OBJECTID", "GLOBALID", "GEOMETRY", "SHP", "SHP_AREA", "SHP_LENGTH", "GEOM"]
 */

/**
 * @member layerConf
 * @memberOf Configs.Config
 * @type {String}
 * @description Path to {@link Configs.Services}. Contains all layers and their parameters
 * @example layerConf: "/lgv-config/services-internet.json"
 */

/**
 * @member mouseHover
 * @memberOf Configs.Config
 * @type {Object}
 * @description Object to define how a mouse hover over vector features is rendered. Further config params are located at {@link Configs.ConfigJSON#Layer}
 * @property {String} bezeichnung Label text positioned before link
 * @property {String} url Url of link
 * @property {String} alias Alias of link to be shown in desktop portal
 * @property {String} alias_mobil Alias of link to be shown in mobile portal
 */

/**
 * @member namedProjections
 * @memberOf Configs.Config
 * @type {Array[]}
 * @description Definition of the usable coordinate reference systems, using this [syntax]{@link http://proj4js.org/#named-projections}
 * @example namedProjections: [
 * ["EPSG:25832", "+title=ETRS89/UTM 32N +proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"]
 * ]
 */

/**
 * @member proxyUrl
 * @memberOf Configs.Config
 * @type {String}
 * @description Absolute server path to proxy script. Called when "?url=" is called. Neccessary if print-service is configured.
 * @example proxyUrl: "/cgi-bin/proxy.cgi"
 */

/**
 * @member proxyHost
 * @memberOf Configs.Config
 * @type {String}
 * @description Hostname of remote proxy. CORS must be installed on remote proxy
 * @example proxyHost: "https://proxy.example.com"
 */

/**
 * @member quickHelp
 * @memberOf Configs.Config
 * @type {Boolean}
 * @description Flag if quickhelp should be possible in portal or not
 * @default false
 * @example quickHelp: true
 */

/**
 * @member portalConf
 * @memberOf Configs.Config
 * @type {String}
 * @description Path to config.json. It is also possible to define a path node. The rest of the path is then to be defined per url parameter "config".
 * @default "config.json"
 * @example portalConf:"../../portal/master/". If a path node is defined, then the url parameter "?config=config.json" has to be passed.
 */

/**
 * @member restConf
 * @memberOf Configs.Config
 * @type {String}
 * @description Path to [rest-services.json][rest-services.json]{@link Configs.RestServices}. Contains additional services like print service, wps, csw. Path if relative to js/main.js
 * @example restConf: "/lgv-config/rest-services-internet.json"
 */

/**
 * @member scaleLine
 * @memberOf Configs.Config
 * @type {Boolean}
 * @description Flag if scalelie has to be rendered or not.
 * If [footer]{@link Configs.Config.footer} is configured, it is rendered to the bottom right, otherwise to the bottom left.
 * @default false
 * @example scaleLine: true
 */

/**
 * @member simpleMap
 * @memberOf Configs.Config
 * @type {Boolean}
 * @description Flag if simpleMap-url should be created in saveSelection.
 * @default false
 * @example simpleMap: true
 */

/**
 * @member uiStyle
 * @memberOf Configs.Config
 * @type {String}
 * @description Flag to render some elements differently
 * @default "default"
 * @example uiStyle: "table"
 */

/**
 * @member styleConf
 * @memberOf Configs.Config
 * @type {String}
 * @description Path to [style.json]{@link Configs.StyleConfig}, which contains style definitions for vector layers
 * @example styleConf: "/lgv-config/style.json"
 */

/**
 * @member infoJson
 * @memberOf Configs.Config
 * @type {String}
 * @default "info.json"
 * @description Path to [info.json]{@link Configs.InfoJSON}, which contains additional information for snippets. Path is relative to index.html.
 * @example infoJson: "style.json"
 */

/**
 * @member wfsImgPath
 * @memberOf Configs.Config
 * @type {String}
 * @description Path to folder that contains images used for styling of vector layers. Path is relative to main.js
 * @example wfsImgPath: "/lgv-config/style.json"
 */

/**
 * @member wpsID
 * @memberOf Configs.Config
 * @type {String}
 * @description Reference id to wps interface, which is used in different modules. Id gets resolved over [rest-services.json]{@link Configs.RestServices}
 * @example wpsID: "1"
 */

/**
 * @member zoomToFeature
 * @memberOf Configs.Config
 * @type {Object}
 * @description Optional configuration for url parameter "featureid". Used for eventlotse
 * @param {String} attribute Attributname of which the WFS gets filtered by
 * @param {String} imgLink Link to image used as marker
 * @param {String} layerId Id of layer to wich the markers get mounted
 * @param {String} wfsId Id of wfs layer. Used to filter the given feature id and to derive the markers coordinate
 * @example zoomToFeature: {
        attribute: "flaechenid",
        imgLink: "/lgv-config/img/location_eventlotse.svg",
        layerId: "4561",
        wfsId: "4560"
    }
 */

/**
 * @member startingMap3D
 * @memberOf Configs.Config
 * @type {Boolean}
 * @description Flag if portal should initially start in 3D mode
 * @default false
 * @example startingMap3D: true
 */

/**
 * @member obliqueMap
 * @memberOf Configs.Config
 * @type {Boolean}
 * @description Flag if oblique (Schrägluftbild) mode should generally be enabled
 * @default false
 * @example obliqueMap: true
 */

/**
 * @member cameraParameter
 * @memberOf Configs.Config
 * @type {Object}
 * @description Camera settings for 3D mode
 * @property {Number} heading Heading of camera
 * @property {Number} tilt Tilt of camera
 * @property {Number} altitude Altitude of camera
 * @example cameraParameter: {
 * heading: 180
 * tilt: -45
 * altitude: 1000}
 */

/**
 * @member cesiumParameter
 * @memberOf Configs.Config
 * @type {Object}
 * @description Cesium settings for 3D mode
 * @property {Object} fog Object to define fog creation
 * @property {Boolean} fog.enabled Flag if fog is enabled
 * @property {Number} fog.density=0.0002 Density of Fog
 * @property {Number} fog.screenSpaceErrorFactor=2.0
 * @property {Boolean} enableLighting=false Flag to enable light effects on terrain
 * @property {Number} maximumScreenSpaceError=2 Flag to show how detailled the terrain/raster tiles are loaded. 4/3 gets the empirically best quality
 * @property {Boolean} fxaa=false Flag to enable fast approximate anti-aliasing
 * @property {Number} tileCacheSize=100 Size of tiles
 */

/**
 * @member remoteInterface
 * @memberOf Configs.Config
 * @type {Object}
 * @description Parameters to define the remoteInterface
 * @property {String} postMessageUrl="http://localhost:8080" Url over which the remote interfaces ca act and react per post-message
 */

/**
 * @member defaultToolId
 * @memberOf Configs.Config
 * @type {String}
 * @description Id of tool, that gets activated when no other tools are active
 * @default "gfi"
 * @example defaultToolId: "measure"
 */

