/** -------------------- StyleWMS -------------------- */

/**
 * @event StyleWMS#RadioTriggerStyleWMSOpenStyleWMS
 * @param {Object} model Layer model to be styled
 * @description Opens the Tool and sets the layer model. Event is triggered by clicking on the glyphicon in the layer tree.
 * @example Radio.trigger("StyleWMS", "openStyleWMS", model)
 */

/**
 * @event StyleWMS#RadioTriggerStyleWmsResetParamsStyleWMS
 * @param {Object} model Layer model to be styled
 * @description Resets the stylewms params for legend
 * @example Radio.trigger("StyleWMS", "resetParamsStyleWMS", model)
 */

/**
 * @event StyleWMS#RadioTriggerStyleWmsUpdateParamsStyleWMS
 * @param {Object[]} attributes -
 * @description Sets the style wms params for legend so that the legend can be updated
 * @example Radio.trigger("StyleWMS", "updateParamsStyleWMS", attributes)
 */

/**
 * @event StyleWMS#changeModel
 * @description Triggered when layer model to style changes
 */

/**
 * @event StyleWMS#changeIsActive
 * @description Triggered when stylewms model gets activated
 */

/**
 * @event StyleWMS#changeAttributeName
 * @description Triggered when attributeName changes
 */

/**
 * @event StyleWMS#changeNumberOfClasses
 * @description Triggered when numberOfClasses changes
 */

/**
 * @event StyleWMS#changeSetSld
 * @description Triggered when setSLD changes
 */

/**
 * @event StyleWms#sync
 * @description Triggered when setSLD changes
 */


/** -------------------- ALERTING -------------------- */

/**
 * @event AlertingModel#changePosition
 * @param {Backbone/Model} model The model whose attribute hat changed.
 * @param {Boolean} value The attribute value that has changed.
 * @description Triggered when Model attribute position has changed.
 */

/**
 * @event AlertingModel#render
 * @description Triggered when View has to render.
 * @example this.trigger("render")
 */

/**
 * @event AlertingModel#RadioTriggerAlertAlert
 * @param {String/Object} alert The alert object or string needed to create the alert.
 * @example Radio.trigger("Alert", "alert", alert)
 */

/**
 * @event AlertingView#RadioTriggerAlertAlertRemove
 * @example Radio.trigger("Alert", "alert:remove")
 */

/**
 * @event AlertingView#RadioTriggerAlertClosed
 * @param {String} id The id of the alert that has been closed.
 * @example Radio.trigger("Alert", "closed", id)
 */

/**
 * @event AlertingView#RadioTriggerAlertConfirmed
 * @param {String} id The id of the alert that has been confirmed.
 * @example Radio.trigger("Alert", "confirmed", id)
 */


/** -------------------- CLICK COUNTER -------------------- */

/**
 * @event ClickCounter#RadioTriggerClickCounterToolChanged
 * @example Radio.trigger("ClickCounter", "toolChanged")
*/

/**
 * @event ClickCounter#RadioTriggerClickCounterCalcRoute
 * @example Radio.trigger("ClickCounter", "calcRoute")
*/

/**
 * @event ClickCounter#RadioTriggerClickCounterZoomChanged
 * @example Radio.trigger("ClickCounter", "zoomChanged")
*/

/**
 * @event ClickCounter#RadioTriggerClickCounterLayerVisibleChanged
 * @example Radio.trigger("ClickCounter", "layerVisibleChanged")
*/

/**
 * @event ClickCounter#RadioTriggerClickCounterGfi
 * @example Radio.trigger("ClickCounter", "gfi")
*/


/** -------------------- PARSER -------------------- */

/**
 * @event Parser#RadioRequestParserGetItemByAttributes
 * @param {object} attributes The Object that contains the attributes
 * @returns {Item} - Layer/Tool/Folder/control
 * @example Radio.request("Parser", "getItemByAttributes", attributes)
 */
/**
 * @event Parser#RadioRequestParserGetItemsByAttributes
 * @param {object} attributes The Object that contains the attributes
 * @returns {Item[]} - Layer/Tool/Folder/control
 * @example Radio.request("Parser", "getItemsByAttributes", attributes)
 */
