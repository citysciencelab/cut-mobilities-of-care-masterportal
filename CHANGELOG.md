# Changelog LGV Master-Portal 2.1.3

NEU:

  (none)

FIXES:

  - 48b55e8f8 Fehler wurden behoben, durch die keine Schulen im Schulwegrouting zu einer gefundenen Adresse in den Browsern Internet Explorer und Edge angezeigt wurden
  - 62e9c8da0 Schulen mit dem gleichen Namen im Schulwegrouting können nun durch die Anzeige der Adresse unterschieden werden
  - 8dd4f82b5 Ein Fehler in der Nomatim-Suche (OSM), durch den einige Suchergebnisse nicht angezeigt worden sind, wurde behoben

# Changelog LGV Master-Portal 2.1.2

NEU:

  (none)

FIXES:

  - 688f637b Es wurde ein Problem im Schulwegrouting behoben, welches den Aufruf einiger Adressen verhinderte. Das GFI wird beim wechseln der Schule oder Adresse im Schulwegrouting nun automatisch geschlossen.

# Changelog LGV Master-Portal 2.1.1

FIXES:

  - a2bce8dc metaidtomerge nicht alle objekte wurden gruppiert
  - 3ec4b257 parcelSearch view getter entfernt, wms crossOrigiin entfernt, wfsfeaturefilter feature übergeben bei defaultStyle und marker und zoomlevel bei suche nach Schulstandorten

# Changelog LGV Master-Portal 2.1.0

NEU:

  - b5e4ece5 new layertype sensorLayer for sensorThings-API
  - 966711f0 groupLayer rawlayerlist
  - 4e53968d osm search by grid
  - 11bc78fa table-ui and freezecontrol
  - f4822098 control visibility of the "SelectAll"-checkbox within leaf-folders
  - 45dca5d1 merge confilcts and unittest for parseRoute
  - 5b526f6d Transparency To Table LayerMenu
  - fb807917 style-param-test
  - 16abe7d7 measure Tool
  - 1587ce39 table-gfi-design
  - b38afd98 tablenav tools menu
  - cc21bf2a Werkzeug-Button für table - Menü
  - 9d090108 menutemplate for table
  - 595af610 parameter for table ui

FIXES:

  - f1147895 Videostreaming mobil wurde nicht mit HLS sondern Flash gestreamt
  - 714df6f7 bkg query neuenfelder straße
  - 77bee217 mapMarker view Fehler bei Layer sichtbar schalten über searchbar
  - e1d8d303 table theme height zu schmal bei vielen Einträgen
  - c985d399 initiale Suche nach Straße + Hausnummer über query Parameter schlug fehl
  - 0e4851cf im IE wird beim schalten in den fullScreen-Mode ein weißer Rand angezeigt
  - 5b2c7718 sinnvolle default Koordinatensysteme für Hamburg
  - 0c14730a Dipas 99 bug query
  - 6f8defe3 update merge dev, merge conflicts
  - 4e82ca43 mapSize mit Menu falsch berechnet was zu falscher Koordinatenangabe führte
  - b292e9bb mapheight on resize
  - 25fd5fdf UrlParams funktionieren nicht mehr
  - 0fdfd56b Flurstückssuche löscht default Flurstücksnenner beim Wechsel der Gemarkung bei parcelDenominator = true
  - 63fbbbd4 Flash-Videostream im Chrome konnnte nicht abgespielt werden
  - dd8e5d30 contact tests wenn keine portalconfig geladen wird
  - 2f9102eb betrieb contact configjson new portaltitleObject
  - 8db97eed filter dropdown css overflow-y hinzugefügt

# Changelog LGV Master-Portal 2.0.4

NEU:

  (none)

FIXES:

  - c128bf6f template layerinformation legendurl
  - a6d8b6e5 bootstrap-select Version auf 1.12 beschränken, weil 1.13 noch buggy

# Changelog LGV Master-Portal 2.0.3

NEU:

  (none)

FIXES:

  - 817a2f0 bkg search triggers searchbar to render recommended list
  - 69342d6 Flurstückssuche löscht default Flurstücksnenner beim Wechsel der Gemarkung bei parcelDenominator = true

# Changelog LGV Master-Portal 2.0.2

NEU:

  (none)

