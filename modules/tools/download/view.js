import DownloadTemplate from "text-loader!./template.html";
import DownloadModel from "./model";

const DownloadView = Backbone.View.extend({
    events: {
        "click .back": "back",
        "change .formats": "setSelectedFormat",
        "keyup .filename": "setFileName"
    },
    initialize: function () {
        this.listenTo(this.model, {
            "change:isActive": this.render
        });
    },
    template: _.template(DownloadTemplate),
    model: new DownloadModel(),

    back: function () {
        this.model.set("isActive", false);
        this.model.reset();
        Radio.request("ModelList", "getModelByAttributes", {id: "draw"}).set("isActive", true);
    },
    setSelectedFormat: function (evt) {
        const value = evt.currentTarget.value;

        this.model.setSelectedFormat(value);
        this.model.prepareData();
        this.model.prepareDownloadButton();
    },
    setFileName: function (evt) {
        const value = evt.currentTarget.value;

        this.model.setFileName(value);
        this.model.prepareDownloadButton();
    },
    render: function (model, value) {
        if (value) {
            this.setElement(document.getElementsByClassName("win-body")[0]);
            this.$el.html(this.template(model.toJSON()));
            this.delegateEvents();
        }
        else {
            this.undelegateEvents();
        }
        return this;
    }
});

export default DownloadView;
