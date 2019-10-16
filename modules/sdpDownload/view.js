import SdpDownloadTemplate from "text-loader!./template.html";
import SnippetDropdownView from "../snippets/dropdown/view";
import "bootstrap-select";

const SdpDownloadView = Backbone.View.extend({
      events: {
        "click .close": "closeView",
        "change select.selectpicker[name='formatSelection']": "formatSelected",
        "changed.bs.select": "createDrawInteraction",
        "click .sdp-download": "download",
        "click .sdp-neuwerk-download": "downloadNeuwerk",
        "click .sdp-download-scharhoern": "downloadScharhoern",
        "click .sdp-download-raster-overview-310": "downloadRasterOverview310",
        "click .sdp-download-raster-overview-320": "downloadRasterOverview320"
    },
    initialize: function () {
        this.listenTo(this.model, {
            "change:isActive": function (model, isActive) {
                if (isActive) {
                    this.render(this.model, true);
                }
                else {
                    this.$el.remove();
                    Radio.trigger("Sidebar", "toggle", false);
                }
            },
            "render": function () {
                this.$el.remove();
                this.render(this.model, true);
            }
        });
        if (this.model){
            this.snippetDropdownView = new SnippetDropdownView({model: this.model.get("snippetDropdownModel")});
            this.model.setLoaderPath(Radio.request("Util", "getPathFromLoader"));
        }
        if (this.model && this.model.get("isActive") === true) {
            this.render(this.model, true);
       }
    },
    template: _.template(SdpDownloadTemplate),
    className:'sdpDownload',
    snippetDropdownView: {},

    render: function (model, value) {
        var attr = model.toJSON();
        this.$el.html(this.template(attr));
        Radio.trigger("Sidebar", "append", this.el);
        Radio.trigger("Sidebar", "toggle", true);
        this.initFormatsSelectpicker();
        this.$el.find(".geometric-selection").append(this.snippetDropdownView.render().el);
        this.delegateEvents();
        return this;
    },
    closeView: function () {
        this.model.resetView();
        this.model.resetGeographicSelection();
        this.model.setIsActive(false);
        Radio.trigger("ModelList", "toggleDefaultTool");
    },
    initFormatsSelectpicker: function () {
        this.$el.find(".selectpicker").selectpicker({
            width: "100%",
            selectedTextFormat: "value",
            size: 6
        });
    },
    /**
     * create draw interaction
     * @param {*} evt todo
     * @returns {void}
     */
    createDrawInteraction: function (evt) {
        var geographicValues = this.model.get("geographicValues");
        for (var prop in geographicValues) {
            if(prop === evt.target.title){
                if( this.model.get("drawInteraction")){
                    this.model.get("drawInteraction").setActive(false);
                }
                this.model.createDrawInteraction(evt.target.value);
                break;
            }
        }
    },
    download: function(evt){
        this.model.requestCompressedData();
    },
    downloadNeuwerk: function(evt){
        this.model.requestCompressIslandData('Neuwerk');
    },
    downloadScharhoern: function(evt){
        this.model.requestCompressIslandData('Scharhoern');
    },
    downloadRasterOverview310: function(evt){
        this.model.requestCompressRasterOverviewData('LS310');
    },
    downloadRasterOverview320: function(evt){
        this.model.requestCompressRasterOverviewData('LS320');
    },
    formatSelected: function(evt){
        this.model.set('selectedFormat', evt.target.value);
    }
  });

export default SdpDownloadView;