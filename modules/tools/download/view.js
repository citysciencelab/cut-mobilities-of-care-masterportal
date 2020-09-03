import DownloadTemplate from "text-loader!./template.html";
import DownloadModel from "./model";

const DownloadView = Backbone.View.extend(/** @lends DownloadView.prototype */{
    events: {
        "click .back": "back",
        "change .formats": "setSelectedFormat",
        "keyup .filename": "setFileName",
        "click .downloadBtn": "download"
    },
    /**
     * @class DownloadView
     * @extends Backbone.View
     * @memberof Tools.Download
     * @param {object} store - The Vuex store.
     * @listens Tools.Download#changeIsActive
     * @fires Core.ModelList#RadioRequestModelListGetModelByAttributes
     * @constructs
     */
    initialize: function (store) {
        this.model.setStore(store);
        this.listenTo(this.model, {
            "change:isActive": this.render,
            "change:createFirstText": function () {
                if (this.model.get("isActive") === true) {
                    this.render(this.model, true);
                }
            }
        });
        this.listenTo(Radio.channel("Window"), {
            "setIsVisible": this.close
        }, this);
    },

    /**
     * @member DownloadTemplate
     * @description Template used to create the download tool
     * @memberof Tools.Download
     */
    template: _.template(DownloadTemplate),
    model: new DownloadModel(),
    /**
     * Called if window is closed. Sets the model to isActive=false.
     * @param {Boolean} value if false, window was set to isVisible=false
     * @returns {void}
     */
    close: function (value) {
        if (!value && this.model.get("isActive") === true) {
            this.model.set("isActive", false);
            this.model.reset();
        }
    },
    /**
     * Return to the draw module.
     * @returns {void}
     */
    back: function () {
        this.model.set("isActive", false);
        this.model.reset();

        Radio.request("ModelList", "getModelByAttributes", {id: "draw"}).set("isActive", true);
        this.model.get("store").dispatch("Tools/setToolActive", {id: "draw", active: true});
    },

    /**
     * Sets the selected format by user input
     * @param {Event} evt Change event in format dropdown.
     * @returns {void}
     */
    setSelectedFormat: function (evt) {
        const value = evt.currentTarget.value;

        this.model.setSelectedFormat(value);
        this.model.prepareData();
        this.model.prepareDownloadButton();
    },

    /**
     * Sets the typed filename by user input
     * @param {Event} evt Keyup event in filename textfield.
     * @returns {void}
     */
    setFileName: function (evt) {
        const value = evt.currentTarget.value;

        this.model.setFileName(value);
        this.model.prepareDownloadButton();
    },

    download: function () {
        this.model.download();
    },
    /**
     * renders the models content.
     * @param {Tools.Download.DownloadModel} model Download model.
     * @param {Boolean} value Flag if model is active.
     * @returns {void}
     */
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
