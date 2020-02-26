import StyleVTTemplate from "text-loader!./template.html";
import StyleVTTemplateNoStyleableLayers from "text-loader!./templateNoStyleableLayers.html";
import "bootstrap-colorpicker";

/**
 * @member StyleWmsTemplate
 * @description Template used to create the user input form
 * @memberof Tools.StyleWMS
 */

/**
 * @member StyleWmsTemplateNoStyleableLayers
 * @description Template used if no styleable Layers are available
 * @memberof Tools.StyleWMS
 */

const StyleVTView = Backbone.View.extend(/** @lends StyleWmsView.prototype */{
    events: {
        // Auswahl des Layers
        "change #styleVT-selectedLayerField": "setModelByID",
        // Auswahl der Attribute
        "change #styleVT-selectedStyleField": "triggerStyleUpdate"
    },

    /**
     * @class StyleWmsView
     * @description View for style wms. Reacts to user input
     * @extends Backbone.View
     * @memberof Tools.StyleWMS
     * @constructs
     * @listens StyleWmsModel#sync
     * @listens StyleWmsModel#changeIsActive
     * @listens StyleWmsModel#changeModel
     * @listens StyleWmsModel#changeAttributeName
     * @listens StyleWmsModel#changeNumberOfClasses
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
            "invalid": this.showErrorMessages
        });
        if (Radio.request("Parser", "getTreeType") === "light") {
            this.model.refreshVectorTileLayerList();
        }
        if (this.model.get("isActive") === true) {
            this.render();
        }
    },
    className: "wmsStyle-window",
    template: _.template(StyleVTTemplate),
    templateNoStyleableLayers: _.template(StyleVTTemplateNoStyleableLayers),


    /**
     * render styleWms view
     * @return {Backbone.View} returns itself when rendered
     */
    render: function () {
        var attr = this.model.toJSON();

        this.setElement(document.getElementsByClassName("win-body")[0]);
        if (this.model.get("isActive") === true) {

            if (attr.vectorTileLayerList.length === 0) {
                this.$el.html(this.templateNoStyleableLayers());
            }
            else {
                console.log("render with attrs", attr);
                if (attr.model) {
                    console.log("model:", attr.model.attributes.name);
                }
                this.$el.html(this.template(attr));
            }

            // Listen to event, neccessary if window was closed inbetween
            this.delegateEvents();
        }

        return this;
    },

    /**
     * resets Tool
     * @returns {void}
     */
    reset: function () {
        this.model.resetModel();
        this.render();
    },

    triggerStyleUpdate: function (evt) {
        this.model.triggerStyleUpdate(evt.target.value);
    },

    setModelByID: function (evt) {
        this.model.setModelByID(evt.target.value);
    },

    /**
     * Calls setNumberOfClasses in model
     * @param {ChangeEvent} evt -
     * @returns {void}
     */
    setNumberOfClasses: function (evt) {
        this.model.setNumberOfClasses(evt.target.value);
        this.setStyleClassAttributes();
    },

    /**
     * Creates and sets style-classes in model
     * @returns {void}
     */
    setStyleClassAttributes: function () {
        var styleClassAttributes = [],
            i;

        this.removeErrorMessages();
        for (i = 0; i < this.model.get("numberOfClasses"); i++) {
            styleClassAttributes.push({
                startRange: this.$(".start-range" + i).val(),
                stopRange: this.$(".stop-range" + i).val(),
                color: this.$(".selected-color" + i).val()
            });
        }
        this.model.setStyleClassAttributes(styleClassAttributes);
    },

    /**
     * Removes error messages
     * @returns {void}
     */
    removeErrorMessages: function () {
        this.$el.find(".error").remove();
        this.$el.find("[class*=selected-color], [class*=start-range], [class*=stop-range]").parent().removeClass("has-error");
    },

    /**
     * Hides Tool
     * @returns {void}
     */
    hide: function () {
        this.$el.hide();
    }
});

export default StyleVTView;
