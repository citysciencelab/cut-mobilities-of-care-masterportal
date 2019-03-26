const BackForwardModel = Backbone.Model.extend({
    defaults: {
        CenterScales: [],
        wentFor: false,
        currentPos: 0
    },
    initialize: function () {
        this.config = Radio.request("Parser", "getItemByAttributes", {id: "backforward"});
    },
    getForGlyphicon: function () {
        return _.isUndefined(this.config) === false ? this.config.attr.glyphiconFor : this.config;
    },
    getBackGlyphicon: function () {
        return _.isUndefined(this.config) === false ? this.config.attr.glyphiconBack : this.config;
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