define([
    'underscore',
    'backbone',
    'models/TreeNode',
    'config'
    ], function (_, Backbone, TreeNode, Config) {

        var TreeList = Backbone.Collection.extend({
            "url": "../../category.json",
            "model": TreeNode,
            "initialize": function () {
                this.fetch({
                    cache: false,
                    async: false,
                    error: function () {
                        alert('Fehler beim Parsen ');
                    }
                });
            },
            "parse": function (response) {
                switch (Config.tree.orderBy) {
                    case "opendata":
                        return response.opendata;
                    }
            },
            "moveNodeUp": function (model) {
                var index = this.indexOf(model);
                if (index > 0) {
                    this.remove(model, {silent: true});
                    this.add(model, {at: index - 1});
                }
            },
            "moveNodeDown": function (model) {
                var index = this.indexOf(model);
                if (index < this.models.length) {
                    this.remove(model, {silent: true});
                    this.add(model, {at: index + 1});
                }
            }
        });

        return new TreeList();
    });
