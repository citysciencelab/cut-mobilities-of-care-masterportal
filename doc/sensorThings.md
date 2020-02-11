>Zurück zur **[Dokumentation Masterportal](doc.md)**.

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
Das mqtt Protokoll wurde für das Intenet of Things (IoT) entwickelt. Es hält eine bidirektionale Verbindung zum Server offen und kommuniziert über pull- und push-Nachrichten.
Die meisten Browser-Implementierungen nutzen unter dem mqtt Protokoll socket.io, da Browser direktes mqtt normalerweise nicht können. Das mqtt-Paket von npm ist ein gutes Beispiel für eine solche Implementierung.

Mithilfe des mqtt Protokolls abonniert der Client (Browser) ein Topic (Thema).
Ein Topic verweist mithilfe eines REST Pfads auf eine Entität (die Tabellen aus dem Daten-Model), über deren Änderung informiert werden soll (z.B. "v1.0/Datastreams(74)/Observations").
*Hinweis: Der host wird beim Connect mit mqtt übergeben und wird aus dem Topic immer weggelassen.*

Ist eine solches Topic über mqtt abonniert worden, pushed der Broker alle Änderungen an der dahinter liegenden Tabelle an den Client.
Alle Entitäten (Tabellen des Daten-Models) können abonniert und deabonniert werden.
Da mqtt nur auf das Abonnieren und Deabonnieren ausgelegt ist, müssen alle anderen Aktionen (z.B. Initiales Abfragen relevanter IDs) über http abgewickelt werden.

Wie bereits erwähnt, sind Topics reine REST Pfade ohne Query. Beispiel:

 - dies kann man abonnieren: mqtt://iot.hamburg.de/v1.0/Datastreams(74)/Observations
 - dies kann man nicht abonnieren: mqtt://iot.hamburg.de/v1.0/Datastreams(74)?$expand=Observations

