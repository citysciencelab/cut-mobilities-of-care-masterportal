const TableNavModel = Backbone.Model.extend({
    defaults: {
        isActiveElement: ""
    },

    initialize: function () {
        var channel = Radio.channel("TableMenu");

        channel.reply({
            "getActiveElement": function () {
                return this.get("isActiveElement");
            },
            "setActiveElement": this.setActiveElement
        }, this);

        channel.on({
            "hideCurrentElement": this.hideCurrentElement
        }, this);
    },

    setActiveElement: function (element) {
        var channel = Radio.channel("TableMenu");

        if (this.get("isActiveElement") !== element) {
            channel.trigger("hideMenuElement" + this.get("isActiveElement"));
        }
        this.setIsActiveElement(element);
        $("#closeclick-view").removeClass("closeclick-deactivated");
        $("#closeclick-view").addClass("closeclick-activated");
    },

    setIsActiveElement: function (value) {
        this.set("isActiveElement", value);
    },

    hideCurrentElement: function () {
        Radio.trigger("TableMenu", "hideMenuElement" + this.get("isActiveElement"));
        $("#closeclick-view").removeClass("closeclick-activated");
        $("#closeclick-view").addClass("closeclick-deactivated");
    }
});

export default TableNavModel;
