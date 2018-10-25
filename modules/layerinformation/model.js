import ViewMobile from "./viewMobile";
import View from "./view";

const LayerInformation = Backbone.Model.extend({
    defaults: {
        // true wenn die Layerinformation sichtbar ist
        isVisible: false,
        uniqueIdList: []
    },

    /**
     * Gibt die Url aus der rest-services.json passend zu "cswId" zurück
     * @return {String} - CSW GetRecordById Request-String
     */
    url: function () {
        var cswService = Radio.request("RestReader", "getServiceById", this.get("cswId")),
            url = "undefined";

        if (_.isUndefined(cswService) === false) {
            url = Radio.request("Util", "getProxyURL", cswService.get("url"));
        }
        return url;
    },

    initialize: function () {
        var channel = Radio.channel("LayerInformation");

        this.listenTo(channel, {
            "add": function (attrs) {
                this.setAttributes(attrs);
                this.setIsVisible(true);
            }
        });

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
            cswObj.keyList = ["abstractText", "date", "title", "downloadLinks"];
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
        }
        this.trigger("sync");
    },

    /**
     * Wertet das Array der der metaIDs aus und erzeugt Array metaURL mit vollständiger URL für Template, ohne Doppelte Einträge zuzulassen
     * @returns {void}
     */
    setMetadataURL: function () {
        var metaURLs = [],
            metaURL = "";

        _.each(this.get("metaID"), function (metaID) {
            if (this.url().search("metaver") !== -1) {
                metaURL = "http://metaver.de/trefferanzeige?docuuid=" + metaID;
            }
            else if (this.url().search("geodatenmv.de") !== -1) {
                metaURL = "http://www.geodaten-mv.de/geomis/Query/ShowCSWInfo.do?fileIdentifier=" + metaID;
            }
            else {
                metaURL = "http://hmdk.fhhnet.stadt.hamburg.de/trefferanzeige?docuuid=" + metaID;
            }
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

export default LayerInformation;
