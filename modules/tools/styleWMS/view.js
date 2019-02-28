import StyleWmsTemplate from "text-loader!./template.html";
import StyleWmsTemplateNoStyleableLayers from "text-loader!./templateNoStyleableLayers.html";
import "bootstrap-colorpicker";

/**
 * @member StyleWmsTemplate
 * @description Template used to create the user inut form
 * @memberof StyleWMS
 */

/**
 * @member StyleWmsTemplateNoStyleableLayers
 * @description Template used if no styleable Layers are available
 * @memberof StyleWMS
 */

const StyleWmsView = Backbone.View.extend(/** @lends StyleWmsView.prototype */{
    events: {
        // Auswahl des Layers
        "change #layerField": "setModelById",
        // Auswahl der Attribute
        "change #attributField": "setAttributeName",
        // Auswahl Anzahl der Klassen
        "change #numberField": "setNumberOfClasses",
        // Eingabe der Wertebereiche
        "keyup [class*=start-range], [class*=stop-range]": "setStyleClassAttributes",
        // Auswahl der Farbe
        "changeColor [id*=style-wms-colorpicker]": "setStyleClassAttributes",
        // Anwenden Button
        "click .submit": "createSLD",
        "click .reset": "reset",
        "click .glyphicon-remove": "hide"
    },

    /**
     * @class StyleWmsView
     * @description View for style wms. Reacts to user input
     * @extends Backbone.View
     * @memberOf StyleWMS
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
            this.model.refreshStyleableLayerList();
        }
        if (this.model.get("isActive") === true) {
            this.render();
        }
    },
    className: "wmsStyle-window",
    template: _.template(StyleWmsTemplate),
    templateNoStyleableLayers: _.template(StyleWmsTemplateNoStyleableLayers),


    /**
     * render styleWms view
     * @return {Backbone.View} returns itself when rendered
     */
    render: function () {
        var attr = this.model.toJSON();

        this.setElement(document.getElementsByClassName("win-body")[0]);
        if (this.model.get("isActive") === true) {

            if (attr.styleableLayerList.length === 0) {
                this.$el.html(this.templateNoStyleableLayers());
            }
            else {
                this.$el.html(this.template(attr));

                if (attr.model !== null && attr.model !== undefined) {
                    this.$el.find("#layerField").find("option[value='" + attr.model.get("id") + "']").attr("selected", true);
                    this.$el.find("[class*=selected-color]").parent().colorpicker({format: "hex"});
                }
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

    /**
     * Calls setAttributeName in model
     * @param {ChangeEvent} evt  -
     * @returns {void}
     */
    setAttributeName: function (evt) {
        this.model.setAttributeName(evt.target.value);
    },

    /**
     * Calls setModelById in model
     * @param {ChangeEvent} evt  -
     * @returns {void}
     */
    setModelById: function (evt) {
        this.model.setModelById(evt.target.value);
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
     * Creates sld in model
     * @returns {void}
     */
    createSLD: function () {
        this.model.createSLD();
    },

    /**
     * Shows error Messages
     * @returns {void}
     */
    showErrorMessages: function () {
        _.each(this.model.get("errors"), function (error) {
            if (_.has(error, "colorText") === true) {
                this.$el.find(".selected-color" + error.colorIndex).parent().addClass("has-error");
                this.$el.find(".selected-color" + error.colorIndex).parent().after("<span class='error'>" + error.colorText + "</span>");
            }
            if (_.has(error, "rangeText") === true) {
                this.$el.find(".start-range" + error.rangeIndex).parent().addClass("has-error");
                this.$el.find(".stop-range" + error.rangeIndex).parent().addClass("has-error");
                this.$el.find(".start-range" + error.rangeIndex).after("<span class='error'>" + error.rangeText + "</span>");
            }
            if (_.has(error, "intersectText") === true) {
                this.$el.find(".start-range" + error.intersectIndex).parent().addClass("has-error");
                this.$el.find(".stop-range" + error.prevIndex).parent().addClass("has-error");
                this.$el.find(".start-range" + error.intersectIndex).after("<span class='error'>" + error.intersectText + "</span>");
                this.$el.find(".stop-range" + error.prevIndex).after("<span class='error'>" + error.intersectText + "</span>");
            }
            if (_.has(error, "minText") === true) {
                this.$el.find(".start-range" + error.minIndex).parent().addClass("has-error");
                this.$el.find(".start-range" + error.minIndex).after("<span class='error'>" + error.minText + "</span>");
            }
            if (_.has(error, "maxText") === true) {
                this.$el.find(".stop-range" + error.maxIndex).parent().addClass("has-error");
                this.$el.find(".stop-range" + error.maxIndex).after("<span class='error'>" + error.maxText + "</span>");
            }
        }, this);
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

export default StyleWmsView;
