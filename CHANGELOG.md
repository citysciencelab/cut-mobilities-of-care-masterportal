# Changelog Masterportal
 All important changes in this project are stored in this file.

[Semantic versioning](https://semver.org/spec/v2.0.0.html) is used.

## Known Issues
- 3D: The position indicator inside of a 3D object vanishes when clicking on the object.

---

## v2.10.0 - 2021-06-02
### Added
- A locale file for Portuguese language was added.
- New WFS Layer attribute "wfsFilter" in configuration to filter the data from wfs layer.
- Added possibility in gfiTheme sensor to display an explanation text for the data.
- Spanish is available as a new language selection.

### Changed
- The Id in config.json for every layer could be in an object format, to allow any number of menu entries with the same layer id.
- New Parameter propertyNames could be added in config.json for WFS layer to receive filtered response.
- The documentation for WMTS layers, legend field has been adapted. Only one specification in a string[] is possible.
- The translation for the url in the staticlink in config.json has been removed.
- Issue #617: Update description of the attribute '"extent"' for layer configurations in config.json.md.

### Deprecated

### Removed

### Fixed
- Now Sensor Layer will show 0 if the dataValue is 0 and not "no data".
- In GFI the layerTitle was shortened in case it contains a colon.
- The GFI is now active if this is configured and no other active tool explicitly prevents this.
- Issue #616: Fixed a bug where the live zoom in the tool filter did not take into account the configured minScale.
- Fixed an error that caused the historical data in the gfiTheme sensor to not be formatted correctly at times.

---

## v2.9.1 - 2021-05-25
### Fixed
- Fixed no data in gfi theme of verkehrs layers in geo-online

---

## v2.9.0 - 2021-05-05
### Added
- New attribute 'nearbyTitle' implemented in config.json for the title in the list of nearby search results.
- Add @babel/eslint-parser to the package.json
- Added the new tool "bufferAnalysis"

### Changed
- Renamed the folders `library` and `util` -> `utils`, `test` -> `tests` and `ressources` -> `resources`.
- Tool addons are now also written in config.json in camelCase.
- colorTools are renamed into convertColor (src/utils/convertColor)
- Updates the core-js and babel dependencies in the package.json
- Update the dependency caniuse-lite.
- The module addGeoJSON switched from backbone to vue and is provided as a util now.
- The loading image is now displayed longer when switching to map mode: Oblique (max. 80000ms).

### Deprecated
- colorArrayToRgb (src/utils/colorArrayToRgb) is deprecated. Use convertColor (src/utils/convertColor) instead.

### Removed
- remove babel-eslint from the package.json
- Documentation files in German language have been removed. From now on the documentation will only be maintained in English. The only exception is config.json.de.md, because a German language file is necessary for the mp-admin.

### Fixed
- Fixed a bug that prevented the gfi of a wms from being requested via a reverseproxy.
- Printing wfs cluster features and features with multiple styles.
- If the transparency of a layer is defined as string, it will be parsed to an integer now.
- When clicking on layers of type TERRAIN3D, TILESET3D or OBLIQUE in the search, a query is now displayed that can be used to switch to the respective map mode.
- Fixed a bug that for the gfi in infoFormat "text/html" did not execute the script part when starting the iFrame.
- Fixed an issue in searchbar, that after finding a result and zooming to it the 3D mode couldn't be activated anymore
- Fixed an issue in fileImport that when the imported KML File is missing the isVisible setting the feature wouldn't be displayed when printing

---

## v2.8.0 - 2021-04-07
### Added
- External WMS Layers with version lower than 1.3.0 can also be imported.
- Added possibility to prepend prefix to GFI attribute.
- WMTS Layers can now be printed with MapFish.
- The user can search visible wfs features by clicking a position on the map by clicking the "Nearby button" on the controls
- The user can search visible wfs features after searching an address from search field by clicking the "Nearby button" on the controls

### Changed
- The tool AddWMS switched from backbone to vue module.
- Consolidate the mqttOptions in the layer sensor with the documentation (services.json.md).
- In config.json.md, the attribute `isActive` was changed to `active` in Portalconfig.menu.tool.gfi.
- Legends are only printed from layers that are switched visible.
- Layers of type `SensorThings` are now automatically displayed in the default topic tree. The attribute `related_wms_layers` can be used to hide related layers of type `WMS`.

### Removed
- SensorThings address tab in layerInformation removed.
- The print module for using mapfishprint v2 has been removed. In this case the attribute `proxyurl` has been removed too
- The vector style module for using the style_v2.json has been removed. In this case the atteibute `useVectorStyleBeta` has been removed too.

### Fixed
- GFI of type text/html now also loads css files of the body.
- Show metadata if the MD_Identification node is implemented as MD_DataIdentification or SV_ServiceIdentification.
- Fixed a bug that made single layer info legend appear multiple times when activating additional layers while opened.
- Printing of tooltip of measure-tool works: The tooltip of the measure tool is no longer implemented as an overlay, it is created now as vectorlayer.
- Printing of big amount of features now works.
- Removed a bug causing an irritating map focus after using BKG search and leave search field

---

## v2.7.2 - 2021-03-09
### Fixed
- SensorThings: Fix the bug where initially data has not been fetched, resulting display of "no data" on mousehover.

---

## v2.7.1 - 2021-03-05
### Fixed
- The representation in the legend has been corrected.

---

## v2.7.0 - 2021-03-03
### Added
- Integration and use of WMS-services secured via User / Password (HTTP-Basic). Thy are marked in the topic tree by lock symbol.
- On draw tool Double Circle configuration available in config.json
- On draw tool Tooltip and Tooltip style configuration available in config.json
- On tools Imported Layer in theme tree integrated function under Addons
- On tools Geometrie/Geb??ude Analyse funtion on tools under Addons
- On tools Taktische Zeichen on tools under Addons
- Added the parameters 'contactInfo', 'includeSystemInfo', 'locationOfCustomerService', 'maxLines', 'showPrivacyPolicy' and 'subject' to the configuration of the contact tool.

### Changed
- The language of the changelog has been changed to English.
- Migrated the SearchByCoord Tool from Backbone.js to Vue.js.
- The measure tool has been migrated to Vue.
- Migrated the Download Tool from Backbone.js to Vue.js and integrated it into the Draw Tool.
- Migrated the SaveSelection Tool from Backbone.js to Vue.js. It also no longer has a Radio channel.
- copyToClipboard is now a reusable action and can no longer be triggered through the Radio.
- Migrated the Contact Tool from Backbone.js to Vue.js. In doing so, the functionality of the config parameter 'deleteAfterSend' was split into two parameters; 'closeAfterSend' and 'deleteAfterSend'.
- Migrated the StyleVT Tool from Backbone.js to Vue.js.
- WPS migrated to Vue.js.

### Deprecated
- Deprecated the parameter 'serviceID' for the contact tool; 'serviceId' should be used instead.
- Migrated the SaveSelection Tool from Backbone.js to Vue.js. It also no longer has a Radio channel.
- copyToClipboard is now a reusable action and can no longer be triggered through the Radio.
- Deprecated the parameter `simpleMap` in the config.js and moved its configuration to the `saveSelection` tool in the config.json.

### Removed
- The routing-tool was removed.

### Fixed
- If the Save selection tool is not configured, the button for it is no longer displayed in the topic tree.
- Various bugfixes.

---

## v2.6.3 - 2021-02-12
### Fixed
- Mehrere Darstellungsfehler bei den Layern "Dauerz??hlstellen (Rad) Hamburg" und "Verkehrsdaten Rad (Infrarotdetektoren) Hamburg" wurden behoben.
- Ein Fehler wurde behoben, durch den bei Ma??stabbeschr??nkten Layern beim Drucken Warnungen ausgegeben wurden,
- obwohl alles in Ordnung war.

---

## v2.6.2 - 2021-02-10
### Changed
- Der Download im Druckmodul wird nun ohne ein Popup durchgef??hrt. Somit kann der Ausdruck auch mit einem aktiven Popup Blocker heruntergeladen werden.
- Die Italienische Sprachdatei wurde erweitert und angepasst.
- Die Angabe der restrictedAlerts im Alerting Modul ist nun nicht mehr Case-Sensitive
- Die Anzeige der Schr??gluftbilder wird im Internet Explorer 11 nicht mehr unterst??tzt, es erscheint eine Meldung mit dem Vorschlag f??r diese Funktionalit??t einen aktuellen Browser zu nutzen.
- Die Beschreibung des Attributes "infoFormat" wurde aus der config.json.md in die services.json.md verschoben.
- Die Angabe von gfiAttributes ist jetzt case-insensitive.
- Im SensorLayer l??sst sich das Laden der Observations ??ber retained message nun in der config.json aus- bzw. einschalten.
- Daten aus der SensorThings-API lassen sich nun auch mittles Datastreams als Wurzelelment laden.
- Beim verschieben der Karte werden Features aus der SensorThings-API nun ohne Anzeige des Loaders direkt nachgeladen.

### Fixed
- Ein Fehler wurde behoben, der beim ??ffnen des Themenbaumes zu langen Ladezeiten f??hrte.
- Ein Download-Link wurde hinzugef??gt, da manche Browser den automatischen Download blockieren.
- Das Alerting Modul ignoriert Gro??- und Kleinschreibung beim Filtern der URLs.
- Im Werkzeug WFST wurden einige Bugs behoben. Unter anderem wurden bei Meldungen keine Buttons mehr angezeigt.
- Ein Fehler wurde behoben, der bei geclusterten Features vom Layertyp Sensor dazu f??hrte, dass die Clusterung in einigen F??llen beim Hereinzoomen nicht aufgel??st wurde.
- In bestimmten F??llen wurde beim Drucken eine falsche Url erstellt.
- Bei D3 Grafiken wurden bei der linken Achsen Beschriftung die Tausender Trennzeichen in Anf??hrungszeichen dargestellt.
- Ein Fehler wurde behoben, der auftrat wenn ein Layer angeschaltet wurde, der verschiedene Sonderzeichen im Namen enthielt.
- Wenn der MapMarker in Kombination mit einer Projektion als URL Parameter angegeben wird, wird der MapMarker nun korrekt projiziert.
- Ein Fehler wurde behoben der dazu f??hrte, dass die Legende im Men?? angezeigt wurde, auch wenn diese nicht konfiguriert war.
- 3D: Das GFI von Geb??uden zeigt wieder alle verf??gbaren Attribute an und das GFI f??r Br??ckenfl??chen wird wieder angezeigt.
- Ein Fehler wurde behoben der verhindert hat, dass eine Get Feature Info f??r WMS vom Mapserver mit dem "infoFormat": "application/vnd.ogc.gml" angezeigt wurde.
- Wenn Layer ??ber die Url als Parameter selektiert wurden und die Transparenz nicht ??bergeben wurde, war deren Transparenz im Themenbaum nicht einstellbar, das ist behoben.
- Das Drucken eines Ausschnitts in dem der MapMarker sichtbar ist funktioniert jetzt. Der MapMarker wird im Druck nicht dargestellt.
- Bei der WFS-Suche wurde der Such-Begriff bei der Anfrage f??lschlicherweise kodiert, das wurde beseitigt.
- Eine Meldung wurde im IE11 hinzugef??gt, dass die Schr??gluftbilder nicht unterst??tzt werden.
- Bei der Legende waren einige Bilder verschwommen dargestelt.

---

## v2.6.1 - 2021-01-07
### Added
- Eine Sprachdatei f??r Italienisch wurde hinzugef??gt.

### Fixed
- Ein Fehler wurde behoben der verhindert hat, dass das Portal vollst??ndig geladen wurde, wenn eine portalLanguage konfiguriert war.
- Die Beschreibung des Attributes portalLanguage wurde aus der doc/config.json.md vollst??ndig enfernt, da die Sprache in der config.js konfiguriert werden muss.
- Die Scale Werte f??r die Ma??stabsanzeige werden nun wieder aus der config.json bzw. aus den Defaults ??bernommen und angezeigt.
- Ein Fehler wurde beseitigt, der auftrat, wenn zuerst nach einer Kita und danach nach einem Bebauungsplan gesucht wurde.
- Wenn im Ma??stab 1:500 gedruckt werden soll, dann wird eine Warnung angezeigt, die die nicht druckbaren Layer nennt. Die Kartenansicht im Browser ??ndert sich nicht.

---

## v2.6.0 - 2020-12-17
### Added
- Neue Konfigurationsm??glichkeiten f??r "highlightVectorRules" hinzugef??gt.
- Ein neues Tool "Alerting" wurde hinzugef??gt.
- i18n wurde f??r zahlreiche Stellen angepasst.
- Neues Modul "Confirm Action" hinzugef??gt.
- RemoteInterface wurde f??r Vue hinzugef??gt.
- Es ist nun m??glich, mithilfe des "Datei-Import" Tools eigene GPX und GeoJSON Dateien darzustellen.
- Es gibt nun ein Werkzeug um Daten und Geometrien von Web Feature Services (WFS) zu ver??ndern, mittels WFS Transaction (WFS-T).
- Das Zeichenmodul wurde erweitert, um beim Zeichnen von Punkten verschiedene Glyphicons zu verwenden.
- Es k??nnen nun Web Map Tile Services (WMTS) als Layer eingebunden werden.
- Das neue Styling wurde um die M??glichkeit erweitert, die Attribute scalingAttribute und labelAttribute zu konfigurieren.
- Die ???gfiAttribute???-keys k??nnen jetzt auch Objektpfade sein, analog zum neuen Styling.
- Der Pfad zu den Sprachdateien ist jetzt in der config.js konfigurierbar und kann jetzt eine Funktion, einen Pfad oder ein Url enthalten.
- Es wurde die M??glichkeit hinzugef??gt ??ber die URL Features zu ??bergeben, welche dann in einem GeoJSON-Layer dargestellt werden.
- Es k??nnen nun Vector Tile Layer (VTL) als Layer eingebunden werden.
- F??r VTL wurde ein Tool hergestellt, mit dem zwischen externen Styles gewechselt werden kann.
- Ein Tool zur vektordienst??bergreifenden Auswahl von Features mittels einer aufziehbaren Box wurde hinzugef??gt. Das Tool zeigt Feature-Eigenschaften an und bietet eine Zoomfunktion auf sie an.
- Das Tool filter kann nun auch geclusterte Vektordienste filtern.
- Hinzuf??gen einer zentralen Pr??finstanz, die deprecated Code sucht und ersetzt.
- Im Informationsfenster eines Layers wird ein Hinweistext bez. des Datei-Typs angezeigt, falls im Reiter"Datensatz herunterladen" mehrere Dateien angezeigt werden.
- Highlight von Vector Features ist nach vue umgezogen und konsolidiert. Der Parameter highlightVectorRules beim GFI wird nur vom neuen VectorStylye Version 3 unterst??tzt.
- Der Parameter allowMultipleQueriesPerLayer, der im Tool Filter erm??glicht, dass mehrere Layer gleichzeitg gefiltert werden k??nnen, wurde in der Dokumentation beschrieben.

### Changed
- Im Zuge des internen Umbaus von Backbone.js zu Vue.js wurden zahlreiche Module refactoriert oder neu erstellt. Folgende Module sind jetzt auf Basis von Vue.js: Alerting, ConfirmAction, Controls, Footer, Language, Map, MapMarker, RemoteInterface, ScaleLine, Title, Tools, Zahlreiche weitere Utils.
- Der Ladebildschirm wurde ??berarbeitet.
- Es werden nun alle URLs vom Portal direkt angefragt, ohne den Umweg ??ber einen Proxy zu gehen, da von der GDI-DE empfohlen wird serverseitig einen CORS-Header einzurichten. Siehe dazu https://www.gdi-de.org/SharedDocs/Downloads/DE/GDI-DE/Dokumente/Architektur_GDI-DE_Bereitstellung_Darstellungsdienste.pdf?__blob=publicationFile Kapitel 4.7.1. Es besteht aber die M??glichkeit gezielt URLs bestimmter Dienste ??ber einen Proxy umzuleiten. Diese M??glichkeit ist jedoch deprecated.
- Das Tool "GFI" wurde ??berarbeitet und funktioniert nun auf Basis von Vue.js. Gleichzeitig wurden die speziellen Themes ausgelagert als Addons. Es gibt im Masterportal selber nur noch die Themes "default" zur tabellarischen Darstellung und "sensor" zur grafischen Anzeige von Sensordaten mit Zust??nden/Status z.B. Elektrolades??ulen. Die Verwendung infoFormates "text/html" ist weiterhin m??glich, ben??tigt jedoch eine Tabelle zur Anzeige.
- Im GFI Theme "default" werden Icons eingeblendet, um von dort andere Tools anzusteuern. Zur Verf??gung stehen Icons f??r die Werkzeuge "routing" und "compareFeatures".
- Das Tool "Draw" wurde ??berarbeitet und funktioniert nun auf Basis von Vue.js. Das Zeichnen von Punkten wurde ge??ndert, alle Punkte basieren jetzt auf Bild-Dateien. Gr????e und Deckkraft k??nnen nicht mehr eingestellt werden, f??r diese Funktionalit??t steht das Zeichnen von Kreisen zur Verf??gung. Das Bereitstellen von anderen Bilddateien wurde angepasst, siehe Doku der config.json.
- Das Men?? wurde dahingehend angepasst, dass f??r Layer kein Info-Icon angezeigt wird, wenn hierf??r explizit "false" in der services-internet.json angegeben wurde.
- Das Tool "KML-Import" wurde ??berarbeitet und hei??t fortan "Datei-Import".
- Babel wurde, um einen Support f??r alte Browser zu gew??hrleisten, auf den aktuellen Stand gebracht. Dazu wurde die Bibliothek core-js sowie eine babel.config.js hinzugef??gt. Dadurch sind weitere Polyfills, die ES6 betreffen nun nicht mehr notwendig.
- Die Version des Packages fs-extra wurde in der package.json aktualisiert.
- Die Version des Packages replace-in-file wurde in der package.json aktualisiert.
- Die Version des Packages mini-css-extract-plugin wurde in der package.json aktualisiert.
- Die Version des Packages null-loader wurde in der package.json aktualisiert.
- Die Version des Packages https-proxy-agent wurde in der package.json aktualisiert.
- Die Version des Packages zip-a-folder wurde in der package.json aktualisiert.
- Das Package moment-timezone-data-webpack-plugin wurde entfernt.
- In der index.html ist unter der id "loader" und ein neuer css-Loader eingebunden, dessen Darstellung ??ber css ge??ndert werden kann. Oberhalb davon werden Portaltitel und Portallogo w??hrend des Ladens des masterportals gezeigt. Sie sind in der index.html unter der id "portal-logo-box" zu finden.
- In der Konfiguration des Werkzeugs "Strecke/Fl??che messen" kann jetzt der Erdradius angegeben werden.
- Das Modul MapMarker funktioniert nun auf Basis von Vue.js. Es ist nun m??glich den Style f??r Punkt- und Polygon-Marker in der Style.json zu konfigurieren.
- Bei Tool WMS-hinzuf??gen, darf externe Layer nur ab Version 1.3 importiert werden.
- Bei Tool WMS-hinzuf??gen, darf externe Layer au??er Portalextent nicht importiert werden.
- Bei Tool Druck, die Layers, die nicht "visible" in Dreuckma??stab sind, werden "invisible" beim Druck.

### Deprecated
- Die M??glichkeit URLs ??ber einen Proxy umzuleiten (useProxy) ist deprecated.
- RemoteInterface via Backbone Radio ist ab jetzt deprecated.
- WfsFeatureFilter ist deprecated. Bitte das Modul Filter benutzen.
- ExtendedFilter ist deprecated. Bitte das Modul Filter benutzen.
- Das Attribut coord f??r das Modul zur Koordinatenabfrage ist deprecated. Bitte das Attribut supplyCoord benutzen.

### Removed
- Tool "Alerting" wurde entfernt und durch ein neues Tool ersetzt
- @babel/polyfill wurde aus der package.json entfernt.
- style-loader wurde aus der package.json entfernt.
- es6-promise wurde aus der package.json entfernt.
- url-polyfill wurde aus der package.json entfernt.
- fs wurde aus der package.json entfernt.
- Der Requestor wurde direkt in dem Tool featurelister integriert und daher entfernt.
- Vom Tool "Draw" wird der Typ "glyphicon" nicht mehr von der iconList unterst??tzt, er wurde entfernt. Es sollen nur Bild-Dateien genutzt werden, siehe Doku der config.json.
- Die Beta-Warnung f??r die Schr??gluftbilder wurde entfernt.

### Fixed
- GFI Darstellung von HTML wurde ??berarbeitet.
- Mehrere Bugs beim Schulinformationssystem wurden behoben.
- Ein Bug wurde behoben, durch den die Legende bei Gruppenlayern nicht funktionierte.
- Ein Bug wurde behoben, durch den das Mobile Menu doppelt angezeigt wurde.
- Mit Google Earth erstellte KML Dateien werden mit dem Tool "Datei-Import" nun besser dargestellt.
- Ein Problem wurde behoben, durch das der Footer kaputt gegangen ist, wenn keine URLs konfiguriert waren.
- Im Themenbaum wurden fehlende ??bersetzungen hinzugef??gt und im "custom tree" lassen sich die "Titel" der Ordner jetzt ??bersetzen.
- Ein Fehler in der VisibleVector Suche wurde behoben. Dieser hatte verhindert, dass Suchergebnisse, die ein Leerzeichen beinhalten, gefunden werden.
- In Geo-Online kann der Marker wieder ??ber die URL gesetzt werden.
- Zeichnen ??ber das remote interface: centerPoint-Koordinaten werden erzeugt und heruntergeladen, kein freehand zu Beginn.
- Im Styling wurde das Feld legendValue nicht ausgelesen. Dies funktioniert nun wieder.
- Im Kontaktformular werden auch Email-Adressen mit einer Domain-Endung die l??nger als 2 Zeichen ist als g??ltig anerkannt (z.B. name@foo.hamburg).
- Unstimmigkeiten beim Messen mit dem Werkzeug "Strecke/Fl??che messen" wurden beseitigt.
- Ein Problem mit Geo-JSOn Layern wurde behoben.
- In der URL angegebene Layereigenschaften, wie Transparenz werden nun ??bernommen.
- Viele weitere Bugfixes

---

## v2.5.5 - 2020-09-24
### Fixed
- SpecialWFS sucher funktioniert ??ber mehere angegebene propertyNames im Array.

---

## v2.5.4 - 2020-08-27
### Fixed
- 3D Tileset Layer werden nun korrekt ??ber die Legende aktiviert/deaktiviert
- Ein Fehler in der Suche mittels des Gazetters, der bei Hausnummern mit Zusatz aufgetreten ist wurde behoben.

---

## v2.5.3 - 2020-06-29
### Added
- Multipolygone werden nun von der SpecialWFS Suche verarbeitet. Interne Polygone bspw. von B-Pl??nen werden fortan ber??cksichtigt und bei der Darstellung ausgespart.
- Ein Konfigurationsparameter f??r das ZoomLevel bei der BKG-Suche wurde eingef??hrt.
- In der BKG-Suche wurden die Parameter zoomToResultOnHover und zoomToResultOnClick zum Steuern der Anzeige der Suchergebnisse eingef??hrt.

### Changed
- Der erste Buchstabe wird f??r Eintr??ge in der Legend aus WFS-Diensten nun immer gro?? geschrieben.
- Das Werkzeug zur Koordinatenabfrage zeigt die Koordinatensysteme nun enstprechend der Reihenfolge der konfigurierten namedProjections aus der config.js an.

### Deprecated
- Der URL-Parameter zoomToResult ist deprecated. Bitte zoomToResultOnHover und zoomToResultOnClick benutzen.

### Fixed
- Die Legende f??r GruppenLayer wird nun wieder dargestellt.
- Themenbaum/ Externe Fachdaten: Ein visuelles Problem beim Schliessen der Ordners wurde beseitigt.
- Der Titel wird im Druckmodul nun beibehalten wenn der Ma??stab ge??ndert oder in der Karte gezoomt wird.
- Die Legende wir f??r GruppenLayer wird nun nur noch einmal angezeigt.
- Im Ausdrucken aus dem Druckmodul wird nun die Legende f??r GruppenLayer wieder angezeigt.

---

## v2.5.2 - 2020-06-09
### Fixed
- Die Portal-Konfiguration "singleBaselayer": "true" f??hrt jetzt dazu, dass immer nur ein Hauptlayer ausgew??hlt werden kann.
- Das Label der Version im Footer wird jetzt korrekt ??bersetzt.
- Legenden, die den gleichen Namen und das gleiche Image haben, werden nur noch einmal f??r jeden Layer dargestellt.
- In der Layerinformation wird, wenn keine Metadaten geladen wurden, der Link f??r "weitere Metadaten" nicht mehr dargestellt.
- Der Infotext f??r Checkboxen wird nun beim Start nicht mehr ausgeklappt und hat nun den richtigen Style.
- Die Quickhelp wird nun wieder richtig positioniert.

---

## v2.5.1 - 2020-05-29
### Added
- Internationalisierung erg??nzt f??r:
    - den Parameter Flur in der Flurst??ckssuche
    - den Men??parameter Information
    - die Themenb??ume (default und custom)
- Die Konventionen zu folgenden Themen erweitert:
    - Die Nutzung von Underscore.js
    - Ort f??r Templates
    - Schreiben des Changelogs
- Der Pfad zu den Sprachdateien ist jetzt in der config.js konfigurierbar und kann jetzt eine Funktion, einen Pfad oder eine Url enthalten.
- Es wurde ein Konfigurationsparameter f??r das Druckwerkzeug eingef??gt: currentLayoutName. Dadurch l??sst sich das Standardlayout beim Starten des Werkzeugs konfigurieren.

### Changed
- Die Dokumentation wurde an einigen Stellen verbessert und der fehlende Teil f??r das Werkzeug AddWMS wurde hinzugef??gt.
- Die ??berschriften in dem Control Layerattributions werden nun in der Schriftgr????e 14px und nicht mehr fett dargestellt.
- Die Meldung, die beim Fehlschlagen der GFI angezeigt wird, wurde ??berarbeitet.
- In den Layerinformationen wird nun der Text "Keine Metadaten vorhanden." angezeigt, wenn keine Daten geladen wurden.
- Bei abrufen des Druckreports wird die printAppId nun im Pfad mit angegeben.

### Deprecated

### Removed
- Underscore.js wurde aus der Package.json entfernt

### Fixed
- Ein Problem wurde behoben, sodass der Ma??stab nun auch bei besonders kleinen Ma??st??ben nicht umbricht.
- Der URL-Parameter "LNG" funktioniert nun ausschlie??lich wenn die Mehrsprachigkeit in den Portalconfigs aktiviert wurde und wirft keinen Fehler mehr.
- Die Scrollbar beim Starten im IE11 wurde entfernt
- Ein Problem, dass beim parametrisierten Aufruf mit ?config= auftrat, wurde behoben
- Ein Problem wurde behoben, welches mit fehlernder Konfiguration des Portaltitels auftrat
- Das Problem, das bei der ??nderung der Sprache bei einem ge??ffneten Werkzeug auftrat und zu einer falschen Darstellung f??hrte, wurde behoben
- Im Footer k??nnen nun wieder eigene Eintr??ge konfiguriert werden, die durch die Mehrsprachigkeit nicht mehr fehlerhaft angezeigt werden.
- Ein Fehler wurde behoben, durch den Werkzeuge nach der Umschaltung der Sprache nicht mehr angezeigt wurden, da dort noch keine Mehrsprachigkeit implementiert ist
- Die fehlerhafte ??bersetzung mittels des URL Parameters ?lng= bei nicht konfigurierter Mehrsprachigkeit wurde behoben
- Layer-Info-Fenster ist nun maximal 600px breit
- Sensordaten werden nun wieder live gestylt.
- Bei der Suche nach multipart Polygonen wurde lediglich auf eines der Teilpolygone gezoomt und dieses gehighlighted, nun geschieht dies f??r das gesamte multipart Polygon.
- Ein Problem beim Anzeigen des Loader-gif wurde behoben.
- Bei Vektordaten (WFS) wird nun auch die Legende wieder aus dem Parameter legendURL ausgelesen, wenn dieser angegeben wurde.
- Bei ausgegrauten Layern wird die Legende nun nicht mehr gedruckt.

---

## v2.5.0 - 2020-04-06
### Added
- CustomTree: Der Parameter singleBaselayer wurde hinzugef??gt. Steuert, ob nur ein einzelner Baselayer auf einmal w??hlbar sein soll oder nicht.
- Sensordaten:
    - Ladestrategien f??r http- und mqtt-Protokolle wurden in extra Module ausgelagert.
    - Abonnements k??nnen auf Browserextent reduziert werden.
    - Abruf von s??mtlichen Daten l??uft nun komplett asynchron.
    - Letzter Status kann direkt beim Abonnieren geholt werden (Retain-Message).
    - Konfigurierbarkeit f??r Sensordaten im GFI wurde erweitert.
- GeoJson: Werden als default in EPSG:4326 gelesen, k??nnen aber ??ber crs einen eigenen EPSG Code mitgeben.
- ParametricURL: Neue Parameter zoomToExtent und zoomToGeometry, zoomt auf einen in der URL angegebenen Kartenausschnitt bzw. auf eine ausgew??hlte Geometrie.
- MasterportalAPI: Einbinden der MasterportalAPI als Kern des Masterportals.
- Heatmap: Erweitert f??r WFS und GeoJson.
- end2end-Test: Die M??glichkeit end2end-Tests zu schreiben wurde implementiert.
- Snippet graphicalsselect: Neues Snippet um verschiedene graphische Auswahlm??glichkeiten in der Karte zu haben.
- Logo von *MasterPortal* wird beim Laden angezeigt
- Es k??nnen nun eigene Module - sogenannte *Addons* - in Portale eingebunden werden. Weitere Infos siehe **addons.md**.
- Suche:
    - Nach Klicken auf *alle Ergebnisse anzeigen* kann nun auch auf eine Gruppe geklickt werden, um diese zu ??ffnen.
    - Wenn ein Thema ausgew??hlt wird, wird die entsprechende Ebene aktiviert.
- Tools
    - StyleIds k??nnen nun vom Typ Array sein
    - Zeichnen: Das Tool wurde erweitert und verbessert. Es k??nnen nun beispielsweise auch Doppelkreise gezeichnet werden.
    - Zeichnung Herunterladen: Funktion wurde erweitert
- Internationalisierung wurde in einigen Modulen hinzugef??gt
- Sidebar: Breite ist nun konfigurierbar
- Layerslider: Das Tool wurde erweitert und verbessert.
- 3D:
    - 3D: Features eines Layers k??nnen zum Ausblenden in 3D in der config.json konfiguriert werden.
    - Map-Marker kann nun 3D-Koordinaten bekommen. Dies ist m??glich durch eine Konfiguration des Markers als Ebene.
    - VectorLayer k??nnen nun ihre 3D-Koordinate oder durch Konfiguration erh??ht dargestellt werden.
- GFI:
    - Konfigurierbar, um Vektordaten bei GFI Abfrage anders darzustellen.
    - Neues GFI-Theme *sensor*, *bildungatlas*
- Layer:
    - GeoJson-Layer um subTyp *opensensemap* f??r *Opensensemap API* erweitert
    - URL in Layer-Information kann nun durch Konfiguration versteckt werden
- Neuer Pre-Push-Hook erstellt Documentation und ??berpr??ft diese
- Dokumentation f??r *Addons* hinzugef??gt

### Changed
- VectorStyling: Neues Vektorstyling. Erm??glicht das Einlesen von gemischten Geometrien ??ber GeoJSON oder WFS, und das Verarbeiten von Multigeometrien.
- Suche: Die Konfigurierbarkeit der Elastic-Search Suche wurde erweitert.
- Build-Script:
    - Erstellt nun s??mtliche Portale in angegebenen Ordner
    - Erstellt nun Mastercode-Ordner
    - F??r Cross-Plattform angepasst
- Konsolidierung:
    - Hamburg-spezifischer Code wurden entfernt
    - Hamburg-spezifische Tools wurden in die neuen *Addons* umgezogen
- Doku:
    - *setup.md* wurde angepasst
- Konventionen: Wurden erweitert und ??berarbeitet.
- Eslint: ??berarbeitung der Regel function-paren-newline, sobald bei einem Parameter einer Funktion ein Zeilenumbruch verwendet wird ist dies bei allen Parametern erforderlich.
- master Portale: Intranet URL's entfernt.
- Fonts: Erzeugung einer eigenen Fontclass MasterportalFont, um den Font des Masterportals zentral setzen zu k??nnen.
- camelCase: Umbenennung diverser Ordner und Dateien entsprechend der camelCase Konvention.

### Deprecated
- Das **[alte Vektorstyling](doc/style.json-deprecated.md)** ist deprecated. Bitte das **[neue Vektorstyling](doc/style.json.md)** benutzen.
- Der URL-Parameter STARTUPMODUL ist deprecated. Bitte ISINITOPEN benutzen.
- Der URL-Parameter BEZIRK ist deprecated. Bitte ZOOMTOGEOMETRY benutzen.

### Fixed
- Draw-Tool: Gezeichnete Features werden im gleichen Stil gedruckt, in dem sie gezeichnet wurden. Text beh??lt auch im Druck seine Position bei.
- Layer: Gemergde Layer behalten ihre GFI-Attribute und k??nnen abgefragt werden.
- Layer: Fortan k??nnen auch Layer deaktiviert werden, die im aktuellen Ma??stab nicht sichtbar sind.
- Filter: Der Filter kann im Internet Explorer wieder ge??ffnet werden.
- Filter: Ein Fehler verhinderte die Verwendung des Filters. Dieser wurde behoben.
- Elastic-Search: Es kann wieder nach konfigurierten Fachthemen gesucht werden.
- Suche: Ein Fehler wurde beseitig, der beim Entfernen des eingegebenen Suchbegriffs aufgetreten ist.
- Messtool: Die voreingestellte Einheit (m?? oder m) wurde auf die jeweilige Auswahl (Fl??che oder Strecke) abgestimmt.
- Themenbaum: Der Themenbaum l??sst sich wieder inital ??ffnen.
- Legende: Die Symbole in der Legende wurden sehr klein skaliert, nun werden sie in einer annehmbaren Gr????e dargestellt.
- Graph: Verschiedene fixes f??r das graph Modul.
- Case-sensitive Dateisysteme: Doppeltes Module quickhelp gel??scht.
- Arrow functions: Arrow functions(=>) in Templates f??hren zu Fehlern im IE 11, daher entfernt.
- Gruppenlayer: Fehlerh??ndling, wenn die Dienste nicht antworten.
- Layerinformation: Fehlerhandling, wenn keine Metadaten gefunden werden.
- FreezeWindow: Drehte sich mit der Table Navigation
- Filter: Keine Filter-Inhalte vorhanden bei isIntiOpen = true
- Fehler beseitigt, durch welchen unsichtbare Ebenen in der Legende angezeigt wurden
- Fehler beseitigt, durch welchen Ebenen f??lschlicherweise ausgeblendet wurden
- Fehler beseitigt, durch welchen man nur im initialen Ma??stab drucken konnte
- Legende: Darstellungsreihenfolge der Ebenen in der Legende war nicht gleich der Reihenfolge in der Themenauswahl
- Hintergrundgrafik kann nun korrekt deaktiviert werden
- Filter: Funktioniert nun auch mit Heatmaps in Kombination mit deren DataLayern.
- Karte:
    - Ma??stabsdarstellung ??ndert sich in seiner L??nge nicht mehr beim Zoomen
- Header bricht nicht mehr um bei bestimmten Breiten
- Anpinnen einer Ebene beeintr??chtigt nicht mehr die Usability im Layerinfo-Fenster
- ??berfl??ssige Projektionen wurden entfernt
- Mobile: Es kann nun in den Suchergebnissen gescrollt werden
- BackgroundCanvas kann nun wieder konfiguriert werden.
- diverse Bugfixes.

---

## v2.4.3 - 2019-11-14
### Fixed
  - KML-Import: Ein Fehler wurde behoben, der verhindert hat, dass von QGIS exportierte KML-Dateien geladen werden.
  - GFI: Das GFI wird nun auch bei gr????eren Datenmengen innerhalb des Portals dargestellt.
  - GFI: Das GFI wird nun immer nach dem Schlie??en eines anderen Werkzeugs aktiviert.
  - Tools: Die Minimierung von Werkzeugen wird nun richtig dargestellt.
  - Men??: Die Men??leiste ist nun auch nach einer Suche noch intakt.
  - 3D-Modus: Die 3D-Navigation per Mausrad im Firefox funktioniert nun.
  - 3D-Modus: Die 3D-Navigation ??ber den Kompass l??sst sich nun wieder deaktivieren.
  - GFI: F??r sich ??berlagernde WFS- und WMS-Features werden nun die jeweils richtigen Informationen abgerufen.

---

## v2.4.2 - 2019-09-09
### Changed
  - GFI: Links die mit dem Prefix "file" beginnen sind nun klickbar

### Fixed
  - Shadow-Tool: Das Schattentool ist nun mobil nicht mehr verf??gbar
  - QuickHelp: Ein Bug wurde gefixt, der verhindert hat, dass die Bilder ??ber den angegebenen Dateipfad geladen werden
  - Themenbaum: Es wird nun im DefaultTree nach der Suche eines Themas auf den entsprechenden Eintrag gescrollt
  - Searchbar: Ein Fehler wurde behoben der die Hausnummernsuche in der Gazetteer-Suche blockiert hat
  - WFS: Geoserver-WFS werden nun angezeigt

---

## v2.4.1 - 2019-08-23
### Fixed
  - Shadow-Tool: Das Schattentool ist nun nur noch im 3D-Modus verf??gbar
  - Print: Ein Fehler wurde behoben der dazu f??hrte, dass die Beschreibungen der WFS-Features nicht gedruckt wurden
  - LayerTree: Layer mit dem Attribut "styles" werden nun wieder im Themenbaum dargestellt
  - PortalTitle: Attribute zur Konfiguration des Portaltitels sind nun Abw??rtskompatibel

---

## v2.4.0 - 2019-08-21
### Added
  - Dependencies: Die ??bh??ngigkeit "lgv-config" wird nicht mehr ben??tigt, extern geladene Dateien (z.B. "services.json") werden ??ber einen direkten Pfad oder eine URL bezogen
  - Dependencies: Aktualisierung der Versionen diverser Abh??ngigkeiten
  - Basic-Portal: Das Basic-Portal wurde ??berarbeitet und enth??lt nun einen "resources" Ordner mit Beispiel Daten
  - Pre-push-Hook: Code wird beim Pushen vor dem Push mit ES-Lint ??berpr??ft
  - GroupLayer: Es ist nun m??glich, bei Gruppenlayern die Attribute "layerAttribution", "mouseHoverField", "maxScale" und "minScale" zu konfigurieren
  - Shadow-Tool: Im 3D-Modus gibt es jetzt ein Werkzeug zur Darstellung des Schattenwurfes, mit einstellbarem Datum und Uhrzeit-
  - Buildprozess: Es gibt nun einen Buildprozess, der es erm??glicht mehrerer Portale zu bauen

### Deprecated
  - HTML-Container: Id "lgv-container" wurde in "masterportal-container" umbenannt (index.html)
  - config.json: Das Attribut "Baumtyp" wurde in "treeType" umbenannt
  - config.json: Das Attribut "totalview" wurde in "totalView" umbenannt
  - config.json: Das Attribut "overviewmap" wurde in "overviewMap" umbenannt
  - config.json: Das Attribut "backforward" wurde in "backForward" umbenannt
  - config.json: Das Attribut "baselayer" im Control overviewMap wurde in "layerId" umbenannt
  - config.json: Das Attribut "tootip" im portalTitle wurde in "toolTip" umbenannt
  - config.json: Das Attribut "layerslider" wurde in "layerSlider" umbenannt

### Fixed
  - GFI: Beim Klick auf mehrere Features werden nun alle nicht fehlerhaften GFI angezeigt
  - Print: Das Druckmodul wurde verbessert
  - Diverse Bugfixes

---

## v2.3.2 - 2019-06-20
### Added
  - Config: Neuer Config-Parameter "metaDataCatalogueId" in config.js; Metadatenkatalog-URL kann nun gepflegt werden
  - Themenbaum: Neue Datenlayer werden initial immer ??ber allen anderen Datenlayern platziert
  - Themenbaum: Neue Hintergrundlayer werden initial immer ??ber allen anderen Hintergrundlayern platziert
  - Build-Script f??r Portale verbessert

### Fixed
  - Reihenfolge von Layern: Render-Reihenfolge von Layern im Themenbaum sowie auf der Karte war nicht immer korrekt
  - Flurst??cksuche: Bug der Zoomfunktionalit??t bei der Fl??cheninfo behoben

---

## v2.3.1 - 2019-05-08
### Fixed

  - GFI: l??sst sich nun bei ge??ffnetem Filter nutzen
  - GFI: Klick auf Features von externen Diensten funktioniert wieder
  - Suche: Bei Verwendung des Parameters query; bei eindeutigem Suchtreffer direkter Zoom auf Ergebnis
  - Themenbaum: Richtige Reihenfolge der Layer wird beim Ein- und Ausblenden nun beibehalten

---

## v2.3.0 - 2019-04-16
### Added
  - Neues GFI-Theme: "Dauerradz??hlstellen"
  - Neues Control: "Backforward", zum Vor- und Zur??ckspulen des Kartenzustandes
  - JSDOC: teilweise implementiert
  - Suche funktioniert nun bei Cluster-Features und GEOJSON-Layer
  - BKG-Suche: Zoom auf Ergebnis ist nun konfigurierbar
  - OSM-Suche: Erweitert um Parameter "county"
  - Footer: Versionsnummer des Portals ist nun anzeigbar
  - Shadow-Tool: Schatten-Implementierung f??r 3D-View
  - Filter: Optimierung f??r Touch-Table-UI
  - Proxy-Host ist nun konfigurierbar
  - Custom-Modules lassen sich nun mithilfe von Unit-Tests testen
  - GFI zeigt nun Infos zu mehreren Features eines WFS
  - GFI: Hit-Tolerance bei Vektor-Layern konfigurierbar
  - Zeichnen-Modul: Per Remote-Interface steuerbar

### Fixed
 - Diverse Bugfixes


## v2.2.6 - 2019-02-28
### Fixed
  - 184198d7f Cesium wird nun ??ber die index.html geladen

---

## v2.2.5 - 2019-02-25
### Fixed
  - 61eaf2c18 Der Filter zeigt jetzt bei jedem ??ffnen die detailview an

---

## v2.2.4 - 2019-02-20
### Fixed
  - 49cee3555 Die Reihenfolge der Pendleranimationen wird nun beim Drucken korrekt eingehalten
  - a3c1fbcaa Die Darstellung der Symbole beim Verwenden von zoomToFeature kann jetzt ??ber die style_v2.json konfiguriert werden
  - ba18ea631 PLZ und Ort wurden vom Schulwegrouting entfernt
  - e3c3c1fd2 Die Layerreihenfolge wird beim verwenden von Auswahl speichern nun beibehalten

---

## v2.2.3 - 2019-01-31
### Fixed
  - ed565a391 Die Information im Filter werden nun wieder dargestellt. Ein Fehler der das Starten in einer lokalen Entwicklungsumgebung verhindert wurde behoben.
  - 1ef6166db Hinweise im Einwohnertool wurden angepasst

---

## v2.2.2 - 2019-01-21
### Added
  - 4154b06a1 Nun werden auch zu einer Adresse mit dem Adresszusatz "Haus" Schulen im Schulwegrouting gefunden.

### Fixed
  - d28cc48f6 Beim schlie??en des Measuretools werden nicht beendete Zeichnungen nun entfernt.
  - 2ba7934f3 Diverse Fehler im Einwohnertool wurden behoben.
  - 907afb415 Ein Fehler in der Metadatenkopplung wurde behoben.

---

## v2.2.1 - 2018-12-10
### Added
  - f84b1fe74 hotfix Funktion zum bauen der Portale f??r eine Stable Version geht jetzt function for build all portals for new stable version and git ignore new portals

### Fixed
  - d8723bb51 - Schr??gluftbildmodus springt in die richtige Zoomstufe
  - 24d3849f2 Die Videokameras funktionieren jetzt wieder mobil. Die Darstellungsreihenfolge der Attribute im GFI sind nun in allen Browsern gleich
  - 87e208519 der Marker wird im Tool Koordinaten Abfragen jetzt wieder richtig positioniert
  - f84b1fe74 Funktion zum bauen der Portale f??r eine Stable Version geht jetzt add function for build all portals for new stable version and git ignore new portals
  - ff65eab95 Der Titel wird nun beim Drucken richtig dargestellt
  - 8627b6579 Das Them f??r die Radverkehrsz??hls??ulen wird nun wieder richtig dargestellt
  - 7a03233c6 Fehler in der Searchbar wurden behoben

---

## v2.2.0 - 2018-11-29
### Added
  - 8de8d34a5 Darstellung im GFI (WMS) mehrfach vergebener Attribute mit gleichem Namen
  - cb7b25aa2 - 3d Modus inkl. Gel??ndemodell und Geb??ude Layer f??r Hamburg.
  - 9f4a21ad5 import of customModules  to webpack
  - c473c3450 Druckfunktion funktioniert jetzt auch f??r GruppenLayer
  - 207320b8b Glyphicons werden f??r das Men?? und die Tools per Default gesetzt
  - 26abf2c8c initial layer search Merged in SchBe/mplgv-8 (pull request #870)
  - f6800524a Beim Verwenden des Moduls Koordinaten abfragen wird nun beim einfrieren der Koordinate ein MapMarker angezeigt. Dadurch l??sst sich das Tool nun auch mobil verwenden
  - 7e1afecd5 methode um gfi eines spezifischen layers an bestimmter Position zu setzen
  - 162ef6a14 cswParser, all modules that need metadata trigger cswParser
  - 2c1a96bb2 css to less syntax by css2less.net
  - 5fb9ef36b mapfish_print_3 can print user styled wms with sld_body
  - f12c29e9d take the icons from the origin server the app is running on Merged in print_imagepath_from_origin (pull request #840)
  - b9848fcad GFI Support f??r Links auf JPEG und GIF
  - fe634e78c Wechsel des Webbundlers von Browserify auf Webpack. Dieser wird zum installieren des Packages BrowserMqtt.js ben??tigt.
  - 2f8a1d2d0 printModule with Mapfish print 3 and refactor modellist
  - ed84d41df layerslider zum sliden von Layern nach definierbarem Zeitintervall
  - 85eadd186 Dokumentation zur Verwendung vom Tool addWMS
  - c846b7685 Tooltips in Searchbar-Hitlist f??r Themensuche, OSM und BKG damit Eintr??ge unterscheidbar werden
  - 995cf7844 Verwendung von LESS anstatt von CSS im gesamten Repo
  - 7a39ac43e tests for styleable layers
  - 35d2ba452 WMS cache-handling f??r TileWMS eingeschaltet
  - 58f1aa58e layer autorefresh Konfiguration f??r automatischen Refresh gem???? Konfiguration f??r (fast) jeden Layertyp
  - 54e86c51b Konventionen f??r ??nderungen der Konfigurationsparamter
  - 7a5c1fa79 Layerkonfiguration auch als openlayers layerGroup m??glich

### Fixed
  - 93bbf9961 Graph f??r mobile ansichten optimiert Merged in fix_stabel_23_iphone (pull request #981)
  - 9ad3722b5 Schulwegrouting zeigt auch kurze Strecken
  - 4bee2580e Druckmodul kann auch WFS Gruppenlayer drucken
  - 5cab3a42e buttons haben hamburgstyle conforme farben Merged in fix_stable_40 (pull request #980)
  - e9ed46478 KML-importierte Features werden nun wieder in ihrer entsprechenden Farbe dargestellt
  - 523dc353e druckmodul
  - b87a82684 Reihenfolge der Zeichenelemente in der Karte entsprechend Digitalisierreihenfolge
  - 2e874be85 Einwohnertool richtiger Rasterlayer eingebunden Merged in 85_stable_candidate_einwohnertool (pull request #978)
  - 05b399b8d schulwegrouting layer wird nicht mehr an oder ausgeschaltet Merged in 80_stable_candidate_schulwegrouting (pull request #979)
  - ab355672c Fehlermeldung der CompareList wurde f??r kleine Bildschirme angepasst
  - 1eefc9271 Ein Fehler wurden behoben der verhindert hat, dass der Platzhalter (placeholder) f??r die Searchbar aus der config.json geladen wurde.
  - d61460962 fehlender afterRender Trigger im detached unterband videostreaming
  - 07f15af6c Einen Fehler in der Flurst??ckssuche, der verhindert, das die Flur ausgew??hlt werden konnte
  - 8674869d4 searchbar hover on item in recommended list zooms to result
  - cdd02d1d6 ein Fehler der das aufziehen eines Kreises im Einwohnertool verhindert hat wurde behoben
  - 8f608bb27 ein Fehler in der Liste, der das Icon beim hovern verschwinden l??sst, wurde behoben
  - 1164b9f23 Auswahl speichern schlie??t jetzt andere Tools vollst??ndig
  - 517cd9635 print circle geometries printable
  - b565b14f4 Print polygon styles in legend
  - a77e23d8f Labels werden custom Featurestyles jetzt zentriert angezeigt
  - 9f651d311 Sidebar wurde nicht mehr in mobiler Darstellung ausgespielt
  - b9e5efa82 Feature bekommt im Zeichenmodul korrekten Style zugewiesen
  - 1d78053d5 Graph-Modul ??berarbeitet und Diagramm Darstellung vereinheitlicht
  - 94211b475 uiStyle in GFI-Model wegen Ladereihenfolge nicht vorhanden
  - f4dc4fe12 webpack rules for dev and prod
  - e796997b6 print feature with multiple styles
  - 0f4f3eee5 pendler can be printed with new print module
  - 7d068a884 drawModule eventlistener and refactor buttonhandling
  - 603f90a51 metadata can also be requested from internet explorer
  - a307af473 styleWMS classifications are removed on change attribute or change number of classes update mrh stylewms
  - 4af961cbc update neues Filtermodul funktioniert jetzt auch mit dem customTree und GroupLayer; WFS Styles innerhalb eines GroupLayers
  - 7f63674c2 download circlegeometries
  - c31caaa39 tests for parser
  - 969f945e0 drawCursor stays at mouse-position on move
  - 6a249b664 Glyphicons werden jetzt direkt aus Bootstrap geladen
  - 9aaa67ef4 Pfad zu zum Styling
  - b61d1a55c das Tool zur Koordinatenabfrage zeigt nun in der mobilen Version einen Marker
  - ef521974a print canvas gets removed on closed print module
  - e16fb4a1d missing bootstrap tooltip
  - b9283eb6a kein Flurst??cksHighlighting bei gfi detached im flaecheninfo
  - 720ac7a8e pendler lines have correct text style
  - 767ab71a9 layerslider funktionierte nicht mit treetype=custom
  - 79583f9e8 Die Reihenfolge der aktiven Layer im CustomTree entspricht nun der des Themenbaumes
  - b9437ecf1 Ein Fehler wurde behoben der durch Konfiguration eines Custom-Stylings auftrat, wenn kein Alpha-Wert (Opazit??t bzw. Transparenz) angegeben wurde
  - f9f7ee677 renderToDOM parcelSearch und searchbar ohne Funktion
  - 3a2743278 Ein Fehler wurde behoben der verhindert hat, dass bei einigen Layern das GFI nicht mehr funktionierte, wenn bestimmte Layer aktiviert waren
  - 91f9578ff Fehler wurden behoben, durch die keine Schulen im Schulwegrouting zu einer gefundenen Adresse in den Browsern Internet Explorer und Edge angezeigt wurden
  - 9c54d7a48 Ein Fehler wurde behoben, der die Definition eines Legenden-Images f??r den GeoJSON-Layer verhindert hat
  - 9c934ac04 Routingmodul wertete BKG-Adressabfragen wegen fehlendem Proxyeintrag nicht aus
  - f79a18470 autostart ??ber URL funktioniert nicht wegen ver??nderter Ladereihenfolge
  - 5a61d5b3f Standardpfad f??r Glyphicons variabel gemacht um Entwicklungs- und Produktionsumgebung abzubilden
  - ca1367822 Measure Modul zeigte falsche Einheiten f??r Strecke
  - a38bd35a0 bei Auswahl eines neuen Tools bei minimiertem Routing konnte Routing nicht beendet werden
  - 24022ae1b missing glyphicons weil less path auf falschen Ordner zeigt
  - 3de99be7d switch zw desktop und mobile menu f??hrte zu error in console
  - c81273418 scaleline ohne footer wirft Fehler in console
  - 331b67b78 grouplayer wurden in parametrisierten Aufrufen wegen unklarer id ignoriert
  - 8d2349b40 Beim navigieren mit den Pfeiltasten in der Suche springt der Cursor nun immer ans Ende der Eingabe
  - e3094b642 Die Version zum Laden der Legende eines WMS wird jetzt aus der services.json verwendet
  - 409a65c02 Fehler im KML Import der nach erneutem Export auftrat
  - 6fe334a4f parcelSearch flur getter
  - ee0793d51 metaidtomerge nicht alle objekte wurden gruppiert

---

## v2.1.3 - 2018-09-21
### Fixed
  - 48b55e8f8 Fehler wurden behoben, durch die keine Schulen im Schulwegrouting zu einer gefundenen Adresse in den Browsern Internet Explorer und Edge angezeigt wurden
  - 62e9c8da0 Schulen mit dem gleichen Namen im Schulwegrouting k??nnen nun durch die Anzeige der Adresse unterschieden werden
  - 8dd4f82b5 Ein Fehler in der Nomatim-Suche (OSM), durch den einige Suchergebnisse nicht angezeigt worden sind, wurde behoben

---

## v2.1.2 - 2018-09-05
### Fixed
  - 688f637b Es wurde ein Problem im Schulwegrouting behoben, welches den Aufruf einiger Adressen verhinderte. Das GFI wird beim wechseln der Schule oder Adresse im Schulwegrouting nun automatisch geschlossen.

---

## v2.1.1 - 2018-08-14
### Fixed
  - a2bce8dc metaidtomerge nicht alle objekte wurden gruppiert
  - 3ec4b257 parcelSearch view getter entfernt, wms crossOrigiin entfernt, wfsfeaturefilter feature ??bergeben bei defaultStyle und marker und zoomlevel bei suche nach Schulstandorten

---

## v2.1.0 - 2018-08-07
### Added
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
  - cc21bf2a Werkzeug-Button f??r table - Men??
  - 9d090108 menutemplate for table
  - 595af610 parameter for table ui

### Fixed
  - f1147895 Videostreaming mobil wurde nicht mit HLS sondern Flash gestreamt
  - 714df6f7 bkg query neuenfelder stra??e
  - 77bee217 mapMarker view Fehler bei Layer sichtbar schalten ??ber searchbar
  - e1d8d303 table theme height zu schmal bei vielen Eintr??gen
  - c985d399 initiale Suche nach Stra??e + Hausnummer ??ber query Parameter schlug fehl
  - 0e4851cf im IE wird beim schalten in den fullScreen-Mode ein wei??er Rand angezeigt
  - 5b2c7718 sinnvolle default Koordinatensysteme f??r Hamburg
  - 0c14730a Dipas 99 bug query
  - 6f8defe3 update merge dev, merge conflicts
  - 4e82ca43 mapSize mit Menu falsch berechnet was zu falscher Koordinatenangabe f??hrte
  - b292e9bb mapheight on resize
  - 25fd5fdf UrlParams funktionieren nicht mehr
  - 0fdfd56b Flurst??ckssuche l??scht default Flurst??cksnenner beim Wechsel der Gemarkung bei parcelDenominator = true
  - 63fbbbd4 Flash-Videostream im Chrome konnnte nicht abgespielt werden
  - dd8e5d30 contact tests wenn keine portalconfig geladen wird
  - 2f9102eb betrieb contact configjson new portaltitleObject
  - 8db97eed filter dropdown css overflow-y hinzugef??gt

---

## v2.0.4 - 2018-06-20
### Fixed
  - c128bf6f template layerinformation legendurl
  - a6d8b6e5 bootstrap-select Version auf 1.12 beschr??nken, weil 1.13 noch buggy

---

## v2.0.3 - 2018-05-09
### Fixed
  - 817a2f0 bkg search triggers searchbar to render recommended list
  - 69342d6 Flurst??ckssuche l??scht default Flurst??cksnenner beim Wechsel der Gemarkung bei parcelDenominator = true

---

## v2.0.2 - 2018-04-17
### Fixed
  - 8ddf9ebd contact tests wenn keine portalconfig geladen wird
  - f774a5c1 contact an neues object in config.json angepasst
  - 85083af4 filter dropdown css overflow-y hinzugef??gt

---

## v2.0.1 - 2018-04-05
### Fixed
  - b8bae19dd Theme Radverkehrsstellen falsche Sortierung bei Wochenansicht
  - d7ff9768d Theme Radverkehrsstellen falsche Sortierung bei Tagesansicht

---

## v2.0.0 - 2018-03-29
### Added
  - f4f34f02e Totalview Button (switch auf default-Ansicht)
  - 63679a50a fehlende dokus erg??nzt
  - dd56e0885 multipoint Layer
  - a338b9339 GFI-Theme f??r radverkehr mit Diagram

### Fixed
  - 31b061f5e attributions glyph passt sich an wenn ovm versteckt
  - 2cd457956 diverse Bugs, die beim Testen mit FF aufgefallen sind
  - 3b32ea5ed overviewmap in mastertree wirft console Fehler
  - 1bf49caca diverse Bugs, die beim Testen mit IE aufgefallen sind
  - 2714554c3 search durch regexp ersetzt f??r ??berpr??fung auf Dateiendungen
  - d6627f8f1 jumping Window unter Firefox und IE behoben
  - c3320fbb0 max- und minScale werteten keine scientificNotation aus
  - ad6b53dfb 183 diverse Bugfixes
  - 190e0f7f7 Themes mit default extenden Parameter nicht von superclass
  - 4581bf54b auswahl speichern light tree
  - b20699dae falsches Theme in list ausgew??hlt
  - ea8ecb2c2 nach Auswahl einer Adresse wird name nicht in searchbar ??bernommen
  - 4ed4fcdbe nach Auswahl einer Adresse wird name nicht in searchbar ??bernommen
  - d7706e58c configYAML wurde nicht aus config.json ausgelesen
  - da18c6567 Util.getPath Error

---

# v1.5.2 - 2018-03-12
### Fixed
  - 798923ae betrieb 647 contact cc array mehrmaliges Absenden lie?? array volllaufen
  - 5b6d8e01 betrieb 238 metaIdToMerge fehlerunanf??lliger
  - 70e08d3e light tree auswahl speichern
  - 03317d46 wfs legendURL Parameter aus json in Legende nutzbar

---

## v1.5.1 - 2018-01-17
### Fixed
  - c39c1122 falsche reihenfolge des mapView Parameters zoomlevel f??hrte zu Laufzeitfehler
  - 1815d4f9 nach Auswahl einer Adresse wird name nicht in searchbar ??bernommen
  - 615635b7 configYAML

---

## v1.5.0 - 2017-12-13
### Added
  - 9a74933 end2end-test-infrastruktur
  - ee4dd43 overviewmap als control
  - 8279f7f Merge branch '81_add_removeFilter' into 80_suche_nach_schulnamen reset Filter on Search

### Fixed
  - f789319 hotfixes kw 45 fix csw Parameter aus config.js Pfad angepasst, legende zeichnet sich nicht ??ber Tabelle von fluechtlingsunterkuenfte, verkehrsstaerken Theme Pfad zu Datei angepasst ohne Datum
  - ca4cd86 gfi-detached opens initially on right side
  - 6f0c43f Adresssuche in der Searchbar f??hrte zum F??llen der Suggestliste vom viomRouting
  - 8bc2a82 WMS-Adresse f??r Bezirkslayer wurde nicht angezeigt, weil id nicht in RawLayerList gefunden werden konnte
  - 92849aa drawmodulstyle
  - f029a7b gfi always on
  - 3786af7 Scrollleiste in Themenbaum light
  - cf931a1 fix UrlParams zoomlevel und Center fix Canvas wird defaultm????ig nicht erzeugt fix UrlParam featureId ??ber LayerIds Parameter StartupModul behalten

---

## v1.4.8 - 2017-12-13
### Fixed
  - c54708ef sgvonline theme attr amtliche adresse immer nein

---

## v1.4.7 - 2017-11-20
### Fixed
  - d1db2bd fix csw Parameter aus config.js Pfad angepasst
  - 340700f fix legende zeichnet sich nicht ??ber Tabelle von fluechtlingsunterkuenfte

---

# v1.4.6 - 2017-10-27
### Fixed
  - 1a7337a Drucken mit GFI

---

## v1.4.5 - 2017-10-18
### Fixed
  - b033e0e gfi mobil rendert sich auf volle breite Merged in hotfix_gif_mobil (pull request #567)
  - d176616 gfi initial links im ie

---

## v1.4.4 - 2017-10-12
### Fixed
  - d1766166 gfi initial links im ie

---

## v1.4.3 - 2017-10-12
- Keine Eintr??ge

---

## v1.4.2 - 2017-10-10
- Keine Eintr??ge

---

## v1.4.1 - 2017-10-06
### Fixed
  - 427a269 Adresssuche in der Searchbar f??hrte zum F??llen der Suggestliste vom viomRouting
  - 73114e6 WMS-Adresse f??r Bezirkslayer wurde nicht angezeigt, weil id nicht in RawLayerList gefunden werden konnte

---

## v1.4.0 - 2017-09-18
### Added
  - 35ae3ff 1.Version Features-Filter
  - 1b9ed32 epsg code in wfs-request erg??nzt

### Fixed
  - 118a569 ??nderung der Layerreihenfolge wurde im Tree nicht umgesetzt
  - f36cf06 wenn android tastatur aufpoppt wurde window vom footer geteilt und eine Eingabe war nur schlecht m??glich
  - 442ef1a im IE wird bei abfragen der Layerinformationen ein Fehler geworfen, wenn keine Layerattribute definiert sind.
  - 03d2ac1 wurde in der navbar gescrollt, scrollte auch #map, weil die navbar relativ positioniert war
  - a15def9 drawmodul style
  - c9e0aa8 Titelzeile wird zweizeilig weil render nicht bei switch mobile<->desktop erneut ausgef??hrt wurde
  - 0fdc72a beim Entfernen eines Layers in non-simple-tree wurde falscher IDX-Layer entfernt, wodurch andere Layer nicht mehr unvisible/visible geswitched werden konnten
  - ad30a70 klick auf Men?? wirft Fehler in console, weil models[0] war undefined
  - 47ebe3c gfi always on
  - 5bdf0ff Koordinatensuche nach WGS84 (mit Dezimalgrad) funktioniert nicht, wegen parseFloat Problem
  - d046d4e WFS mit png wird nicht mehr geladen
  - 0b357de Scrollleiste in Themenbaum light
  - f7c15bc fix UrlParams zoomlevel und Center fix Canvas wird defaultm????ig nicht erzeugt fix UrlParam featureId ??ber LayerIds Parameter StartupModul behalten
  - 4fd80fa Bild wird im GFI als Bild und als Link angezeigt, soll nur Bild sein
  - 7d36d03 AutostartModul beendet sich nach einmaligem vollst??ndigem Startvorgang selbst
  - 9b9ddb3 272 LegendeSwitch
  - 1e23b31 271 param
  - fc87c13 mapview-options aus config werden nicht ??bernommen
  - 3fdd4f6 keine Koppelung der LegendURL mit Dowmload im Layerinfo Fenster
  - 71dc8f4 multipoint mousehover position
  - 37c3ad0 schlie??e GFI nach Adresssuche-hit
  - 8f5f06d kml ie punkte linien und polygone
  - 326bad7 lighttree laeuft ueber
  - 9cd072c safari drucken
  - a3c4633 mrh drucken
  - ed8b4c6 layerinfos gruppenlayer unvollstaendig

---

## v1.3.3 - 2017-08-16
- Keine Eintr??ge

---

## v1.3.2 - 2017-06-21
### Fixed
  - d7d98f21 mrh print ben??tigt _print f??r speziellen proxy

---

## v1.3.1 - 2017-06-06
- Keine Eintr??ge

---

## v1.3.0 - 2017-05-31
### Added
  - 798a35e gfi-theme f??r sgv-online
  - 81bb340 Anwender-Dokumentation
  - 6907236 modul autostarter, um Tools per Parameter STARTUPMODUL starten zu k??nnen
  - ac54221 Merge branch 'dev' into RemoteInterface + EPSG definitions for masterTree && FHH Atlas

### Fixed
  - d735d0c Ung??ltiger Wert f??r Flurst??cksnummer wird bei der Eingabe abgefangen.
  - 3c94d2f portaltitel geoportal-verkehr springt nicht mehr in zweite zeile
  - 7b14c38 - Animation Tool wirft beim Schlie??en einen Fehler
  - ff9d07c routing url ??ber proxy leiten
  - ed6a75e tree layer ??ber config.json sichtbar werden bei paramAufruf layerids visibility false
  - e0424bd urlparameter layerids, visibility & transparency werden nicht in Karte ??bernommen
  - 987da2f urlparameter bezirk funktioniert nicht
  - 89f3080 mergeconflict
  - 13468d7 Drucken von Gruppenlayern kann zu Problemen f??hren
  - 70d0bf5 wfs esri polygon
  - c3cca96 drucken gfi marker und linter fehler
  - b8e64dd group Layer funktionierte nicht mehr
  - c6ecb1f orientation module auch auf localhost anbieten.
  - 22591c1 Fehler in console, wenn keine MetadatenId zum Layer vorhanden ist
  - e84c5fa flurstuecksnummernenner
  - 7f01ca8 Lokalisierungs-Button ist ausgegraut, falls die Funktion deaktiviert ist
  - c3c98d0 wird das Portal ??ber https aufgerufen, funktioniert die Lokalisierung in allen Browsern
  - 0d2c861 printError mit neuem GFI Modul
  - e8286a8 routing
  - 0b65b2f Portal wird nicht geladen, wenn LayerID in JSON nicht definiert
  - 8d721c8 Layerinformationen von Hintergrundlayern wurden  nicht angezeigt und Title war nicht Datensatzname
  - 3da16b7 GFI wird beim drucken immer mit ausgegeben, auch wenn GFI wieder geschlossen
  - 22811e5 Fehler beim Suchen von Baselayern in Suchschlitz behoben

---

## v1.2.4 - 2017-02-07
### Fixed
  - 760c7c1 hotfix 332 flurstueckssuche

---

## v1.2.3 - 2017-01-30
### Fixed
  - 3b2e44b layerid URL-parameter werden zugeladen falls vorhanden aber nicht konfiguriert

---

## v1.2.2 - 2017-01-24
### Fixed
  - ce3e3ae7 gfipopup gr????e ver??ndert sich nicht durch verschieben vom popup
  - ccd07347 viomrouting
  - 8f6aca60 Portal wird nicht geladen, wenn LayerID in JSON nicht definiert
  - c8be5d5d Layerinformationen von Hintergrundlayern wurden nicht angezeigt und Title war nicht Datensatzname

---

## v1.2.1 - 2017-01-06
### Fixed
  - 00917df Portal-Titel wurde in "kleinen" Themenportalen initial nicht angezeigt

---

# v1.2.0 - 2016-12-16
### Added
  - c1ad7b6 Bei der Animation wird auf die Gemeinde gezoomt und ein Marker auf der karte gesetzt
  - 0932b5d Legende f??r Pendler-Animation in der Werkzeug-Oberfl??che implementiert
  - f8d8e61 Unterst??tzung von setElement() f??r parcelSearch
  - 0551722 GFIs k??nnen in Tabellenform dargestellt werden
  - 97517de Bei der Animation werden dei Punkte anh??ngig von Pendlerdanzahl und Landkreis dargestellt
  - 90be2d3 Themenbaum kann in kleinen Themenportalen initial aufgeklappt werden

### Fixed
  - d466fb5 keinStartupModul in URL m??glich
  - d32423e KML Import Problem im Internet-Explorer
  - b44b62c l??nge Portaltitel - Die L??nge des Portaltitels passt sich an verf??gbaren Platz in der Men??leiste an
  - e903ba5 lighttree Sortierung - In kleinen Themenportalen entsprach die Reihenfolge im Themenbaum nicht der Reihenfolge auf der Karte
  - 9522f0c Messen Label - Durch das Ver??ndern der Einheit beim Messen (km/km?? in m/m?? und umgekehrt), wurde der Messwert der zuletzt gezeichneten Strecke/Fl??che entsprechenden umgerechnet
  - ef49ad2 mobile Legende - Beim Wechsel der Anwendungssicht (desktop <=> mobil) wurde die Legende nicht mehr angezeigt.
  - fb24d98 werden Layer im Portal parametrisiert aufgerufen, wurden die entsprechenden Layer zwar im Baum selektiert, aber nicht auf der Karte angezeigt
  - 3d9a209 im IE wurde GFI wegen Overflow-y (css) nicht korrekt dargestellt.
  - ac48f29 BackgroundSwitch-Button nur sichtbar, wenn auch konfiguriert
  - b945614 Mobil wurde das Routingmodul nicht initial geladen.
  - de4a32e fix quickhelp Fehler in console und quickhelp-Button neben searchbar wurde nicht angezeigt
  - 7eadc7f verkehrsfunction Util Fehler
  - 893c2c6 Quickhelp wird in einem starren Fenster gerendered
  - 95ff542 Breite des GFI-Popup von 50% auf 25% der Bildschirmh??lfte gesetzt
  - 1f2f810 Beim Messen wird wieder das Tooltip angezeigt
  - f90f787 Suche springt w??hrend des Tippens nicht mehr automatisch auf eine gefundene Adresse oder Thema
  - ea888a8 hintergrundkarten werden bei themensuche immer eingeklappt, auch wenn sie ausgeklappt waren
  - 4b135db controls in config.json werden auch auf true/false gepr??ft
  - 32f0022 Routenplaner verwendet den richtigen Routing-Dienst
  - b6ea8d3 "in meiner N??he" - Attribute nicht mehr doppelt
  - b12c6d5 portallogo configurierbar

---

##  v1.1.6 - No Data
### Fixed
  - 97ad0aa csw falsches Datum ausgelesen, da erneut ??ber ganze csw Datei gesucht wurde
  - 59fae85 Parameter &LAYERIDS in URL wurden nicht mit SimpleTree ausgewertet. &CLICKCOUNTER jetzt ??berfl??ssig.

---

# v1.1.5 - 2016-11-15
### Fixed
  - 658d016 startcenter wurde nicht ausgelesen aus config.json

---

# v1.1.4 - 2016-10-27
### Fixed
  - 11e3138 Die Reihenfolge der Themen auf der Karte entsprach nicht immer der korrekten Reihenfolge der Themen in der Auswahl

---

## v1.1.3 - 2016-10-26
### Fixed
  - c05d205 Zeichnungen werden nicht gedruckt

---

## v1.1.2 - 2016-10-24
### Fixed
  - a27eb17 gfi Attribute werden nur noch nach Datum formatiert wenn sie ISO 8601 entsprechen

---

# v1.1.1 - 2016-10-20
### Fixed
  - b759d17 Auswahl speichern - Beim ??ffnen einer gespeicherten Auswahl wurden immer alle Layer auf der Karte angezeigt, unabh??ngig davon ob der Layer sichtbar war oder nicht.

---

## v1.1.0 - 2016-10-18
### Added
  - 32964b6 Style WMS - Layer k??nnen jetzt im Client neu gestylt werden. Vorl??ufige Einschr??nkung: Nur mit Fl??chengeometrien im Zusammenspiel mit SLD v1.0.0 m??glich
  - 6f0dff6 kml import tool zugef??gt
  - d448742 Navigation f??r mobile Endgeraete bzw. fuer Bildschirmbreiten bis zu 768px komplett ueberarbeitet (Design und Usability)
  - 2b8bb1b custom js f??r bauinfo

### Fixed
  - 06935f3 Legende wird im Infofenster erst angezeigt wenn der Layer sichtbar ist
  - df8d671 Measure- und Zeichenlayer immer an oberster Stelle
  - 9639ab9 maxscale initial ignoriert
  - 698594f WFS-Layer k??nnen verschiedene Styles zugewiesen werden
  - 582de4c Searchbar springt nicht mehr aus der Men??leiste
  - 7e3d0fe Searchbar springt nicht mehr aus der Menueleiste
  - 176d2bf GFI Abfrage funktioniert jetzt auch bei extern hinzugef??gten WMS-Layern
  - 07aeee9 Das Kontaktformular wird direkt bei der Texteingabe validiert.
  - bb1fb95 initiale Strassensuche auch mit " " und "-" m??glich
  - baf3f4e Lokalisierung in Chrome ist nur noch von HTTPS m??glich
  - ffc0bcc drucken von KML-Features m??glich
  - 4304704 GFI-Reihenfolge wird in der richtigen Reihenfolge dargestellt
  - faa9133 GFIPopup hat eine maximale H??he in Relation zur Fensterh??he

---

## v1.0.6 - 2015-03-18
- Keine Eintr??ge

---

## v1.0.5 - 2015-03-12
- Keine Eintr??ge

---

## v1.0.4 - 2015-03-06
- Keine Eintr??ge

---

## v1.0.3 - 2015-02-29
- Keine Eintr??ge

---