/**
 * @event Parser#RadioRequestParserGetTreeType
 * @returns {*} todo
 * @example Radio.request("Parser", "getTreeType")
 */
/**
 * @event Parser#RadioRequestParserGetCategory
 * @returns {*} todo
 * @example Radio.request("Parser", "getCategory")
 */
/**
 * @event Parser#RadioRequestParserGetCategories
 * @returns {*} todo
 * @example Radio.request("Parser", "getCategories")
 */

/**
 * @event Parser#RadioRequestParserGetPortalConfig
 * @returns {*} todo
 * @example Radio.request("Parser", "getPortalConfig")
 */

/**
 * @event Parser#RadioRequestParserGetItemsByMetaID
 * @param {*} metaID - todo
 * @returns {*} todo
 * @example Radio.request("Parser", "getItemsByMetaID", metaID)
 */

/**
 * @event Parser#RadioRequestParserGetSnippetInfos
 * @returns {*} todo
 * @example Radio.request("Parser", "getSnippetInfos")
 */

/**
 * @event Parser#RadioRequestParserGetInitVisibBaselayer
 * @returns {*} todo
 * @example Radio.request("Parser", "getInitVisibBaselayer")
 */

/**
 * @event Parser#RadioTriggerParsersetCategory
 * @param {*} value -todo
 * @example Radio.trigger("Parser", "setCategory", value)
 */

/**
 * @event Parser#RadioTriggerParserAddItem
 * @param {Object} obj - Item
 * @example Radio.trigger("Parser", "addItem", obj)
 */
/**
 * @event Parser#RadioTriggerParserAddItemAtTop
 * @param {Object} obj - Item
 * @example Radio.trigger("Parser", "addItemAtTop", obj)
 */

/**
 * @event Parser#RadioTriggerParserAddItems
 * @param {array} objs Array of related objects, e.g. categories in Themenbaum
 * @param {object} attr Layerobject
 * @example Radio.trigger("Parser", "addItems", objs, attr)
 */

/**
 * @event Parser#RadioTriggerParserAddFolder
 * @param {*} name - todo
 * @param {*} id - todo
 * @param {*} parentId - todo
 * @param {*} level - todo
 * @param {*} isExpanded - todo
 * @example Radio.trigger("Parser", "addFolder", name, id, parentId, level, isExpanded)
 */

/**
 * @event Parser#RadioTriggerParserAddLayer
 * @param {*} name - todo
 * @param {*} id - todo
 * @param {*} parentId - todo
 * @param {*} level - todo
 * @param {*} layers - todo
 * @param {*} url - todo
 * @param {*} version - todo
 * @returns {void}
 * @example Radio.trigger("Parser", "addLayer", name, id, parentId, level, layers, url, version)
 */

/**
 * @event Parser#RadioTriggerParserAddGDILayer
 * @param {Object} values - includes {name, id, parentId, level, layers, url, version, gfiAttributes, datasets, isJustAdded}
 * @example Radio.trigger("Parser", "addGDILayer", values)
 */
/**
 * @event Parser#RadioTriggerParserAddGeoJSONLayer
 * @param {*} name - todo
 * @param {*} id - todo
 * @param {*} geojson - todo
 * @example Radio.trigger("Parser", "addGeoJSONLayer", name, id, geojson)
 */

/**
 * @event Parser#RadioTriggerParserRemoveItem
 * @description Event that removes an item from the layertree
 * @param {String} id - id from item that be removed
 * @example Radio.trigger("Parser", "removeItem", id)
 */

/**
 * @event Parser#ChangeCategory
 */


/** --------------------CONTACT -------------------- */

/**
 * @event ContactModel#changeIsActive
 * @description Is fired when attribute isActive changes
 */

/**
 * @event ContactModel#changeInvalid
 * @description Is fired when attribute isActive changes
 */


/** -------------------- REST READER -------------------- */

/**
 * @event RestReader#RadioRequestRestReaderGetServicebyId
 * @param {String} id Id of RestService
 * @example Radio.trigger("RestReader", "getServiceById", id)
 * @description Event that returns the config.json of the portal
 */

/** -------------------- LAYER -------------------- */

/**
 * @event Layer#changeIsSelected
 * @param {Backbone.Model} model The model whose attribute hat changed.
 * @param {Boolean} value The attribute value that has changed.
 * @description Fired if attribute isSelected has changed
 */

