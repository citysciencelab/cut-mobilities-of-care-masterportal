{
  "Portalconfig":
  {
    "searchBar": {
        "gazetteer": {
            "minChars": 3,
            "serviceId": "6",
            "searchStreets": true,
            "searchHouseNumbers": true,
            "searchDistricts": true,
            "searchParcels": true,
            "searchStreetKey": true
        },
        "zoomLevel": 9,
        "placeholder": "Suche nach Straße/Adresse",
        "renderToDOM": "#searchbarInMap",
        "searchbarTemplate": "mml"
    },
    "mapView": {
        "backgroundImage": "backgroundCanvas.jpeg",
        "startCenter": [561210, 5932600]
    },
    "menu": {
      "tree": {
        "name": "Themen",
        "glyphicon": "glyphicon-list"
      },
      "gfi": {
        "name": "Informationen abfragen",
        "glyphicon": "glyphicon-info-sign",
        "isActive": true
      },
      "hide": true
    },
    "simpleLister": {
      "layerId": "6059",
      "errortxt": "kein Anliegen!!!",
      "featuresPerPage": 20
    },
    "mapMarkerModul": {
      "marker": "dragMarker",
      "dragMarkerLandesgrenzeId": "6074",
      "visible": true
    },
    "mmlFilter": true,

    "controls": {
      "toggleMenu": false,
      "fullScreen": true,
      "zoom": true,
      "orientation": {
        "zoomMode": "once",
        "markerIcon": "dragMarker",
        "addClass": "visible-xs",
        "geolocationIcon": "orientation_mml"
      },
      "poi": false,
      "attributions": false,
      "toggleBaselayer": true
    },
    "scaleLine": true,
    "Baumtyp": "light",
    "reverseGeocoder": {
      "wpsId": "1002",
      "timeout": 3000
    }
  },
  "Themenconfig":
  {
    "Hintergrundkarten":
    {
      "Layer": [
        {
          "id": "453",
          "visibility": true
        },
        {
          "id": "452",
          "name": "Luftbilder"
        }
      ]
    },
    "Fachdaten":
    {
      "Layer": [
        {
          "id": "6059",
          "name": "Anliegen",
          "visibility": true,
          "styleId": "mml",
          "clusterDistance": 60,
          "mouseHoverField": {
            "header": ["str", "hsnr"],
            "text": ["kat_text"]
          },
          "gfiTheme": "mmltheme",
        }
      ]
    }
  }
}
