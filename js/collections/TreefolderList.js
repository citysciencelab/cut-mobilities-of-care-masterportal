define([
    'underscore',
    'backbone',
    'models/TreeFolder',
    'collections/WMSLayerList',
    'config'
], function (_, Backbone, TreeFolder, WMSLayerList) {

    var TreefolderList = Backbone.Collection.extend({
        initialize: function () {
            var attr = _.uniq(_.flatten(WMSLayerList.pluck('kategorieOpendata')));
            _.each(attr, this.addModel, this);
        },
        addModel: function (element) {
            var attr = [], treeFolder, bool;
//            console.log(WMSLayerList);

            WMSLayerList.forEach(function (model) {
//                console.log(model.get('kategorieOpendata'));
                _.each(model.get('kategorieOpendata'), function (kat) {
                    if(kat === element) {
                        attr.push(model);
                    }
                });
            });
            console.log(attr);
//            attr = WMSLayerList.where({treeFolder: folderName});
            bool = _.every(attr, function (element) {
                return element.get('visibility') === true;
            });
            treeFolder = new TreeFolder({
                'name': element,
                'isExpanded': false,
                'isChecked': true,
                'WMSLayerList': attr
            });
            this.add(treeFolder);
        }
    });
    return new TreefolderList();
});