FIXES:

  - 8ddf9ebd contact tests wenn keine portalconfig geladen wird
  - f774a5c1 contact an neues object in config.json angepasst
  - 85083af4 filter dropdown css overflow-y hinzugefügt

# Changelog LGV Master-Portal 2.0.1

FIXES:

  - b8bae19dd Theme Radverkehrsstellen falsche Sortierung bei Wochenansicht
  - d7ff9768d Theme Radverkehrsstellen falsche Sortierung bei Tagesansicht

# Changelog LGV Master-Portal 2.0.0

NEU:

  - f4f34f02e Totalview Button (switch auf default-Ansicht)
  - 63679a50a fehlende dokus ergänzt
  - dd56e0885 multipoint Layer
  - a338b9339 GFI-Theme für radverkehr mit Diagram

FIXES:

  - 31b061f5e attributions glyph passt sich an wenn ovm versteckt
  - 2cd457956 diverse Bugs, die beim Testen mit FF aufgefallen sind
  - 3b32ea5ed overviewmap in mastertree wirft console Fehler
  - 1bf49caca diverse Bugs, die beim Testen mit IE aufgefallen sind
  - 2714554c3 search durch regexp ersetzt für Überprüfung auf Dateiendungen
  - d6627f8f1 jumping Window unter Firefox und IE behoben
  - c3320fbb0 max- und minScale werteten keine scientificNotation aus
  - ad6b53dfb 183 diverse Bugfixes
  - 190e0f7f7 Themes mit default extenden Parameter nicht von superclass
  - 4581bf54b auswahl speichern light tree
  - b20699dae falsches Theme in list ausgewählt
  - ea8ecb2c2 nach Auswahl einer Adresse wird name nicht in searchbar übernommen
  - 4ed4fcdbe nach Auswahl einer Adresse wird name nicht in searchbar übernommen
  - d7706e58c configYAML wurde nicht aus config.json ausgelesen
  - da18c6567 Util.getPath Error

# Changelog LGV Master-Portal 1.5.2

FIXES:

  - 798923ae betrieb 647 contact cc array mehrmaliges Absenden ließ array volllaufen
  - 5b6d8e01 betrieb 238 metaIdToMerge fehlerunanfälliger
  - 70e08d3e light tree auswahl speichern
  - 03317d46 wfs legendURL Parameter aus json in Legende nutzbar

# Changelog LGV Master-Portal 1.5.1

FIXES:

  - c39c1122 falsche reihenfolge des mapView Parameters zoomlevel führte zu Laufzeitfehler
  - 1815d4f9 nach Auswahl einer Adresse wird name nicht in searchbar übernommen
  - 615635b7 configYAML

# Changelog LGV Master-Portal 1.5.0

NEU:

  - 9a74933 end2end-test-infrastruktur
  - ee4dd43 overviewmap als control
  - 8279f7f Merge branch '81_add_removeFilter' into 80_suche_nach_schulnamen reset Filter on Search

FIXES:

  - f789319 hotfixes kw 45 fix csw Parameter aus config.js Pfad angepasst, legende zeichnet sich nicht über Tabelle von fluechtlingsunterkuenfte, verkehrsstaerken Theme Pfad zu Datei angepasst ohne Datum
  - ca4cd86 gfi-detached opens initially on right side
  - 6f0c43f Adresssuche in der Searchbar führte zum Füllen der Suggestliste vom viomRouting
  - 8bc2a82 WMS-Adresse für Bezirkslayer wurde nicht angezeigt, weil id nicht in RawLayerList gefunden werden konnte
  - 92849aa drawmodulstyle
  - f029a7b gfi always on
  - 3786af7 Scrollleiste in Themenbaum light
  - cf931a1 fix UrlParams zoomlevel und Center fix Canvas wird defaultmäßig nicht erzeugt fix UrlParam featureId über LayerIds Parameter StartupModul behalten

# Changelog LGV Master-Portal 1.4.8

FIXES:

  - c54708ef sgvonline theme attr amtliche adresse immer nein

# Changelog LGV Master-Portal 1.4.7

FIXES:

  - d1db2bd fix csw Parameter aus config.js Pfad angepasst
  - 340700f fix legende zeichnet sich nicht über Tabelle von fluechtlingsunterkuenfte

