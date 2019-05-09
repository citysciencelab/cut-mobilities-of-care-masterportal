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
        "shown.bs.collapse": function () {
            this.redrawGraphs();
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
            Radio.trigger("Sidebar", "toggle", true, "40%");
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
            suburbs = this.model.get("filterObject").suburbs,
            administrativeUnits = suburbs.length > 0 ? suburbs : districts;

        this.$el.find(".legend").html(this.templateLegend({administrativeUnits: administrativeUnits}));
    },
    /**
     * inits the dropdown list
     * @see {@link https://developer.snapappointments.com/bootstrap-select/options/|Bootstrap-Select}
     * @returns {void}
     */
    initDropdowns: function () {
        this.$el.find(".selectpicker").selectpicker({
            selectedTextFormat: "static",
            width: "100%",
            actionsBox: true,
            deselectAllText: "Nichts auswählen",
            selectAllText: "Alle auswählen"
        });
    },

    /**
     * maps the selected values from multiple drop-down list
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

    redrawGraphs: function () {
        const drawBaugenehmigungen = this.$el.find("#panel-baugenehmigungen").hasClass("in"),
            drawWohneinheiten = this.$el.find("#panel-wohneinheiten").hasClass("in"),
            drawWohneinheitenNochNichtImBau = this.$el.find("#panel-wohneinheiten-noch-nicht-im-bau").hasClass("in"),
            drawWohneinheitenImBau = this.$el.find("#panel-wohneinheiten-im-bau").hasClass("in");

        this.$el.find(".graph-svg").remove();

        this.model.prepareDataForGraph(drawBaugenehmigungen, drawWohneinheiten, drawWohneinheitenNochNichtImBau, drawWohneinheitenImBau);
        this.overwriteGraphTooltip();
    },
    overwriteGraphTooltip: function () {
        const svgBaugenehmigungen = select(".graph-baugenehmigungen svg"),
            svgWohneinheiten = select(".graph-wohneinheiten svg"),
            svgWohneinheitenNochNichtImBau = select(".graph-wohneinheiten-noch-nicht-im-bau svg"),
            svgWohneinheitenImBau = select(".graph-wohneinheiten-im-bau svg"),
            that = this;

        // Baugenehmigungen
        svgBaugenehmigungen.selectAll(".dot").on("mouseover", function (data, index, nodeList) {
            that.tooltipMouseover(data, index, nodeList, select(".graph-tooltip-div-1"));
        });
        svgBaugenehmigungen.selectAll(".dot").on("mouseout", function () {
            that.tooltipMouseout(select(".graph-tooltip-div-1"));
        });

        // Wohneinheiten
        svgWohneinheiten.selectAll(".dot").on("mouseover", function (data, index, nodeList) {
            that.tooltipMouseover(data, index, nodeList, select(".graph-tooltip-div-2"));
        });
        svgWohneinheiten.selectAll(".dot").on("mouseout", function () {
            that.tooltipMouseout(select(".graph-tooltip-div-2"));
        });

        // Wohneinheiten noch nicht im Bau
        svgWohneinheitenNochNichtImBau.selectAll(".dot").on("mouseover", function (data, index, nodeList) {
            that.tooltipMouseover(data, index, nodeList, select(".graph-tooltip-div-3"));
        });
        svgWohneinheitenNochNichtImBau.selectAll(".dot").on("mouseout", function () {
            that.tooltipMouseout(select(".graph-tooltip-div-3"));
        });

        // Wohneinheiten im Bau
        svgWohneinheitenImBau.selectAll(".dot").on("mouseover", function (data, index, nodeList) {
            that.tooltipMouseover(data, index, nodeList, select(".graph-tooltip-div-4"));
        });
        svgWohneinheitenImBau.selectAll(".dot").on("mouseout", function () {
            that.tooltipMouseout(select(".graph-tooltip-div-4"));
        });
    },
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
    tooltipMouseout: function (tooltipDiv) {
        tooltipDiv.style("opacity", 0);
        tooltipDiv.style("left", "0px");
        tooltipDiv.style("top", "0px");
    },
    insertStringAtIndex: function (string, index, stringToAdd) {
        let insertedString = string;

        if (insertedString.length > index) {
            insertedString = insertedString.substr(0, index) + stringToAdd + insertedString.substr(index);
        }
        return insertedString;
    }
});

export default CockpitView;
