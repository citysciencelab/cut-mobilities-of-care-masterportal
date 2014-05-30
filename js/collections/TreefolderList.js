define([
    'underscore',
    'backbone',
    'models/TreeFolder',
    'collections/LayerList',
    'config'
], function (_, Backbone, TreeFolder, LayerList) {

    var TreefolderList = Backbone.Collection.extend({
        //model: TreeFolder,
        initialize: function () {
            var attr = _.uniq(LayerList.pluck('treeFolder'));
            _.each(attr, this.addOne, this);
        },
        addOne: function (folderName) {
            var attr = LayerList.where({treeFolder: folderName});
            _.each(attr, this.addOne2, this);
            console.log(attr);
            //var bool = LayerList.where({visibility: true});
            //console.log(bool);
            var treeFolder = new TreeFolder({
                name: folderName,
                isExpanded: false,
                isChecked: false
            });
            this.add(treeFolder);
        },
        addOne2: function (element) {
            console.log(element);
        }
    });
    return new TreefolderList();
});