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

### Portalconfig.controls ###

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|attributions|nein|[attributions](#markdown-header-portalconfigcontrolsattributions)|false|Zusätzliche Layerinformationen die im Portal angezeigt werden sollen|

### Portalconfig.controls.attributions

Das Attribut attributions kann vom Typ Boolean oder Object sein. Wenn es vom Typ Boolean ist, zeigt diese flag ob vorhandene Attributions angezeigt werden sollen oder nicht. Ist es vom Typ Object so gelten folgende Attribute:

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|isInitOpenDesktop|nein|Boolean|true|Legt fest, ob die Attributions (Desktop-Ansicht) initial ausgeklappt werden sollen.|
|isInitOpenMobile|nein|Boolean|false|Legt fest, ob die Attributions (Mobile-Ansicht) initial ausgeklappt werden sollen.|

