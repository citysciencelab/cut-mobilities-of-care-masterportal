import Tool from "../../core/modelList/tool/model";
import SnippetSliderModel from "../../snippets/slider/model";
import SnippetCheckboxModel from "../../snippets/checkbox/model";
import SnippetDatepickerModel from "../../snippets/datepicker/model";
import moment from "moment";

const ShadowModel = Tool.extend(/** @lends ShadowModel.prototype */{
    /**
     * @class ShadowModel
     * @extends Tool
     * @memberof Tools.Shadow
     * @property {String} glyphicon="glyphicon-screenshot" Glyphicon that is shown before the tool name
     * @constructs
     * @listens Map#RadioTriggerMapChange
     * @fires Map#RadioTriggerSetShadowTime
     * @fires Map#RadioRequestIsMap3d
     * @fires Map#RadioRequestGetMap3d
     */
    defaults: _.extend({}, Tool.prototype.defaults, {
        glyphicon: "glyphicon-screenshot",
        timeslider: null,
        dateslider: null,
        toggleButton: null,
        datepicker: null,
        isMap3d: false, // gets checked on initialize
        isShadowEnabled: false // gets checked on initialize
    }),

    /**
     * Loads default values and external tools
     * @returns {void}
     */
    initialize: function () {
        this.superInitialize();
        const minMaxTimes = this.getMinMaxTimesOfCurrentDay(),
            nearestTime = this.getNearestTime(),
            timesliderStep = 1000 * 60 * 30,
            timeslider = this.getNewSlider(minMaxTimes, nearestTime, timesliderStep, 1, "Uhrzeit", "time"),
            minMaxDays = this.getMinMaxDatesOfCurrentYear(),
            nearestDay = this.getToday(),
            datesliderStep = 1000 * 60 * 60 * 24,
            dateslider = this.getNewSlider(minMaxDays, nearestDay, datesliderStep, 1, "Datum", "date"),
            isMap3d = this.checkIsMap3d(),
            isShadowEnabled = this.checkIsShadowEnabled(),
            button = this.getNewButton("Schattendarstellung", isShadowEnabled),
            datepicker = this.getNewDatepicker(nearestDay, minMaxDays[0], minMaxDays[1], "Datum", "datepicker");

        this.setToggleButton(button);
        this.setTimeslider(timeslider);
        this.setDateslider(dateslider);
        this.setDatepicker(datepicker);
        this.setIsMap3d(isMap3d);
        this.setIsShadowEnabled(isShadowEnabled);
        this.registerListener();
        this.timeOrDateChanged();
    },

    /**
     * Register Listener to act on
     * @returns {void}
     * @listens Map#RadioTriggerMapChange
     */
    registerListener: function () {
        this.listenTo(this.get("toggleButton"), {
            "valuesChanged": this.toggleButtonValueChanged
        });
        this.listenTo(this.get("timeslider"), {
            "valuesChanged": this.timeOrDateChanged
        });
        this.listenTo(this.get("dateslider"), {
            "valuesChanged": this.sychronizePicker
        });
        this.listenTo(this.get("datepicker"), {
            "valuesChanged": this.sychronizeSlider
        });
        this.listenTo(this, {
            "change:isShadowEnabled": this.switchShadowEnabledButton
        });
        Radio.on("Map", "change", function (map) {
            if (map === "2D") {
                this.setIsMap3d(false);
                this.setIsShadowEnabled(false);
            }
            else {
                this.setIsMap3d(true);
                this.setIsShadowEnabled(this.checkIsShadowEnabled());
            }
        }.bind(this));
    },

    /**
     * Combines the given timestamps for time and date together
     * @param   {timestamp} time timestamp with time
     * @param   {timestamp} date timestamd with date
     * @returns {timestamp} timestamp the combined timestamp
     */
    combineTimeAndDate: function (time, date) {
        return moment(date).hour(moment(time).get("hour")).minute(moment(time).get("minute")).second(moment(time).get("second")).valueOf();
    },

    /**
     * Gets called when or the time or the date changes and starts processing to set the new value
     * @returns {void}
     */
    timeOrDateChanged: function () {
        const time = this.get("timeslider").getSelectedValues().values[0],
            date = this.get("dateslider").getSelectedValues().values[0],
            timedate = this.combineTimeAndDate(time, date);

        this.setCesiumTime(timedate);
    },

    /**
     * Gets called when the datepicker has changed and synchronizes the slider with the same values
     * @returns {void}
     */
    sychronizeSlider: function () {
        const date = this.get("datepicker").getSelectedValues().values[0];

        this.get("dateslider").updateValuesSilently(moment(date).valueOf());
        this.timeOrDateChanged();

    },

    /**
     * Gets called when the slider has changed and synchronizes the datepicker with the same values
     * @returns {void}
     */
    sychronizePicker: function () {
        const date = this.get("dateslider").getSelectedValues().values[0];

        this.get("datepicker").updateValuesSilently(moment(date).toDate());
        this.timeOrDateChanged();
    },

    /**
     * Trigger new date to map3D
     * @param {timestamp} datetime new Time
     * @fires Map#RadioTriggerSetShadowTime
     * @returns {void}
     */
    setCesiumTime: function (datetime) {
        let julianDate;

        if (typeof Cesium !== "undefined") {
            julianDate = Cesium.JulianDate.fromDate(moment(datetime).toDate());
            Radio.trigger("Map", "setShadowTime", julianDate);
        }
    },

    /**
     * Checks if shadow is enabled or not using cesiumScene
     * @returns {boolean} enabled shadow is enabled
     */
    checkIsShadowEnabled: function () {
        const scene = this.getCesiumScene();

        if (scene) {
            return scene.shadowMap.enabled;
        }
        return false;
    },

    /**
     * Checks if the map is in 3d-mode
     * @fires Map#RadioRequestIsMap3d
     * @returns {boolean} is3D Value is map in 3d
     */
    checkIsMap3d: function () {
        if (Radio.request("Map", "isMap3d") === true) {
            return true;
        }
        return false;
    },

    /**
     * Proceduere what has to be done when the toggleButton gets pressed
     * @param   {boolean} chkbox state of the checkbox
     * @returns {void}
     */
    toggleButtonValueChanged: function (chkbox) {
        let value = chkbox;

        if (this.get("isMap3d") === false) {
            value = false;
            this.switchShadowEnabledButton(false);
            this.trigger("shadowUnavailable", false);
        }
        this.toggleShadow(value);
        this.trigger("toggleButtonValueChanged", value);
    },

    /**
     * Checks or unchecks the checkbox using it's API
     * @returns {void}
     */
    switchShadowEnabledButton: function () {
        const isShadowEnabled = this.get("isShadowEnabled"),
            button = this.get("toggleButton");

        button.setIsSelected(isShadowEnabled);
    },

    /**
     * Returns an array of min. and max. timestamps of actual year
     * @returns {timestamp[]} timestamp Array of timestamps
     */
    getMinMaxDatesOfCurrentYear: function () {
        return [moment().startOf("year").valueOf(), moment().endOf("year").valueOf()];
    },

    /**
     * Returns an array of min. and max. timestamps of today
     * @returns {timestamp[]} timestamp Array of timestamps
     */
    getMinMaxTimesOfCurrentDay: function () {
        return [moment().startOf("day").valueOf(), moment().endOf("day").valueOf()];
    },

    /**
     * Returns the nearest past full half hour from now
     * @returns {timestamp} timestamp
     */
    getNearestTime: function () {
        const minutes = moment().minutes(),
            setminutes = minutes < 30 ? 0 : 30;

        return moment().minutes(setminutes).seconds(0).millisecond(0).valueOf();
    },

    /**
     * Returns the start of today
     * @returns {timestamp} timestamp
     */
    getToday: function () {
        return moment().startOf("day").valueOf();
    },

    /**
     * Returns the cesiumScene if defined
     * @fires Map#RadioRequestGetMap3d
     * @returns {object | undefined} cesiumScene cesiumScene of map3D
     */
    getCesiumScene: function () {
        const isMap3d = this.get("isMap3d");
        let map3D;

        if (isMap3d) {
            map3D = Radio.request("Map", "getMap3d");

            return map3D.getCesiumScene();
        }

        return undefined;
    },

    /**
     * Toggles the shadows
     * @param {boolean} chkboxValue Value of the checkbox
     * @returns {void}
     */
    toggleShadow: function (chkboxValue) {
        const scene = this.getCesiumScene();

        if (scene) {
            if (!scene.sun) {
                scene.sun = new Cesium.Sun();
            }
            scene.globe.shadows = Cesium.ShadowMode.RECEIVE_ONLY;
            scene.globe.enableLighting = chkboxValue;
            scene.shadowMap.enabled = chkboxValue;
        }
    },

    /**
     * Creator for Datepicker
     * @param {Date} preselectedValue preselected date
     * @param {Date} startDate earliest selectable date
     * @param {Date} endDate latest selectable date
     * @param {string} displayName The name to be displayed near to the datepicker.
     * @param {string} type The slider type
     * @returns {object} SnippetSliderModel Slider-Object
     */
    getNewDatepicker: function (preselectedValue, startDate, endDate, displayName, type) {
        return new SnippetDatepickerModel({
            displayName: displayName,
            preselectedValue: moment(preselectedValue).toDate(),
            startDate: moment(startDate).toDate(),
            endDate: moment(endDate).toDate(),
            type: type
        });
    },

    /**
     * Creator for Sliders
     * @param {integer[]} values Array of min and max times
     * @param {integer} preselectedValue preselcted value in slider
     * @param {float} step Increment step
     * @param {float} precision The number of digits shown after the decimal.
     * @param {string} displayName The name to be displayed near to the slider.
     * @param {string} type The slider type
     * @returns {object} SnippetSliderModel Slider-Object
     */
    getNewSlider: function (values, preselectedValue, step, precision, displayName, type) {
        return new SnippetSliderModel({
            displayName: displayName,
            preselectedValues: preselectedValue,
            type: type,
            step: step,
            precision: precision,
            editableValueBox: false,
            values: values
        });
    },

    /**
     * Creator for Checkboxes
     * @param {string} label The label to show next to the checkbox
     * @param {boolean} isSelected Set default state
     * @returns {object} SnippetCheckboxModel Checkbox-Object
     */
    getNewButton: function (label, isSelected) {
        return new SnippetCheckboxModel({
            isSelected: isSelected,
            label: label
        });
    },

    /**
     * Setter for dates
     * @param {date[]} value Array of date objects
     * @returns {void}
     */
    setDates: function (value) {
        this.set("dates", value);
    },

    /**
     * Setter for timeslider
     * @param {object} value timeslider
     * @returns {void}
     */
    setTimeslider: function (value) {
        this.set("timeslider", value);
    },

    /**
     * Setter for dateslider
     * @param {object} value dateslider
     * @returns {void}
     */
    setDateslider: function (value) {
        this.set("dateslider", value);
    },

    /**
     * Setter for datepicker
     * @param {object} value datepicker
     * @returns {void}
     */
    setDatepicker: function (value) {
        this.set("datepicker", value);
    },

    /**
     * Setter for toggleButton
     * @param {object} value toggleButton
     * @returns {void}
     */
    setToggleButton: function (value) {
        this.set("toggleButton", value);
    },

    /**
     * Setter for isShadowEnabled
     * @param {boolean} value isShadowEnabled
     * @returns {void}
     */
    setIsShadowEnabled: function (value) {
        this.set("isShadowEnabled", value);
    },

    /**
     * Setter for isMap3d
     * @param {boolean} value isMap3d
     * @returns {void}
     */
    setIsMap3d: function (value) {
        this.set("isMap3d", value);
    }
});

export default ShadowModel;
