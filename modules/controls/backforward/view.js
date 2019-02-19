import BackForwardModel from "./model";
import BackForwardTemplate from "text-loader!./template.html";
var BackforwardModel,
    CenterScales = [],
    wentForBack = false;

const BackForwardView = Backbone.View.extend({
    events: {
        "click .forward": "setNextView",
        "click .backward": "setLastView"
    },
    initialize: function () {
        var channel = Radio.channel("BackForwardView");

        this.model = new BackForwardModel();
        BackforwardModel = this.model;
        channel.on({
            "setUpdate": this.setUpdate
        }, this);
        channel.reply({
            "isUpdate": this.isUpdate
        }, this);

        Radio.trigger("Map", "registerListener", "moveend", this.updatePermalink);
        this.render();
    },
    template: _.template(BackForwardTemplate),
    id: "backforward",

    setUpdate: function (bool) {
        this.model.setUpdate(bool);
    },
    isUpdate: function () {
        return this.model.isUpdate();
    },
    updatePermalink: function (evt) {
        var forButton = document.getElementsByClassName("forward glyphicon glyphicon-step-forward")[0],
            backButton = document.getElementsByClassName("backward glyphicon glyphicon-step-backward")[0],
            scale,
            center;

        if (wentForBack === false) {
            $(backButton).css("pointer-events", "auto");
            $(forButton).css("pointer-events", "none");

            setTimeout(function () {
                if (CenterScales.length === 10) {
                    CenterScales.shift(CenterScales[0]);
                }
                scale = Radio.request("MapView", "getOptions").scale;
                center = Radio.request("MapView", "getCenter");
                CenterScales.push([center, scale]);
            }, 100);
        }
        wentForBack = false;

        if (!Radio.request("BackForwardView", "isUpdate")) {
            // do not update the URL when the view was changed in the 'popstate' handler
            Radio.trigger("BackForwardView", "setUpdate", true);
            return;
        }
        BackforwardModel.pushState(evt.map.getView());
    },
    render: function () {
        this.$el.html(this.template());

        return this;
    },
    setNextView: function () {
        var scale = Radio.request("MapView", "getOptions").scale,
            center = Radio.request("MapView", "getCenter"),
            forButton = document.getElementsByClassName("forward glyphicon glyphicon-step-forward")[0],
            backButton = document.getElementsByClassName("backward glyphicon glyphicon-step-backward")[0],
            i;

        wentForBack = true;

        $(backButton).css("pointer-events", "auto");

        for (i = 0; i <= CenterScales.length; i++) {
            if (CenterScales[i][0] === center && CenterScales[i][1] === scale) {
                Radio.trigger("MapView", "setScale", CenterScales[i + 1][1]);
                Radio.trigger("MapView", "setCenter", CenterScales[i + 1][0]);
                if (i + 1 === CenterScales.length - 1) {
                    $(forButton).css("pointer-events", "none");
                    break;
                }
                break;
            }
        }
    },
    setLastView: function () {

        var scale = Radio.request("MapView", "getOptions").scale,
            center = Radio.request("MapView", "getCenter"),
            backButton = document.getElementsByClassName("backward glyphicon glyphicon-step-backward")[0],
            forButton = document.getElementsByClassName("forward glyphicon glyphicon-step-forward")[0],
            i;

        wentForBack = true;
        $(forButton).css("pointer-events", "auto");

        for (i = CenterScales.length - 1; i >= 0; i--) {
            if (CenterScales[i][0] === center && CenterScales[i][1] === scale) {
                Radio.trigger("MapView", "setScale", CenterScales[i - 1][1]);
                Radio.trigger("MapView", "setCenter", CenterScales[i - 1][0]);
                if (i - 1 === 0) {
                    $(backButton).css("pointer-events", "none");
                }
                break;
            }
        }
    }
});

export default BackForwardView;
