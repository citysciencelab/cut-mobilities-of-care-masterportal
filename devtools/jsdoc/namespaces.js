/**
 * @namespace Addons
 * @description Addons are Modules that are dynamically loaded into the code bundle. This allows for different portals to run with different addons.
 */

/**
 * @namespace Controls
 * @description Controls are small Elements that allow the user to interact directly with the Application.
 * In the Application the controls are situated in red squares on the map on the right side of the window.
 * All Controls have the same look and feel, so the UX should be equal throughout all controls.
 */

/**
 * @namespace Attributions
 * @memberof Controls
 * @description Module to display additional layer infos in a separate modal
 * used for Verkehrsportal. Notice that following requirements must be met:
 * - attribution pane must be opened upon selecting a layer with attribution data
 * - attribution pane must be opened upon activating the tool pane "Pendler-Tool"
 * - attribution pane must be initially opened, if respective isInitOpenDesktop/isInitOpenMobile config
 * param is set to true and a layer with attribution data is visible
 */

/**
 * @namespace BackForward
 * @memberof Controls
 * @description Buttons to switch the map state (zoom, center) some steps back- or forward.
 */

/**
 * @namespace Button3D
 * @memberof Controls
 * @description Button to activate 3D-mode.
 */

/**
 * @namespace ButtonOblique
 * @memberof Controls
 * @description Button to activate oblique pictures.
 */

/**
 * @namespace Freeze
 * @memberof Controls
 * @description Button to freeze the current view of the application. Useful to avoid accidentally change of map e.g. on a touch table.
 */

/**
 * @namespace FullScreen
 * @memberof Controls
 * @description Button to switch application to full screen.
 */

/**
 * @namespace MousePosition
 * @memberof Controls
 * @description Button to activate presentation of current mouse position on the bottom of the map.
 */

/**
 * @namespace Orientation
 * @memberof Controls
 * @description Button to use geolocation of user to center map.
 */

/**
 * @namespace Poi
 * @memberof Controls.Orientation
 * @description Button to find features near my geolocation
 */

/**
 * @namespace Orientation3D
 * @memberof Controls
 * @description Creates navigation rosette in 3D mode.
 */

/**
 * @namespace OverviewMap
 * @memberof Controls
 * @description Small map on the bottom right of the Application, that gives the user an overview.
 */

/**
 * @namespace TotalView
 * @memberof Controls
 * @description Control to toggle back and forth in map states.
 */

/**
 * @namespace Zoom
 * @memberof Controls
 * @description Zoom Buttons for zooming in and zooming out of the map.
 */

/**
 * @namespace Cookie
 * @description Popup to inform user about cookies.
 */

/**
 * @namespace MapMarker
 * @memberof Core
 * @description MapMarker
 */

/**
 * @namespace MouseHover
 * @description Renders bootstrap tooltips in mouse hover popups
 */

/**
 * @namespace Title
 * @description Portal title
 */

/**
 * @namespace QuickHelp
 * @description fooBar
 */

/**
 * @namespace RemoteInterface
 * @description Represents the remote interface of the masterportal.
 */

/**
 * @namespace RestReader
 * @description Reads the rest-services.json files.
 */

/**
 * @namespace ScaleLine
 * @description Creates a scale line of the current map state on the bottom of the map.
 */

/**
 * @namespace Menu
 * @description Definition of menu
 */

/**
 * @namespace Desktop
 * @memberof Menu
 * @description Desktop specific presentation of the menu
 */

/**
 * @namespace Folder
 * @memberof Menu.Desktop
 * @description Creates folders in the desktop-menu
 */

/**
 * @namespace Layer
 * @memberof Menu.Desktop
 * @description Creates layers in the desktop-menu
 */

/**
 * @namespace StaticLink
 * @memberof Menu.Desktop
 * @description Creates static links in the desktop-menu
 */

/**
 * @namespace Tool
 * @memberof Menu.Desktop
 * @description Creates tool entries in the desktop-menu
 */

/**
 * @namespace ViewPoint
 * @memberof Menu.Desktop
 * @description foobar
 */

/**
 * @namespace Mobile
 * @memberof Menu
 * @description Mobile specific presentation of the menu
 */

/**
 * @namespace BreadCrumb
 * @memberof Menu.Mobile
 * @description Creates breadcrumbs in the mobile-menu
 */

/**
 * @namespace Folder
 * @memberof Menu.Mobile
 * @description Creates folders in the mobile-menu
 */

/**
 * @namespace Layer
 * @memberof Menu.Mobile
 * @description Creates layers in the mobile-menu
 */

/**
 * @namespace StaticLink
 * @memberof Menu.Mobile
 * @description Creates static links in the mobile-menu
 */

/**
 * @namespace Tool
 * @memberof Menu.Mobile
 * @description Creates tool entries in the mobile-menu
 */

/**
 * @namespace ViewPoint
 * @memberof Menu.Mobile
 * @description foobar
 */

/**
 * @namespace Table
 * @memberof Menu
 * @description Touch-table specific presentation of the menu
 */

