import Button3dTemplate from "text-loader!./template.html";

const Button3dView = Backbone.View.extend(/** @lends Button3dView.prototype */{
    events: {
        "click .button3D": "mapChange",
        "click div#3d-ansicht": "mapChange"
    },
    /**
     * @class Button3dView
     * @extends Backbone.View
     * @memberOf Controls.Button3d
     * @constructs
     * @description This control gives a user the 3D interface in the map.
     * @fires Util#RadioRequestUtilGetUiStyle
     */
    initialize: function () {
        var channel = Radio.channel("Map"),
            style = Radio.request("Util", "getUiStyle");

        channel.on({
            "change": this.change
        }, this);
        if (style === "DEFAULT") {
            this.template = _.template(Button3dTemplate);
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
    tabletemplate: _.template("<div id='3d-ansicht' class='table-tool'><a href='#'><span class='glyphicon icon-btn3d1'></span><span id='3d_titel'><%=ansicht %></span></a> </div>"),
    /**
     * Shows the 3D button as selected.
     * Shows the 3D button as not selected.
     * @param  {string} map Mode of the map.
     * @returns {void}
     */
    change: function (map) {
        if (map === "3D") {
            this.$("#button3D").addClass("toggleButtonPressed");
        }
        else {
            this.$("#button3D").removeClass("toggleButtonPressed");
        }
    },
    /**
     * Render Function
     * @returns {Button3dView} - Returns itself
     */
    render: function () {
        this.$el.html(this.template);
        if (Radio.request("Map", "isMap3d")) {
            this.$("#button3D").addClass("toggleButtonPressed");
        }

        return this;
    },
    /**
     * Render Function
     * @fires Map#RadioRequestMapIsMap3d
     * @returns {Button3dView} - Returns itself
     */
    renderToToolbar: function () {
        this.$el.append(this.tabletemplate({ansicht: "Ansicht einschalten"}));
        if (Radio.request("Map", "isMap3d")) {
            this.$("#3d-ansicht").addClass("toggleButtonPressed");
        }

        return this;
    },
    /**
     * Shows the map in 3D-mode if 3d button is activated.
     * Shows the map in 2D-mode if the 3d button is deactivated.
     * @fires Map#RadioRequestMapIsMap3d
     * @fires List#RadioTriggerModelListToggleWfsCluster
     * @fires Map#RadioTriggerMapDeactivated3d
     * @fires AlertingView#RadioTriggerAlertAlertRemove
     * @fires Filter#RadioTriggerFilterEnable
     * @fires ObliqueMap#RadioRequestObliqueMapIsActive
     * @fires ObliqueMap#RadioTriggerObliqueMapDeactivate
     * @fires Filter#RadioTriggerFilterDisable
     * @fires Map#RadioTriggerMapActivateMap3d
     * @fires AlertingModel#RadioTriggerAlertAlert
     * @listens Map#RadioOnceMapChange
     * @return {void}
     */
    mapChange: function () {

        if (Radio.request("Map", "isMap3d")) {
            Radio.trigger("ModelList", "toggleWfsCluster", true);
            Radio.trigger("Map", "deactivateMap3d");
            Radio.trigger("Alert", "alert:remove");
            Radio.trigger("Filter", "enable");
            this.$("#3d_titel").text("Ansicht einschalten");
        }
        else {
            if (Radio.request("ObliqueMap", "isActive")) {
                Radio.once("Map", "change", function (map) {
                    if (map === "2D") {
                        this.mapChange();
                    }
                }.bind(this));
                Radio.trigger("ObliqueMap", "deactivate");
                return;
            }
            this.$("#3d_titel").text("Ansicht ausschalten");
            Radio.trigger("Filter", "disable");
            Radio.trigger("ModelList", "toggleWfsCluster", false);
            Radio.trigger("Map", "activateMap3d");
            // Radio.trigger("ModelList", "setModelAttributesById", "3d_daten", {isExpanded: true});
            // Radio.trigger("ModelList", "setModelAttributesById", "terrain", {isSelected: true});
            Radio.trigger("Alert", "alert", "Der 3D-Modus befindet sich zur Zeit noch in der Beta-Version!");
        }

    }
});

export default Button3dView;
