import BackForwardTemplate from "text-loader!./template.html";

const BackForwardView = Backbone.View.extend({
    events: {
        "click .forward": "setNextView",
        "click .backward": "setLastView"
    },
    initialize: function () {
        var channel = Radio.channel("BackForwardView");

        channel.on({
            "setUpdate": this.setUpdate
        }, this);
        channel.reply({
            "isUpdate": this.isUpdate
        }, this);
        channel.reply({
            "getView": this
        }, this);

        Radio.trigger("Map", "registerListener", "moveend", this.updatePermalink);
        this.render();
    },
    template: _.template(BackForwardTemplate),
    id: "backforward",
    CenterScales: [],
    wentFor: false,
    update: true,
    currentPos: 0,

    setUpdate: function (bool) {
        this.update = bool;
    },
    isUpdate: function () {
        return this.update;
    },
    updatePermalink: function () {
        var forButton = document.getElementsByClassName("forward glyphicon glyphicon-step-forward")[0],
            backButton = document.getElementsByClassName("backward glyphicon glyphicon-step-backward")[0],
            View = Radio.request("BackForwardView", "getView"),
            scale,
            center;

        if (View.CenterScales.length === 0) {
            $(backButton).css("pointer-events", "none");
            $(forButton).css("pointer-events", "none");

            setTimeout(function () {
                scale = Radio.request("MapView", "getOptions").scale;
                center = Radio.request("MapView", "getCenter");
                View.CenterScales.push([center, scale]);
            }, 100);
        }
        if (View.CenterScales.length > 0 && View.wentFor === false) {
            $(backButton).css("pointer-events", "auto");
            $(forButton).css("pointer-events", "none");

            setTimeout(function () {
                if (View.currentPos < View.CenterScales.length - 1) {
                    View.CenterScales.splice(View.currentPos + 1);
                }
                if (View.CenterScales.length === 10) {
                    View.CenterScales.shift(View.CenterScales[0]);
                    View.currentPos = View.currentPos - 1;
                }
                scale = Radio.request("MapView", "getOptions").scale;
                center = Radio.request("MapView", "getCenter");
                View.CenterScales.push([center, scale]);
                View.currentPos = View.currentPos + 1;
            }, 100);

        }
        View.wentFor = false;

        if (!Radio.request("BackForwardView", "isUpdate")) {
            // do not update the URL when the view was changed in the 'popstate' handler
            Radio.trigger("BackForwardView", "setUpdate", true);
        }
    },
    render: function () {
        this.$el.html(this.template());

        return this;
    },
    setNextView: function () {
        var forButton = document.getElementsByClassName("forward glyphicon glyphicon-step-forward")[0],
            backButton = document.getElementsByClassName("backward glyphicon glyphicon-step-backward")[0];

        this.wentFor = true;
        $(backButton).css("pointer-events", "auto");

        this.currentPos = this.currentPos + 1;

        Radio.trigger("MapView", "setScale", this.CenterScales[this.currentPos][1]);
        Radio.trigger("MapView", "setCenter", this.CenterScales[this.currentPos][0]);
        if (this.currentPos === this.CenterScales.length - 1) {
            $(forButton).css("pointer-events", "none");
        }
    },
    setLastView: function () {
        var backButton = document.getElementsByClassName("backward glyphicon glyphicon-step-backward")[0],
            forButton = document.getElementsByClassName("forward glyphicon glyphicon-step-forward")[0];

        this.wentFor = true;

        $(forButton).css("pointer-events", "auto");

        this.currentPos = this.currentPos - 1;
        Radio.trigger("MapView", "setScale", this.CenterScales[this.currentPos][1]);
        Radio.trigger("MapView", "setCenter", this.CenterScales[this.currentPos][0]);
        if (this.currentPos === 0) {
            $(backButton).css("pointer-events", "none");
        }
    }
});

export default BackForwardView;
