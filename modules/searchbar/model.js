define([
    "backbone",
    "openlayers",
    "modules/layer/list",
    "eventbus",
    "config"
    ], function (Backbone, ol, LayerList, EventBus, Config) {

        /**
        * Dieses Model ist ein Attribut der Searchbar.
        * Es verwaltet die Zustände (Suche läuft = false, Suche fertig = true) der einzelnen Suchen (Adresse, Straßen...).
        */
        var SearchReady = Backbone.Model.extend({

            /**
            * Initial werden die Zustände für die Adresssuche und die Straßensuche auf false gesetzt.
            * Zusätzlich wird die Methode "checkAttributes" auf das Event "change" für alle Attribute registriert.
            */
            initialize: function () {
                this.set("streetSearch", true);
                this.set("districtSearch", true);
                this.set("numberSearch", true);
                this.on("change", this.checkAttributes);
            },

            /**
            * Prüft ob alle Attribute auf "true" stehen (Alle Suchen sind fertig).
            * Wenn das der Fall ist, wird das Event "createRecommendedList" über den EventBus getriggert.
            */
            checkAttributes: function () {
                var allAttr = _.every(this.attributes, function (attr) { // http://underscorejs.org/#every
                    return attr === true;
                });

                if (allAttr === true) {
                    EventBus.trigger("createRecommendedList"); // Searchbar.initalize()
                }
            }
        }),

        /**
        *
        */
        Searchbar = Backbone.Model.extend({

            /**
            *
            */
            defaults: {
                placeholder: Config.searchBar.placeholder,
                searchString: "", // der aktuelle String in der Suchmaske
                hitList: [],
                nodes: [],
                olympia: [],
                bPlans: [],
                houseNumbers: [],
                // isOnlyOneStreet: false, // Wenn true --> Hausnummernsuche startet
                onlyOneStreetName: "", // speichert den Namen der Straße, wenn die Straßensuche nur noch eine Treffer zurückgibt.
                gazetteerURL: Config.searchBar.gazetteerURL(),
                marker: new ol.Overlay({
                    positioning: "bottom-center",
                    element: $("#searchMarker"), // Element aus der index.html
                    stopEvent: false
                })
            },

            /**
            *
            */
            initialize: function () {
                this.on("change:searchString", this.setSearchStringRegExp, this);
                this.on("change:searchString", this.checkStringAndSearch, this);
                this.on("change:onlyOneStreetName", this.searchHouseNumbers, this);
                EventBus.on("sendVisibleWFSLayer", this.getFeaturesForSearch, this);
                EventBus.on("createRecommendedList", this.createRecommendedList, this);
                EventBus.on("sendAllLayer", this.getLayerForSearch, this);
                EventBus.on("sendNodeChild", this.getNodesForSearch, this);

                this.set("isSearchReady", new SearchReady());

                if (Config.searchBar.getFeatures !== undefined) {
                    this.getWFSFeatures();
                }

                // Initiale Suche query=...
                if (Config.searchBar.initString !== undefined) {
                    if (Config.searchBar.initString.search(",") !== -1) {
                        var splitInitString = Config.searchBar.initString.split(",");

                        this.set("onlyOneStreetName", splitInitString[0]);
                        // this.set("isOnlyOneStreet", true);
                        this.set("searchString", splitInitString[0] + " " + splitInitString[1]);
                    }
                    else {
                        this.set("searchString", Config.searchBar.initString);
                    }
                }

                // Quick-Help
                if (Config.quickHelp && Config.quickHelp === true) {
                    this.set("quickHelp", true);
                }
                else {
                    this.set("quickHelp", false);
                }
                EventBus.trigger("addOverlay", this.get("marker"));
                EventBus.trigger("getAllLayer");
                EventBus.trigger("getVisibleWFSLayer");
            },

            /**
            *
            */
            setSearchString: function (value) {
                this.set("searchString", value);
            },

            /**
             * i = unabhängig von Groß-/Kleinschreibung.
             */
             setSearchStringRegExp: function () {
                 var searchStringJoin = this.get("searchString").replace(/ /g, ""), // join SearchString
                     searchStringRegExp = new RegExp(searchStringJoin, "i"); // Als regulärer Ausdruck

                 this.set("searchStringRegExp", searchStringRegExp);
             },

            /**
             * Hilfsmethode um ein Attribut vom Typ Array zu setzen.
             * {String} attribute - Das Attribut das gesetzt werden soll
             * {whatever} value - Der Wert des Attributs
             */
            pushHits: function (attribute, value) {
                var tempArray = _.clone(this.get(attribute));

                tempArray.push(value);
                this.set(attribute, _.flatten(tempArray));
            },

            /**
            *
            */
            checkStringAndSearch: function () {
                var firstFourChars = this.get("searchString").slice(0, 4);

                this.set("hitList", []);
                if (/^[0-9]{4}$/.test(firstFourChars) === true) {
                    this.searchParcel();
                }
                else if (this.get("searchString").length >= 3) {
                    this.searchStreets();
                    this.searchDistricts();
                    this.searchInFeatures();
                    if (_.has(Config.searchBar, "getFeatures") === true) {
                        this.searchInOlympiaFeatures();
                        this.searchInBPlans();
                    }
                    if (_.has(Config, "tree") === true) {
                        this.searchInLayers();
                        this.searchInNodes();
                    }
                }
            },

            /**
             * @description Führt einen HTTP-GET-Request aus.
             *
             * @param {String} url - A string containing the URL to which the request is sent
             * @param {String} data - Data to be sent to the server
             * @param {function} successFunction - A function to be called if the request succeeds
             * @param {boolean} asyncBool - asynchroner oder synchroner Request
             */
            getXML: function (url, data, successFunction, asyncBool) {
                $.ajax({
                    url: url,
                    data: data,
                    context: this,
                    async: asyncBool,
                    type: "GET",
                    success: successFunction
                });
            },

            /**
            *
            */
            searchStreets: function () {
                if (this.get("isSearchReady").get("streetSearch") === true) {
                    this.get("isSearchReady").set("streetSearch", false);
                    this.getXML(this.get("gazetteerURL"), "StoredQuery_ID=findeStrasse&strassenname=" + encodeURIComponent(this.get("searchString")), this.getStreets, true);
                }
            },

            /**
             * [getStreets description]
             * @param  {[type]} data [description]
             */
            getStreets: function (data) {
                var hits = $("wfs\\:member,member", data),
                    coordinates,
                    hitName;

                _.each(hits, function (hit) {
                    coordinates = $(hit).find("gml\\:posList,posList")[0].textContent;
                    hitName = $(hit).find("dog\\:strassenname, strassenname")[0].textContent;
                    // "Hitlist-Objekte"
                    this.pushHits("hitList", {
                        name: hitName,
                        type: "Straße",
                        coordinate: coordinates,
                        glyphicon: "glyphicon-road",
                        id: hitName.replace(/ /g, "") + "Straße"
                    });
                }, this);

                if (hits.length === 1) {
                    this.set("onlyOneStreetName", hitName);
                    this.searchInHouseNumbers();
                }
                else if (hits.length === 0) {
                    this.searchInHouseNumbers();
                }
                this.get("isSearchReady").set("streetSearch", true);
            },

            /**
             * [getHouseNumbers description]
             * @param  {[type]} data [description]
             */
            getHouseNumbers: function (data) {
                var hits = $("wfs\\:member,member", data),
                    number,
                    affix,
                    coordinate,
                    position,
                    name,
                    addressJoin;

                    _.each(hits, function (hit) {
                        position = $(hit).find("gml\\:pos,pos")[0].textContent.split(" ");
                        coordinate = [parseFloat(position[0]), parseFloat(position[1])];
                        number = $(hit).find("dog\\:hausnummer,hausnummer")[0].textContent;
                        if ($(hit).find("dog\\:hausnummernzusatz,hausnummernzusatz")[0] !== undefined) {
                            affix = $(hit).find("dog\\:hausnummernzusatz,hausnummernzusatz")[0].textContent;
                            name = this.get("onlyOneStreetName") + " " + number + affix;
                            addressJoin = this.get("onlyOneStreetName").replace(/ /g, "") + number + affix;
                        }
                        else {
                            name = this.get("onlyOneStreetName") + " " + number ;
                            addressJoin = this.get("onlyOneStreetName").replace(/ /g, "") + number;
                        }

                        // "Hitlist-Objekte"
                        if (addressJoin.search(this.get("searchStringRegExp")) !== -1) {
                            this.pushHits("houseNumbers", {
                                name: name,
                                type: "Adresse",
                                coordinate: coordinate,
                                glyphicon: "glyphicon-map-marker",
                                id: addressJoin.replace(/ /g, "") + "Adresse"
                            });
                        }
                    }, this);
                this.get("isSearchReady").set("numberSearch", true);
            },

            /**
            *
            */
            searchHouseNumbers: function () {
                this.get("isSearchReady").set("numberSearch", false);
                this.getXML(this.get("gazetteerURL"), "StoredQuery_ID=HausnummernZuStrasse&strassenname=" + encodeURIComponent(this.get("onlyOneStreetName")), this.getHouseNumbers, true);
            },

            searchInHouseNumbers: function () {
                var address;

                this.get("isSearchReady").set("numberSearch", false);
                _.each(this.get("houseNumbers"), function (houseNumber) {
                    address = houseNumber.name.replace(/ /g, "");

                    // Prüft ob der Suchstring ein Teilstring vom B-Plan ist
                    if (address.search(this.get("searchStringRegExp")) !== -1) {
                        this.pushHits("hitList", houseNumber);
                    }
                }, this);
                this.get("isSearchReady").set("numberSearch", true);
            },

            /**
             * [getDistricts description]
             * @param  {[type]} data [description]
             * @return {[type]}      [description]
             */
            getDistricts: function (data) {
                var hits = $("wfs\\:member,member", data),
                    coordinate,
                    position,
                    hitName;

                _.each(hits, function (hit) {
                    position = $(hit).find("gml\\:pos,pos")[0].textContent.split(" ");
                    coordinate = [parseFloat(position[0]), parseFloat(position[1])];
                    hitName = $(hit).find("dog\\:kreisname_normalisiert, kreisname_normalisiert")[0].textContent;
                    // "Hitlist-Objekte"
                    this.pushHits("hitList", {
                        name: hitName,
                        type: "Stadtteil",
                        coordinate: coordinate,
                        glyphicon: "glyphicon-map-marker",
                        id: hitName.replace(/ /g, "") + "Stadtteil"
                    });
                }, this);

                this.get("isSearchReady").set("districtSearch", true);
            },

            /**
             * [searchDistricts description]
             * @return {[type]} [description]
             */
            searchDistricts: function () {
                if (this.get("isSearchReady").get("districtSearch") === true) {
                    this.get("isSearchReady").set("districtSearch", false);
                    this.getXML(this.get("gazetteerURL"), "StoredQuery_ID=findeStadtteil&stadtteilname=" + this.get("searchString"), this.getDistricts, true);
                }
            },

            /**
             *
             */
            getParcel: function (data) {
                var hits = $("wfs\\:member,member", data),
                    coordinate,
                    position,
                    geom;

                _.each(hits, function (hit) {
                    position = $(hit).find("gml\\:pos,pos")[0].textContent.split(" ");
                    coordinate = [parseFloat(position[0]), parseFloat(position[1])];
                    geom = $(hit).find("gml\\:posList, posList")[0].textContent;
                    // "Hitlist-Objekte"
                    this.pushHits("hitList", {
                        type: "Parcel",
                        coordinate: coordinate,
                        geom: "geom"
                    });
                }, this);
            },

            /**
             *
             */
            searchParcel: function () {
                var gemarkung, flurstuecksnummer;

                this.get("isSearchReady").set("parcelSearch", false);
                if (this.get("searchString").charAt(4) === " ") {
                    flurstuecksnummer = this.get("searchString").slice(5);
                }
                else {
                    flurstuecksnummer = this.get("searchString").slice(4);
                }
                gemarkung = this.get("searchString").slice(0, 4);
                this.getXML(this.get("gazetteerURL"), "StoredQuery_ID=Flurstueck&gemarkung=" + gemarkung + "&flurstuecksnummer=" + flurstuecksnummer, this.getParcel, true);
                this.get("isSearchReady").set("parcelSearch", true);
            },

            /**
            /**
            *
            */
            searchInBPlans: function () {
                this.get("isSearchReady").set("bPlanSearch", false);
                _.each(this.get("bPlans"), function (bPlan) {
                    // Prüft ob der Suchstring ein Teilstring vom B-Plan ist
                    if (bPlan.name.search(this.get("searchStringRegExp")) !== -1) {
                        this.pushHits("hitList", bPlan);
                    }
                }, this);
                this.get("isSearchReady").set("bPlanSearch", true);
            },

            /**
            *
            */
            searchInFeatures: function () {
                this.get("isSearchReady").set("featureSearch", false);
                _.each(this.get("features"), function (feature) {
                    var featureName = feature.name.replace(/ /g, "");
                    // Prüft ob der Suchstring ein Teilstring vom Feature ist
                    if (featureName.search(this.get("searchStringRegExp")) !== -1) {
                        this.pushHits("hitList", feature);
                    }
                }, this);
                this.get("isSearchReady").set("featureSearch", true);
            },

            /**
             *
             */
            searchInNodes: function () {
                this.get("isSearchReady").set("nodeSearch", false);
                _.each(this.get("nodes"), function (node) {
                    var nodeName = node.name.replace(/ /g, "");

                    if (nodeName.search(this.get("searchStringRegExp")) !== -1) {
                        this.pushHits("hitList", node);
                    }
                }, this);
                this.get("isSearchReady").set("nodeSearch", true);
            },

            /**
            *
            */
            searchInLayers: function () {
                this.get("isSearchReady").set("layerSearch", false);
                _.each(this.get("layers"), function (layer) {
                    var layerName = layer.name.replace(/ /g, ""),
                        metaName;

                    if (layer.metaName !== undefined) {
                        metaName = layer.metaName.replace(/ /g, "");
                        if (layerName.search(this.get("searchStringRegExp")) !== -1 || metaName.search(this.get("searchStringRegExp")) !== -1) {
                            this.pushHits("hitList", layer);
                        }
                    }
                    else {
                        if (layerName.search(this.get("searchStringRegExp")) !== -1) {
                            this.pushHits("hitList", layer);
                        }
                    }
                }, this);
                this.get("isSearchReady").set("layerSearch", true);
            },

            /**
             *
             *
             */
            getLayerForSearch: function (layerModels) {
                this.set("layers", []);
                // Damit jeder Layer nur einmal in der Suche auftaucht, auch wenn er in mehreren Kategroien enthalten ist
                layerModels = _.uniq(layerModels, function (model) {
                    return model.get("name");
                });
                _.each(layerModels, function (model) {
                    this.pushHits("layers", {name: model.get("name"), metaName: model.get("metaName"), type: "Thema", glyphicon: "glyphicon-list", id: model.get("id"), model: model});
                }, this);
            },

            /**
             *
             */
            getNodesForSearch: function (node) {
                this.pushHits("nodes", {name: node.get("name"), type: "Thema", glyphicon: "glyphicon-list", id: node.cid, model: node});
            },

            /**
            *
            */
            getFeaturesForSearch: function (layermodels) {
                this.set("features", []);
                var featureArray = [],
                    imageSrc;

                _.each(layermodels, function (layer) {
                    if (_.has(layer.attributes, "searchField") === true && layer.get("searchField") !== "" && layer.get("searchField") !== undefined) {
                        if (layer.get("layer").getStyle()[0]) {
                            imageSrc = layer.get("layer").getStyle()[0].getImage().getSrc();
                            if (imageSrc) {
                                var features = layer.get("layer").getSource().getFeatures();

                                _.each(features, function (feature) {
                                    featureArray.push({name: feature.get("name"), type: "Krankenhaus", coordinate: feature.getGeometry().getCoordinates(), imageSrc: imageSrc, id: feature.get("name").replace(/ /g, "") + layer.get("name")});
                                });
                            }
                        }
                    }
                });
                this.pushHits("features", featureArray);
            },

            /**
             * [getFeaturesFromWFS description]
             */
            getWFSFeatures: function () {
                _.each(Config.searchBar.getFeatures, function (element) {
                    if (element.filter === "olympia") {
                        this.getXML(element.url, "typeNames=" + element.typeName, this.getFeaturesForOlympia, false);
                    }
                    else if (element.filter === "paralympia") {
                        this.getXML(element.url, "typeNames=" + element.typeName, this.getFeaturesForParalympia, false);
                    }
                    else if (element.filter === "bplan") {
                        this.getXML(element.url, "typeNames=" + element.typeName + "&propertyName=" + element.propertyName, this.getFeaturesForBPlan, false);
                    }
                }, this);
            },

            getFeaturesForBPlan: function (data) {
                var hits = $("wfs\\:member,member", data),
                    name,
                    type;

                _.each(hits, function (hit) {
                    if ($(hit).find("app\\:planrecht, planrecht")[0] !== undefined) {
                        name = $(hit).find("app\\:planrecht, planrecht")[0].textContent;
                        type = "festgestellt";
                    }
                    else {
                        name = $(hit).find("app\\:plan, plan")[0].textContent;
                        type = "im Verfahren";
                    }
                    // "Hitlist-Objekte"
                    this.pushHits("bPlans", {
                        name: name.trim(),
                        type: type,
                        glyphicon: "glyphicon-picture",
                        id: name.replace(/ /g, "") + "BPlan"
                    });
                }, this);
            },

            /**
             * success-Funktion für die Olympiastandorte
             * @param  {xml} data - getFeature-Request
             */
            getFeaturesForOlympia: function (data) {
                var hits = $("wfs\\:member,member", data),
                    coordinate,
                    position,
                    hitType,
                    hitName;

                _.each(hits, function (hit) {
                   if ($(hit).find("gml\\:pos,pos")[0] !== undefined) {
                        position = $(hit).find("gml\\:pos,pos")[0].textContent.split(" ");
                        coordinate = [parseFloat(position[0]), parseFloat(position[1])];
                        if ($(hit).find("app\\:piktogramm, piktogramm")[0] !== undefined && $(hit).find("app\\:art,art")[0].textContent !== "Umring") {
                            hitName = $(hit).find("app\\:piktogramm, piktogramm")[0].textContent;
                            hitType = $(hit).find("app\\:staette, staette")[0].textContent;
                            this.pushHits("olympia", {
                                name: hitName,
                                type: "Olympiastandort",
                                coordinate: coordinate,
                                glyphicon: "glyphicon-fire",
                                id: hitName.replace(/ /g, "") + "Olympia"
                            });
                        }
                   }
                }, this);
            },

            /**
             * success-Funktion für die Paralympiastandorte
             * @param  {xml} data - getFeature-Request
             */
            getFeaturesForParalympia: function (data) {
                var hits = $("wfs\\:member,member", data),
                    coordinate,
                    position,
                    hitType,
                    hitName;

                _.each(hits, function (hit) {
                   if ($(hit).find("gml\\:pos,pos")[0] !== undefined) {
                        position = $(hit).find("gml\\:pos,pos")[0].textContent.split(" ");
                        coordinate = [parseFloat(position[0]), parseFloat(position[1])];
                        if ($(hit).find("app\\:piktogramm, piktogramm")[0] !== undefined && $(hit).find("app\\:art,art")[0].textContent !== "Umring") {
                            hitName = $(hit).find("app\\:piktogramm, piktogramm")[0].textContent;
                            hitType = $(hit).find("app\\:staette, staette")[0].textContent;
                            this.pushHits("olympia", {
                                name: hitName,
                                type: "Paralympiastandort",
                                coordinate: coordinate,
                                glyphicon: "glyphicon-fire",
                                id: hitName.replace(/ /g, "") + "Paralympia"
                            });
                        }
                   }
                }, this);
            },

            /**
            *
            */
            searchInOlympiaFeatures: function () {
                this.get("isSearchReady").set("wfsFeatureSearch", false);
                _.each(this.get("olympia"), function (feature) {
                    _.each(feature.name.split(","), function (ele) {
                        var eleName = ele.replace(/ /g, "");
                        // Prüft ob der Suchstring ein Teilstring vom Feature ist
                        if (eleName.search(this.get("searchStringRegExp")) !== -1) {
                            this.pushHits("hitList", {
                                name: ele,
                                type: feature.type,
                                coordinate: feature.coordinate,
                                glyphicon: "glyphicon-fire",
                                id: feature.id
                            });
                        }
                    }, this);
                }, this);
                this.get("isSearchReady").set("wfsFeatureSearch", true);
            },

            /**
            *
            */
            createRecommendedList: function () {
                this.set("isHitListReady", false);
                if (this.get("hitList").length > 5) {
                    var numbers = [];

                    while (numbers.length < 5) {
                        var randomNumber = _.random(0, this.get("hitList").length - 1);

                        if (_.contains(numbers, randomNumber) === false) {
                            numbers.push(randomNumber);
                        }
                    }
                    var mapHitList = _.map(numbers, function (number) {
                        return this.get("hitList")[number];
                    }, this);

                    this.set("recommendedList", mapHitList);
                }
                else {
                    this.set("recommendedList", this.get("hitList"));
                }
                this.set("isHitListReady", true);
            }
        });

        return new Searchbar();
    });
