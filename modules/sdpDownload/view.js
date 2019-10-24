import SdpDownloadTemplate from "text-loader!./template.html";
import GraphicalSelectView from "../snippets/graphicalselect/view";
import "bootstrap-select";

const SdpDownloadView = Backbone.View.extend({
    events: {
        // This event is fired when the sidebar closes
        "click .close": "closeView",
        // This event is fired when the user selects a format
        "change select.selectpicker[name='formatSelection']": "formatSelected",
        // These events are fired when the user clicks on download-buttons
        "click .sdp-download": "download",
        "click .sdp-neuwerk-download": "downloadNeuwerk",
        "click .sdp-download-scharhoern": "downloadScharhoern",
        "click .sdp-download-raster-overview-310": "downloadRasterOverview310",
        "click .sdp-download-raster-overview-320": "downloadRasterOverview320"
    },
    /**
     * @class SdpDownloadView
     * @extends Backbone.View
     * @memberof SDPDownload
     * @constructs
     * @fires Core.ModelList#RadioTriggerModelListToggleDefaultTool
     * @description Setting listener and create a view for graphical selection and render. Is responsible for toggling the sidebar.
     */
    initialize: function () {
        this.listenTo(this.model, {
            "change:isActive": function (model, isActive) {
                if (isActive) {
                    this.render(this.model);
                }
                else {
                    this.$el.remove();
                    Radio.trigger("Sidebar", "toggle", false);
                }
            },
            "render": function () {
                this.$el.remove();
                this.render(this.model);
            }
        });
        if (this.model) {
            this.graphicalSelectView = new GraphicalSelectView({model: this.model.get("graphicalSelectModel")});
            this.model.setLoaderPath(Radio.request("Util", "getPathFromLoader"));
        }
        if (this.model && this.model.get("isActive") === true) {
            this.render(this.model);
        }
    },
    template: _.template(SdpDownloadTemplate),
    className: "sdpDownload",
    // view for graphical selection
    graphicalSelectView: {},

    /**
     * Renders the SDP-Download in the sidebar and inits the dropdowns.
     * @param {Event} model - of the SDP-download
     * @returns {this} this
     */
    render: function (model) {
        const attr = model.toJSON();

        this.$el.html(this.template(attr));
        Radio.trigger("Sidebar", "append", this.el);
        Radio.trigger("Sidebar", "toggle", true);
        this.initFormatsSelectpicker();
        this.$el.find(".geometric-selection").append(this.graphicalSelectView.render().el);
        this.delegateEvents();
        return this;
    },
    /**
     * Closes the sidebar. Sets the model inactive.
     * @fires Core.ModelList#RadioTriggerModelListToggleDefaultTool
     * @returns {void}
     */
    closeView: function () {
        this.model.setIsActive(false);
        Radio.trigger("ModelList", "toggleDefaultTool");
    },
    /**
     * Initializes the dropdown with formats.
     * @returns {void}
     */
    initFormatsSelectpicker: function () {
        this.$el.find(".selectpicker").selectpicker({
            width: "100%",
            selectedTextFormat: "value",
            size: 6
        });
    },
    /**
     * calls the function "requestCompressedData" in the model
     * @param {Event} evt - changed
     * @returns {void}
     */
    download: function () {
        this.model.requestCompressedData();
    },
    /**
     * calls the function "requestCompressIslandData" for the island Neuwerk in the model
     * @param {Event} evt - changed
     * @returns {void}
     */
    downloadNeuwerk: function () {
        this.model.requestCompressIslandData("Neuwerk");
    },
    /**
     * calls the function "requestCompressIslandData" for the island Scharhörn in the model
     * @param {Event} evt - changed
     * @returns {void}
     */
    downloadScharhoern: function () {
        this.model.requestCompressIslandData("Scharhoern");
    },
    /**
     * calls the function "requestCompressRasterOverviewData" in LS310 in the model
     * @param {Event} evt - changed
     * @returns {void}
     */
    downloadRasterOverview310: function () {
        this.model.requestCompressRasterOverviewData("LS310");
    },
    /**
     * calls the function "requestCompressRasterOverviewData" in LS320 in the model
     * @param {Event} evt - changed
     * @returns {void}
     */
    downloadRasterOverview320: function () {
        this.model.requestCompressRasterOverviewData("LS320");
    },
    /**
     * Sets the selected format to the model.
     * @param {Event} evt - to get the format from
     * @returns {void}
     */
    formatSelected: function (evt) {
        this.model.set("selectedFormat", evt.target.value);
    }
});

export default SdpDownloadView;
