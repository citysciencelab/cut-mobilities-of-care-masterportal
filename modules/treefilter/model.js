define(function (require) {
    var Config = require("config"),
        $ = require("jquery"),
        TreeFilter;

    TreeFilter = Backbone.Model.extend({
        defaults: {
            filter: "",
            filterHits: "", // Filtertreffer
            isFilter: false,
            errors: "",
            treeCategory: "", // Baumgattung
            treeType: "", // Baumart
            yearMin: "0", // Pflanzjahr von
            yearMax: "2017", // Pflanzjahr bis
            diameterMin: "0", // Kronendurchmesser[m] von
            diameterMax: "50", // Kronendurchmesser[m] bis
            perimeterMin: "0", // Stammumfang[cm] von
            perimeterMax: "1000", // Stammumfang[cm] bis
            searchCategoryString: "", // Treffer für die Vorschalgsuche der Baumgattung
            searchTypeString: "", // Treffer für die Vorschalgsuche der Baumart
            treeConf: ""
        },
        url: function () {
            return Radio.request("Util", "getPath", this.get("treeConf"));
        },
        initialize: function () {
            var model = Radio.request("ModelList", "getModelByAttributes", {id: "182"});

            this.listenTo(Radio.channel("Window"), {
                "winParams": this.setStatus
            });

            if (!_.isUndefined(model)) {
                this.setListenerForVisibility(model);
            }
            else {
                Radio.trigger("Alert", "alert", "Layer 182 (Straßenbäume) nicht definiert");
            }
            this.listenTo(this, "change:searchCategoryString", this.setCategoryArray);
            this.listenTo(this, "change:treeCategory", this.setTypeArray);
            this.listenTo(this, "change:searchTypeString", this.setTypeArray);
            this.listenTo(this, "change:SLDBody", this.updateStyleByID);
            this.listenTo(this, "change:SLDBody", this.getFilterHits);

            this.fetch({
                cache: false,
                async: false,
                success: function (treeModel) {
                    // speichert alle Baumgattung in ein Array
                    var catArray = [];

                    _.each(treeModel.get("trees"), function (tree) {
                        catArray.push(tree.displayGattung);
                    });
                    treeModel.set("categoryArray", catArray);
                    treeModel.set("typeArray", []); // speichert später jeweils zur Category die Types
                }
            });
        },
        setStatus: function (args) { // Fenstermanagement
            if (args[2].get("id") === "treeFilter" && args[0] === true) {
                this.set("isCollapsed", args[1]);
                this.set("isCurrentWin", args[0]);
                $("#window").css("max-width", "420px");
            }
            else {
                $("#window").css("max-width", "");
                this.set("isCurrentWin", false);
            }
        },
        setListenerForVisibility: function (model) {
            model.listenTo(model, "change:visibleInMap", function () {
                Radio.trigger("ModelList", "setModelAttributesById", "2298", {"visibleInMap": model.get("visibleInMap")});
            });
        },
        parse: function (response) {
            this.set("trees", response.trees);
            // macht aus "Ailanthus / Götterbaum" = Götterbaum(Ailanthus)
            _.each(this.get("trees"), function (tree) {
                var split = tree.Gattung.split("/"),
                    treeArray = [],
                    categorySplit;

                if (split[1] !== undefined) {
                    categorySplit = split[1].trim() + " (" + split[0].trim() + ")";
                }
                else {
                    categorySplit = split[0].trim();
                }
                tree.displayGattung = categorySplit;

                _.each(tree.Arten, function (type) {
                    var typeSplit;

                    split = type.split("/");
                    if (split[1] !== undefined) {
                        typeSplit = split[1].trim() + " (" + split[0].trim() + ")";
                    }
                    else {
                        typeSplit = split[0].trim();
                    }
                    treeArray.push({species: type, display: typeSplit});
                });
                // Arten nach den deutschen Namen sortierien
                tree.Arten = _.sortBy(treeArray, function (type) {
                    return type.display;
                });
            }, this);
            // Bäume nach Gattung sortieren
            this.set("trees", _.sortBy(this.get("trees"), function (tree) {
                return tree.displayGattung;
            }));
        },
        patterns: {
            digits: "[^0-9]" // any character except the range in brackets
        },
        validators: {
            minLength: function (value, minLength) {
                return value.length >= minLength;
            },
            maxLength: function (value, maxLength) {
                return value.length <= maxLength;
            },
            maxValue: function (value, maxValue) {
                return value <= maxValue;
            },
            minValue: function (value, minValue) {
                return value >= minValue;
            },
            isLessThan: function (min, max) {
                return min <= max;
            },
            pattern: function (value, pattern) {
                return Boolean(new RegExp(pattern, "gi").test(value));
            },
            hasCharacters: function (value) {
                return TreeFilter.prototype.validators.pattern(value, TreeFilter.prototype.patterns.digits);
            }
        },
        validate: function (attributes) {
            var jetzt = new Date(),
                year = jetzt.getFullYear(),
                errors = {};

            if (attributes.yearMax !== null && attributes.yearMin !== null) {
                if (this.validators.hasCharacters(attributes.yearMax) === true || this.validators.hasCharacters(attributes.yearMin) === true) {
                    errors.yearError = "Die Jahreszahl muss aus Ziffern bestehen";
                }
                else if (this.validators.minLength(attributes.yearMax, 4) === false) {
                    errors.yearError = "Bitte geben Sie eine vierstellige Zahl ein";
                }
                else if (this.validators.maxValue(attributes.yearMax, year) === false) {
                    errors.yearError = "Wir befinden uns erst im Jahr " + year;
                }
                else if (this.validators.maxLength(attributes.yearMax, 4) === false || this.validators.maxLength(attributes.yearMin, 4) === false) {
                    errors.yearError = "Bitte geben Sie eine vierstellige Zahl ein";
                }
                else if (this.validators.isLessThan(parseInt(attributes.yearMin, 10), parseInt(attributes.yearMax, 10)) === false) {
                    errors.yearError = "Logischer Fehler der Werte";
                }
            }

            if (attributes.diameterMin !== null && attributes.diameterMax !== null) {
                if (this.validators.hasCharacters(attributes.diameterMax) === true || this.validators.hasCharacters(attributes.diameterMin) === true) {
                    errors.diamterError = "Der Kronendurchmesser muss aus Ziffern bestehen";
                }
                else if (this.validators.isLessThan(parseInt(attributes.diameterMin, 10), parseInt(attributes.diameterMax, 10)) === false) {
                    errors.diamterError = "Logischer Fehler der Werte";
                }
                else if (this.validators.maxValue(attributes.diameterMax, 50) === false) {
                    errors.diamterError = "max. Wert 50";
                }
            }

            if (attributes.perimeterMin !== null && attributes.perimeterMax !== null) {
                if (this.validators.hasCharacters(attributes.perimeterMax) === true || this.validators.hasCharacters(attributes.perimeterMin) === true) {
                    errors.perimeterError = "Der Stammumfang muss aus Ziffern bestehen";
                }
                else if (this.validators.isLessThan(parseInt(attributes.perimeterMin, 10), parseInt(attributes.perimeterMax, 10)) === false) {
                    errors.perimeterError = "Logischer Fehler der Werte";
                }
                else if (this.validators.maxValue(attributes.perimeterMax, 1000) === false) {
                    errors.perimeterError = "max. Wert 1000";
                }
            }
            this.set("errors", errors);
            if (_.isEmpty(errors) === false) {
                return errors;
            }
        },
        setCategory: function (value) {
            this.set("treeCategory", value);
        },
        setSearchCategoryString: function (value) {
            this.set("searchCategoryString", value);
            $("#categoryInput").val(this.get("searchCategoryString"));
        },
        setCategoryArray: function () {
            var catArray = [];

            _.each(this.get("trees"), function (tree) {
                var myRegExp = new RegExp(this.get("searchCategoryString"), "i");

                if (tree.displayGattung.search(myRegExp) !== -1) {
                    catArray.push(tree.displayGattung);
                }
            }, this);
            if (catArray.length === 0) {
                catArray.push("Keine Treffer");
            }
            this.set("categoryArray", catArray);
        },
        setType: function (value) {
            this.set("treeType", value);
        },
        setSearchTypeString: function (value) {
            this.set("searchTypeString", value);
            $("#typeInput").val(this.get("searchTypeString"));
        },
        setTypeArray: function () {
            var typeArray = [],
                tree = _.where(this.get("trees"), {displayGattung: this.get("treeCategory")});

            if (tree[0] !== undefined) {
                _.each(tree[0].Arten, function (type) {
                    var myRegExp;

                    if (this.get("searchTypeString").length === 0) {
                        typeArray.push(type.display);
                    }
                    else {
                        myRegExp = new RegExp(this.get("searchTypeString"), "i");
                        if (type.display.search(myRegExp) !== -1) {
                            typeArray.push(type.display);
                        }
                    }
                }, this);
            }
            this.set("typeArray", typeArray);
        },
        setFilterParams: function () { // NOTE aufbröseln in einzelMethoden...irgendwann
            var tree = _.where(this.get("trees"), {displayGattung: $("#categoryInput").val()}),
                treeType;

            if (tree[0] === undefined) {
                this.set("treeFilterCategory", "");
                this.set("treeFilterType", "");
            }
            else {
                this.set("treeFilterCategory", tree[0].Gattung);
                treeType = _.where(tree[0].Arten, {display: $("#typeInput").val()});
                if (treeType[0] !== undefined) {
                    this.set("treeFilterType", treeType[0].species);
                }
                else {
                    this.set("treeFilterType", "");
                }
            }
            // this.set("yearMax", $("#yearMax > input").val());
            // this.set("yearMin", $("#yearMin > input").val());
            // this.set("diameterMax", $("#diameterMax > input").val());
            // this.set("diameterMin", $("#diameterMin > input").val());
            // this.set("perimeterMax", $("#perimeterMax > input").val());
            // this.set("perimeterMin", $("#perimeterMin > input").val());

            if (this.isValid() === true) {
                this.set("isFilter", true);
                this.createFilter();
            }
        },
        updateStyleByID: function () {
            Radio.trigger("ModelList", "setModelAttributesById", "182", {"SLDBody": this.get("SLDBody")});
            if (this.get("isFilter") === true) {
                Radio.trigger("ModelList", "setModelAttributesById", "2297", {"displayInTree": false, "visibility": false});
                Radio.trigger("ModelList", "setModelAttributesById", "182", {"displayInTree": true, "visibility": true});
                Radio.trigger("ModelList", "setModelAttributesById", "2298", {"visibility": true});
            }
            else {
                Radio.trigger("ModelList", "setModelAttributesById", "2297", {"displayInTree": true, "visibility": true});
                Radio.trigger("ModelList", "setModelAttributesById", "182", {"displayInTree": false, "visibility": false});
                Radio.trigger("ModelList", "setModelAttributesById", "2298", {"visibility": false});
            }
        },
        removeFilter: function () {
            this.set("errors", "");
            this.set("isFilter", false);
            this.set("filter", "");
            this.unset("SLDBody", "");

            this.set("treeCategory", "");
            this.set("treeType", "");
            // this.set("yearMax", "2014");
            this.setYearMax("2017");
            this.setYearMin("0");
            // this.set("yearMin", "0");
            this.setDiamterMax("50");
            this.setDiameterMin("0");
            // this.set("diameterMax", "50");
            // this.set("diameterMin", "0");
            this.setPerimeterMin("0");
            this.setPerimeterMax("1000");
            // this.set("perimeterMax", "1000");
            // this.set("perimeterMin", "0");
            // $("#yearMax > input").val("2015");
            // $("#yearMin > input").val("0");
            // $("#diameterMax > input").val("50");
            // $("#diameterMin > input").val("0");
            // $("#perimeterMax > input").val("1000");
            // $("#perimeterMin > input").val("0");
        },
        createFilter: function () {
            var filter, symbolizer, header, footer, filterwfs, filterCategory, filterType, filterYear, filterDiameter, filterPerimeter;

            // Filter Gattung und Art
            if (this.get("treeFilterCategory").length !== 0) {
                filterCategory = "<ogc:PropertyIsEqualTo><ogc:PropertyName>app:gattung</ogc:PropertyName><ogc:Literal>" + this.get("treeFilterCategory") + "</ogc:Literal></ogc:PropertyIsEqualTo>";
                if (this.get("treeFilterType").length !== 0) {
                    filterType = "<ogc:PropertyIsEqualTo><ogc:PropertyName>app:art</ogc:PropertyName><ogc:Literal>" + this.get("treeFilterType") + "</ogc:Literal></ogc:PropertyIsEqualTo>";
                }
                else {
                    filterType = "";
                }
            }
            else {
                filterCategory = "";
                filterType = "";
            }

            // Filter Pflanzjahr
            filterYear = "<ogc:PropertyIsGreaterThanOrEqualTo><ogc:PropertyName>app:pflanzjahr</ogc:PropertyName><ogc:Literal>" + this.get("yearMin") + "</ogc:Literal></ogc:PropertyIsGreaterThanOrEqualTo><ogc:PropertyIsLessThan><ogc:PropertyName>app:pflanzjahr</ogc:PropertyName><ogc:Literal>" + (parseInt(this.get("yearMax"), 10) + 1) + "</ogc:Literal></ogc:PropertyIsLessThan>";
            //            filterYear = "<ogc:PropertyIsBetween><ogc:PropertyName>app:pflanzjahr</ogc:PropertyName><ogc:LowerBoundary><ogc:Literal>" + this.get("yearMin") + "</ogc:Literal></ogc:LowerBoundary><ogc:UpperBoundary><ogc:Literal>" + this.get("yearMax") + "</ogc:Literal></ogc:UpperBoundary></ogc:PropertyIsBetween>";
            filterDiameter = "<ogc:PropertyIsGreaterThanOrEqualTo><ogc:PropertyName>app:kronendurchmesser</ogc:PropertyName><ogc:Literal>" + this.get("diameterMin") + "</ogc:Literal></ogc:PropertyIsGreaterThanOrEqualTo><ogc:PropertyIsLessThan><ogc:PropertyName>app:kronendurchmesser</ogc:PropertyName><ogc:Literal>" + (parseInt(this.get("diameterMax"), 10) + 1) + "</ogc:Literal></ogc:PropertyIsLessThan>";
            //            filterDiameter = "<ogc:PropertyIsBetween><ogc:PropertyName>app:kronendurchmesser</ogc:PropertyName><ogc:LowerBoundary><ogc:Literal>" + this.get("diameterMin") + "</ogc:Literal></ogc:LowerBoundary><ogc:UpperBoundary><ogc:Literal>" + this.get("diameterMax") + "</ogc:Literal></ogc:UpperBoundary></ogc:PropertyIsBetween>";
            filterPerimeter = "<ogc:PropertyIsGreaterThanOrEqualTo><ogc:PropertyName>app:stammumfang</ogc:PropertyName><ogc:Literal>" + this.get("perimeterMin") + "</ogc:Literal></ogc:PropertyIsGreaterThanOrEqualTo><ogc:PropertyIsLessThan><ogc:PropertyName>app:stammumfang</ogc:PropertyName><ogc:Literal>" + (parseInt(this.get("perimeterMax"), 10) + 1) + "</ogc:Literal></ogc:PropertyIsLessThan>";
            //            filterPerimeter = "<ogc:PropertyIsBetween><ogc:PropertyName>app:stammumfang</ogc:PropertyName><ogc:LowerBoundary><ogc:Literal>" + this.get("perimeterMin") + "</ogc:Literal></ogc:LowerBoundary><ogc:UpperBoundary><ogc:Literal>" + this.get("perimeterMax") + "</ogc:Literal></ogc:UpperBoundary></ogc:PropertyIsBetween>";

            header = "<sld:StyledLayerDescriptor xmlns:sld='http://www.opengis.net/sld' xmlns:se='http://www.opengis.net/se' xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:app='http://www.deegree.org/app' xmlns:ogc='http://www.opengis.net/ogc' xmlns='http://www.opengis.net/sld' version='1.1.0' xsi:schemaLocation='http://www.opengis.net/sld http://schemas.opengis.net/sld/1.1.0/StyledLayerDescriptor.xsd'><sld:NamedLayer><se:Name>strassenbaum</se:Name><sld:UserStyle><se:FeatureTypeStyle><se:Name>strassenbaum</se:Name>";
            filter = "<se:Rule><ogc:Filter><ogc:And>" + filterCategory + filterType + filterYear + filterDiameter + filterPerimeter + "</ogc:And></ogc:Filter>";
            symbolizer = "<se:PointSymbolizer><se:Graphic><se:Mark><se:WellKnownName>circle</se:WellKnownName><se:Fill><se:SvgParameter name='fill'>#55c61d</se:SvgParameter><se:SvgParameter name='fill-opacity'>0.78</se:SvgParameter></se:Fill><se:Stroke><se:SvgParameter name='stroke'>#36a002</se:SvgParameter><se:SvgParameter name='stroke-width'>1</se:SvgParameter></se:Stroke></se:Mark><se:Size>12</se:Size></se:Graphic></se:PointSymbolizer></se:Rule>";

            // filter2 = "<se:Rule><se:PointSymbolizer><se:Graphic><se:Mark><se:WellKnownName>circle</se:WellKnownName><se:Fill><se:SvgParameter name='fill'>#cdcdcd</se:SvgParameter><se:SvgParameter name='fill-opacity'>0.4</se:SvgParameter></se:Fill><se:Stroke><se:SvgParameter name='stroke'>#cdcdcd</se:SvgParameter><se:SvgParameter name='stroke-width'>1</se:SvgParameter></se:Stroke></se:Mark><se:Size>8</se:Size></se:Graphic></se:PointSymbolizer></se:Rule>";

            footer = "</se:FeatureTypeStyle></sld:UserStyle></sld:NamedLayer></sld:StyledLayerDescriptor>";

            filterwfs = "<ogc:Filter><ogc:And>" + filterCategory + filterType + filterYear + filterDiameter + filterPerimeter + "</ogc:And></ogc:Filter>";
            this.set("filter", filterwfs);

            this.set("SLDBody", header + filter + symbolizer + footer);
        },
        getFilterHits: function () {
            $("#loader").show();
            $.ajax({
                url: "/geodienste_hamburg_de/HH_WFS_Strassenbaumkataster",
                data: "<?xml version='1.0' encoding='UTF-8'?><wfs:GetFeature service='WFS' version='1.1.0' resultType='hits' xmlns:app='http://www.deegree.org/app' xmlns:wfs='http://www.opengis.net/wfs' xmlns:gml='http://www.opengis.net/gml' xmlns:ogc='http://www.opengis.net/ogc' xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xsi:schemaLocation='http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/wfs.xsd'><wfs:Query typeName='app:strassenbaumkataster'>" + this.get("filter") + "</wfs:Query></wfs:GetFeature>",
                type: "POST",
                context: this, // model
                contentType: "text/xml",
                success: function (data) {
                    var hits;

                    // Firefox, IE
                    if (data.getElementsByTagName("wfs:FeatureCollection")[0] !== undefined) {
                        hits = data.getElementsByTagName("wfs:FeatureCollection")[0].getAttribute("numberOfFeatures");
                    }
                    // WebKit
                    else if (data.getElementsByTagName("FeatureCollection")[0] !== undefined) {
                        hits = data.getElementsByTagName("FeatureCollection")[0].getAttribute("numberOfFeatures");
                    }
                    this.set("filterHits", hits);
                    $("#loader").hide();
                },
                error: function () {
                    $("#loader").hide();
                }
            });
        },
        setYearMin: function (value) {
            this.set("yearMin", value);
        },
        setYearMax: function (value) {
            this.set("yearMax", value);
        },
        setDiameterMin: function (value) {
            this.set("diameterMin", value);
        },
        setDiamterMax: function (value) {
            this.set("diameterMax", value);
        },
        setPerimeterMin: function (value) {
            this.set("perimeterMin", value);
        },
        setPerimeterMax: function (value) {
            this.set("perimeterMax", value);
        }
    });

    return TreeFilter;
});
