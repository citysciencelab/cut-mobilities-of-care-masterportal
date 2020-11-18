import proj4 from "proj4";
import Tool from "../../core/modelList/tool/model";
import store from "../../../src/app-store";

const SearchByCoord = Tool.extend(/** @lends SearchByCoord.prototype */{
    defaults: Object.assign({}, Tool.prototype.defaults, {
        coordSystem: "ETRS89",
        coordSystems: ["ETRS89", "WGS84", "WGS84(Dezimalgrad)"],
        coordinatesEasting: "",
        coordinatesNorthing: "",
        renderToWindow: true,
        glyphicon: "glyphicon-record",
        // translations
        coordSystemField: "",
        hdmsEastingLabel: "",
        hdmsNorthingLabel: "",
        cartesianEastingLabel: "",
        cartesianNorthingLabel: "",
        exampleAcronym: "",
        searchButtonText: "",
        zoomLevel: 7
    }),

    /**
     * @class SearchByCoord
     * @extends Tool
     * @memberof Tools.searchByCoord
     * @property {String} coordSystem="ETRS89" todo
     * @property {Array} coordSystems= ["ETRS89", "WGS84", "WGS84(Dezimalgrad)"] todo
     * @property {String} coordinatesEasting="" todo
     * @property {String} coordinatesNorthing="" todo
     * @property {boolean} renderToWindow=true todo
     * @property {string} glyphicon="glyphicon-record" todo
     * @property {String} coordSystemField="", filled with "Koordinatensystem"- translated
     * @property {String} hdmsEastingLabel="", filled with "Länge"- translated
     * @property {String} hdmsNorthingLabel="", filled with "Breite"- translated
     * @property {String} cartesianEastingLabel="", filled with "Rechtswert"- translated
     * @property {String} cartesianNorthingLabel="", filled with "Hochwert"- translated
     * @property {String} exampleAcronym="", filled with "Bsp."- translated
     * @property {String} searchButtonText="", filled with "Suchen"- translated
     * @constructs
     * @listens i18next#RadioTriggerLanguageChanged
     */
    initialize: function () {
        this.superInitialize();

        this.listenTo(Radio.channel("i18next"), {
            "languageChanged": this.changeLang
        });
        this.changeLang();
    },

    /**
     * change language - sets default values for the language
     * @returns {Void} -
     */
    changeLang: function () {
        this.set({
            coordSystemField: i18next.t("common:modules.tools.supplyCoord.coordSystemField"),
            hdmsEastingLabel: i18next.t("common:modules.tools.supplyCoord.hdms.eastingLabel"),
            hdmsNorthingLabel: i18next.t("common:modules.tools.supplyCoord.hdms.northingLabel"),
            cartesianEastingLabel: i18next.t("common:modules.tools.supplyCoord.cartesian.eastingLabel"),
            cartesianNorthingLabel: i18next.t("common:modules.tools.supplyCoord.cartesian.northingLabel"),
            exampleAcronym: i18next.t("common:modules.tools.searchByCoord.exampleAcronym"),
            searchButtonText: i18next.t("common:button.search")
        });
    },

    validate: function (attributes) {
        const validETRS89 = /^[0-9]{6,7}[.,]{0,1}[0-9]{0,3}\s*$/,
            validWGS84 = /^\d[0-9]{0,2}[°]{0,1}\s*[0-9]{0,2}['`´]{0,1}\s*[0-9]{0,2}['`´]{0,2}["]{0,2}\s*$/,
            validWGS84_dez = /[0-9]{1,3}[.,]{0,1}[0-9]{0,5}[\s]{0,1}[°]{0,1}\s*$/;

        if (attributes.coordSystem === "ETRS89") {
            for (const [key, value] of Object.entries(attributes.coordinates)) {
                const fieldNames = ["#coordinatesEastingField", "#coordinatesNorthingField"],
                    fieldName = fieldNames[key];

                $(fieldName + " + .text-danger").html("");

                if (value.coord === undefined || value.coord.length < 1) {
                    value.ErrorMsg = i18next.t("common:modules.tools.searchByCoord.errorMsg.noCoord", {valueKey: value.key});

                    $(fieldName).after("<span class='text-danger'><small>" + value.ErrorMsg + "</small></span>");
                    $(fieldName).parent().addClass("has-error");
                }
                else if (!value.coord.match(validETRS89)) {
                    value.ErrorMsg = i18next.t("common:modules.tools.searchByCoord.errorMsg.noMatch", {valueKey: value.key, valueExample: value.example});

                    $(fieldName).after("<span class='text-danger'><small>" + value.ErrorMsg + "</small></span>");
                    $(fieldName).parent().addClass("has-error");
                }
                else {
                    $(fieldName).parent().removeClass("has-error");
                    Radio.trigger("Alert", "alert:remove");
                }
            }
        }
        else if (attributes.coordSystem === "WGS84") {
            if (attributes.coordinates[0].coord === undefined || attributes.coordinates[0].coord.length < 1) {
                attributes.coordinates[0].ErrorMsg = i18next.t("common:modules.tools.searchByCoord.errorMsg.noCoord", {valueKey: attributes.coordinates[0].key});
                $("#coordinatesEastingField + .text-danger").html("");
                $("#coordinatesEastingField").after("<span class='text-danger'><small>" + attributes.coordinates[0].ErrorMsg + "</small></span>");
                $("#coordinatesEastingField").parent().addClass("has-error");
            }
            else if (attributes.coordinates[0].coord.match(validWGS84) === null) {
                attributes.coordinates[0].ErrorMsg = i18next.t("common:modules.tools.searchByCoord.errorMsg.noMatch", {valueKey: attributes.coordinates[0].key, valueExample: attributes.coordinates[0].example});

                $("#coordinatesEastingField + .text-danger").html("");
                $("#coordinatesEastingField").after("<span class='text-danger'><small>" + attributes.coordinates[0].ErrorMsg + "</small></span>");
                $("#coordinatesEastingField").parent().addClass("has-error");
            }
            else {
                $("#coordinatesEastingField + .text-danger").html("");
                $("#coordinatesEastingField").parent().removeClass("has-error");
                Radio.trigger("Alert", "alert:remove");
            }

            if (attributes.coordinates[0].coord === undefined || attributes.coordinates[1].coord.length < 1) {
                attributes.coordinates[1].ErrorMsg = i18next.t("common:modules.tools.searchByCoord.errorMsg.noCoord", {valueKey: attributes.coordinates[1].key});
                $("#coordinatesNorthingField + .text-danger").html("");
                $("#coordinatesNorthingField").after("<span class='text-danger'><small>" + attributes.coordinates[1].ErrorMsg + "</small></span>");
                $("#coordinatesNorthingField").parent().addClass("has-error");
            }
            else if (attributes.coordinates[1].coord.match(validWGS84) === null) {
                attributes.coordinates[1].ErrorMsg = i18next.t("common:modules.tools.searchByCoord.errorMsg.noMatch", {valueKey: attributes.coordinates[1].key, valueExample: attributes.coordinates[1].example});

                $("#coordinatesNorthingField + .text-danger").html("");
                $("#coordinatesNorthingField").after("<span class='text-danger'><small>" + attributes.coordinates[1].ErrorMsg + "</small></span>");
                $("#coordinatesNorthingField").parent().addClass("has-error");
            }
            else {
                $("#coordinatesNorthingField + .text-danger").html("");
                $("#coordinatesNorthingField").parent().removeClass("has-error");
                Radio.trigger("Alert", "alert:remove");
            }
        }
        else if (attributes.coordSystem === "WGS84(Dezimalgrad)") {
            if (attributes.coordinates[0].coord === undefined || attributes.coordinates[0].coord.length < 1) {
                attributes.coordinates[0].ErrorMsg = i18next.t("common:modules.tools.searchByCoord.errorMsg.noCoord", {valueKey: attributes.coordinates[0].key});
                $("#coordinatesEastingField + .text-danger").html("");
                $("#coordinatesEastingField").after("<span class='text-danger'><small>" + attributes.coordinates[0].ErrorMsg + "</small></span>");
                $("#coordinatesEastingField").parent().addClass("has-error");
            }
            else if (attributes.coordinates[0].coord.match(validWGS84_dez) === null) {
                attributes.coordinates[0].ErrorMsg = i18next.t("common:modules.tools.searchByCoord.errorMsg.noMatch", {valueKey: attributes.coordinates[0].key, valueExample: attributes.coordinates[0].example});
                $("#coordinatesEastingField + .text-danger").html("");
                $("#coordinatesEastingField").after("<span class='text-danger'><small>" + attributes.coordinates[0].ErrorMsg + "</small></span>");
                $("#coordinatesEastingField").parent().addClass("has-error");
            }
            else {
                $("#coordinatesEastingField + .text-danger").html("");
                $("#coordinatesEastingField").parent().removeClass("has-error");
                Radio.trigger("Alert", "alert:remove");
            }
            if (attributes.coordinates[0].coord === undefined || attributes.coordinates[1].coord.length < 1) {
                attributes.coordinates[1].ErrorMsg = i18next.t("common:modules.tools.searchByCoord.errorMsg.noCoord", {valueKey: attributes.coordinates[1].key});
                $("#coordinatesNorthingField + .text-danger").html("");
                $("#coordinatesNorthingField").after("<span class='text-danger'><small>" + attributes.coordinates[1].ErrorMsg + "</small></span>");
                $("#coordinatesNorthingField").parent().addClass("has-error");
            }
            else if (attributes.coordinates[1].coord.match(validWGS84_dez) === null) {
                attributes.coordinates[1].ErrorMsg = i18next.t("common:modules.tools.searchByCoord.errorMsg.noMatch", {valueKey: attributes.coordinates[1].key, valueExample: attributes.coordinates[1].example});
                $("#coordinatesNorthingField + .text-danger").html("");
                $("#coordinatesNorthingField").after("<span class='text-danger'><small>" + attributes.coordinates[1].ErrorMsg + "</small></span>");
                $("#coordinatesNorthingField").parent().addClass("has-error");
            }
            else {
                $("#coordinatesNorthingField + .text-danger").html("");
                $("#coordinatesNorthingField").parent().removeClass("has-error");
                Radio.trigger("Alert", "alert:remove");
            }
        }
        if (attributes.coordinates[0].ErrorMsg || attributes.coordinates[1].ErrorMsg) {
            return true;
        }
        return false;
    },
    setCoordSystem: function (value) {
        this.set("coordSystem", value);
    },
    setCoordinates: function (easting, northing) {
        let coordinateArray = [];

        if (this.get("coordSystem") === "WGS84") {

            this.set("eastingCoords", easting.split(/[\s°′″'"´`]+/));
            this.set("northingCoords", northing.split(/[\s°′″'"´`]+/));
            coordinateArray = [{"coord": easting, "key": i18next.t("common:modules.tools.searchByCoord.hdmsEastingText"), "example": "9° 59′ 50″"}, {"coord": northing, "key": i18next.t("common:modules.tools.searchByCoord.hdmsNorthingText"), "example": "53° 33′ 25″"}];
        }
        else if (this.get("coordSystem") === "WGS84(Dezimalgrad)") {

            this.set("eastingCoords", easting.split(/[\s°]+/));
            this.set("northingCoords", northing.split(/[\s°]+/));
            coordinateArray = [{"coord": easting, "key": i18next.t("common:modules.tools.searchByCoord.hdmsEastingText"), "example": "10.01234°"}, {"coord": northing, "key": i18next.t("common:modules.tools.searchByCoord.hdmsNorthingText"), "example": "53.55555°"}];
        }
        else {
            coordinateArray = [{"coord": easting, "key": i18next.t("common:modules.tools.supplyCoord.cartesian.eastingLabel"), "example": "564459.13"}, {"coord": northing, "key": i18next.t("common:modules.tools.supplyCoord.cartesian.northingLabel"), "example": "5935103.67"}];
        }
        this.setCoordinatesEasting(easting);
        this.setCoordinatesNorthing(northing);
        this.set("coordinates", coordinateArray);
        this.validateCoordinates();
    },
    validateCoordinates: function () {
        if (this.isValid()) {
            this.getNewCenter();
        }
    },
    getNewCenter: function () {
        let easting,
            northing;

        if (this.get("coordSystem") === "WGS84") {
            easting = Number(this.get("eastingCoords")[0]) +
                (Number(this.get("eastingCoords")[1] ? this.get("eastingCoords")[1] : 0) / 60) +
                (Number(this.get("eastingCoords")[2] ? this.get("eastingCoords")[2] : 0) / 60 / 60);
            northing = Number(this.get("northingCoords")[0]) +
            (Number(this.get("northingCoords")[1] ? this.get("northingCoords")[1] : 0) / 60) +
            (Number(this.get("northingCoords")[2] ? this.get("northingCoords")[2] : 0) / 60 / 60);

            this.set("newCenter", proj4(proj4("EPSG:4326"), proj4("EPSG:25832"), [easting, northing]));
        }
        else if (this.get("coordSystem") === "WGS84(Dezimalgrad)") {
            easting = parseFloat(this.get("eastingCoords")[0]);
            northing = parseFloat(this.get("northingCoords")[0]);

            this.set("newCenter", proj4(proj4("EPSG:4326"), proj4("EPSG:25832"), [easting, northing]));
        }
        else if (this.get("coordSystem") === "ETRS89") {
            easting = parseFloat(this.get("coordinates")[0].coord);
            northing = parseFloat(this.get("coordinates")[1].coord);

            this.set("newCenter", [easting, northing]);
        }
        store.dispatch("MapMarker/placingPointMarker", this.get("newCenter"));
        Radio.trigger("MapView", "setCenter", this.get("newCenter"), this.get("zoomLevel"));
    },
    // setter for coordinatesEasting
    setCoordinatesEasting: function (value) {
        this.set("coordinatesEasting", value);
    },
    // setter for coordinatesNorthing
    setCoordinatesNorthing: function (value) {
        this.set("coordinatesNorthing", value);
    }
});

export default SearchByCoord;
