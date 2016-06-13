define("app", ["jquery", "modules/restReader/collection"], function ($, RestReaderList) {
    "use strict";
    new RestReaderList;
    require(["idaModules/seite1/view"]);

});