/**
 * @event Layer#changeIsVisibleInMap
 * @param {Backbone.Model} model The model whose attribute hat changed.
 * @param {Boolean} value The attribute value that has changed.
 * @description Fired if attribute isVisibleInMap has changed
 */

/**
 * @event Layer#changeTransparency
 * @param {Backbone.Model} model The model whose attribute hat changed.
 * @param {Boolean} value The attribute value that has changed.
 * @description Fired if attribute transparency has changed
 */

/**
 * @event Layer#changeIsSettingVisible
 * @param {Backbone.Model} model The model whose attribute hat changed.
 * @param {Boolean} value The attribute value that has changed.
 * @description Fired if attribute isSettingVisible has changed
 */

/**
 * @event Layer#changeIsVisibleInTree
 * @param {Backbone.Model} model The model whose attribute hat changed.
 * @param {Boolean} value The attribute value that has changed.
 * @description Fired if attribute isVisibleInTree has changed
 */

/**
 * @event Layer#changeIsOutOfRange
 * @param {Backbone.Model} model The model whose attribute hat changed.
 * @param {Boolean} value The attribute value that has changed.
 * @description Fired if attribute isOutOfRange has changed
 */

/**
 * @event Layer#RadioTriggerLayerUpdateLayerInfo
 * @param {String} name The name of the layer.
 * @example Radio.trigger("Layer", "updateLayerInfo", name)
 */

/**
 * @event Layer#RadioTriggerLayerSetLayerInfoChecked
 * @param {Boolean} value Flag that signs that the layer informations has been checked.
 * @example Radio.trigger("Layer", "setLayerInfoChecked", value)
 */

/**
 * @event Layer#RadioTriggerLayerFeaturesLoaded
 * @param {String} id Id of vector layer.
 * @param {ol/Feature[]} features Features that have been loaded.
 * @example Radio.trigger("Layer", "featuresLoaded", id, features)
 */


/** -------------------- MAP -------------------- */

/**
 * @event Map#RadioTriggerMapChange
 * @param {String} mode Mode of the map.
 * @description Event that gets fired when the map mode ("2D" / "3D") has changed.
 * @example Radio.trigger("Map", "change", mode)
 */

/**
 * @event Map#RadioTriggerMapAddLayerToIndex
 * @description Adds layer to given index
 * @param {Array} array Array consisting of the ol/layer and the given index. [layer, index]
 * @example Radio.trigger("Map", "addLayerToIndex", array)
 */

/**
 * @event Map#RadioRequestMapGetMapMode
 * @description Adds layer to given index
 * @returns {string} - The mode of the map. Value can be "2D" or "3D"
 * @example Radio.request("Map", "getMapMode")
 */

/**
 * @event Map#RadioRequestMapGetMap
 * @returns {ol/map} - The Openlayers Map.
 * @example Radio.request("Map", "getMap")
 */

/**
 * @event Map#RadioTriggerMapAddControl
 * @param {object} control Control to be added to map.
 * @example Radio.trigger("Map", "addControl", control)
 */


/** -------------------- MAP VIEW -------------------- */

/**
 * @event MapView#RadioTriggerMapViewChangedOptions
 * @param {Object} options Options of mapview status
 * @description Event that gets fired when the map view options have changed. The options are scale, center, zoomLevel
 * @example Radio.trigger("MapView", "changedOptions", options)
 */

/**
 * @event MapView#RadioRequestMapViewGetResoByScale
 * @param {String} scale Options of mapview status
 * @description Event that gets the resolution depending on the map scale
 * @example Radio.trigger("MapView", "getResoByScale", scale)
 */

/**
 * @event MapView#RadioRequestGetProjection
 * @description Event that returns the map projection
 * @returns {object} Projection of type ol/proj
 * @example Radio.request("MapView", "getProjection");
 */

/**
 * @event MapView#RadioTriggerMapViewSetZoomLevelUp
 * @description Event that sets the zoom-level one counter up
 * @example Radio.trigger("MapView", "setZoomLevelUp");
 */

/**
 * @event MapView#RadioTriggerMapViewSetZoomLevelDown
 * @description Event that sets the zoom-level one counter down
 * @example Radio.trigger("MapView", "setZoomLevelDown");
 */

