import initializeCockpitModel from "../cockpit/model";
import Template from "text-loader!./template.html";
import "bootstrap/js/dropdown";
import "bootstrap-select";
import "./style.less";

const CockpitView = Backbone.View.extend({
    events: {
        "changed.bs.select .selectpicker-district": function (evt) {
            this.mapSelectedValues(evt, "districts");
            this.removeOldGraphs();
            this.model.prepareDataForGraph();
        },
        "changed.bs.select .selectpicker-year": function (evt) {
            this.mapSelectedValues(evt, "years");
            this.removeOldGraphs();
            this.model.prepareDataForGraph();

        },
        "click input": function (e) {
            this.model.setFilterObjectByKey("monthMode", e.target.checked);
            this.removeOldGraphs();
            this.model.prepareDataForGraph();
        }
    },
    /**
     * Initialize function
     * @returns {void}
     */
    initialize: function () {
        this.model = initializeCockpitModel();
        this.listenTo(this.model, {
            "render": function () {
                this.render(this.model, this.model.get("isActive"));
            }
        });
    },
    id: "cockpit_bauvorhaben",
    template: _.template(Template),
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
            Radio.trigger("Sidebar", "append", this.el);
            Radio.trigger("Sidebar", "toggle", true);
            this.delegateEvents();
        }
        else {
            this.$el.empty();
            Radio.trigger("Sidebar", "toggle", false);
            this.undelegateEvents();
        }
        this.initDropdown();
        return this;
    },

    /**
     * inits the dropdown list
     * @see {@link https://developer.snapappointments.com/bootstrap-select/options/|Bootstrap-Select}
     * @returns {void}
     */
    initDropdown: function () {
        this.$el.find(".selectpicker").selectpicker({
            selectedTextFormat: "static",
            width: "100%",
            actionsBox: true,
            deselectAllText: "Nichts auswählen",
            selectAllText: "Alle auswählen"
        });
        // selects all items
        this.$el.find(".selectpicker").selectpicker("selectAll");
    },

    /**
     * maps the selected values from multiple drop-down list
     * @param {jQuery.Event} evt - changed event
     * @param {string} key - districts or years
     * @returns {void}
     */
    mapSelectedValues: function (evt, key) {
        // const selectedValues = Array.from(evt.target.selectedOptions).map(option => option.value);
        const selectedValues = Array.from(evt.target.selectedOptions).map(function (option) {
            let value = option.value;

            if (!isNaN(parseInt(value, 10))) {
                value = parseInt(value, 10);
            }
            return value;
        });

        this.model.setFilterObjectByKey(key, selectedValues);
        this.model.prepareDataForGraph();
    },
    removeOldGraphs: function () {
        this.$el.find(".graph-svg").remove();
    }
});

export default CockpitView;
