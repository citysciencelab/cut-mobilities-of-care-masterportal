define(function (require) {

    var CompareFeaturesModel = require("modules/tools/compareFeatures/model"),
        CompareFeaturesTemplateError = require("text!modules/tools/compareFeatures/templateError.html"),
        CompareFeaturesTemplateList = require("text!modules/tools/compareFeatures/templateList.html"),
        CompareFeaturesView;

    require("bootstrap/modal");

    CompareFeaturesView = Backbone.View.extend({
        className: "modal fade",

        events: {
            "hidden.bs.modal": "setIsActivatedToFalse"
        },

        initialize: function () {
            this.model = new CompareFeaturesModel();
            this.templateError = _.template(CompareFeaturesTemplateError);
            this.templateList = _.template(CompareFeaturesTemplateList);

            this.listenTo(this.model, {
                "change:isActivated": this.render
            });
            document.getElementsByClassName("lgv-container")[0].appendChild(this.el);
        },

        /**
         * @param {Backbone.Model} model - CompareFeaturesModel
         * @param {boolean} value - isActivated
         * @returns {void}
         */
        render: function (model, value) {
            if (value) {
                if (model.get("featureList").length === 0) {
                    this.$el.html(this.templateError());
                }
                else {
                    this.$el.html(this.templateList());
                }
                this.$el.modal("show");
            }
            else {
                this.$el.empty();
            }
            return this;
        },

        setIsActivatedToFalse: function () {
            this.model.setIsActivated(false);
            Radio.trigger("ModelList", "setModelAttributesById", "compareFeatures", {isActive: false});
        }
    });

    return CompareFeaturesView;
});
