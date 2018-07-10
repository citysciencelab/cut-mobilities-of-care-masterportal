define(function (require) {

    var CompareFeaturesModel = require("modules/tools/compareFeatures/model"),
        CompareFeaturesTemplateFeedback = require("text!modules/tools/compareFeatures/templateFeedback.html"),
        CompareFeaturesTemplateNoFeatures = require("text!modules/tools/compareFeatures/templateNoFeatures.html"),
        CompareFeaturesTemplate = require("text!modules/tools/compareFeatures/template.html"),
        CompareFeaturesView;

    require("bootstrap/modal");

    CompareFeaturesView = Backbone.View.extend({
        className: "compare-feature-modal modal fade",
        events: {
            // is fired when the modal has finished being hidden
            "hidden.bs.modal": "setIsActivatedToFalse",
            "click .btn-open-list": "setIsActivatedToTrue",
            "click .btn-infos": "toggleRows",
            "click .btn-print": "preparePrint",
            "click table .glyphicon-remove": "removeFeatureFromList",
            "change select": function (evt) {
                this.model.setLayerId(evt.target.value);
                this.renderListModal(this.model);
            }
        },

        initialize: function (attr) {
            this.model = new CompareFeaturesModel(attr);
            this.template = _.template(CompareFeaturesTemplate);
            this.templateNoFeatures = _.template(CompareFeaturesTemplateNoFeatures);
            this.templateFeedback = _.template(CompareFeaturesTemplateFeedback);

            this.listenTo(this.model, {
                "change:isActivated": this.render,
                "renderFeedbackModal": this.renderFeedbackModal
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
                    this.renderErrorModal();
                }
                else {
                    this.renderListModal(model);
                }
                this.$el.modal("show");
            }
            else {
                this.$el.empty();
            }
            return this;
        },

        /**
         * @param {Backbone.Model} model - this.model
         * @returns {void}
         */
        renderListModal: function (model) {
            var layerModel = Radio.request("ModelList", "getModelByAttributes", {id: model.get("layerId")}),
                themeConfig = Radio.request("Schulinfo", "getThemeConfig"),
                attr = {
                    list: model.prepareFeatureListToShow(layerModel.get("gfiAttributes"), themeConfig),
                    rowsToShow: model.get("numberOfAttributesToShow"),
                    featureIds: model.getFeatureIds(model.get("groupedFeatureList"), model.get("layerId")),
                    layerSelection: model.getLayerSelection(model.get("groupedFeatureList"))
                };

            this.$el.html(this.template(attr));
        },

        /**
         * @param {ol.feature} feature -
         * @returns {void}
         */
        renderFeedbackModal: function (feature) {
            this.$el.html(this.templateFeedback({feature: feature}));
            this.$el.modal("show");
        },

        /**
         * @returns {void}
         */
        renderErrorModal: function () {
            var comparableLayerModels = Radio.request("ModelList", "getModelsByAttributes", {isComparable: true}),
                displayText = "Objekte";

            if (comparableLayerModels.length > 0 && comparableLayerModels.length < 2) {
                displayText = comparableLayerModels[0].get("name");
            }
            this.$el.html(this.templateNoFeatures({text: displayText}));
        },

        /**
         * removes the clicked column from the table
         * and finds the feature to be removed
         * @param {MouseEvent} evt - click event
         * @returns {void}
         */
        removeFeatureFromList: function (evt) {
            var featureToRemoved = _.find(this.model.get("featureList"), function (feature) {
                return feature.getId() === evt.target.id;
            });

            this.$el.find("." + evt.target.classList[0]).remove();
            this.model.removeFeatureFromList(featureToRemoved);
            if (this.model.get("featureList").length === 0) {
                this.renderErrorModal();
            }
        },
        preparePrint: function () {
            var layerModel = Radio.request("ModelList", "getModelByAttributes", {id: this.model.get("layerId")}),
                themeConfig = Radio.request("Schulinfo", "getThemeConfig"),
                features = this.model.prepareFeatureListToShow(layerModel.get("gfiAttributes"), themeConfig),
                rowsToShow = this.$el.find("tr:visible").length,
                tableBody = this.prepareTableBody(features, rowsToShow),
                rowWidth = this.calculateRowWidth(tableBody[0], 30),
                title = "Vergleichsliste - Schulen",
                pdfDef = {
                    pageSize: "A4",
                    pageOrientation: "portrait",
                    content: [
                        {
                            table: {
                                headerRows: 1,
                                widths: rowWidth,
                                body: tableBody
                            },
                            layout: {
                                hLineWidth: function (i, node) {
                                    return i === 0 || i === node.table.body.length ? 2 : 1;
                                },
                                vLineWidth: function (i, node) {
                                    return i === 0 || i === node.table.widths.length ? 2 : 1;
                                },
                                fillColor: function (i) {
                                    return i % 2 === 0 ? "#eeeeee" : "#dddddd";
                                }
                            }
                        }
                    ]
                };

            Radio.trigger("BrowserPrint", "print", "Vergleichsliste_Schulen", pdfDef, title, "download");
        },

        prepareTableBody: function (features, rowsToShow) {
            var tableBody = [];

            _.each(features, function (rowFeature, rowIndex) {
                var row = [];

                if (rowIndex < rowsToShow) {
                    _.each(rowFeature, function (val) {
                        if (_.isUndefined(val)) {
                            row.push("");
                        }
                        // header cells get extra styling
                        else if (rowIndex === 0) {
                            row.push({
                                text: String(val),
                                style: "bold"
                            });
                        }
                        else if (_.isArray(val)) {
                            row.push(String(val).replace(/,/g, ",\n"));
                        }
                        else {
                            row.push(String(val));
                        }
                    });
                    tableBody.push(row);
                }
            });
            tableBody[0][0] = {
                text: ""
            };
            return tableBody;
        },
        calculateRowWidth: function (firstRow, firstRowWidth) {
            var numDataRows = firstRow.length - 1,
                rowWidth = [String(firstRowWidth) + "%"],
                dataRowsWidth = 100 - firstRowWidth,
                dataRowWidth = String(dataRowsWidth / numDataRows) + "%";

            _.each(firstRow, function (row, index) {
                if (index > 0) {
                    rowWidth.push(dataRowWidth);
                }
            });
            return rowWidth;
        },
        /**
         * shows or hides the rows wiht the class toggle-row
         * and sets the button text
         * @param {MouseEvent} evt - click event
         * @returns {void}
         */
        toggleRows: function (evt) {
            var text = "mehr Infos";

            this.$el.find(".toggle-row").toggle();
            if (evt.target.textContent === "mehr Infos") {
                text = "weniger Infos";
            }
            evt.target.textContent = text;
        },

        /**
         * @returns {void}
         */
        setIsActivatedToFalse: function () {
            this.model.setIsActivated(false);
            Radio.trigger("ModelList", "setModelAttributesById", "compareFeatures", {isActive: false});
        },

        /**
         * @returns {void}
         */
        setIsActivatedToTrue: function () {
            this.model.setIsActivated(true);
            Radio.trigger("ModelList", "setModelAttributesById", "compareFeatures", {isActive: true});
        }
    });

    return CompareFeaturesView;
});
