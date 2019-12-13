import BuildSpecModel from "../../../modules/tools/print_/buildSpec.js";
import {WFS, WMSGetFeatureInfo} from "ol/format.js";


/**
 *todo
 * @returns {*} todo
 */
function initializeBrwAbfrageModel () {
    const BRWModel = Radio.request("ModelList", "getModelByAttributes", {id: "brw"}),
        defaults = {
            "wpsId": 555,
            // Flag, auf mobile Darstellung
            "isViewMobile": false,
            // die ausgewählte Kategorie der BRW-Information
            "selectedCategory": "Detailinformationen",
            // aktuell selektiertes BRW-Feature aus [brwFeatures]
            "selectedBrwFeature": {},
            // Array mit allen abgefragten WFS
            "brwFeatures": [],
            // aktuell ausgewählte Nutzung
            "brwLanduse": "",
            // abgefragtes GFI der Zone oder lagetypischer BRW
            "gfiFeature": null,
            "processFromParametricUrl": false,
            "paramUrlParams": {},
            "zBauwSelect": ""
        };

    Object.assign(BRWModel, {
        attributes: Object.assign(defaults, BRWModel.attributes),

        /**
         * @returns {void}
         */
        initialize: function () {
            const filteredModelList = this.filterModelList(Radio.request("ModelList", "getModelsByAttributes", {isNeverVisibleInTree: true}));

            this.superInitialize();

            this.listenTo(this, {
                "change:gfiFeature": function () {
                    if (this.get("processFromParametricUrl")) {
                        this.simulateLanduseSelect(this.get("paramUrlParams"));
                    }
                }
            });
            this.listenTo(Radio.channel("Util"), {
                "isViewMobileChanged": this.setIsViewMobile
            });
            this.setIsViewMobile(Radio.request("Util", "isViewMobile"));
            this.setModelList(filteredModelList.reverse());

            this.registerClickListener(this, this.get("isActive"));
            this.requestParametricUrl();
        },

        /**
         * Requests parametic url and checks if all neccessary information is available to simulate gfi click and landuse select
         * @returns {void}
         * url parameter. "?brwId=01510241&brwlayername=31.12.2017&center=565774,5933956"
         */
        requestParametricUrl: function () {
            const brwId = Radio.request("ParametricURL", "getBrwId"),
                brwLayerName = Radio.request("ParametricURL", "getBrwLayerName"),
                center = Radio.request("ParametricURL", "getCenter"),
                processFromParametricUrl = true;

            if (brwId && brwLayerName && center) {
                this.setProcessFromParametricUrl(processFromParametricUrl);
                this.setParamUrlParams({
                    brwId: brwId,
                    brwLayerName: brwLayerName,
                    center: center});


                this.switchLayer(brwLayerName);
                Radio.trigger("MapView", "setCenter", center);

                this.clickCallback(undefined, processFromParametricUrl, center);
            }
            else {
                console.warn("Um direkt eine BORIS Abfrage durchführen zu können, müssen in der URL die parameter\"brwId\", \"brwLayerName\" und \"center\" gesetzt sein.");
            }
        },

        simulateLanduseSelect: function (paramUrlParams) {
            var gfiFeature = this.get("gfiFeature"),
                landuseList = gfiFeature.get("nutzungsart"),
                landuseByBrwId = this.findLanduseByBrwId(landuseList, paramUrlParams.brwId);

            this.setBrwLanduse(landuseByBrwId);
            this.setProcessFromParametricUrl(false);
        },

        findLanduseByBrwId: function (landuseList, brwId) {
            const foundLanduse = landuseList.find(function (landuse) {
                return landuse.richtwertnummer === brwId;
            });

            return foundLanduse.nutzungsart;
        },
        /**
         * Aktionen zum Wechseln eines Layers.
         * @param   {string} selectedLayername Name des zu aktivierenden Layers
         * @returns {void}
         */
        switchLayer: function (selectedLayername) {
            this.unselectLayerModel(this.get("modelList"));
            this.selectLayerModelByName(selectedLayername, this.get("modelList"));
        },
        /**
         * Sets the name of the active layer as stichtag name
         * @param  {Backbone.Model[]} modelList List of all WMS Models
         * @return {String} layername which is uses as stichtag
         */
        getActiveLayerNameAsStichtag: function (modelList) {
            let stichtag = "";
            const selectedModel = modelList.find(model => model.get("isSelected") === true);

            if (selectedModel) {
                stichtag = selectedModel.get("name");
            }
            return stichtag;
        },
        /**
         * filters the model list for models with gfi attributes
         * @param {Backbone.Model[]} modelList - wms model list
         * @returns {void}
         */
        filterModelList: function (modelList) {
            return modelList.filter(function (model) {
                return model.get("gfiAttributes") !== "ignore";
            });
        },

        /**
         * registers a callback function on a click in the map or not
         * @param {Backbone.Model} model - this
         * @param {boolean} value - isActive
         * @returns {void}
         */
        registerClickListener: function (model, value) {
            if (value) {
                this.setClickListener(Radio.request("Map", "registerListener", "click", this.clickCallback.bind(this)));
            }
            else {
                Radio.trigger("Map", "unregisterListener", this.get("clickListener"));
            }
        },

        /**
         * blocks user input when busy
         * @param {boolean} status boolean for status
         * @returns {void}
         */
        setBackdrop: function (status) {
            if (!this.get("isViewMobile")) {
                if (status) {
                    document.getElementsByClassName("masterportal-container")[0].style.cursor = "wait";
                    document.getElementsByClassName("white-backdrop")[0].style.display = "block";
                }
                else {
                    document.getElementsByClassName("masterportal-container")[0].style.cursor = "default";
                    document.getElementsByClassName("white-backdrop")[0].style.display = "none";
                }
            }
        },

        /**
         * sends a get feature info request to the currently selected layer
         * @param {MapBrowserPointerEvent} evt - map browser event
         * @param {Boolean} [processFromParametricUrl] Flag if process is started from parametric url. Then  the gfi request has to be faked, and the landuse has to be automatically selected, so that all the brw features can be displayed
         * @param {Number[]} [center] Center coordinate of faked gfi
         * @returns {void}
         */
        clickCallback: function (evt, processFromParametricUrl, center) {
            const xhttp = new XMLHttpRequest(),
                selectedModel = this.get("modelList").find(model => model.get("isSelected") === true),
                layerSource = selectedModel.get("layer").getSource();
            let map,
                mapView,
                url;

            if (processFromParametricUrl) {
                map = Radio.request("Map", "getMap");
                mapView = map.getView();
                url = layerSource.getGetFeatureInfoUrl(center, mapView.getResolution(), mapView.getProjection());
            }
            else {
                map = evt.map;
                mapView = map.getView();
                url = layerSource.getGetFeatureInfoUrl(evt.coordinate, mapView.getResolution(), mapView.getProjection());
                this.setBackdrop(true);
            }
            xhttp.open("GET", url, true);
            if (processFromParametricUrl) {
                xhttp.onload = event => {
                    this.handleGfiResponse(event.target.responseText, event.target.status, center);
                };
            }
            else {
                xhttp.onload = event => {
                    this.handleGfiResponse(event.target.responseText, event.target.status, evt.coordinate);
                };
            }
            xhttp.onerror = event => {
                this.handleGfiResponse(event.target.responseText, event.target.status);
            };
            xhttp.send();
        },

        /**
         * handles get feature info response
         * @param {string} response - XML to be sent as String
         * @param {number} status - request status
         * @param {ol.coordinate} coordinate - click coordinate
         * @returns {void}
         */
        handleGfiResponse: function (response, status, coordinate) {
            if (status === 200) {
                // parse response
                const feature = new WMSGetFeatureInfo().readFeature(response);

                if (feature !== null) {
                    // zoniert
                    if (parseInt(feature.get("jahrgang"), 10) > 2008) {
                        feature.set("nutzungsart", this.jsonParse(feature.get("nutzungsart")).nutzungen);
                        this.sendGetFeatureRequestById(feature.getId(), feature.get("jahrgang"));
                        this.setGfiFeature(feature);
                        this.checkGfiFeatureByLanduse(feature, this.get("brwLanduse"));
                    }
                    // lagetypisch
                    else {
                        this.setBrwFeatures([feature]);
                        Radio.trigger("MapMarker", "showMarker", coordinate);
                        Radio.trigger("MapView", "setCenter", coordinate);
                        this.handleNewFeature(feature);
                    }
                }
                else {
                    Radio.trigger("Alert", "alert", {
                        text: "An dieser Stelle ist kein BRW vorhanden.",
                        kategorie: "alert-warning"
                    });
                }
            }
            else {
                console.error("Datenabfrage fehlgeschlagen:" + status);
                Radio.trigger("Alert", "alert", {
                    text: "Datenabfrage fehlgeschlagen. Dies kann ein temporäres Problem sein. Bitte versuchen Sie es erneut.",
                    kategorie: "alert-danger"
                });
            }
            this.setBackdrop(false);
        },
        jsonParse: function (jsonString) {
            let parsedJSON;

            try {
                parsedJSON = JSON.parse(jsonString);
            }
            catch (error) {
                console.warn("jsonParse failed: could not parse\"" + jsonString + "\" to JSON: " + error);
            }
            return parsedJSON;
        },
        /**
         * checks if there is a brw for the selected landuse
         * if so, the function sendGetFeatureRequest is called
         * @param {ol.Feature} feature - gfi feature
         * @param {string} selectedLanduse - current selected landuse
         * @returns {void}
         */
        checkGfiFeatureByLanduse: function (feature, selectedLanduse) {
            const landuse = feature.get("nutzungsart").find((nutzung) => {
                return nutzung.nutzungsart === selectedLanduse;
            });

            if (landuse) {
                this.sendGetFeatureRequest(landuse.richtwertnummer, feature.get("jahrgang"));
            }
            else {
                this.setBrwLanduse("");
                this.set("selectedBrwFeature", {});
            }
        },

        /**
         * sends a wfs get feature request filtered by Bodenrichtwertnummer
         * @param {string} richtwertNummer - Bodenrichtwertenummer
         * @param {string} year - the selected brw year
         * @return {void}
         */
        sendGetFeatureRequest: function (richtwertNummer, year) {
            const typeName = parseInt(year, 10) > 2008 ? "lgv_brw_zoniert_alle" : "lgv_brw_lagetypisch_alle",
                xhttp = new XMLHttpRequest();

            xhttp.open("POST", "https://geodienste.hamburg.de/HH_WFS_Bodenrichtwerte", true);
            xhttp.onload = event => {
                this.handleGetFeatureResponse(event.target.responseText, event.target.status, year);
            };
            xhttp.onerror = event => {
                this.handleGetFeatureResponse(event.target.responseText, event.target.status, year);
            };
            xhttp.send(`<GetFeature version='1.1.0' xmlns:wfs='http://www.opengis.net/wfs'>
                <wfs:Query typeName='${typeName}'>
                    <Filter xmlns='http://www.opengis.net/ogc'>
                        <PropertyIsEqualTo>
                            <PropertyName>richtwertnummer</PropertyName>
                            <Literal>${richtwertNummer}</Literal>
                        </PropertyIsEqualTo>
                    </Filter>
                </wfs:Query>
            </GetFeature>`);
        },

        /**
         * handles the response from a wfs get feature request
         * @param {string} response - XML to be sent as String
         * @param {integer} status - request status
         * @param {number} year - the selected brw year
         * @returns {void}
         */
        handleGetFeatureResponse: function (response, status, year) {
            if (status === 200) {
                const features = new WFS().readFeatures(response),
                    feature = this.findBrwFeatureByYear(features, year);

                this.setBrwFeatures(features);
                this.handleNewFeature(feature);
            }
            else {
                Radio.trigger("Alert", "alert", "Datenabfrage fehlgeschlagen. (Technische Details: " + status);
            }
        },

        handleNewFeature: function (feature) {
            this.setSelectedBrwFeature(feature);
            this.sendWpsConvertRequest();
        },


        /**
         * sends a wfs get feature request filtered by id
         * @param {string} featureId -
         * @param {string} year - the selected brw year
         * @return {void}
         */
        sendGetFeatureRequestById: function (featureId, year) {
            const xhttp = new XMLHttpRequest(),
                typeName = parseInt(year, 10) > 2008 ? "lgv_brw_zonen_" + year : "lgv_brw_lagetypisch_alle",
                urlParams = "typeName=" + typeName + "&featureID=" + featureId;

            xhttp.open("GET", "https://geodienste.hamburg.de/HH_WFS_Bodenrichtwerte?service=WFS&version=1.1.0&request=GetFeature&" + urlParams, true);
            xhttp.onload = event => {
                const feature = new WFS().readFeature(event.target.responseText);

                // remove point geometry from feature
                feature.unset("geom_brw_grdstk");
                // set polygon geometry as feature's geometry
                feature.setGeometryName("geom_zone");
                Radio.trigger("Highlightfeature", "highlightPolygon", feature);
            };
            xhttp.onerror = event => {
                Radio.trigger("Alert", "alert", "Datenabfrage fehlgeschlagen. (Technische Details: " + event.target.status);
            };
            xhttp.send();
        },

        /**
         * checks if a brw Feature already is available
         * @param {ol.Feature[]} brwFeatures - list of all available brw features
         * @param {string} year - the selected brw year
         * @returns {void}
         */
        checkBrwFeature: function (brwFeatures, year) {
            if (brwFeatures !== undefined) {
                const brwFeature = this.findBrwFeatureByYear(brwFeatures, year);

                if (brwFeature === undefined) {
                    this.setGfiFeature(null);
                    this.setBrwFeatures([]);
                    this.set("selectedBrwFeature", {});
                    Radio.trigger("MapMarker", "hideMarker");
                    Radio.request("Map", "createLayerIfNotExists", "highlightLayer").getSource().clear();
                }
                else {
                    this.handleNewFeature(brwFeature);
                }
            }
            else {
                this.setGfiFeature(null);
            }
        },

        /**
         * find out if there is a brw feature for the given year and retruns it
         * if not returns undefined
         * @param {ol.Feature[]} brwFeatures - list of all available brw features
         * @param {string} year - the selected year
         * @return {ol.Feature|undefined} brw feature
         */
        findBrwFeatureByYear: function (brwFeatures, year) {
            return brwFeatures.find(function (feature) {
                return feature.get("jahrgang") === year;
            });
        },

        /**
         * selects a layer model by name
         * @param {string} value - layer name
         * @param {Backbone.Model[]} modelList - brw layer models
         * @returns {void}
         */
        selectLayerModelByName: function (value, modelList) {
            const layerModel = modelList.find(model => model.get("name") === value);

            layerModel.set("isVisibleInMap", true);
            layerModel.set("isSelected", true);
        },

        /**
         * unselects the current displayed layer
         * @param {Backbone.Model[]} modelList - brw layer models
         * @returns {void}
         */
        unselectLayerModel: function (modelList) {
            const layerModel = modelList.find(model => model.get("isSelected") === true);

            layerModel.set("isVisibleInMap", false);
            layerModel.set("isSelected", false);
        },

        /**
         * Versendet einen Request zur BRW-Umrechnung
         * @returns {void}
         */
        sendWpsConvertRequest: function () {
            const data = this.getConvertObject(this.get("selectedBrwFeature"));

            Radio.trigger("WPS", "request", "1001", "BRWConvert.fmw", data, this.handleConvertResponse.bind(this));
        },

        /**
         * Extrahiert und speichert den umgerechneten BRW
         * @param  {string} response - the response xml of the wps
         * @param  {number} status - the HTTPStatusCode
         * @returns {void}
         */
        handleConvertResponse: function (response, status) {
            var complexData,
                executeResponse;

            if (status === 200) {
                executeResponse = response.ExecuteResponse;

                if (executeResponse.ProcessOutputs) {
                    complexData = response.ExecuteResponse.ProcessOutputs.Output.Data.ComplexData;

                    if (complexData.serviceResponse) { // abnormaler Abbruch durch FME-Server
                        console.error("FME-Server statusInfo: " + complexData.serviceResponse.statusInfo.message);
                    }
                    else if (complexData.Bodenrichtwert) { // geleitet durch FME-Workbench
                        if (complexData.Bodenrichtwert.Ergebnis.ErrorOccured !== "No") {
                            console.error("BRWConvert Fehlermeldung: " + complexData.Bodenrichtwert.Ergebnis.Fehlermeldung);
                        }
                        else {
                            this.updateSelectedBrwFeature("convertedBrw", complexData.Bodenrichtwert.Ergebnis.BRW);
                        }
                    }
                }
                else if (executeResponse.Status) { // anderer abnormaler Abbruch durch FME-Server
                    console.error("FME-Server ExecuteResponse: " + executeResponse.Status.ProcessFailed.ExceptionReport.Exception.ExceptionText);
                }
            }
            else {
                console.error("WPS-Abfrage mit Status " + status + " abgebrochen.");
            }
        },

        /**
         * Erstellt data für POST-Request.
         * Berücksichtigung von obligatorischen und optionalen Parametern
         * @param   {object}    brw         Bodenrichtwertinformationen
         * @returns {string}                Object für POST-Request
         */
        getConvertObject: function (brw) {
            var requestObj = {},
                richtwert = brw.get("richtwert_euro").replace(".", "").replace(",", "."); // unpunctuate Wert für WPS

            if (richtwert.match(/,/) && richtwert.match(/\./)) {
                richtwert = richtwert.replace(".", "").replace(",", ".");
            }

            requestObj = this.setObjectAttribute(requestObj, "BRW", richtwert, "float");
            requestObj = this.setObjectAttribute(requestObj, "STAG", brw.get("stichtag"), "string");
            requestObj = this.setObjectAttribute(requestObj, "ENTW", brw.get("entwicklungszustand"), "string");
            requestObj = this.setObjectAttribute(requestObj, "ZENTW", brw.get("zEntwicklungszustand"), "string");
            requestObj = this.setObjectAttribute(requestObj, "BEIT", brw.get("beitragszustand"), "string");
            requestObj = this.setObjectAttribute(requestObj, "ZBEIT", brw.get("zBeitragszustand"), "string");
            requestObj = this.setObjectAttribute(requestObj, "NUTA", brw.get("nutzung_kombiniert"), "string");
            requestObj = this.setObjectAttribute(requestObj, "ZNUTA", brw.get("zNutzung"), "string");
            if (brw.get("bauweise")) {
                requestObj = this.setObjectAttribute(requestObj, "BAUW", brw.get("bauweise"), "string");
            }
            if (brw.get("grdstk_flaeche")) {
                requestObj = this.setObjectAttribute(requestObj, "FLAE", brw.get("grdstk_flaeche"), "float");
            }
            if (brw.get("geschossfl_zahl")) {
                requestObj = this.setObjectAttribute(requestObj, "WGFZ", brw.get("geschossfl_zahl"), "float");
            }
            if (brw.get("schichtwert")) {
                if (brw.get("schichtwert").normschichtwert_wohnen) {
                    requestObj = this.setObjectAttribute(requestObj, "NWohnW", brw.get("schichtwert").normschichtwert_wohnen.replace(".", "").replace(",", "."), "float");
                }
                if (brw.get("schichtwert").normschichtwert_buero) {
                    requestObj = this.setObjectAttribute(requestObj, "NBueroW", brw.get("schichtwert").normschichtwert_buero.replace(".", "").replace(",", "."), "float");
                }
                if (brw.get("schichtwert").normschichtwert_laden) {
                    requestObj = this.setObjectAttribute(requestObj, "NLadenW", brw.get("schichtwert").normschichtwert_laden.replace(".", "").replace(",", "."), "float");
                }
                if (brw.get("schichtwert").schichtwerte) {
                    for (const schichtwert of brw.get("schichtwert").schichtwerte) {
                        if (schichtwert.geschoss === "3. Obergeschoss oder höher") {
                            requestObj = this.setObjectAttribute(requestObj, "OGNutzung", schichtwert.nutzung, "string");
                            requestObj = this.setObjectAttribute(requestObj, "OGGFZAnt", schichtwert.wgfz, "float");
                            requestObj = this.setObjectAttribute(requestObj, "OGW", schichtwert.schichtwert.replace(".", "").replace(",", "."), "float");
                        }
                        if (schichtwert.geschoss === "2. Obergeschoss") {
                            requestObj = this.setObjectAttribute(requestObj, "ZGNutzung", schichtwert.nutzung, "string");
                            requestObj = this.setObjectAttribute(requestObj, "ZGGFZAnt", schichtwert.wgfz, "float");
                            requestObj = this.setObjectAttribute(requestObj, "ZGW", schichtwert.schichtwert.replace(".", "").replace(",", "."), "float");
                        }
                        if (schichtwert.geschoss === "1. Obergeschoss") {
                            requestObj = this.setObjectAttribute(requestObj, "IGNutzung", schichtwert.nutzung, "string");
                            requestObj = this.setObjectAttribute(requestObj, "IGGFZAnt", schichtwert.wgfz, "float");
                            requestObj = this.setObjectAttribute(requestObj, "IGW", schichtwert.schichtwert.replace(".", "").replace(",", "."), "float");
                        }
                        if (schichtwert.geschoss === "Erdgeschoss") {
                            requestObj = this.setObjectAttribute(requestObj, "EGNutzung", schichtwert.nutzung, "string");
                            requestObj = this.setObjectAttribute(requestObj, "EGGFZAnt", schichtwert.wgfz, "float");
                            requestObj = this.setObjectAttribute(requestObj, "EGW", schichtwert.schichtwert.replace(".", "").replace(",", "."), "float");
                        }
                        if (schichtwert.geschoss === "Untergeschoss") {
                            requestObj = this.setObjectAttribute(requestObj, "UGNutzung", schichtwert.nutzung, "string");
                            requestObj = this.setObjectAttribute(requestObj, "UGGFZAnt", schichtwert.wgfz, "float");
                            requestObj = this.setObjectAttribute(requestObj, "UGW", schichtwert.schichtwert.replace(".", "").replace(",", "."), "float");
                        }
                    }
                }
            }
            if (brw.get("zBauweise")) {
                requestObj = this.setObjectAttribute(requestObj, "ZBAUW", brw.get("zBauweise"), "string");
            }
            if (brw.get("zGeschossfl_zahl")) {
                requestObj = this.setObjectAttribute(requestObj, "ZWGFZ", brw.get("zGeschossfl_zahl"), "float");
            }
            if (brw.get("zGrdstk_flaeche")) {
                requestObj = this.setObjectAttribute(requestObj, "ZFLAE", brw.get("zGrdstk_flaeche"), "float");
            }
            if (brw.get("zStrassenLage")) {
                requestObj = this.setObjectAttribute(requestObj, "ZStrLage", brw.get("zStrassenLage"), "string");
            }

            return requestObj;
        },

        /**
         * Fügt Object children hinzu
         * @param {object} object   Elternobjekt
         * @param {string} attrName Bezeichnung des Kindelements
         * @param {string} value    Wert des Kindelements
         * @param {string} dataType Datentyp des Kindelements
         * @returns {object}        ergänztes Objekt
         */
        setObjectAttribute: function (object, attrName, value, dataType) {
            var dataObj = {
                dataType: dataType,
                value: value
            };

            object[attrName] = dataObj;

            return object;
        },

        /**
         * @param {Backbone.Model[]} value - wms model list where gfi attributes exist
         * @returns {void}
         */
        setModelList: function (value) {
            this.set("modelList", value);
        },

        /**
         * @param {object} value - listener object, is used as key
         * @returns {void}
         */
        setClickListener: function (value) {
            this.set("clickListener", value);
        },

        /**
         * @param {ol.Feature} value - feature from wms gfi request
         * @returns {void}
         */
        setGfiFeature: function (value) {
            this.set("gfiFeature", value);
        },

        /**
         * @param {ol.Features} value - features from wfs get feature request
         * @returns {void}
         */
        setBrwFeatures: function (value) {
            this.set("brwFeatures", value);
        },

        /**
         * @param {ol.Feature} feature - current selected brw feature
         * @param {string} stichtag - current selected stichtag
         * @returns {void}
         */
        setSelectedBrwFeature: function (feature) {
            var brw = this.extendFeatureAttributes(feature, this.getActiveLayerNameAsStichtag(this.get("modelList")));

            this.set("selectedBrwFeature", brw);
        },

        extendFeatureAttributes: function (feature, stichtag) {
            var sw = feature.get("schichtwert") ? feature.get("schichtwert") : null,
                isDMTime = parseInt(feature.get("jahrgang"), 10) < 2002;

            if (sw && typeof sw === "string") {
                sw = this.jsonParse(sw);
            }
            else if (sw && typeof sw === "object") {
                sw.normschichtwert_wohnen = sw.normschichtwert_wohnen.replace(".", "").replace(",", ".");
            }

            if (sw) {
                if (sw.normschichtwert_wohnen) {
                    sw.normschichtwert_wohnenDM = isDMTime ? Radio.request("Util", "punctuate", (parseFloat(sw.normschichtwert_wohnen, 10) * 1.95583).toFixed(1)) : "";
                    sw.normschichtwert_wohnen = Radio.request("Util", "punctuate", sw.normschichtwert_wohnen);
                }
                if (sw.normschichtwert_buero) {
                    sw.normschichtwert_bueroDM = isDMTime ? Radio.request("Util", "punctuate", (parseFloat(sw.normschichtwert_buero, 10) * 1.95583).toFixed(1)) : "";
                    sw.normschichtwert_buero = Radio.request("Util", "punctuate", sw.normschichtwert_buero);
                }
                if (sw.normschichtwert_laden) {
                    sw.normschichtwert_ladenDM = isDMTime ? Radio.request("Util", "punctuate", (parseFloat(sw.normschichtwert_laden, 10) * 1.95583).toFixed(1)) : "";
                    sw.normschichtwert_laden = Radio.request("Util", "punctuate", sw.normschichtwert_laden);
                }
                if (sw.schichtwerte) {
                    sw.schichtwerte.forEach(function (gfs) {
                        gfs.schichtwertDM = isDMTime ? Radio.request("Util", "punctuate", (parseFloat(gfs.schichtwert, 10) * 1.95583).toFixed(1)) : "";
                        gfs.schichtwert = Radio.request("Util", "punctuate", gfs.schichtwert);
                    });
                }
            }
            feature.setProperties({
                "richtwert_dm": isDMTime ? Radio.request("Util", "punctuate", parseFloat(feature.get("richtwert_dm"), 10).toFixed(1)) : "",
                "richtwert_euro": Radio.request("Util", "punctuate", feature.get("richtwert_euro")),
                "schichtwert": sw,
                "stichtag": stichtag,
                "convertedBrw": "", // umgerechneter Bodenrichtwert
                "convertedBrwDM": "",
                "zEntwicklungszustand": feature.get("entwicklungszustand"), // Pflichtattribut für WPS
                "zBeitragszustand": feature.get("beitragszustand"), // Pflichtattribut für WPS
                "zNutzung": feature.get("nutzung_kombiniert"), // Pflichtattribut für WPS
                "zBauweise": feature.get("anbauart") !== "" ? feature.get("anbauart") : null,
                "zGeschossfl_zahl": feature.get("geschossfl_zahl") !== "" ? feature.get("geschossfl_zahl") : null,
                "zGrdstk_flaeche": feature.get("grdstk_flaeche") !== "" ? feature.get("grdstk_flaeche") : null,
                "zStrassenLage": feature.get("nutzung_kombiniert") === "EFH Ein- und Zweifamilienhäuser" ? "F Frontlage" : null
            });

            return feature;
        },

        /**
         * Checks if schichtwerte should be printed
         * @param   {object}    schichtwert Schichtwerte-Object of feature
         * @returns {boolean}   true when Schichtwerte should be printed
         */
        showSchichtwerte: function (schichtwert) {
            if (schichtwert && schichtwert.schichtwerte && schichtwert.schichtwerte.length > 0) {
                return true;
            }

            return false;
        },

        /**
         * Gathers information needed to trigger the print module
         * @return {[type]} [description]
         */
        preparePrint: function () {
            var visibleLayerList = Radio.request("Map", "getLayers").getArray().filter(function (layer) {
                    return layer.getVisible() === true;
                }),
                scale = Radio.request("MapView", "getOptions").scale,
                feature = this.get("selectedBrwFeature"),
                defaultString = "",
                attr = {
                    "layout": "A4 Hochformat",
                    "outputFilename": "Auszug_aus_BORIS_HH-${dd-MM-yyyy}",
                    "outputFormat": "pdf",
                    "attributes": {
                        "richtwertnummer": "Bodenrichtwertnummer: " + feature.get("richtwertnummer"),
                        "scale": "Maßstab 1:" + scale,
                        "entwicklungszustand": feature.get("entwicklungszustand") || defaultString,
                        "sanierungszusatz": feature.get("sanierungszusatz") || defaultString,
                        "beitragszustand": feature.get("beitragszustand") || defaultString,
                        "nutzungsart": feature.get("nutzung_kombiniert") || defaultString,
                        "anbauart": feature.get("anbauart") || defaultString,
                        "geschossfl_zahl": feature.get("geschossfl_zahl") || defaultString,
                        "grdstk_flaeche": feature.get("grdstk_flaeche") || defaultString,
                        "gruenlandzahl": feature.get("gruenlandzahl") || defaultString,
                        "bemerkung": feature.get("bemerkung") || defaultString,
                        "stichtag": this.get("selectedBrwFeature").get("stichtag"),
                        "richtwert_euro": feature.get("richtwert_euro") || defaultString,
                        "richtwert_dm": feature.get("richtwert_dm") || defaultString,
                        "strasse_hausnr": this.createAddressString(feature),
                        "weitere_lage": feature.get("lagebezeichnung") || defaultString,
                        "plz_gemeinde": this.createPlzGemeindeString(feature),
                        "bezirk": feature.get("bezirk") || defaultString,
                        "stadtteil": feature.get("stadtteil") || defaultString,
                        "sge": feature.get("statistisches_gebiet") || defaultString,
                        "baublock": feature.get("baublock") || defaultString,
                        "convertedBrw": feature.get("convertedBrw") && feature.get("convertedBrw") !== feature.get("richtwert_euro") ? feature.get("convertedBrw") : defaultString,
                        "convertedBrwDM": feature.get("convertedBrwDM") || defaultString,
                        "zBauweise": this.get("zBauwSelect") ? this.get("zBauwSelect") : feature.get("zBauweise") || defaultString,
                        "zStrassenlage": feature.get("zStrassenLage") || defaultString,
                        "zGeschossfl_zahl": feature.get("zGeschossfl_zahl") || defaultString,
                        "zGrdstk_flaeche": feature.get("zGrdstk_flaeche") || defaultString,
                        "show_schichtwerte": this.showSchichtwerte(feature.get("schichtwert")),
                        "normschichtwert_wohnen_text": feature.get("schichtwert") && feature.get("schichtwert").normschichtwert_wohnen ? "normierter Bodenrichtwert für Mehrfamilienhäuser" : defaultString,
                        "normschichtwert_wohnen": feature.get("schichtwert") && feature.get("schichtwert").normschichtwert_wohnen ? feature.get("schichtwert").normschichtwert_wohnen : defaultString,
                        "normschichtwert_wohnenDM": feature.get("schichtwert") && feature.get("schichtwert").normschichtwert_wohnenDM ? feature.get("schichtwert").normschichtwert_wohnenDM : defaultString,
                        "normschichtwert_buero_text": feature.get("schichtwert") && feature.get("schichtwert").normschichtwert_buero ? "normierter Bodenrichtwert für Bürohäuser" : defaultString,
                        "normschichtwert_buero": feature.get("schichtwert") && feature.get("schichtwert").normschichtwert_buero ? feature.get("schichtwert").normschichtwert_buero : defaultString,
                        "normschichtwert_bueroDM": feature.get("schichtwert") && feature.get("schichtwert").normschichtwert_bueroDM ? feature.get("schichtwert").normschichtwert_bueroDM : defaultString,
                        "normschichtwert_laden_text": feature.get("schichtwert") && feature.get("schichtwert").normschichtwert_laden ? "normierter Bodenrichtwert für Geschäftshäuser (Erdgesch.-anteil)" : defaultString,
                        "normschichtwert_laden": feature.get("schichtwert") && feature.get("schichtwert").normschichtwert_laden ? feature.get("schichtwert").normschichtwert_laden : defaultString,
                        "normschichtwert_ladenDM": feature.get("schichtwert") && feature.get("schichtwert").normschichtwert_ladenDM ? feature.get("schichtwert").normschichtwert_ladenDM : defaultString,
                        "schichtwerte": {
                            "rows": feature.get("schichtwert") && feature.get("schichtwert").schichtwerte ? feature.get("schichtwert").schichtwerte : []
                        },
                        "map": {
                            "dpi": 96,
                            "projection": Radio.request("MapView", "getProjection").getCode(),
                            "center": Radio.request("MapView", "getCenter"),
                            "scale": scale
                        }
                    }
                },
                buildSpec = new BuildSpecModel(attr);

            buildSpec.buildLayers(visibleLayerList);
            buildSpec = buildSpec.toJSON();
            buildSpec = _.omit(buildSpec, "uniqueIdList");
            Radio.trigger("Print", "createPrintJob", "boris", encodeURIComponent(JSON.stringify(buildSpec)), "pdf");
        },

        /**
         * Creates an address string based on the ol.feature\"s attributes strassenname, hausnummer and hausnummerzusatz
         * @param  {ol.feature} feature The ol-Feature
         * @return {String} The result string
         */
        createAddressString: function (feature) {
            let addressString = "";

            addressString += feature.get("strassenname") || "";
            addressString += " ";
            addressString += feature.get("hausnummer") || "";
            addressString += feature.get("hausnummerzusatz") || "";

            return addressString.trim();
        },

        /**
         * Creates a string based on the ol.feature\"s attributes postal code and municipality
         * @param  {ol.feature} feature The ol-Feature
         * @return {String} The result String
         */
        createPlzGemeindeString: function (feature) {
            let plzGemeindeString = "";

            plzGemeindeString += feature.get("postleitzahl") || "";
            plzGemeindeString += " ";
            plzGemeindeString += feature.get("gemeinde") || "";

            return plzGemeindeString.trim();
        },

        /**
         * @param {object} value - listener object, is used as key
         * @returns {void}
         */
        setBrwLanduse: function (value) {
            this.set("brwLanduse", value);
        },

        /*
        * setter for isMobileView
        * @param {boolean} value isMobileView
        * @returns {void}
        */
        setIsViewMobile: function (value) {
            this.set("isViewMobile", value);
        },

        /*
        * setter for selectedCategory
        * "details", "lage", "umrechnen" oder "schichtwerte"
        * @param {string} value selectedCategory
        * @returns {void}
        */
        setSelectedCategory: function (value) {
            this.set("selectedCategory", value);
        },

        /*
        * setter for processFromParametricUrl
        * @param {Boolean} value Flag if process should be started from parametric url
        * @returns {void}
        */
        setProcessFromParametricUrl: function (value) {
            this.set("processFromParametricUrl", value);
        },

        /*
        * setter for processFromParametricUrl
        * @param {Object} value Value of parametricUrls
        * @param {String} value.brwId Brw number
        * @param {String} value.brwYear Year of brw.
        * @param {Number[]} value.center Coordinate to simulated click event
        * @returns {void}
        */
        setParamUrlParams: function (value) {
            this.set("paramUrlParams", value);
        },

        /*
        * updater for selectedBrwFeature forces refresh
        * @param {string} key Name des Attributes am feature
        * @param {string} value Wert des Attributes
        * @returns {void}
        */
        updateSelectedBrwFeature: function (key, value) {
            var feature = this.get("selectedBrwFeature"),
                isDMTime = parseInt(feature.get("jahrgang"), 10) < 2002;

            if (key === "convertedBrw") {
                const valueDm = isDMTime ? Radio.request("Util", "punctuate", (parseFloat(value, 10) * 1.95583).toFixed(1)) : "";

                feature.setProperties({"convertedBrw": Radio.request("Util", "punctuate", value)});
                feature.setProperties({"convertedBrwDM": valueDm});
            }
            else if (key === "zBauweise") {
                feature.setProperties({
                    "zBauweise": value,
                    "convertedBrw": "",
                    "convertedBrwDM": ""
                });
            }
            else if (key === "zGeschossfl_zahl") {
                feature.setProperties({
                    "zGeschossfl_zahl": value,
                    "convertedBrw": "",
                    "convertedBrwDM": ""
                });
            }
            else if (key === "zGrdstk_flaeche") {
                feature.setProperties({
                    "zGrdstk_flaeche": value,
                    "convertedBrw": "",
                    "convertedBrwDM": ""
                });
            }
            else if (key === "zStrassenLage") {
                feature.setProperties({
                    "zStrassenLage": value,
                    "convertedBrw": "",
                    "convertedBrwDM": ""
                });
            }
            this.unset("selectedBrwFeature", {silent: true});
            this.set("selectedBrwFeature", feature);
        },

        /*
        * setter for setZBauwSelect
        * @param {String} value contains the value of Anbauart
        * @returns {void}
        */
        setZBauwSelect: function (value) {
            this.set("zBauwSelect", value);
        }
    });
    BRWModel.initialize();
    return BRWModel;
}

export default initializeBrwAbfrageModel;