/**
 * @namespace Categories
 * @memberof Menu.Table
 * @description Creates table-menu entry for categories filter (specific for touch table)
 */

/**
 * @namespace Layer
 * @memberof Menu.Table
 * @description Creates layers in the table-menu
 */

/**
 * @namespace Main
 * @memberof Menu.Table
 * @description Creates the main table-menu
 */

/**
 * @namespace Tool
 * @memberof Menu.Table
 * @description Creates tools in the table-menu
 */

/**
 * @namespace Searchbar
 * @description Creates the search bar to serve several search possibilities
 */

/**
 * @namespace VisibleVector
 * @memberof Searchbar
 * @description todo
 */

/**
 * @namespace Bkg
 * @memberof Searchbar
 * @description Configures BKG search
 */

/**
 * @namespace Gaz
 * @memberof Searchbar
 * @description Configures gazetteer search
 */

/**
 * @namespace Gdi
 * @memberof Searchbar
 * @description Configures search in geodata infrastructure with elastic search
 */

/**
 * @namespace ElasticSearch
 * @memberof Searchbar
 * @description Configures search in geodata infrastructure with elastic search
 */

/**
 * @namespace Osm
 * @memberof Searchbar
 * @description Configures OpenStreetMap search
 */

/**
 * @namespace LocationFinder
 * @memberof Searchbar
 * @description Configures LocationFinder search
 */

/**
 * @namespace SpecialWFS
 * @memberof Searchbar
 * @description foobar
 */

/**
 * @namespace Tree
 * @memberof Searchbar
 * @description Configures search in layertree
 */

/**
 * @namespace VisibleVector
 * @memberof Searchbar
 * @description Configures search in visible vector layers
 */

/**
 * @namespace Sidebar
 * @description Sidebar
 */

/**
 * @namespace Snippets
 * @description Snippets for the filter model
 */

/**
 * @namespace Checkbox
 * @memberof Snippets
 * @description Checkbox snippet for the filter model
 */

/**
 * @namespace Dropdown
 * @memberof Snippets
 * @description Dropdown snippet for the filter model
 */

/**
 * @namespace MultiCheckbox
 * @memberof Snippets
 * @description Multicheckbox snippet for the filter model
 */

/**
 * @namespace Slider
 * @memberof Snippets
 * @description Slider snippet for the filter model
 */

/**
 * @namespace Value
 * @memberof Snippets
 * @description foobar
 */

/**
 * @namespace Datepicker
 * @memberof Snippets
 * @description Datepicker Snippet using bootstrap-datepicker
 */

/**
 * @namespace GraphicalSelect
 * @memberOf Snippets
 * @description GraphicalSelect Snippet for a dropdown to select square, circle or polygon to select an area in the map
 */

/**
 * @namespace Tools
 * @description Tools available in the application
 */

/**
 * @namespace AddWMS
 * @memberof Tools
 * @description Tool to add external WMS services as layer to the map.
 */

/**
 * @namespace CompareFeatures
 * @memberof Tools
 * @description Tool to compare multiple vectore features.
 */

/**
 * @namespace Contact
 * @memberof Tools
 * @description Contact Formular that allows the user to generate and send an email to the defined email account.
 */

/**
 * @namespace Download
 * @memberof Tools
 * @description Tool to download created drawings.
 */

/**
 * @namespace Draw
 * @memberof Tools
 * @description Tool to create drawings and texts on the map.
 */

/**
 * @namespace PopulationRequest
 * @memberof Tools
 * @description Tool to request data about inhabitants of Hamburg.
 */

/**
 * @namespace ExtendedFilter
 * @memberof Tools
 * @description Extended filter tool.
 */

/**
 * @namespace Filter
 * @memberof Tools
 * @description Filter tool.
 */

/**
 * @namespace Query
 * @memberof Tools.Filter
 * @description foobar
 */

/**
 * @namespace Source
 * @memberof Tools.Filter.Query
 * @description foobar
 */

/**
 * @namespace Graph
 * @memberof Tools
 * @description Module for generating graphics via d3
 */

/**
 * @namespace LayerSlider
 * @memberof Tools
 * @description Animates several configured layers consecutively (e.g. to show time series).
 * Can be configured as Player (sliderType="player") with start, stop, pause buttons.
 * Can be configured as Handle (sliderType="handle") with a drag handle to wander through the layers using transparency.
 */

/**
 * @namespace Measure
 * @memberof Tools
 * @description Measure distances and areas.
 */

/**
 * @namespace ParcelSearch
 * @memberof Tools
 * @description Parcel search.
 */

/**
 * @namespace Pendler
 * @memberof Tools
 * @description Animation of commuter movements.
 */

/**
 * @namespace Animation
 * @memberof Tools.Pendler
 * @description Animation of commuter movements.
 */

/**
 * @namespace Core
 * @memberof Tools.Pendler
 * @description Core of commuter movements.
 */

/**
 * @namespace Lines
 * @memberof Tools.Pendler
 * @description foobar
 */

