import SdpDownloadTemplate from "text-loader!./template.html";
import GraphicalSelectView from "../snippets/graphicalselect/view";
import "bootstrap-select";

const SdpDownloadView = Backbone.View.extend({
      events: {
        "click .close": "closeView",
        "change select.selectpicker[name='formatSelection']": "formatSelected",
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
            this.graphicalSelectView = new GraphicalSelectView({model: this.model.get("graphicalSelectModel")});
            this.model.setLoaderPath(Radio.request("Util", "getPathFromLoader"));
        }
        if (this.model && this.model.get("isActive") === true) {
            this.render(this.model, true);
       }
    },
    template: _.template(SdpDownloadTemplate),
    className:'sdpDownload',
    graphicalSelectView: {},

    render: function (model, value) {
        const attr = model.toJSON();
        this.$el.html(this.template(attr));
        Radio.trigger("Sidebar", "append", this.el);
        Radio.trigger("Sidebar", "toggle", true);
        this.initFormatsSelectpicker();
        this.$el.find(".geometric-selection").append(this.graphicalSelectView.render().el);
        this.delegateEvents();
        return this;
    },
    closeView: function () {
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