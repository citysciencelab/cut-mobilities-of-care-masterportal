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
        this.listenTo(channel, {
            "appendFilter": this.appendFilterContent
        });

        channel.on({
            "hideCurrentElement": this.hideCurrentElement,
            "deactivateCloseClickFrame": this.deactivateCloseClickFrame
        }, this);
    },

    setActiveElement: function (element) {
        var channel = Radio.channel("TableMenu");

        if (this.get("isActiveElement") !== element) {
            channel.trigger("hideMenuElement" + this.get("isActiveElement"));
        }
        this.set("isActiveElement", element);
    },
    appendFilterContent: function (element) {
        this.trigger("appendFilterContent", element);
        this.setIsActiveElement(element);
        $("#closeclick-view").removeClass("closeclick-deactivated");
        $("#closeclick-view").addClass("closeclick-activated");
    },

    setIsActiveElement: function (value) {
        this.set("isActiveElement", value);
    },

    hideCurrentElement: function () {
        Radio.trigger("TableMenu", "hideMenuElement" + this.get("isActiveElement"));
        this.deactivateCloseClickFrame();
    },

    deactivateCloseClickFrame: function () {
        $("#closeclick-view").removeClass("closeclick-activated");
        $("#closeclick-view").addClass("closeclick-deactivated");
    }
});

export default TableNavModel;
