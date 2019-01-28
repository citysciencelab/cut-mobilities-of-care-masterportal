import Tool from "../../core/modelList/tool/model";

const Shadow = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
        glyphicon: "glyphicon-screenshot"
    }),
    initialize: function () {
        this.superInitialize();
        const date = Cesium.JulianDate.now();

        Cesium.JulianDate.addDays(date, 200, date);
        Cesium.JulianDate.addHours(date, 12, date);
        this.time = date;
    },
    forwardTime: function () {
        Cesium.JulianDate.addHours(this.time, 1, this.time);
        Radio.trigger("Map", "setTime", this.time);
    },
    backwardTime: function () {
        Cesium.JulianDate.addHours(this.time, -1, this.time);
        Radio.trigger("Map", "setTime", this.time);
    },
    toggleShadow: function () {
        var map = Radio.request("Map", "getMap3d"),
            scene = map.getCesiumScene();

        if (!scene.sun) {
            scene.sun = new Cesium.Sun();
        }
        scene.globe.shadows = Cesium.ShadowMode.RECEIVE_ONLY;
        scene.globe.enableLighting = true;
        scene.shadowMap.enabled = !scene.shadowMap.enabled;
    }
});

export default Shadow;
