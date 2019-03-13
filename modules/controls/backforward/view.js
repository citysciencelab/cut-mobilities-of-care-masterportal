import BackForwardTemplate from "text-loader!./template.html";
import BackForwardModel from "./model";

const BackForwardView = Backbone.View.extend({
    events: {
        "click .forward": "setNextView",
        "click .backward": "setLastView"
    },
    initialize: function () {
        var channel = Radio.channel("BackForwardView");

        this.model = new BackForwardModel();

        channel.reply({
            "getView": this
        }, this);

        Radio.trigger("Map", "registerListener", "moveend", this.updatePermalink.bind(this));
        this.render();
    },
    template: _.template(BackForwardTemplate),
    id: "backforward",

    updatePermalink: function () {
        var forButton = document.getElementsByClassName("forward glyphicon glyphicon-step-forward")[0],
            backButton = document.getElementsByClassName("backward glyphicon glyphicon-step-backward")[0],
            centerScales = this.model.get("CenterScales"),
            currentPos = this.model.get("currentPos"),
            that = this,
            scale,
            center;

        if (centerScales.length === 0) {
            $(backButton).css("pointer-events", "none");
            $(forButton).css("pointer-events", "none");

            setTimeout(function () {
                scale = Radio.request("MapView", "getOptions").scale;
                center = Radio.request("MapView", "getCenter");
                centerScales.push([center, scale]);
            }, 100);
            this.model.setCenterScales(centerScales);
        }
        else if (centerScales.length > 0 && this.model.get("wentFor") === false) {
            $(backButton).css("pointer-events", "auto");
            $(forButton).css("pointer-events", "none");

            setTimeout(function () {
                if (currentPos < centerScales.length - 1) {
                    centerScales.splice(currentPos + 1);
                    that.model.setCurrentPos(currentPos);
                }
                else if (centerScales.length === 10) {
                    centerScales.shift(centerScales[0]);
                    that.model.setCurrentPos(currentPos - 1);
                }
                scale = Radio.request("MapView", "getOptions").scale;
                center = Radio.request("MapView", "getCenter");
                centerScales.push([center, scale]);
                that.model.setCurrentPos(that.model.get("currentPos") + 1);
            }, 100);
            this.model.setCenterScales(centerScales);
        }
        this.model.setWentFor(false);
    },
    render: function () {
        this.$el.html(this.template());
        return this;
    },
    setNextView: function () {
        var forButton = document.getElementsByClassName("forward glyphicon glyphicon-step-forward")[0],
            backButton = document.getElementsByClassName("backward glyphicon glyphicon-step-backward")[0],
            centerScales = this.model.get("CenterScales");

        this.model.setWentFor(true);
        $(backButton).css("pointer-events", "auto");
        this.model.setCurrentPos(this.model.get("currentPos") + 1);
        Radio.trigger("MapView", "setScale", centerScales[this.model.get("currentPos")][1]);
        Radio.trigger("MapView", "setCenter", centerScales[this.model.get("currentPos")][0]);
        if (this.model.get("currentPos") === centerScales.length - 1) {
            $(forButton).css("pointer-events", "none");
        }
    },
    setLastView: function () {
        var backButton = document.getElementsByClassName("backward glyphicon glyphicon-step-backward")[0],
            forButton = document.getElementsByClassName("forward glyphicon glyphicon-step-forward")[0],
            centerScales = this.model.get("CenterScales");

        this.model.setWentFor(true);
        $(forButton).css("pointer-events", "auto");
        this.model.setCurrentPos(this.model.get("currentPos") - 1);
        Radio.trigger("MapView", "setScale", centerScales[this.model.get("currentPos")][1]);
        Radio.trigger("MapView", "setCenter", centerScales[this.model.get("currentPos")][0]);
        if (this.model.get("currentPos") === 0) {
            $(backButton).css("pointer-events", "none");
        }
    }
});

export default BackForwardView;
