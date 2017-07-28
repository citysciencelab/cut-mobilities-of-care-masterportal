validateFilename: function (filename) {
                if (_.isUndefined(filename) || _.isNull(filename)) {
                    return false;
                }
                filename.trim();
                var result = filename.match(/^[0-9a-zA-Z ]+(\.[0-9a-zA-Z]+)?$/);

                if (_.isUndefined(result) && _.isNull(result)) {
                    Radio.trigger("Alert", "alert", "Bitte geben Sie einen gültigen Dateinamen ein! (Erlaubt sind Klein-,Großbuchstaben und Zahlen.)");
                }
                return !_.isUndefined(result) && !_.isNull(result) ;
             },