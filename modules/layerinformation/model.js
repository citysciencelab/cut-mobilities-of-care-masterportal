import ViewMobile from "./viewMobile";
import View from "./view";

const LayerInformationModel = Backbone.Model.extend({
    defaults: {
        // konfiguriert in der rest-services.json
        metaDataCatalogueId: "2",
        // true wenn die Layerinformation sichtbar ist
        isVisible: false,
        uniqueIdList: [],
        datePublication: null,
        dateRevision: null,
        periodicity: null
    },

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
    },
    fetchedMetaData: function (cswObj) {
        if (this.isOwnMetaRequest(this.get("uniqueIdList"), cswObj.uniqueId)) {
            this.removeUniqueIdFromList(this.get("uniqueIdList"), cswObj.uniqueId);
            this.updateMetaData(cswObj.layerName, cswObj.parsedData);
        }
    },
    isOwnMetaRequest: function (uniqueIdList, uniqueId) {
        return _.contains(uniqueIdList, uniqueId);
    },
    removeUniqueIdFromList: function (uniqueIdList, uniqueId) {
        this.setUniqueIdList(_.without(uniqueIdList, uniqueId));
    },
    updateMetaData: function (layerName, parsedData) {
        this.set(parsedData);
    },
    requestMetaData: function (attrs) {
        var metaId = !_.isNull(attrs.metaID) ? attrs.metaID[0] : null,
            uniqueId = _.uniqueId(),
            cswObj = {};

        if (!_.isNull(metaId)) {
            this.get("uniqueIdList").push(uniqueId);
            cswObj.layerName = attrs.layername;
            cswObj.metaId = metaId;
            cswObj.keyList = ["abstractText", "datePublication", "dateRevision", "periodicity", "title", "downloadLinks"];
            cswObj.uniqueId = uniqueId;
            Radio.trigger("CswParser", "getMetaData", cswObj);
        }
    },
    bindView: function (isMobile) {
        var currentView;

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
     * Wird über Trigger vom Layer gestartet und übernimmt die Attribute zur Darstellung
     * @param {object} attrs Objekt mit Attributen zur Darstellung
     * @fires sync#render-Funktion
     * @returns {void}
     */
    setAttributes: function (attrs) {
        this.set(attrs);
        this.setMetadataURL();
        if (!_.isNull(this.get("metaID")[0])) {
            this.requestMetaData(attrs);
        }
        else {
            this.set("title", this.get("layername"));
            this.set("abstractText", "Keine Metadaten vorhanden.");
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
        var metaURLs = [],
            metaURL = "",
            service;

        _.each(this.get("metaID"), function (metaID) {
            service = Radio.request("RestReader", "getServiceById", this.get("metaDataCatalogueId"));
            if (service === undefined) {
                console.warn("Alert", "alert", "Rest Service mit der ID " + this.get("metaDataCatalogueId") + " ist rest-services.json nicht konfiguriert!");
            }
            metaURL = Radio.request("RestReader", "getServiceById", this.get("metaDataCatalogueId")).get("url") + metaID;

            if (metaID !== "" && !_.contains(metaURLs, metaURL)) {
                metaURLs.push(metaURL);
            }
        }, this);
        this.set("metaURL", metaURLs);
    },

    setIsVisible: function (value) {
        this.set("isVisible", value);
    },
    setUniqueIdList: function (value) {
        this.set("uniqueIdList", value);
    }
});

export default LayerInformationModel;
