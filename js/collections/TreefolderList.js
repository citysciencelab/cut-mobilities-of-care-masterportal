define([
    'underscore',
    'backbone',
    'models/TreeFolder',
    'collections/LayerList',
    'config'
], function (_, Backbone, TreeFolder, LayerList) {

    var TreefolderList = Backbone.Collection.extend({
        initialize: function () {
            var attr = _.uniq(LayerList.pluck('treeFolder'));
            _.each(attr, this.addModel, this);
        },
        addModel: function (element) {
            var attr, treeFolder, bool, folderName;
            folderName = element;
            attr = LayerList.where({treeFolder: folderName});
            bool = _.every(attr, function (element) {
                return element.get('visibility') === true;
            });
            treeFolder = new TreeFolder({
                'name': folderName,
                'isExpanded': false,
                'isChecked': bool,
                'layerList': attr
            });
            this.add(treeFolder);
        }
    });
    return new TreefolderList();
});