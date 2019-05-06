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
    },
    redrawGraphs: function () {
        this.$el.find(".graph-svg").remove();
        this.model.prepareDataForGraph();
        this.overwriteGraphTooltip();
    },
    overwriteGraphTooltip: function () {
        const svgBaugenehmigungen = select(".graph-baugenehmigungen svg"),
            svgWohneinheiten = select(".graph-wohneinheiten svg"),
            svgWohneinheitenNochNichtImBau = select(".graph-wohneinheiten-noch-nicht-im-bau svg"),
            svgWohneinheitenImBau = select(".graph-wohneinheiten-im-bau svg"),
            context = this;

        svgBaugenehmigungen.selectAll(".dot").on("mouseover", function (data, index, nodeList) {
            context.tooltipMouseover(data, index, nodeList, ".graph-tooltip-div-1");
        });
        svgWohneinheiten.selectAll(".dot").on("mouseover", function (data, index, nodeList) {
            context.tooltipMouseover(data, index, nodeList, ".graph-tooltip-div-2");
        });
        svgWohneinheitenNochNichtImBau.selectAll(".dot").on("mouseover", function (data, index, nodeList) {
            context.tooltipMouseover(data, index, nodeList, ".graph-tooltip-div-3");
        });
        svgWohneinheitenImBau.selectAll(".dot").on("mouseover", function (data, index, nodeList) {
            context.tooltipMouseover(data, index, nodeList, ".graph-tooltip-div-4");
        });
    },
    tooltipMouseover: function (data, index, nodeList, tooltipDivClass) {
        const node = $(nodeList[index])[0],
            nodeAttributes = node.attributes,
            namedItem = nodeAttributes.getNamedItem("attrname"),
            attrVal = $(namedItem).val(),
            date = this.insertStringAtIndex(data.date, 4, "/"),
            tooltipString = "(" + attrVal + ")<br>" + date + ": " + data[attrVal],
            tooltipDiv = this.$el.find(tooltipDivClass);

        tooltipDiv.html(tooltipString)
            .attr("style", "background-color: buttonface;" +
                "border-radius: 4px;" +
                "text-align: center;" +
                "left: " + (event.layerX - 25) + "px;" +
                "top: " + (event.layerY - 35) + "px;");
    },
    insertStringAtIndex: function (string, index, stringToAdd) {
        return string.substr(0, index) + stringToAdd + string.substr(index);
    }
});

export default CockpitView;
