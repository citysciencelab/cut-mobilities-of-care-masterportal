import ButtonObliqueTemplate from "text-loader!./template.html";
/**
 * @member ButtonObliqueTemplate
 * @description Template used for the "Schräglüftbilder" button
 * @memberof ButtonOblique
 */

const ButtonObliqueView = Backbone.View.extend(/** @lends ButtonObliqueView.prototype */{
    events: {
        "click .buttonOblique": "mapChange"
    },
    /**
     * @class ButtonObliqueView
     * @extends Backbone.View
     * @memberOf Controls.ButtonOblique
     * @constructs
     * @description This control shows a user an oblique aerial picture
     * @fires ObliqueMap#RadioRequestObliqueMapIsActive
     * @fires ObliqueMap#RadioTriggerObliqueMapDeactivate
     * @fires Alerting#RadioTriggerAlertAlertRemove
     * @fires Map#RadioRequestMapIsMap3d
     * @fires Map#RadioTriggerMapDeactivateMap3d
     * @fires ObliqueMap#RadioTriggerObliqueMapActivate
     * @fires Alerting#RadioTriggerAlertAlert
     * @listens Map#RadioOnceMapChange
     */
    initialize: function () {
        var channel = Radio.channel("Map");

        channel.on({
            "change": this.change
        }, this);

        this.template = _.template(ButtonObliqueTemplate);
        this.render();
    },
    /**
     * Shows the "Schrägluftbilder" button as selected.
     * Shows the "Schrägluftbilder" button as not selected.
     * @param  {string} map Mode of the map
     * @returns {void}
     */
    change: function (map) {
        if (map === "Oblique") {
            this.$("#buttonOblique").addClass("toggleButtonPressed");
        }
        else {
            this.$("#buttonOblique").removeClass("toggleButtonPressed");
        }
    },
    /**
     * Render Function
     * @fires ObliqueMap#RadioRequestObliqueMapIsActive
     * @returns {ButtonObliqueView} - Returns itself
     */
    render: function () {
        this.$el.html(this.template);
        if (Radio.request("ObliqueMap", "isActive")) {
            this.change("Oblique");
        }

        return this;
    },
    /**
     * Shows the oblique aerial picture if the "Schräglüftbilder" button is activated.
     * Shows the map if the "Schräglüftbilder" button is deactivated.
     * @fires ObliqueMap#RadioRequestObliqueMapIsActive
     * @fires ObliqueMap#RadioTriggerObliqueMapDeactivate
     * @fires Alerting#RadioTriggerAlertAlertRemove
     * @fires Map#RadioRequestMapIsMap3d
     * @fires Map#RadioTriggerMapDeactivateMap3d
     * @fires ObliqueMap#RadioTriggerObliqueMapActivate
     * @fires Alerting#RadioTriggerAlertAlert
     * @listens Map#RadioOnceMapChange
     * @returns {void}
     */
    mapChange: function () {
        if (Radio.request("ObliqueMap", "isActive")) {
            Radio.trigger("ObliqueMap", "deactivate");
            Radio.trigger("Alert", "alert:remove");
        }
        else {
            if (Radio.request("Map", "isMap3d")) {
                Radio.once("Map", "change", function (map) {
                    if (map === "2D") {
                        this.mapChange();
                    }
                }.bind(this));
                Radio.trigger("Map", "deactivateMap3d");
                return;
            }
            Radio.trigger("ObliqueMap", "activate");
            Radio.trigger("Alert", "alert", "Der Schrägluftbild-Modus befindet sich zur Zeit noch in der Beta-Version!");
        }

    }
});

export default ButtonObliqueView;
