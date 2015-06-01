define (["require"], function (require) {

     var Util = {

         // interpretiere Pfade relativ von requirejs baseurl, es sei denn, er beginnt mit einem '/'
         getPath: function (path) {
             var baseUrl = require.toUrl("").split("?")[0];

             if (path.indexOf("/") === 0) {
                 baseUrl = "";
             }
             return baseUrl + path;
         }
     };

     return Util;
});
