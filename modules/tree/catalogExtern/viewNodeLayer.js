define([
    "backbone",
    "text!modules/tree/catalogExtern/templateNodeLayer.html"
    ], function (Backbone, NodeLayerTemplate) {

        var NodeLayerView = Backbone.View.extend({
            className: "list-group-item node-layer",
            tagName: "li",
            template: _.template(NodeLayerTemplate),
            events: {
                "click .glyphicon-info-sign": "getMetadata",
                "click .glyphicon-check, .glyphicon-unchecked, .layer-name": "toggleSelected"
            },
            initialize: function () {
                this.$el.append(this.templateButton);

                if (this.model.get("visibility") === true) {
                    this.toggleSelected();
                }
            },
            render: function () {
                var attr = this.model.toJSON();

                this.stopListening();
                this.listenTo(this.model, "change:isInScaleRange", this.toggleStyle);
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
                window.open(this.model.get("metaURL"));
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

        return NodeLayerView;
    });
