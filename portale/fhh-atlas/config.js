define(function () {
    var config = {
        title: "FHH - Atlas",
        tree: {
            custom: false,
            orderBy: "opendata",
            filter: true,
            layerIDsForMerge: [
                ["149", "150", "151", "152", "153", "154", "155", "156", "157", "158", "159", "160", "161", "162", "163", "164", "165", "166", "167", "168", "169", "170", "171", "172", "173", "174", "175", "176", "177", "178"],
                ["368", "369", "370", "371", "372", "373", "374", "375", "376", "377", "378", "379", "380", "381", "382", "383", "384", "385", "386", "387", "388", "389", "390", "391", "392", "393", "394", "395", "396", "397"]
            ],
            metaIDsForMerge: [
                "B6A59A2B-2D40-4676-9094-0EB73039ED34", // Geobasiskarten
                "38575F13-7FA2-4F26-973F-EDED24D937E5", // Landesgrundbesitzverzeichnis
                "CD1AA43B-9C7E-4E85-B0A3-8619101D0517", // Landesgrundbesitzverzeichnis FHHNet
                "757A328B-415C-4E5A-A696-353ABDC80419", // ParkraumGIS
                "335B680C-CA3E-4FE9-BC05-641BA565E366", // Lärmminderungsplanung, Fluglärm
                "3EE8938B-FF9E-467B-AAA2-8534BB505580", // Bauschutzbereich § 12 LuftVG Hamburg
                "19A39B3A-2D9E-4805-A5E6-56A5CA3EC8CB", // HH-SIB
                "F691CFB0-D38F-4308-B12F-1671166FF181", // Flurstücke gelb
                "FE4DAF57-2AF6-434D-85E3-220A20B8C0F1" // Flurstücke schwarz
            ],
            metaIDsForIgnore: [
                "09DE39AB-A965-45F4-B8F9-0C339A45B154", // MRH Fachdaten
                "51656D3F-E801-497C-952C-4F1F605843DD", // MRH Metrokarte
                "AD579C62-0471-4FA5-8C9A-38B3DCB5B2CB", // MRH Übersichtskarte-blau
                "14E3AFAE-99BE-4F1D-A3A6-6A68A1CDAC7B", // MRH Übersichtskarte-grün
                "56110E55-72C7-41F2-9F92-1C598E4E0A02" // Digitale Karte Metropolregion
            ]
        },
        baseLayer: [
            {id: "453", visibility: false, minResolution: 0.2645838625010583, minScale: "1000"},
            {id: "8", visibility: false},
            {id: "717", visibility: true, minResolution: 0.2645838625010583, minScale: "1000"},
            {id: "368", visibility: false, name: "ALKIS farbig", maxResolution: 5.2916772500211667, maxScale: "10000"},
            {id: "149", visibility: false, name: "ALKIS grau-blau", maxResolution: 5.2916772500211667, maxScale: "10000"}
        ],
        footer: true,
        quickHelp: true,
        allowParametricURL: true,
        view: {
            center: [565874, 5934140]
        },
        layerConf: "../components/lgv-config/services-fhhnet.json",
        restConf: "../components/lgv-config/rest-services-fhhnet.json",
        categoryConf: "../components/lgv-config/category.json",
        styleConf: "../components/lgv-config/style.json",
        menubar: true,
        scaleLine: true,
        isMenubarVisible: true,
        menu: {
            viewerName: "FHH - Atlas",
            searchBar: true,
            layerTree: true,
            helpButton: false,
            contactButton: true,
            tools: true,
            treeFilter: false,
            wfsFeatureFilter: false,
            legend: true,
            routing: false
        },
        startUpModul: "",
        searchBar: {
            placeholder: "Suche Adresse, Stadtteil, Themen",
            gazetteerURL: function () {
                return "/geofos/dog_hh/services/wfs?service=WFS&request=GetFeature&version=2.0.0";
            }
        },
        tools: {
            gfi: true,
            measure: true,
            print: true,
            coord: true,
            draw: true,
            orientation: false,
            active: "gfi"
        },
        print: {
            printID: "99997",
            title: "Freie und Hansestadt Hamburg - Atlas",
            outputFilename: "Ausdruck FHH - Atlas",
            gfi: false
        },
        proxyURL: "/cgi-bin/proxy.cgi"
    };

    return config;
});
