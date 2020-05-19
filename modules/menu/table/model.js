const TableNavModel = Backbone.Model.extend({
    defaults: {
        isActiveElement: "",
        rotateAngle: 0
    },

    initialize: function () {
        const channel = Radio.channel("TableMenu");

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
        const channel = Radio.channel("TableMenu");

        if (this.get("isActiveElement") !== element) {
            channel.trigger("hideMenuElement" + this.get("isActiveElement"));
        }
        this.set("isActiveElement", element);
        $("#closeclick-view").removeClass("closeclick-deactivated");
        $("#closeclick-view").addClass("closeclick-activated");
    },
    appendFilterContent: function (element) {
        this.trigger("appendFilterContent", element);
        this.setIsActiveElement(element);
    },

    setIsActiveElement: function (value) {
        this.set("isActiveElement", value);
    },

    hideCurrentElement: function () {
        Radio.trigger("TableMenu", "hideMenuElement" + this.get("isActiveElement"));
        this.deactivateCloseClickFrame();
    },
    setRotateAngle (value) {
        this.set("rotateAngle", value);
    },
    getRotateAngle () {
        return this.get("rotateAngle");
    },
    deactivateCloseClickFrame: function () {
        $("#closeclick-view").removeClass("closeclick-activated");
        $("#closeclick-view").addClass("closeclick-deactivated");
    }
});

export default TableNavModel;
