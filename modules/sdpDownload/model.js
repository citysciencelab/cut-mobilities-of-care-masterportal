import Tool from "../core/modelList/tool/model";
import GraphicalSelectModel from "../snippets/graphicalselect/model";
import { WFS } from "ol/format.js";
import * as turf from '@turf/turf'

const SdpDownloadModel = Tool.extend(/** @lends SdpDownloadModel.prototype */{
    defaults: _.extend({}, Tool.prototype.defaults, {
        deactivateGFI: true,
        isActive: false,
        renderToSidebar: true,
        renderToWindow: false,
        wmsRasterLayerId: "4707",
        formats: [
            { id: 'NAS', label: 'NAS', isSelected: true, desc: 'Daten im NAS-Format herunterladen' },
            { id: 'DWG_310', label: 'DWG, Lagestatus 310 (kurz)', isSelected: false, desc: 'Daten im DWG-Format herunterladen, Lagestatus: ETRS89, UTM-Projektion' },
            { id: 'DWG_320', label: 'DWG, Lagestatus 320', isSelected: false, desc: 'Daten im DWG-Format herunterladen, Lagestatus: ETRS89, Gauß-Krüger-Projektion' },
            { id: 'JPG', label: 'JPG + JGW, Lagestatus 310 (kurz)', isSelected: false, desc: 'Daten im JPG-Format herunterladen, inkl. JGW-Dateien im Lagestatus: ETRS89, UTM-Projektion' }],
        selectedFormat: "NAS",//is preselected
        compressDataUrl: "https://geofos.fhhnet.stadt.hamburg.de/sdp-daten-download/php_lgv/dateien_zippen.php",
        compressedFileUrl: "https://geofos.fhhnet.stadt.hamburg.de/sdp-daten-download/php_lgv/datei_herunterladen.php",
        wfsRasterParams: {
            url: "https://geodienste.hamburg.de/HH_WFS_Uebersicht_Kachelbezeichnungen",
            request: "GetFeature",
            service: "WFS",
            version: "1.1.0",
            typename: 'app:lgv_kachel_dk5_1km_utm'
        },
        wfsRaster: {},
        //geometric selection
        graphicalSelectModel: {},
        requesting: false,
        selectedRasterLimit: 9
    }),
    /**
     * @class SdpDownloadModel
     * @extends Tool
     * @property {boolean} deactivateGFI=true avoid show DK5-Info if user clicks into Map
     * @property {boolean} isActive=false state of the tool
     * @property {boolean} renderToSidebar=true show this tool in sidebar
     * @property {boolean} renderToWindow=false not show this tool in window
     * @property {string} wmsRasterLayerId="4707" id of the Layer utm_dk5_1km (WMS Uebersicht Kachelbezeichnungen)
     * @property {array} formats=[] provided formats of data to download
     * @property {string} selectedFormat="NAS" is the preselected format
     * @property {string} compressDataUrl="https://geofos.fhhnet.stadt.hamburg.de/sdp-daten-download/php_lgv/dateien_zippen.php" todo
     * @property {string} compressedFileUrl="https://geofos.fhhnet.stadt.hamburg.de/sdp-daten-download/php_lgv/datei_herunterladen.php" todo
     * @property {Object} wfsRasterParams= {
            url: "https://geodienste.hamburg.de/HH_WFS_Uebersicht_Kachelbezeichnungen",
            request: "GetFeature",
            service: "WFS",
            version: "1.1.0",
            typename: 'app:lgv_kachel_dk5_1km_utm'
        } connection parameters
     * @property {Object} wfsRaster={} contains wfs raster features after loading them
     * @constructs
     * @listens SdpDownloadModel#changeIsActive
     * @listens Core#RadioTriggerMapViewChangedOptions
     * @listens Core.ModelList#RadioTriggerModelListToggleDefaultTool
     * @listens Snippets.Dropdown#ValuesChanged
     * @fires todo
     */
    initialize: function () {
        this.superInitialize();
        this.listenTo(this, {
            "change:isActive": function (value) {
                const isActive = value.get('isActive');
                this.toggleRasterLayer(isActive);
                this.setStatus(this.model, isActive);
                if(isActive){
                    this.loadWfsRaster();
                } 
            }
        });
        this.listenTo(Radio.channel("MapView"), {
            // Wird ausgeloest wenn sich Zoomlevel, Center
            // oder Resolution der Karte ändert
            "changedOptions": function (value) {
                if(this.get('isActive')){
                    this.toggleRasterLayer(true);
                }
            }
        });
        this.listenTo(Radio.channel("ModelList"), {
            //sidebar wird geschlossen, raster nicht mehr anzeigen
            "toggleDefaultTool": function () {
                this.toggleRasterLayer(false);
            }
        });
        this.setGraphicalSelectModel(new GraphicalSelectModel());
    },
    setStatus:function(model, val){
        Radio.trigger("GraphicalSelect", "setStatus", model, val);
    },
    resetView:function(){
        Radio.trigger("GraphicalSelect", "resetView");
    },
    //raster layer
    toggleRasterLayer: function (value) {
        const layerId = this.get("wmsRasterLayerId");
        this.addModelsByAttributesToModelList(layerId);
        this.setModelAttributesByIdToModelList(layerId, value);
    },
    addModelsByAttributesToModelList: function (layerId) {
        if (_.isEmpty(Radio.request("ModelList", "getModelsByAttributes", { id: layerId }))) {
            Radio.trigger("ModelList", "addModelsByAttributes", { id: layerId });
        }
    },
    setModelAttributesByIdToModelList: function (layerId, value) {
        Radio.trigger("ModelList", "setModelAttributesById", layerId, {
            isSelected: value,
            isVisibleInMap: value
        });
    },
    setIsSelected: function (value) {
        this.set("isSelected", value);
    },
    //wfs raster data
    loadWfsRaster: function () {
        const params = this.get('wfsRasterParams');
        const data = "service=" + params.service + "&version=" + params.version + "&request=" + params.request + "&TypeName=" + params.typename;
        $.ajax({
            url: Radio.request("Util", "getProxyURL", params.url),
            data: encodeURI(data),
            contentType: "text/xml",
            type: "GET",
            context: this,
            cache: false,
            dataType: "xml",
            success: function (resp) {
                this.readFeatures(resp);
            },
            error: function (jqXHR, errorText, error) {
                Radio.trigger("Alert", "alert", error);
            }
        });
    },

    readFeatures: function (data) {
        const format = new WFS(),
        features = format.readFeatures(data);
        this.setWfsRaster(features);
    },

    /**
    * Requests GraphicalSelect.featureToGeoJson
    * It converts a feature to a geojson
    * if the feature geometry is a circle, it is converted to a polygon
    * @param {ol.Feature} feature - drawn feature
    * @returns {object} GeoJSON
    */
    featureToGeoJson: function (feature) {
        return Radio.request("GraphicalSelect", "featureToGeoJson", feature);
    },

    getSelectedRasterNames: function () {
        const rasterLayerFeatures = this.get('wfsRaster');
        const selectedAreaGeoJson = this.get('graphicalSelectModel').get('selectedAreaGeoJson');
        const rasterNames = [];
        const turfGeoSelection = turf.polygon([selectedAreaGeoJson.coordinates[0]]);

        for (let j = 0, size = rasterLayerFeatures.length; j < size; j++) {
            const turfRaster = turf.polygon([this.featureToGeoJson(rasterLayerFeatures[j]).coordinates[0]]);
            const turfGeoSelection = turf.polygon([selectedAreaGeoJson.coordinates[0]]);
            if (turf.intersect(turfGeoSelection, turfRaster)) {
                const intersectedRasterName = rasterLayerFeatures[j].getProperties()['kachel'];
                const result = rasterNames.find(rasterName => rasterName === intersectedRasterName);
                if (result === undefined) {
                    rasterNames.push(intersectedRasterName);
                }
            }
        }
        return rasterNames;
    },
    //download raster data
    requestCompressedData: function () {
        const selectedRasterNames = this.getSelectedRasterNames();
        if (selectedRasterNames.length > this.get('selectedRasterLimit')) {
            Radio.trigger("Alert", "alert", {
                text: "Die von Ihnen getroffene Auswahl beinhaltet " + selectedRasterNames.length + " Kacheln.\nSie dürfen maximal " + this.get('selectedRasterLimit') + " Kacheln aufeinmal herunterladen.\n\nBitte reduzieren Sie Ihre Auswahl!",
                kategorie: "alert-warning"
            });
            this.setRequesting(false);
            this.trigger("render");
        }
        else {
            const adaptedNames = [];
            selectedRasterNames.forEach(rasterName => {
                const adaptedName = rasterName.substring(0, 2) + '0' + rasterName.substring(2, 4) + '0';
                adaptedNames.push(adaptedName);
            });
            //params have to look like: "kacheln=650330§650340&type=JPG"
            const params = 'kacheln=' + adaptedNames.join('§') + '&type=' + this.get('selectedFormat');
            this.doRequest(params);
        }
    },
    //download data of islands
    requestCompressIslandData: function (islandName) {
        //params have to look like: "insel=Neuwerk&type=JPG"
        const params = 'insel=' + islandName + '&type=' + this.get('selectedFormat');
        this.doRequest(params);
    },
    //download overview
    requestCompressRasterOverviewData: function (state) {
        //todo Datei nicht mehr lokal ablegen
        const temp = "C:\\sandbox\\BG-74\\U__Kachel_Uebersichten_UTM_Kachel_1KM_" + state + ".dwg";
        window.location.href= this.get('compressedFileUrl') +'?no_delete=1&mt=dwg&name=' + temp;
        
    },
    doRequest: function (params) {
        const url = this.get('compressDataUrl');
        $.ajax({
            url: Radio.request("Util", "getProxyURL", url),
            data: encodeURI(params),
            context: this,
            type: "POST",
            beforeSend: function(){
                this.showLoader();
            },
            success: function (resp) {
                this.resetView();
                this.setStatus(this.model, true);
                 //download zip-file
                 window.location.href = this.get('compressedFileUrl') + '?name=' + resp;
            },
            complete:function(data){
                this.hideLoader();
            },
            timeout: 6000,
            error: function () {
                this.resetView();
                this.setStatus(this.model, true);
                Radio.trigger("Alert", "alert", {
                    text: "<strong>Die Daten konnten leider nicht heruntergeladen werden!</strong> <br> <small>Details: Ein benötigter Dienst antwortet nicht.</small>",
                    kategorie: "alert-warning"
                });
            }
        });
    },
    hideLoader: function(){
        this.set('requesting', false)
        this.trigger("render");
    },
    showLoader: function(){
        this.set('requesting', true)
        this.trigger("render");
    },
    /**
     * Sets the requesting
     * @param {*} value todo
     * @returns {void}
     */
    setRequesting: function (value) {
        this.set("requesting", value);
    },
    /**
     * Sets the selected format
     * @param {*} value todo
     * @returns {void}
     */
    setSelectedFormat: function (value) {
        this.set("selectedFormat", value);
    },
    /**
     * Sets the WFSRaster
     * @param {*} value todo
     * @returns {void}
     */
    setWfsRaster: function (value) {
        this.set("wfsRaster", value);
    },
    /**
     * Sets the selectedAreaGeoJson
     * @param {*} value todo
     * @returns {void}
     */
    setSelectedAreaGeoJson: function (value) {
        this.set("selectedAreaGeoJson", value);
    },
    /**
     * Sets the loaderPath
     * @param {String} value path to the loader gif
     * @returns {void}
     */
    setLoaderPath: function (value) {
        this.set("loaderPath", value);
    },
    /**
     * Sets the graphicalSelectModel
     * @param {String} value graphicalSelectModel
     * @returns {void}
     */
    setGraphicalSelectModel:function(value){
        this.set("graphicalSelectModel", value);
    }

});

export default SdpDownloadModel;