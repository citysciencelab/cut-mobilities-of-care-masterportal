import SelectFeaturesTemplate from "text-loader!./template.html";

const SelectFeaturesView = Backbone.View.extend(/** @lends SelectFeaturesView.prototype */ {
    events: {
        // TODO: Implement me if needed
    },

    /**
     * @class SelectFeaturesView
     * @extends Backbone.View
     * @memberof Tools.SelectFeatures
     * @constructs
     */
    initialize: function () {
        const channel = Radio.channel("SelectFeaturesView");

        channel.on({
            "updatedSelection": function () {
                this.render(this.model, this.model.get("isActive"));
            }
        }, this);

        this.listenTo(this.model, {
            "change:isActive": this.render,
            "change:currentLanguage": function () {
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
     * Renders the Tool SelectFeatures to be displayed.
     *
     * @param {Backbone.Model} model of the Tool SelectFeatures.
     * @param {Boolean} isActive Status of the Tool SelectFeatures.
     * @returns {Backbone.View} SelectFeaturesView
     */
    render: function (model, isActive) {
        if (isActive && this.model.get("renderToWindow")) {
            // TODO: Die Logik aus dem Template sollte hierher geschmissen werden
            // TODO: Anständige Implementierung der Auflistung der Ergebnisse in einer Tabelle
            this.setElement(document.getElementsByClassName("win-body")[0]);
            this.$el.html(this.template(model.toJSON()));
            this.delegateEvents(); // What does this do?
        }
        else {
            this.model.clearFeatures();
            this.undelegateEvents(); // What does this do?
        }
        return this;
    }
});

export default SelectFeaturesView;
