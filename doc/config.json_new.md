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
