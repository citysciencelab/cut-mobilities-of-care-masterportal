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
 * @event Alerting#changePosition
 * @param {Backbone/Model} model The model whose attribute hat changed.
 * @param {Boolean} value The attribute value that has changed.
 * @description Triggered when Model attribute position has changed.
 */

/**
 * @event Alerting#render
 * @description Triggered when View has to render.
 * @example this.trigger("render")
 */

/**
 * @event Alerting#RadioTriggerAlertAlert
 * @param {String/Object} alert The alert object or string needed to create the alert.
 * @example Radio.trigger("Alert", "alert", alert)
 */

/**
 * @event Alerting#RadioTriggerAlertAlertRemove
 * @example Radio.trigger("Alert", "alert:remove")
 */

/**
 * @event Alerting#RadioTriggerAlertClosed
 * @param {String} id The id of the alert that has been closed.
 * @example Radio.trigger("Alert", "closed", id)
 */

/**
 * @event Alerting#RadioTriggerAlertConfirmed
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


/** -------------------- LEGEND -------------------- */

/**
 * @event Legend#RadioRequestLegendGetLegend
 * @param {layer} layer The layer, to which the legend should be returned.
 * @example Radio.request("Legend", "getLegend", layer)
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


/** -------------------- HEATMAP LAYER -------------------- */
/**
 * @event HeatmapLayer#RadioTriggerHeatmapLayerLoadInitialData
 * @param {String} layerId Id of vector layer.
 * @param {ol/Feature[]} features Features that have been loaded.
 * @example Radio.trigger("HeatmapLayer", "loadInitialData", layerId, features)
 */

 /**
 * @event HeatmapLayer#RadioTriggerHeatmapLayerLoadUpdateHeatmap
 * @param {String} layerId Id of vector layer.
 * @param {ol/Feature[]} features Features that have been loaded.
 * @example Radio.trigger("HeatmapLayer", "loadupdateHeatmap", layerId, features)
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
 * @event Map#RadioTriggerMapAddLayer
 * @description Adds layer to map
 * @param {Object} layer Layer to add to map
 * @example Radio.trigger("Map", "addLayer", layer)
 */

/**
 * @event Map#RadioRequestMapGetMapMode
 * @description Adds layer to given index
 * @returns {string} - The mode of the map. Value can be "2D" or "3D"
 * @example Radio.request("Map", "getMapMode")
 */

/**
 * @event Map#RadioRequestMapCreateLayerIfNotExists
 * @description Creates a layer if it does not exist
 * @returns {Object} - The newly created layer
 * @example Radio.request("Map", "createLayerIfNotExists", "newLayerName");
 */

/**
 * @event Map#RadioRequestMapGetMap
 * @returns {ol/map} - The Openlayers Map.
 * @example Radio.request("Map", "getMap")
 */

/**
 * @event Map#RadioTriggerMapAddControl
 * @param {Object} control Control to be added to map.
 * @example Radio.trigger("Map", "addControl", control)
 */

/**
 * @event Map#RadioTriggerMapSetGFIParams
 * @param {Object} control Control to be added to map.
 * @example Radio.trigger("Map", "addControl", control)
 */

/**
 * @event Map#RadioTriggerMapAddInteraction
 * @description Adds an interaction to the map (e.g. draw)
 * @param {Object} interaction Interaction to be added to map.
 * @example Radio.trigger("Map", "addInteraction", interaction)
 */

/**
 * @event Map#RadioTriggerMapRemoveInteraction
 * @description Removes an interaction from the map (e.g. draw)
 * @param {Object} interaction Interaction to be removed from the map.
 * @example Radio.trigger("Map", "removeInteraction", interaction)
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

/** -------------------- OBLIQUE MAP-------------------- */

/**
 * @event ObliqueMap#RadioTriggerObliqueMapRegisterLayer
 * @param {ObliqueLayer} layer ObliqueLayer.
 * @example Radio.trigger("ObliqueMap", "registerLayer", layer)
 */

 /**
 * @event ObliqueMap#RadioRequestObliqueMapIsActive
 * @returns {Boolean} - Flag if ObliqueMap is active.
 * @example Radio.request("ObliqueMap", "isActive")
 */

 /**
 * @event ObliqueMap#RadioTriggerObliqueMapActivateLayer
 * @param {ObliqueLayer} layer ObliqueLayer.
 * @example Radio.trigger("ObliqueMap", "activateLayer", layer)
 */


/** -------------------- MODEL LIST -------------------- */

/**
 * @event ModelList#RadioRequestModelListGetCollection
 * @description Returns itself
 * @example Radio.request("ModelList", "getCollection")
 */

