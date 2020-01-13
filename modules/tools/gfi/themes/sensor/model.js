import Theme from "../model";

const SensorTheme = Theme.extend(/** @lends SensorTheme.prototype*/{
    defaults: Object.assign({}, Theme.prototype.defaults, {
        grafana: false
    }),
    /**
     * @class SensorTheme
     * @description This theme is used to show sensor-data.
     * If "grafana" is configured and the feature contains attributes starting with "grafana_url",
     * then these links are used to generate iframes.
     * @memberof Tools.GFI.Themes.Sensor
     * @constructs
     * @property {Boolean} grafana=false Flag to show if grafana iframes should be generated.
     */
    initialize: function () {
        this.listenTo(this, {
            "change:isReady": this.parseProperties
        });
    },

    /**
     * Parses the properties based on the models "grafana" flag
     * @returns {void}
     */
    parseProperties: function () {
        let grafana,
            grafanaUrls;
        const feature = this.get("feature");

        if (feature.get("gfiParams") && feature.get("gfiParams").hasOwnProperty("grafana")) {
            grafana = feature.get("gfiParams").grafana;

            this.setGrafana(grafana);
        }

        if (grafana) {
            grafanaUrls = this.getGrafanaUrlsFromFeature(feature);

            this.setGrafanaUrls(grafanaUrls);
        }
    },

    /**
     * Parses all attributes of the gfiFeature that start with ""grafana_url".
     * @param {ol/Feature} feature gfiFeature.
     * @returns {Object} - An object containing all the grafana urls.
     */
    getGrafanaUrlsFromFeature: function (feature) {
        const grafanaUrls = {};
        let attributesContainingGrafana = [];

        if (feature) {
            attributesContainingGrafana = feature.getKeys().filter(key => {
                return key.startsWith("grafana_url");
            });

            attributesContainingGrafana.forEach(attr => {
                grafanaUrls[attr] = feature.get(attr);
            });
        }

        return grafanaUrls;
    },

    /**
     * Setter for attribute "grafana":
     * @param {Boolean} value Flag if grafana should be used.
     * @returns {void}
     */
    setGrafana: function (value) {
        this.set("grafana", value);
    },

    /**
     * Setter for attribute "grafanaUrls":
     * @param {Object} value An object containing all the grafana urls.
     * @returns {void}
     */
    setGrafanaUrls: function (value) {
        this.set("grafanaUrls", value);
    }
});

export default SensorTheme;
