import DrawTemplate from "text-loader!./template.html";
import DownloadView from "../download/view";

const DrawToolView = Backbone.View.extend(/** @lends DrawToolView.prototype */{
    events: {
        "change .interaction": "setDrawType",
        "keyup .text input": "setText",
        "change .symbol select": "setSymbol",
        "change .pointSize select": "setPointSize",
        "change .font-size select": "setFontSize",
        "change .font select": "setFont",
        "change .radius select": "setRadius",
        "change .dropdownMethod": "setMethodCircle",
        "change .dropdownUnit": "setUnit",
        "keyup .circleRadiusInner input": "setCircleRadius",
        "keyup .circleRadiusOuter input": "setCircleRadiusOuter",
        "change .circleRadiusInner input": "setCircleRadius",
        "change .circleRadiusOuter input": "setCircleRadiusOuter",
        "change .stroke-width select": "setStrokeWidth",
        "change .opacity select": "setOpacity",
        "change .opacityContour select": "setOpacityContour",
        "change .color select": "setColor",
        "change .colorContour select": "setColorContour",
        "click .delete": "deleteFeatures",
        "click .draw": "toggleInteraction",
        "click .undo": "undoLastStep",
        "click .redo": "redoLastStep",
        "click .modify": "toggleInteraction",
        "click .trash": "toggleInteraction",
        "click .downloadDrawing": "startDownloadTool"
    },

    /**
     * @class DrawToolView
     * @extends Backbone.View
     * @memberof Tools.Draw
     * @constructs
     */
    initialize: function () {
        this.listenTo(this.model, {
            "change:isActive": this.render,
            "change:currentLng": function () {
                if (this.model.get("isActive") === true) {
                    this.renderAfterLngChanged(this.model, true);
                }
            }
        });

        new DownloadView();

        if (this.model.get("isActive") === true) {
            this.render(this.model, true);
        }
    },

    /**
     * @member DrawTemplate
     * @description Template used to create the draw tool.
     * @memberof Tools.Draw
     */
    template: _.template(DrawTemplate),

    /**
     * render the tool draw
     * @param {Backbone.model} model - draw model
     * @param {boolean} isActive - from tool
     * @return {Backbone.View} DrawView
     */
    render: function (model, isActive) {
        if (isActive && this.model.get("renderToWindow")) {
            this.renderSurface(model);
        }
        else if (isActive && !this.model.get("renderToWindow")) {
            return this;
        }
        else if (this.model.get("withoutGUI") === false) {
            this.removeSurface();
        }
        else {
            this.model.set("withoutGUI", false);
        }
        return this;
    },

    /**
     * render the tool draw after the language changed
     * @param {Backbone.model} model - draw model
     * @param {boolean} isActive - from tool
     * @return {Backbone.View} DrawView
     */
    renderAfterLngChanged: function (model, isActive) {
        if (isActive && this.model.get("renderToWindow")) {
            this.renderSurface(model, model.get("lastDrawTypeIndex"), true);
        }
        else {
            this.removeSurface();
        }
        return this;
    },

    /**
     * render this tool
     * @param {Backbone.model} model - draw model
     * @param {Number} lastDrawTypeIndex - index of the last select for drawtype
     * @param {boolean} afterLngChange - states if the render-function is called after a language change or not.
     * @return {void}
     */
    renderSurface: function (model, lastDrawTypeIndex, afterLngChange = false) {
        this.setElement(document.getElementsByClassName("win-body")[0]);
        this.$el.html(this.template(model.toJSON()));
        this.delegateEvents();
        this.renewSurface(lastDrawTypeIndex);
        if (afterLngChange === false) {
            this.registerListener();
        }
        this.model.toggleInteraction("draw");
    },

    /**
     * clears the tool when it is closed
     * @return {void}
     */
    removeSurface: function () {
        const layerSource = this.model.get("layer").getSource();

        this.model.resetModule();
        $("#map").removeClass("no-cursor");
        $("#map").removeClass("cursor-crosshair");
        $("#cursorGlyph").remove();
        $("#map").off("mousemove");
        this.unregisterListeners(layerSource);
        this.undelegateEvents();
    },

    /**
     * renews the surface of the drawtool
     * @param {Number} lastDrawTypeIndex - index of the last select for drawtype
     * @return {void}
     */
    renewSurface: function (lastDrawTypeIndex) {
        const element = this.$el.find(".interaction")[0];

        if (lastDrawTypeIndex) {
            // after lng changed set selectbox to selection before
            element.selectedIndex = lastDrawTypeIndex;
        }
        if (element) {
            switch (element.options[element.selectedIndex].id) {
                case "drawPoint": {
                    this.$el.find(
                        `.text,
                        .font-size,
                        .font,
                        .stroke-width,
                        .circleRadiusInner,
                        .circleRadiusOuter,
                        .dropdownUnit,
                        .dropdownMethod,
                        .colorContour,
                        .opacityContour,
                        .radius`
                    ).hide();
                    this.$el.find(
                        `.pointSize,
                        .symbol
                        .color,
                        .opacity`
                    ).show();
                    break;
                }
                case "writeText": {
                    this.$el.find(
                        `.radius,
                        .stroke-width,
                        .circleRadiusOuter,
                        .circleRadiusInner,
                        .dropdownUnit,
                        .dropdownMethod,
                        .colorContour,
                        .opacityContour,
                        .symbol`
                    ).hide();
                    this.$el.find(
                        `.text,
                        .font-size,
                        .font,
                        .color,
                        .opacity`
                    ).show();
                    break;
                }
                case "drawCircle": {
                    this.$el.find(
                        `.text,
                        .font-size,
                        .font,
                        .radius,
                        .circleRadiusOuter,
                        .opacityContour,
                        .symbol`
                    ).hide();
                    this.$el.find(
                        `.stroke-width,
                        .circleRadiusInner,
                        .dropdownUnit,
                        .dropdownMethod,
                        .color,
                        .colorContour,
                        .opacity`
                    ).show();
                    break;
                }
                case "drawDoubleCircle": {
                    this.$el.find(
                        `.text,
                        .font-size,
                        .font,
                        .radius,
                        .dropdownMethod,
                        .opacityContour,
                        .symbol`
                    ).hide();
                    this.$el.find(
                        `.stroke-width,
                        .circleRadiusInner,
                        .circleRadiusOuter,
                        .dropdownUnit,
                        .color,
                        .colorContour,
                        .opacity`
                    ).show();
                    break;
                }
                case "drawLine": {
                    this.$el.find(
                        `.text,
                        .font-size,
                        .font,
                        .radius,
                        .color,
                        .dropdownUnit,
                        .dropdownMethod,
                        .circleRadiusInner,
                        .circleRadiusOuter,
                        .opacity,
                        .symbol`
                    ).hide();
                    this.$el.find(
                        `.stroke-width,
                        .colorContour,
                        .opacityContour`
                    ).show();
                    break;
                }
                case "drawArea": {
                    this.$el.find(
                        `.text,
                        .font-size,
                        .font,
                        .radius,
                        .dropdownUnit,
                        .dropdownMethod,
                        .circleRadiusInner,
                        .circleRadiusOuter,
                        .opacityContour,
                        .symbol`
                    ).hide();
                    this.$el.find(
                        `.stroke-width,
                        .color,
                        .opacity,
                        .colorContour`
                    ).show();
                    break;
                }
                default: {
                    this.$el.find(
                        `.text,
                        .font-size,
                        .font,
                        .radius,
                        .circleRadiusInner,
                        .circleRadiusOuter,
                        .dropdownUnit,
                        .dropdownMethod,
                        .symbol`
                    ).hide();
                    this.$el.find(
                        `.stroke-width,
                        .colorContour,
                        .color`
                    ).show();
                    break;
                }
            }
            this.model.set("lastDrawTypeIndex", element.selectedIndex);
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
     * unregister the listeners from the map and from layerSource
     * @param {ol/source/vector} layerSource - vector LayerSource
     * @return {void}
     */
    unregisterListeners: function (layerSource) {
        Radio.trigger("Map", "unregisterListener", this.listener);
        layerSource.un("addfeature", this.model.get("addFeatureListener").listener);
    },

    /**
     * render the glyphicon on mouse
     * @param {event} evt - MapBrwoserPointerEvent
     * @return {void}
     */
    renderGlyphicon: function (evt) {
        const element = document.getElementById("cursorGlyph");

        $(element).css("left", evt.originalEvent.offsetX + 5);
        $(element).css("top", evt.originalEvent.offsetY + 50 - 15); // absolute offset plus height of menubar (50)
    },

    /**
     * set drawtype on model
     * @param {event} evt - with selectedElement
     * @return {void}
     */
    setDrawType: function (evt) {
        const element = evt.target,
            selectedElement = element.options[element.selectedIndex];

        if (selectedElement.text === this.model.get("drawDoubleCircle")) {
            this.model.enableMethodDefined(false);
        }
        if (selectedElement.text === this.model.get("drawCurve")) {
            this.model.setFreehand(true);
            this.model.setDrawType("LineString", selectedElement.text);
        }
        else {
            this.model.setFreehand(false);
            this.model.setDrawType(selectedElement.value, selectedElement.text);
        }
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
        this.$el.find(".draw").toggleClass("btn-lgv-grey");
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
        $(evt.target).toggleClass("btn-lgv-grey");
        this.model.toggleInteraction($(evt.target).attr("class"));
    },

    /**
     * deselects all buttons
     * @return {void}
     */
    unsetAllSelected: function () {
        this.$el.find(".btn-primary").each(function () {
            $(this).removeClass("btn-primary");
            $(this).addClass("btn-lgv-grey");
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
     * deletes the last added geometry from the layer
     * @return {void}
     */
    undoLastStep: function () {
        this.model.undoLastStep();
    },

    /**
     * restores the last deleted geometry
     * @return {void}
     */
    redoLastStep: function () {
        this.model.redoLastStep();
    },
    /**
     * Setter for the Symbol on the model.
     * @param {*} evt - With a new Symbol.
     * @return {void}
     */
    setSymbol: function (evt) {
        this.model.setSymbol(evt.target.value);
        this.model.updateDrawInteraction();
    },

    /**
     * Setter for the PointSize on the model.
     * @param {*} evt - With a new PointSize.
     * @return {void}
     */
    setPointSize: function (evt) {
        this.model.setPointSize(evt.target.value);
        this.model.updateDrawInteraction();
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
     * setter for the unit of the circle diameter
     * @param {event} evt - with new fontSize
     * @return {void}
     */
    setUnit: function (evt) {
        this.model.setUnit(evt.target.value);
        this.setCircleRadius();
        this.setCircleRadiusOuter();
    },

    /**
     * setter for new color on the model
     * and adds the opacity before
     * @param {event} evt - with new color
     * @return {void}
     */
    setColor: function (evt) {
        const colors = evt.target.value.split(","),
            newColor = [];

        colors.forEach(function (color) {
            newColor.push(parseInt(color, 10));
        });
        newColor.push(this.model.get("opacity"));
        this.model.setColor(newColor);
        this.model.updateDrawInteraction();
    },

    /**
     * setter for new strokecolor on the model
     * and adds the opacity before
     * @param {event} evt - with new color
     * @return {void}
     */
    setColorContour: function (evt) {
        const colors = evt.target.value.split(","),
            newColorContour = [];

        colors.forEach(function (color) {
            newColorContour.push(parseInt(color, 10));
        });
        newColorContour.push(this.model.get("opacityContour"));
        this.model.setColorContour(newColorContour);
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

    setMethodCircle: function (evt) {

        if (evt.target.value === "defined") {
            this.model.enableMethodDefined(false);
        }
        else if (evt.target.value === "interactiv") {
            this.model.enableMethodDefined(true);
        }
        this.model.setMethodCircle(evt.target.value);
    },

    /**
     * setter for radius on the model
     * @param {event} evt - with new radius
     * @return {void}
     */
    setCircleRadius: function () {
        this.model.setCircleRadius($(".circleRadiusInner input")[0].value);
    },

    /**
     * setter for radius on the model
     * @param {event} evt - with new radius
     * @return {void}
     */
    setCircleRadiusOuter: function () {
        this.model.setCircleRadiusOuter($(".circleRadiusOuter input")[0].value);
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
     * @param {event} evt - with new opacity
     * @return {void}
     */
    setOpacity: function (evt) {
        this.model.setOpacity(evt.target.value);
        this.model.updateDrawInteraction();
    },

    /**
     * setter for opacity of the stroke on the model
     * @param {event} evt - with new opacity
     * @return {void}
     */
    setOpacityContour: function (evt) {
        this.model.combineColorOpacityContour(evt.target.value);
        this.model.updateDrawInteraction();
    }
});

export default DrawToolView;