/**
 * @event MapView#RadioTriggerMapViewResetView
 * @description Resets the map view
 * @example Radio.trigger("MapView", "resetVIew");
 */

/**
 * @event MapView#RadioRequestMapViewGetResolutions
 * @returns {object[]} - Returns the resolutions of the map
 * @example Radio.trigger("MapView", "getResolutions");
 */

/** -------------------- LAYER INFORMATION -------------------- */

/**
 * @event LayerInformation#RadioTriggerLayerInformationAdd
 * @param {Object} options Options of mapview status
 * @example Radio.trigger("LayerInformation", "add", options)
 */

/** -------------------- MODEL LIST -------------------- */

/**
 * @event List#RadioRequestModelListGetCollection
 * @description Returns itself
 * @example Radio.request("ModelList", "getCollection")
 */

/**
 * @event List#RadioRequestModelListGetModelsByAttributes
 * @param {Object} attributes Attributes used to find models to be returned
 * @description Returns the models that match the given attributes
 * @example Radio.request("ModelList", "getModelsByAttributes", attributes)
 */

/**
 * @event List#RadioRequestModelListGetModelByAttributes
 * @param {Object} attributes Attributes used to find model to be returned
 * @description Returns the first model that matches the given attributes. If model cannot be found, the function look for a group layer model containing the attributes
 * @example Radio.request("ModelList", "getModelByAttributes", attributes)
 */

/**
 * @event List#RadioTriggerModelListSetModelAttributesById
 * @description See {@link List#setModelAttributesById}
 * @example Radio.trigger("ModelList", "setModelAttributesById", id, attrs)
 */

/**
 * @event List#RadioTriggerModelListShowAllFeatures
 * @description See {@link List#showAllFeatures}
 * @example Radio.trigger("ModelList", "showAllFeatures", id)
 */

/**
 * @event List#RadioTriggerModelListHideAllFeatures
 * @description See {@link List#hideAllFeatures}
 * @example Radio.trigger("ModelList", "hideAllFeatures", id)
 */

/**
 * @event List#RadioTriggerModelListShowFeaturesById
 * @description See {@link List#showFeaturesById}
 * @example Radio.trigger("ModelList", "showFeaturesById", id, featureIds)
 */

/**
 * @event List#RadioTriggerModelListRemoveModelsByParentId
 * @description See {@link List#removeModelsByParentId}
 * @example Radio.trigger("ModelList", "removeModelsByParentId", parentId)
 */

/**
 * @event List#RadioTriggerModelListRemoveModelsById
 * @description See {@link List#removeModelsById}
 * @example Radio.trigger("ModelList", "removeModelsByParentId", id)
 */

/**
 * @event List#RadioTriggerModelListAddInitialyNeededModels
 * @description See {@link List#addInitialyNeededModels}
 * @example Radio.trigger("ModelList", "addInitialyNeededModels")
 */

/**
 * @event List#RadioTriggerModelListAddModelsByAttributes
 * @description See {@link List#addModelsByAttributes}
 * @example Radio.trigger("ModelList", "addModelsByAttributes", attrs)
 */

/**
 * @event List#RadioTriggerModelListSetIsSelectedOnChildLayers
 * @description See {@link List#setIsSelectedOnChildLayers}
 * @example Radio.trigger("ModelList", "setIsSelectedOnChildLayers", model)
 */

/**
 * @event List#RadioTriggerModelListSetIsSelectedOnParent
 * @description See {@link List#setIsSelectedOnParent}
 * @example Radio.trigger("ModelList", "setIsSelectedOnParent", model)
 */

/**
 * @event List#RadioTriggerModelListShowModelInTree
 * @description See {@link List#showModelInTree}
 * @example Radio.trigger("ModelList", "showModelInTree", modelId)
 */

/**
 * @event List#RadioTriggerModelListCloseAllExpandedFolder
 * @description See {@link List#closeAllExpandedFolder}
 * @example Radio.trigger("ModelList", "closeAllExpandedFolder")
 */

/**
 * @event List#RadioTriggerModelListSetAllDescendantsInvisible
 * @description See {@link List#setAllDescendantsInvisible}
 * @example Radio.trigger("ModelList", "setAllDescendantsInvisible", parentId, isMobile)
 */

