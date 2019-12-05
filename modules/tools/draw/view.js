import DrawTemplate from "text-loader!./template.html";
import DownloadView from "../download/view";

const DrawToolView = Backbone.View.extend({
    events: {
        "change .interaction": "setDrawType",
        "keyup .text input": "setText",
        "change .font-size select": "setFontSize",
        "change .font select": "setFont",
        "change .radius select": "setRadius",
        "change .dropdownMethod": "setMethodCircle",
        "change .dropdownUnit": "setUnit",
        "keyup .circleRadiusInner input": "setCircleRadius",
        "keyup .circleRadiusOuter input": "setCircleRadiusOuter",
        "change .stroke-width select": "setStrokeWidth",
        "change .opacity select": "setOpacity",
        "change .opacityContour select": "setOpacityContour",
        "change .color select": "setColor",
        "change .colorContour select": "setColorContour",
        "click .delete": "deleteFeatures",
        "click .draw": "toggleInteraction",
        "click .modify": "toggleInteraction",
        "click .trash": "toggleInteraction",
        "click .downloadDrawing": "startDownloadTool"
    },

    /**
     * initialize the drawTool
     * that would be called by creates this tool
     * create an instance from download tool
     * @return {void}
     */
    initialize: function () {
        var downloadModel = Radio.request("ModelList", "getModelByAttributes", {id: "download"});

        this.listenTo(this.model, {
            "change:isActive": this.render
        });

        new DownloadView({model: downloadModel});
        // this.snippetDropdownViewUnit = new SnippetDropdownView({model: this.model.get("snippetDropdownModelUnit")});

        if (this.model.get("isActive") === true) {
            this.render(this.model, true);
        }
    },

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
            // this.$el.find(".dropdown_unit").append(this.snippetDropdownViewUnit.render().el);
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
        var layerSource = this.model.get("layer").getSource();

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
                this.$el.find(".circleRadiusInner").hide();
                this.$el.find(".circleRadiusOuter").hide();
                this.$el.find(".dropdownUnit").hide();
                this.$el.find(".dropdownMethod").hide();
                this.$el.find(".colorContour").hide();
                this.$el.find(".color").show();
                this.$el.find(".opacity").show();
                this.$el.find(".opacityContour").hide();
                break;
            }
            case "Text schreiben": {
                this.$el.find(".text").show();
                this.$el.find(".font-size").show();
                this.$el.find(".font").show();
                this.$el.find(".radius").hide();
                this.$el.find(".stroke-width").hide();
                this.$el.find(".circleRadiusOuter").hide();
                this.$el.find(".circleRadiusInner").hide();
                this.$el.find(".dropdownUnit").hide();
                this.$el.find(".dropdownMethod").hide();
                this.$el.find(".colorContour").hide();
                this.$el.find(".opacity").show();
                this.$el.find(".opacityContour").hide();
                break;
            }
            case "Kreis zeichnen": {
                this.$el.find(".text").hide();
                this.$el.find(".font-size").hide();
                this.$el.find(".font").hide();
                this.$el.find(".radius").hide();
                this.$el.find(".stroke-width").show();
                this.$el.find(".circleRadiusInner").show();
                this.$el.find(".circleRadiusOuter").hide();
                this.$el.find(".dropdownUnit").show();
                this.$el.find(".dropdownMethod").show();
                this.$el.find(".color").show();
                this.$el.find(".colorContour").show();
                this.$el.find(".opacity").show();
                this.$el.find(".opacityContour").show();
                break;
            }
            case "Doppelkreis zeichnen": {
                this.$el.find(".text").hide();
                this.$el.find(".font-size").hide();
                this.$el.find(".font").hide();
                this.$el.find(".radius").hide();
                this.$el.find(".dropdownMethod").hide();
                this.$el.find(".stroke-width").show();
                this.$el.find(".circleRadiusInner").show();
                this.$el.find(".circleRadiusOuter").show();
                this.$el.find(".dropdownUnit").show();
                this.$el.find(".color").show();
                this.$el.find(".colorContour").show();
                this.$el.find(".opacity").show();
                this.$el.find(".opacityContour").show();
                break;
            }
            case "Linie zeichnen": {
                this.$el.find(".text").hide();
                this.$el.find(".font-size").hide();
                this.$el.find(".font").hide();
                this.$el.find(".radius").hide();
                this.$el.find(".color").hide();
                this.$el.find(".dropdownUnit").hide();
                this.$el.find(".dropdownMethod").hide();
                this.$el.find(".circleRadiusInner").hide();
                this.$el.find(".circleRadiusOuter").hide();
                this.$el.find(".stroke-width").show();
                this.$el.find(".colorContour").show();
                this.$el.find(".opacityContour").show();
                this.$el.find(".opacity").hide();
                break;
            }
            case "Fläche zeichnen": {
                this.$el.find(".text").hide();
                this.$el.find(".font-size").hide();
                this.$el.find(".font").hide();
                this.$el.find(".radius").hide();
                this.$el.find(".dropdownUnit").hide();
                this.$el.find(".dropdownMethod").hide();
                this.$el.find(".circleRadiusInner").hide();
                this.$el.find(".circleRadiusOuter").hide();
                this.$el.find(".stroke-width").show();
                this.$el.find(".color").show();
                this.$el.find(".opacity").show();
                this.$el.find(".opacityContour").show();
                break;
            }
            default: {
                this.$el.find(".text").hide();
                this.$el.find(".font-size").hide();
                this.$el.find(".font").hide();
                this.$el.find(".radius").hide();
                this.$el.find(".circleRadiusInner").hide();
                this.$el.find(".circleRadiusOuter").hide();
                this.$el.find(".stroke-width").show();
                this.$el.find(".dropdownUnit").hide();
                this.$el.find(".dropdownMethod").hide();
                this.$el.find(".colorContour").show();
                this.$el.find(".color").show();
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

        if (selectedElement.text === "Doppelkreis zeichnen") {
            this.model.enableMethodDefiniert(false);
        }
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
     * setter for new strokecolor on the model
     * and adds the opacity before
     * @param {event} evt - with new color
     * @return {void}
     */
    setColorContour: function (evt) {
        var colors = evt.target.value.split(","),
            newColorContour = [];

        colors.forEach(function (color) {
            newColorContour.push(parseInt(color, 10));
        });
        newColorContour.push(this.model.get("opacity"));
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

        if (evt.target.value === "definiert") {
            this.model.enableMethodDefiniert(false);
        }
        else if (evt.target.value === "interaktiv") {
            this.model.enableMethodDefiniert(true);
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
    },

    /**
     * setter for opacity of the stroke on the model
     * @param {event} evt - with new opacity
     * @return {void}
     */
    setOpacityContour: function (evt) {
        this.model.setOpacityContour(evt.target.value);
    }
});

export default DrawToolView;
