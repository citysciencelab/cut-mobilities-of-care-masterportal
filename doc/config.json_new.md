>Zurück zur [Dokumentation Masterportal](doc.md).

[TOC]

# config.json
Die *config.json* enthält die gesamte Konfiguration der Portal-Oberfläche. In ihr wird geregelt welche Elemente sich wo in der Menüleiste befinden, worauf die Karte zentriert werden soll und welche Layer geladen werden sollen. Hier geht es zu einem [Beispiel](https://bitbucket.org/lgv-g12/lgv/src/stable/portal/master/config.json).
Die config.json besteht aus der [Portalconfig](#markdown-header-Portalconfig) und der [Themenconfig](#markdown-header-Themenconfig)
```
{
   "Portalconfig": {},
   "Themenconfig": {}
}
```

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
|[controls](#markdown-header-Portalconfig.controls)|nein|Object||Mit den Controls kann festgelegt werden, welche Interaktionen in der Karte möglich sein sollen.|
|LogoLink|nein|String||@deprecated. Nicht mehr nutzen. Siehe [portalTitle](#markdown-header-Portalconfig.portalTitle).|
|LogoToolTip|nein|String||@deprecated. Nicht mehr nutzen. Siehe [portalTitle](#markdown-header-Portalconfig.portalTitle).|
|mapView|nein|[mapView](#markdown-header-Portalconfig.mapView)||Mit verschiedenen  Parametern wird die Startansicht konfiguriert und der Hintergrund festgelegt, der erscheint wenn keine Karte geladen ist.|
|menu|nein|[menu](#markdown-header-Portalconfig.menu)||Hier können die Menüeinträge und deren Anordnung konfiguriert werden. Die Reihenfolge der Werkzeuge ist identisch mit der Reihenfolge, in der config.json (siehe [Tools](#markdown-header-Portalconfig.menu.tools)).|
|PortalLogo|nein|String||@deprecated. Nicht mehr nutzen. Siehe [portalTitle](#markdown-header-Portalconfig.portalTitle).|
|PortalTitle|nein|String||@deprecated. Nicht mehr nutzen. Siehe [portalTitle](#markdown-header-Portalconfig.portalTitle).|
|portalTitle|nein|[portalTitle](#markdown-header-Portalconfig.portalTitle)||Der Titel und weitere Parameter die  in der Menüleiste angezeigt werden können.|
|scaleLine|nein|Boolean||Ist die Maßstabsleiste = true , dann wird sie unten rechts dargestellt, sofern kein footer vorhanden ist! Ist ein footer vorhanden, wird die Maßstabsleiste unten links angezeigt.|
|searchbar|nein|[searchBar](#markdown-header-Portalconfig.searchbar)||Über die Suchleiste können verschiedene Suchen gleichzeitig angefragt werden.|
|simpleLister|nein|[simpleLister](#markdown-header-Portalconfig.simpleLister)||Der SimpleLister zeigt alle Features eines im Kartenausschnitt ausgewählten vektor Layers an.|
|mapMarkerModul|nein|[mapMarkerModul](#markdown-header-Portalconfig.mapMarkerModul)||Gibt an, ob der auf der Karte verwendete Marker-Pin verschiebbar sein soll, oder nicht.|

### Portalconfig.controls ###

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|[attributions](#markdown-header-portalconfigcontrolsattributions)|nein|Boolean/Object|false|Boolean: Zeigt vorhandene Attributions an. Object: Zeigt vorhandene Attributions mit folgenden Eigenschaften an, siehe [Object](#markdown-header-portalconfigcontrolsattributions)|
|fullScreen|nein|Boolean|false|Ermöglicht dem User die Darstellung im Vollbildmodus (ohne Tabs und Adressleiste) per Klick auf den Button. Ein erneuter Klick auf den Button wechselt wieder in den normalen Modus.|
|mousePosition|nein|Boolean|false|Die Koordination des Mauszeigers werden angeziegt.|
|[orientation](#markdown-header-portalconfigcontrolsorientation)|nein|Object||Orientation nutzt die geolocation des Browsers zur Standortbestimmung des Nutzers. Weitere Parameter,  siehe[orientation](#markdown-header-portalconfigcontrolsorientation).|
|zoom|nein|Boolean|false|Legt fest, ob die Zoombuttons angezeigt werden sollen.|
|[overviewmap](#markdown-header-portalconfigcontrolsoverviewmap)|nein|Boolean/Object|false|Boolean: Zeigt die Overviewmap unten rechts an. Object: Passt die Overviewmap um die angegebenen Attribute an, siehe [Object](#markdown-header-portalconfigcontrolsaoverviewmap)|
|[totalview](#markdown-header-portalconfigcontrolstotalview)|nein|Boolean|false|Zeigt einen Button an, mit dem die Startansicht wiederhergestellt wird.|
|button3d|nein|Boolean|false|Legt fest, ob ein Button für die Umschaltung nach 3D angezeigt werden soll. |
|orientation3d|nein|Boolean|false|Legt fest, ob ein im 3D Modus eine Navigationsrose anzeiget werden soll. |
|freeze|nein|Boolean|false|Legt fest, ob ein "Ansicht sperren" Button angezeigt werden soll. Im Style 'TABLE' erscheint dieser im Werkzeug-Fenster.|