/**
 * @event List#RadioTriggerModelListRenderTree
 * @fires List#RenderTree
 * @example Radio.trigger("ModelList", "renderTree")
 */

/**
 * @event List#RenderTree
 * @description Triggers "renderTree"
 * @example this.trigger("renderTree")
 */

/**
 * @event List#RadioTriggerModelListToggleWfsCluster
 * @description See {@link List#toggleWfsCluster}
 * @example Radio.trigger("ModelList", "toggleWfsCluster", value)
 */

/**
 * @event List#RadioTriggerModelListToggleDefaultTool
 * @description See {@link List#toggleDefaultTool}
 * @example Radio.trigger("ModelList", "toggleDefaultTool")
 */

/**
 * @event List#ChangeIsVisibleInMap
 * @description Triggered when one item has a change in the attribute isVisibleInMap
 * @fires List#RadioTriggerModelListUpdateVisibleInMapList
 * @fires List#RadioTriggerModelListUpdatedSelectedLayerList
 */

/**
 * @event List#ChangeIsExpanded
 * @description Triggered when one item has a change in the attribute isExpaned
 * @fires List#UpdateOverlayerView
 * @fires List#UpdateSelection
 * @fires List#TraverseTree
 * @fires List#RadioTriggerModelListUpdatedSelectedLayerList
 */

/**
 * @event List#ChangeIsSelected
 * @description Triggered when one item has a change in the attribute IsSelected
 * @fires List#UpdateSelection
 * @fires List#RadioTriggerModelListUpdatedSelectedLayerList
 */

/**
 * @event List#ChangeTransparency
 * @description Triggered when one item has a change in the attribute transparency
 * @fires List#RadioTriggerModelListUpdatedSelectedLayerList
 */

/**
 * @event List#ChangeSelectionIDX
 * @description Triggered when one item has a change in the attribute selectionIDX
 * @fires List#RadioTriggerModelListUpdatedSelectedLayerList
 */

/**
 * @event List#UpdateSelection
 * @description Triggered when selection was updated
 * @example this.trigger("updateSelection", model)
 */

/**
 * @event List#UpdateLightTree
 * @description Triggered when light tree was updated
 * @example this.trigger("updateLightTree")
 */

/**
 * @event List#ChangeSelectedList
 * @description Triggered when selected list has changed
 */

/**
 * @event List#TraverseTree
 * @description Used for mobile
 * @example this.trigger("traverseTree")
 */

/**
 * @event List#RadioTriggerModelListUpdateVisibleInMapList
 * @example Radio.trigger("ModelList", "updateVisibleInMapList")
 */

/**
 * @event List#RadioTriggerModelListUpdatedSelectedLayerList
 * @example Radio.trigger("ModelList", "updatedSelectedLayerList")
 */

/**
 * @event List#UpdateOverlayerView
 * @example this.trigger("updateOverlayerView", id)
 */

/** -------------------- ATTRIBUTIONS ----------------- */

/**
 * @event Attributions#RadioTriggerAttributionsRenderAttributions
 * @description Triggers rerender of attributions module
 * @example this.trigger("Attributions", "renderAttributions");
 */

/**
 * @event Attributions#RadioTriggerAttributionsRenderAttributions
 * @description Triggers rerender of attributions module
 * @example this.trigger("Attributions", "renderAttributions");
 */

/**
 * @event Attributions#changeIsContentVisible
 * @description Event for a changing property
 */

/**
 * @event Attributions#changeAttributionList
 * @description Event for a changing property
 */

/**
 * @event Attributions#changeIsVisibleInMap
 * @description Event for a changing property
 */

/**
 * @event Attributions#AttributionsRenderAttributions
 * @description Event for a changing property
 */



/** -------------------- SEARCHBAR -------------------- */

/**
 * @event Searchbar#renderRecommendedList
 * @description is triggered by SearchbarModel
 */

/**
 * @event Searchbar#RadioTriggerSearchbarDeleteSearchString
 * @description is triggered by SearchbarModel
 * @example Radio.trigger("Searchbar", "deleteSearchString");
 */

/**
 * @event Searchbar#RadioTriggerSearchbarSetFocus
 * @description is triggered by SearchbarModel
 * @example Radio.trigger("Searchbar", "setFocus");
 */

