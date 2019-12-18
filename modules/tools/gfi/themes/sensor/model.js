import Theme from "../model";

const SensorTheme = Theme.extend({
    defaults: Object.assign({}, Theme.prototype.defaults, {
        grafana: false
    }),
    initialize: function () {
        this.listenTo(this, {
            "change:isReady": this.parseProperties
        });
    },
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
    setGrafana: function (value) {
        this.set("grafana", value);
    },
    setGrafanaUrls: function (value) {
        this.set("grafanaUrls", value);
    }
});

export default SensorTheme;
