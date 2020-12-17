>Zurück zur **[Dokumentation Masterportal](doc.md)**.

>Click here to view the english translation of this document: [sensorThings_EN.md](sensorThings_EN.md).

[TOC]


# Masterportal - Sensor Layer #
Im Folgenden wird das auf der SensorThingsAPI basierende Sensor-Layer des Masterportals beschrieben.


## Begriffsklärungen ##


### OGC SensorThings API ###
Die Open Geospatial Consortium (OGC) SensorThingsAPI stellt ein Framework für geographische Daten im Open-Standard zur Verfügung.
Die SensorThingsAPI ermöglicht die Vernetzung von Geräten, Daten und Applikationen im IoT (Internet of Things).

> "[The SensorThingsAPI] provides an open standard-based and geospatial-enabled framework to interconnect the Internet of Things devices, data, and applications over the Web." ([Quelle](https://docs.opengeospatial.org/is/15-078r6/15-078r6.html#6))

Das Framework beinhaltet ein Datenmodel das die Verbindung zwischen dem sog. "Broker" (der Server) und einem Netz aus sog. Publishern (Sensoren) und sog. Clients (z.B. das Masterportal im Browser) abbildet.

Unter folgenden Links gibt es mehr hilfreiche Informationen über die SensorThingsAPI:

 - [https://docs.opengeospatial.org/is/15-078r6/15-078r6.html#1](https://docs.opengeospatial.org/is/15-078r6/15-078r6.html#1)
 - [http://developers.sensorup.com/docs/](http://developers.sensorup.com/docs/)
 - [https://gost1.docs.apiary.io/#reference/0/things](https://gost1.docs.apiary.io/#reference/0/things)

Hier ein Direktlink zum Datenmodel:

 - [http://docs.opengeospatial.org/is/15-078r6/15-078r6.html#24](http://docs.opengeospatial.org/is/15-078r6/15-078r6.html#24)


### FROST Server ###
Der FROST Server wird vom Fraunhofer-Institut entwickelt. Der FROST Server ist die serverseitige Implementierung der SensorThingsAPI.

> "[It is] a Server implementation of the OGC SensorThings API." ([Quelle](https://github.com/FraunhoferIOSB/FROST-Server))

Der FROST Server ist der Broker zwischen dem Publisher (Sensor) und dem Client (Masterportal bzw. Browser).
Der FROST Server kann klassisch per http auf seiner REST Schnittstelle aufgerufen werden und bidirektional per mqtt oder CoAP.


### Die REST API - http ###
Die zum Abonnieren benötigten IDs der Things erhält man am besten mithilfe eines initialen http-Aufrufes an die REST Schnittstelle.

*Wichtig: Nur auf http-Basis lassen sich die expand- und filter-Funktionen der REST-Schnittstelle nutzen.
Ein Abonnement lässt sich nur über das mqtt Protokoll und nur mit einem reinen Pfad (keine Querys) abschließen. Queries (also alles in der URL nach dem "?") wird ignoriert.*

Hier einige Beispiele für den Abruf von Daten über die REST Schnittstelle:

 - Übersicht: [https://iot.hamburg.de/](https://iot.hamburg.de/)
 - alle Things der SensorThingsAPI: [https://iot.hamburg.de/v1.0/Things](https://iot.hamburg.de/v1.0/Things)
 - ein Thing der SensorThingsAPI: [https://iot.hamburg.de/v1.0/Things(26)](https://iot.hamburg.de/v1.0/Things(26))
 - ein Datastream: [https://iot.hamburg.de/v1.0/Datastreams(74)](https://iot.hamburg.de/v1.0/Datastreams(74))
 - alle Datastreams eines Things: [https://iot.hamburg.de/v1.0/Things(26)/Datastreams](https://iot.hamburg.de/v1.0/Things(26)/Datastreams)
 - alle Observations eines Datastreams: [https://iot.hamburg.de/v1.0/Datastreams(74)/Observations](https://iot.hamburg.de/v1.0/Datastreams(74)/Observations)

Der FROST Server hat mit seiner REST Schnittstelle expand- und filter-Funktionen implementiert, die an eine SQL-Syntax erinnern und sich ähnlich benutzen lassen.
Um z.B. zwei Tabellen miteinander zu verknüpfen, wird der $expand-Parameter verwendet. Um weitere Tabellen zu joinen können diese kommasepariert aufgelistet werden.

 - ein Thing mit seiner Location: [https://iot.hamburg.de/v1.0/Things(26)?$expand=Locations](https://iot.hamburg.de/v1.0/Things(26)?$expand=Locations)
 - ein Thing mit seiner Location und Observation (bitte beachten Sie, dass Observations in Relation zum Datastream steht - nicht in direkter Relation zum Thing): [https://iot.hamburg.de/v1.0/Things(26)?$expand=Locations,Datastreams/Observations](https://iot.hamburg.de/v1.0/Things(26)?$expand=Locations,Datastreams/Observations)

Um nach Things zu filtern - ohne eine eindeutige ID zu verwenden - kann der $filter Parameter verwendet werden.

 - finde ein Thing anhand seines Names mit $filter=name eq '...': [https://iot.hamburg.de/v1.0/Things?$filter=name%20eq%20%27StadtRad-Station%20Grandweg%20/%20Veilchenweg%27](https://iot.hamburg.de/v1.0/Things?$filter=name%20eq%20%27StadtRad-Station%20Grandweg%20/%20Veilchenweg%27)

Mit $orderby lassen sich Things sortieren. Um z.B. an die neuest Observation zu kommen, muss die Observations-Liste absteigend nach Datum sortiert und mit $top=1 der erste Datensatz dem Ergebnis entnommen werden.

 - sortiere Observations nach Datum und nimm den ersten Datensatz mit $orderby=phenomenonTime desc&$top=1: [https://iot.hamburg.de/v1.0/Datastreams(74)/Observations?$orderby=phenomenonTime%20desc&$top=1](https://iot.hamburg.de/v1.0/Datastreams(74)/Observations?$orderby=phenomenonTime%20desc&$top=1)

Sie können auch verschachtelte Statements verwenden:

 - [http://iot.hamburg.de/v1.0/Things(614)?$expand=Datastreams($expand=Observations),Locations](http://iot.hamburg.de/v1.0/Things(614)?$expand=Datastreams($expand=Observations),Locations)

Um Things innerhalb eines Karten-Bereiches (z.B. dem aktuellen Browser-Ausschnitt) abzurufen, kann der relevante Bereich als POLYGON übergeben werden.

 - [https://iot.hamburg.de/v1.0/Things?$filter=startswith(Things/name,%27StadtRad-Station%27)%20and%20st_within(Locations/location,geography%27POLYGON%20((10.0270%2053.5695,10.0370%2053.5695,10.0370%2053.5795,10.0270%2053.5795,10.0270%2053.5695))%27)&$expand=Locations](https://iot.hamburg.de/v1.0/Things?$filter=startswith(Things/name,%27StadtRad-Station%27)%20and%20st_within(Locations/location,geography%27POLYGON%20((10.0270%2053.5695,10.0370%2053.5695,10.0370%2053.5795,10.0270%2053.5795,10.0270%2053.5695))%27)&$expand=Locations)

Im Detail:

 - https://iot.hamburg.de/v1.0/Things?
 - $filter=
   - startswith(Things/name,'StadtRad-Station')
   - and st_within(
     - Locations/location,geograph'POLYGON ((
       - 10.0270 53.5695,
       - 10.0370 53.5695,
       - 10.0370 53.5795,
       - 10.0270 53.5795,
       - 10.0270 53.5695
     - ))'
   - )
 - &$expand=Locations

Die Antwort vom Server enthält nur die Things, deren Location innerhalb des gewünschten POLYGON liegt.
Ruft man initial nur den relevanten Bereich vom Server ab, kann sich dies positiv auf die Geschwindigkeit auswirken - zumal man im zweiten Schritt dann auch nur die Things abonnieren könnte, die im aktuellen Browser-Fenster liegen.



### Die REST API - mqtt ###
Das mqtt Protokoll wurde für das Intenet of Things (IoT) entwickelt.
Es hält eine bidirektionale Verbindung zum Server offen und kommuniziert über pull- und push-Nachrichten.
Die meisten Browser-Implementierungen nutzen unter dem mqtt Protokoll socket.io, da Browser direktes mqtt normalerweise nicht können.
Das mqtt-Paket von npm ist ein gutes Beispiel für eine solche Implementierung.

Mithilfe des mqtt Protokolls abonniert der Client (Browser) ein Topic (Thema).
Ein Topic verweist mithilfe eines REST Pfads auf eine Entität (die Tabellen aus dem Daten-Model), über deren Änderung informiert werden soll (z.B. "v1.0/Datastreams(74)/Observations").
*Hinweis: Der host wird beim Connect mit mqtt übergeben und wird aus dem Topic immer weggelassen.*

Ist eine solches Topic über mqtt abonniert worden, pushed der Broker alle Änderungen an der dahinter liegenden Tabelle an den Client.
Alle Entitäten (Tabellen des Daten-Models) können abonniert und deabonniert werden.
Da mqtt nur auf das Abonnieren und Deabonnieren ausgelegt ist, müssen alle anderen Aktionen (z.B. Initiales Abfragen relevanter IDs) über http abgewickelt werden.

Wie bereits erwähnt, sind Topics reine REST Pfade ohne Query. Beispiel:

 - dies kann man abonnieren: mqtt://iot.hamburg.de/v1.0/Datastreams(74)/Observations
 - dies kann man nicht abonnieren: mqtt://iot.hamburg.de/v1.0/Datastreams(74)?$expand=Observations

Aktuelle mqtt Versionen:

 - mqtt v3.1:   [http://public.dhe.ibm.com/software/dw/webservices/ws-mqtt/mqtt-v3r1.html](http://public.dhe.ibm.com/software/dw/webservices/ws-mqtt/mqtt-v3r1.html)
 - mqtt v3.1.1: [https://docs.oasis-open.org/mqtt/mqtt/v3.1.1/mqtt-v3.1.1.html](https://docs.oasis-open.org/mqtt/mqtt/v3.1.1/mqtt-v3.1.1.html)
 - mqtt v5.0:   [https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html)







## SensorThingsHttp ##
Die SensorThingsAPI sieht ein automatisches Splitten von zu großen Server-Antworten vor.
Bietet der Broker (Server) diese Funktion an, kann sie u.a. dafür genutzt werden den aktuellen Fortschritt (Progress) des Aufrufes in der UI darzustellen (siehe [Automatisches Splitten](#markdown-header-automatisches-splitten)).
Die Antwort des Servers kann zusätzlich auf einen bestimmten Karten-Ausschnitt (z.B. der Extent des Browsers) eingegrenzt werden. Hierdurch wird die Last auf der Datenbank und die Server-Antwort kleiner (siehe [Automatischer Aufruf im Karten-Ausschnitt](#markdown-header-automatischer-aufruf-im-karten-ausschnitt)).

Für das Masterportal haben wir eine Software-Schicht *SensorThingsHttp* implementiert, die den Aufruf im Extent des Browsers und das Splitting für Sie übernimmt.

*Hinweis: Bitte beachten Sie, dass das Splitten der Antwort und der Abruf des aktuellen Karten-Ausschnittes nur verfügbar ist, wenn Ihr Server (z.B. FROST Server) entsprechend aufgesetzt ist.*


### Automatisches Splitten ###
Vorrausgesetzt wird, dass Ihr Server das Splitten von Antworten wie es mit der SensorThingsAPI möglich ist korrekt anwendet.

Antworten die zu groß sind, werden vom Server automatisch in mehrere Teile aufgeteilt. Nur der erste Teil wird Ihnen übermittelt.
Alle weiteren Teile werden nicht übermittelt. Die Antwort enthält immer einen Skip-Link ("@iot.nextLink"), unter dem der jeweils nächste Teil abrufbar ist.
Um die Gesamtzahl aller möglichen Datensätze der Anfrage zu ermitteln, kann das Feld "@iot.count" ausgewertet werden.
Wenn Sie die Software-Schicht *SensorThingsHttp* benutzen, werden die gesplitteten Antworten vom Server automatisch korrekt behandelt.

 - Zur Verwendung von "@iot.nextLink" - siehe [Auswertung von "@iot.nextLink"](#markdown-header-auswertung-von-iotnextLink).
 - Zur Verwendung von "@iot.count" - siehe [Aufruf mit "@iot.count"](#markdown-header-aufruf-mit-iotcount).

Es folgt ein Implementierungs-Beispiel von *SensorThingsHttp*. Zur Veranschaulichung werden ein paar zusätzliche Events des Masterportals verwendet:

```
#!javascript

import {SensorThingsHttp} from "@modules/core/modelList/layer/sensorThingsHttp";

const http = new SensorThingsHttp(),
    url = "https://iot.hamburg.de/v1.0/Things";

http.get(url, function (response) {
    // onsuccess
    // do something with the total response
}, function () {
    // onstart
    Radio.trigger("Util", "showLoader");
}, function () {
    // oncomplete (always called)
    Radio.trigger("Util", "hideLoader");
}, function (error) {
    // onerror
    console.warn(error);
}, function (progress) {
    // onprogress
    // the progress (percentage = Math.round(progress * 100)) to update your progress bar with
});

```

Bitte beachten Sie, dass *SensorThingsHttp.get()* asynchron arbeitet. Alle Parameter (die vielen Funktionen) sind optional - außer "url". Natürlich macht es Sinn zumindest den onsuccess-Callback mit zu übergeben um an die Response zu kommen.


### Konfiguration SensorThingsHttp ###
Die SensorThingsHttp-Klasse kann beim Erstellen einer neuen Instanz mit folgenden Parametern konfiguriert werden:

|Name|Verpflichtend|Typ|default|Beschreibung|Beispiel|
|----|-------------|---|-------|------------|--------|
|removeIotLinks|Nein|Boolean|false|entfernt alle Vorkommen von "@iot.navigationLink" und "@iot.selfLink" aus dem Response um das Ergebnis schlank zu halten|const http = new SensorThingsHttp({removeIotLinks: true});|
|httpClient|Nein|Function|null|Für den Fall, dass Sie einen eigenen Http-Client vorziehen (intern wird axios verwendet) oder eigene Tests schreiben wollen ohne eine externe Schnittstelle aufrufen zu müssen.|const http = new SensorThingsHttp({httpClient: (url, onsuccess, onerror) => {}});|



### Auswertung von "@iot.nextLink" ###
Wenn Sie nicht auf die Software-Schicht *SensorThingsHttp* angewiesen sein möchten um Ihre gesplitteten Antworten zu empfangen, folgen nun einige Hilfen die Ihnen das Leben erleichtern können.

Ist die Antwort vom Server zu groß, splittet der Server das Ergebnis automatisch in kleinere Teile von denen er Ihnen nur den Ersten übermittelt. Der jeweils nächste Teil kann über den Link "@iot.nextLink" in der Antwort abgerufen werden.
Sie können diesem "@iot.nextLink" folgen und erhalten in der nächsten Antwort ggf. wieder einen "@iot.nextLink".
Und so geht es weiter wie bei Hänsel und Gretel, bis sie beim letzten Teil angekommen sind, in dessen Daten Ihnen kein weiterer "@iot.nextLink" mehr angeboten wird. Hieran erkennen Sie den letzten Teil.

**Beispiel**

Die URL [https://iot.hamburg.de/v1.0/Things](https://iot.hamburg.de/v1.0/Things) gibt Ihnen nur 100 Datensätze zurück.
Im Datensatz finden Sie den angesprochenen Wert "@iot.nextLink", der auf den nächsten Datensatz verweist:
```
#!json
{
  "@iot.nextLink" : "https://iot.hamburg.de/v1.0/Things?$skip=100",
  "value" : [ {
      "...": "..."
  }]
}
```

Rufen Sie den nächsten Link auf ([https://iot.hamburg.de/v1.0/Things?$skip=100](https://iot.hamburg.de/v1.0/Things?$skip=100)) wird Ihnen ein weiterer Datensatz mit einem "@iot.nextLink" geschickt, usw.
Das Ende erkennen Sie daran, dass der "@iot.nextLink" fehlt.


### Komplexe Strukturen mit @iot.nextLink ###
Wenn Sie nicht auf die Software-Schicht *SensorThingsHttp* angewiesen sein möchten um mit komplexen Strukturen umzugehen, folgt nun eine Erläuterung auf welchen Mechanismus Sie achten müssen.

Komplexere Aufrufe der SensorThingsApi können zu Ergebnissen mit vielen @iot.nextLink führen.
Der FROST-Server ist in der Lage jedes gelieferte Array (auch in Unterstrukturen) zu splitten und mit einem @iot.nextLink verfolgbar zu machen.
Diese @iot.nextLink haben initial den Key des gesplitteten Arrays als Prefix. z.B. Observations@iot.nextLink oder Datastreams@iot.nextLink.

**Beispiel**

Die URL [https://udh-hh-iot-qs.germanynortheast.cloudapp.microsoftazure.de/v1.0/Things?$expand=Datastreams($top=2;$expand=Observations($top=2))](https://udh-hh-iot-qs.germanynortheast.cloudapp.microsoftazure.de/v1.0/Things?$expand=Datastreams($top=2;$expand=Observations($top=2))) gibt Ihnen Things mit Datastreams und Observations zurück.
(Für dieses Beispiel wird durch die Verwendung von $top=X in der Anfrage die Antwort künstlich beschnitten und die Verwendung von @iot.nextLink auf allen Ebenen erzwungen.)
```
#!json
{
    "@iot.nextLink" : "https://udh-hh-iot-qs.germanynortheast.cloudapp.microsoftazure.de/v1.0/Things?$skip=100&$expand=Datastreams%28%24top%3D2%3B%24expand%3DObservations%28%24top%3D2%29%29",
    "value" : [ {
        "Datastreams" : [ {
            "Observations" : [...],
            "Observations@iot.nextLink" : "https://udh-hh-iot-qs.germanynortheast.cloudapp.microsoftazure.de/v1.0/Datastreams(13976)/Observations?$top=2&$skip=2",
        }, {
            "Observations" : [...],
            "Observations@iot.nextLink" : "https://udh-hh-iot-qs.germanynortheast.cloudapp.microsoftazure.de/v1.0/Datastreams(13978)/Observations?$top=2&$skip=2",
        } ],
        "Datastreams@iot.nextLink" : "https://udh-hh-iot-qs.germanynortheast.cloudapp.microsoftazure.de/v1.0/Things(5432)/Datastreams?$top=2&$skip=2&$expand=Observations%28%24top%3D2%29",
    }]
}
```

Folgen wir z.B. Datastreams@iot.nextLink [https://udh-hh-iot-qs.germanynortheast.cloudapp.microsoftazure.de/v1.0/Things(5432)/Datastreams?$top=2&$skip=2&$expand=Observations%28%24top%3D2%29](https://udh-hh-iot-qs.germanynortheast.cloudapp.microsoftazure.de/v1.0/Things(5432)/Datastreams?$top=2&$skip=2&$expand=Observations%28%24top%3D2%29),
so erhalten wir wiederum eine komplexe Struktur, diesmal auf Basis des Datastreams:
```
#!json
{
    "@iot.nextLink" : "https://udh-hh-iot-qs.germanynortheast.cloudapp.microsoftazure.de/v1.0/Things(5432)/Datastreams?$top=2&$skip=4&$expand=Observations%28%24top%3D2%29",
    "value" : [ {
        "Observations" : [...],
        "Observations@iot.nextLink" : "https://udh-hh-iot-qs.germanynortheast.cloudapp.microsoftazure.de/v1.0/Datastreams(13980)/Observations?$top=2&$skip=2",
    }]
}
```

Zu beachten ist, dass Einzel-Objekte (z.B. ein Thing) ohne @iot.nextLink und ohne dem Key "value" geliefert werden. Die Regeln für Unterstrukturen mit @iot.nextLink bleiben bestehen. z.B.: [https://udh-hh-iot-qs.germanynortheast.cloudapp.microsoftazure.de/v1.0/Things(5432)?$expand=Datastreams($top=2)]



### Tiefenschranken für @iot.nextLink ###
Die offensichtlichste Tiefenschranke ist die Abwesenheit eines @iot.nextLink.

Es gibt aber eine zweite nicht sofort erkennbare Tiefenschranke:
Wird eine SensorThingsAPI-Url oder ein @iot.nextLink durch die Verwendung von $top=X in der Anzahl zu übermittelnder Entitäten beschränkt, erhalten wir dennoch einen @iot.nextLink.
Folgen wir blind allen @iot.nextLink, dann kann dies zu Kaskaden von Server-Anfragen führen. Bei $top=1 und 1000 Entitäten wären dies z.B. 1000 Netzwerk-Anfragen.

Simples Beispiel: [https://udh-hh-iot-qs.germanynortheast.cloudapp.microsoftazure.de/v1.0/Datastreams(13980)/Observations?$top=1]
```
#!json
{
  "@iot.nextLink" : "https://udh-hh-iot-qs.germanynortheast.cloudapp.microsoftazure.de/v1.0/Datastreams(13980)/Observations?$top=1&$skip=1",
  "value" : [ {...} ]
}
```

Leider können wir nicht davon ausgehen, dass @iot.nextLink immer ignoriert werden kann, wenn eine Limitierung mit $top=X vorgenommen wird.
Wenn das X in $top=X größer ist als die vom Server voreingestellte maximale Anzahl auszuliefernder Entitäten pro Anfrage, dann müssen wir @iot.nextLink folgen um unser Ergebnis zu komplettieren.

_"In addition, if the $top value exceeds the service-driven pagination limitation (...), the $top query option SHALL be discarded and the server-side pagination limitation SHALL be imposed."_
[https://docs.opengeospatial.org/is/15-078r6/15-078r6.html#51](https://docs.opengeospatial.org/is/15-078r6/15-078r6.html#51)

Wir müssen also jeden @iot.nextLink durchsuchen nach Vorkommen von "$top=X" bzw. "%24top=X" und "$skip=Y" bzw. "%24skip=Y" um X und Y für diese zweite sehr versteckte Tiefenschranke auswerten zu können.

Zum Glück sind alle $top=X die sich nicht auf die aktuelle Sammlung von Entitäten beziehen im @iot.nextLink url codiert: z.B. "%24top%3DX"

Wir können also zwischen $top=X auf Root-Ebene und $top=X auf Sub-Ebenen problemlos unterscheiden.
Beispiel: [https://udh-hh-iot-qs.germanynortheast.cloudapp.microsoftazure.de/v1.0/Things(5432)/Datastreams?%24top=2&%24skip=2&%24expand=Observations%28%24top%3D2%29](https://udh-hh-iot-qs.germanynortheast.cloudapp.microsoftazure.de/v1.0/Things(5432)/Datastreams?%24top=2&%24skip=2&%24expand=Observations%28%24top%3D2%29)

Hier die regulären Ausdrücke um das relevante X und Y von $top=X bzw. $skip=Y aus einem @iot.nextLink zu holen:

 - Regex für $top=X: /[\$|%24]top=([0-9]+)/
 - Regex für $skip=X: /[\$|%24]skip=([0-9]+)/

Und hier der Pseudo-Code um eine Tiefenschranke mit $top=X und $skip=Y zu bauen:

```
// pseudo code, nextLink wird angenommen
int topX = fetchTopFromNextLink(nextLink);
int skipX = fetchSkipFromNextLink(nextLink);

if (topX > 0 && topX <= skipX) {
    // diesem @iot.nextLink nicht mehr folgen (Tiefenschranke erreicht)
}
```





### Aufruf mit "@iot.count" ###
Um die Gesamtzahl aller zu erwartenden Datensätze zu erfragen, gibt es das Feld "@iot.count".
Dieses Feld muss mit dem Zusatz ($count=true) im Aufruf erst aktiviert werden.

Die so erhaltene Gesamtzahl in Kombination mit dem aktuellen skip-Wert ergibt für Ihre Applikation den Lade-Fortschritt (Progress), den Sie dem Endnutzer anzeigen können.

**Beispiel**

Um die Gesamtzahl aller zu erwartenden Datensätze Ihres Aufrufes auszugeben, fügen Sie $count=true in Ihren Aufruf mit ein: [https://iot.hamburg.de/v1.0/Things?$count=true](https://iot.hamburg.de/v1.0/Things?$count=true)

Die Antwort:
```
#!json
{
  "@iot.count" : 4723,
  "@iot.nextLink" : "https://iot.hamburg.de/v1.0/Things?$skip=100&$count=true",
  "value" : [ {
      "...": "..."
  }]
}
```

Der Lade-Fortschritt (Progress) kann mithilfe des Wertes "@iot.count" und dem skip-Wert in der url von "@iot.nextLink" wie folgt ermittelt werden: (1 / @iot.count * skip)



### Automatischer Aufruf im Karten-Ausschnitt ###
Es ist möglich den Broker (z.B. FROST Server) der SensorThingsAPI anzuweisen Ihnen nur die Things zu übermitteln, die sich in einem bestimmten Karten-Ausschnitt befinden.
Der FROST Server bietet diese Funktion.
Das Software-Layer *SensorThingsHttp* des Masterportals stellt Ihnen diese Technik mit seiner Funktion *SensorThingsHttp.getInExtent()* zur Verfügung.

Die Funktion *SensorThingsHttp.getInExtent()* übernimmt die korrekte Anwendung von "st_within(Locations/location,geography'POLYGON ((...))')" (siehe [Benutzung von POLYGON](#markdown-header-benutzung-von-polygon)) für Sie.
Wenn Sie die Funktion *SensorThingsHttp.getInExtent()* nutzen, müssen Sie sich natürlich auch nicht mehr um das [automatische Splitten und Skippen](#markdown-header-auswertung-von-iotnextLink) kümmern.
Die Funktion erledigt beides für Sie.

Einzig den Karten-Ausschnitt müssen Sie korrekt angeben. Die folgenden Parameter für den Extent sind verpflichtend, wenn Sie die Funktion *SensorThingsHttp.getInExtent()* nutzen möchten:

|Name|Verpflichtend|Typ|default|Beschreibung|Beispiel|
|----|-------------|---|-------|------------|--------|
|extent|Ja|Number[]|-|der Karten-Ausschnitt in Ihrer OpenLayers Map|[556925.7670922858, 5925584.829527992, 573934.2329077142, 5942355.170472008]|
|sourceProjection|Ja|String|-|Das Format (projection) des Ausschnittes|"EPSG:25832"|
|targetProjection|Ja|String|-|Das Format (projection) das der Broker (Server) erwartet|"EPSG:4326"|

Es folgt ein Implementierungs-Beispiel der Funktion *SensorThingsHttp.getInExtent()*. Zur Veranschaulichung werden ein paar zusätzliche Events des Masterportals verwendet:

```
#!javascript

import {SensorThingsHttp} from "@modules/core/modelList/layer/sensorThingsHttp";

const http = new SensorThingsHttp(),
    extent = Radio.request("MapView", "getCurrentExtent"),
    projection = Radio.request("MapView", "getProjection").getCode(),
    epsg = this.get("epsg"),
    url = "https://iot.hamburg.de/v1.0/Things";

http.getInExtent(url, {
    extent: extent,
    sourceProjection: projection,
    targetProjection: epsg
}, function (response) {
    // on success
    // do something with the response

}, function () {
    // on start (always called)
    Radio.trigger("Util", "showLoader");

}, function () {
    // on complete (always called)
    Radio.trigger("Util", "hideLoader");

}, function (error) {
    // on error
    console.warn(error);

}, function (progress) {
    // on wait
    // the progress to update your progress bar with
    // to get the percentage use Math.round(progress * 100)

});

```

Bitte beachten Sie, dass *SensorThingsHttp.getInExtent()* asynchron arbeitet. Alle Parameter (die vielen Funktionen) sind optional - außer "url" und "extent". Natürlich macht es Sinn zumindest den onsuccess-Callback mit zu übergeben um an die Response zu kommen.

Hinweis: Es gibt einen optionalen achten Parameter (httpClient), der benutzt werden kann um den intern verwendeten default Http-Client zu ersetzen.
Für den Fall, dass Sie einen eigenen Http-Client vorziehen (intern wird axios verwendet) ist eine Funktion mit drei Parametern als Http-Client nötig: function (url, onsuccess, onerror).



### Benutzung von POLYGON ###
Wenn Sie die Software-Schicht *SensorThingsHttp* nicht nutzen möchten um Sensoren einzig im aktuellen Karten-Ausschnitt abzurufen, hier eine kurze Hilfe um Ihnen das Leben zu erleichtern.

Wenn Ihr Server dies anbietet (z.B. FROST Server), bietet die SensorThingsAPI geobezogene Funktionalitäten (z.B. POINT und POLYGON) an.
(Siehe [https://docs.opengeospatial.org/is/15-078r6/15-078r6.html#56](https://docs.opengeospatial.org/is/15-078r6/15-078r6.html#56)).

Hier ein Beispiel:

[https://iot.hamburg.de/v1.0/Things?$filter=st_within(Locations/location,geography%27POLYGON%20((10.0270%2053.5695,10.0370%2053.5695,10.0370%2053.5795,10.0270%2053.5795,10.0270%2053.5695))%27)&$expand=Locations](https://iot.hamburg.de/v1.0/Things?$filter=st_within(Locations/location,geography%27POLYGON%20((10.0270%2053.5695,10.0370%2053.5695,10.0370%2053.5795,10.0270%2053.5795,10.0270%2053.5695))%27)&$expand=Locations)

*Hinweis: Beachten Sie das korrekte Format zu verwenden. Dies ist abhängig von Ihrer Server-Konfiguration.*

Rechnet der Broker (Server) mit EPSG:4326, aber Ihr Masterportal verwendet EPSG:25832, müssen Sie zuvor konvertieren. Es bietet sich an OpenLayers dafür zu benutzen. Alternativ bietet Ihnen das Masterportal eine "transform"-Funktion unter "masterportalAPI/src/crs".

Hier ein Beispiel wie Sie "masterportalAPI/src/crs" nutzen um das aktuelle Format des Masterportals z.B. in "EPSG:4326" zu konvertieren:

```
#!javascript

import {transform} from "masterportalAPI/src/crs";

const extent = Radio.request("MapView", "getCurrentExtent"),
    projection = Radio.request("MapView", "getProjection").getCode(),
    epsg = "EPSG:4326",
    topLeftCorner = transform(projection, epsg, {x: extent[0], y: extent[1]}),
    bottomRightCorner = transform(projection, epsg, {x: extent[2], y: extent[3]});

```

Auf diese Weise erhalten Sie natürlich nur die Ecken linksoben und rechtsunten Ihres aktuellen Bild-Ausschnittes.
Um hieraus ein POLYGON zu bauen, das von der SensorThingsAPI als POLYGON-Wert akzeptiert wird, müssen Sie folgende Umwandlung vornehmen:

```
#!javascript

const extent = Radio.request("MapView", "getCurrentExtent"),
    polygon = [
        {x: extent[0], y: extent[1]},
        {x: extent[2], y: extent[1]},
        {x: extent[2], y: extent[3]},
        {x: extent[0], y: extent[3]},
        {x: extent[0], y: extent[1]}
    ];

```





## SensorThingsMqtt ##
Die Software-Schicht SensorThingsMqtt des Masterportals unterstützt mqtt der Versionen 3.1, 3.1.1 und 5.0.
Die Version muss SensorThingsMqtt im Constructor mit angegeben werden, daher ist es nötig, dass Sie die mqtt-Version kennen, auf der Ihr Server läuft.

Hier ein funktionierendes Beispiel für mqtt 5.0:

```
#!javascript

import {SensorThingsMqtt} from "./sensorThingsMqtt";

const mqtt = new SensorThingsMqtt({
        mqttUrl: "wss://iot.hamburg.de/mqtt",
        mqttVersion: "5.0",
        context: this
    });

mqtt.on("message", (topic, message, packet) => {
    // handler
    console.log("received message:", topic, message, packet);
}, error => {
    // onerror
    console.warn(error);
});

mqtt.subscribe("v1.0/Datastreams(1234)/Observations", {
    rh: 0
}, () => {
    // onsuccess
    console.log("success");
}, error => {
    // onerror
    console.warn(error);
});
```


Hier ein funktionierendes Beispiel für 3.1 und 3.1.1:

```
#!javascript

import {SensorThingsMqtt} from "./sensorThingsMqtt";

const mqtt = new SensorThingsMqtt({
        mqttUrl: "wss://iot.hamburg.de/mqtt",
        // mqttVersion: "3.1",
        mqttVersion: "3.1.1",
        rhPath: "https://iot.hamburg.de",
        context: this
    });

mqtt.on("message", (topic, message, packet) => {
    // handler
    console.log("received message:", topic, message, packet);
}, error => {
    // onerror
    console.warn(error);
});

mqtt.subscribe("v1.0/Datastreams(1234)/Observations", {
    rh: 0
}, () => {
    // onsuccess
    console.log("success");
}, error => {
    // onerror
    console.warn(error);
});
```

Bitte beachten Sie, dass Nachrichten nicht beim "subscribe" erhalten werden, sondern immer über das on(message)-Event angeliefert werden.
Im on(message)-Event müssen Sie Ihren Prozessen die Nachrichten anhand des mitgelieferten Topics zuspielen.






### Konfiguration - Constructor ###
Die SensorThingsMqtt-Schicht wird wie eine normale Klasse per Constructor instanziiert.
Beim Instanziieren wird im Hintergrund die mqtt-Verbindung zum Server geöffnet.
Pro Instanz gibt es Eine Verbindung, konfiguriert werden muss die Verbindung über den Constructor.

|name|mandatory|type|default|description|example|
|----|---------|----|-------|-----------|-------|
|mqttUrl|yes|String|""|Die Url zum mqtt Service Ihres Servers.|"wss://iot.hamburg.de/mqtt"|
|mqttVersion|no|String|"3.1.1"|Die mqtt Version auf der Ihr Server läuft.|"3.1", "3.1.1", "5.0"|
|rhPath|no|String|""|Benötigt für 3.1 und 3.1.1, um eine Simulation vom "Retained Handling" durchzuführen.|"https://iot.hamburg.de"|
|context|Nein|JavaScript Scope|Der Scope in dem die Events ausgeführt werden.|Wenn hier *this* eingetragen wird, kann *this* in den Events ohne extra binding verwendet werden.|this|


#### mqttUrl ####
Die mqttUrl unter der sich der Browser mit dem mqtt Service Ihres Servers verbindet.
Die mqttUrl kann folgende Protokolle verwenden: 'mqtt', 'mqtts', 'tcp', 'tls', 'ws', 'wss'. (siehe: [https://www.npmjs.com/package/mqtt](https://www.npmjs.com/package/mqtt))


#### mqttVersion ####
Je nach mqttVersion unterscheiden sich interne Abläufe der SensorThingsMqtt-Schicht leicht.

 - "3.1": Intern wird die protocolId "MQIsdp" benutzt (3.1.1 und 5.0 nutzen "MQTT") und die protocolVersion ist 3 (3.1.1 und 5.0 nutzen protocolVersion 4). Haben Sie einen rhPath angegeben, wird das Retained Handling simuliert.
 - "3.1.1": Haben Sie einen rhPath angegeben, wird das Retained Handling simuliert.
 - "5.0": Retained Handling wird nicht simuliert (rhPath braucht nicht angegeben werden, wird ignoriert), das on(disconnect)-Event ist als Feature von 5.0 verfügbar.


#### rhPath ####
Wenn Sie die mqtt Versionen 3.1 oder 3.1.1 verwenden, schalten Sie mit der Angabe eines rhPath die Simulation des Retained Handlings frei.

Falls Sie sich fragen, wie sich dieser Pfad zusammensetzt, sehen Sie den rhPath als fehlendes Prefix eines Topics auf das sie sich subscriben.
Um Ihren rhPath herauszufinden, gehen Sie wie folgt vor.

Wenn Sie z.B. eine Entität Ihrer SensorThingsApi per http ansprechen über "https://iot.hamburg.de/v1.0/Things(1234)/Datastreams", dann würde das Topic auf das Sie per mqtt subscriben "v1.0/Things(1234)/Datastreams" lauten.
Ihr rhPath ist der Teil, der übrig bleibt, wenn Sie das Topic von Ihrem http-Pfad entfernen. In diesem Fall bliebe "https://iot.hamburg.de" übrig. Das ist Ihr rhPath.

Beachten Sie bitte, dass sich der Zugriff per http vom Zugriff per mqtt unterscheidet. Daher ist Ihr rhPath mit hoher Wahrscheinlichkeit nicht identisch mit der per Constructor übergebenen mqttUrl.

*Beispiele zur Übersicht*

 - SensorThingsApi: "https://iot.hamburg.de/v1.0/Things(1234)/Datastreams"
 - mqttUrl: "wss://iot.hamburg.de/mqtt"
 - Topic: "v1.0/Things(1234)/Datastreams"
 - rhPath: "https://iot.hamburg.de"





### Konfiguration - Subscribe ###
Über die Instanz von SensorThingsMqtt können Sie beliebige Subscriptions absetzen.
Beim Ausführen von SensorThingsMqtt.subscribe auf ein Topic, können wiederum Konfigurationen vorgenommen werden.

|name|mandatory|type|default|description|example|
|----|---------|----|-------|-----------|-------|
|qos|no|Number|0|"Quality of service" Subscription-Level [https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901169](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901169)|0, 1 oder 2|
|rh|no|Number|2|"This option specifies whether retained messages are sent when the subscription is established." [https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901169](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901169)|0, 1 oder 2|


#### rh ####
Da es Retained Handling (rh) zwischen Browser und Server erst ab mqtt 5.0 gibt, haben wir uns dafür entschieden Retained Handling für mqtt 3.1 und mqtt 3.1.1 mit unserer SensorThingsMqtt-Schicht per http zu "simulieren".

Daher ist es nun, unabhängig von Ihrer mqtt-Version, möglich das Retained Handling einzustellen mit rh := 0, 1 oder 2

 - rh := 0; Sie erhalten sofort die letzte (alte) Nachricht für das Topic vom Server per on(message)-Event.
 - rh := 1; Sie erhalten sofort die letzte (alte) Nachricht für das Topic, wenn der Prozess der Erste in Ihrer Applikation ist, der auf dem Topic subscribed.
 - rh := 2; Sie erhalten keine "alte" Nachricht, sondern nur künftige und damit immer neue Nachrichten.





### Retained Handling ###
Retained Handling ist - wie wir finden - eine so wichtige Funktionalität, dass wir sie für die mqtt-Versionen 3.1 und 3.1.1 mit unserer SensorThingsMqtt-Schicht simulieren.

Eine "Retained Message" ist eine "alte" Nachricht von einem Sensor, die der Server zwischengespeichert hat, um sie dem Abonnenten je nach eingestelltem rh-Flag auszuliefern.

```
#!javascript

import {SensorThingsMqtt} from "./sensorThingsMqtt";

const mqtt = new SensorThingsMqtt({
        mqttUrl: "wss://iot.hamburg.de/mqtt",
        mqttVersion: "5.0",
        context: this
    });

mqtt.on("message", (topic, message, packet) => {
    if (packet.retain === 1) {
        console.log("this is a retained message");
    }
    else {
        console.log("this is a new message");
    }
});

mqtt.subscribe("v1.0/Datastreams(1234)/Observations", {rh: 0});
```

Da der eine oder andere Prozess vielleicht keine "Retained Message" erhalten will, ist das Retained Handling per default ausgeschaltet (rh: 2).

```
#!javascript

import {SensorThingsMqtt} from "./sensorThingsMqtt";

const mqtt = new SensorThingsMqtt({
        mqttUrl: "wss://iot.hamburg.de/mqtt",
        mqttVersion: "5.0",
        context: this
    });

mqtt.on("message", (topic, message, packet) => {
    if (packet.retain === 1) {
        console.log("this will never happen");
    }
    else {
        console.log("this is a new message");
    }
});

mqtt.subscribe("v1.0/Datastreams(1234)/Observations");
```

Es gibt Szenarien, in denen zwei Ihrer Prozesse dasselbe Topic abonnieren.
Es kann sein, dass ein Prozess "Retained Messages" erhalten möchte und ein anderer Prozess keine "Retained Messages" erhalten will.
Um diesen Konflikt aufzulösen, können Sie im dritten Parameter "packet" des Event-Handlers nachschauen, ob die erhaltene Nachricht eine "Retained Message" ist oder nicht.

```
#!javascript

import {SensorThingsMqtt} from "./sensorThingsMqtt";

const mqtt = new SensorThingsMqtt({
        mqttUrl: "wss://iot.hamburg.de/mqtt",
        mqttVersion: "5.0",
        context: this
    });

mqtt.on("message", (topic, message, packet) => {
    if (topic === "v1.0/Datastreams(1234)/Observations" && packet.retain === 1) {
        console.log("this is for the second subscription only");
    }
    else if (topic === "v1.0/Datastreams(1234)/Observations") {
        console.log("this is for the first and second subscription");
    }
    else if (topic === "v1.0/Things(4321)/Datastreams") {
        console.log("this is for the third subscription, retain flag is", packet.retain);
    }
});

// first subscription
mqtt.subscribe("v1.0/Datastreams(1234)/Observations", {rh: 2});

// second subscription
mqtt.subscribe("v1.0/Datastreams(1234)/Observations", {rh: 0});

// third subscription
mqtt.subscribe("v1.0/Things(4321)/Datastreams", {rh: 0});
```



### Verbindung schließen ###
Es wird vorkommen, dass Sie die Verbindung zum mqtt-Server sauber schließen möchten.
Zu diesem Zweck gibt es die Funktion SensorThingsMqtt.end.

```
#!javascript

import {SensorThingsMqtt} from "./sensorThingsMqtt";

const mqtt = new SensorThingsMqtt({
        mqttUrl: "wss://iot.hamburg.de/mqtt",
        mqttVersion: "5.0",
        context: this
    });

mqtt.end(false, {}, () => {
    console.log("finished");
});
```

Bitte beachten Sie, dass die übergebenen Parameter identisch mit den unter [https://www.npmjs.com/package/mqtt#end](https://www.npmjs.com/package/mqtt#end) beschriebenen Parametern sind.
