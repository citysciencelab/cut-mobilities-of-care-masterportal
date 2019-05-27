import OverviewMapModel from "./model";
import template from "text-loader!./template.html";

const OverviewMapView = Backbone.View.extend(/** @lends OverviewMapView.prototype */{
    events: {
        "click .glyphicon": "toggle",
        "click div#mini-map": "toggle"
    },
    /**
     * @class OverviewMapView
     * @memberOf Controls.Overviewmap
     * @description View to represent Overviewmap
     * @extends Backbone.View
     * @param {Object} el Jquery element to be rendered into.
     * @param {String} id Id of control.
     * @param {Object} attr Attributes of overviewmap.
     * @param {String} attr.baseLayer Id of baseLayer
     * @param {String} attr.resolution Resolution of baseLayer.
     * @constructs
     */
    initialize: function (el, id, attr) {
        let layerId;
        const channel = Radio.channel("Map"),
            style = Radio.request("Util", "getUiStyle");

        this.setElement(el);
        this.id = id;

        /**
         * baselayer
         * @deprecated in 3.0.0
         */
        if (attr.hasOwnProperty("baselayer")) {
            console.warn("OverviewMap: Attribute 'baselayer' is deprecated. Please use 'layerId'");
            layerId = attr.baselayer;
        }
        if (attr.hasOwnProperty("layerId")) {
            layerId = attr.layerId;
        }
        channel.on({
            "change": this.change
        }, this);
        if (style === "DEFAULT") {
            this.template = _.template(template);
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
        this.model = new OverviewMapModel({id: this.id, layerId: layerId, resolution: attr.resolution});
    },

    tabletemplate: _.template("<div id='mini-map' class='table-tool'><a href='#'><span class='glyphicon glyphicon-globe'></span><span id='mini-map_title'><%=ansicht %></span></a> </div>"),

    /**
     * Render function
     * @returns {OverviewMapView} - Returns itself.
     */
    render: function () {
        this.$el.html(this.template());
        return this;
    },

    /**
     * Render Function
     * @fires Map#RadioRequestMap
     * @returns {ButtonMapView} - Returns itself
     */
    renderToToolbar: function () {
        this.$el.append(this.tabletemplate({ansicht: "Mini-Map ausschalten"}));
        return this;
    },

    id: "overviewmap",

    /**
     * @member OverviewMapTemplate
     * @description Template used for the OverviewMap
     * @memberof Controls.Overviewmap
     */
    template: _.template(template),
    /**
     * @member OverviewMapTemplate
     * @description tableTemplate used for the OverviewMap in Table View Tools
     * @memberof Controls.Overviewmap
     */
    tabletemplate: _.template("<div id='mini-map' class='table-tool'><a href='#'><span class='glyphicon glyphicon-globe'></span><span id='mini-map_title'><%=ansicht %></span></a> </div>"),

    /**
     * Toggles the title of the DOM element
     * @returns {void}
     */
    toggle: function () {
        var ArrayObj = Array.from(document.getElementsByClassName("ol-custom-overviewmap"));

        if (this.$(".overviewmap-button > .glyphicon-globe").attr("title") === "Übersichtskarte ausblenden") {
            this.$(".ol-custom-overviewmap").hide("slow");
            this.$(".overviewmap-button > .glyphicon-globe").attr("title", "Übersichtskarte einblenden");
        }
        else if (this.$(".overviewmap-button > .glyphicon-globe").attr("title") === "Übersichtskarte einblenden") {
            this.$(".overviewmap-button > .glyphicon-globe").attr("title", "Übersichtskarte ausblenden");
            this.$(".ol-custom-overviewmap").show("slow");
        }
        else if (document.getElementById("mini-map_title").innerText === "Mini-Map ausschalten") {
            ArrayObj.map(element => element.classList.add("hidden"));
            document.getElementById("mini-map_title").innerText = "Mini-Map einschalten";
        }
        else if (document.getElementById("mini-map_title").innerText === "Mini-Map einschalten") {
            document.getElementById("mini-map_title").innerText = "Mini-Map ausschalten";
            ArrayObj.map(element => element.classList.remove("hidden"));

        }
    }
});

export default OverviewMapView;