Die aktuelle mqtt Version im Masterportal ist: 3.1.1

 - Informationen zu mqtt 3.1.1: [https://docs.oasis-open.org/mqtt/mqtt/v3.1.1/mqtt-v3.1.1.html](https://docs.oasis-open.org/mqtt/mqtt/v3.1.1/mqtt-v3.1.1.html)
 - Informationen zu mqtt 5.0.0: [https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html)



### mqtt - Retained Messages ###

Laut mqtt Protokoll muss ein Publisher (Sensor) dem Broker (Server) mitteilen, wenn er selten Aktualisierungen vornimmt.
Der Publisher motiviert den Broker dazu seine jeweils letzte Nachricht im Arbeitsspeicher zu halten, um sie neu abonnierenden Clients direkt zur Verfügung zu stellen, da er selbst erst in später Zukunft wieder von sich hören lassen wird.
Hat ein Publisher hingegen eine hohe Nachrichten-Frequenz (z.B. jede Sekunde), teilt er dem Broker mit, dass sich ein Bereithalten seiner Nachrichten nicht lohnt, da er eh sofort die nächste schickt.

Als *Retained Messages* werden solche Nachrichten bezeichnet, die der Broker zwar ganz normal im Permaspeicher speichert, die jedoch zusätzlich im Arbeitsspeicher für künftige Abonnements bereit hält.
Würde es keine *Retained Messages* geben, würden immer nur gerade empfangene Nachrichten vom Broker an die abonnierten Clients gesendet.

 - Mehr Informationen zu *Retained Messages* wie der Publisher sie vom Broker verlangt: [https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901104](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901104)
 - Mehr Informationen zu *Retained Messages* wie der Client sie vom Broker verlangt: [https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc384800440](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc384800440)



### FROST Server und Retained Messages ###
Der FROST Server unterstützt aktuell keine *Retained Messages*.
Wenn Sie beim Abonnement eines Topics die letzte Nachricht empfangen möchten, die der Broker für dieses Topic erhalten hat, müssen Sie diese Nachricht über einen anderen Weg abrufen.
Dies ist immer der Fall - unabhängig davon was der Publisher dem Broker zur Behandlung seiner Nachrichten als *Retained Messages* mitteilt.

Um das Problem fehlender *Retained Messages* zu lösen, haben wir für das Masterportal eine Software-Schicht implemntiert die *Retained Messages* simulieren kann. Diese Software-Schicht heißt **[sensorThingsMqtt](#sensorthingsmqtt)**.




## SensorThingsHttp ##
Requests to a SensorThingsAPI can be automatically splitted into chunks of requests. Therefore it is possible to show the progress of a http SensorThingsAPI call for a better user experience (see [Automatic Split](#markdown-header-automatic-split)). The request to a SensorThingsAPI can use the current browser extent to narrow down and minimize the server response (see [Automatic call in Extent](#markdown-header-automatic-call-in-extent)). For the Masterportal we have implemented a software layer called *SensorThingsHttp* that provides the split handling and the extent for you.

*Note: Please keep in mind that automatic progress and "call in extent" is only available if your server side implementation of the SensorThingsAPI (e.g. FROST Server) provides and has activated the skip and geography functions.*


### Automatic Split ###
Your server configuration should include the automatic skipping of responses. If this is the case, responses that seem to be too big to receive in one response have included a follow up link ("@iot.nextLink") to be called to receive the next chunk of data. To get the total number of expected datasets, the "@iot.count" value can be used.

Using the *SensorThingsHttp.get()* function, the *SensorThingsHttp* layer does the correct work of "@iot.nextLink" (see [The "@iot.nextLink" Value](#markdown-header-the-iotnextlink-value)) and "@iot.count" (see [The "@iot.count" Value](#markdown-header-the-iotcount-value)) for you.

Here is a basic implementation of *SensorThingsHttp* using some basic Events of the Masterportal to show its functionality:

```
#!javascript

import {SensorThingsHttp} from "@modules/core/modelList/layer/sensorThingsHttp";

const http = new SensorThingsHttp(),
    url = "https://iot.hamburg.de/v1.0/Things";

http.get(url, function (response) {
    // on success
    // do something with the total response

}, function () {
    // on start
    Radio.trigger("Util", "showLoader");

}, function () {
    // on complete (always called)
    Radio.trigger("Util", "hideLoader");

}, function (error) {
    // on error
    console.warn(error);

}, function (progress) {
    // on wait
    // the progress (percentage = Math.round(progress * 100)) to update your progress bar with

});

```

Please note that the http.get call in itself is asynchronous. All parameters of *SensorThingsHttp.get()* except for "url" are optional. It makes sense of cause to use at least onsuccess to receive the response.

There is an optional seventh parameter (httpClient) that can be used to change the default http handler (in our case axios). This optional httpClient can be a simple function with the parameters url, onsuccess and onerror.



### The "@iot.nextLink" Value ###
If you don't want to use *SensorThingsHttp* to automaticaly split the data, here are some guides to help you do your own thing.

If the data of a call has too many datasets, the server splitts the result into chunks indicated by a "@iot.nextLink". You can follow through all "@iot.nextLink" urls, gathering the responses to one big response until the end of data is received. If no follow up link ("@iot.nextLink") is received, the data is complete in the first place or it is the last chunk of datasets to receive.

**Example**

The following url will only get 100 datasets and is including a "@iot.nextLink" to be called to receive the next chunk: [https://iot.hamburg.de/v1.0/Things](https://iot.hamburg.de/v1.0/Things)
```
#!json
{
  "@iot.nextLink" : "https://iot.hamburg.de/v1.0/Things?$skip=100",
  "value" : [ {
      "...": "..."
  }]
}
```

Calling the next link ([https://iot.hamburg.de/v1.0/Things?$skip=100](https://iot.hamburg.de/v1.0/Things?$skip=100)) will provide you with the next chunk of data and another follow up link ("@iot.nextLink") and so forth, until in the last dataset no follow up link is given.


### The "@iot.count" Value ###
To show the progress of the current http call, you can use the loop through "@iot.nextLink" urls in combination with the $count=true parameter. If you add $count=true to any SensorThingsAPI url, the received data includes the number of datasets to be expected in total ("@iot.count").

**Example**

To get the total number of datasets to expect from one call, simply add $count=true to any SensorThingsAPI url: [https://iot.hamburg.de/v1.0/Things?$count=true](https://iot.hamburg.de/v1.0/Things?$count=true)
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

Combining the absolute number ("@iot.count") and the value of the current $skip parameter gives you the progress (1 / @iot.count * skip).



### Automatic use of Extent ###
You would want your server implementation of the SensorThingsAPI (e.g. FROST Server) to filter data within a given extent (e.g. a polygon). The FROST Server provides you with this functionality. To use this feature the *SensorThingsHttp* layer has a function (*SensorThingsHttp.getInExtent()*) to call data only within the given extent.

Using *SensorThingsHttp.getInExtent()* you also use the skipping progress explained [above](#markdown-header-automatic-split). The *SensorThingsHttp* layer does the correct work of "st_within(Locations/location,geography'POLYGON ((...))')" (see [The use of POLYGON](#the_use_of_polygon)) for you.

The extent needs to be described including its source projection and target projection. The following extent options are mandatory for the use of *SensorThingsHttp.getInExtent()*:

|name|mandatory|type|default|description|example|
|----|---------|----|-------|-----------|-------|
|extent|yes|Number[]|-|the extent based on your current OpenLayers Map|[556925.7670922858, 5925584.829527992, 573934.2329077142, 5942355.170472008]|
|sourceProjection|yes|String|-|the projection of the extent|"EPSG:25832"|
|targetProjection|yes|String|-|the projection the SensorThingsAPI server expects|"EPSG:4326"|

Here is a basic implementation of *SensorThingsHttp* receiving only data within the browsers current extent, using some basic Events of the Masterportal to show its functionality:

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

In case of *SensorThingsHttp.getInExtent()* the "url" and "extent" parameters are mandatory. To get the response you need to set the third parameter as an on success function. The rest ist optional.

There is an optional eighth parameter (httpClient) that can be used to change the default http handler (in our case axios). This optional httpClient can be a simple function with the parameters url, onsuccess and onerror.


### The use of POLYGON ###
If you don't want to use *SensorThingsHttp* to call your data in the current extent, here are some guides to go on your own.

To receive data only in a specified extent the SensorThingsAPI provides certain geospatial functions using POINT or POLYGON structures (see [https://docs.opengeospatial.org/is/15-078r6/15-078r6.html#56](https://docs.opengeospatial.org/is/15-078r6/15-078r6.html#56)). You can set your extent using a POLYGON. You can then use the Locations of a Thing to filter within an extent.

This is a basic example:

[https://iot.hamburg.de/v1.0/Things?$filter=st_within(Locations/location,geography%27POLYGON%20((10.0270%2053.5695,10.0370%2053.5695,10.0370%2053.5795,10.0270%2053.5795,10.0270%2053.5695))%27)&$expand=Locations](https://iot.hamburg.de/v1.0/Things?$filter=st_within(Locations/location,geography%27POLYGON%20((10.0270%2053.5695,10.0370%2053.5695,10.0370%2053.5795,10.0270%2053.5795,10.0270%2053.5695))%27)&$expand=Locations)

*Note: Keep in mind to convert your projection into the used projection of the SensorThingsAPI.* If the server uses EPSG:4326 but your Masterportal is set to use EPSG:25832 you should use OpenLayers to convert. An alternative is provided by "masterportalAPI/src/crs" with its "transform" function.

Example to transform a Location from your current projection into EPSG:4326:
```
#!javascript

import {transform} from "masterportalAPI/src/crs";

const extent = Radio.request("MapView", "getCurrentExtent"),
    projection = Radio.request("MapView", "getProjection").getCode(),
    epsg = "EPSG:4326",
    topLeftCorner = transform(projection, epsg, {x: extent[0], y: extent[1]}),
    bottomRightCorner = transform(projection, epsg, {x: extent[2], y: extent[3]});

```

Working with the current extent given by an OpenLayer Map you will only get the top left corner and the bottom right corner. To draw yourself a POLYGON to be used with SensorThingsAPI, you need to draw your rectangle as follows:

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



## sensorThingsMqtt ##
Der FROST Server unterstützt aktuell keine *Retained Messages*.
Das Masterportal bietet Ihnen eine eigene mqtt Software Schicht an die *Retained Messages* simulieren kann.
So können Sie verhindern, dass Sie Ihre eigene Software Architektur wegen fehlender *Retained Messages* im mqtt Protokoll umbauen müssen.
Die *sensorThingsMqtt*-Schicht lässt sich wie das npm-Paket mqtt bedienen.



### Wie man mqtt implementiert ###
Hier ein einfaches Beispiel zur Implementierung des npm-Paketes mqtt mit Javascript:

```
#!javascript

import mqtt from "mqtt";

const client = mqtt.connect({
    host: "iot.example.com",
    protocol: "mqtt",
    path: "/"
});

client.on("connect", function () {
    client.subscribe("v1.0/Datastreams(74)/Observations", {
        qos: 0,
        retain: 0
    });
});

client.on("message", function (topic, payload) {
    if (topic === "v1.0/Datastreams(74)/Observations") {
        // note that payload is an Uint8Array and needs to be converted to JSON first
        const jsonPayload = JSON.parse(payload);

        // do something with jsonPayload
    }
});
```

Da der FROST Server keine *Retained Messages* unterstützt, wird das *on message*-Event nach dem Abonnement nicht sofort mit der letzten empfangenen Nachricht vom Broker aufgerufen (getriggert).
Wenn der hinter dem Topic stehende Publisher (Sensor) langsam ist (z.B. eine Ladesäule), würde das *on message*-Event vielleicht erst in einigen Stunden das erste Mal feuern.


### Simulation von Retained Messages ###
Die Lösung im Masterportal ist die Simulation von *Retained Messages* mit der *SensorThingsMqtt*-Schicht.
Nach außen hin sieht es so aus, als sei alles normal. Hier eine Beispiel-Implementierung der *SensorThingsMqtt*-Schicht. Beachten Sie die starke Ähnlichkeit zum Beispiel der Implementierung des npm-Paketes mqtt mit Javascript (s.o.):

```
#!javascript

import {SensorThingsMqtt} from "@modules/core/modelList/layer/sensorThingsMqtt";

const client = mqtt.connect({
    host: "iot.example.com",
    protocol: "mqtt",
    path: "/",
    context: this
});

client.on("connect", function () {
    client.subscribe("v1.0/Datastreams(74)/Observations", {
        qos: 0,
        retain: 0,
        rm_simulate: true
    });
});

client.on("message", function (topic, jsonPayload) {
    if (topic === "v1.0/Datastreams(74)/Observations") {
        // note that we already converted the payload to JSON - so no JSON.parse necessary at this point
        // do something with jsonPayload
    }
});
```

Die Änderungen im Detail:

 - context: hier übergeben Sie den für die Events zu verwendenden Scope (dann brauchen Sie kein .bind(this) zu benutzen)
 - rm_simulate: wenn dieses Flag auf true steht, werden *Retained Messages* simuliert. Steht das Flag auf false, gibt es keinen Unterschied zwischen SensorThingsMqtt und dem npm-Paket mqtt.
 - jsonPayload: die *sensorThingsMqtt*-Schicht wandelt alle Antworten vom Broker nach JSON um - daher kein eigenes Umwandeln mehr nötig.
 - bitte beachten Sie, dass wenn Sie *retain* auf 2 stellen, keine Simulation von Retained Messages stattfindet (selbst wenn rm_simulate auf true steht). Nehmen Sie hierzu die mqtt Spezifikation zur Kenntnis: "If the Retain Handling option is not 2, all matching retained messages are sent to the Client." ([Quelle](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc384800440))


### Konfiguration ###
Die *SensorThingsMqtt*-Schicht kann wie das npm-Paket mqtt verwendet werden. Es gibt jedoch Erweiterungen der Funktionen mqtt.connect und client.subscribe.

#### Optionen: SensorThingsMqtt.connect ####
|Name|Verpflichtend|Typ|default|Beschreibung|Beispiel|
|----|-------------|---|-------|------------|--------|
|host|Ja|String|-|der Host mit dem sich über mqtt verbunden wird|iot.hamburg.de|
|protocol|Nein|String|mqtt|das zu verwendende Protokoll|mqtt, mqtts, ws, wss, wx, wxs|
|path|Nein|String|emtpy|der vom Standard abweichende Pfad zur mqtt-Applikation auf dem Server. Dies kann der Fall sein, wenn ein anderes Protokoll als mqtt verwendet wird.|host: "iot.hamburg.de", protocol: "wss", path: "/mqtt" -> results in wss://iot.hamburg.de/mqtt|
|context|Nein|JavaScript Scope|Der Scope in dem die Events ausgeführt werden.|Wenn hier *this* eingetragen wird, kann *this* in den Events ohne extra binding verwendet werden.|

Beispiel:

```
#!javascript

import {SensorThingsMqtt} from "@modules/core/modelList/layer/sensorThingsMqtt";

const client = mqtt.connect({
    host: "iot.hamburg.de",
    protocol: "wss",
    path: "/mqtt",
    context: this
});
```

#### Optionen: SensorThingsMqttClient.subscribe ####
|Name|Verpflichtend|Typ|default|Beschreibung|Beispiel|
|----|-------------|---|-------|------------|--------|
|qos|Nein|Number|0|"The maximum Quality of Service level at which the Server can send Application Messages to the Client." [link](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901169)|0, 1 or 2|
|retain|Nein|Number|0|"flag of how to use Retained Messages for this subscription" [link](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc385349265)|0: get latest message on subscription, 1: get latest message only if first to subscribe on topic, 2: do not send messages on subscription|
|rm_simulate|Nein|Boolean|false|Flag zum Aktivieren der Simulation von *Retained Messages*|true oder false|
|rm_path|Nein|String|empty|der Pfad-Anteil in dem sich http- und mqtt-Abrufe unterscheiden|wenn http REST http://test.com/subpath/Datastreams , aber mqtt liegt unter mqtt://test.com/Datastreams , dann muss rm_path auf "subpath/" gestellt werden|
|rm_protocol|Nein|String|"https"|das für die Simulation von *Retained Messages* zu verwendende Protokoll|http, https, ...|
|rm_httpClient|Nein|Function|SensorThingsClientHttp|Eine Alternativ-Funktion mit der http Aufrufe stattfinden sollen. Per Default wird intern Axios verwendet.|Wenn Sie eine andere Art des Aufrufs von URLs wünschen, stellen Sie rm_httpClient ein als eine Funktion function(url, onsuccess) mit onsuccess als function(resp)|

Beispiel:

```
#!javascript

import {SensorThingsMqtt} from "@modules/core/modelList/layer/sensorThingsMqtt";

const client = mqtt.connect({
    host: "test.geoportal-hamburg.de",
    protocol: "wss",
    path: "/mqtt",
    context: this
});

client.on("connect", function () {
    client.subscribe("v1.0/Datastreams(74)/Observations", {
        qos: 0,
        retain: 0,
        rm_simulate: true,
        rm_path: "itsLGVhackathon/",
        rm_protocol: "https",
        rm_httpClient: function (url, onsuccess) {
            $.ajax({
                dataType: "json",
                url: url,
                async: true,
                type: "GET",
                success: onsuccess
            });
        }
    });
});
```



### Skalierbarkeit und Performanz ###
Der FROST Server unterstützt aktuell keine *Retained Messages*.
Unsere Lösung ist die Arbeit mit simulierten *Retained Messages* per http für jedes Abonnement. Diese Lösung skaliert nicht und hat eine geringe Performanz.
Wir hatten fünf Möglichkeiten zur Auswahl. Um Transparenz zu schaffen werden diese fünf Möglichkeiten hier dargestellt.
Bitte beachten Sie, dass die performanteste skalierende Methode die Verwendung "echter" *Retained Messages* auf Broker-Seite wäre.

 1. der FROST Server unterstützt Retained Messages
    - skaliert, hohe Performanz
    - aktuell nicht verfügbar
 2. ein initialer Abruf aller Nachrichten für alle Topics die abonniert werden sollen
    - skaliert nicht
    - Performanz hängt vom Server und dem Netzwerk des Clients ab
    - clientseitig schwer zu sauber zu implementieren
 3. Einzelabrufe von Topics bei jedem Abonnement: (Simulation von *Retained Messages*)
    - skaliert nicht
    - die Performanz hängt vom Netzwerk des Clients ab
 4. Schätzen der maximalen Anzahl gleichzeitig abrufbaren Datastream-Observations, ohne dass die Performanz dieses Einen Aufrufes leidet - und dann asynchroner Abruf in entsprechend großen Häppchen.
    - Die geschätzte maximale Anzahl ist abhängig vom Endanwender (Computer, Browser, Netzwerk) und von der Größen der Datenbank-Tabellen die sortiert werden müssen. Das variiert und macht die Schätzung unmöglich.
    - Wahrscheinlich wäre ein Zufalls-Wert für die Größe der Häppchen performanter als die Festlegung auf einen Wert.
    - Wir stoßen hier an die Grenzen dessen, was als Programmierer vertretbar ist.
 5. Wir legen ein Maximum an gleichzeitig abonnierbaren Features fest (z.B. 200 Features). Wird der Wert überstiegen, wird der Aufruf der Datastream-Observations entsprechend beschnitten und ein Hinweis an den Kunden ausgegeben, dass wir nicht mehr Features unterstützen können.
    - braucht nicht zu skalieren
    - hohe Performanz
    - aus UI-Sicht nicht vertretbar
    - widerspricht der Philosophie des Masterportals

Am 30. Januar 2020 haben wir uns für die 3. Möglichkeit entschieden:

  - diese ist am einfachsten zu implementieren
  - diese ist einfach austauschbar, wenn der FROST Server in Zukunft einmal *Retained Messages* anbietet



