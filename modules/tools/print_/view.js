import PrintTemplate from "text-loader!./template.html";

const PrintView = Backbone.View.extend({
    events: {
        "change #printLayout": "setCurrentLayout",
        "change #printFormat": "setCurrentFormat",
        "change #printScale": "setCurrentScale",
        "keyup input[type='text']": "setTitle",
        "click #printLegend": "setIsLegendSelected",
        "click #printGfi": "setIsGfiSelected",
        "click button": "print"
    },
    initialize: function () {
        this.template = _.template(PrintTemplate);
        this.listenTo(this.model, {
            "change:isActive": this.render,
            "change:isGfiActive": this.render,
            "change:currentScale": this.render
        });
    },

    render: function (model) {
        var attributes = model.toJSON();

        if (model.get("isActive") && model.get("currentLayout")) {
            _.extend(attributes, {"scaleList": model.getPrintMapScales()});
            this.setElement(document.getElementsByClassName("win-body")[0]);
            this.$el.html(this.template(attributes));
            this.delegateEvents();
        }
        else {
            this.$el.empty();
        }

        return this;
    },

    setCurrentLayout: function (evt) {
        var newLayout = this.model.getLayoutByName(this.model.get("layoutList"), evt.target.value);

        this.model.setCurrentLayout(newLayout);
        this.model.setIsScaleSelectedManually(false);
        Radio.trigger("Map", "render");
    },

    setCurrentFormat: function (evt) {
        this.model.setCurrentFormat(evt.target.value);
    },

    setCurrentScale: function (evt) {
        var scale = parseInt(evt.target.value, 10),
            optimalResolution = this.model.getOptimalResolution(scale, Radio.request("Map", "getSize"), this.model.getPrintMapSize());

        this.model.setCurrentScale(scale);
        Radio.trigger("MapView", "setConstrainedResolution", optimalResolution, 1);
        this.model.setIsScaleSelectedManually(true);
    },

    setTitle: function (evt) {
        this.model.setTitle(evt.target.value);
    },

    setIsLegendSelected: function (evt) {
        this.model.setIsLegendSelected(evt.target.checked);
    },

    setIsGfiSelected: function (evt) {
        this.model.setIsGfiSelected(evt.target.checked);
    },

    print: function () {
        this.model.print();
    }
});

export default PrintView;
