define([
    "backbone",
    "text!modules/tree/catalogLayer/templateNodeChildLayer.html"
    ], function (Backbone, NodeChildLayerTemplate) {

        var NodeChildLayerView = Backbone.View.extend({
            className: "list-group-item node-child-layer",
            tagName: "li",
            template: _.template(NodeChildLayerTemplate),
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
                this.model.openMetadata();
            },
            toggleStyle: function () {
                if (this.model.get("selected") === true) {
                    this.$el.css("color", "rgb(255, 127, 0)");
                }
                else {
                    this.$el.css("color", "rgb(85, 85, 85)");
                }
                this.model.get("parentView").toggleStyle();
            }
        });

        return NodeChildLayerView;
    });
