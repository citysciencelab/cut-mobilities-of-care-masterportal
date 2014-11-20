define(function () {

    // Parsen des parametrisierten Aufruf --> http://wscd0096/master_sd/portale/master/index.html?center=555874,5934140&layerIDs=8994,453&zoomLevel=4
    var query = location.search.substr(1); // URL --> alles nach ? wenn vorhanden
    var result = {};
    query.split("&").forEach(function (keyValue) {
        var item = keyValue.split("=");
        result[item[0]] = decodeURIComponent(item[1]); // item[0] = key; item[1] = value;
    });

    /**
     * Gibt die initiale Zentrumskoordinate zurück.
     * Ist der Parameter 'center' vorhanden wird dessen Wert zurückgegeben, ansonsten der Standardwert.
     * @returns {Array} -- Die Zentrumskoordinate
     */
    function getCenter () {
        if (result['center'] !== undefined) {
            var coords = result['center'].split(",");
            return [parseInt(coords[0], 10), parseInt(coords[1], 10)];
        }
        else {
            return [565874, 5934140]; // Rathausmarkt
        }
    }

    /**
     * Gibt die LayerIDs für die Layer zurück, die initial sichtbar sein sollen.
     * Ist der Parameter 'layerIDs' vorhanden werden dessen IDs zurückgegeben, ansonsten die konfigurierten IDs.
     * @returns {Array} -- Die LayerIDs kommasepariert als String
     */
    function getVisibleLayer () {
        if (result['layerIDs'] !== undefined) {
            var layers = result['layerIDs'].split(",");
            return layers;
        }
        else {
            return [
                '453',  // Luftbilder (WMS)
                '5182'
            ];
        }
    }

    /**
     * Gibt die initiale Resolution (Zoomlevel) zurück.
     * Ist der Parameter 'zoomLevel' vorhanden wird die passende Resolution zurückgegeben, ansonsten der Standardwert.
     * @returns {Number} -- Die Resolution
     */
    function getResolution () {
        var resolutions = {
            '1': 66.14614761460263,  // 1:250:000
            '2': 26.458319045841044, // 1:100.000
            '3': 15.874991427504629, // 1:60.000
            '4': 10.583327618336419, // 1:40.000
            '5': 5.2916638091682096, // 1:20.000
            '6': 2.6458319045841048, // 1:10.000
            '7': 1.3229159522920524, // 1:5.000
            '8': 0.6614579761460262, // 1:2.500
            '9': 0.2645831904584105  // 1:1.000
        };
        if (result['zoomLevel'] !== undefined) {
            return resolutions[result['zoomLevel']];
        }
        else {
            return 15.874991427504629 // 1:60.000
        }
    }

    var config = {
        view: {
            center: getCenter(),
            resolution: getResolution(),
            scale: 60000 // für print.js benötigt
        },
        layerConf: '../../diensteapiFHHNET.json',
        layerIDs: [
            '453',
            '8',
            '7777',
            '1388',
            '1117',
            '1166',
            '5182'
        ],
        // Layer die Initial sichtbar sein sollen
        visibleLayer: getVisibleLayer(),
        styleConf: '../../style.json',
        wfsconfig: [
            {layer: '8999', style: ['5','6','7','8','8999_cluster'], clusterDistance: 30, attributeField :'Kategorie'},
            {layer: '8998', style: ['32','33','34','35','8998_cluster'], clusterDistance: 30, attributeField :'Kategorie'},
            {layer: '8997', style: ['10','8997_cluster'], clusterDistance: 30, attributeField :'Kategorie'},
            {layer: '8996', style: ['11','12','13','14','15','16','17','8996_cluster'], clusterDistance: 30, attributeField :'Kategorie'},
            {layer: '8995', style: ['9','10','8995_cluster'], clusterDistance: 30, attributeField :'Kategorie'},
            {layer: '8994', style: ['18','19','20','21','22','8994_cluster'], clusterDistance: 30, attributeField :'Kategorie'},
            {layer: '8993', style: ['23','24','25','26','27','28','8993_cluster'], clusterDistance: 30, attributeField :'Kategorie'},
            {layer: '8992', style: ['29','30','31','8992_cluster'], clusterDistance: 30, attributeField :'Kategorie'}
        ],
        menubar: true,
        isMenubarVisible: true,
        menu: {
            viewerName: 'GeoViewer',
            searchBar: true,
            layerTree: true,
            helpButton: false,
            contactButton: true,
            tools: true,
            treeFilter: true,
            wfsFeatureFilter: false,
            legend: false
        },
        gazetteerURL: 'http://wscd0096/dog_hh/services/wfs?service=WFS&request=GetFeature&version=2.0.0',
        tools: {
            gfi: true,
            measure: false,
            print: true,
            coord: true,
            orientation: false,
            active: 'gfi'
        },
        printURL: 'http://wscd0096:8680/mapfish_print_2.0/pdf6/info.json',
        proxyURL: 'http://wscd0096/cgi-bin/proxy.cgi'
    }

    return config;
});