/**
 * @event ModelList#RadioRequestModelListGetModelsByAttributes
 * @param {Object} attributes Attributes used to find models to be returned
 * @description Returns the models that match the given attributes
 * @example Radio.request("ModelList", "getModelsByAttributes", attributes)
 */

/**
 * @event ModelList#RadioRequestModelListGetModelByAttributes
 * @param {Object} attributes Attributes used to find model to be returned
 * @description Returns the first model that matches the given attributes. If model cannot be found, the function look for a group layer model containing the attributes
 * @example Radio.request("ModelList", "getModelByAttributes", attributes)
 */

/**
 * @event ModelList#RadioTriggerModelListSetModelAttributesById
 * @description See {@link List#setModelAttributesById}
 * @example Radio.trigger("ModelList", "setModelAttributesById", id, attrs)
 */

/**
 * @event ModelList#RadioTriggerModelListShowAllFeatures
 * @description See {@link List#showAllFeatures}
 * @example Radio.trigger("ModelList", "showAllFeatures", id)
 */

/**
 * @event ModelList#RadioTriggerModelListHideAllFeatures
 * @description See {@link List#hideAllFeatures}
 * @example Radio.trigger("ModelList", "hideAllFeatures", id)
 */

/**
 * @event ModelList#RadioTriggerModelListShowFeaturesById
 * @description See {@link List#showFeaturesById}
 * @example Radio.trigger("ModelList", "showFeaturesById", id, featureIds)
 */

/**
 * @event ModelList#RadioTriggerModelListRemoveModelsByParentId
 * @description See {@link List#removeModelsByParentId}
 * @example Radio.trigger("ModelList", "removeModelsByParentId", parentId)
 */

/**
 * @event ModelList#RadioTriggerModelListRemoveModelsById
 * @description See {@link List#removeModelsById}
 * @example Radio.trigger("ModelList", "removeModelsByParentId", id)
 */

/**
 * @event ModelList#RadioTriggerModelListAddInitialyNeededModels
 * @description See {@link List#addInitialyNeededModels}
 * @example Radio.trigger("ModelList", "addInitialyNeededModels")
 */

/**
 * @event ModelList#RadioTriggerModelListAddModelsByAttributes
 * @description See {@link List#addModelsByAttributes}
 * @example Radio.trigger("ModelList", "addModelsByAttributes", attrs)
 */

/**
 * @event ModelList#RadioTriggerModelListSetIsSelectedOnChildLayers
 * @description See {@link List#setIsSelectedOnChildLayers}
 * @example Radio.trigger("ModelList", "setIsSelectedOnChildLayers", model)
 */

/**
 * @event ModelList#RadioTriggerModelListSetIsSelectedOnParent
 * @description See {@link List#setIsSelectedOnParent}
 * @example Radio.trigger("ModelList", "setIsSelectedOnParent", model)
 */

/**
 * @event ModelList#RadioTriggerModelListShowModelInTree
 * @description See {@link List#showModelInTree}
 * @example Radio.trigger("ModelList", "showModelInTree", modelId)
 */

/**
 * @event ModelList#RadioTriggerModelListCloseAllExpandedFolder
 * @description See {@link List#closeAllExpandedFolder}
 * @example Radio.trigger("ModelList", "closeAllExpandedFolder")
 */

/**
 * @event ModelList#RadioTriggerModelListSetAllDescendantsInvisible
 * @description See {@link List#setAllDescendantsInvisible}
 * @example Radio.trigger("ModelList", "setAllDescendantsInvisible", parentId, isMobile)
 */

/**
 * @event ModelList#RadioTriggerModelListRenderTree
 * @fires ModelList#RenderTree
 * @example Radio.trigger("ModelList", "renderTree")
 */

/**
 * @event ModelList#RenderTree
 * @description Triggers "renderTree"
 * @example this.trigger("renderTree")
 */

/**
 * @event ModelList#RadioTriggerModelListToggleWfsCluster
 * @description See {@link List#toggleWfsCluster}
 * @example Radio.trigger("ModelList", "toggleWfsCluster", value)
 */

/**
 * @event ModelList#RadioTriggerModelListToggleDefaultTool
 * @description See {@link List#toggleDefaultTool}
 * @example Radio.trigger("ModelList", "toggleDefaultTool")
 */

/**
 * @event ModelList#ChangeIsVisibleInMap
 * @description Triggered when one item has a change in the attribute isVisibleInMap
 * @fires ModelList#RadioTriggerModelListUpdateVisibleInMapList
 * @fires ModelList#RadioTriggerModelListUpdatedSelectedLayerList
 */

/**
 * @event ModelList#ChangeIsExpanded
 * @description Triggered when one item has a change in the attribute isExpaned
 * @fires ModelList#UpdateOverlayerView
 * @fires ModelList#UpdateSelection
 * @fires ModelList#TraverseTree
 * @fires ModelList#RadioTriggerModelListUpdatedSelectedLayerList
 */

