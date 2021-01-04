import ViewMobile from "./viewMobile";
import View from "./view";
import Overlay from "ol/Overlay.js";
import "./RadioBridge.js";

const LayerInformationModel = Backbone.Model.extend(/** @lends LayerInformationModel.prototype */{
    defaults: {
        // konfiguriert in der rest-services.json
        metaDataCatalogueId: "2",
        // true wenn die Layerinformation sichtbar ist
        isVisible: false,
        uniqueIdList: [],
        datePublication: null,
        dateRevision: null,
        periodicityKey: null,
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
     * @property {String} periodicityKey=null to translate
     * @property {String} periodicity=null Periodicity
     * @property {Number} idCounter=0 counter for unique ids
     * @property {Overlay} overlay=new Overlay({element: undefined}) the overlay
     * @fires RestReader#RadioRequestRestReaderGetServiceById
     * @fires Core#RadioRequestUtilIsViewMobile
     * @fires CswParser#RadioTriggerCswParserGetMetaData
     * @fires LayerInformation#RadioTriggerLayerInformationSync
     * @fires LayerInformation#RadioTriggerLayerInformationRemoveView
     * @fires LayerInformation#RadioTriggerLayerInformationUnhighlightLayerInformationIcon
     * @fires Core#RadioTriggerMapAddOverlay
     * @listens LayerInformation#RadioTriggerLayerInformationAdd
     * @listens Core#RadioTriggerUtilIsViewMobileChanged
     * @listens CswParser#RadioTriggerCswParserFetchedMetaData
     */
    initialize: function () {
        const channel = Radio.channel("LayerInformation");

        this.listenTo(channel, {
            "add": function (attrs) {
                Radio.trigger("LayerInformation", "unhighlightLayerInformationIcon");
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
            "fetchedMetaDataForLayerInformation": this.fetchedMetaData
        });
        this.bindView(Radio.request("Util", "isViewMobile"));
        this.listenTo(Radio.channel("Map"), {
            "isReady": function () {
                Radio.trigger("Map", "addOverlay", this.get("overlay"));
            }
        }, this);

        this.listenTo(Radio.channel("i18next"), {
            "languageChanged": this.changeLang
        });

        this.changeLang(i18next.language);
    },

    /**
     * change language - sets default values for the language
     * @param {String} lng - new language to be set
     * @returns {Void} -
     */
    changeLang: function (lng) {
        this.setAdditionalMetadata(i18next.t("common:modules.layerInformation.additionalMetadata"));
        this.setAddressSuffix(i18next.t("common:modules.layerInformation.addressSuffix"));
        this.setAttachFileMessage(i18next.t("common:modules.layerInformation.attachFileMessage"));
        this.setCloseButton(i18next.t("common:modules.layerInformation.closeButton"));
        this.setDownloadDataset(i18next.t("common:modules.layerInformation.downloadDataset"));
        this.setInformationAndLegend(i18next.t("common:modules.layerInformation.informationAndLegend"));
        this.setLastModified(i18next.t("common:modules.layerInformation.lastModified"));
        this.setLegend(i18next.t("common:modules.layerInformation.legend"));
        this.setNoMetaDataMessage(i18next.t("common:modules.layerInformation.noMetaDataMessage"));
        this.setNoMetadataLoaded(i18next.t("common:modules.layerInformation.noMetadataLoaded"));
        this.setPeriodicityTitle(i18next.t("common:modules.layerInformation.periodicityTitle"));
        this.setPublicationCreation(i18next.t("common:modules.layerInformation.publicationCreation"));
        this.setPeriodicity(i18next.t(this.get("periodicityKey")));
        this.set("currentLng", lng);
    },

    /**
    * Updates parsed metadata of the layer.
    * @param {Object} cswObj Contains informations about the layer
    * @returns {void}
    */
    fetchedMetaData: function (cswObj) {
        if (this.isOwnMetaRequest(this.get("uniqueIdList"), cswObj?.uniqueId)) {
            this.removeUniqueIdFromList(this.get("uniqueIdList"), cswObj?.uniqueId);

            if (this.get("layerName") === cswObj?.layerName && cswObj?.parsedData?.downloadLinks) {
                const downloadLinks = this.get("downloadLinks");

                cswObj.parsedData.downloadLinks.forEach(link => {
                    downloadLinks.push(link);
                });
                this.setDownloadLinks(Radio.request("Util", "sortBy", downloadLinks, "linkName"));
            }
            else {
                this.updateMetaData(cswObj?.parsedData);
                this.setLayerName(cswObj?.layerName);
            }
            this.trigger("sync");
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
    * @param {Array} uniqueIdList to remove the id from
    * @param {String} uniqueId to remove from list
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
        this.setPeriodicity(i18next.t(parsedData?.periodicityKey));
    },
    /**
    * Triggers getMetaData from CswParser, if metaID available in attrs
    * @param {Object} attrs Objekt mit Attributen zur Darstellung
    * @fires CswParser#RadioTriggerCswParserGetMetaData
    * @returns {void}
    */
    requestMetaData: function (attrs) {
        if (Array.isArray(attrs.metaID) && attrs.metaID.length > 1) {
            attrs.metaID.forEach(metaID => {
                this.requestMetaData(Object.assign(attrs, {metaID: [metaID]}));
            });
        }
        else {
            const metaId = this.areMetaIdsSet(attrs.metaID) ? attrs.metaID[0] : null,
                uniqueId = this.uniqueId("layerinfo"),
                cswObj = {};

            if (metaId !== null) {
                this.get("uniqueIdList").push(uniqueId);
                cswObj.layerName = attrs.layername;
                cswObj.cswUrl = attrs.cswUrl;
                cswObj.metaId = metaId;
                cswObj.keyList = ["abstractText", "datePublication", "dateRevision", "periodicity", "title", "downloadLinks"];
                cswObj.uniqueId = uniqueId;

                Radio.trigger("CswParser", "getMetaDataForLayerInformation", cswObj);
            }
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
        this.setAdditionalMetadata(i18next.t("common:modules.layerInformation.additionalMetadata"));
        this.setAddressSuffix(i18next.t("common:modules.layerInformation.addressSuffix"));
        this.setAttachFileMessage(i18next.t("common:modules.layerInformation.attachFileMessage"));
        this.setCloseButton(i18next.t("common:modules.layerInformation.closeButton"));
        this.setDownloadDataset(i18next.t("common:modules.layerInformation.downloadDataset"));
        this.setInformationAndLegend(i18next.t("common:modules.layerInformation.informationAndLegend"));
        this.setLastModified(i18next.t("common:modules.layerInformation.lastModified"));
        this.setLegend(i18next.t("common:modules.layerInformation.legend"));
        this.setNoMetaDataMessage(i18next.t("common:modules.layerInformation.noMetaDataMessage"));
        this.setNoMetadataLoaded(i18next.t("common:modules.layerInformation.noMetadataLoaded"));
        this.setPeriodicityTitle(i18next.t("common:modules.layerInformation.periodicityTitle"));
        this.setPeriodicity(i18next.t(this.get("periodicityKey")));
        this.setPublicationCreation(i18next.t("common:modules.layerInformation.publicationCreation"));
        if (this.areMetaIdsSet(this.get("metaID"))) {
            this.set("downloadLinks", []);
            this.requestMetaData(attrs);
        }
        else {
            this.set("title", this.get("layername"));
            this.set("abstractText", i18next.t("common:modules.layerInformation.noMetadataMessage"));
            this.set("date", null);
            this.set("downloadLinks", null);
            this.set("datePublication", null);
            this.set("dateRevision", null);
            this.setPeriodicity(null);
            this.trigger("sync");
        }
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
            else if (typeof this.get("showDocUrl") !== "undefined" && this.get("showDocUrl") !== null) {
                metaURL = this.get("showDocUrl") + metaID;
            }
            else {
                metaURL = Radio.request("RestReader", "getServiceById", this.get("metaDataCatalogueId")).get("url") + metaID;
            }

            if (metaID !== null && metaID !== "" && metaURLs.indexOf(metaURL) === -1) {
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
    * Setter function for noMetaDataMessage
    * @param {String} value no message data
    * @returns {void}
    */
    setNoMetaDataMessage: function (value) {
        this.set("noMetaDataMessage", value);
    },

    /**
    * Setter function for noMetdataLoaded
    * @param {String} value no metdata loaded
    * @returns {void}
    */
    setNoMetadataLoaded: function (value) {
        this.set("noMetadataLoaded", value);
    },

    /**
    * Setter function for addressSuffix
    * @param {String} value address suffix
    * @returns {void}
    */
    setAddressSuffix: function (value) {
        this.set("addressSuffix", value);
    },

    /**
    * Setter function for attachFileMessage
    * @param {String} value attach file message
    * @returns {void}
    */
    setAttachFileMessage: function (value) {
        this.set("attachFileMessage", value);
    },

    /**
    * Setter function for closeButton
    * @param {String} value close button
    * @returns {void}
    */
    setCloseButton: function (value) {
        this.set("closeButton", value);
    },

    /**
    * Setter function for downloadDataset
    * @param {String} value download dataset
    * @returns {void}
    */
    setDownloadDataset: function (value) {
        this.set("downloadDataset", value);
    },

    /**
    * Setter function for lastModified
    * @param {String} value last modified
    * @returns {void}
    */
    setLastModified: function (value) {
        this.set("lastModified", value);
    },

    /**
    * Setter function for legend
    * @param {String} value legend
    * @returns {void}
    */
    setLegend: function (value) {
        this.set("legend", value);
    },

    /**
    * Setter function for periodicityTitle
    * @param {String} value periodicity title
    * @returns {void}
    */
    setPeriodicityTitle: function (value) {
        this.set("periodicityTitle", value);
    },
    /**
    * Setter function for periodicity
    * @param {String} value periodicity
    * @returns {void}
    */
    setPeriodicity: function (value) {
        this.set("periodicity", value);
    },

    /**
    * Setter function for publicationCreation
    * @param {String} value publication / creation
    * @returns {void}
    */
    setPublicationCreation: function (value) {
        this.set("publicationCreation", value);
    },

    /**
    * Setter function for informationAndLegend
    * @param {String} value information and legend
    * @returns {void}
    */
    setInformationAndLegend: function (value) {
        this.set("informationAndLegend", value);
    },

    /**
    * Setter function for additionalMetadata
    * @param {String} value additionalMetadata
    * @returns {void}
    */
    setAdditionalMetadata: function (value) {
        this.set("additionalMetadata", value);
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
    * Setter function for overlay element
    * @param {Object} value the element
    * @returns {void}
    */
    setUrlIsVisible: function (value) {
        this.set("urlIsVisible", value);
    },
    /**
    * Setter function for downloadLinks
    * @param {Object} value the element
    * @returns {void}
    */
    setDownloadLinks: function (value) {
        this.set("downloadLinks", value);
    },
    /**
    * Setter function for layerName
    * @param {Object} value the element
    * @returns {void}
    */
    setLayerName: function (value) {
        this.set("layerName", value);
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
