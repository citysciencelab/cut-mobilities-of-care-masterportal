import SelectFeaturesTemplate from "text-loader!./template.html";

const SelectFeaturesView = Backbone.View.extend(/** @lends SelectFeaturesView.prototype */ {
    events: {
        "click .select-features-zoom-link": "featureZoom"
    },

    /**
     * @class SelectFeaturesView
     * @extends Backbone.View
     * @memberof Tools.SelectFeatures
     * @listens Tools.SelectFeaturesModel#updatedSelection
     * @constructs
     */
    initialize: function () {
        const channel = Radio.channel(this.model);

        channel.on({
            "updatedSelection": () => this.render(this.model)
        }, this);

        this.listenTo(this.model, {
            "change:isActive": this.render,
            "change:currentLng": function () {
                if (this.model.get("isActive") === true) {
                    this.render(this.model, true);
                }
            }
        });

        if (this.model.get("isActive") === true) {
            this.render(this.model, true);
        }
    },

    template: _.template(SelectFeaturesTemplate),

    /**
     * Renders the SelectFeatures tool contents.
     * @param {Backbone.Model} model SelectFeaturesModel instance
     * @param {Boolean} [isActive=model.get("isActive")] whether tool is open/closed
     * @returns {Backbone.View} SelectFeaturesView
     */
    render: function (model, isActive = model.get("isActive")) {
        if (isActive && this.model.get("renderToWindow")) {
            this.setElement(document.getElementsByClassName("win-body")[0]);
            this.$el.html(this.template(model.toJSON()));
            this.delegateEvents();
        }
        else {
            this.model.clearFeatures();
            this.undelegateEvents();
        }
        return this;
    },

    /**
     * Feature listing offer clickable elements to zoom to a feature.
     * @param {object} evt click event
     * @returns {void}
     */
    featureZoom: function (evt) {
        const featureIndex = evt.currentTarget.id.split("-")[0],
            {feature} = this.model.get("selectedFeaturesWithRenderInformation")[featureIndex];

        Radio.request("Map", "getMap").getView().fit(feature.getGeometry());
    }
});

export default SelectFeaturesView;
