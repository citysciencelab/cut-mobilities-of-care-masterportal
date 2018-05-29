define("app", [
    "jquery",
    "backbone.radio",
    "modules/core/util",
    "modules/restReader/collection",
    "idaModules/wps/model",
    "idaModules/dbLogger/model",
    "modules/alerting/view"],

function ($, Radio, Util, RestReaderList, WPSModel, DbLoggerModel) {
    var channel = Radio.channel("RestReader");

    channel.on({
        "isReady": function () {
            require(["idaModules/info/view", "idaModules/0_checkURL/model"], function (ContactView) {
                new ContactView();
            });
        }
    }, this);

    new Util();
    new RestReaderList();
    new WPSModel();
    new DbLoggerModel();

});
