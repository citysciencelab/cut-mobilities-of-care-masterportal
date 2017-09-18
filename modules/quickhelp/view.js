define([
    "backbone",
    "backbone.radio",
    "text!modules/quickhelp/templateSearch.html",
    "text!modules/quickhelp/templateTree.html",
    "text!modules/quickhelp/templateMeasureTool.html",
    "jqueryui/widgets/draggable"
], function (Backbone, Radio, TemplateSearch, TemplateTree, TemplateMeasureTool) {

    var view = Backbone.View.extend({
        templateSearch: _.template(TemplateSearch),
        templateTree: _.template(TemplateTree),
        templateMeasureTool: _.template(TemplateMeasureTool),
        className: "quick-help-window ui-widget-content",
        events: {
            "click .glyphicon-remove": "removeWindow",
            "click .glyphicon-print": "printHelp"
        },
        initialize: function () {
            var channel = Radio.channel("Quickhelp");

            channel.on({
                "showWindowHelp": this.showWindow
            }, this);
            this.render();

            this.$el.draggable({
                containment: "#map",
                handle: ".header"
            });
        },
        render: function () {
            $("body").append(this.$el);
        },
        removeWindow: function () {
            this.$el.hide("slow");
        },
        /**
         * [showWindow description]
         * @param {[type]} value [description]
         */
        showWindow: function (value) {
            switch (value) {
                case "search": {
                    var allgemein = Radio.request("Util", "getPath", "../img/allgemein.png"),
                        allgemein2 = Radio.request("Util", "getPath", "../img/allgemein_2.png"),
                        allgemein3 = Radio.request("Util", "getPath", "../img/allgemein_3.png"),
                        allgemein4 = Radio.request("Util", "getPath", "../img/allgemein_4.png");

                    this.$el.html(this.templateSearch({
                        allgemein: allgemein,
                        allgemein2: allgemein2,
                        allgemein3: allgemein3,
                        allgemein4: allgemein4
                    }));
                    break;
                }
                case "tree": {
                    var themen = Radio.request("Util", "getPath", "../img/themen.png"),
                        themen2 = Radio.request("Util", "getPath", "../img/themen_2.png");

                    this.$el.html(this.templateTree({
                        themen: themen,
                        themen2: themen2
                    }));
                    break;
                }
                case "measure": {
                    var statistikFlaecheNiemeier = Radio.request("Util", "getPath", "../img/Statistik_Flaeche_Niemeier.png"),
                        statistikStreckeUniErlangen = Radio.request("Util", "getPath", "../img/Statistik_Strecke_UniErlangen.png"),
                        utmStreifen = Radio.request("Util", "getPath", "../img/UTM_Streifen.png"),
                        utmVerzerrung = Radio.request("Util", "getPath", "../img/UTM_Verzerrung.png"),
                        utmFormeln = Radio.request("Util", "getPath", "../img/UTM_Formeln.png");

                    this.$el.html(this.templateMeasureTool({
                        statistikFlaecheNiemeier: statistikFlaecheNiemeier,
                        statistikStreckeUniErlangen: statistikStreckeUniErlangen,
                        utmStreifen: utmStreifen,
                        utmVerzerrung: utmVerzerrung,
                        utmFormeln: utmFormeln
                    }));
                    break;
                }
                default: {
                    break;
                }
            }
            this.$el.show("slow");
        },
        /**
         * [printHelp description]
         */
        printHelp: function () {
            var htmlToPrint = document.getElementsByClassName("quick-help-window")[0],
                newWin = window.open("");

            newWin.document.write(htmlToPrint.outerHTML);
            newWin.print();
        }
    });

    return view;
});
