define([
    "backbone",
    "text!modules/tree/catalogBaseLayer/template.html",
    "eventbus"
], function (Backbone, NodeLayerTemplate, EventBus) {

        var NodeLayerView = Backbone.View.extend({
            className: "list-group-item base-layer",
            tagName: "li",
            template: _.template(NodeLayerTemplate),
            events: {
                "click .glyphicon-info-sign": "getMetadata",
                "click .glyphicon-check, .glyphicon-unchecked, .layer-name": "toggleSelected"
            },
            initialize: function () {
                this.$el.append(this.templateButton);
            },
            render: function () {
                var attr = this.model.toJSON();

                this.stopListening();
                // this.listenTo(this.model, "change:isInScaleRange", this.toggleStyle);
                this.listenToOnce(this.model, "change:selected", this.render);
                // this.listenToOnce(this.model, "change:visibility", this.toggleStyle);
                this.listenToOnce(this.model, "change:selected", this.toggleStyle);
                this.delegateEvents();
                this.$el.html(this.template(attr));
                this.toggleStyle();
                return this;
            },
            toggleSelected: function () {
                this.model.toggleSelected();
            },
            getMetadata: function () {
                this.model.openMetadata();
            },
            toggleStyle: function () {
                if (this.model.get("visibility") === true) {
                    this.model.set("selected", true);
                }
                if (this.model.get("selected") === true) {
                    this.$el.css("color", "rgb(255, 127, 0)");
                    EventBus.trigger("addModelToSelectionList", this.model);
                }
                else {
                    this.$el.css("color", "rgb(85, 85, 85)");
                }
            }
        });

        return NodeLayerView;
    });
