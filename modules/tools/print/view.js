import PrintTemplate from "text-loader!./template.html";

/**
 * @member PrintTemplate
 * @description Template used to create the Print modul
 * @memberof print
 */

const PrintView = Backbone.View.extend(/** @lends PrintView.prototype */{
    events: {
        "change #printLayout": "setCurrentLayout",
        "change #printFormat": "setCurrentFormat",
        "change #printScale": "setCurrentScale",
        "keyup input[type='text']": "setTitle",
        "click #printLegend": "setIsLegendSelected",
        "click #printGfi": "setIsGfiSelected",
        "click button": "print",
        "mouseenter .hint": "showHintInfoScale",
        "mouseleave .hint": "showHintInfoScale"
    },

    /**
    * @class PrintView
    * @extends Backbone.View
    * @memberof print
    * @constructs
    * @listens Print#ChangeIsActive
    * @listens Print#ChangeIsGfiActive
    * @listens Print#ChangeCurrentScale
    * @listens Print#ChangeCurrentLng
    * @listens Print#ChangeCurrentMapScale
    */
    initialize: function () {
        this.template = _.template(PrintTemplate);
        this.listenTo(this.model, {
            "change": function (model) {
                const changed = model.changed;

                if (changed.hasOwnProperty("isActive")) {
                    this.render(model);
                }
                else if (changed.hasOwnProperty("isGfiActive")) {
                    this.render(model);
                }
                else if (changed.hasOwnProperty("currentScale")) {
                    this.render(model);
                }
                else if (changed.currentLng) {
                    this.render(model);
                }
                else if (changed.currentMapScale) {
                    this.render(model);
                }
            }
        });
    },

    /**
     * generates the print modul
     * @param {Backbone.Model} model - Print Model
     * @return {Backbone.View} itself
     */
    render: function (model) {
        const attributes = model.toJSON();

        if (model.get("isActive") && model.get("currentLayout")) {
            Object.assign(attributes, {"scaleList": model.getPrintMapScales()});
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
        const newLayout = this.model.getLayoutByName(this.model.get("layoutList"), evt.target.value);

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
     * @fires MapView#RadioTriggerMapViewSetConstrainedResolutionWithOptimalResolution
     * @returns {void}
     */
    setCurrentScale: function (evt) {
        const scale = parseInt(evt.target.value, 10),
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
        this.model.setTitlePlaceholder(evt.target.value);
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
    },

    /**
     * Showing the hint information if the current print scale and the current map scale are not the same
     * @param {Event} evt - event that triggered from the mouseenter or mouseleave action
     * @returns {void}
     */
    showHintInfoScale: function (evt) {
        if (!evt?.type) {
            return;
        }

        if (evt.type === "mouseenter") {
            document.querySelector(".hint-info").style.display = "block";
        }
        else {
            document.querySelector(".hint-info").style.display = "none";
        }
    }
});

export default PrintView;
