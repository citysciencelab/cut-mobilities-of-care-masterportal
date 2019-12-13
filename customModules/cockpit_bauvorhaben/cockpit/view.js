import initializeCockpitModel from "../cockpit/model";
import Template from "text-loader!./template.html";
import TemplateSuburbs from "text-loader!./template_dropdown_suburbs.html";
import TemplateLegend from "text-loader!./template_legend.html";
import "bootstrap/js/dropdown";
import "bootstrap-select";
import "./style.less";
import {select, event} from "d3-selection";

const CockpitView = Backbone.View.extend({
    events: {
        "changed.bs.select .selectpicker-district": function (evt) {
            this.mapSelectedValues(evt, "districts");
            this.model.setFilterObjectByKey("suburbs", []);
            this.model.filterSuburbsByDistricts();
            this.renderDropdownSuburb();
            this.redrawGraphs();
            this.renderLegend();
        },
        "changed.bs.select .selectpicker-suburb": function (evt) {
            this.mapSelectedValues(evt, "suburbs");
            this.redrawGraphs();
            this.renderLegend();
        },
        "changed.bs.select .selectpicker-year": function (evt) {
            this.mapSelectedValues(evt, "years");
            this.redrawGraphs();
        },
        "click input.month": function (e) {
            this.model.setFilterObjectByKey("monthMode", e.target.checked);
            this.redrawGraphs();
        },
        "click input.flat": function (e) {
            this.model.setFilterObjectByKey("flatMode", e.target.checked);
            this.redrawGraphs();
        },
        "shown.bs.collapse .collapse": function () {
            this.redrawGraphs();
        },
        "hidden.bs.collapse .collapse": function (evt) {
            if (evt.currentTarget.id.search(/baugenehmigungen$/) !== -1) {
                this.$el.find(".sum-baugenehmigungen").html("");
            }
            if (evt.currentTarget.id.search(/wohneinheiten$/) !== -1) {
                this.$el.find(".sum-wohneinheiten").html("");
            }
            if (evt.currentTarget.id.search(/wohneinheiten-noch-nicht-im-bau$/) !== -1) {
                this.$el.find(".sum-wohneinheiten-noch-nicht-im-bau").html("");
            }
            if (evt.currentTarget.id.search(/wohneinheiten-im-bau$/) !== -1) {
                this.$el.find(".sum-wohneinheiten-im-bau").html("");
            }
        }
    },
    /**
     * Initialize function
     * @returns {void}
     */
    initialize: function () {
        this.model = initializeCockpitModel();
        this.render(this.model, this.model.get("isActive"));
    },
    id: "cockpit_bauvorhaben",
    template: _.template(Template),
    templateSuburbs: _.template(TemplateSuburbs),
    templateLegend: _.template(TemplateLegend),
    /**
     * Todo
     * @param {initializeCockpitModel} model Todo
     * @param {Boolean} value Todo
     * @returns {CockpitView} - Todo
     */
    render: function (model, value) {
        if (value) {
            const attr = this.model.toJSON();

            this.$el.html(this.template(attr));
            this.renderDropdownSuburb();
            Radio.trigger("Sidebar", "append", this.el);
            Radio.trigger("Sidebar", "toggle", true);
            this.delegateEvents();
        }
        else {
            this.$el.empty();
            Radio.trigger("Sidebar", "toggle", false);
            this.undelegateEvents();
        }
        this.initDropdowns();
        // selects all items
        this.$el.find(".selectpicker-district").selectpicker("selectAll");
        this.$el.find(".selectpicker-year").selectpicker("selectAll");
        return this;
    },
    renderDropdownSuburb: function () {
        const attr = this.model.toJSON();

        this.$el.find(".placeholder-suburb").html(this.templateSuburbs(attr));
        this.initDropdowns();
    },
    /**
     * Renders legend
     * @returns {void}
     */
    renderLegend: function () {
        const districts = this.model.get("filterObject").districts,
            suburbs = this.model.get("filterObject").suburbs;
        let administrativeUnits = suburbs.length > 0 ? suburbs : districts;

        // sort districts
        if (_.without(administrativeUnits, districts) === []) {
            administrativeUnits = this.model.rearrangeArray(administrativeUnits, true, this.model.get("sortedDistricts"));
        }
        // set "Hamburg gesamt" and "Nicht georeferenziert" to back
        administrativeUnits = this.model.rearrangeArray(administrativeUnits, false, this.model.get("sortToBackValues"));

        this.$el.find(".legend").html(this.templateLegend({administrativeUnits: administrativeUnits}));
    },
    /**
     * inits the dropdown list
     * @see {@link https://developer.snapappointments.com/bootstrap-select/options/|Bootstrap-Select}
     * @returns {void}
     */
    initDropdowns: function () {
        this.$el.find(".selectpicker-district").selectpicker({
            selectedTextFormat: "static",
            width: "100%",
            actionsBox: true,
            deselectAllText: "Nichts auswählen",
            selectAllText: "Alle auswählen"
        });
        this.$el.find(".selectpicker-suburb").selectpicker({
            selectedTextFormat: "static",
            width: "100%",
            maxOptions: 10,
            maxOptionsText: "Sie haben zu viele Stadtteile ausgewählt. Es können nur maximal 10 Stadtteile selektiert werden."
        });
        this.$el.find(".selectpicker-year").selectpicker({
            selectedTextFormat: "static",
            width: "100%",
            actionsBox: true,
            deselectAllText: "Nichts auswählen",
            selectAllText: "Alle auswählen"
        });
    },

    /**
     * Maps the selected values from multiple drop-down list.
     * @param {jQuery.Event} evt - changed event
     * @param {string} key - districts or years
     * @returns {void}
     */
    mapSelectedValues: function (evt, key) {
        let selectedValues = Array.from(evt.target.options).map(function (option) {
            const isOptionSelected = $(option)[0].selected;
            let value;

            if (isOptionSelected) {
                value = $(option)[0].value;
                if (!isNaN(parseInt(value, 10))) {
                    value = parseInt(value, 10);
                }
            }
            return value;
        });

        selectedValues = _.without(selectedValues, undefined);
        this.model.setFilterObjectByKey(key, selectedValues);
        if (key === "years") {
            this.disableMonthCheckboxByYearsLength(selectedValues);
        }
    },

    /**
     * Sets the checkbox for months to "true" and disables it if only one year is selcted.
     * @param {Number[]} years Selected years.
     * @returns {void}
     */
    disableMonthCheckboxByYearsLength: function (years) {
        if (years.length === 1) {
            document.getElementsByClassName("month")[0].checked = true;
            document.getElementsByClassName("month")[0].disabled = true;
            this.model.setFilterObjectByKey("monthMode", true);
        }
        else {
            document.getElementsByClassName("month")[0].disabled = false;
        }
    },

    /**
     * Redraws the graphs.
     * @returns {void}
     */
    redrawGraphs: function () {
        const isBaugenehmigungPanelVisible = this.$el.find("#panel-baugenehmigungen").css("display") === "block",
            isWohneinheitenPanelVisible = this.$el.find("#panel-wohneinheiten").css("display") === "block",
            isNochNichtImBauPanelVisible = this.$el.find("#panel-wohneinheiten-noch-nicht-im-bau").css("display") === "block",
            isImBauPanelVisible = this.$el.find("#panel-wohneinheiten-im-bau").css("display") === "block";

        this.$el.find(".graph-svg").remove();
        this.model.prepareDataForGraph(isBaugenehmigungPanelVisible, isWohneinheitenPanelVisible, isNochNichtImBauPanelVisible, isImBauPanelVisible);
        this.overwriteGraphTooltip();
        this.overwritePanelHeader();
    },
    overwritePanelHeader: function () {
        const sumBaugenehmigungen = this.model.get("sumBaugenehmigungen") > 0 ? "(Gesamt: " + this.model.get("sumBaugenehmigungen") + ")" : "",
            sumWohneinheiten = this.model.get("sumWohneinheiten") > 0 ? "(Gesamt: " + this.model.get("sumWohneinheiten") + ")" : "",
            sumWohneinheitenNochNichtImBau = this.model.get("sumWohneinheitenNochNichtImBau") > 0 ? "(Gesamt: " + this.model.get("sumWohneinheitenNochNichtImBau") + ")" : "",
            sumWohneinheitenImBau = this.model.get("sumWohneinheitenImBau") > 0 ? "(Gesamt: " + this.model.get("sumWohneinheitenImBau") + ")" : "";

        this.$el.find(".sum-baugenehmigungen").html(sumBaugenehmigungen);
        this.$el.find(".sum-wohneinheiten").html(sumWohneinheiten);
        this.$el.find(".sum-wohneinheiten-noch-nicht-im-bau").html(sumWohneinheitenNochNichtImBau);
        this.$el.find(".sum-wohneinheiten-im-bau").html(sumWohneinheitenImBau);
    },
    /**
     * Overwrites the Graphs default tooltips-
     * @returns {void}
     */
    overwriteGraphTooltip: function () {
        const svgBaugenehmigungen = select(".graph-baugenehmigungen svg"),
            svgWohneinheiten = select(".graph-wohneinheiten svg"),
            svgWohneinheitenNochNichtImBau = select(".graph-wohneinheiten-noch-nicht-im-bau svg"),
            svgWohneinheitenImBau = select(".graph-wohneinheiten-im-bau svg"),
            that = this;

        // Baugenehmigungen
        svgBaugenehmigungen.selectAll(".dot").on("mouseover", function (data, index, nodeList) {
            that.tooltipMouseover(data, index, nodeList, select(".graph-tooltip-div-1"));
        }, this);
        svgBaugenehmigungen.selectAll(".dot").on("mouseout", function () {
            that.tooltipMouseout(select(".graph-tooltip-div-1"));
        }, this);

        // Wohneinheiten
        svgWohneinheiten.selectAll(".dot").on("mouseover", function (data, index, nodeList) {
            that.tooltipMouseover(data, index, nodeList, select(".graph-tooltip-div-2"));
        }, this);
        svgWohneinheiten.selectAll(".dot").on("mouseout", function () {
            that.tooltipMouseout(select(".graph-tooltip-div-2"));
        }, this);

        // Wohneinheiten noch nicht im Bau
        svgWohneinheitenNochNichtImBau.selectAll(".dot").on("mouseover", function (data, index, nodeList) {
            that.tooltipMouseover(data, index, nodeList, select(".graph-tooltip-div-3"));
        }, this);
        svgWohneinheitenNochNichtImBau.selectAll(".dot").on("mouseout", function () {
            that.tooltipMouseout(select(".graph-tooltip-div-3"));
        }, this);

        // Wohneinheiten im Bau
        svgWohneinheitenImBau.selectAll(".dot").on("mouseover", function (data, index, nodeList) {
            that.tooltipMouseover(data, index, nodeList, select(".graph-tooltip-div-4"));
        }, this);
        svgWohneinheitenImBau.selectAll(".dot").on("mouseout", function () {
            that.tooltipMouseout(select(".graph-tooltip-div-4"));
        }, this);
    },

    /**
     * Overwrites the default style and content of the tooltip on mouseover.
     * @param {Object} data Data object for node that was "mouseovered".
     * @param {Number} index Index of dataset in Nodelist.
     * @param {XML[]} nodeList Nodelist array of all the nodes.
     * @param {Selection} tooltipDiv Selected tooltip.
     * @returns {void}
     */
    tooltipMouseover: function (data, index, nodeList, tooltipDiv) {
        const node = $(nodeList[index])[0],
            nodeAttributes = node.attributes,
            namedItem = nodeAttributes.getNamedItem("attrname"),
            attrVal = $(namedItem).val(),
            date = this.insertStringAtIndex(data.date, 4, "/"),
            tooltipString = "(" + attrVal + ")<br>" + date + ": " + data[attrVal];

        tooltipDiv.html(tooltipString)
            .attr("style", "background-color: buttonface;" +
                "border-radius: 4px;" +
                "text-align: center;" +
                "left: " + (event.layerX - 25) + "px;" +
                "top: " + (event.layerY - 50) + "px;");
    },
    /**
     * Overwrites the default style and content of the tooltip on mouseout.
     * @param {Selection} tooltipDiv Selected tooltip.
     * @returns {void}
     */
    tooltipMouseout: function (tooltipDiv) {
        tooltipDiv.style("opacity", 0);
        tooltipDiv.style("left", "0px");
        tooltipDiv.style("top", "0px");
    },

    /**
     * Inserts a string in an other string at given index.
     * @param {String} string String.
     * @param {Number} index Index to add the stringToAdd.
     * @param {String} stringToAdd String to be added.
     * @returns {String} - The complete String.
     */
    insertStringAtIndex: function (string, index, stringToAdd) {
        let insertedString = string;

        if (insertedString.length > index) {
            insertedString = insertedString.substr(0, index) + stringToAdd + insertedString.substr(index);
        }
        return insertedString;
    }
});

export default CockpitView;
