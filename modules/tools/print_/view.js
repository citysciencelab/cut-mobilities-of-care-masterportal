import PrintTemplate from "text-loader!./template.html";

/**
 * @member PrintTemplate
 * @description Template used to create the Print modul
 * @memberof print_
 */

const PrintView = Backbone.View.extend({
    events: {
        "change #printLayout": "setCurrentLayout",
        "change #printFormat": "setCurrentFormat",
        "change #printScale": "setCurrentScale",
        "keyup input[type='text']": "setTitle",
        "click #printLegend": "setIsLegendSelected",
        "click #printGfi": "setIsGfiSelected",
        "click button": "print"
    },

    /**
    * @class PrintView
    * @extends Backbone.View
    * @memberof print_
    * @constructs
    * @listens Print#RadioTriggerPrintChangeIsActive
    * @listens Print#RadioTriggerPrintChangeIsGfiActive
    * @listens Print#RadioTriggerPrintChangeCurrentScale
    */
    initialize: function () {
        this.template = _.template(PrintTemplate);
        this.listenTo(this.model, {
            "change:isActive": this.render,
            "change:isGfiActive": this.render,
            "change:currentScale": this.render
        });
    },

    /**
     * generates the print modul
     * @param {Backbone.Model} model - Print Model
     * @return {Backbone.View} itself
     */
    render: function (model) {
        var attributes = model.toJSON();

        if (model.get("isActive") && model.get("currentLayout")) {
            _.extend(attributes, {"scaleList": model.getPrintMapScales()});
            this.setElement(document.getElementsByClassName("win-body")[0]);
            this.$el.html(this.template(attributes));
            this.delegateEvents();
        }
        else {
            this.$el.empty();
        }

        return this;
    },

    /**
     * sets the current Layout of the map
     * @param {*} evt - event that triggers this function
     * @fires Map#RadioTriggerMapRender
     * @returns {void}
     */
    setCurrentLayout: function (evt) {
        var newLayout = this.model.getLayoutByName(this.model.get("layoutList"), evt.target.value);

        this.model.setCurrentLayout(newLayout);
        this.model.setIsScaleSelectedManually(false);

        Radio.trigger("Map", "render");
    },

    /**
     * sets the current format of the map
     * @param {*} evt - event that triggers this function
     * @returns {void}
     */
    setCurrentFormat: function (evt) {
        this.model.setCurrentFormat(evt.target.value);
    },

    /**
     * sets the current scale of the map
     * @param {*} evt - event that triggers this function
     * @fires Map#RadioRequestMapGetSize
     * @description  requests the size of the map
     * @returns {Array} - Array with the map size
     * @fires MapView#RadioTriggerMapViewSetConstrainedResolutionWithOptimalResolution
     * @description sets the constrained resolution of the MapView
     * @param {Number} optimalResolution - the optimal resolution for the print
     * @returns {void}
     */
    setCurrentScale: function (evt) {
        var scale = parseInt(evt.target.value, 10),
            optimalResolution = this.model.getOptimalResolution(scale, Radio.request("Map", "getSize"), this.model.getPrintMapSize());

        this.model.setCurrentScale(scale);

        Radio.trigger("MapView", "setConstrainedResolution", optimalResolution, 1);
        this.model.setIsScaleSelectedManually(true);
    },

    /**
     * sets the title for the print page
     * @param {*} evt - event that triggers this function
     * @returns {void}
     */
    setTitle: function (evt) {
        this.model.setTitle(evt.target.value);
    },

    /**
     * determines if the legend checkbox is selected or not
     * @param {*} evt - event that triggers this function
     * @returns {void}
     */
    setIsLegendSelected: function (evt) {
        this.model.setIsLegendSelected(evt.target.checked);
    },

    /**
     * determines if the gfi checkbox is selected or not
     * @param {*} evt - event that triggers this function
     * @returns {void}
     */
    setIsGfiSelected: function (evt) {
        this.model.setIsGfiSelected(evt.target.checked);
    },

    /**
     * triggers the printing
     * @returns {void}
     */
    print: function () {
        this.model.print();
    }
});

export default PrintView;
