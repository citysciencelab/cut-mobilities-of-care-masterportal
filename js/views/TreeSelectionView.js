define([
    "underscore",
    "backbone",
    "models/TreeSelection",
    "text!templates/TreeSelection.html"
], function (_, Backbone, TreeSelection, TreeSelectionTemplate) {

        var TreeSelectionView = Backbone.View.extend({
            model: new TreeSelection(),
            el: ".treeSelectionForm",
            template: _.template(TreeSelectionTemplate),
            events: {
                "change select": "setSelection",
                "click .selectionLabel, .selectionFormButton": "toggleTree"
            },
            initialize: function () {
                this.render();
            },
            render: function () {
                var attr = this.model.toJSON();
                this.$el.html(this.template(attr));
            },
            setSelection: function (evt) {
                this.model.setSelection(evt.target.value);
            },
            toggleTree: function () {
                $("#tree").toggle("slow");
                $(".selectionFormButton").toggleClass("glyphicon-triangle-bottom");
                $(".selectionFormButton").toggleClass("glyphicon-triangle-right");
            }
        });

        return TreeSelectionView;
    });
