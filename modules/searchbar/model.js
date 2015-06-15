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
                layers: [],
                houseNumbers: [],
                isOnlyOneStreet: false, // Wenn true --> Hausnummernsuche startet
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

                this.set("isSearchReady", new SearchReady());

                // Prüfen ob BPlan-Suche konfiguriert ist. Wenn ja --> B-Pläne laden(bzw. die Namen der B-Pläne) und notwendige Attrbiute setzen
                if (Config.bPlan !== undefined) {
                    this.set("bPlanURL", Config.bPlan.url());
                    this.set("bPlans", []);
                    this.get("isSearchReady").set("bPlanSearch", false);
                    this.getBPlans();
                }
                // Initiale Suche query=...
                if (Config.searchBar.initString !== undefined) {
                    if (Config.searchBar.initString.search(",") !== -1) {
                        var splitInitString = Config.searchBar.initString.split(",");

                        this.set("onlyOneStreetName", splitInitString[0]);
                        this.set("isOnlyOneStreet", true);
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
                EventBus.trigger("getVisibleWFSLayer");
                EventBus.trigger("getAllLayer");
            },

            /**
            *
            */
            setSearchString: function (value) {
                this.set("searchString", value);
                // NOTE hier muss ich nochmal bei. Stichwort "Backspacetaste gedrückt lassen"
                if (value === "" || value.length < 3) {
                    this.set("isOnlyOneStreet", false);
                }
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
                    if (_.has(Config, "tree") === true) {
                        this.searchInLayers();
                    }
                    if (_.has(Config, "bPlan") === true) {
                        this.searchInBPlans();
                    }
                }
            },

            /**
            *
            */
            searchStreets: function () {
                if (this.get("isSearchReady").get("streetSearch") === true) {
                    this.get("isSearchReady").set("streetSearch", false);
                    // Prüft ob der Suchstring ein Teilstring vom Straßennamen ist. Und ob zurzeit nur eine Straße vorhanden ist.
                    if (this.get("isOnlyOneStreet") === true && this.get("onlyOneStreetName").search(this.get("searchStringRegExp")) !== -1) {
                        // Damit die Straßensuche auch funktioniert wenn nach Hausnummern gesucht wird.
                        this.getXML("StoredQuery_ID=findeStrasse&strassenname=" + encodeURIComponent(this.get("onlyOneStreetName")), this.getStreets);
                    }
                    else {
                        this.getXML("StoredQuery_ID=findeStrasse&strassenname=" + encodeURIComponent(this.get("searchString")), this.getStreets);
                    }
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

                // Marker - wurde mehr als eine Straße gefunden
                if (hits.length === 1) {
                    this.set("onlyOneStreetName", hitName);
                    // Prüft ob der Suchstring ein Teilstring vom Straßennamen ist. Wenn nicht, dann wird die Hausnummernsuche ausgeführt.
                    if (this.get("onlyOneStreetName").search(this.get("searchStringRegExp")) === -1) {
                        this.searchInHouseNumbers();
                        this.set("isOnlyOneStreet", true);
                    }
                    else {
                           this.set("isOnlyOneStreet", false);
                    }
                }
                else {
                    this.set("isOnlyOneStreet", false);
                    this.get("isSearchReady").set("numberSearch", true);
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
                this.getXML("StoredQuery_ID=HausnummernZuStrasse&strassenname=" + encodeURIComponent(this.get("onlyOneStreetName")), this.getHouseNumbers);
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
             * [getXML description]
             * @param  {[type]} storedquery [description]
             * @param  {[type]} func        [description]
             */
            getXML: function (storedQuery, successFunction) {
                $.ajax({
                    url: this.get("gazetteerURL"),
                    data: storedQuery,
                    context: this,
                    async: true,
                    type: "GET",
                    success: successFunction
                });
            },

            /**
             * [postXML description]
             * @param  {[type]} xmlString       [description]
             * @param  {[type]} successFunction [description]
             */
            postXML: function (xmlString, successFunction) {
                $.ajax({
                    url: this.get("bPlanURL"),
                    context: this,
                    contentType: "text/xml",
                    async: false,
                    type: "POST",
                    data: xmlString,
                    success: successFunction
                });
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
                    this.getXML("StoredQuery_ID=findeStadtteil&stadtteilname=" + this.get("searchString"), this.getDistricts);
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
                this.getXML("StoredQuery_ID=Flurstueck&gemarkung=" + gemarkung + "&flurstuecksnummer=" + flurstuecksnummer, this.getParcel);
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
            searchInLayers: function () {
                this.get("isSearchReady").set("layerSearch", false);
                _.each(this.get("layers"), function (layer) {
                    var layerName = layer.name.replace(/ /g, ""),
                        metaName = layer.metaName.replace(/ /g, "");

                    if (layer.metaName !== undefined) {
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

            getBPlanss: function (data) {
                var hits = $("gml\\:featureMember,featureMember", data),
                    name;

                _.each(hits, function (hit) {
                    name = $(hit).find(this.get("namespaceBPlan"))[0].textContent;
                    // "Hitlist-Objekte"
                    this.pushHits("bPlans", {
                        name: name.trim(),
                        type: this.get("bplantyp"),
                        glyphicon: "glyphicon-picture",
                        id: name.replace(/ /g, "") + "BPlan"
                    });
                }, this);
            },

            /**
            *
            */
            getBPlans: function () {
                var xmlString = "<?xml version='1.0' encoding='UTF-8'?><wfs:GetFeature service='WFS' version='1.1.0' xmlns:app='http://www.deegree.org/app' xmlns:wfs='http://www.opengis.net/wfs' xmlns:gml='http://www.opengis.net/gml' xmlns:ogc='http://www.opengis.net/ogc' xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xsi:schemaLocation='http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/wfs.xsd'><wfs:Query typeName='app:imverfahren'><wfs:PropertyName>app:plan</wfs:PropertyName></wfs:Query></wfs:GetFeature>";

                this.set("bplantyp", "im Verfahren");
                this.set("namespaceBPlan", "app\\:plan, plan");
                this.postXML(xmlString, this.getBPlanss);

                this.set("bplantyp", "festgestellt");
                this.set("namespaceBPlan", "app\\:planrecht, planrecht");
                xmlString = "<?xml version='1.0' encoding='UTF-8'?><wfs:GetFeature service='WFS' version='1.1.0' xmlns:app='http://www.deegree.org/app' xmlns:wfs='http://www.opengis.net/wfs' xmlns:gml='http://www.opengis.net/gml' xmlns:ogc='http://www.opengis.net/ogc' xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xsi:schemaLocation='http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/wfs.xsd'><wfs:Query typeName='app:hh_hh_planung_festgestellt'><wfs:PropertyName>app:planrecht</wfs:PropertyName></wfs:Query></wfs:GetFeature>";
                this.postXML(xmlString, this.getBPlanss);
            },

            /**
             *
             *
             */
            getLayerForSearch: function (layerModels) {
                _.each(layerModels, function (model) {
                    this.pushHits("layers", {name: model.get("name"), metaName: model.get("metaName"), type: "Thema", glyphicon: "glyphicon-list", id: model.get("id"), model: model});
                }, this);
            },

            /**
            *
            */
            getFeaturesForSearch: function (layermodels) {
                this.set("features", []);
                var featureArray = [];

                _.each(layermodels, function (layer) {
                    if (_.has(layer.attributes, "searchField") === true && layer.get("searchField") !== "") {
                        var imageSrc = layer.get("layer").getStyle()[0].getImage().getSrc();

                        if (imageSrc) {
                            var features = layer.get("source").getFeatures();

                            _.each(features, function (feature) {
                                featureArray.push({name: feature.get("name"), type: "Krankenhaus", coordinate: feature.getGeometry().getCoordinates(), imageSrc: imageSrc, id: feature.get("name").replace(/ /g, "") + layer.get("name")});
                            });
                        }
                    }
                });
                this.pushHits("features", featureArray);
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