/**
 * @event Searchbar#RadioTriggerViewZoomHitSelected
 * @description is triggered by HitSelected
 * @example Radio.trigger("ViewZoom", "hitSelected");
 */

/**
 * @event Searchbar#RadioTriggerSearchbarSearchAll
 * @description trigger searchString to Searchbar
 * @param {String} searchString contains the string to search
 * @example Radio.trigger("Searchbar", "searchAll", searchString);
 */

/**
 * @event Searchbar#RadioTriggerSearchbarHit
 * @description triggers the hit
 * @param {String} hit contains the hit
 * @example Radio.trigger("Searchbar", "hit", hit);
 */


/** -------------------- MENU -------------------- */

/**
 * @event Menu#RadioTriggerTableMenuHideMenuElementSearchbar
 * @description is triggered by TableMenu
 * @example Radio.trigger("TableMenu", "hideMenuElementSearchbar")
 */

/**
 * @event Menu#RadioTriggerMenuLoaderReady
 * @description is triggered by MenuLoader
 * @param {String} parentElementId id from parent
 * @example Radio.trigger("MenuLoader", "ready", parentElementId)
 */

/**
 * @event Menu#RadioTriggerTableMenuDeactivateCloseClickFrame
 * @description foobar
 * @example Radio.trigger("TableMenu", "deactivateCloseClickFrame");
 */


/** -------------------- UTIL -------------------- */

/**
 * @event Util#RadioTriggerUtilIsViewMobileChanged
 * @description is triggered by Util if mobil is changed
 * @param {boolean} isViewMobile flag if current view is in mobile mode
 * @example Radio.trigger("Util", "isViewMobileChangend", isViewMobile)
 */

/**
 * @event Util#RadioRequestUtilPunctuate
 * @description converts value to string and rewrites punctuation rules. The 1000 separator is "." and the decimal separator is a ","
 * @param {String} value contains the string wich will be converted
 * @example Radio.request("Util", "punctuate", "3000.50");
 */

/**
 * @event Util#RadioRequestUtilIsViewMobile
 * @description checks if device is mobile
 * @returns {Boolean} device is mobile
 * @example Radio.request("Util", "isViewMobile");
 */

/**
 * @event Util#RadioRequestUtilGetProxyURL
 * @description returns the proxyURL
 * @param {String} url to be proxied
 * @returns {string} proxyURL
 * @example Radio.request("Util", "getProxyURL", this.get("gfiUrl"));
 */

/**
 * @event Util#RadioRequestUtilGetIgnoredKeys
 * @description returns the ignoredKeys
 * @returns {string[]} ignoredKeys
 * @example Radio.request("Util", "getIgnoredKeys");
 */

/**
 * @event Util#RadioTriggerUtilShowLoader
 * @example Radio.trigger("Util", "showLoader")
 * @description Shows loading gif
 */

/**
 * @event Util#RadioTriggerUtilHideLoader
 * @example Radio.trigger("Util", "hideLoader")
 * @description Shows loading gif
 */

/**
 * @event Util#RadioRequestGetConfig
 * @example Radio.request("Util", "getConfig")
 * @description Request config path
 */
/**
 * @event Util#RadioRequestUtilGetUiStyle
 * @description returns the ignoredKeys
 * @returns {string} - Style of the ui. Possible values are "DEFAULT" or "TABLE"
 * @example Radio.request("Util", "getUiStyle");
 */

/** -------------------- GRAPH -------------------- */

/**
 * @event Graph#RadioTriggerGraphCreateGraph
 * @description starts the generating of a graphic
 * @param {Object} graphConfig contains the options for the graphic
 * @example Radio.trigger("Graph", "createGraph", );
 */

/** -------------------- GFILIST -------------------- */

/**
 * @event gfiList#RadioTriggerRedraw
 * @description request feature infos for each model
 * @example Radio.trigger("gfiList", "redraw", );
 */

/** -------------------- QUICKHELP -------------------- */

/**
 * @event Quickhelp#RadioTriggerQuickhelpShowWindowHelp
 * @description is triggered by Quickhelp
 * @param {String} topic topic for quickhelp to show
 * @example Radio.trigger("Quickhelp", "showWindowHelp", topic);
 */


