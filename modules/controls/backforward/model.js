const BackForwardModel = Backbone.Model.extend({
    defaults: {
        CenterScales: [],
        wentFor: false,
        currentPos: 0
    },
    // setter for CenterScales
    setCenterScales: function (val) {
        this.set("CenterScales", val);
    },
    // setter for WentFor
    setWentFor: function (bool) {
        this.set("wentFor", bool);
    },
    // setter for CurrentPos
    setCurrentPos: function (val) {
        this.set("currentPos", val);
    }
});

export default BackForwardModel;
