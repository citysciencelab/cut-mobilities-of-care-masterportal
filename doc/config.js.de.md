>Zurück zur **[Dokumentation Masterportal](doc.de.md)**.

[TOC]

# config.js #
Die *config.js* enthält die Konfigurationsoptionen für das Masterportal, die sich nicht auf die Portal-Oberfläche oder die dargestellten Layer beziehen, z.B. Pfade zu weiteren Konfigurationsdateien. Die *config.js* liegt im Regelfall neben der index.html und neben der *config.json*.
Im Folgenden werden die einzelnen Konfigurationsoptionen beschrieben. Darüber hinaus gibt es für die Konfigurationen vom Typ *object* weitere Optionen, diese Konfigurationen sind verlinkt und werden im Anschluss an die folgende Tabelle jeweils genauer erläutert. Hier geht es zu einem **[Beispiel](https://bitbucket.org/geowerkstatt-hamburg/masterportal/src/stable/portal/basic/config.js)**.

|Name|Verpflichtend|Typ|Default|Beschreibung|Beispiel|
|----|-------------|---|-------|------------|--------|
|layerConf|ja|String||Pfad zur **[services.json](services.json.de.md)**, die alle verfügbaren WMS-Layer bzw. WFS-FeatureTypes enthält. Der Pfad ist relativ zu *js/main.js*.|`"../components/lgv-config/services-internet.json"`|
|namedProjections|ja|Array[String]||Festlegung der nutzbaren Koordinatensysteme (**[siehe Syntax](http://proj4js.org/#named-projections)**).|`[["EPSG:25832", "+title=ETRS89/UTM 32N +proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"]]`|
|proxyUrl|ja|String||_Deprecated im nächsten Major-Release, bitte nutzen Sie den Mapfish-Print 3._ Absoluter Server-Pfad zu einem Proxy-Skript, dass mit *"?url="* aufgerufen wird. Notwendig, wenn der Druck-Dienst konfiguriert ist (siehe **[print](#markdown-header-print)**).|`"/cgi-bin/proxy.cgi"`|
|restConf|ja|String||Pfad zur **[rest-services.json](rest-services.json.de.md)**, die weitere, verfügbare Dienste enthält (z.B. Druckdienst, WPS, CSW). Der Pfad ist relativ zu js/main.js.|`"../components/lgv-config/rest-services-internet.json"`|
|styleConf|ja|String||Pfad zur **[style.json](style.json.de.md)**, die Styles für Vektorlayer (WFS) enthält. Der Pfad ist relativ zu *js/main.js*.|`"../components/lgv-config/style.json"`|
|addons|nein|Array|[]|Angabe der Namen der gewünschten Custom-Module. Diese befinden sich im Ordner /addons/ und deren Entrypoints werden mithilfe der Datei addonsConf.json definiert.|`["myAddon1", "myAddon2"]`|
|**[alerting](#markdown-header-alerting)**|nein|Object|{"category": "alert-info", "isDismissable": true, "isConfirmable": false, "position": "top-center", "fadeOut": null}|Konfigurationsobjekt zum Überschreiben der default Werte des Alerting Moduls.|{fadeOut: 6000}|
|**[cameraParameter](#markdown-header-cameraparameter)**|nein|Object||Start Camera Parameter||
|**[cesiumParameter](#markdown-header-cesiumparameter)**|nein|Object||Cesium Flags||
|**[clickCounter](#markdown-header-clickcounter)**|nein|Object||Konfigurationsobjekt des ClickCounterModuls. Dieses lädt für jeden registrierten Klick ein iFrame.||
|cswId|nein|String|"3"|Referenz auf eine CS-W Schnittstelle, die für die Layerinformation genutzt wird. ID wird über **[rest-services.json](rest-services.json.md)** aufgelöst.|`"meine CSW-ID"`|
|defaultToolId|nein|String|"gfi"|Id des Tools, das immer an sein soll, wenn kein anderes Tool aktiv ist.|"filter"|
|featureViaURL|nein|**[featureViaURL](#markdown-header-featureviaurl)**||Optionale Konfigurationseinstellungen für den URL-Parameter *featureViaURL*. Siehe **[URL-Parameter](urlParameter.de.md)**. Implementiert für den treeType *light* und *custom*.||
|**[footer](#markdown-header-footer)**|nein|Object||Zeigt einen Footer-Bereich an und konfiguriert diesen.||
|gfiWindow|nein|String|"detached"|Deprecated im nächsten Major-Release, bitte das Attribut "Portalconfig.menu.tool.gfi.desktopType" in der **[config.json](config.json.de.md)** verwenden. Darstellungsart der Attributinformationen für alle Layertypen. **attached**: das Fenster mit Attributinformationen wird am Klickpunkt geöffnet. **detached**: das Fenster mit Attributinformationen wird oben rechts auf der Karte geöffnet. Der Klickpunkt wird zusätzlich mit einem Marker gekennzeichnet.|`"attached"`|
|ignoredKeys|nein|Array[String]|["BOUNDEDBY", "SHAPE", "SHAPE_LENGTH", "SHAPE_AREA", "OBJECTID", "GLOBALID", "GEOMETRY", "SHP", "SHP_AREA", "SHP_LENGTH","GEOM"]|Liste der ignorierten Attributnamen bei der Anzeige von Attributinformationen aller Layertypen. Wird nur verwendet bei "gfiAttributes": "showAll".|["BOUNDEDBY", "SHAPE", "SHAPE_LENGTH", "SHAPE_AREA", "OBJECTID", "GLOBALID", "GEOMETRY", "SHP", "SHP_AREA", "SHP_LENGTH","GEOM"]|
|infoJson|nein|String|"info.json"|Pfad zur info.json, die Zusatzinformationen für Snippets enthält. Der Pfad ist relativ zur index.html.|`"info.json"`|
|inputMap|nein|Object|`{}`|Ist dieses Objekt vorhanden und ist setMarker darin auf true gesetzt, dann wird das Masterportal als Eingabeelement für Daten konfiguriert. Das bedeutet, dass jeder Klick auf die Karte einen Map Marker setzt und die Koordinaten des Markers via RemoteInterface im gewünschten Koordninatensystem sendet.|`{setMarker: true, targetProjection: "EPSG:4326", setCenter: false}`|
|inputMap.setCenter|nein|Boolean|false|Soll die Karte nach dem setzen eines Markers um den Marker zentriert werden?|`setCenter: true`|
|inputMap.setMarker|nein|Boolean|false|Flag zum aktivieren und deaktivieren der in inputMap konfigurierten Funktionalität.|`setMarker: true`|
|inputMap.targetProjection|nein|String|`EPSG:25832`|Das Zielkoordninatensystem, in dem die Koordinaten des Markers gesendet werden sollen.|`targetprojection: "EPSG:4326"`|
|mapMarker|nein|**[mapMarker](#markdown-header-mapmarker)**||Konfigurationsobjekt zum Überschreiben der default Werte des MapMarker Moduls. Ist für die Nutzung eines 3D-Marker sinnvoll, da ol-Overlays nicht in 3D dargestellt werden können. Dafür muss der mapMarker als VectorLayer definiert werden.||
|metaDataCatalogueId|nein|String|"2"|URL des in den Layerinformationen verlinkten Metadatenkatalogs. Die ID wird über **[rest-services.json](rest-services.json.de.md)** aufgelöst.|`"MetadatenkatalogURL"`|
|**[metadata](#markdown-header-metadata)**|nein|Object||Darin kann angegeben werden, welche Metdaten-URLs über einen Proxy angefragt werden sollen.||
|**[mouseHover](#markdown-header-mousehover)**|nein|Object||Steuert, ob MouseHover für Vektorlayer (WFS und GeoJSON) aktiviert ist. Weitere Konfigurationsmöglichkeiten pro Layer in **[config.json](config.json.de.md)** (*Themenconfig.Fachdaten.Layer*).|`true`|
|obliqueMap|nein|Boolean|false|Legt fest eine Schrägluftbild Karte erstellt werden soll. Benötigt zusätzlich noch eine Schrägluftbildebene.||
|portalConf|nein|String|"config.json"|Pfad zur config.json des Portals. Es kann auch ein Knotenpunkt angegeben werden. Der Weiterführende Pfad wird dann über den URL-Parameter "config" gesteuert.|Direkter Pfad: "../masterTree/config.json"; Knotenpunkt: "../../portal/master/". Zusätzlich muss dann in der URL der Parameter "config=config.json" stehen.|
|postMessageUrl|nein|String|"http://localhost:8080"|Url auf die das Portal per post-Message agieren und reagieren kann.| "http://localhost:8080"|
|proxyHost|nein|String||Hostname eines remote Proxy (dort muss CORS aktiviert sein)|`"https://proxy.example.com"`|
|[quickHelp]|nein|Object|`{}`|Aktiviert das QuickHelp-Modul. Dieses zeigt ein Hilfefenster für die verfügbaren Funktionen des jeweiligen Modul an. Bisher verfügbar für den Themenbaum (CustomTree), die Suchleiste (Searchbar) und für das Werkzeug: Messen (MeasureTool)).||
|**[remoteInterface](#markdown-header-remoteinterface)**|nein|object||Optionale Konfiguration für das remoteInterface.||
|scaleLine|nein|Boolean|false|Steuert, ob eine Maßstabsleiste unten rechts auf der Karte angezeigt wird.|`true`|
|simpleMap|nein|Boolean|false|_Deprecated im nächsten Major-Release. Bitte nutzen Sie den Parameter `simpleMap` als Teil der Konfiguration des Tools `saveSelection` in der **[config.json](config.json.md)**._ Fügt dem *„Auswahl speichern“-Dialog* eine SimpleMap-URL hinzu (ohne Menüleiste, Layerbau, Map Controls). Nicht für Portale mit Baumtyp: *„light“*.|`false`|
|startingMap3D|nein|Boolean|false|Legt fest ob der 3D Modus beim Start der Anwendung geladen werden soll.||
|**[tree](#tree)**|nein|Object||||
|uiStyle|nein|String|default|Steuert das Layout der Bedienelemente. |`table`|
|**useVectorStyleBeta**|nein|Boolean|false|Konfigurationswert ob anstelle des produktiven vectorStyle-Moduls ein sich in der Entwicklung befindliches neues Modul zum Styling von Vektordaten verwendet werden soll. Die Verwendung bedingt eine neue Syntax der style.json. Deprecated mit Version 3.0.|useVectorStyleBeta: true|
|wfsImgPath|nein|String||Pfad zum Ordner mit Bildern, die für WFS-Styles benutzt werden. Der Pfad ist relativ zu *js/main.js*.|`"../components/lgv-config/img/"`|
|wpsID|nein|String|""|Referenz auf eine WPS-Schnittstelle, die in verschiedenen Modulen genutzt wird. ID wird über **[rest-services.json](rest-services.json.de.md)** aufgelöst.|`""`|
|**[zoomToFeature](#markdown-header-zoomtofeature)**|nein|Object||Optionale Konfigurations-Einstellungen für den URL-Parameter *featureid*. Siehe **[URL-Parameter](urlParameter.de.md)**.||

***

## alerting ##
|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|fetchBroadcastUrl|nein|String|false|Hier kann eine URL definiert werden, unter der das Masterportal initial eine für das Alerting spezifische Konfigurationsdatei laden kann.|
|localStorageDisplayedAlertsKey|nein|String|"displayedAlerts"|Frei wählbarer Key, unter dem im Local Storage des Browsers Daten bezüglich des Alertings gespeichert werden.|

***

## cameraParameter ##
|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|heading|nein|Number||Heading der Kamera in Radians.|
|tilt|nein|Number||Tilt der Kamera in Radians.|
|altitude|nein|Number||Höhe der Kamera in m.|

***

## cesiumParameter ##
|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|fog|nein|Object||Nebel Einstellungen. Optionen siehe **[fog]**|
|enableLighting|nein|Boolean|false|aktiviert Lichteffekte auf dem Terrain von der Sonne aus.|
|maximumScreenSpaceError|nein|Number|2.0|Gibt an wie detailliert die Terrain/Raster Kacheln geladen werden. 4/3 ist die beste Qualität.|
|fxaa|nein|Number|true|aktiviert Fast Approximate Anti-alisasing.|
|tileCacheSize|nein|Number|100|Größe des Tilecaches für Terrain/Raster Kacheln.|

[fog]: https://cesiumjs.org/Cesium/Build/Documentation/Fog.html

***

## clickCounter ##
|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|desktop|nein|String||URL des iFrames bei Desktopausspielung.|
|mobile|nein|String||URL des iFrames bei mobiler Ausspielung.|

**Beispiel:**

```
#!json

clickCounter:
{
desktop: "http://static.hamburg.de/countframes/verkehrskarte_count.html",
mobil: "http://static.hamburg.de/countframes/verkehrskarte-mobil_count.html"
}

```

***

## footer ##
|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|**[urls](#markdown-header-footerurls)**|nein|Array[Object]||Array von URL-Konfigurationsobjekten. Auch hier existieren wiederum mehrere Konfigurationsmöglichkeiten, welche in der folgenden Tabelle aufgezeigt werden.|
|showVersion|nein|Boolean|false|Flag, ob die Versionsnummer des Masterportals im Footer angezeigt werden soll.|

***

### footer.urls ###
|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|alias|nein|String|"Landesbetrieb Geoniformation und Vermessung"|Bezeichnung des Links bei Desktop-Ausspielung.|
|alias_mobil|nein|String|"LGV"|Bezeichnung bei mobiler Ausspielung.|
|bezeichnung|nein|String|"Kartographie und Gestaltung: "|Bezeichnung vor dem Link.|
|url|nein|String||URL die hinter dem ALias verlinkt wird z.B. „https://beispielSeite.de/“. Es besteht auch die Möglichkeit eine E-Mailadresse zu verlinken z.B. "mailto:meine@email.de"|
|toolModelId|nein|String|"sdpdownload"|Die id des Models dessen Tool geöffnet werden soll, eine url ist dann nicht nötig.|

**Beispiel:**

```
#!json
footer: {
    urls: [
        {
            "bezeichnung": "Kartographie und Gestaltung: ",
            "url": "http://www.geoinfo.hamburg.de/",
            "alias": "Landesbetrieb Geoniformation und Vermessung",
            "alias_mobil": "LGV"
        },
        {
            "bezeichnung": "",
            "url": "http://www.hamburg.de/bsu/timonline",
            "alias": "Kartenunstimmigkeit"
        },
        {
            "bezeichnung": "",
            "url": "",
            "alias": "SDP Download",
            "toolModelId": "sdpdownload"
        }
    ],
    "showVersion": true
}
```

***

## mapMarker ##
|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|pointStyleId|nein|String|"defaultMapMarkerPoint"|StyleId zur Konfiguration des MapMarkers für Punkte in der style.json. Per default wird die mapMarker.svg aus dem Ordner "img" des Masterportals verwendet.|
|polygonStyleId|nein|String|"defaultMapMarkerPolygon"|StyleId zur Konfiguration des MapMarkers für Polygone in der style.json.|

**Beispiel:**

```
#!json
mapMarker: {
    pointStyleId: "customMapMarkerPoint",
    polygonStyleId: "customMapMarkerPolygon"
}
```

***

## mouseHover ##
|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|minShift|nein|Integer|5|Gibt an, wieviele Pixel sich die Position gegenüber vorher verändert haben muss, um ein neues Tooltip zu rendern.|
|numFeaturesToShow|nein|Integer|2|Maximale Anzahl an Elementinformationen im Tooltip, bevor ein InfoText die Anzahl limitiert.|
|infoText|nein|String|"(weitere Objekte. Bitte zoomen.)"|Meldung die bei Überschreiten der numFeaturesToShow mit im MouseHover angezeigt wird.|

***

## portalLanguage ##
|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|enabled|ja|Boolean|true|Abhängig von diesem Schalter wird ein Button zum Umschalten von Sprachen angezeigt|
|debug|nein|Boolean|false|Schalter um debug-Ausgaben bez. der Übersetzung in der console anzuzeigen|
|languages|ja|Object|de: "deutsch", en: "englisch"|Konfiguration der im Portal verwendeten Sprachen. Bitte beachten, dass die entsprechenden Sprach-Dateien auch hinterlegt sein müssen.|
|fallbackLanguage|nein|String|"de"|Sprache die benutzt wird, wenn Übersetzungen in der gewählten Sprache nicht verfügbar sind|
|changeLanguageOnStartWhen|nein|Array|["querystring", "localStorage", "navigator", "htmlTag"]|Reihenfolge und woher die Benutzersprache erkannt werden soll, siehe auch https://github.com/i18next/i18next-browser-languageDetector|
|loadPath|nein|String|"/locales/{{lng}}/{{ns}}.json"|Pfad, von dem Sprachdateien geladen werden, oder eine Funktion, die einen Pfad zurückgibt: function(lngs, Namensräume) { return path; } Der zurückgegebene Pfad interpoliert lng, ns, falls angegeben, wie bei einem statischen Pfad. Es kann auch eine Url angegebn werden, wie https://localhost:9001/locales/{{lng}}/{{ns}}.json. Siehe auch https://github.com/i18next/i18next-http-backend|

**Beispiel:**

```
portalLanguage: {
        enabled: true,
        debug: false,
        languages: {
            de: "deutsch",
            en: "englisch"
        },
        fallbackLanguage: "de",
        changeLanguageOnStartWhen: ["querystring", "localStorage", "navigator", "htmlTag"],
        loadPath: "/locales/{{lng}}/{{ns}}.json"
    }
```

***

## quickHelp ##
|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|imgPath|nein|String|`"/"`|Gibt den Pfad (relativ oder absolut) zu einem Dateiordner an, in dem sich die Bilder für die Quickhelp befinden.|
|searchbarAllgemeines1|nein|String|`"allgemein.png"`|Erstes Bild zur Darstellung in der Quickhelp der Searchbar unter dem Menüpunkt Allgemeines. Das Bild muss unter dem angegebnen Dateiordner (imgPath) abgelegt sein|
|searchbarAllgemeines2|nein|String|`"allgemein_2.png"`|Zweites Bild zur Darstellung in der Quickhelp der Searchbar unter dem Menüpunkt Allgemeines. Das Bild muss unter dem angegebnen Dateiordner (imgPath) abgelegt sein|
|searchbarAllgemeines3|nein|String|`"allgemein_3.png"`|Drittes Bild zur Darstellung in der Quickhelp der Searchbar unter dem Menüpunkt Allgemeines. Das Bild muss unter dem angegebnen Dateiordner (imgPath) abgelegt sein|
|searchbarFlurstueckssuche|nein|String|`"allgemein_4.png"`|Bild zur Darstellung in der Quickhelp der Searchbar unter dem Menüpunkt Flurstückssuche. Das Bild muss unter dem angegebnen Dateiordner (imgPath) abgelegt sein|
|aufbau1|nein|String|`"themen.png"`|Erstes Bild zur Darstellung in der Quickhelp des Themenbaums (CustomTree) unter dem Menüpunkt Aufbau. Das Bild muss unter dem angegebnen Dateiordner (imgPath) abgelegt sein|
|aufbau2|nein|String|`"themen_2.png"`|Zweites Bild zur Darstellung in der Quickhelp des Themenbaums (CustomTree) unter dem Menüpunkt Aufbau. Das Bild muss unter dem angegebnen Dateiordner (imgPath) abgelegt sein|
|statistikFlaecheNiemeier|nein|String|`"Statistik_Flaeche_Niemeier.png"`|Erstes Bild zur Darstellung in der Quickhelp des Werkzeugs Messen (MeasureTool) unter dem Menüpunkt Statistische Annäherung. Das Bild muss unter dem angegebnen Dateiordner (imgPath) abgelegt sein|
|statistikStreckeUniErlangen|nein|String|`"Statistik_Strecke_UniErlangen.png"`|Zweites Bild zur Darstellung in der Quickhelp des Werkzeugs Messen (MeasureTool) unter dem Menüpunkt Statsitische Annäherung. Das Bild muss unter dem angegebnen Dateiordner (imgPath) abgelegt sein|
|utmStreifen|nein|String|`"UTM_Streifen.png"`|Erstes Bild zur Darstellung in der Quickhelp des Werkzeugs Messen (MeasureTool) unter dem Menüpunkt Entzerrung in UTM. Das Bild muss unter dem angegebnen Dateiordner (imgPath) abgelegt sein|
|utmVerzerrung|nein|String|`"UTM_Verzerrung.png"`|Zweites Bild zur Darstellung in der Quickhelp des Werkzeugs Messen (MeasureTool) unter dem Menüpunkt Entzerrung in UTM. Das Bild muss unter dem angegebnen Dateiordner (imgPath) abgelegt sein|
|utmFormeln|nein|String|`"UTM_Formeln.png"`|Drittes Bild zur Darstellung in der Quickhelp des Werkzeugs Messen (MeasureTool) unter dem Menüpunkt Entzerrung in UTM. Das Bild muss unter dem angegebnen Dateiordner (imgPath) abgelegt sein|

***

## remoteInterface ##
|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|postMessageUrl|nein|String|"http://localhost:8080"|Url auf die das Portal per post-Message agieren und reagieren kann.

**Beispiel:**

```
#!json
remoteInterface:{
    postMessageUrl: "http://localhost:8080"
}

```
***

## tree ##
|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|orderBy|nein|String|OpenData|Gibt die Kategorie an nach der initial der Themenbaum sortiert wird.|
|layerIDsToIgnore|nein|Array|| Array mit LayerIDs aus der services.json die nicht im Themenbaum dargestellt werden.|
|**[layerIDsToStyle](#markdown-header-treelayeridstostyle)**|nein|Array[Object]||Speziell für HVV Dienst. Enthält Objekte um verschiedene Styles zu einer layerId abzufragen.|
|metaIDsToMerge|nein|Array||Fasst alle unter dieser metaID gefundenen Layer aus der services.json zu einem LAyer im Themenbaum zusammen.|
|metaIDsToIgnore|nein|Array||Alle Layer der Service.json mit entsprechender metaID werden ignoriert im Themenbaum.|
|isFolderSelectable|nein|Boolean|true|Legt auf globaler Ebene fest, ob eine Auswahlbox zur Selektierung aller Layer eines Ordners angezeigt werden soll. Diese Festlegung kann von Element-Eigenschaften überschrieben werden (vgl. **[config.json](config.json.md#Ordnerkonfiguration-Fachdaten)**).|

***

### tree.layerIDsToStyle ###
|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|id|nein|Sring||Entsprechend der LayerId aus der service.json.|
|styles|nein|String oder Array||Enthält einen zu verwendenden Style als String oder bei verschiedenen Styles ein Array aus Strings.|
|name|nein|String oder Array||Enthält einen zu verwendenden Namen als String oder bei verschiedenen Namen ein Array aus Strings.|
|legendUrl|nein|String oder Array||Enthält eine zu verwendenden Legende als String oder bei verschiedenen Legenden ein Array aus Strings.|

**Beispiel:**

```
#!json

tree: {
            orderBy: "opendata",
            layerIDsToIgnore: ["1912", "1913"],
            layerIDsToStyle: [
                {
                    "id": "1935",
                    "styles": ["geofox_Faehre", "geofox-bahn", "geofox-bus", "geofox_BusName"],
                    "name": ["Fährverbindungen", "Bahnlinien", "Buslinien", "Busliniennummern"],
                    "legendURL": ["http://geoportal.metropolregion.hamburg.de/legende_mrh/hvv-faehre.png", "http://geoportal.metropolregion.hamburg.de/legende_mrh/hvv-bahn.png", "http://geoportal.metropolregion.hamburg.de/legende_mrh/hvv-bus.png", "http://87.106.16.168/legende_mrh/hvv-bus.png"]
                }
            ],
            metaIDsToMerge: [
                "FE4DAF57-2AF6-434D-85E3-220A20B8C0F1"
            ],
            metaIDsToIgnore: [
                "09DE39AB-A965-45F4-B8F9-0C339A45B154"
            ],
            isFolderSelectable: false
        }
```

***

## metadata ##
|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|useProxy|nein|String[]||Deprecated im nächsten Major-Release, da von der GDI-DE empfohlen wird einen CORS-Header einzurichten. Gibt welche Metadaten-URLs über einen Proxy angefragt werden sollen, dabei werden die Punkte in der URL durch Unterstriche ersetzt.|

**Beispiel:**

```
#!json
metadata: {
    useProxy: [
        "https://metaver.de/csw"
    ]
}
```

***

***

## zoomToFeature ##
|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|[imgLink(Deprecated in 3.0.0)]()|ja|String||Link für den Marker.|
|wfsId|ja|String||ID des WFS-Layers von dem die Position abgefragt wird.|
|attribute|ja|String||Attributname. Entspricht Attribut nach dem der WFS gefiltert wird.|
|styleId|nein|String||Hier kann eine StyleId aus der style.json angegeben werden um den Standard-Style vom MapMarker zu überschreiben..|
|useProxy|nein|Boolean|false|Deprecated im nächsten Major-Release, da von der GDI-DE empfohlen wird einen CORS-Header einzurichten. Gibt an, ob die URL des Dienstes über einen Proxy angefragt werden soll, dabei werden die Punkte in der URL durch Unterstriche ersetzt.|

**Beispiel:**

```
#!json
zoomtofeature: {
    attribute: "flaechenid",
    wfsId: "4560",
    styleId: "location_eventlotse"
}
```

***

## zoomToGeometry ##
|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|[imgLink(Deprecated in 3.0.0)]()|ja|String||Link für den Marker.|
|layerId|ja|String|"123456789"|ID des WFS-Layers aus dem der Umring abgefragt wird.|
|attribute|ja|String|"bezirk_name"|Attributname. Entspricht dem Attribut nach dem der WFS gefiltert wird.|
|geometries|ja|String|["BEZIRK1", "BEZIRK2"]|Enthäkt die Gemometrien, die aus dem WFS gefiltert werden können.|

**Beispiel:**

```
#!json
zoomToGeometry: {
    layerId: "123456789",
    attribute: "bezirk_name",
    geometries: ["BEZIRK1", "BEZIRK2"]
}
```

***

## featureViaURL ##
|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|epsg|nein|Integer|4326|EPSG-Code für die Projektion der übergebenen Koordinaten der Feature.|
|**[layers](#markdown-header-featureviaurllayers)**|ja|Object[]||Array an Layerkonfigurationen für die übergebenen Feature.|
|zoomTo||String oder Array||Id des **[layers](#markdown-header-featureviaurllayers)** oder Array von möglichen Layern, zu welchen beim Start des Masterportals gezoomed werden soll. Beim Nichtangabe wird der normale Startpunkt der Karte verwendet.|

**Beispiel:**
```
featureViaURL: {
    epsg: 25832,
    zoomTo: "urlPointFeatures",
    layers: [
        {
            "id": "urlPointFeatures",
            "geometryType": "Point",
            "name": "URL Point Features",
            "styleId": "url_points"
        },
        {
            "id": "urlLineFeatures",
            "geometryType": "LineString",
            "name": "URL Line Features",
            "styleId": "url_lines"
        },
        {
            "id": "urlPolygonFeatures",
            "geometryType": "Polygon",
            "name": "URL Polygon Features",
            "styleId": "url_polygons"
        },
        {
            "id": "urlMultiPointFeatures",
            "geometryType": "MultiPoint",
            "name": "URL MultiPoint Features",
            "styleId": "url_mulitpoints"
        },
        {
            "id": "urlMultiLineStringFeatures",
            "geometryType": "MultiLineString",
            "name": "URL MultiLineString Features",
            "styleId": "url_multilinestring"
        },
        {
            "id": "urlMultiPolygonFeatures",
            "geometryType": "MultiPolygon",
            "name": "URL MultiPolygon Features",
            "styleId": "url_multipolygons"
        }
    ]
}
```

***

### featureViaURL.layers ###

Die beschriebenen Parameter sind für die eines einzelnen Layer-Objektes im **[layers](#markdown-header-featureviaurllayers)**-Array.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|id|ja|String||Eindeutige ID für den zu erstellenden Layer.|
|geometryType|ja|enum["LineString", "Point", "Polygon", "MultiPoint", "MultiLineString", "MultiPolygon"]||Geometrietyp der darzustellenden Feature.|
|name|ja|String||Name des Layers; wird im Themenbaum, der Legende und im GFI-Popup dargestellt.|
|styleId|nein|String||Eindeutige ID für den Style, welcher für die Feature verwendet werden soll. Die Styles stammen aus der **[style.json](style.json.de.md)**.|

**Beispiel:**
```
layers: [{
    id: "urlPolygonFeatures",
    geometryType: "Polygon",
    name: "URL Polygon Features",
    styleId: "url_polygons"
}]
```

***

>Zurück zur **[Dokumentation Übersetzungen im Masterportal](languages.de.md)**.

>Zurück zur **[Dokumentation Masterportal](doc.de.md)**
