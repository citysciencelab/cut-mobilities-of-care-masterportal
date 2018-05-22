define(function (require) {

    require("modules/searchbar/model");
    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        SpecialWFSModel;

    SpecialWFSModel = Backbone.Model.extend({
        defaults: {
            minChars: 3,
            glyphicon: "glyphicon-home",
            wfsMembers: {}
        },

        /**
         * @description Initialisierung der wfsFeature Suche.
         * @param {Objekt} config - Das Konfigurationsarray für die specialWFS-Suche
         * @param {integer} [config.minChars=3] - Mindestanzahl an Characters, bevor eine Suche initiiert wird.
         * @param {Object[]} config.definitions - Definitionen der SpecialWFS.
         * @param {Object} config.definitions[].definition - Definition eines SpecialWFS.
         * @param {string} config.definitions[].definition.url - Die URL, des WFS
         * @param {string} config.definitions[].definition.data - Query string des WFS-Request
         * @param {string} config.definitions[].definition.name - Name der speziellen Filterfunktion (bplan|kita)
         */
         initialize: function (config) {
            if (config.minChars) {
                this.setMinChars(config.minChars);
            }
            // Jede Konfiguration eines SpecialWFS wird abgefragt
            _.each(config.definitions, function (element) {
                this.sendRequest(element, false);
            }, this);

            // set Listener
            this.listenTo(Radio.channel("Searchbar"), {
                "search": this.search
            });
            this.listenTo(Radio.channel("SpecialWFS"), {
                "requestbplan": this.requestbplan
            });

            // initiale Suche
            if (_.isUndefined(Radio.request("ParametricURL", "getInitString")) === false) {
                this.search(Radio.request("ParametricURL", "getInitString"));
            }
        },

        /**
         * @description Suchfunktion, wird von Searchbar getriggert
         * @param {string} searchString - Der Suchstring.
         */
         search: function (searchString) {
            var searchStringRegExp = new RegExp(searchString.replace(/ /g, ""), "i"); // Erst join dann als regulärer Ausdruck

            if (searchString.length > this.getMinChars()) {
                // if (this.get("bPlans").length > 0) {
                //     this.searchInBPlans(searchString);
                // }
                // if (this.get("kita").length > 0) {
                //     this.searchInKita(searchStringRegExp);
                // }
                // if (this.get("stoerfallbetrieb").length > 0) {
                //     this.searchInStoerfallbetrieb(searchStringRegExp);
                // }
                // Radio.trigger("Searchbar", "createRecommendedList");
            }
        },

        /**
         * Prosin-WFS liefern keine Koordinate mit aus, daher muss diese separat abgefragt werden
         * @param  {string} type Name des Typs des SpecialWFS
         * @param  {string} name B-Planname
         */
         requestbplan: function (type, name) {
            var typeName = (type === "festgestellt") ? "prosin_festgestellt" : "prosin_imverfahren",
                propertyName = (type === "festgestellt") ? "planrecht" : "plan",
                data = "<?xml version='1.0' encoding='UTF-8'?><wfs:GetFeature service='WFS' version='1.1.0' xmlns:app='http://www.deegree.org/app' xmlns:wfs='http://www.opengis.net/wfs' xmlns:gml='http://www.opengis.net/gml' xmlns:ogc='http://www.opengis.net/ogc' xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xsi:schemaLocation='http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/wfs.xsd'><wfs:Query typeName='" + typeName + "'><ogc:Filter><ogc:PropertyIsEqualTo><ogc:PropertyName>app:" + propertyName + "</ogc:PropertyName><ogc:Literal>" + name + "</ogc:Literal></ogc:PropertyIsEqualTo></ogc:Filter></wfs:Query></wfs:GetFeature>";

            this.sendRequest(this.get("bplanURL"), data, this.getExtentFromBPlan, true);
        },
        /**
        * @description Methode zum Zurückschicken des gefundenen Plans an mapHandler.
        * @param {string} data - Die Data-XML.
        */
        getExtentFromBPlan: function (data) {
            Radio.trigger("MapMarker", "zoomToBPlan", data);
        },
        /**
        *
        */
        searchInKita: function (searchStringRegExp) {
            _.each(this.get("kita"), function (kita) {
                // Prüft ob der Suchstring ein Teilstring vom kita ist
                if (kita.name.search(searchStringRegExp) !== -1) {
                    Radio.trigger("Searchbar", "pushHits", "hitList", kita);
                }
            }, this);
        },
        /**
         *
         */
         searchInStoerfallbetrieb: function (searchStringRegExp) {
            _.each(this.get("stoerfallbetrieb"), function (stoerfallbetrieb) {
                // Prüft ob der Suchstring ein Teilstring vom stoerfallbetrieb ist
                if (stoerfallbetrieb.name.search(searchStringRegExp) !== -1) {
                    Radio.trigger("Searchbar", "pushHits", "hitList", stoerfallbetrieb);
                }
            }, this);
        },
        /**
        *
        */
        searchInBPlans: function (searchString) {
            _.each(this.get("bPlans"), function (bPlan) {
                searchString = searchString.replace(/ö/g, "oe");
                searchString = searchString.replace(/ä/g, "ae");
                searchString = searchString.replace(/ü/g, "ue");
                searchString = searchString.replace(/ß/g, "ss");
                var searchBplanStringRegExp = new RegExp(searchString.replace(/ /g, ""), "i");
                // Prüft ob der Suchstring ein Teilstring vom B-Plan ist
                if (bPlan.name.search(searchBplanStringRegExp) !== -1) {
                    Radio.trigger("Searchbar", "pushHits", "hitList", bPlan);
                }
            }, this);
        },

        /**
         *Schreibt Ergebnisse in "bplan".
         * @param  {xml} data - getFeature-Request
         */
         getFeaturesForBPlan: function (data) {
            var hits = $("wfs\\:member,member", data),
                name,
                type,
                elements = [];

            _.each(hits, function (hit) {
                elements.push($(hit).first()[0].textContent.trim());
                if (!_.isUndefined($(hit).find("app\\:planrecht, planrecht")[0])) {
                    name = $(hit).find("app\\:planrecht, planrecht")[0].textContent;
                    type = "festgestellt";
                    // BPlan-Objekte
                    this.get("bPlans").push({
                        name: name.trim(),
                        type: type,
                        glyphicon: "glyphicon-picture",
                        id: name.replace(/ /g, "") + "BPlan"
                    });
                }
                else {
                    if (!_.isUndefined($(hit).find("app\\:plan, plan")[0])) {
                        name = $(hit).find("app\\:plan, plan")[0].textContent;
                        type = "im Verfahren";
                        // BPlan-Objekte
                        this.get("bPlans").push({
                            name: name.trim(),
                            type: type,
                            glyphicon: "glyphicon-picture",
                            id: name.replace(/ /g, "") + "BPlan"
                        });
                    }
                }
            }, this);

            return elements;
        },

        /**
         * success-Funktion für die Kitastandorte. Schreibt Ergebnisse in "kita".
         * @param  {xml} data - getFeature-Request
         */
         getFeaturesForKita: function (data) {
            var hits = $("wfs\\:member,member", data),
            coordinate,
            position,
            hitName;

            _.each(hits, function (hit) {
             if ($(hit).find("gml\\:pos,pos")[0] !== undefined) {
                position = $(hit).find("gml\\:pos,pos")[0].textContent.split(" ");
                coordinate = [parseFloat(position[0]), parseFloat(position[1])];
                if ($(hit).find("app\\:Name, Name")[0] !== undefined) {
                    hitName = $(hit).find("app\\:Name, Name")[0].textContent;
                    this.get("kita").push({
                        name: hitName,
                        type: "Kita",
                        coordinate: coordinate,
                        glyphicon: "glyphicon-home",
                        id: hitName.replace(/ /g, "") + "Kita"
                    });
                }
            }
        }, this);
        },
            /**
         * success-Funktion für die Störfallbetriebe. Schreibt Ergebnisse in "stoerfallbetrieb".
         * @param  {xml} data - getFeature-Request
         */
         getFeaturesForStoerfallbetrieb: function (data) {
            var hits = $("gml\\:featureMember,featureMember", data),
            coordinate,
            position,
            hitName;

            _.each(hits, function (hit) {
                if ($(hit).find("gml\\:pos,pos")[0] !== undefined) {
                    position = $(hit).find("gml\\:pos,pos")[0].textContent.split(" ");
                    coordinate = [parseFloat(position[0]), parseFloat(position[1])];
                    if ($(hit).find("app\\:standort, standort")[0] !== undefined) {
                        hitName = $(hit).find("app\\:standort, standort")[0].textContent;
                        this.get("stoerfallbetrieb").push({
                            name: hitName,
                            type: "Stoerfallbetrieb",
                            coordinate: coordinate,
                            glyphicon: "glyphicon-home",
                            id: hitName.replace(/ /g, "") + "Stoerfallbetrieb"
                        });
                    }
                }
            }, this);
        },

        getWFSMembers: function (data) {
            var hits = $("wfs\\:member,member", data),
                type = this.getRequestInfo().type,
                url = this.getRequestInfo().url,
                glyphicon = this.getRequestInfo().glyphicon,
                elements = [];

            _.each(hits, function (hit) {
                elements.push({
                    id: _.uniqueId("type"),
                    name: $(hit).first()[0].textContent.trim(),
                    type: type,
                    glyphicon: glyphicon
                });
            });

            this.setWfsMembers(type, elements);
            // console.log(this.getWFSMembers());
        },

        /**
         * @description Führt einen HTTP-Request aus.
         * @param {String} url - A string containing the URL to which the request is sent
         * @param {String} data - Data to be sent to the server
         * @param {function} successFunction - A function to be called if the request succeeds
         * @param {boolean} asyncBool - asynchroner oder synchroner Request
         * @param {boolean} [usePOST] - POST anstelle von GET?
         */
         sendRequest: function (element, usePOST) {
            var type = (usePOST && usePOST === true) ? "POST" : "GET",
                url = element.url,
                data = element.data,
                name = element.name,
                glyphicon = element.glyphicon ? element.glyphicon : this.getGlyphicon();

            this.setRequestInfo({
                url: url,
                data: data,
                type: name,
                glyphicon: glyphicon
            });

            $.ajax({
                url: url,
                data: data,
                context: this,
                async: false,
                type: type,
                success: this.getWFSMembers,
                timeout: 6000,
                contentType: "text/xml",
                error: function () {
                    Radio.trigger("Alert", "alert", url + " nicht erreichbar.");
                }
            });
        },

        // getter for minChars
        getMinChars: function () {
            return this.get("minChars");
        },
        // setter for minChars
        setMinChars: function (value) {
            this.set("minChars", value);
        },

        // getter for RequestInfo
        getRequestInfo: function () {
            return this.get("requestInfo");
        },
        // setter for RequestInfo
        setRequestInfo: function (value) {
            this.set("requestInfo", value);
        },

        // getter for Glyphicon
        getGlyphicon: function () {
            return this.get("glyphicon");
        },

        // getter for wfsMembers
        getWfsMembers: function () {
            return this.get("wfsMembers");
        },
        // setter for wfsMembers
        setWfsMembers: function (key, values) {
            var wfsMembers = this.get("wfsMembers"),
                oldObj,
                oldValues,
                newObj;

            if (!_.has(wfsMembers, key)) {
                newObj = _.object([key], [values]);
                _.extend(wfsMembers, newObj);
            }
            else {
                oldObj = _.pick(wfsMembers, key);
                oldValues = _.values(oldObj)[0];
                newObj = _.object([key], [_.union(oldValues, values)]);
                wfsMembers = _.omit(wfsMembers, key);
                 _.extend(wfsMembers, newObj);
            }

            this.set("wfsMembers", wfsMembers);
        }
    });

    return SpecialWFSModel;
});
