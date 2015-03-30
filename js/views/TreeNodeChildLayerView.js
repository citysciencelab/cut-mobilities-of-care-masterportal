define([
    "jquery",
    "underscore",
    "backbone",
    "text!templates/TreeNodeChildLayer.html"
    ], function ($, _, Backbone, TreeNodeChildLayerTemplate) {

        var TreeNodeChildLayerView = Backbone.View.extend({
            className : "list-group-item node-child-layer",
            tagName: "li",
            template: _.template(TreeNodeChildLayerTemplate),
            events: {
                "click .glyphicon-info-sign": "getMetadata",
                "click .glyphicon-check, .glyphicon-unchecked, .layer-name": "toggleSelected"
            },
            initialize: function () {
                this.$el.append(this.templateButton);
            },
            render: function () {
                this.stopListening();
                this.listenTo(this.model, "change:isInScaleRange", this.toggleStyle);
                this.listenToOnce(this.model, "change:selected", this.render);
                this.listenToOnce(this.model, "change:selected", this.toggleStyle);

                this.delegateEvents();

                var attr = this.model.toJSON();
                this.$el.html(this.template(attr));
                this.toggleStyle();
                return this;
            },
            toggleVisibility: function () {
                this.model.toggleVisibility();
            },
            toggleSelected: function () {
                this.model.toggleSelected();
            },
            getMetadata: function () {
                if (this.model.get("url").search("geodienste") !== -1) {
                    window.open("http://metaver.de/trefferanzeige?docuuid=" + this.model.get("metaID"), "_blank");
                }
                else {
                    window.open("http://hmdk.fhhnet.stadt.hamburg.de/trefferanzeige?docuuid=" + this.model.get("metaID"), "_blank");
                }
            },
            toggleStyle: function () {
                if (this.model.get("selected") === true) {
                    this.$el.css("color", "#fc8d62");
                }
                else {
                    this.$el.css("color", "rgb(150, 150, 150)");
                }
                this.model.get("parentView").toggleStyle();
            }
        });

        return TreeNodeChildLayerView;
    });
