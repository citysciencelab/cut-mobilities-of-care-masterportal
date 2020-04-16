import GetCoordTemplate from "text-loader!./template.html";

const GetCoord = Backbone.View.extend(/** @lends GetCoord.prototype */{
    events: {
        "click .glyphicon-remove": "destroy",
        "change #coordSystemField": "changedPosition",
        "click #coordinatesEastingField": "copyToClipboard",
        "click #coordinatesNorthingField": "copyToClipboard"
    },
    /**
     * @class GetCoord
     * @description Get Coordinates Tool
     * @extends Backbone.View
     * @memberof Tools.GetCoord
     * @constructs
     * @listens GetCoord#ChangeIsActive
     * @listens GetCoord#ChangeUrl
     * @listens GetCoord#ChangePositionMapProjection
     * @fires Util#RadioTriggerUtilCopyToClipboard
     */
    initialize: function () {
        this.listenTo(this.model, {
            "change:isActive change:url": this.render,
            "change:positionMapProjection": this.changedPosition,
            "change:currentLng": () => {
                this.renderToolBody();
            }
        });
        // To initially open this tool it needs to fire change:isActive event on parent model because other
        // tools need to be closed before - this happens by listening to change:isActive.
        if (this.model.get("isActive") === true) {
            this.model.set("isActive", false);
            this.model.set("isActive", true);
        }
    },
    template: _.template(GetCoordTemplate),

    /*
     * Function to initiate the rendering of the tool-body and to initiate a new interaction.
     * @param {object} model Model of GetCoord Tool view
     * @param {boolean} value Todo
     * @returns {view} This
     */
    render: function (model, value) {
        if (value) {
            this.model.createInteraction();
            this.renderToolBody();
            this.changedPosition();
            this.delegateEvents();
        }
        else {
            this.model.setUpdatePosition(true);
            this.model.removeInteraction();
            this.undelegateEvents();
        }
        return this;
    },

    /* Function to render the tool-body respectively the tool-window.
    * returns {void}
    */
    renderToolBody: function () {
        this.setElement(document.getElementsByClassName("win-body")[0]);
        this.$el.html(this.template(this.model.toJSON()));
    },

    /*
     * Delegates the calculation and transformation of the position according to the projection
     * @returns {void}
     */
    changedPosition: function () {
        var targetProjectionName = this.$("#coordSystemField option:selected").val(),
            position = this.model.returnTransformedPosition(targetProjectionName),
            targetProjection = this.model.returnProjectionByName(targetProjectionName);

        this.model.setCurrentProjectionName(targetProjectionName);
        if (position) {
            this.adjustPosition(position, targetProjection);
            this.adjustWindow(targetProjection);
        }
    },

    /*
     * Calculates the clicked position and writes the coordinate-values into the textfields.
     * @param {object} position Todo
     * @param {object} targetProjection Todo
     * @returns {void}
     */
    adjustPosition: function (position, targetProjection) {
        var coord, easting, northing;

        // geographische Koordinaten
        if (targetProjection.projName === "longlat") {
            coord = this.model.getHDMS(position);
            easting = coord.substr(0, 13);
            northing = coord.substr(14);
        }
        // kartesische Koordinaten
        else {
            coord = this.model.getCartesian(position);
            easting = coord.split(",")[0].trim();
            northing = coord.split(",")[1].trim();
        }

        this.$("#coordinatesEastingField").val(easting);
        this.$("#coordinatesNorthingField").val(northing);
    },

    /*
     * Function to translate the coordinate-terms.
     * @param {object} targetProjection Todo
     * @returns {void}
     */
    adjustWindow: function (targetProjection) {
        // geographische Koordinaten
        if (targetProjection.projName === "longlat") {
            // hint: this is turned around (easting <=> northing) just for labeling in hdms
            this.$("#coordinatesEastingLabel").text(i18next.t("common:modules.tools.getCoord.hdms.northingLabel"));
            this.$("#coordinatesNorthingLabel").text(i18next.t("common:modules.tools.getCoord.hdms.eastingLabel"));
        }
        // kartesische Koordinaten
        else {
            this.$("#coordinatesEastingLabel").text(i18next.t("common:modules.tools.getCoord.cartesian.eastingLabel"));
            this.$("#coordinatesNorthingLabel").text(i18next.t("common:modules.tools.getCoord.cartesian.northingLabel"));
        }
    },

    /*
     * Function to initiate the copying of the coordinates from the inputfields.
     * @fires Util#RadioTriggerUtilCopyToClipboard
     * @param {event} evt Click Event
     * @returns {void}
     */
    copyToClipboard: function (evt) {
        Radio.trigger("Util", "copyToClipboard", evt.currentTarget);
    }
});

export default GetCoord;
