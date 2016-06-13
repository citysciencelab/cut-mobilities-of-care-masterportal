define("app", ["jquery", "backbone.radio", "modules/restReader/collection"], function ($, Radio, RestReaderList) {
    "use strict";
    var channel = Radio.channel("RestReader");

    channel.on({
        "isReady": function () {
            require(["idaModules/seite1/view"]);
        }
    }, this);
});
