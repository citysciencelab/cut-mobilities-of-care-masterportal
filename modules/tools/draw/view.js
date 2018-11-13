/**
 * Module for drawing different geometries and text
 * @exports module:lgv.lgv/modules/tools/draw/view
 * @module lgv/modules/tools/draw/view
 */
import DrawTemplate from "text-loader!./template.html";
import DownloadView from "../download/view";
import DownloadModel from "../download/model";

const DrawToolView = Backbone.View.extend({
    /**
     * @class DrawTool
     * @name module:lgv.lgv/modules/tools/draw/view
     * @constructor
     * @augments Backbone.Model
     */
    events: {
        "change .interaction": "setDrawType",
        "keyup .text input": "setText",
        "change .font-size select": "setFontSize",
        "change .font select": "setFont",
        "change .radius select": "setRadius",
        "change .stroke-width select": "setStrokeWidth",
        "change .opacity select": "setOpacity",
        "change .color select": "setColor",
        "click .delete": "deleteFeatures",
        "click .draw": "toggleInteraction",
        "click .modify": "toggleInteraction",
        "click .trash": "toggleInteraction",
        "click .downloadDrawing": "startDownloadTool"
    },

    /**
     * initialize the drawTool
     * that would be called by creates this tool
     * craete an instance from download tool
     * @return {void}
     */
    initialize: function () {
        this.listenTo(this.model, {
            "change:isActive": this.render
        });

        this.model.setDownloadView(new DownloadView({model: new DownloadModel()}));

        // Bestätige, dass das Modul geladen wurde
        Radio.trigger("Autostart", "initializedModul", this.model.get("id"));
    },

    template: _.template(DrawTemplate),

    /**
     * render the tool draw
     * @param {Backbone.model} model - draw model
     * @param {boolean} isActive - from tool
     * @return {Backbone.View} DrawView
     */
    render: function (model, isActive) {
        if (isActive) {
            this.renderSurface(model);
        }
        else {
            this.removeSurface();
        }
        return this;
    },

    /**
     * render this tool
     * @param {Backbone.model} model - draw model
     * @return {void}
     */
    renderSurface: function (model) {
        this.setElement(document.getElementsByClassName("win-body")[0]);
        this.$el.html(this.template(model.toJSON()));
        this.delegateEvents();
        this.renewSurface();
        this.registerListener();
        this.model.toggleInteraction("draw");
    },

    /**
     * clears the tool when it is closed
     * @return {void}
     */
    removeSurface: function () {
        this.model.resetModule();
        $("#map").removeClass("no-cursor");
        $("#map").removeClass("cursor-crosshair");
        $("#cursorGlyph").remove();
        $("#map").off("mousemove");
        this.unregisterListener();
        this.undelegateEvents();
    },

    /**
     * renews the surface of the drawtool
     * @return {void}
     */
    renewSurface: function () {
        var element = this.$el.find(".interaction")[0];

        switch (element.options[element.selectedIndex].text) {
            case "Punkt zeichnen": {
                this.$el.find(".text").hide();
                this.$el.find(".font-size").hide();
                this.$el.find(".font").hide();
                this.$el.find(".radius").show();
                this.$el.find(".stroke-width").hide();
                break;
            }
            case "Text schreiben": {
                this.$el.find(".text").show();
                this.$el.find(".font-size").show();
                this.$el.find(".font").show();
                this.$el.find(".radius").hide();
                this.$el.find(".stroke-width").hide();
                break;
            }
            default: {
                this.$el.find(".text").hide();
                this.$el.find(".font-size").hide();
                this.$el.find(".font").hide();
                this.$el.find(".radius").hide();
                this.$el.find(".stroke-width").show();
                break;
            }
        }
    },

    /**
     * register the listeners on the map
     * @return {void}
     */
    registerListener: function () {
        $("#map").after("<span id='cursorGlyph' class='glyphicon glyphicon-pencil'></span>");
        this.listener = Radio.request("Map", "registerListener", "pointermove", this.renderGlyphicon.bind(this));
    },

    /**
     * unregister the listeners from the map
     * @return {void}
     */
    unregisterListener: function () {
        Radio.trigger("Map", "unregisterListener", this.listener);
    },

    /**
     * render the glyphicon on mouse
     * @param {event} evt - MapBrwoserPointerEvent
     * @return {void}
     */
    renderGlyphicon: function (evt) {
        var element = document.getElementById("cursorGlyph");

        $(element).css("left", evt.originalEvent.offsetX + 5);
        $(element).css("top", evt.originalEvent.offsetY + 50 - 15); // absolute offset plus height of menubar (50)
    },

    /**
     * set drawtype on model
     * @param {event} evt - with selectedElement
     * @return {void}
     */
    setDrawType: function (evt) {
        var element = evt.target,
            selectedElement = element.options[element.selectedIndex];

        this.model.setDrawType(selectedElement.value, selectedElement.text);
        this.model.updateDrawInteraction();
        this.renewSurface();
        this.startDrawInteraction();
    },

    /**
     * starts the interaction with a new drawing and the map
     * @returns {void}
     */
    startDrawInteraction: function () {
        this.unsetAllSelected();
        this.$el.find(".draw").toggleClass("btn-primary");
        this.model.toggleInteraction("draw");
    },

    /**
     * toggle the various interactions by event
     * @param {event} evt - with the interactions
     * @return {void}
     */
    toggleInteraction: function (evt) {
        this.unsetAllSelected();
        $(evt.target).toggleClass("btn-primary");
        this.model.toggleInteraction($(evt.target).attr("class"));
    },

    /**
     * deselects all buttons
     * @return {void}
     */
    unsetAllSelected: function () {
        this.$el.find(".btn-primary").each(function () {
            $(this).removeClass("btn-primary");
        });
    },

    /**
     * deletes all geometries from the layer
     * @return {void}
     */
    deleteFeatures: function () {
        this.model.deleteFeatures();
    },

    /**
     * starts the download of the drawn features
     * @return {void}
     */
    startDownloadTool: function () {
        this.model.startDownloadTool();
    },

    /**
     * setter for font on the model
     * @param {event} evt - with new font
     * @return {void}
     */
    setFont: function (evt) {
        this.model.setFont(evt.target.value);
        this.model.updateDrawInteraction();
    },

    /**
     * setter for text on the model
     * @param {event} evt - with new text
     * @return {void}
     */
    setText: function (evt) {
        this.model.setText(evt.target.value);
        this.model.updateDrawInteraction();
    },

    /**
     * setter for fontSize on the model
     * @param {event} evt - with new fontSize
     * @return {void}
     */
    setFontSize: function (evt) {
        this.model.setFontSize(evt.target.value);
        this.model.updateDrawInteraction();
    },

    /**
     * setter for new color on the model
     * and adds the opacity before
     * @param {event} evt - with new color
     * @return {void}
     */
    setColor: function (evt) {
        var colors = evt.target.value.split(","),
            newColor = [];

        colors.forEach(function (color) {
            newColor.push(parseInt(color, 10));
        });
        newColor.push(this.model.get("opacity"));
        this.model.setColor(newColor);
        this.model.updateDrawInteraction();
    },

    /**
     * setter for radius on the model
     * @param {event} evt - with new radius
     * @return {void}
     */
    setRadius: function (evt) {
        this.model.setRadius(evt.target.value);
        this.model.updateDrawInteraction();
    },

    /**
     * setter for strokeWidth on the model
     * @param {event} evt - with new strokeWidth
     * @return {void}
     */
    setStrokeWidth: function (evt) {
        this.model.setStrokeWidth(evt.target.value);
        this.model.updateDrawInteraction();
    },

    /**
     * setter for opacity on the model
     * and also sets the color new on the model
     * @param {event} evt - with new opacity
     * @return {void}
     */
    setOpacity: function (evt) {
        var newColor = this.model.get("color");

        newColor[3] = parseFloat(evt.target.value);
        this.model.setColor(newColor);
        this.model.setOpacity(parseFloat(evt.target.value));
        this.model.updateDrawInteraction();
    }
});

export default DrawToolView;
