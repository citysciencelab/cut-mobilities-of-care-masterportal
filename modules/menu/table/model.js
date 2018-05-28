define(function () {
    var channel = Radio.channel("TableMenu"),
        TableNavModel = Backbone.Model.extend({
            defaults: {
                isActiveElement: ""
            },
            initialize: function () {
                channel.reply({
                    "getActiveElement": this.getActiveElement,
                    "setActiveElement": this.setActiveElement
                }, this);
            },

            setActiveElement: function (element) {
                if (this.get("isActiveElement") !== element) {
                    channel.trigger("hideMenuElement" + this.getActiveElement());
                }
                this.set("isActiveElement", element);
            },
            getActiveElement: function () {
                return this.get("isActiveElement");
            }
        });

    return TableNavModel;
});
