define(function () {
    var channel = Radio.channel("TableMenu"),
        TableNavModel = Backbone.Model.extend({
            defaults: {
                isActiveElement: ""
            },
            initialize: function () {
                channel.reply({
                    "getActiveElement": function () {
                        return this.get("isActiveElement");
                    },
                    "setActiveElement": this.setActiveElement
                }, this);
            },

            setActiveElement: function (element) {
                if (this.get("isActiveElement") !== element) {
                    channel.trigger("hideMenuElement" + this.get("isActiveElement"));
                }
                this.set("isActiveElement", element);
            }
        });

    return TableNavModel;
});
