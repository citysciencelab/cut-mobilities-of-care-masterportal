import Tool from "../../core/modelList/tool/model";
import {Icon} from "ol/style.js";
import {Circle, Polygon} from "ol/geom.js";
import {DEVICE_PIXEL_RATIO} from "ol/has.js";
import "../print_/RadioBridge.js";

const PrintModel = Tool.extend({
    defaults: Object.assign({}, Tool.prototype.defaults, {
        printID: "99999",
        MM_PER_INCHES: 25.4,
        POINTS_PER_INCH: 72,
        title: "PrintResult",
        outputFilename: "Ausdruck",
        outputFormat: "pdf",
        gfiToPrint: [], // die sichtbaren GFIs
        center: [],
        scale: {},
        layerToPrint: [],
        fetched: false, // gibt an, ob info.json schon geladen wurde
        gfi: false,
        printurl: "",
        gfiMarker: {
            outerCircle: {
                fill: false,
                pointRadius: 8,
                stroke: true,
                strokeColor: "#ff0000",
                strokeWidth: 3
            },
            point: {
                fill: true,
                pointRadius: 1,
                fillColor: "#000000",
                stroke: false
            }
        },
        configYAML: "/master",
        deactivateGFI: false,
        renderToWindow: true,
        proxyURL: "",
        glyphicon: "glyphicon-print",
        precomposeListener: {},
        postcomposeListener: {}
    }),

    /*
     * Ermittelt die URL zum Fetchen in setStatus durch Abfrage der ServiceId
     */
    url: function () {
        const resp = Radio.request("RestReader", "getServiceById", this.get("printID")),
            url = resp && resp.get("url") ? resp.get("url") : null;

        let printurl;

        if (url) {
            printurl = url + this.get("configYAML");

            this.set("printurl", printurl);
            return this.get("proxyURL") + "?url=" + printurl + "/info.json";
        }
        return "undefined"; // muss String übergeben, sonst Laufzeitfehler
    },

    //
    initialize: function () {
        this.superInitialize();

        this.listenTo(this, {
            "change:layout change:scale change:isActive": this.updatePrintPage,
            "change:specification": this.getPDFURL,
            "change:isActive": this.setStatus
        });

        this.listenTo(Radio.channel("MapView"), {
            "changedOptions": this.setScaleByMapView,
            "changedCenter": this.setCenter
        });
    },

    // Überschreibt ggf. den Titel für den Ausdruck. Default Value kann in der config.js eingetragen werden.
    setTitleFromForm: function () {
        if ($("#titleField").val()) {
            this.setTitle($("#titleField").val());
        }
    },

    // Setzt das Format(DinA4/A3 Hoch-/Querformat) für den Ausdruck.
    setLayout: function (index) {
        this.set("layout", this.get("layouts")[index]);
    },
    // Setzt den Maßstab für den Ausdruck über die Druckeinstellungen.
    setScale: function (index) {
        const scaleval = this.get("scales")[index].valueInt;

        Radio.trigger("MapView", "setScale", scaleval);
    },

    // Setzt den Maßstab für den Ausdruck über das Zoomen in der Karte.
    setScaleByMapView: function () {
        const newScale = this.get("scales") !== undefined ? this.get("scales").find(scale => scale.valueInt === Radio.request("MapView", "getOptions").scale) : undefined;

        this.set("scale", newScale);
    },

    // Setzt die Zentrumskoordinate.
    setCenter: function (value) {
        this.set("center", value);
    },

    //
    setStatus: function (bmodel, value) {
        let scaletext;

        if (value && this.get("layouts") === undefined) {
            if (this.get("fetched") === false) {
                // get print config (info.json)
                this.fetch({
                    cache: false,
                    success: function (model) {
                        model.get("scales").forEach(scale => {
                            scale.valueInt = parseInt(scale.value, 10);
                            scaletext = scale.valueInt.toString();
                            scaletext = scaletext < 10000 ? scaletext : scaletext.substring(0, scaletext.length - 3) + " " + scaletext.substring(scaletext.length - 3);
                            scale.name = "1: " + scaletext;
                        });
                        model.set("layout", model.get("layouts").find(layout => layout.name === "A4 Hochformat"));
                        model.setScaleByMapView();
                        model.set("isCollapsed", false);
                        model.set("fetched", true);
                    },
                    error: function () {
                        Radio.trigger("Alert", "alert", {text: "<strong>Druckkonfiguration konnte nicht geladen werden!</strong> Bitte versuchen Sie es später erneut.", kategorie: "alert-danger"});
                        Radio.trigger("Window", "setIsVisible", false);
                    },
                    complete: function () {
                        Radio.trigger("Util", "hideLoader");
                    },
                    beforeSend: function () {
                        Radio.trigger("Util", "showLoader");
                    }
                });
                this.updatePrintPage();
            }
        }
    },

    updatePrintPage: function () {
        if (this.has("scale") && this.has("layout")) {
            if (this.get("isActive")) {
                if (Object.keys(this.get("precomposeListener")).length === 0) {
                    this.setPrecomposeListener(Radio.request("Map", "registerListener", "precompose", this.handlePreCompose.bind(this)));
                }
                if (Object.keys(this.get("postcomposeListener")).length === 0) {
                    this.setPostcomposeListener(Radio.request("Map", "registerListener", "postcompose", this.handlePostCompose.bind(this)));
                }
            }
            else {
                Radio.trigger("Map", "unregisterListener", this.get("precomposeListener"));
                Radio.trigger("Map", "unregisterListener", this.get("postcomposeListener"));
            }
            Radio.trigger("Map", "render");
        }
    },

    getLayersForPrint: function () {
        const drawLayer = Radio.request("Draw", "getLayer");

        this.set("layerToPrint", []);
        this.setWMSLayerToPrint(Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true, typ: "WMS", isOutOfRange: false}));
        this.setGROUPLayerToPrint(Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true, typ: "GROUP", isOutOfRange: false}));

        if (drawLayer !== undefined && drawLayer.getSource().getFeatures().length > 0) {
            this.setLayer(drawLayer);
        }
        this.getGfiForPrint();
    },

    setGROUPLayerToPrint: function (layers) {
        layers.sort((layerA, layerB) => layerA.get("selectionIDX") - layerB.get("selectionIDX"));

        layers.forEach(groupLayer => {
            const layerList = groupLayer.get("layerSource");

            layerList.forEach(layer => {
                const params = {},
                    style = [];

                if (layer.get("typ") === "WMS") {
                    if (layer.has("styles")) {
                        style.push(layer.get("styles"));
                    }
                    // Für jeden angegebenen Layer muss ein Style angegeben werden.
                    // Wenn ein Style mit einem Blank angegeben wird,
                    // wird der Default-Style des Layers verwendet. Beispiel für 3 Layer: countries,,cities
                    else {
                        const numberOfLayer = layer.get("layers").split(",").length;
                        let defaultStyle = "";

                        for (let i = 1; i < numberOfLayer; i++) {
                            defaultStyle += ",";
                        }
                        style.push(defaultStyle);
                    }

                    this.push("layerToPrint", {
                        type: layer.get("typ"),
                        layers: layer.get("layers").split(),
                        baseURL: layer.get("url"),
                        format: "image/png",
                        opacity: (100 - layer.get("transparency")) / 100,
                        customParams: params,
                        styles: style
                    });
                }
            });
        });
    },

    setWMSLayerToPrint: function (layers) {
        layers.sort((layerA, layerB) => layerA.get("selectionIDX") - layerB.get("selectionIDX"));

        layers.forEach(layer => {
            // nur wichtig für treeFilter
            const params = {},
                style = [];
            let layerURL = layer.get("url");

            if (layer.has("SLDBody")) {
                params.SLD_BODY = layer.get("SLDBody");
            }
            if (layer.get("id") === "2298") {
                style.push("strassenbaumkataster_grau");
            }
            if (layer.has("styles")) {
                style.push(layer.get("styles"));
            }
            // Für jeden angegebenen Layer muss ein Style angegeben werden.
            // Wenn ein Style mit einem Blank angegeben wird,
            // wird der Default-Style des Layers verwendet. Beispiel für 3 Layer: countries,,cities
            else {
                const numberOfLayer = layer.get("layers").split(",").length;
                let defaultStyle = "";

                for (let i = 1; i < numberOfLayer; i++) {
                    defaultStyle += ",";
                }
                style.push(defaultStyle);
            }
            // Damit Web-Atlas gedruckt werden kann
            if (layer.get("url").indexOf("gdi_mrh_themen") >= 0) {
                layerURL = layer.get("url").replace("gdi_mrh_themen", "gdi_mrh_themen_print");
            }
            else if (layer.get("url").indexOf("gdi_mrh") >= 0) {
                layerURL = layer.get("url").replace("gdi_mrh", "gdi_mrh_print");
            }
            else if (layer.get("url").indexOf("geoportal.metropolregion.hamburg.de") >= 0 ||
                    layer.get("url").indexOf("geoportaltest.metropolregion.hamburg.de") >= 0) {
                layerURL = layer.get("url") + "_print";
            }
            this.push("layerToPrint", {
                type: layer.get("typ"),
                layers: layer.get("layers").split(),
                baseURL: layerURL,
                format: "image/png",
                opacity: (100 - layer.get("transparency")) / 100,
                customParams: params,
                styles: style
            });
        });
    },

    setLayer: function (layer) {
        const features = [],
            featureStyles = {},
            layerId = layer.get("id");

        let layerModel,
            isClustered,
            printStyleObj = {},
            styleModel;

        if (layer !== undefined) {
            // get styleModel if layerId is defined.
            // layer id is not defined for portal-internal layer like animationLayer and import_draw_layer
            // then the style is located directly at the feature, see line 312
            if (layerId !== undefined) {
                layerModel = Radio.request("ModelList", "getModelByAttributes", {id: layerId});
                isClustered = layerModel.get("clusterDistance") !== undefined;
                styleModel = Radio.request("StyleList", "returnModelById", layerModel.get("styleId"));
            }
            // Alle features die eine Kreis-Geometrie haben
            layer.getSource().getFeatures().forEach(feature => {
                if (feature.getGeometry() instanceof Circle) {
                    // creates a regular polygon from a circle with 32(default) sides
                    feature.setGeometry(Polygon.fromCircle(feature.getGeometry()));
                }
            });

            layer.getSource().getFeatures().forEach((feature, index) => {
                const type = feature.getGeometry().getType(),
                    styles = feature.getStyleFunction() !== undefined ? feature.getStyleFunction().call(feature) : styleModel.createStyle(feature, isClustered),
                    style = Array.isArray(styles) ? styles[0] : styles,
                    coordinates = feature.getGeometry().getCoordinates();

                features.push({
                    type: "Feature",
                    properties: {
                        _style: index
                    },
                    geometry: {
                        coordinates: coordinates,
                        type: type
                    }
                });

                // Punkte
                if (type === "Point" || type === "MultiPoint") {
                    printStyleObj = this.createPointStyleForPrint(style);
                    featureStyles[index] = printStyleObj;
                }
                // Polygone oder Linestrings
                else {
                    featureStyles[index] = {
                        fillColor: this.getColor(style.getFill().getColor()).color,
                        fillOpacity: this.getColor(style.getFill().getColor()).opacity,
                        strokeColor: this.getColor(style.getStroke().getColor()).color,
                        strokeWidth: style.getStroke().getWidth()
                    };
                }
            });
            this.push("layerToPrint", {
                type: "Vector",
                styles: featureStyles,
                geoJson: {
                    type: "FeatureCollection",
                    features: features
                }
            });
        }
    },
    createPointStyleForPrint: function (style) {
        let pointStyleObject = {},
            imgPath = this.createImagePath(),
            imgName = style.getImage() instanceof Icon ? style.getImage().getSrc() : undefined;

        // Punkte ohne Text
        if (style.getText() === null || style.getText() === undefined) {
            // style image is an Icon
            if (imgName !== undefined) {
                // get imagename from src path
                imgName = imgName.match(/(?:[^/]+)$/g)[0];
                imgPath += imgName;
                imgPath = encodeURI(imgPath);
                pointStyleObject = {
                    externalGraphic: imgPath,
                    graphicWidth: Array.isArray(style.getImage().getSize()) ? style.getImage().getSize()[0] * style.getImage().getScale() : 20,
                    graphicHeight: Array.isArray(style.getImage().getSize()) ? style.getImage().getSize()[1] * style.getImage().getScale() : 20,
                    graphicXOffset: style.getImage().getAnchor() !== null ? -style.getImage().getAnchor()[0] : 0,
                    graphicYOffset: style.getImage().getAnchor() !== null ? -style.getImage().getAnchor()[1] : 0
                };
            }
            // style is an Circle or Point without Icon
            else {
                pointStyleObject = {
                    fillColor: this.getColor(style.getImage().getFill().getColor()).color,
                    fillOpacity: this.getColor(style.getImage().getFill().getColor()).opacity,
                    pointRadius: style.getImage().getRadius(),
                    strokeColor: this.getColor(style.getImage().getFill().getColor()).color,
                    strokeOpacity: this.getColor(style.getImage().getFill().getColor()).opacity
                };
            }
        }
        // Texte
        else {
            pointStyleObject = {
                label: style.getText().getText(),
                fontColor: this.getColor(style.getText().getFill().getColor()).color
            };
        }
        return pointStyleObject;
    },
    createImagePath: function () {
        let imgPath = window.location.origin + "/lgv-config/img/";

        // for local IDE take path to
        if (imgPath.indexOf("localhost") !== -1) {
            imgPath = "https://geodienste.hamburg.de/lgv-config/img/";
        }
        return imgPath;
    },

    setSpecification: function (gfiPosition) {
        const layers = Radio.request("Map", "getLayers").getArray(),
            animationLayer = layers.filter(function (layer) {
                return layer.get("name") === "animationLayer";
            }),
            wfsLayer = layers.filter(function (layer) {
                return layer.get("typ") === "WFS" && layer.get("visible") === true && layer.getSource().getFeatures().length > 0;
            });

        let specification = {};

        if (animationLayer.length > 0) {
            this.setLayer(animationLayer[0]);
        }
        wfsLayer.forEach(layer => {
            this.setLayer(layer);
        });
        specification = {
            layout: this.get("layout").name,
            srs: Radio.request("MapView", "getProjection").getCode(),
            units: "m",
            outputFilename: this.get("outputFilename"),
            outputFormat: this.get("outputFormat"),
            layers: this.get("layerToPrint"),
            pages: [
                {
                    center: Radio.request("MapView", "getCenter"),
                    scale: this.get("scale").value,
                    scaleText: this.get("scale").name,
                    geodetic: true,
                    dpi: "96",
                    mapTitle: this.get("title")
                }
            ]
        };

        if (gfiPosition !== null) {
            (Array.isArray(this.get("gfiParams")) ? this.get("gfiParams").reduce((acc, val) => acc.concat(val), []) : this.get("gfiParams")).forEach((element, index) => {
                specification.pages[0]["attr_" + index] = element;
            });

            specification.pages[0].layerName = this.get("gfiTitle");
        }
        this.set("specification", specification);
    },
    /**
     * Checkt, ob Kreis an GFI-Position gezeichnet werden soll und fügt ggf. Layer ein.
     * @param {number[]} gfiPosition -
     * @returns {void}
     */
    setGFIPos: function (gfiPosition) {
        if (gfiPosition !== null) {
            gfiPosition[0] = gfiPosition[0] + 0.25; // Verbesserung der Punktlage im Print
            this.push("layerToPrint", {
                type: "Vector",
                styleProperty: "styleId",
                styles: {
                    0: this.get("gfiMarker").outerCircle,
                    1: this.get("gfiMarker").point
                },
                geoJson: {
                    type: "FeatureCollection",
                    features: [
                        {
                            type: "Feature",
                            geometry: {
                                type: "Point",
                                coordinates: gfiPosition
                            },
                            properties: {
                                styleId: 0
                            }
                        },
                        {
                            type: "Feature",
                            geometry: {
                                type: "Point",
                                coordinates: gfiPosition
                            },
                            properties: {
                                styleId: 1
                            }
                        }
                    ]
                }
            });
        }
        this.setSpecification(gfiPosition);
    },

    /**
    * Setzt die createURL in Abhängigkeit der GFI
    * @returns {void}
    */
    getGfiForPrint: function () {
        const gfis = Radio.request("GFI", "getIsVisible") === true ? Radio.request("GFI", "getGfiForPrint") : null,
            gfiParams = Array.isArray(gfis) === true ? Object.entries(gfis[0]) : null, // Parameter
            gfiTitle = Array.isArray(gfis) === true ? gfis[1] : "", // Layertitel
            gfiPosition = Array.isArray(gfis) === true ? gfis[2] : null, // Koordinaten des GFI
            // printGFI = this.get("printGFI"), // soll laut config Parameter gedruckt werden?
            printGFI = this.get("gfi"), // soll laut config Parameter gedruckt werden?
            printurl = this.get("printurl"); // URL des Druckdienstes

        this.set("gfiParams", gfiParams);
        this.set("gfiTitle", gfiTitle);
        // Wenn eine GFIPos vorhanden ist, und die Anzahl der gfiParameter != 0 ist
        if (gfiPosition !== null && printGFI === true && gfiParams && gfiParams.length > 0) {
            this.set("createURL", printurl + "_gfi_" + this.get("gfiParams").length.toString() + "/create.json");
        }
        else {
            this.set("createURL", printurl + "/create.json");
        }
        this.setGFIPos(gfiPosition);
    },

    /**
     * @desc Führt einen HTTP-Post-Request aus.
     * @returns {void}
     */
    getPDFURL: function () {

        $.ajax({
            url: this.get("proxyURL") + "?url=" + this.get("createURL"),
            type: "POST",
            context: this,
            async: false,
            data: JSON.stringify(this.get("specification")),
            headers: {
                "Content-Type": "application/json; charset=UTF-8"
            },
            success: this.openPDF,
            error: function (error) {
                Radio.trigger("Alert", "alert", {
                    text: "Druck fehlgeschlagen: " + error.statusText,
                    kategorie: "alert-warning"
                });
            },
            complete: function () {
                Radio.trigger("Util", "hideLoader");
            },
            beforeSend: function () {
                Radio.trigger("Util", "showLoader");
            }
        });
    },

    /**
     * @desc Öffnet das erzeugte PDF im Browser.
     * @param {Object} data - Antwort vom Druckdienst. Enthält die URL zur erzeugten PDF.
     * @returns {void}
     */
    openPDF: function (data) {
        window.open(data.getURL);
    },

    /**
     * @desc Hilfsmethode um ein Attribut vom Typ Array zu setzen.
     * @param {String} attribute - Das Attribut das gesetzt werden soll.
     * @param {whatever} value - Der Wert des Attributs.
     * @returns {void}
     */
    push: function (attribute, value) {
        const tempArray = {...this.get(attribute)};

        tempArray.push(value);
        this.set(attribute, Array.isArray(tempArray) ? tempArray.reduce((acc, val) => acc.concat(val), []) : tempArray);
    },

    // Prüft ob es sich um einen rgb(a) oder hexadezimal String handelt.
    // Ist es ein rgb(a) String, wird er in ein hexadezimal String umgewandelt.
    // Wenn vorhanden, wird die Opacity(default = 1) überschrieben.
    // Gibt den hexadezimal String und die Opacity zurück.
    getColor: function (value) {
        let color = value,
            opacity = 1;

        // color kommt als array--> parsen als String
        color = color.toString();

        if (color.search("#") === -1) {
            color = color.split(",");
            if (color.length === 4) {
                opacity = parseFloat(color[3], 10);
            }
            color = this.rgbToHex(parseInt(color[0], 10), parseInt(color[1], 10), parseInt(color[2], 10));

            return {
                "color": color,
                "opacity": opacity
            };
        }

        return {
            "color": color,
            "opacity": opacity
        };

    },

    // Setzt den hexadezimal String zusammen und gibt ihn zurück.
    rgbToHex: function (red, green, blue) {
        return "#" + this.componentToHex(red) + this.componentToHex(green) + this.componentToHex(blue);
    },

    // Ein Integer (color) wird in ein hexadezimal String umgewandelt und zurückgegeben.
    componentToHex: function (color) {
        const hex = color.toString(16);

        return hex.length === 1 ? "0" + hex : hex;
    },

    handlePreCompose: function (evt) {
        const ctx = evt.context;

        ctx.save();
    },

    handlePostCompose: function (evt) {
        const ctx = evt.context,
            size = evt.target.getSize(),
            height = size[1] * DEVICE_PIXEL_RATIO,
            width = size[0] * DEVICE_PIXEL_RATIO,
            printPageRectangle = this.calculatePageBoundsPixels(size),
            minx = printPageRectangle[0],
            miny = printPageRectangle[1],
            maxx = printPageRectangle[2],
            maxy = printPageRectangle[3];

        ctx.beginPath();
        // Outside polygon, must be clockwise
        ctx.moveTo(0, 0);
        ctx.lineTo(width, 0);
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.lineTo(0, 0);
        ctx.closePath();
        // Inner polygon,must be counter-clockwise
        ctx.moveTo(minx, miny);
        ctx.lineTo(minx, maxy);
        ctx.lineTo(maxx, maxy);
        ctx.lineTo(maxx, miny);
        ctx.lineTo(minx, miny);
        ctx.closePath();
        ctx.fillStyle = "rgba(0, 5, 25, 0.55)";
        ctx.fill();
        ctx.restore();
    },

    calculatePageBoundsPixels: function (mapSize) {
        const s = this.get("scale").value,
            width = this.get("layout").map.width,
            height = this.get("layout").map.height,
            resolution = Radio.request("MapView", "getOptions").resolution,
            w = width / this.get("POINTS_PER_INCH") * this.get("MM_PER_INCHES") / 1000.0 * s / resolution * DEVICE_PIXEL_RATIO,
            h = height / this.get("POINTS_PER_INCH") * this.get("MM_PER_INCHES") / 1000.0 * s / resolution * DEVICE_PIXEL_RATIO,
            center = [mapSize[0] * DEVICE_PIXEL_RATIO / 2,
                mapSize[1] * DEVICE_PIXEL_RATIO / 2],
            minx = center[0] - (w / 2),
            miny = center[1] - (h / 2),
            maxx = center[0] + (w / 2),
            maxy = center[1] + (h / 2);

        return [minx, miny, maxx, maxy];
    },

    setPrecomposeListener: function (value) {
        this.set("precomposeListener", value);
    },

    setPostcomposeListener: function (value) {
        this.set("postcomposeListener", value);
    },

    // setter for title
    setTitle: function (value) {
        this.set("title", value);
    }
});

export default PrintModel;
