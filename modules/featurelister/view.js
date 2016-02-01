define([
    "backbone",
    "eventbus",
    "config",
    "text!modules/featurelister/template.html",
    "modules/featurelister/model",
    "modules/core/util",
    "modules/menubar/view",
    "jqueryui/draggable"
], function (Backbone, EventBus, Config, Template, Model, Util) {

    var FeatureLister = Backbone.View.extend({
        model: Model,
        className: "wfslist-win",
        template: _.template(Template),
        events: {
            "click .glyphicon-remove": "toggle",
            "click #wfslistFeaturelist": "switchTabToListe", // wechselt den sichtbaren Tab
            "click #wfslistThemeChooser": "switchTabToTheme", // wechselt den sichtbaren Tab
            "click #wfslistFeaturedetails": "switchTabToDetails", // wechselt den sichtbaren Tab
            "click .wfslist-themes-li": "newTheme", // übernimmt Layer
            "mouseover .wfslist-list-table-tr": "hoverTr", // HoverEvent auf Tabelleneintrag
            "click .wfslist-list-table-tr": "selectTr", // Klick-Event auf Tabelleneintrag
            "click .wfslist-list-button": "moreFeatures", // Klick auf Button zum Nachladen von Features
            "click .wfslist-list-table-th": "orderList" // Klick auf Sortiersymbol in thead
        },
        initialize: function () {
            if (!Util.isAny()) { // nicht in mobiler Variante
                this.listenTo(this.model, {"change:layerlist": this.updateVisibleLayer});
                this.listenTo(this.model, {"change:layer": this.updateLayerHeader});
                this.listenTo(this.model, {"change:layer": this.updateLayerList});
                this.listenTo(this.model, {"change:layer": this.switchTabToListe});
                this.listenTo(this.model, {"change:featureProps": this.showFeatureProps});
                this.listenTo(this.model, {"gfiHit": this.selectGFIHit});
                this.listenTo(this.model, {"gfiClose": this.deselectGFIHit});
                this.listenTo(EventBus, {"toggleFeatureListerWin": this.toggle});
                this.render();
                if (Config.startUpModul.toUpperCase() === "FEATURELIST") {
                    this.toggle();
                }
            }
        },
        /*
        * Wenn im Model das Schließen des GFI empfangen wurde, werden die Elemente in der Tabelle wieder enthighlighted.
        */
        deselectGFIHit: function () {
            $("#wfslist-list-table tr").each(function (int, tr) {
                $(tr).removeClass("info");
            });
        },
        /*
        * Wenn im Model ein GFI empfangen wurde, wird dieses in der Liste gesucht und ggf. gehighlighted.
        */
        selectGFIHit: function (evt) {
            var gesuchteId = evt.id;

            this.deselectGFIHit();
            $("#wfslist-list-table tr").each(function (int, tr) {
                var trId = parseInt($(tr).attr("id"));

                if (trId === gesuchteId) {
                    $(tr).addClass("info");
                }
            });
        },
        /*
        * Findet das Spanelement der Spalte, die geklickt wurde. Liest dann die derzeit dargestellten Features aus und sortiert diese. Leert die aktuelle (unsortierte) Tabelle
        * und überschreibt sie mit den sortierten Features.
        */
        orderList: function (evt) {
            var spanTarget = $(evt.target).find("span")[0] ? $(evt.target).find("span")[0] : evt.target,
                sortOrder = $(spanTarget).hasClass("glyphicon-sort-by-alphabet-alt") ? "ascending" : "descending",
                sortColumn = spanTarget.parentElement.textContent,
                tableLength = $("#wfslist-list-table tr").length - 1,
                features = _.filter(this.model.get("layer").features, function (feature) {
                    return feature.id >= 0 && feature.id <= tableLength;
                }),
                featuresExtended = _.each(features, function (feature) {
                    feature = _.extend(feature, feature.properties);
                }),
                featuresSorted = _.sortBy(featuresExtended, sortColumn);

            $(".wfslist-list-table-th-sorted").removeClass("wfslist-list-table-th-sorted");
            if (sortOrder === "ascending") {
                $(spanTarget).removeClass("glyphicon-sort-by-alphabet-alt");
                $(spanTarget).addClass("glyphicon-sort-by-alphabet");
                $(spanTarget).addClass("wfslist-list-table-th-sorted");
            }
            else {
                featuresSorted = featuresSorted.reverse();
                $(spanTarget).removeClass("glyphicon-sort-by-alphabet");
                $(spanTarget).addClass("glyphicon-sort-by-alphabet-alt");
                $(spanTarget).addClass("wfslist-list-table-th-sorted");
            }

            $("#wfslist-list-table tbody").empty();
            this.writeFeaturesToTable (featuresSorted);
        },
        /*
        * Ermittelt die Anzahl der derzeit dargestellten Features, erhöht diese und liest diese Features aus. Stellt sie dann dar.
        */
        moreFeatures: function () {
            var countFeatures = $("#wfslist-list-table tbody").children().length,
                maxFeatures = this.model.get("maxFeatures"),
                toFeatures = countFeatures + maxFeatures - 1;

            this.readFeatures(countFeatures, toFeatures, false);
        },
        /*
        * Bei change der Feature-Props wird in den Details-Tab gewechselt und dort werden die Detailinformationen des Features (wie GFI) aufgelistet.
        */
        showFeatureProps: function () {
            var props = this.model.get("featureProps");

            this.switchTabToDetails();
            $(".wfslist-details-li").remove();
            _.each(props, function (value, key) {
                $(".wfslist-details-ul").append("<li class='list-group-item list-group-item-info wfslist-details-li'>" + key + "</li>");
                $(".wfslist-details-ul").append("<li class='list-group-item wfslist-details-li'>" + value + "</li>");
            });
        },
        /*
        * Wechselt den Tab
        */
        switchTabToListe: function () {
            _.each($(".wfslist-navtabs").children(), function (child) {
                if (child.id === "wfslistFeaturelist") {
                    $(child).addClass("active");
                }
                else {
                    $(child).removeClass("active");
                }
            });
            $("#wfslist-themes").hide();
            $("#wfslist-list").show();
            $("#wfslist-details").hide();
        },
        /*
        * Wechselt den Tab
        */
        switchTabToTheme: function () {
            _.each($(".wfslist-navtabs").children(), function (child) {
                if (child.id === "wfslistThemeChooser") {
                    $(child).addClass("active");
                }
                else {
                    $(child).removeClass("active");
                }
            });
            $("#wfslist-themes").show();
            $("#wfslist-list").hide();
            $("#wfslist-details").hide();
        },
        /*
        * Wechselt den Tab
        */
        switchTabToDetails: function () {
            _.each($(".wfslist-navtabs").children(), function (child) {
                if (child.id === "wfslistFeaturedetails") {
                    $(child).addClass("active");
                }
                else {
                    $(child).removeClass("active");
                }
            });
            $("#wfslist-themes").hide();
            $("#wfslist-list").hide();
            $("#wfslist-details").show();
        },
        /*
        * Setted FeatureId bei Klick auf Feature in Tabelle
        */
        selectTr: function (evt) {
            var featureid = evt.currentTarget.id;

            this.model.set("featureid", featureid);
        },
        /*
        * Zeigt Marker bei Hover
        */
        hoverTr: function (evt) {
            var featureid = evt.currentTarget.id;

            this.model.showMarker(featureid);
        },
        /*
        * Bei Klick auf Layer wird dieser gehighlighted und Layerid wird gesertzt
        */
        newTheme: function (evt) {
            this.model.set("layerid", evt.currentTarget.id);
            // setze active Class
            _.each($(evt.currentTarget.parentElement.children), function (li) {
                $(li).removeClass("active");
            });
            $(evt.currentTarget).addClass("active");
        },
        /*
        * Wird ein neuer Layer ausgewählt, werden aus allen Features mögliche Keys ermittelt und daraus Überschriften thead gebildet. Anschließend wird Funktion
        * zum Lesen der Features aufgerufen.
        */
        updateLayerList: function () {
            // lt. Mathias liefern Dienste, bei denen ein Feature in einem Attribut ein null-Value hat, dieses nicht aus und es erscheint gar nicht am Feature.
            var features = this.model.get("layer").features,
                maxFeatures = this.model.get("maxFeatures") - 1,
                keyslist = [];

            // Extrahiere vollständige Überschriftenliste, funktioniert nicht, sollten Kommas im Key stehen. Darf aber wohl nicht vorkommen.
            _.each(features, function (feature) {
                _.each(_.keys(feature.properties), function (key) {
                    if (_.contains(keyslist, key) === false) {
                        keyslist.push(key);
                    }
                }, this);
            }, this);
            this.model.set("headers", keyslist);
            $("#wfslist-list-table thead").remove(); // leere Tabelle
            $("#wfslist-list-table tbody").remove(); // leere Tabelle
            $("#wfslist-list-table").prepend("<thead><tr><th class='wfslist-list-table-th'>" + keyslist.toString().replace(/,/g, "<span class='glyphicon glyphicon-sort-by-alphabet'></span></th><th class='wfslist-list-table-th'>") + "<span class='glyphicon glyphicon-sort-by-alphabet'></span></th></tr></thead>");
            $("#wfslist-list-table").append("<tbody>");
            this.readFeatures(0, maxFeatures, true);
            $("#wfslist-list-table").append("</tbody>");
        },
        /*
        * Liest Features von - bis aus Layer aus. Löscht ggf. bisherige Inhalte der Tabelle.
        */
        readFeatures: function (from, to, dropTableFirst) {
            var features = _.filter(this.model.get("layer").features, function (feature) {
                    return feature.id >= from && feature.id <= to;
                });

            if (dropTableFirst === true) {
                $("#wfslist-list-table tbody").empty();
            }
            // entferne evtl. Sortierungshinweise aus Überschriften
            $(".wfslist-list-table-th-sorted").removeClass("wfslist-list-table-th-sorted");
            this.writeFeaturesToTable (features);
        },
        /*
        * Nimmt die darzustellenden Features entgegen un schreibt sie in tbody. Zeigt ggf. Nachlade-Button.
        */
        writeFeaturesToTable: function (features) {
            var totalFeaturesCount = this.model.get("layer").features.length,
                properties = "",
                headers = this.model.get("headers");

            // Schreibe jedes Feature in tbody
            _.each(features, function (feature) {
                properties += "<tr id='" + feature.id + "' class='wfslist-list-table-tr'>";
                // entsprechend der Reihenfolge der Überschriften...
                _.each(headers, function (header) {
                    var attvalue = "";

                   _.each(feature.properties, function (value, key) {
                        if (header === key) {
                            attvalue = value;
                        }
                    }, this);
                    properties += "<td headers='" + header + "'><div class='wfslist-list-table-td' title='" + attvalue + "'>";
                    properties += attvalue;
                    properties += "</div></td>";
                }, this);
                properties += "</tr>";
            }, this);
            $("#wfslist-list-table tbody").append(properties);

            // Prüfe, ob alle Features geladen sind, falls nicht, zeige Button zum Erweitern
            var shownFeaturesCount = $("#wfslist-list-table tr").length - 1;

            if (shownFeaturesCount < totalFeaturesCount) {
                $(".wfslist-list-footer").show();
                $(".wfslist-list-message").text(shownFeaturesCount + " von " + totalFeaturesCount + " Features gelistet.");
            }
            else {
                $(".wfslist-list-footer").hide();
            }
        },
        /*
        * Ändert den Titel des Tabellen-Tabs auf Layernamen.
        */
        updateLayerHeader: function () {
            $("#wfslist-list-header").text(this.model.get("layer").name);
        },
        /*
        * Erzeugt Auflistung der selektierbaren Layer über EventBus.
        */
        updateVisibleLayer: function (layerlist) {
            var ll = this.model.get("layerlist");

            $("#wfslist-themes-ul").empty();
            _.each(ll, function (layer) {
                $("#wfslist-themes-ul").append("<li id='" + layer.id + "' class='wfslist-themes-li' role='presentation'><a href='#'>" + layer.name + "</a></li>");
            });
        },
        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
            $("body").append(this.$el.html(this.template(attr)));
            this.$el.draggable({
                containment: "#map",
                handle: ".wfslist-win-header"
            });
        },
        toggle: function () {
            if ($(this.$el).is(":visible") === false) {
                this.updateVisibleLayer();
                // wenn nur ein Layer gefunden, lade diesen sofort
                if (this.model.get("layerlist").length === 1) {
                    this.model.set("layerid", this.model.get("layerlist")[0].id);
                }
            }
            this.$el.toggle();
        }
    });

    return FeatureLister;
});
