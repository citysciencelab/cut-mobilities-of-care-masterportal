const BackForwardModel = Backbone.Model.extend({
    defaults: {
        CenterScales: [],
        wentFor: false,
        currentPos: 0
    },
    getCenterScales: function () {
        return this.get("CenterScales");
    },
    setCenterScales: function (val) {
        this.set("CenterScales", val);
    },
    getWentFor: function () {
        return this.get("wentFor");
    },
    setWentFor: function (bool) {
        this.set("wentFor", bool);
    },
    getCurrentPos: function () {
        return this.get("currentPos");
    },
    setCurrentPos: function (val) {
        this.set("currentPos", val);
    }
});

export default BackForwardModel;