/**
 * @event ModelList#ChangeIsSelected
 * @description Triggered when one item has a change in the attribute IsSelected
 * @fires ModelList#UpdateSelection
 * @fires ModelList#RadioTriggerModelListUpdatedSelectedLayerList
 */

/**
 * @event ModelList#ChangeTransparency
 * @description Triggered when one item has a change in the attribute transparency
 * @fires ModelList#RadioTriggerModelListUpdatedSelectedLayerList
 */

/**
 * @event ModelList#ChangeSelectionIDX
 * @description Triggered when one item has a change in the attribute selectionIDX
 * @fires ModelList#RadioTriggerModelListUpdatedSelectedLayerList
 */

/**
 * @event ModelList#UpdateSelection
 * @description Triggered when selection was updated
 * @example this.trigger("updateSelection", model)
 */

/**
 * @event ModelList#UpdateLightTree
 * @description Triggered when light tree was updated
 * @example this.trigger("updateLightTree")
 */

/**
 * @event ModelList#ChangeSelectedList
 * @description Triggered when selected list has changed
 */

/**
 * @event ModelList#TraverseTree
 * @description Used for mobile
 * @example this.trigger("traverseTree")
 */

/**
 * @event ModelList#RadioTriggerModelListUpdateVisibleInMapList
 * @example Radio.trigger("ModelList", "updateVisibleInMapList")
 */

/**
 * @event ModelList#RadioTriggerModelListUpdatedSelectedLayerList
 * @example Radio.trigger("ModelList", "updatedSelectedLayerList")
 */

/**
 * @event ModelList#UpdateOverlayerView
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
 * @event Attributions#RadioTriggerAttributionsCreateAttribution
 * @description todo
 * @example this.trigger("Attributions", "createAttribution");
 */
/**
 * @event Attributions#RadioTriggerAttributionsRemoveAttribution
 * @description todo
 * @example this.trigger("Attributions", "removeAttribution");
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
 * @event Attributions#renderAttributions
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
 * @event Searchbar#RadioTriggerSearchbarSearch
 * @description trigger searchString to Searchbar
 * @param {String} searchString contains the string to search
 * @example Radio.trigger("Searchbar", "search", searchString);
 */

/**
 * @event Searchbar#RadioTriggerSearchbarPushHits
 * @description trigger transfer of search hits as a list
 * @param {String} sListname Name of list
 * @param {Array} aHitListArray Array of search hits
 * @example Radio.trigger("Searchbar", "pushHits", "hitList", aHitListArray);
 */

/**
 * @event Searchbar#RadioTriggerSearchbarCreateRecommendedList
 * @description todo
 * @param {String} todo todo
 * @example Radio.trigger("Searchbar", "createRecommendedList", "visibleVector");
 */

/**
 * @event Searchbar#RadioTriggerSearchbarRemoveHits
 * @description todo
 * @param {String} todo todo
 * @example Radio.trigger("Searchbar", "createRecommendedList", "visibleVector");
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

/** -------------------- WINDOW -------------------- */

/**
 * @event Window#RadioTriggerWindowCollapseWin
 * @description is triggered by tool
 * @param {Backbone.Model} model toolModel that is shown in toolwindow
 * @example Radio.trigger("Window", "collapseWin", model);
 */

/** -------------------- WINDOWVIEW -------------------- */

/**
 * @event WindowView#RadioTriggerWindowHide
 * @description is triggered by tool
 * @example Radio.trigger("WindowView", "hide");
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


/** -------------------- CONTROLS -------------------- */

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


/** -------------------- RAWLAYERLIST -------------------- */

/**
 * @event RawLayerList#RadioRequestRawLayerListGetLayerWhere
 * @param {String} params Object of Params.
 * @example Radio.request("RawLayerList", "getLayerWhere", params);
 */

/**
 * @event RawLayerList#RadioRequestRawLayerListGetLayerAttributesWhere
 * @description Returns the object of the layer that matches the given params.
 * @param {Object} params Object of Params.
 * @returns {Object} - Layer attributes.
 * @example Radio.request("RawLayerList", "getLayerAttributesWhere", params);
 */

/**
 * @event RawLayerList#RadioRequestRawLayerListGetLayerAttributesList
 * @description Returns the rawlayerList as json.
 * @returns {RawLayerList} - The rawLayerlist.
 * @example Radio.request("RawLayerList", "getLayerAttributesList");


/** -------------------- CswParser -------------------- */

/**
 * @event CswParser#RadioTriggerGetMetaData
 * @param {Object} cswObj Object of CSW request information.
 * @example Radio.trigger("CswParser", "getMetaData", cswObj);
 */

