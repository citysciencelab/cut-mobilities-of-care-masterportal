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
            this.requestJson();
        },

        requestJson: function () {
            $.ajax({
                // url: Radio.request("Util", "getProxyURL", "https://test-geofos.fhhnet.stadt.hamburg.de/lgv-config/cockpit_bauvorhaben.json"),
                url: "https://test.geoportal-hamburg.de/lgv-config/cockpit_bauvorhaben.json",
                context: this,
                success: function (data) {
                    this.filterYears(data);
                    this.filterDistricts(data);
                    this.setData(data);
                    this.trigger("render");
                }
            });
        },

        filterYears: function (data) {
            const t = data.map(function (obj) {
                return obj.year;
            });

            this.setYears([...new Set(t)].sort(function (a, b) {
                return b - a;
            }));
        },

        filterDistricts: function (data) {
            const t = data.map(function (obj) {
                return obj.bezirk;
            });

            this.setDistricts([...new Set(t)].sort());
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
        }
    });

    CockpitModel.initialize();
    return CockpitModel;
}

export default initializeCockpitModel;
