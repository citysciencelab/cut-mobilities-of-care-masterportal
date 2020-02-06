import ViewMobile from "./viewMobile";
import View from "./view";
import Overlay from "ol/Overlay.js";

const LayerInformationModel = Backbone.Model.extend(/** @lends LayerInformationModel.prototype */{
    defaults: {
        // konfiguriert in der rest-services.json
        metaDataCatalogueId: "2",
        // true wenn die Layerinformation sichtbar ist
        isVisible: false,
        uniqueIdList: [],
        datePublication: null,
        dateRevision: null,
        periodicity: null,
        idCounter: 0,
        overlay: new Overlay({element: undefined})
    },

    /**
     * @class LayerInformationModel
     * @extends Backbone.Model
     * @memberof LayerInformation
     * @constructs
     * @property {String} cswId="3" configures service from rest-services.json
     * @property {Boolean} isVisible=false Flag, if the layerinformation is visible
     * @property {Array} uniqueIdList todo
     * @property {String} datePublication=null Date of publication
     * @property {String} dateRevision=null Date of revision
     * @property {String} periodicity=null Periodicity
     * @property {Number} idCounter=0 counter for unique ids
     * @property {Overlay} overlay=new Overlay({element: undefined}) the overlay
     * @fires RestReader#RadioRequestRestReaderGetServiceById
     * @fires Core#RadioRequestUtilIsViewMobile
     * @fires CswParser#RadioTriggerCswParserGetMetaData
     * @fires LayerInformation#RadioTriggerLayerInformationSync
     * @fires LayerInformation#RadioTriggerLayerInformationRemoveView
     * @fires Core#RadioTriggerMapAddOverlay
     * @listens LayerInformation#RadioTriggerLayerInformationAdd
     * @listens Core#RadioTriggerUtilIsViewMobileChanged
     * @listens CswParser#RadioTriggerCswParserFetchedMetaData
     */
    initialize: function () {
        var channel = Radio.channel("LayerInformation");

        this.listenTo(channel, {
            "add": function (attrs) {
                this.setAttributes(attrs);
                this.setIsVisible(true);
            }
        });

        channel.reply({
            "getIsVisible": function () {
                return this.get("isVisible");
            }
        }, this);

        this.listenTo(Radio.channel("Util"), {
            "isViewMobileChanged": function (isMobile) {
                this.trigger("removeView");
                this.bindView(isMobile);
            }
        });
        this.listenTo(Radio.channel("CswParser"), {
            "fetchedMetaData": this.fetchedMetaData
        });
        this.bindView(Radio.request("Util", "isViewMobile"));
        this.listenTo(Radio.channel("Map"), {
            "isReady": function () {
                Radio.trigger("Map", "addOverlay", this.get("overlay"));
            }
        }, this);
    },

    /**
    * Updates parsed metadata of the layer.
    * @param {Object} cswObj Contains informations abou the layer
    * @returns {void}
    */
    fetchedMetaData: function (cswObj) {
        if (this.isOwnMetaRequest(this.get("uniqueIdList"), cswObj.uniqueId)) {
            this.removeUniqueIdFromList(this.get("uniqueIdList"), cswObj.uniqueId);
            this.updateMetaData(cswObj.parsedData);
        }
    },
    /**
    * Returns true, if the uniqueId is contained in list of uniqueIds
    * @param {Array} uniqueIdList list of uniqueIds
    * @param {string} uniqueId uniqueId to check
    * @returns {Boolean} true|false
    */
    isOwnMetaRequest: function (uniqueIdList, uniqueId) {
        return uniqueIdList ? uniqueIdList.indexOf(uniqueId) > -1 : false;
    },
    /**
    * Removes the uniqueId from the given list.
    * @param {*} uniqueIdList to remove the id from
    * @param {*} uniqueId to remove from list
    * @returns {void}
    */
    removeUniqueIdFromList: function (uniqueIdList, uniqueId) {
        const index = uniqueIdList ? uniqueIdList.indexOf(uniqueId) : -1;

        if (index > -1) {
            uniqueIdList.splice(index, 1);
        }
        this.setUniqueIdList(uniqueIdList ? uniqueIdList : []);
    },
    /**
    * Adds all parsed data to this model.
    * @param {Object} parsedData parsed metadata
    * @returns {void}
    */
    updateMetaData: function (parsedData) {
        this.set(parsedData);
    },
    /**
    * Triggers getMetaData from CswParser, if metaID available in attrs
    * @param {Object} attrs Objekt mit Attributen zur Darstellung
    * @fires CswParser#RadioTriggerCswParserGetMetaData
    * @returns {void}
    */
    requestMetaData: function (attrs) {
        const metaId = this.areMetaIdsSet(attrs.metaID) ? attrs.metaID[0] : null,
            uniqueId = this.uniqueId("layerinfo"),
            cswObj = {};

        if (metaId !== null) {
            this.get("uniqueIdList").push(uniqueId);
            cswObj.layerName = attrs.layername;
            cswObj.metaId = metaId;
            cswObj.keyList = ["abstractText", "datePublication", "dateRevision", "periodicity", "title", "downloadLinks"];
            cswObj.uniqueId = uniqueId;
            Radio.trigger("CswParser", "getMetaData", cswObj);
        }
    },
    /**
     * Returns a unique id, starts with the given prefix
     * @param {string} prefix prefix for the id
     * @returns {string} a unique id
     */
    uniqueId: function (prefix) {
        let counter = this.get("idCounter");
        const id = ++counter;

        this.setIdCounter(id);
        return prefix ? prefix + id : id;
    },
    /**
    * Binds the view depending on mobile or not.
    * @param {Boolean} isMobile true, if app is on a mobile
    * @returns {void}
    */
    bindView: function (isMobile) {
        let currentView;

        if (isMobile === true) {
            currentView = new ViewMobile({model: this});
        }
        else {
            currentView = new View({model: this});
        }
        if (this.get("isVisible") === true) {
            currentView.render();
        }
    },

    /**
     * Checks if the metaDataIds are an array and filled with at least on string
     * @param {Array} metaDataIds an array containing metIds
     * @returns {Boolean} true, if metaId is found in the array
     */
    areMetaIdsSet: function (metaDataIds) {
        return Array.isArray(metaDataIds) && metaDataIds.length > 0 && typeof metaDataIds[0] === "string" && metaDataIds[0].length > 0;
    },

    /**
     * Is started with a trigger from the layer and takes the attributes for presentation
     * @param {Object} attrs Objekt mit Attributen zur Darstellung
     * @fires LayerInformation#RadioTriggerLayerInformationSync
     * @returns {void}
     */
    setAttributes: function (attrs) {
        this.set(attrs);
        this.setMetadataURL();
        if (this.areMetaIdsSet(this.get("metaID"))) {
            this.requestMetaData(attrs);
        }
        else {
            this.set("title", this.get("layername"));
            this.set("abstractText", "Fehler beim Laden der Vorschau der Metadaten.");
            this.set("date", null);
            this.set("metaURL", null);
            this.set("downloadLinks", null);
            this.set("datePublication", null);
            this.set("dateRevision", null);
            this.set("periodicity", null);
        }
        this.trigger("sync");
    },

    /**
     * Checks the array of metaIDs and creates array metaURL with complete URL for template. Does not allow duplicated entries
     * @returns {void}
     */
    setMetadataURL: function () {
        const metaURLs = [];
        let metaURL = "",
            service;

        this.get("metaID").forEach(function (metaID) {
            service = Radio.request("RestReader", "getServiceById", this.get("metaDataCatalogueId"));
            if (service === undefined) {
                console.warn("Rest Service mit der ID " + this.get("metaDataCatalogueId") + " ist rest-services.json nicht konfiguriert!");
            }
            else {
                metaURL = Radio.request("RestReader", "getServiceById", this.get("metaDataCatalogueId")).get("url") + metaID;
            }

            if (metaID !== "" && metaURLs.indexOf(metaURL) === -1) {
                metaURLs.push(metaURL);
            }
        }, this);
        this.set("metaURL", metaURLs);
    },
    /**
    * Sets the idCounter.
    * @param {string} value counter
    * @returns {void}
    */
    setIdCounter: function (value) {
        this.set("idCounter", value);
    },
    /**
    * Setter function for isVisible
    * @param {Boolean} value true, if this is visible
    * @returns {void}
    */
    setIsVisible: function (value) {
        this.set("isVisible", value);
    },
    /**
    * Setter function for uniqueIdList
    * @param {Array} value the uniqueIdList
    * @returns {void}
    */
    setUniqueIdList: function (value) {
        this.set("uniqueIdList", value);
    },
    /**
    * Setter function for overlay element
    * @param {Object} value the element
    * @returns {void}
    */
    setOverlayElement: function (value) {
        this.get("overlay").setElement(value);
    },
    /**
    * Getter function for overlay element
    * @returns {Object} the overlay-element
    */
    getOverlayElement: function () {
        return this.get("overlay").getElement();
    }

});

export default LayerInformationModel;
