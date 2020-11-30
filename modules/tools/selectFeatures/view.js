import SelectFeaturesTemplate from "text-loader!./template.html";

const SelectFeaturesView = Backbone.View.extend(/** @lends SelectFeaturesView.prototype */ {
    events: {
        "click .select-features-zoom-link": "featureZoom"
    },

    /**
     * @class SelectFeaturesView
     * @extends Backbone.View
     * @memberof Tools.SelectFeatures
     * @listens Tools.SelectFeatures#changeIsActive
     * @listens Tools.SelectFeatures#changeCurrentLng
     * @listens Tools.SelectFeatures#updatedSelection
     * @listens Core#RadioRequestMapGetMap
     * @constructs
     */
    initialize: function () {
        Radio.channel(this.model).on({
            "updatedSelection": this.render
        }, this);

        this.listenTo(this.model, {
            "change:isActive": this.render,
            "change:currentLng": () => {
                if (this.model.get("isActive")) {
                    this.render();
                }
            }
        });

        if (this.model.get("isActive")) {
            this.render();
        }
    },

    template: _.template(SelectFeaturesTemplate),

    /**
     * Renders the SelectFeatures tool contents.
     * @param {Backbone.Model} model SelectFeaturesModel instance
     * @returns {Backbone.View} SelectFeaturesView
     */
    render: function () {
        if (this.model.get("isActive") && this.model.get("renderToWindow")) {
            this.setElement(document.getElementsByClassName("win-body")[0]);
            this.$el.html(this.template(this.model.toJSON()));
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
            {item} = this.model.get("selectedFeaturesWithRenderInformation")[featureIndex];

        Radio.request("Map", "getMap").getView().fit(item.getGeometry());
    }
});

export default SelectFeaturesView;
