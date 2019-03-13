const BackForwardModel = Backbone.Model.extend({
    defaults: {
        CenterScales: [],
        wentFor: false,
        currentPos: 0
    },
    setCenterScales: function (val) {
        this.set("CenterScales", val);
    },
    setWentFor: function (bool) {
        this.set("wentFor", bool);
    },
    setCurrentPos: function (val) {
        this.set("currentPos", val);
    }
});

export default BackForwardModel;