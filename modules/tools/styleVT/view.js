import StyleVTTemplate from "text-loader!./template.html";
import StyleVTTemplateNoStyleableLayers from "text-loader!./templateNoStyleableLayers.html";
import "bootstrap-colorpicker";

/**
 * @member StyleVTTemplate
 * @description Template used to create the user input form
 * @memberof Tools.StyleVT
 */

/**
 * @member StyleVTTemplateNoStyleableLayers
 * @description Template used if no styleable Layers are available
 * @memberof Tools.StyleVT
 */

const StyleVTView = Backbone.View.extend(/** @lends StyleVTView.prototype */{
    events: {
        // Choosing a layer
        "change #styleVT-selectedLayerField": "setModelByID",
        // Choosing a chosen layer's style
        "change #styleVT-selectedStyleField": "triggerStyleUpdate"
    },

    /**
     * @class StyleVTView
     * @description View for style vt. Reacts to user input.
     * @extends Backbone.View
     * @memberof Tools.StyleVT
     * @constructs
     * @listens Core.ConfigLoader#RadioRequestParserGetTreeType
     * @listens StyleVTModel#changeIsActive
     * @listens StyleVTModel#changeModel
     * @listens StyleVTModel#changeCurrentLng
     * @listens StyleVTModel#changeVectorTileLayerList
     */
    initialize: function () {
        this.listenTo(this.model, {
            "change:isActive": function (model, value) {
                if (!value) {
                    this.model.setModel(null);
                    this.undelegateEvents();
                }
                else {
                    this.render();
                }
            },
            "change:model change:currentLng change:vectorTileLayerList": this.render
        });
        if (Radio.request("Parser", "getTreeType") === "light") {
            this.model.refreshVectorTileLayerList();
        }
        if (this.model.get("isActive")) {
            this.render();
        }
    },
    className: "vtStyle-window",
    template: _.template(StyleVTTemplate),
    templateNoStyleableLayers: _.template(StyleVTTemplateNoStyleableLayers),

    /**
     * Render StyleVT view.
     * @return {Backbone.View} returns itself when rendered
     */
    render: function () {
        const attr = this.model.toJSON();

        this.setElement(document.getElementsByClassName("win-body")[0]);
        if (this.model.get("isActive")) {
            if (attr.vectorTileLayerList.length === 0) {
                this.$el.html(this.templateNoStyleableLayers(attr));
            }
            else {
                this.$el.html(this.template(attr));
            }

            // Listen to event, neccessary if window was closed inbetween
            this.delegateEvents();
        }

        return this;
    },

    /**
     * Resets tool to initial state.
     * @returns {void}
     */
    reset: function () {
        this.model.resetModel();
        this.render();
    },

    /**
     * Calls triggerStyleUpdate in model with event's value.
     * @param {ChangeEvent} evt change event
     * @returns {void}
     */
    triggerStyleUpdate: function (evt) {
        this.model.triggerStyleUpdate(evt.target.value);
    },

    /**
     * Calls setModelByID in model with event's value.
     * @param {ChangeEvent} evt change event
     * @returns {void}
     */
    setModelByID: function (evt) {
        this.model.setModelByID(evt.target.value);
    },

    /**
     * Hides tool.
     * @returns {void}
     */
    hide: function () {
        this.$el.hide();
    }
});

export default StyleVTView;
