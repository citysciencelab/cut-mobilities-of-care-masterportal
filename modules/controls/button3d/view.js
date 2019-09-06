import Button3dTemplate from "text-loader!./template.html";
/**
 * @member Button3dTemplate
 * @description Template used for the 3D Button
 * @memberof Controls.Button3D
 */

const Button3dView = Backbone.View.extend(/** @lends Button3dView.prototype */{
    events: {
        "click .button3D": "mapChange",
        "click div#3d-ansicht": "mapChange"
    },
    /**
     * @class Button3dView
     * @extends Backbone.View
     * @memberof Controls.Button3D
     * @constructs
     * @description This control gives a user the 3D interface in the map.
     * @fires Core#RadioRequestUtilGetUiStyle
     * @fires Core#RadioRequestMapIsMap3d
     * @fires Core.ModelList#RadioTriggerModelListToggleWfsCluster
     * @fires Core#RadioTriggerMapDeactivateMap3d
     * @fires Alerting#RadioTriggerAlertAlertRemove
     * @fires Tools.Filter#RadioTriggerFilterEnable
     * @fires Core#RadioTriggerObliqueMapDeactivate
     * @fires Tools.Filter#RadioTriggerFilterDisable
     * @fires Core#RadioTriggerMapActivateMap3d
     * @fires Alerting#RadioTriggerAlertAlert
     * @fires Core.ModelList.Tool#RadioRequestToolGetSupportedOnlyIn3d
     * @fires Core.ModelList.Tool#RadioRequestToolGetSupportedIn3d
     * @fires Core.ModelList.Tool#RadioRequestToolGetSupportedOnlyInOblique
     * @fires Core.ModelList.Tool#RadioRequestToolGetCollection
     * @listens Core#RadioTriggerMapChange
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
            this.$("#3d_titel").text("Ansicht ausschalten");
        }
        else {
            this.$("#button3D").removeClass("toggleButtonPressed");
            this.$("#3d_titel").text("Ansicht einschalten");
        }
    },
    /**
     * Render Function
     * @fires Core#RadioRequestMapIsMap3d
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
     * @fires Core#RadioRequestMapIsMap3d
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
     * @fires Core.ModelList.Tool#RadioRequestToolGetSupportedOnlyIn3d
     * @fires Core.ModelList.Tool#RadioRequestToolGetSupportedIn3d
     * @fires Core.ModelList.Tool#RadioRequestToolGetSupportedOnlyInOblique
     * @fires Core.ModelList.Tool#RadioRequestToolGetCollection
     * @fires ObliqueMap#RadioRequestObliqueMapIsActive
     * @fires Core#RadioRequestMapIsMap3d
     * @return {void}
     */
    mapChange: function () {
        const supportedOnlyIn3d = Radio.request("Tool", "getSupportedOnlyIn3d"),
            supportedIn3d = Radio.request("Tool", "getSupportedIn3d"),
            supportedOnlyInOblique = Radio.request("Tool", "getSupportedOnlyInOblique"),
            modelCollection = Radio.request("Tool", "getCollection"),
            activeTools = modelCollection !== undefined ? modelCollection.where({"type": "tool", "isActive": true}) : [];

        if (Radio.request("Map", "isMap3d")) {
            this.controlsMapChangeClose3D(activeTools, supportedOnlyIn3d);
        }
        else if (Radio.request("ObliqueMap", "isActive")) {
            this.controlsMapChangeCloseOblique(activeTools, supportedOnlyInOblique);
        }
        else {
            this.controlsMapChangeClose2D(activeTools, supportedIn3d);
        }
    },

    /**
     * Controls the surface of the portal when leaving the 3D mode.
     * @param {Backbone.Collection} activeTools contains all activated tools
     * @param {String[]} supportedOnlyIn3d contains all tools that are only supported in 3D-Modues
     * @fires Core.ModelList#RadioTriggerModelListToggleWfsCluster
     * @fires Core#RadioTriggerMapDeactivateMap3d
     * @fires Alerting#RadioTriggerAlertAlert
     * @fires Tools.Filter#RadioTriggerFilterEnable
     * @returns {void}
     */
    controlsMapChangeClose3D: function (activeTools, supportedOnlyIn3d) {
        Radio.trigger("ModelList", "toggleWfsCluster", true);
        Radio.trigger("Map", "deactivateMap3d");
        Radio.trigger("Alert", "alert:remove");
        Radio.trigger("Filter", "enable");
        this.$("#3d_titel").text("Ansicht einschalten");

        activeTools.forEach(tool => {
            if (supportedOnlyIn3d.includes(tool.get("id"))) {
                tool.setIsActive(false);
            }
        });
    },

    /**
     * Controls the surface of the portal when leaving the Oblique mode.
     * @param {Backbone.Collection} activeTools contains all activated tools
     * @param {String[]} supportedOnlyInOblique contains all tools that are only supported in Oblique-Modues
     * @listens Core#RadioTriggerMapChange
     * @fires Core#RadioTriggerObliqueMapDeactivate
     * @returns {void}
     */
    controlsMapChangeCloseOblique: function (activeTools, supportedOnlyInOblique) {
        Radio.once("Map", "change", function (map) {
            if (map === "2D") {
                this.mapChange();
            }
        }.bind(this));
        Radio.trigger("ObliqueMap", "deactivate");
        activeTools.forEach(tool => {
            if (!supportedOnlyInOblique.includes(tool.get("id"))) {
                tool.setIsActive(false);
            }
        });
    },

    /**
     * Controls the surface of the portal when leaving the 2D mode.
     * @param {Backbone.Collection} activeTools contains all activated tools
     * @param {String[]} supportedIn3d contains all tools that are supported in 3D-Modues
     * @fires Tools.Filter#RadioTriggerFilterDisable
     * @fires Core.ModelList#RadioTriggerModelListToggleWfsCluster
     * @fires Core#RadioTriggerMapActivateMap3d
     * @fires Alerting#RadioTriggerAlertAlert
     * @returns {void}
     */
    controlsMapChangeClose2D: function (activeTools, supportedIn3d) {
        this.$("#3d_titel").text("Ansicht ausschalten");
        Radio.trigger("Filter", "disable");
        Radio.trigger("ModelList", "toggleWfsCluster", false);
        Radio.trigger("Map", "activateMap3d");
        Radio.trigger("Alert", "alert", "Der 3D-Modus befindet sich zur Zeit noch in der Beta-Version!");

        activeTools.forEach(tool => {
            if (!supportedIn3d.includes(tool.get("id"))) {
                tool.setIsActive(false);
            }
        });
    }
});

export default Button3dView;