/**
 * @namespace Print
 * @memberof Tools
 * @description Printing module
 */

/**
 * @namespace SaveSelection
 * @memberof Tools
 * @description Creates a parametric URL representing the current map state.
 */

/**
 * @namespace SearchByCoord
 * @memberof Tools
 * @description foobar
 */

/**
 * @namespace Shadow
 * @memberof Tools
 * @description Creates shadows in 3D mode.
 */

/**
 * @namespace StyleWMS
 * @memberof Tools
 * @description Tool that can modify wms tiles on request using an SLD-BODY
 */

/**
 * @namespace StyleVT
 * @memberof Tools
 * @description Tool that can modify vtl styles with external style documents
 */

/**
 * @namespace VirtualCity
 * @memberof Tools
 * @description Tool to show virtual city data
 */

/**
 * @namespace Wfst
 * @memberof Tools
 * @description Tool to visualize, insert, edit, delete and update WFS features.
 */

/**
 * @namespace SelectFeatures
 * @memberof Tools
 * @description Tool to select multiple Features from the map by using a box for selection.
 */

/**
 * @namespace TreeFilter
 * @description foobar
 */

/**
 * @namespace VectorStyle
 * @description foobar
 */

/**
 * @namespace WfsFeatureFilter
 * @description Filters features of included WFS-layers
 */

/**
 * @namespace WfsTransaction
 * @description Serves transactional WFS (WFS-T).
 */

/**
 * @namespace Window
 * @description Creates a window to show different content.
 */

/**
 * @namespace ZoomToFeature
 * @description Zooms to a given feature.
 */

/**
 * @namespace ZoomToGeometry
 * @description Zooms to a given geometry.
 */

/**
 * @namespace Alerting
 * @description Alerting system that responds to given events.
 * Used to have same alert all over the portal.
 */

/**
 * @namespace App
 * @description Loads core and instances all modules that have to be loaded, due to portal config
 */

/**
 * @namespace ClickCounter
 * @description This functionality registers user click behaviour and updates the url of an created iframe
 * used for Verkehrsportal.
 */

/**
 * @namespace Core
 * @description Loads core and instances all modules that have to be loaded, due to portal config
 */

/**
 * @namespace ModelList
 * @memberof Core
 * @description List module to gather all item models
 */

/**
 * @namespace ConfigLoader
 * @memberof Core
 * @description Parser module to gather portal configuration
 */

/**
 * @namespace Layer
 * @memberof Core.ModelList
 * @description Module to gather all layermodels
 */

/**
 * @namespace Folder
 * @memberof Core.ModelList
 * @description Module create folders in layertree
 */

/**
 * @namespace StaticLink
 * @memberof Core.ModelList
 * @description Module create static links which can be shown in menu or layertree
 */

/**
 * @namespace Tool
 * @memberof Core.ModelList
 * @description foobar
 */

/**
 * @namespace ViewPoint
 * @memberof Core.ModelList
 * @description foobar
 */

/**
 * @namespace CswParser
 * @description Model to parse the CSW output of metadata catalogue
 */

/**
 * @namespace SelectFeatures
 * @description Module that allows selecting features cross-wfs
 */

/**
 * @namespace FeatureLister
 * @description foobar
 */

/**
  * @namespace FeatureViaURL
  * @description Creates a new GeoJSON layer on the basis of the given features by the user via the URL.
  */

/**
 * @namespace Footer
 * @description Defines the footer shown on the bottom of the map.
 */

/**
 * @namespace Formular
 * @description Creates a specific formular to allow the user to request information from the 'Grenznachweis'.
 */

/**
 * @namespace HighlightFeature
 * @description Highlight a specified vector feature.
 */

/**
 * @namespace LayerInformation
 * @description Shows the layer-information in a popup on the map.
 */

/**
 * @namespace Main
 * @description Loading basic requirements such as the css. Then it starts the App.
 */

/**
 * @namespace Backbone
 * @description Backbone library for code architecture
 */

/**
 * @class Model
 * @memberof Backbone
 * @description {@link http://backbonejs.org/#Model}
 */

/**
 * @class View
 * @memberof Backbone
 * @description {@link http://backbonejs.org/#View}
 */

/**
 * @class Collection
 * @memberof Backbone
 * @description {@link http://backbonejs.org/#Collection}
 */

/**
 * @namespace Tileset
 * @memberof Core.ModelList.Layer
 * @description Helper functions for Cesium 3D TilesetLayer and VCS Style Handling
 */

/**
 * @namespace VectorStyle
 * @description vector styles for vector layer
 */

/**
 * @namespace SensorThingsMqtt
 * @memberof Core.ModelList.Layer
 * @description SensorThingsMqtt is a software layer to standardize the handling of mqtt v3.1, v3.1.1 and v5.0 for SensorThingsApi.
 */

/**
 * @namespace SensorThingsHttp
 * @memberof Core.ModelList.Layer
 * @description SensorThingsHttp is the software layer to handle the special needs of the SensorThingsAPI regarding the http protocol.
 */
