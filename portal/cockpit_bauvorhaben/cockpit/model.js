import data from "./cockpit_bauvorhaben.json";

/**
 * @returns {void}
 */
function initializeCockpitModel () {
    const CockpitModel = Radio.request("ModelList", "getModelByAttributes", {id: "cockpit"}),
        defaults = {
            "isViewMobile": false,
            "filterObject": {
                "districts": [],
                "years": [],
                "monthMode": false
            }
        };

    Object.assign(CockpitModel, {
        attributes: Object.assign(defaults, CockpitModel.attributes),

        /**
         * @returns {void}
         */
        initialize: function () {
            this.superInitialize();
            this.filterYears(data);
            this.filterDistricts(data);
            this.setData(data);
            this.trigger("render");
        },

        filterYears: function (data) {
            const t = _.pluck(data, "year");

            this.setYears([...new Set(t)].sort(function (a, b) {
                return b - a;
            }));
        },

        filterDistricts: function (data) {
            const t = _.pluck(data, "bezirk");

            this.setDistricts([...new Set(t)].sort());
        },

        updateLayer: function (filterObject) {
            const layer = Radio.request("ModelList", "getModelByAttributes", {id: "13872"});

            if (layer !== undefined) {
                const layers = [],
                    layerSource = layer.get("layer").getSource();

                filterObject.years.forEach(function (year) {
                    if (year !== "2010" && year !== "2019") {
                        layers.push("bauvorhaben_" + year + "_erledigt");
                    }
                });
                if (layers.length === 0) {
                    layerSource.updateParams({LAYERS: ","});
                }
                else {
                    layerSource.updateParams({LAYERS: layers.toString()});
                }
            }
        },

        setYears: function (value) {
            this.set("years", value);
        },

        setDistricts: function (value) {
            this.set("districts", value);
        },

        setData: function (value) {
            this.set("data", value);
        },

        setFilterObjectByKey: function (key, value) {
            this.get("filterObject")[key] = value;
            this.updateLayer(this.get("filterObject"));
        }
    });

    CockpitModel.initialize();
    return CockpitModel;
}

export default initializeCockpitModel;
