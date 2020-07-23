import StyleVTTemplate from "text-loader!./template.html";
import StyleVTTemplateNoStyleableLayers from "text-loader!./templateNoStyleableLayers.html";
import "bootstrap-colorpicker";

/**
 * @member StyleVtTemplate
 * @description Template used to create the user input form
 * @memberof Tools.StyleVT
 */

/**
 * @member StyleVtTemplateNoStyleableLayers
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
     * @class StyleVtView
     * @description View for style vt. Reacts to user input
     * @extends Backbone.View
     * @memberof Tools.StyleVT
     * @constructs
     * @listens StyleVtModel#sync
     * @listens StyleVtModel#changeIsActive
     * @listens StyleVtModel#changeModel
     * @listens StyleVtModel#changeAttributeName
     * @listens StyleVtModel#changeNumberOfClasses
     * @listens StyleVtModel#changeCurrentLng
     */
    initialize: function () {
        this.listenTo(this.model, {
            "sync": this.render,
            "change:isActive": function (model, value) {
                if (!value) {
                    this.model.setModel(null);
                    this.undelegateEvents();
                }
                else {
                    this.render();
                }
            },
            "change:model change:attributeName change:numberOfClasses": this.render,
            "invalid": this.showErrorMessages,
            "change:currentLng": () => {
                this.render(this.model, this.model.get("isActive"));
            }
        });
        if (Radio.request("Parser", "getTreeType") === "light") {
            this.model.refreshVectorTileLayerList();
        }
        if (this.model.get("isActive") === true) {
            this.render();
        }
    },
    className: "vtStyle-window",
    template: _.template(StyleVTTemplate),
    templateNoStyleableLayers: _.template(StyleVTTemplateNoStyleableLayers),

    /**
     * Render StyleVt view.
     * @return {Backbone.View} returns itself when rendered
     */
    render: function () {
        const attr = this.model.toJSON();

        this.setElement(document.getElementsByClassName("win-body")[0]);
        if (this.model.get("isActive") === true) {
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
