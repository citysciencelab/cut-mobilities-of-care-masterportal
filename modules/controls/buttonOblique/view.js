import ButtonObliqueTemplate from "text-loader!./template.html";
/**
 * @member ButtonObliqueTemplate
 * @description Template used for the "Schräglüftbilder" button
 * @memberof Controls.ButtonOblique
 */

const ButtonObliqueView = Backbone.View.extend(/** @lends ButtonObliqueView.prototype */{
    events: {
        "click .buttonOblique": "mapChange",
        "click div#ObliqueTable": "mapChange"
    },
    /**
     * @class ButtonObliqueView
     * @extends Backbone.View
     * @memberof Controls.ButtonOblique
     * @constructs
     * @description This control shows a user an oblique aerial picture
     * @fires ObliqueMap#RadioRequestObliqueMapIsActive
     * @fires ObliqueMap#RadioTriggerObliqueMapDeactivate
     * @fires Alerting#RadioTriggerAlertAlertRemove
     * @fires Core#RadioRequestMapIsMap3d
     * @fires Core#RadioTriggerMapDeactivateMap3d
     * @fires ObliqueMap#RadioTriggerObliqueMapActivate
     * @fires Alerting#RadioTriggerAlertAlert
     * @listens Core#RadioTriggerMapChange
     */
    initialize: function () {
        var channel = Radio.channel("Map"),
            style = Radio.request("Util", "getUiStyle");

        channel.on({
            "change": this.change
        }, this);
        if (style === "DEFAULT") {
            this.template = _.template(ButtonObliqueTemplate);
            this.render();
        }
        else if (style === "TABLE") {
            this.listenTo(Radio.channel("MenuLoader"), {
                "ready": function () {
                    this.setElement("#table-tools-menu");
                    this.renderToToolbar();
                }
            });
            this.setElement("#table-tools-menu");
            this.renderToToolbar();
        }
    },
    /**
     * @member ButtonObliqueTemplate
     * @description tableTemplate used for the ObliqueMap in Table View Tools
     * @memberof Controls.ButtonOblique
     */
    tabletemplate: _.template("<div id='ObliqueTable' class='table-tool'><a href='#'><span class='glyphicon glyphicon-picture'></span><span id='ObliqueTable_title'><%=ansicht %></span></a> </div>"),
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
     * Render Function
     * @fires Core#RadioRequestObliqueMapIsActive
     * @returns {ButtonObliqueView} - Returns itself
     */
    renderToToolbar: function () {
        this.$el.append(this.tabletemplate({ansicht: "Schrägluftbilder einschalten"}));
        if (Radio.request("ObliqueMap", "isActive")) {
            this.$("#ObliqueTable").addClass("toggleButtonPressed");
        }
        return this;
    },
    /**
     * Shows the oblique aerial picture if the "Schräglüftbilder" button is activated.
     * Shows the map if the "Schräglüftbilder" button is deactivated.
     * @fires ObliqueMap#RadioRequestObliqueMapIsActive
     * @fires ObliqueMap#RadioTriggerObliqueMapDeactivate
     * @fires Alerting#RadioTriggerAlertAlertRemove
     * @fires Core#RadioRequestMapIsMap3d
     * @fires Core#RadioTriggerMapDeactivateMap3d
     * @fires ObliqueMap#RadioTriggerObliqueMapActivate
     * @fires Alerting#RadioTriggerAlertAlert
     * @listens Core#RadioTriggerMapChange
     * @returns {void}
     */
    mapChange: function () {
        if (Radio.request("ObliqueMap", "isActive")) {
            Radio.trigger("ObliqueMap", "deactivate");
            Radio.trigger("Alert", "alert:remove");
            this.$("#ObliqueTable_title").text("Schrägluftbilder einschalten");
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
            this.$("#ObliqueTable_title").text("Schrägluftbilder ausschalten");
            Radio.trigger("ObliqueMap", "activate");
            Radio.trigger("Alert", "alert", "Der Schrägluftbild-Modus befindet sich zur Zeit noch in der Beta-Version!");
        }

    }
});

export default ButtonObliqueView;
