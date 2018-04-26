define(function (require) {

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        Einwohnerabfrage;

    Einwohnerabfrage = Backbone.Model.extend({
        defaults: {
            isCollapsed: undefined,
            isCurrentWin: undefined,
            einwohnerabfrageLayer: undefined
        },
        initialize: function () {
            this.listenTo(Radio.channel("Window"), {
                "winParams": this.setStatus
            });
        },
        setStatus: function (args) {
            if (args[2].getId() === "einwohnerabfrage") {
                this.set("isCollapsed", args[1]);
                this.set("isCurrentWin", args[0]);
            }
            else {
                this.set("isCurrentWin", false);
            }
        }
    });

    return Einwohnerabfrage;
});
