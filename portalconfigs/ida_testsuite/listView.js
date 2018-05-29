define(function (require) {

    var Backbone = require("backbone"),
        List = require("list"),
        ListViewTemplate = require("text!ListViewTemplate.html"),
        View = require("view"),
        ListView;

    ListView = Backbone.View.extend({
        className: "panel panel-default",
        template: _.template(ListViewTemplate),
        collection: new List(),
        events: {
            // Alle Senden Button
            "click button.btn-primary": "runAllTests"
        },

        initialize: function () {
            this.render();
            this.addViews();
        },

        /**
         * Hängt das DOM der ListView an den body
         */
        render: function () {
            $("body").append(this.$el.html(this.template()));
        },

        /**
         * Iteriert über die Models der Collection und ruft die Methode addView auf
         */
        addViews: function () {
            this.collection.forEach(this.addView, this);
        },

        /**
         * Erzeugt für jedes Model der Collection eine View
         * Hängt das DOM der View an die Tabelle der ListView
         * @param  {Backbone.Model} model
         */
        addView: function (model) {
            var view = new View({model: model});

            if (model.get("adresse") === "Wilstorfer Str. 106") {
                this.$el.find("tbody")[0].append(view.render().el);
            }
            else {
                this.$el.find("tbody")[1].append(view.render().el);
            }
        },

        /**
         * Weiterleitung an die Methode runAllTests in der Collection
         */
        runAllTests: function () {
            this.collection.runAllTests();
        }
    });

    return ListView;
});