/**
 * @event CswParser#RadioTriggerFetchedMetaData
 * @param {Object} cswObj Object of CSW request information.
 * @example Radio.trigger("CswParser", "fetchedMetaData", cswObj);
 */


/** -------------------- FeatureLister -------------------- */

/**
 * @event FeatureLister#RadioTriggerToggle
 * @description Toggles the feature lister
 * @example Radio.trigger("FeatureLister", "toggle");
 */

/**
 * @event FeatureLister#RadioTriggerSwitchTabToListe
 * @description switches the tab to the tab 'list'
 * @param {Event} evt Object of Event which has been fired
 * @example Radio.trigger("FeatureLister", "switchTabToListe", evt);
 */

/**
 * @event FeatureLister#RadioTriggerSwitchTabToTheme
 * @description switches the tab to the tab 'theme'
 * @example Radio.trigger("FeatureLister", "switchTabToTheme");
 */

/**
 * @event FeatureLister#RadioTriggerSwitchTabToDetails
 * @description switches the tab to the tab 'details'
 * @param {Event} evt Object of Event which has been fired
 * @example Radio.trigger("FeatureLister", "switchTabToDetails", evt);
 */

/**
 * @event FeatureLister#RadioTriggerNewTheme
 * @description highlight layer on click and set it as current
 * @param {Event} evt Object of Event which has been fired
 * @example Radio.trigger("FeatureLister", "newTheme", evt);
 */

/**
 * @event FeatureLister#RadioTriggerHoverTr
 * @description show marker when hover on list entry in table
 * @param {Event} evt Object of Event which has been fired
 * @example Radio.trigger("FeatureLister", "hoverTr", evt);
 */

/**
 * @event FeatureLister#RadioTriggerSelectTr
 * @description sets the selected layer als active after click on table entry
 * @param {Event} evt Object of Event which has been fired
 * @example Radio.trigger("FeatureLister", "selectTr", evt);
 */

/**
 * @event FeatureLister#RadioTriggerMoreFeatures
 * @description reads more features and displays them
 * @example Radio.trigger("FeatureLister", "moreFeatures");
 */

/**
 * @event FeatureLister#RadioTriggerOrderList
 * @description sorts the selected column
 * @param {Event} evt Object of Event which has been fired
 * @example Radio.trigger("FeatureLister", "orderList", evt);
 */

/**
 * @event FeatureLister#changeIsActive
 * @description Triggered when isActive changes
 */

/**
 * @event FeatureLister#changeLayerList
 * @description Triggered when layerList changes
 */

/**
 * @event FeatureLister#changeLayer
 * @description Triggered when layer changes
 */

/**
 * @event FeatureLister#changeFeatureProps
 * @description Triggered when featureProps changes
 */

/**
 * @event FeatureLister#changeLayerId
 * @description Triggered when layerId changes
 */

/**
 * @event FeatureLister#changeFeatureId
 * @description Triggered when featureId changes
 */

/**
 * @event FeatureLister#RadioTriggerGfiHit
 * @description highlightes given features from gfi hits
 * @param {Event} evt Object of Event which has been fired
 * @example Radio.trigger("FeatureLister", "gfiHit", evt);
 */

/**
 * @event FeatureLister#RadioTriggerGfiClose
 * @description un-highlightes given features from gfi close
 * @example Radio.trigger("FeatureLister", "gfiClose");
 */


/** -------------------- Formular -------------------- */

/**
 * @event Formular#RadioTriggerKeyUp
 * @description Reacts on a key up event in the formular
 */

/**
 * @event Formular#RadioTriggerClick
 * @description Reacts on a click event in the formular
 */

/**
 * @event Formular#RadioTriggerFocusOut
 * @description Reacts on a focus out event in the formular
 */

/**
 * @event Formular#changeIsActive
 * @description Triggered when isActive changes
 */

/**
 * @event Formular#render
 * @param {GrenznachweisModel} model Model which holds the attributes to render
 * @param {Boolean} value Empty the formular or render it
 * @description Renders the formular
 */

/**
 * @event Formular#invalid
 * @param {GrenznachweisModel} model Model which holds the attributes to render
 * @param {Boolean} value Empty the formular or render it
 * @description Renders the formular
 */


/** -------------------- HighlightFeature -------------------- */

/**
 * @event HighlightFeature#RadioTriggerHighlightfeatureHighlightFeature
 * @param {String} featureToAdd String with comma seperated information about the feature to add "layerId, featureId"
 * @description Hightlights a specific feature
 */

/**
 * @event HighlightFeature#RadioTriggerHighlightfeatureHighlightPolygon
 * @param {ol.Feature} feature the feature to be highlighted
 * @description Hightlights a specific polygon
 */