# Changelog LGV Master-Portal 1.4.6

FIXES:

  - 1a7337a Drucken mit GFI

# Changelog LGV Master-Portal 1.4.5

NEU:

  (none)

FIXES:

  - b033e0e gfi mobil rendert sich auf volle breite Merged in hotfix_gif_mobil (pull request #567)
  - d176616 gfi initial links im ie

# Changelog LGV Master-Portal 1.4.4

FIXES:

  - d1766166 gfi initial links im ie

# Changelog LGV Master-Portal 1.4.3

NEU:

  (none)

FIXES:

  (none)

# Changelog LGV Master-Portal 1.4.2

NEU:

  (none)

FIXES:

  (none)

# Changelog LGV Master-Portal 1.4.1

NEU:

  (none)

FIXES:

  - 427a269 Adresssuche in der Searchbar führte zum Füllen der Suggestliste vom viomRouting
  - 73114e6 WMS-Adresse für Bezirkslayer wurde nicht angezeigt, weil id nicht in RawLayerList gefunden werden konnte

# Changelog LGV Master-Portal 1.4.0

NEU:

  - 35ae3ff 1.Version Features-Filter
  - 1b9ed32 epsg code in wfs-request ergänzt

FIXES:

  - 118a569 Änderung der Layerreihenfolge wurde im Tree nicht umgesetzt
  - f36cf06 wenn android tastatur aufpoppt wurde window vom footer geteilt und eine Eingabe war nur schlecht möglich
  - 442ef1a im IE wird bei abfragen der Layerinformationen ein Fehler geworfen, wenn keine Layerattribute definiert sind.
  - 03d2ac1 wurde in der navbar gescrollt, scrollte auch #map, weil die navbar relativ positioniert war
  - a15def9 drawmodul style
  - c9e0aa8 Titelzeile wird zweizeilig weil render nicht bei switch mobile<->desktop erneut ausgeführt wurde
  - 0fdc72a beim Entfernen eines Layers in non-simple-tree wurde falscher IDX-Layer entfernt, wodurch andere Layer nicht mehr unvisible/visible geswitched werden konnten
  - ad30a70 klick auf Menü wirft Fehler in console, weil models[0] war undefined
  - 47ebe3c gfi always on
  - 5bdf0ff Koordinatensuche nach WGS84 (mit Dezimalgrad) funktioniert nicht, wegen parseFloat Problem
  - d046d4e WFS mit png wird nicht mehr geladen
  - 0b357de Scrollleiste in Themenbaum light
  - f7c15bc fix UrlParams zoomlevel und Center fix Canvas wird defaultmäßig nicht erzeugt fix UrlParam featureId über LayerIds Parameter StartupModul behalten
  - 4fd80fa Bild wird im GFI als Bild und als Link angezeigt, soll nur Bild sein
  - 7d36d03 AutostartModul beendet sich nach einmaligem vollständigem Startvorgang selbst
  - 9b9ddb3 272 LegendeSwitch
  - 1e23b31 271 param
  - fc87c13 mapview-options aus config werden nicht übernommen
  - 3fdd4f6 keine Koppelung der LegendURL mit Dowmload im Layerinfo Fenster
  - 71dc8f4 multipoint mousehover position
  - 37c3ad0 schließe GFI nach Adresssuche-hit
  - 8f5f06d kml ie punkte linien und polygone
  - 326bad7 lighttree laeuft ueber
  - 9cd072c safari drucken
  - a3c4633 mrh drucken
  - ed8b4c6 layerinfos gruppenlayer unvollstaendig

# Changelog LGV Master-Portal 1.3.2

FIXES:

  - d7d98f21 mrh print benötigt _print für speziellen proxy

# Changelog LGV Master-Portal 1.3.1

NEU:

  (none)

FIXES:

  (none)

# Changelog LGV Master-Portal 1.3.0

NEU:

  - 798a35e gfi-theme für sgv-online
  - 81bb340 Anwender-Dokumentation
  - 6907236 modul autostarter, um Tools per Parameter STARTUPMODUL starten zu können
  - ac54221 Merge branch 'dev' into RemoteInterface + EPSG definitions for masterTree && FHH Atlas

FIXES:

  - d735d0c Ungültiger Wert für Flurstücksnummer wird bei der Eingabe abgefangen.
  - 3c94d2f portaltitel geoportal-verkehr springt nicht mehr in zweite zeile
  - 7b14c38 - Animation Tool wirft beim Schließen einen Fehler
  - ff9d07c routing url über proxy leiten
  - ed6a75e tree layer über config.json sichtbar werden bei paramAufruf layerids visibility false
  - e0424bd urlparameter layerids, visibility & transparency werden nicht in Karte übernommen
  - 987da2f urlparameter bezirk funktioniert nicht
  - 89f3080 mergeconflict
  - 13468d7 Drucken von Gruppenlayern kann zu Problemen führen
  - 70d0bf5 wfs esri polygon
  - c3cca96 drucken gfi marker und linter fehler
  - b8e64dd group Layer funktionierte nicht mehr
  - c6ecb1f orientation module auch auf localhost anbieten.
  - 22591c1 Fehler in console, wenn keine MetadatenId zum Layer vorhanden ist
  - e84c5fa flurstuecksnummernenner
  - 7f01ca8 Lokalisierungs-Button ist ausgegraut, falls die Funktion deaktiviert ist
  - c3c98d0 wird das Portal über https aufgerufen, funktioniert die Lokalisierung in allen Browsern
  - 0d2c861 printError mit neuem GFI Modul
  - e8286a8 routing
  - 0b65b2f Portal wird nicht geladen, wenn LayerID in JSON nicht definiert
  - 8d721c8 Layerinformationen von Hintergrundlayern wurden  nicht angezeigt und Title war nicht Datensatzname
  - 3da16b7 GFI wird beim drucken immer mit ausgegeben, auch wenn GFI wieder geschlossen
  - 22811e5 Fehler beim Suchen von Baselayern in Suchschlitz behoben

# Changelog LGV Master-Portal 1.2.4

FIXES:

  - 760c7c1 hotfix 332 flurstueckssuche

# Changelog LGV Master-Portal 1.2.3

FIXES:

  - 3b2e44b layerid URL-parameter werden zugeladen falls vorhanden aber nicht konfiguriert

# Changelog LGV Master-Portal 1.2.2
FIXES:

  - ce3e3ae7 gfipopup größe verändert sich nicht durch verschieben vom popup
  - ccd07347 viomrouting
  - 8f6aca60 Portal wird nicht geladen, wenn LayerID in JSON nicht definiert
  - c8be5d5d Layerinformationen von Hintergrundlayern wurden nicht angezeigt und Title war nicht Datensatzname

# Changelog LGV Master-Portal 1.2.1

FIXES:

  - 00917df Portal-Titel wurde in "kleinen" Themenportalen initial nicht angezeigt

# Changelog LGV Master-Portal 1.2.0

NEU:

  - c1ad7b6 Bei der Animation wird auf die Gemeinde gezoomt und ein Marker auf der karte gesetzt
  - 0932b5d Legende für Pendler-Animation in der Werkzeug-Oberfläche implementiert
  - f8d8e61 Unterstützung von setElement() für parcelSearch
  - 0551722 GFIs können in Tabellenform dargestellt werden
  - 97517de Bei der Animation werden dei Punkte anhängig von Pendlerdanzahl und Landkreis dargestellt
  - 90be2d3 Themenbaum kann in kleinen Themenportalen initial aufgeklappt werden

FIXES:

  - d466fb5 keinStartupModul in URL möglich
  - d32423e KML Import Problem im Internet-Explorer
  - b44b62c länge Portaltitel - Die Länge des Portaltitels passt sich an verfügbaren Platz in der Menüleiste an
  - e903ba5 lighttree Sortierung - In kleinen Themenportalen entsprach die Reihenfolge im Themenbaum nicht der Reihenfolge auf der Karte
  - 9522f0c Messen Label - Durch das Verändern der Einheit beim Messen (km/km² in m/m² und umgekehrt), wurde der Messwert der zuletzt gezeichneten Strecke/Fläche entsprechenden umgerechnet
  - ef49ad2 mobile Legende - Beim Wechsel der Anwendungssicht (desktop <=> mobil) wurde die Legende nicht mehr angezeigt.
  - fb24d98 werden Layer im Portal parametrisiert aufgerufen, wurden die entsprechenden Layer zwar im Baum selektiert, aber nicht auf der Karte angezeigt
  - 3d9a209 im IE wurde GFI wegen Overflow-y (css) nicht korrekt dargestellt.
  - ac48f29 BackgroundSwitch-Button nur sichtbar, wenn auch konfiguriert
  - b945614 Mobil wurde das Routingmodul nicht initial geladen.
  - de4a32e fix quickhelp Fehler in console und quickhelp-Button neben searchbar wurde nicht angezeigt
  - 7eadc7f verkehrsfunction Util Fehler
  - 893c2c6 Quickhelp wird in einem starren Fenster gerendered
  - 95ff542 Breite des GFI-Popup von 50% auf 25% der Bildschirmhälfte gesetzt
  - 1f2f810 Beim Messen wird wieder das Tooltip angezeigt
  - f90f787 Suche springt während des Tippens nicht mehr automatisch auf eine gefundene Adresse oder Thema
  - ea888a8 hintergrundkarten werden bei themensuche immer eingeklappt, auch wenn sie ausgeklappt waren
  - 4b135db controls in config.json werden auch auf true/false geprüft
  - 32f0022 Routenplaner verwendet den richtigen Routing-Dienst
  - b6ea8d3 "in meiner Nähe" - Attribute nicht mehr doppelt
  - b12c6d5 portallogo configurierbar

# Changelog LGV Master-Portal 1.1.6

FIXES:
  - 97ad0aa csw falsches Datum ausgelesen, da erneut über ganze csw Datei gesucht wurde
  - 59fae85 Parameter &LAYERIDS in URL wurden nicht mit SimpleTree ausgewertet. &CLICKCOUNTER jetzt überflüssig.

# Changelog LGV Master-Portal 1.1.5

FIXES:

  - 658d016 startcenter wurde nicht ausgelesen aus config.json

# Changelog LGV Master-Portal 1.1.4

FIXES:

  - 11e3138 Die Reihenfolge der Themen auf der Karte entsprach nicht immer der korrekten Reihenfolge der Themen in der Auswahl

# Changelog LGV Master-Portal 1.1.3

FIXES:

  - c05d205 Zeichnungen werden nicht gedruckt

# Changelog LGV Master-Portal 1.1.2

FIXES:

  - a27eb17 gfi Attribute werden nur noch nach Datum formatiert wenn sie ISO 8601 entsprechen

# Changelog LGV Master-Portal 1.1.1

FIXES:

  - b759d17 Auswahl speichern - Beim Öffnen einer gespeicherten Auswahl wurden immer alle Layer auf der Karte angezeigt, unabhängig davon ob der Layer sichtbar war oder nicht.

# Changelog LGV Master-Portal 1.1.0

NEU:

  - 32964b6 Style WMS - Layer können jetzt im Client neu gestylt werden. Vorläufige Einschränkung: Nur mit Flächengeometrien im Zusammenspiel mit SLD v1.0.0 möglich
  - 6f0dff6 kml import tool zugefügt
  - d448742 Navigation für mobile Endgeraete bzw. fuer Bildschirmbreiten bis zu 768px komplett ueberarbeitet (Design und Usability)
  - 2b8bb1b custom js für bauinfo

FIXES:

  - 06935f3 Legende wird im Infofenster erst angezeigt wenn der Layer sichtbar ist
  - df8d671 Measure- und Zeichenlayer immer an oberster Stelle
  - 9639ab9 maxscale initial ignoriert
  - 698594f WFS-Layer können verschiedene Styles zugewiesen werden
  - 582de4c Searchbar springt nicht mehr aus der Menüleiste
  - 7e3d0fe Searchbar springt nicht mehr aus der Menueleiste
  - 176d2bf GFI Abfrage funktioniert jetzt auch bei extern hinzugefügten WMS-Layern
  - 07aeee9 Das Kontaktformular wird direkt bei der Texteingabe validiert.
  - bb1fb95 initiale Strassensuche auch mit " " und "-" möglich
  - baf3f4e Lokalisierung in Chrome ist nur noch von HTTPS möglich
  - ffc0bcc drucken von KML-Features möglich
  - 4304704 GFI-Reihenfolge wird in der richtigen Reihenfolge dargestellt
  - faa9133 GFIPopup hat eine maximale Höhe in Relation zur Fensterhöhe
