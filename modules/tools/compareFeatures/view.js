define(function (require) {

    var CompareFeaturesModel = require("modules/tools/compareFeatures/model"),
        CompareFeaturesTemplateError = require("text!modules/tools/compareFeatures/templateError.html"),
        CompareFeaturesTemplateList = require("text!modules/tools/compareFeatures/templateList.html"),
        CompareFeaturesView;

    require("bootstrap/modal");

    CompareFeaturesView = Backbone.View.extend({
        className: "modal fade",
        model: new CompareFeaturesModel(),
        templateError: _.template(CompareFeaturesTemplateError),
        templateList: _.template(CompareFeaturesTemplateList),
        events: {
            "hidden.bs.modal": "setIsActivatedToFalse"
        },
        initialize: function () {
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
        },

        setIsActivatedToFalse: function () {
            this.model.setIsActivated(false);
            Radio.trigger("ModelList", "setModelAttributesById", "compareFeatures", {isActive: false});
        }
    });

    return CompareFeaturesView;
});
