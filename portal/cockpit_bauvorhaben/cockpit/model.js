/**
 * @returns {void}
 */
function initializeCockpitModel () {
    const CockpitModel = Radio.request("ModelList", "getModelByAttributes", {id: "cockpit"}),
        defaults = {
            "isViewMobile": false,
            "json": [
                {
                    "year": 2016,
                    "month": "August",
                    "bezirk": "Harburg",
                    "bauvorhaben": 47,
                    "wohneinheiten": 105,
                    "constructionStarted": true
                },
                {
                    "year": 2018,
                    "month": "August",
                    "bezirk": "Bergedorf",
                    "bauvorhaben": 47,
                    "wohneinheiten": 105,
                    "constructionStarted": true
                },
                {
                    "year": 2017,
                    "month": "August",
                    "bezirk": "Harburg",
                    "bauvorhaben": 47,
                    "wohneinheiten": 105,
                    "constructionStarted": true
                },
                {
                    "year": 2018,
                    "month": "August",
                    "bezirk": "Altona",
                    "bauvorhaben": 47,
                    "wohneinheiten": 105,
                    "constructionStarted": true
                }
            ]
        };

    Object.assign(CockpitModel, {
        attributes: Object.assign(defaults, CockpitModel.attributes),

        /**
         * @returns {void}
         */
        initialize: function () {
            this.superInitialize();
            this.findYears();
            this.findDistricts();

        },

        findYears: function () {
            const t = this.get("json").map(function (obj) {
                return obj.year;
            });

            this.setYears([...new Set(t)].sort(function (a, b) {
                return b - a;
            }));
        },

        findDistricts: function () {
            const t = this.get("json").map(function (obj) {
                return obj.bezirk;
            });

            this.setDistricts([...new Set(t)].sort());
        },

        setYears: function (value) {
            this.set("years", value);
        },

        setDistricts: function (value) {
            this.set("districts", value);
        }
    });

    CockpitModel.initialize();
    return CockpitModel;
}

export default initializeCockpitModel;
