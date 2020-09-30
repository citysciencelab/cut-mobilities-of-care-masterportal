import "./RadioBridge.js";

const ClickCounterModel = Backbone.Model.extend(/** @lends ClickCounterModel.prototype */{
    defaults: {
        countframeid: Radio.request("Util", "uniqueId", "countframe"),
        desktopURL: "",
        mobileURL: "",
        isMobile: false
    },
    /**
    * @class ClickCounterModel
    * @extends Backbone.Model
    * @memberof ClickCounter
    * @constructs
    * @classdesc Creates an invisible iFrame that points to an desktopURL or mobileURL according to the state of isViewMobile respectively a given URL parameter. The iFrame gets refreshed when specific clicks are done.
    * @param {String} desktopURL URL that gets refreshed when in desktop mode
    * @param {String} mobileURL  URL that gets refreshed when in mobile mode
    * @param {String} [staticLink=undefined]  URL type to use ignoring isMobile mode. [desktop|mobile|undefined]
    * @property {String} countframeid=Radio.request("Util", "uniqueId", "countframe") Id of iframe.
    * @property {String} desktopURL="" Url to be used in iframe when app runs in desktop mode.
    * @property {String} mobileURL="" Url to be used in iframe when app runs in mobile mode.
    * @property {Boolean} isMobile=false Boolean to indicate if view is in desktop or mobile mode.
    * @fires Core#RadioRequestUtilIsViewMobile
    * @listens Core#RadioTriggerUtilIsViewMobileChanged
    * @listens ClickCounter#RadioTriggerClickCounterToolChanged
    * @listens ClickCounter#RadioTriggerClickCounterCalcRoute
    * @listens ClickCounter#RadioTriggerClickCounterZoomChanged
    * @listens ClickCounter#RadioTriggerClickCounterLayerVisibleChanged
    * @listens ClickCounter#RadioTriggerClickCounterGfi
    */
    initialize: function (desktopURL, mobileURL, staticLink) {
        this.setURL(desktopURL, mobileURL, staticLink);
        this.setInitialIsMobile();
        this.addIFrame2Body();
        this.registerListener();
        this.refreshIframe();
    },

    /**
     * Adds an iFrame with a specific id and url to document.body
     * @returns {void}
     */
    addIFrame2Body: function () {
        const iframe = document.createElement("iframe");

        iframe.setAttribute("id", this.get("countframeid"));
        iframe.style.display = "none";
        iframe.src = this.getURL();
        document.body.appendChild(iframe);
    },

    /**
    * Request isViewMobile state of page
    * This seperate helper method enables unit tests of the setInitialIsMobile-method.
    * @fires Core#RadioRequestUtilIsViewMobile
    * @return {Boolean} Boolean is view in mobile mode or not
    */
    requestIsViewMobile: function () {
        return Radio.request("Util", "isViewMobile");
    },

    /**
     * Sets the iFrame URL for desktop and mobile state
     * @param {String} desktopURL URL that gets refreshed when in desktop mode
     * @param {String} mobileURL  URL that gets refreshed when in mobile mode
     * @param {String} [staticLink=undefined]  URL to use ignoring mobile state
     * @returns {void}
     */
    setURL: function (desktopURL, mobileURL, staticLink) {
        if (staticLink === "desktop") {
            this.setDesktopURL(desktopURL);
            this.setMobileURL(desktopURL);
        }
        else if (staticLink === "mobile") {
            this.setDesktopURL(mobileURL);
            this.setMobileURL(mobileURL);
        }
        else {
            this.setDesktopURL(desktopURL);
            this.setMobileURL(mobileURL);
        }
    },

    /**
     * Returns the string to use in the iFrame according to isViewMobile mode.
     * @returns {String} URL URL to use in iFrame
     */
    getURL: function () {
        if (this.get("isMobile")) {
            return this.get("mobileURL");
        }
        return this.get("desktopURL");
    },

    /**
     * Register all the listener used in this model
     * @listens ClickCounter#RadioTriggerClickCounterToolChanged
     * @listens ClickCounter#RadioTriggerClickCounterCalcRoute
     * @listens ClickCounter#RadioTriggerClickCounterZoomChanged
     * @listens ClickCounter#RadioTriggerClickCounterLayerVisibleChanged
     * @listens ClickCounter#RadioTriggerClickCounterGfi
     * @listens Core#RadioTriggerUtilIsViewMobileChanged
     * @returns {void}
     */
    registerListener: function () {
        const channel = Radio.channel("ClickCounter");

        channel.on({
            "toolChanged": this.refreshIframe,
            "calcRoute": this.refreshIframe,
            "zoomChanged": this.refreshIframe,
            "layerVisibleChanged": this.refreshIframe,
            "gfi": this.refreshIframe
        }, this);

        this.listenTo(Radio.channel("Util"), {
            "isViewMobileChanged": this.setIsMobile
        });
    },

    /**
     * Sets initially isViewMobile-mode
     * @returns {void}
     */
    setInitialIsMobile: function () {
        const isViewMobile = this.requestIsViewMobile();

        if (isViewMobile) {
            this.setIsMobile(true);
        }
        else {
            this.setIsMobile(false);
        }
    },

    /**
     * Refreshes the iframe setting a specific URL
     * @return {void}
     */
    refreshIframe: function () {
        const id = this.get("countframeid"),
            url = this.getURL();

        document.getElementById(id).src = url;
    },

    /**
    * setter for desktopURL
    * @param {String} value desktopURL
    * @returns {void}
    */
    setDesktopURL: function (value) {
        this.set("desktopURL", value);
    },

    /**
    * setter for mobileURL
    * @param {String} value mobileURL
    * @returns {void}
    */
    setMobileURL: function (value) {
        this.set("mobileURL", value);
    },

    /**
    * setter for isMobile
    * @param {Boolean} value isMobile
    * @returns {void}
    */
    setIsMobile: function (value) {
        this.set("isMobile", value);
    }
});

export default ClickCounterModel;
