import AddWMSWin from "text-loader!./template.html";

const AddWMSView = Backbone.View.extend(/** @lends AddWMSView.prototype */{
    events: {
        "click #addWMSButton": "loadAndAddLayers",
        "keydown": "keydown"
    },

    /**
     * @class AddWMSView
     * @description Todo
     * @extends Tool
     * @memberof Tools.AddWMS
     * @constructs
     */
    initialize: function () {
        if (!["custom", "default"].includes(Radio.request("Parser", "getTreeType"))) {
            console.error("The addWMS tool is currently only supported for the custom and default theme trees!");
            return;
        }

        this.listenTo(this.model, {
            "change:wmsURL": this.urlChange,
            "change:isActive": this.render,
            // "change:placeholder": this.render
            "change:currentLng": () => {
                this.render(this.model, this.model.get("isActive"));
            }
        });
        if (this.model.get("isActive") === true) {
            this.render(this.model, true);
        }
    },

    /**
     * @member AddWMSTemplate
     * @description Template used to create the addwms tool.
     * @memberof Tools.AddWMS
     */
    template: _.template(AddWMSWin),

    /**
     * Triggers the loading and inserting of layers into the tree
     * @returns {void}
     */
    loadAndAddLayers: function () {
        this.model.loadAndAddLayers();
    },

    /**
     * Send via Enter key.
     * @param {Event} e - Key event.
     * @returns {void}
     */
    keydown: function (e) {
        const code = e.keyCode;

        if (code === 13) {
            this.loadAndAddLayers();
        }
    },

    /**
     * Renders the tool window
     * @param {Backbone.model} model - The addwms model.
     * @param {boolean} value - The visibility from tool.
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

export default AddWMSView;