/** -------------------- TITLE -------------------- */

/**
 * @event Title#RadioTriggerTitleSetSize
 * @description is triggered when title has to be resized
 * @example Radio.trigger("Title", "setSize");
 */


/** -------------------- GFI -------------------- */

/**
 * @event GFI#RadioTriggerGFISetIsVisible
 * @description sets isVisible
 * @param {boolean} isVisible visibility of gfi
 * @example Radio.trigger("GFI", "setIsVisible", false);
 */

/**
 * @event GFI#RadioRequestGFIGetCurrentView
 * @description returns currentView
 * @returns {Backbone.View} GFI-View
 * @example Radio.request("GFI", "getCurrentView");
 */

/** -------------------- GFI.THEME -------------------- */

/**
 * @event Theme#changeIsReady
 * @description Triggered when gfi theme is loaded
 */

/** -------------------- MAPMARKER -------------------- */

/**
 * @event MapMarker#RadioTriggerMapMarkerZoomTo
 * @description triggers MapMarker to zoom to given hit using given scale
 * @param {object} hit contains the hit
 * @param {number} scale for map
 * @example Radio.trigger("MapMarker", "zoomTo", hit, scale);
 */

/**
 * @event MapMarker#RadioTriggerMapMarkerHideMarker
 * @description hides the mapMarker
 * @example Radio.trigger("MapMarker", "hideMarker");
 */

/**
 * @event MapMarker#RadioTriggerMapMarkerHidePolygon
 * @description hides the mapMarkerPolygon
 * @example Radio.trigger("MapMarker", "hidePolygon");
 */

/**
 * @event MapMarker#RadioTriggerMapMarkerShowMarker
 * @description shows the mapMarker
 * @param {number[]} coordinate mapMarker position
 * @example Radio.trigger("MapMarker", "showMarker", coordinate);
 */

/** -------------------- GFIVIEW -------------------- */

/**
 * @event gfiView#RadioTriggerRender
 * @description Triggered when GFI has to render.
 * @example Radio.trigger("gfiView", "render");
 */

/** -------------------- MOUSEHOVER -------------------- */

/**
 * @event MouseHover#RadioTriggerMouseHoverHide
 * @description hides the mouse hover div
 * @example Radio.trigger("MouseHover", "hide");
 */

/** -------------------- STYLELIST -------------------- */

/**
 * @event StyleList#RadioRequestReturnModelById
 * @description filters styles by id
 * @returns {function} Styling-Function
 * @example Radio.request("StyleList", "returnModelById", "1711");
 */

/** -------------------- REMOTEINTERFACE -------------------- */

/**
 * @event RemoteInterface#RadioTriggerPostMessage
 * @description Triggers a PostMessage to the RemoteInterface
 * @example Radio.trigger("RemoteInterface", "postMessage", {"allFeatures": JSON.stringify("..."), "layerId": 1711});
 */

/** -------------------- ControlsView -------------------- */

/**
 * @event Controls#RadioRequestControlsViewAddRowTr
 * @description Creates an HTML-Element at the end of the top-right section of the controls and returns the element
 * @param {String} id Id of element to be returned
 * @param {Boolean} showMobile Flag if Control should be shown in mobile mode
 * @example Radio.request("ControlsView", "addRowTR", id, showMobile);
 */

/**
 * @event Controls#RadioRequestControlsViewAddRowBr
 * @description Creates an HTML-Element at the end of the bottom-right section of the controls and returns the element
 * @param {String} id Id of element to be returned
 * @param {Boolean} showMobile Flag if Control should be shown in mobile mode
 * @example Radio.request("ControlsView", "addRowBR", id, showMobile);
 */

/**
 * @event Controls#RadioRequestControlsViewAddRowBl
 * @description Creates an HTML-Element at the end of the bottom-left section of the controls and returns the element
 * @param {String} id Id of element to be returned
 * @example Radio.request("ControlsView", "addRowBL", id);
 */


/** -------------------- RawLayerList -------------------- */

/**
 * @event RawLayerList#RadioRequestRawLayerListGetLayerWhere
 * @param {String} params Object of Params.
 * @returns {Layer} - Layer that matches the given params.
 * @example Radio.request("RawLayerList", "getLayerWhere", params);
 */
