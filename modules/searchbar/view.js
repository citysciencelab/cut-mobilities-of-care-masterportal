define([
    "backbone",
    "text!modules/searchbar/template.html",
    "text!modules/searchbar/templateTable.html",
    "text!modules/searchbar/templateRecommendedList.html",
    "text!modules/searchbar/templateHitList.html",
    "modules/searchbar/model",
    "backbone.radio",
    "config"
], function (Backbone, SearchbarTemplate, TemplateTable, SearchbarRecommendedListTemplate, SearchbarHitListTemplate, Searchbar, Radio, Config) {
    "use strict";
    return Backbone.View.extend({
        model: new Searchbar(),
        id: "searchbar", // wird ignoriert, bei renderToDOM
        className: "navbar-form col-xs-9", // wird ignoriert, bei renderToDOM
        searchbarKeyNavSelector: "#searchInputUL",
        template: _.template(SearchbarTemplate),
        templateTable: _.template(TemplateTable),
        /**
        * @memberof config
        * @type {Object}
        * @description Konfiguration für die Suchfunktion. Workaround für IE9 implementiert.
        * @property {Object} [visibleWFS] Konfigurationsobjekt für die client-seitige Suche auf bereits geladenen WFS-Layern. Weitere Konfiguration am Layer, s. searchField in {@link config#layerIDs}.
        * @property {integer} [visibleWFS.minChars=3] - Mindestanzahl an Characters, bevor eine Suche initiiert wird.
        * @property {Object} [tree] - Das Konfigurationsobjekt der Tree-Suche, wenn Treesuche gewünscht.
        * @property {integer} [tree.minChars=3] - Mindestanzahl an Characters, bevor eine Suche initiiert wird.
        * @property {Objekt} [specialWFS] - Das Konfigurationsarray für die specialWFS-Suche
        * @property {integer} [specialWFS.minChars=3] - Mindestanzahl an Characters, bevor eine Suche initiiert wird.
        * @property {Object[]} specialWFS.definitions - Definitionen der SpecialWFS.
        * @property {Object} specialWFS.definitions[].definition - Definition eines SpecialWFS.
        * @property {string} specialWFS.definitions[].definition.url - Die URL, des WFS
        * @property {string} specialWFS.definitions[].definition.data - Query string des WFS-Request
        * @property {string} specialWFS.definitions[].definition.name - Name der speziellen Filterfunktion (bplan|olympia|paralympia)
        * @property {Object} bkg - Das Konfigurationsobjet der BKG Suche.
        * @property {integer} [bkg.minChars=3] - Mindestanzahl an Characters, bevor eine Suche initiiert wird.
        * @property {string} bkg.bkgSuggestURL - URL für schnelles Suggest.
        * @property {string} [bkg.bkgSearchURL] - URL für ausführliche Search.
        * @property {float} [bkg.extent=454591, 5809000, 700000, 6075769] - Koordinatenbasierte Ausdehnung in der gesucht wird.
        * @property {integer} [bkg.suggestCount=20] - Anzahl der über suggest angefragten Vorschläge.
        * @property {string} [bkg.epsg=EPSG:25832] - EPSG-Code des verwendeten Koordinatensystems.
        * @property {string} [bkg.filter=filter=(typ:*)] - Filterstring
        * @property {float} [bkg.score=0.6] - Score-Wert, der die Qualität der Ergebnisse auswertet.
        * @property {Object} [gazetteer] - Das Konfigurationsobjekt für die Gazetteer-Suche.
        * @property {string} gazetteer.url - Die URL.
        * @property {boolean} [gazetteer.searchStreets=false] - Soll nach Straßennamen gesucht werden? Vorraussetzung für searchHouseNumbers. Default: false.
        * @property {boolean} [gazetteer.searchHouseNumbers=false] - Sollen auch Hausnummern gesucht werden oder nur Straßen? Default: false.
        * @property {boolean} [gazetteer.searchDistricts=false] - Soll nach Stadtteilen gesucht werden? Default: false.
        * @property {boolean} [gazetteer.searchParcels=false] - Soll nach Flurstücken gesucht werden? Default: false.
        * @property {integer} [gazetteer.minCharacters=3] - Mindestanzahl an Characters im Suchstring, bevor Suche initieert wird. Default: 3.
        * @property {string} [config.renderToDOM=searchbar] - Die id des DOM-Elements, in das die Searchbar geladen wird.
        * @property {string} [config.recommandedListLength=5] - Die Länge der Vorschlagsliste.
        * @property {boolean} [config.quickHelp=false] - Gibt an, ob die quickHelp-Buttons angezeigt werden sollen.
        * @property {string} [config.placeholder=Suche] - Placeholder-Value der Searchbar.
        */
        initialize: function (config) {
            // https://developer.mozilla.org/de/docs/Web/API/Window/matchMedia
            // var mediaQueryOrientation = window.matchMedia("(orientation: portrait)"),
            //     mediaQueryMinWidth = window.matchMedia("(min-width: 768px)"),
            //     mediaQueryMaxWidth = window.matchMedia("(max-width: 767px)"),
            //     that = this;
            //
            // // Beim Wechsel der orientation landscape/portrait wird die Suchleiste neu gezeichnet
            // mediaQueryOrientation.addListener(function () {
            //     that.render();
            // });
            // // Beim Wechsel der Navigation(Burger-Button) wird die Suchleiste neu gezeichnet
            // mediaQueryMinWidth.addListener(function () {
            //     that.render();
            // });
            // mediaQueryMaxWidth.addListener(function () {
            //     that.render();
            // });

            if (config.renderToDOM) {
                this.setElement(config.renderToDOM);
            }
            if (config.recommandedListLength) {
                this.model.set("recommandedListLength", config.recommandedListLength);
            }
            if (config.quickHelp) {
                this.model.set("quickHelp", config.quickHelp);
            }
            if (config.placeholder) {
                this.model.set("placeholder", config.placeholder);
            }
            this.className = "navbar-form col-xs-9";

            // this.listenTo(this.model, "change:searchString", this.render);
            this.listenTo(this.model, "change:recommendedList", function () {
                this.renderRecommendedList();
            });

            this.listenTo(Radio.channel("Searchbar"), {
                "deleteSearchString": this.deleteSearchString,
                "setFocus": this.setFocus
            });
            this.listenTo(Radio.channel("MenuLoader"), {
                "ready": function (parentElementId) {
                        this.render(parentElementId);
                    if (window.innerWidth >= 768) {
                        $("#searchInput").width(window.innerWidth - $(".desktop").width() - 160);
                    }
                }
            });

            this.listenTo(Radio.channel("Util"), {
                "isViewMobileChanged": function () {
                    this.render();
                }
            });

            this.render();

            if (navigator.appVersion.indexOf("MSIE 9.") !== -1) {
                $("#searchInput").val(this.model.get("placeholder"));
            }
            $("#searchInput").blur();
            // bedarfsweises Laden der Suchalgorythmen
            if (_.has(config, "gazetteer") === true) {
                require(["modules/searchbar/gaz/model"], function (GAZModel) {
                    new GAZModel(config.gazetteer);
                });
            }
            if (_.has(config, "specialWFS") === true) {
                require(["modules/searchbar/specialWFS/model"], function (SpecialWFSModel) {
                    new SpecialWFSModel(config.specialWFS);
                });
            }
            if (_.has(config, "visibleWFS") === true) {
                require(["modules/searchbar/visibleWFS/model"], function (VisibleWFSModel) {
                    new VisibleWFSModel(config.visibleWFS);
                });
            }
            if (_.has(config, "bkg") === true) {
                require(["modules/searchbar/bkg/model"], function (BKGModel) {
                    new BKGModel(config.bkg);
                });
            }
            if (_.has(config, "tree") === true) {
                require(["modules/searchbar/tree/model"], function (TreeModel) {
                    new TreeModel(config.tree);
                });
            }
            if (_.has(config, "layer") === true) {
                require(["modules/searchbar/layer/model"], function (LayerSearch) {
                    new LayerSearch(config.layer);
                });
            }

            // Hack für flexible Suchleiste
            $(window).on("resize", function () {
                if (window.innerWidth >= 768) {
                    $("#searchInput").width(window.innerWidth - $(".desktop").width() - 160);
                }
            });
            if (window.innerWidth >= 768) {
                $("#searchInput").width(window.innerWidth - $(".desktop").width() - 160);
            }
        },
        events: {
            "paste input": "setSearchString",
            "keyup input": "setSearchString",
            "focusin input": "toggleStyleForRemoveIcon",
            "focusout input": "toggleStyleForRemoveIcon",
            "click .form-control-feedback": "deleteSearchString",
            "click .btn-search": "renderHitList",
            "click .btn-table-search": "renderHitList",
            "click .list-group-item.hit": "hitSelected",
            "click .list-group-item.results": "renderHitList",
            "mouseover .list-group-item.hit": "showMarker",
            "mouseleave .list-group-item.hit": "hideMarker",
            "click .list-group-item.type": function (e) {
                // fix für Firefox
                var event = e || window.event;

                this.collapseHits($(event.target));
            },
            "click .btn-search-question": function () {
                Radio.trigger("Quickhelp", "showWindowHelp", "search");
            },
            "keydown": "navigateList",
            "click": function () {
                this.clearSelection();
                $("#searchInput").focus();
            }
        },
        /**
        *
        */
        render: function (parentElementId) {
            var attr = this.model.toJSON();

            if (parentElementId !== "table-nav") {
                this.$el.html(this.template(attr));
                if (window.innerWidth < 768) {
                    $(".navbar-toggle").before(this.$el); // vor dem toggleButton
                }
                else {
                    $(".navbar-collapse").append(this.$el); // rechts in der Menuebar
                }
                this.focusOnEnd($("#searchInput"));
                if (this.model.get("searchString").length !== 0) {
                    $("#searchInput:focus").css("border-right-width", "0");
                }
                this.delegateEvents(this.events);
                Radio.trigger("Title", "setSize");
            }
            else {
                this.$el.html(this.templateTable(attr));
                $("#table-nav-main").prepend(this.$el);
            }
        },

        /**
        * @description Methode, um den Searchstring über den Radio zu steuern ohne Event auszulösen
        * @param {string} searchstring - Der einzufügende Searchstring
        */
        setSearchbarString: function (searchstring) {
            $("#searchInput").val(searchstring);
        },
        /**
        * @description Verbirgt die Menubar
        */
        hideMenu: function () {
            $(".dropdown-menu-search").hide();
        },
        /**
        *
        */
        renderRecommendedList: function () {
            var attr = this.model.toJSON(),
                template;
                // sz, will in lokaler Umgebung nicht funktionieren, daher erst das Template als Variable
                // $("ul.dropdown-menu-search").html(_.template(SearchbarRecommendedListTemplate, attr));
                this.prepareAttrStrings(attr.hitList);
                template = _.template(SearchbarRecommendedListTemplate);

            $("ul.dropdown-menu-search").css("max-width", $("#searchForm").width());
            $("ul.dropdown-menu-search").html(template(attr));
            // }
            // bei nur einem Treffer in der RecommendedList wird direkt der Marker darauf gesetzt
            if (this.model.getInitSearchString() !== undefined && this.model.get("hitList").length === 1) {
                this.hitSelected();
            }
            $("#searchInput + span").show();
            this.model.unset("initSearchString", true);
        },
        prepareAttrStrings: function (hitlist) {
            // kepps hit.names from overflowing
            _.each(hitlist, function (hit) {
                if (!_.isUndefined(hit.additionalInfo)) {
                    if (hit.name.length + hit.additionalInfo.length > 50) {
                        hit.shortName = this.model.shortenString(hit.name, 30);
                        hit.additionalInfo = this.model.shortenString(hit.additionalInfo, 20);
                    }
                }
                // IE 11 svg bug -> png
                hit.imageSrc = this.model.changeFileExtension(hit.imageSrc, ".png");
             }, this);
        },

        /**
        *
        */
        renderHitList: function () {
            // if (this.model.get("isHitListReady") === true) {
                if (this.model.get("hitList").length === 1) {
                    this.hitSelected(); // erster und einziger Eintrag in Liste
                }
                else {
                    this.model.set("typeList", _.uniq(_.pluck(this.model.get("hitList"), "type")));
                    var attr = this.model.toJSON(),
                    // sz, will in lokaler Umgebung nicht funktionieren, daher erst das Template als Variable
                    // $("ul.dropdown-menu-search").html(_.template(SearchbarHitListTemplate, attr));
                        template = _.template(SearchbarHitListTemplate);

                    $("ul.dropdown-menu-search").html(template(attr));
                }
            // }
        },
        /*
         * Methode, um den Focus über den Radio in SearchInput zu legen
         */
        setFocus: function () {
            $("#searchInput").focus();
        },
        /**
        * Wird ausgeführt, wenn ein Eintrag ausgewählt oder bestätigt wurde.
        */
        hitSelected: function (evt) {
            Radio.trigger("Filter", "resetFilter");

            var hit,
                hitID;

            // Ermittle Hit
            if (_.has(evt, "cid")) { // in diesem Fall ist evt = model
                hit = _.values(_.pick(this.model.get("hitList"), "0"))[0];
            }
            else if (_.has(evt, "currentTarget") === true && evt.currentTarget.id) {
                hitID = evt.currentTarget.id;
                hit = _.findWhere(this.model.get("hitList"), {id: hitID});
            }
            else {
                hit = this.model.get("hitList")[0];
            }
            // 1. Schreibe Text in Searchbar
            this.setSearchbarString(hit.name);
            // 2. Verberge Suchmenü
            this.hideMenu();
            // 3. Zoome ggf. auf Ergebnis
            Radio.trigger("GFI", "setIsVisible", false);
            // 4. Zoome ggf. auf Ergebnis
            Radio.trigger("MapMarker", "zoomTo", hit, 5000);
            // 5. Triggere Treffer über Radio
            // Wird benötigt für IDA und sgv-online, ...
            Radio.trigger("Searchbar", "hit", hit);
            // 6. Beende Event
            if (evt) {
                evt.stopPropagation();
            }
        },
        navigateList: function (e) {
            var selected = {},
            firstListElement = {},
            // fix für Firefox
            event = e || window.event;

            if (event.keyCode === 38 || event.keyCode === 40 || event.keyCode === 13) {
                var selected = this.getSelectedElement(),
                firstListElement = this.getFirstElement();
            }

            if (selected.length === 0) {
                firstListElement.addClass("selected");
            }
            else {
                // uparrow
                if (event.keyCode === 38) {
                      this.prevElement(selected);
                }
                // down arrow
                if (event.keyCode === 40) {
                    this.nextElement(selected);
                }
                if (event.keyCode === 13 && this.model.get("hitList").length > 1) {
                    if (this.isFolderElement(selected)) {
                        this.collapseHits(selected);
                    }
                    else {
                        selected.click();
                    }
                }
            }
        },
        getSelectedElement: function () {
            return this.$el.find(this.searchbarKeyNavSelector + " .selected");
        },

        clearSelection: function () {
            this.getSelectedElement().removeClass("selected");
        },
        isLastElement: function (element) {
            return element.is(":last-child");
        },
        isFirstElement: function (element) {
            return element.is(":first-child");
        },
        isChildElement: function (element) {
            return (element.parent().prev().hasClass("type"));
        },

       getFirstChildElement: function (selected) {
            return selected.next().children().first();
        },
        isFolderElement: function (element) {
            return element.hasClass("type");
        },

        scrollToNext: function (li) {
            var parent = li.parent(),
            pos = parent.scrollTop(),
            scrollHeight = pos + li.outerHeight(true);

            parent.scrollTop(scrollHeight);
        },
        scrollToPrev: function (li) {
            var parent = li.parent(),
            pos = parent.scrollTop(),
            scrollHeight = pos - li.outerHeight(true);

            parent.scrollTop(scrollHeight);
        },
        resetScroll: function (element) {
            element.scrollTop(0);
        },

        nextElement: function (selected) {
            selected.removeClass("selected");
            var next = {};

            if (this.isFolderElement(selected) && selected.hasClass("open")) {
                next = this.getFirstChildElement(selected);
                this.resetScroll(selected.nextAll("div:first"));
            }
            else {
                if (this.isLastElement(selected)) {
                    if (this.isChildElement(selected)) {
                        if (this.isLastElement(selected.parent())) {
                           this.getFirstElement().addClass("selected");
                           return;
                        }
                        else {
                            next = this.getNextElement(selected.parent());
                            this.scrollToNext(selected);
                        }
                    }
                    else {
                        this.getFirstElement().addClass("selected");
                        return;
                    }
                }
                else {
                    next = this.getNextElement(selected);
                    this.scrollToNext(selected);
                }
            }
            next.addClass("selected");

        },

        getNextElement: function (selected) {
            return selected.nextAll("li:first");
        },

        prevElement: function (selected) {
            selected.removeClass("selected");
            var prev = {};

            if (this.isFirstElement(selected)) {
                if (this.isChildElement(selected)) {
                    // child
                    prev = selected.parent().prevAll("li:first");
                    this.resetScroll(selected.parent());
                }
                else {
                    // Folder
                    return;
                }
            }
            else {
                prev = selected.prevAll("li:first");
                if (this.isFolderElement(selected)) {
                    this.resetScroll(selected.prevAll("div:first"));
                }
                else {
                    this.scrollToPrev(selected);
                }
            }
            prev.addClass("selected");
        },
        getFirstElement: function () {
            return this.$el.find(this.searchbarKeyNavSelector + " li").first();
        },
        getLastElement: function () {
            return this.$el.find(this.searchbarKeyNavSelector + " li").last();
        },

        /**
        *
        */
        setSearchString: function (evt) {
            if (evt.target.value.length === 0) {
                // suche zurücksetzten, wenn der nletzte Buchstabe gelöscht wurde
                this.deleteSearchString();
            }
            else {
                if (evt.type === "paste") {
                    var that = this;

                    // Das Paste Event tritt auf, bevor der Wert in das Element eingefügt wird
                    setTimeout(function () {
                        that.model.setSearchString(evt.target.value, evt.type);
                    }, 0);
                }
                else if (evt.keyCode !== 37 && evt.keyCode !== 38 && evt.keyCode !== 39 && evt.keyCode !== 40 && !(this.getSelectedElement("#searchInputUL").length > 0 && this.getSelectedElement("#searchInputUL").hasClass("type"))) {
                    if (evt.key === "Enter" || evt.keyCode === 13) {
                        if (this.model.get("hitList").length === 1) {
                            this.hitSelected(); // erster und einziger Eintrag in Liste
                        }
                        else {
                            this.renderHitList();
                        }
                    }
                    else {
                        this.model.setSearchString(evt.target.value); // evt.target.value = Wert aus der Suchmaske
                    }
                }

                // Der "x-Button" in der Suchleiste
                if (evt.target.value.length > 0) {
                    $("#searchInput + span").show();
                }
                else {
                    $("#searchInput + span").hide();
                }
            }
        },
        collapseHits: function (target) {
            $(".list-group-item.type + div").hide("slow"); // schließt alle Reiter
            if (target.next().css("display") === "block") {
                target.next().hide("slow");
                target.removeClass("open");
            }
            else {
                target.next().show("slow");
                target.addClass("open");
                target.siblings().removeClass("open");
            }
        },
        /**
        *
        */
        toggleStyleForRemoveIcon: function (evt) {
            if (evt.type === "focusin") {
                if (navigator.appVersion.indexOf("MSIE 9.") !== -1) {
                    if ($("#searchInput").attr("value") === this.model.get("placeholder")) {
                        $("#searchInput").val("");
                    }
                }
                $(".btn-deleteSearch").css("border-color", "#66afe9");
            }
            else if (evt.type === "focusout") {
                if (navigator.appVersion.indexOf("MSIE 9.") !== -1) {
                    if ($("#searchInput").attr("value") === "") {
                        $("#searchInput").val(this.model.get("placeholder"));
                    }
                }
                $(".btn-deleteSearch").css("border-color", "#cccccc");
            }
        },
        /**
        *
        */
        deleteSearchString: function () {
            this.model.setSearchString("");
            $("#searchInput").val("");
            $("#searchInput + span").hide();
            this.focusOnEnd($("#searchInput"));
            this.hideMarker();
            Radio.trigger("MapMarker", "clearMarker");
            this.clearSelection();
            // Suchvorschläge löschen
            $("#searchInputUL").html("");

        },
        /**
        *
        */
        showMarker: function (evt) {
            var hitID = evt.currentTarget.id,
                hit = _.findWhere(this.model.get("hitList"), {id: hitID});

            if (hit.type === "Adresse" || hit.type === "Stadtteil" || hit.type === "Olympiastandort" || hit.type === "Paralympiastandort") {
                Radio.trigger("MapMarker", "showMarker", hit.coordinate);
            }
        },
        /**
        *
        */
        hideMarker: function () {
            if ($(".dropdown-menu-search").css("display") === "block") {
                Radio.trigger("MapMarker", "hideMarker");
            }
        },

        /**
        * Platziert den Cursor am Ende vom String
        * @param {Element} element - Das Dom-Element
        */
        focusOnEnd: function (element) {
            var strLength = element.val().length * 2;

            element.focus();
            element[0].setSelectionRange(strLength, strLength);
        }
    });
});
