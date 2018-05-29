define(function (require) {

    var Backbone = require("backbone"),
        Model = require("model"),
        List;

    List = Backbone.Collection.extend({
        url: "test_params.json",
        model: Model,
        counter: 1,
        initialize: function () {
            this.fetch({
                async: false
            });
        },

        /**
         * Iteriert über die Models und schickt den Request ab
         */
        runAllTests: function () {
            this.resetProgressBar();
            $(".progress").show();
            this.forEach(function (model) {
                model.sendRequest();
            });
        },

        /**
         * Aktualisiert die Progressbar
         */
        updateProgressBar: function () {
            if (this.counter <= this.length) {
                var percent = Math.round((this.counter) / this.length * 100);

                $(".progress-bar").css({"width": percent + "%"});
                $(".progress-bar").text(percent + "%");
                this.counter++;
            }
        },

        resetProgressBar: function () {
            this.counter = 1;
            $(".progress-bar").css({width: "0%"});
            $(".progress-bar").text("0%");
        }
    });

    return List;
});
