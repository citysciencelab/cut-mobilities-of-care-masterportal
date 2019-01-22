>Zurück zur [Dokumentation Masterportal](doc.md).

[TOC]

***

# config.json
Die *config.json* enthält die gesamte Konfiguration der Portal-Oberfläche. In ihr wird geregelt welche Elemente sich wo in der Menüleiste befinden, worauf die Karte zentriert werden soll und welche Layer geladen werden sollen. Hier geht es zu einem [Beispiel](https://bitbucket.org/lgv-g12/lgv/src/stable/portal/master/config.json).
Die config.json besteht aus der [Portalconfig](#markdown-header-Portalconfig) und der [Themenconfig](#markdown-header-Themenconfig)
```
{
   "Portalconfig": {},
   "Themenconfig": {}
}
```

***

## Portalconfig
In der *Portalconfig* kann die Oberfläche des Portals konfiguriert werden:
1.  der Titel mit Logo, falls erforderlich
2.  welche/r Suchdienst/e angesprochen werden soll/en
3.  welche Themenbaumart genutzt werden soll (einfach/light oder mit Unterordnern/custom)
4.  welche Werkzeuge an welcher Stelle geladen werden sollen
5.  welche Interaktionen mit der Karte möglich sein sollen (zoomen, Menüzeile ein/ausblenden, Standortbestimmung des Nutzers, Vollbildmodus, etc.)
6.  welche Layer genutzt werden und ggf. in welchen Ordnern, sie in der Themenauswahl erscheinen sollen.

Es existieren die im Folgenden aufgelisteten Konfigurationen:

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|Baumtyp|ja|enum["light", "default", "custom"]||Legt fest, welche Themenbaumart genutzt werden soll. Es existieren die Möglichkeiten *light* (einfache Auflistung), *default* (FHH-Atlas), *custom* (benutzerdefinierte Layerliste anhand json).|
|controls|nein|[controls](#markdown-header-portalconfigcontrols)||Mit den Controls kann festgelegt werden, welche Interaktionen in der Karte möglich sein sollen.|
|LogoLink|nein|String||@deprecated. Nicht mehr nutzen. Siehe [portalTitle](#markdown-header-portalconfigportalitle).|
|LogoToolTip|nein|String||@deprecated. Nicht mehr nutzen. Siehe [portalTitle](#markdown-header-portalconfigportalitle).|
|mapView|nein|[mapView](#markdown-header-portalconfigmapview)||Mit verschiedenen  Parametern wird die Startansicht konfiguriert und der Hintergrund festgelegt, der erscheint wenn keine Karte geladen ist.|
|menu|nein|[menu](#markdown-header-portalconfigmenu)||Hier können die Menüeinträge und deren Anordnung konfiguriert werden. Die Reihenfolge der Werkzeuge ist identisch mit der Reihenfolge, in der config.json (siehe [Tools](#markdown-header-portalconfigmenutools)).|
|PortalLogo|nein|String||@deprecated. Nicht mehr nutzen. Siehe [portalTitle](#markdown-header-portalconfigportaltitle).|
|PortalTitle|nein|String||@deprecated. Nicht mehr nutzen. Siehe [portalTitle](#markdown-header-portalconfigportaltitle).|
|portalTitle|nein|[portalTitle](#markdown-header-portalconfigportaltitle)||Der Titel und weitere Parameter die  in der Menüleiste angezeigt werden können.|
|scaleLine|nein|Boolean||Ist die Maßstabsleiste = true , dann wird sie unten rechts dargestellt, sofern kein footer vorhanden ist! Ist ein footer vorhanden, wird die Maßstabsleiste unten links angezeigt.|
|searchbar|nein|[searchBar](#markdown-header-portalconfigsearchbar)||Über die Suchleiste können verschiedene Suchen gleichzeitig angefragt werden.|
|simpleLister|nein|[simpleLister](#markdown-header-portalconfigsimplelister)||Der SimpleLister zeigt alle Features eines im Kartenausschnitt ausgewählten vektor Layers an.|
|mapMarkerModul|nein|[mapMarkerModul](#markdown-header-portalconfig.mapmarkermodul)||Gibt an, ob der auf der Karte verwendete Marker-Pin verschiebbar sein soll, oder nicht.|

***

### Portalconfig.controls ###

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|attributions|nein|[attributions](#markdown-header-portalconfigcontrolsattributions)|false|Zusätzliche Layerinformationen die im Portal angezeigt werden sollen|
|fullScreen|nein|Boolean|false|Ermöglicht dem User die Darstellung im Vollbildmodus (ohne Tabs und Adressleiste) per Klick auf den Button. Ein erneuter Klick auf den Button wechselt wieder in den normalen Modus.|
|mousePosition|nein|Boolean|false|Die Koordinaten des Mauszeigers werden angeziegt.|
|orientation|nein|[orientation](#markdown-header-portalconfigcontrolsorientation)||Orientation nutzt die geolocation des Browsers zur Standortbestimmung des Nutzers.|
|zoom|nein|Boolean|false|Legt fest, ob die Zoombuttons angezeigt werden sollen.|
|overviewmap|nein|[overviewmap](#markdown-header-portalconfigcontrolsoverviewmap)|false|Übersichtskarte|
|totalview|nein|Boolean|false|Zeigt einen Button an, mit dem die Startansicht mit den initialen Einstellungen wiederhergestellt werden kann.|
|button3d|nein|Boolean|false|Legt fest, ob ein Button für die Umschaltung in den 3D Modus angezeigt werden soll.|
|orientation3d|nein|Boolean|false|Legt fest, ob im 3D Modus eine Navigationsrose angezeigt werden soll.|
|freeze|nein|Boolean|false|Legt fest, ob ein "Ansicht sperren" Button angezeigt werden soll. Im Style 'TABLE' erscheint dieser im Werkzeug-Fenster.|

***

### Portalconfig.controls.attributions

Das Attribut attributions kann vom Typ Boolean oder Object sein. Wenn es vom Typ Boolean ist, zeigt diese flag ob vorhandene Attributions angezeigt werden sollen oder nicht. Ist es vom Typ Object so gelten folgende Attribute:

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|isInitOpenDesktop|nein|Boolean|true|Legt fest, ob die Attributions (Desktop-Ansicht) initial ausgeklappt werden sollen.|
|isInitOpenMobile|nein|Boolean|false|Legt fest, ob die Attributions (Mobile-Ansicht) initial ausgeklappt werden sollen.|

**Beispiel als Boolean**
```
#!json
"attributions": true
```

**Beispiel als Object**
```
#!json
"attributions": {
    "isInitOpenDesktop": true,
    "isInitOpenMobile": false,
}
```

***

### Portalconfig.controls.orientation ###

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|zoomMode|nein|enum["none", "once", "always"]|"once"|*none* (Die Standortbestimmung ist deaktiviert.), *once* (Es wird einmalig beim Laden der Standort bestimmt und einmalig auf den Standort gezoomt.), *always* (Die Karte bleibt immer auf den Nutzerstandort gezoomt.)|
|poiDistances|nein|Boolean/Integer[]||Bei poiDistances=true werden die Defaultwerte  verwendet. Legt fest, ob "In meiner Nähe" geladen wird und zeigt eine Liste von Features in der Umgebung an. Bei Angabe eines Array werden die darin definierten Abstände in Metern angeboten. Bei Angabe von true werden diese Abstände angeboten: [500,1000,2000].|

**Beispiel mit poiDistances vom Typ Boolean**
```
#!json
"orientation": {
    "zoomMode": "once",
    "poiDistances": true
}
```

**Beispiel mit poiDistances vom Typ Integer[]**
```
#!json
"orientation": {
    "zoomMode": "once",
    "poiDistances": [500, 1000, 2000, 5000]
}
```

***

### Portalconfig.controls.overviewmap ###

Das Attribut overviewmap kann vom Typ Boolean oder Object sein. Wenn es vom Typ Boolean, zeigt es die Overviewmap mit den Defaulteinsellungen an. Ist es vom Typ Object, so gelten folgende Attribute

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|resolution|nein|Integer||Legt die Resolution fest, die in der Overviewmap verwendet werden soll.|
|baselayer|nein|String||Über den Parameter baselayer kann ein anderer Layer für die Overviewmap verwendet werden. Hier muss eine Id aus der services.json angegeben werden die in der config.js des Portals, im Parameter layerConf steht.|

**Beispiel overviewmap als Object:**
```
#!json
"overviewmap": {
    "resolution": 305.7487246381551,
    "baselayer": "452"
}
```

**Beispiel overviewmap als Boolean:**
```
#!json
"overviewmap": true
```

***

### Portalconfig.portalTitle ###
In der Menüleiste kann der Portalname und ein Bild angezeigt werden, sofern die Breite der Leiste ausreicht. Der Portaltitle ist mobil nicht verfügbar.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|title|nein|String|Master|Name des Portals.|
|logo|nein|String||URL zur externen Bilddatei. Wird kein logo gesetzt, so wird nur der Titel ohne Bild dargestellt.|
|link|nein|String|http://geoinfo.hamburg.de|URL der externen Seite, auf die verlinkt wird.|
|tooltip|nein|String|Landesbetrieb Geoinformation und Vermessung|Tooltip beim Hovern über dem Portaltitel angezeigt wird.|

**Beispiel portalTitle:**
```
#!json
"portalTitle": {
    "title": "Master",
    "logo": "../../img/hh-logo.png",
    "link": "http://geoinfo.hamburg.de",
    "toolTip": "Landesbetrieb Geoinformation und Vermessung"
}
```

***

### Portalconfig.mapView ###

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|backgroundImage|nein|String||Pfad zum alternativen Hintergrund angeben.|
|startCenter|nein|Integer[]|[565874, 5934140]|Die initiale Zentrumskoordinate.|
|options|nein|[option](#markdown-header-portalconfigmapviewoption)[]|[{resolution:66.14579761460263,scale:250000,zoomLevel:0}, {resolution:26.458319045841044,scale:100000,zoomLevel:1}, {resolution:15.874991427504629,scale:60000,zoomLevel:2}, {resolution: 10.583327618336419,scale:40000,zoomLevel:3}, {resolution:5.2916638091682096,scale:20000,zoomLevel:4}, {resolution:2.6458319045841048,scale:10000,zoomLevel:5}, {resolution:1.3229159522920524,scale:5000,zoomLevel:6}, {resolution:0.6614579761460262,scale:2500,zoomLevel:7}, {resolution:0.2645831904584105,scale: 1000,zoomLevel:8}, {resolution:0.13229159522920521,scale:500,zoomLevel:9}]|Die initialen Maßstabsstufen und deren Auflösungen.|
|extent|nein|Number[]|[510000.0, 5850000.0, 625000.4, 6000000.0]|Der Map-Extent.|
|resolution|nein|Float|15.874991427504629|Die initiale Auflösung der Karte aus options. Vorzug vor zoomLevel.|
|zoomLevel|nein|Integer||Der initiale ZoomLevel aus Options. Nachrangig zu resolution.|
|epsg|nein|String|"EPSG:25832"|Der EPSG-Code der Projektion der Karte. Der EPSG-Code muss als namedProjection definiert sein.|

**Beispiel:**
```
#!json
"mapView": {
    "backgroundImage": "/lgv-config/img/backgroundCanvas.jpeg",
    "startCenter": [561210, 5932600],
    "options": [
        {
            "resolution": 611.4974492763076,
            "scale": 2311167,
            "zoomLevel": 0
        },
        {
            "resolution": 305.7487246381551,
            "scale": 1155583,
            "zoomLevel": 1
        },
        {
            "resolution": 152.87436231907702,
            "scale": 577791,
            "zoomLevel": 2
        },
        {
            "resolution": 76.43718115953851,
            "scale": 288896,
            "zoomLevel": 3
        },
        {
            "resolution": 38.21859057976939,
            "scale": 144448,
            "zoomLevel": 4
        },
        {
            "resolution": 19.109295289884642,
            "scale": 72223,
            "zoomLevel": 5
        },
        {
            "resolution": 9.554647644942321,
            "scale": 36112,
            "zoomLevel": 6
        },
        {
            "resolution": 4.7773238224711605,
            "scale": 18056,
            "zoomLevel": 7
        },
        {
            "resolution": 2.3886619112355802,
            "scale": 9028,
            "zoomLevel": 8
        },
        {
            "resolution": 1.1943309556178034,
            "scale": 4514,
            "zoomLevel": 9
        },
        {
            "resolution": 0.5971654778089017,
            "scale": 2257,
            "zoomLevel": 10
        }
    ],
    "extent": [510000.0, 5850000.0, 625000.4, 6000000.0],
    "resolution": 15.874991427504629,
    "zoomLevel": 1,
    "epsg": "EPSG:25832"
    }
```

***

### Portalconfig.mapView.option ###

Eine option definiert eine Zoomstufe. Diese muss defineirt werden über die Auflösung, die Maßstabszahl und das ZoomLevel. Je höher das zoomLevel ist, desto kleiner ist die scale. und desto näher hat man gezoomt.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|resolution|ja|Number||Auflösung der definierten Zoomstufe.|
|scale|ja|Integer||Maßstabszahl der definierten Zoomstufe.|
|zoomLevel|ja|Integer||Zoomstufe der definierten Zoomstufe.|
```
#!json
{
    "resolution": 611.4974492763076,
    "scale": 2311167,
    "zoomLevel": 0
}
```

***

### Portalconfig.menu ###
Hier können die Menüeinträge und deren Anordnung konfiguriert werden. Die Reihenfolge der Werkzeuge ergibt sich aus der Reihenfolge in der *Config.json*.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|info|nein|[folder](#markdown-header-portalconfigmenufolder)||Ordner im Menü, das [tool](#markdown-header-portalconfigmenutool) oder [staticlinks](#markdown-header-portalconfigmenustaticlinks) darstellt.|


***

### Portalconfig.menu.folder ###
Ein Ordner-Object wird dadurch definiert, dass es neben "name" und "glyphicon" noch das attribut "children" besitzt.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|name|ja|String||Name des Ordners im Menu.|
|glyphicon|ja|String|"glyphicon-folder-open"|CSS Klasse des Glyphicons, das vor dem Ordnernamen im Menu angezeigt wird.|
|children|nein|[tool](#markdown-header-portalconfigmenutoolstool)/[staticlinks](#markdown-header-portalconfigmenustaticlinks)||CSS Klasse des Glyphicons, das vor dem Ordnernamen im Menu angezeigt wird.|

***

### Portalconfig.menu.tools ###
Liste aller konfigurierbaren Werkzeuge. Jedes Werkzeug erbt von [tool](#markdown-header-portalconfigmenutoolstool) und kann/muss somit auch die dort angegebenen attribute konfiguiert bekommen.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|einwohnerabfrage|nein|[tool](#markdown-header-portalconfigmenutoolstool)||Hamburg spezifisches Werkzeug um die Einwohner in der FHH (Freie und Hansestadt Hamburg) und der MRH (Metropol Region Hamburg) über eine zu zeichnende Geometrie abfragen zu können.|
|compareFeatures|nein|[compareFeatures](#markdown-header-portalconfigmenutoolstoolcomparefeatures)|| Vergleichsmöglichkeit von Vector-Features.|
|parcelSearch|nein|[parcelSearch](#markdown-header-portalconfigmenutoolstoolparcelsearch)||Flurstückssuche.|
|measure|nein|[tool](#markdown-header-portalconfigmenutoolstool)||Messwerkzeug um Flächen oder Strecken zu messen. Dabei kann zwischen den Einheiten m/km bzw m²/km² gewechselt werden.|
|coord|nein|[tool](#markdown-header-portalconfigmenutoolstool)||Werkzeug um Koordinaten per Maus(-Klick) abzufragen. Per Click in dei Karte werden die Koordinaten in der Anzeige eingefroren und können per Click auf die Anzeige direkt in die Zwischenablage kopiert werden.|
|gfi|nein|[tool](#markdown-header-portalconfigmenutoolstool)||GetFeatureInfo(gfi). Werkzeug um Informationen abzufragen. Dabei wird entweder ein WMS-Request gestellt oder die Vectordaten im Browser abgefragt. Anschließend werden die Attribute der gefundenen Features dargestellt.|
|print|nein|[print](#markdown-header-portalconfigmenutoolstoolprint)||Druckmodul mit dem die Karte als PDF exportiert werden kann.|
|searchByCoord|nein|[tool](#markdown-header-portalconfigmenutoolstool)||Koordinatensuche. Über eine Eingabemaske können das Koordinatensystem und die Koordinaten eingegeben werden. Das Werkzeug zoomt dann auf die entsprechende Koordinate und setzt einen Marker darauf.|
|kmlimport|nein|[tool](#markdown-header-portalconfigmenutoolstool)||Import von KML Dateien. Über dieses Werkzeug können KML Dateien importiert werden.|
|wfsFeatureFilter|nein|[tool](#markdown-header-portalconfigmenutoolstool)||Filtern von WFS Features. Über dieses Werkzeug können WFS features gefiltert werden. Dies setzt jedoch eine Konfiguration der "filterOptions" am WFS-Layer-Objekt vorraus.|
|extendedFilter|nein|[tool](#markdown-header-portalconfigmenutoolstool)||Dynamisches Filtern von WFS Features. Über dieses Werkzeug können WFS features dynamisch gefiltert werden. Dies setzt jedoch eine Konfiguration der "extendedFilter" am WFS-Layer-Objekt vorraus.|
|routing|nein|[routing](#markdown-header-portalconfigmenutoolstoolrouting)||Routing. Über dieses Werkzeug können Routen berechnet werden.|
|draw|nein|[tool](#markdown-header-portalconfigmenutoolstool)||Zeichnen. Mithilfe dieses Werkzeuges können Punkte, Linien, Polygone, Kreise und Texte gezeichnet werden. Farben und Transparenzen sind voreingestellt. Das Gezeichnete kann auch als KML exportiert werden.|
|styleWMS|nein|[tool](#markdown-header-portalconfigmenutoolstool)||Klassifizierung vom WMS Diensten. Dieses Tool findet Verwendung im Pendlerportal der MRH(Metropolregion Hamburg). Über eine Maske können Klassifizierungen definiert werden. An den GetMap-Requuest wird nun ein SLD-Body angehängt, der dem Server einen neuen Style zum Rendern definiert. Der WMS-Dienst liefert nun die Daten in den definierten Klassifizierungen und Farben.|
|featureLister|nein|[featureLister](#markdown-header-portalconfigmenutoolstoolfeaturelister)||Listet alle Features eines Vektor Layers auf.|
|lines|nein|[lines](#markdown-header-portalconfigmenutoolstoollines)||Pendlerdarstellung als linenhafte Objekte.|
|animation|nein|[animation](#markdown-header-portalconfigmenutoolstoolanimation)||Pendleranimation als punkthafte Objekte.|
|saveSelection|nein|[tool](#markdown-header-portalconfigmenutoolstool)||Werkzeug zum Zustand Speichern. Mithilfe dieses Werkzeuges kann der Kartenzustand als URL zum Abspeichern erzeugt werden. Dabei werden die Layer in deren Reihenfolge, Transparenz und Sichtbarkeit dargestellt. Zusätzlich wird auch noch die Zentrumskoordinate mit abgespeichert.|
|layerslider|nein|[layerslider](#markdown-header-portalconfigmenutoolstoollayerslider)||Werkzeug zum Abspielen einer Reihendfolge von Layers.|
|legend|nein|[tool](#markdown-header-portalconfigmenutoolstool)||Legende. Stellt die Legende aller sichtbaren Layer dar.|
|contact|nein|[contact](#markdown-header-portalconfigmenutoolstoolcontact)||Kontaktformular. Stellt dem User eine Möglichkeit zur Verfügung, mit dem einem Konfigurierten Postfach in Verbindung zu treten um Fehler zu melden oder Wünsche und Anregungen zu äußern.|

***

### Portalconfig.menu.tools.tool ###
Über den Attribut-key des Werkzeuges wird definiert, welches Werkzeug mit welchen Eigenschaften geladen wird. Jedes Tool besitzt mindestens die unten aufgeführten Attribute. Welche Tools konfigurierbar sind, finden Sie unter [tools](#markdown-header-portalconfigmenutools).

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|name|ja|String||Name des Werkzeuges im Menu.|
|glyphicon|nein|String||CSS Klasse des Glyphicons, das vor dem Toolnamen im Menu angezeigt wird.|
|onlyDesktop|nein|Boolean|false|Flag ob das Werkzeug nur im Desktop Modus sichtbar sein soll.|

***

### Portalconfig.menu.tools.tool.compareFeatures ###
foobar.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|numberOfFeaturesToShow|nein|Integer|3|Anzahl der Features die maximal miteinander vergleichen werden können.|
|numberOfAttributesToShow|nein|Integer|12|Anzahl der Attribute die angezeigt wird. Gibt es mehr Attribute können diese über einen Button zusätzlich ein-/ bzw. ausgeblendet werden.|

***

### Portalconfig.menu.tools.tool.parcelSearch ###
Flurstückssuche. Je nach konfiguration werden spezielle Stored Queries eines WFS abgefragt.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|serviceId|ja|String||Id des Dienstes der abgefragt werden soll. Wird in der rest-services.json abgelegt.|
|storedQueryId|ja|String||Id der stored query die verwendet werden soll.|
|configJSON|ja|String||Pfad zur Konfigurationsdatei, die die Gemarkungen enthält.|
|parcelDenominator|nein|Boolean|false|Flag ob Flurnummern auch zur Suche verwendet werden sollen. Besonderheit Hamburg: Hamburg besitzt als Stadtstaat keine Fluren.|

***

### Portalconfig.menu.tools.tool.print ###
Druckmodul. Liegt zur Zeit noch in 2 varianten vor. Entweder der alte Druckdienst über MapfishPrint 2 oder der moderne Druckdienst, der MapfishPrint 3 verwendet.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|mapfishServiceId|ja|String||Id des Druckdienstes der verwendet werden soll. Wird in der rest-services.json abgelegt.|
|printAppId|nein|String|"master"|Id der print app des Druckdienstes. Dies gibt dem Druckdienst vor welche/s Template/s er zu verwenden hat|
|filename|nein|String|"report"|Dateiname des Druckergebnisses|
|title|nein|String|"PrintResult"|Titel des Dokuments. Erscheint als Kopfzeile.|
|version|nein|String||@deprecated in 3.0.0. Flag ob das alte oder neue Druckmodul verwendet werden soll. Bei "mapfsih_print_3" wird das neue modul verwendet, sonst das alte.|
|printID|nein|String|"9999"|@deprecated in 3.0.0. Id des Druckdienstes der verwendet werden soll. Wird in der rest-services.json abgelegt.|
|outputFilename|nein|String|"report"|@deprecated in 3.0.0. Dateiname des Druckergebnisses.|
|gfi|nein|Boolean|false|@deprecated in 3.0.0. Dateiname des Druckergebnisses.|
|configYAML|nein|String|"/master"|@deprecated in 3.0.0. Configuration des Templates das verwendet werden soll.|

***

### Portalconfig.menu.tools.tool.routing ###
Routing Modul. Das Routing findet auf externen Daten statt und ist nur wenigen Portalen vorenthalten, u.a. das [Verkehrsportal](https://geoportal-hamburg.de/verkehrsportal).

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|viomRoutingID|ja|String||Id des Routingdienstes der verwendet werden soll. Wird in der rest-services.json abgelegt.|
|bkgSuggestID|ja|String||Id des Vorschlagsdienstes des BKG. Er wird verwendet um Addressvorschläge zu liefern. Wird in der rest-services.json abgelegt.|
|bkgGeosearchID|ja|String||Id des Geokodierungsdienstes des BKG. Er wird verwendet um gewählte Addressen in Koordinaten umzuwandeln. Wird in der rest-services.json abgelegt.|

***

### Portalconfig.menu.tools.tool.featureLister ###
Modul, das Vektor Features darstellt. Durch hovern über ein feature in der Liste wird auf der Karte der Marker gesetzt.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|maxFeatures|nein|Integer|20|Anzahl der zu zeigenden Features. Über einen Button können weitere features in dieser Anzahl zugeladen werden.|

***

### Portalconfig.menu.tools.tool.lines ###
Die Linienhafte Darstellung der Pendler wird für das Pendlerportal der MRh(Metropolregion Hamburg) verwendet. Dieses Tool erweitert den [pendlerCore](#markdown-header-portalconfigmenutoolstoolpendlercore)

***

### Portalconfig.menu.tools.tool.animation ###
Die Pendleranimation wird für das Pendlerportal der MRh(Metropolregion Hamburg) verwendet. Dieses Tool erweitert den [pendlerCore](#markdown-header-portalconfigmenutoolstoolpendlercore)

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|steps|nein|Integer|50|Anzahl der Schritte, die in der Animation durchgeführt werden sollen.|
|minPx|nein|Integer|5|Minimalgröße der Kreisdarstellung der Pendler.|
|maxPx|nein|Integer|20|Maximalgröße der Kreisdarstellung der Pendler.|
|colors|nein|String[]|[]|Anzahl der Farben im RGBA-Muster ("rgba(255,0,0,1)").|

***

### Portalconfig.menu.tools.tool.pendlerCore ###
Der PendlerCore ist die Kernkomponente der Werkzeuge "Lines" und "Animation"

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|zoomLevel|nein|Integer|1|Zoomstufe auf die gezoomt wird bei Auswahl einer Gemeinde.|
|url|nein|String|"http://geodienste.hamburg.de/MRH_WFS_Pendlerverflechtung"|Url des WFS Dienstes der abgefragt werden soll.|
|params|nein|Object||Parameter mit denen der Dienst abgefragt werden soll.|
|params.REQUEST|nein|String|"GetFeature"|Art des Requests.|
|params.SERVICE|nein|String|"WFS"|Typ des Dienstes.|
|params.TYPENAME|nein|String|"app:mrh_kreise"|Typename des Layers.|
|params.VERSION|nein|String|"1.1.0"|Version des WFS.|
|params.maxFeatures|nein|String|"10000"|Maximale Anzahl an Features die geholt werden sollen.|
|featureType|nein|String|"mrh_einpendler_gemeinde"|FeatureType (Layer) des WFS Dienstes.|
|attrAnzahl|nein|String|"anzahl_einpendler"|Attributname das die Anzahl der Pendler pro Gemeinde enthält.|
|attrGemeinde|nein|String|"wohnort"|Attributname das die Gemeinde enthält.|

***

### Portalconfig.menu.tools.tool.contact ###
Werkzeug, wodurch der Nutzer mit einem definierten Postfach Kontakt aufnehmen kann.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|from|nein|[email](#markdown-header-portalconfigmenutoolstoolcontactemail)[]|[{
            "email": "lgvgeoportal-hilfe@gv.hamburg.de",
            "name": "LGVGeoportalHilfe"
        }]|Absender der Email.|
|to|nein|[email](#markdown-header-portalconfigmenutoolstoolcontactemail)[]|[{
            "email": "lgvgeoportal-hilfe@gv.hamburg.de",
            "name": "LGVGeoportalHilfe"
        }]|Addressat der Email.|
|cc|nein|[email](#markdown-header-portalconfigmenutoolstoolcontactemail)[]|[]|CC der Email.|
|bcc|nein|[email](#markdown-header-portalconfigmenutoolstoolcontactemail)[]|[]|BCC der Email.|
|ccToUser|nein|Boolean|false|Flag ob der Absender auch als CC eingetragen werden soll.|
|textPlaceholder|nein|String|"Bitte formulieren Sie hier Ihre Frage und drücken Sie auf &quot;Abschicken&quot;"|Platzhaltertext im Freitextfeld.|
|includeSystemInfo|nein|Boolean|false|Flag ob systeminfos des Absendern mitgeschickt werden sollen.|

***

### Portalconfig.menu.tools.tool.contact.email ###
Email Objekt bestehend aus der email und aus dem Anzeigename.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|email|nein|String||Email.|
|name|nein|String||Anzeigename.|

***

### Portalconfig.menu.tools.tool.layerslider ###
Der Layerslider ist ein Werkzeug um verschiedene Layer in der Anwendung hintereinander an bzw auszuschalten. Dadurch kann z.B. eine Zeitreihe verschiedener Zustände animiert werden.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|title|ja|String||Titel der im Werkzeug vorkommt.|
|timeInterval|nein|Integer|2000|Zeitintervall in ms bis der nächste Layer angeschaltet wird.|
|layerIds|ja|layerId[]||Array von Objekten aus denen die Layerinformationen herangezogen werden.|
|layerId|ja|Object||Objekt, das einen layer definiert.|
|layerId.title|ja|String||Name des Diestes, wie er im Portal angezeigt werden soll.|
|layerId.layerId|ja|String||Id des Diestes, der im Portal angezeigt werden soll. ACHTUNG: Diese LayerId muss auch in der Themenconfig konfiguriert sein!|

***

### Portalconfig.menu.staticlinks ###
Das Array staticlinks beinhaltet Objekte die entweder als link zu einer anderen Webressource dienen oder als Trigger eines zu definierenden Events. Ein Staticlink-Objekt enthält folgende attribute.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|name|ja|String||Name des staticLink-Objekts im Menu.|
|glyphicon|nein|String|"glyphicon-globe"|CSS Klasse des Glyphicons, das vor dem staticLink-Objekt im Menu angezeigt wird.|
|url|nein|String||Url welche in einem neuen Tab angezeigt werden soll.|
|onClickTrigger|nein|[onClickTrigger](#markdown-header-portalconfigmenustaticlinksonclicktrigger)[]||Array von OnClickTrigger events.|

**Beispiel**
```
#!json
"staticlinks": [
    {
        "name": "Hamburg",
        "glyphicon": "glyphicon-globe",
        "url": "http://www.hamburg.de"
    },
    {
        "name": "Alert",
        "glyphicon": "glyphicon-globe",
        "onClickTrigger": [
            {
                "channel": "Alert",
                "event": "alert",
                "data": "Hello World!"
            }
        ]
    }
]
```

***

### Portalconfig.menu.staticlinks.onclicktrigger ###
Das Array staticlinks beinhaltet Objekte die entweder als link zu einer anderen Webressource dienen oder als Trigger eines zu definierenden Events. Ein Staticlink-Objekt enthält folgende attribute.

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|channel|ja|String||Name des Radio channels.|
|event|ja|String||Event des Radio channels das getriggered werden soll.|
|data|nein|String/Boolean/Number||Daten die mit geschickt werden sollen.|

**Beispiel**
```
#!json
{
    "channel": "Alert",
    "event": "alert",
    "data": "Hello World!" 
}
```

***

