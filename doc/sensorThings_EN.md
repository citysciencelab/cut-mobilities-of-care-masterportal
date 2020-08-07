>Back to **[Documentation Masterportal](doc.md)**.

>Hier geht es zur deutschen Dokumentation dieser Datei: [sensorThings.md](sensorThings.md).

[TOC]


# Masterportal - Sensor Layer #
This document describes the sensor layer of the Masterportal based on the SensorThingsAPI.


## Clarifications ##


### OGC SensorThings API ###
The Open Geospatial Consortium (OGC) SensorThingsAPI "provides an open standard-based and geospatial-enabled framework to interconnect the Internet of Things devices, data, and applications over the Web." ([source](https://docs.opengeospatial.org/is/15-078r6/15-078r6.html#6)) The framework includes a data model that provides all the things a broker (the server) needs in a network of publishers (sensors) and clients (browsers etc.).

For more information about the open standard SensorThingsAPI visit:

 - [https://docs.opengeospatial.org/is/15-078r6/15-078r6.html#1](https://docs.opengeospatial.org/is/15-078r6/15-078r6.html#1)
 - [http://developers.sensorup.com/docs/](http://developers.sensorup.com/docs/)
 - [https://gost1.docs.apiary.io/#reference/0/things](https://gost1.docs.apiary.io/#reference/0/things)

The data diagramm can also be seen here:

 - [http://docs.opengeospatial.org/is/15-078r6/15-078r6.html#24](http://docs.opengeospatial.org/is/15-078r6/15-078r6.html#24)


### FROST Server ###
The FROST Server is the Fraunhofer Open-source SensorThings Server. It is "a Server implementation of the OGC SensorThings API." ([source](https://github.com/FraunhoferIOSB/FROST-Server)) In our case the FROST Server deals as broker between the publisher (sensor) and the client (Masterportal, browser). The content of the FROST Server can be called bidirectional using http and its live updates via mqtt or CoAP.


### The REST API - http ###
To narrow down the topics you want to subscribe to, use a http REST call.

*Important note: You can use expand and filter in the url query only with http REST calls. With mqtt you can only subscribe on a plain path, as url querys will be ignored (no use of $expand or $filter or $orderby or ... in subscriptions).*

Here are some basic examples:

 - overview: [https://iot.hamburg.de/](https://iot.hamburg.de/)
 - all Things of the SensorThingsAPI: [https://iot.hamburg.de/v1.0/Things](https://iot.hamburg.de/v1.0/Things)
 - one Thing of the SensorThingsAPI: [https://iot.hamburg.de/v1.0/Things(26)](https://iot.hamburg.de/v1.0/Things(26))
 - one Datastream: [https://iot.hamburg.de/v1.0/Datastreams(74)](https://iot.hamburg.de/v1.0/Datastreams(74))
 - all Datastreams of one Thing: [https://iot.hamburg.de/v1.0/Things(26)/Datastreams](https://iot.hamburg.de/v1.0/Things(26)/Datastreams)
 - all Observations of a Datastream: [https://iot.hamburg.de/v1.0/Datastreams(74)/Observations](https://iot.hamburg.de/v1.0/Datastreams(74)/Observations)

The FROST Server implements a REST API that allows you to expand and filter the query based on a sql like query language. To join tables use the $expand tag in the query url and seperate multiple joins with a simple comma.

 - one Thing with its Location: [https://iot.hamburg.de/v1.0/Things(26)?$expand=Locations](https://iot.hamburg.de/v1.0/Things(26)?$expand=Locations)
 - one Things with its Location and Observations (note that Observations are in relation with Datastreams, not with Things): [https://iot.hamburg.de/v1.0/Things(26)?$expand=Locations,Datastreams/Observations](https://iot.hamburg.de/v1.0/Things(26)?$expand=Locations,Datastreams/Observations)

To filter Things without knowing its identifier, use $filter as url query.

 - find a Thing by its name with $filter=name eq '...': [https://iot.hamburg.de/v1.0/Things?$filter=name%20eq%20%27StadtRad-Station%20Grandweg%20/%20Veilchenweg%27](https://iot.hamburg.de/v1.0/Things?$filter=name%20eq%20%27StadtRad-Station%20Grandweg%20/%20Veilchenweg%27)

To order Things use $orderby. This is important if you want to get the latest Observation, as they are sorted ascending by default. Use $top=x to select only top results.

 - order the Observations and pick the first one using $orderby=phenomenonTime desc&$top=1: [https://iot.hamburg.de/v1.0/Datastreams(74)/Observations?$orderby=phenomenonTime%20desc&$top=1](https://iot.hamburg.de/v1.0/Datastreams(74)/Observations?$orderby=phenomenonTime%20desc&$top=1)

You can use sub expands to get even better results:

 - [http://iot.hamburg.de/v1.0/Things(614)?$expand=Datastreams($expand=Observations),Locations](http://iot.hamburg.de/v1.0/Things(614)?$expand=Datastreams($expand=Observations),Locations)

To get Things within an extent use a POLYGON:

 - [https://iot.hamburg.de/v1.0/Things?$filter=startswith(Things/name,%27StadtRad-Station%27)%20and%20st_within(Locations/location,geography%27POLYGON%20((10.0270%2053.5695,10.0370%2053.5695,10.0370%2053.5795,10.0270%2053.5795,10.0270%2053.5695))%27)&$expand=Locations](https://iot.hamburg.de/v1.0/Things?$filter=startswith(Things/name,%27StadtRad-Station%27)%20and%20st_within(Locations/location,geography%27POLYGON%20((10.0270%2053.5695,10.0370%2053.5695,10.0370%2053.5795,10.0270%2053.5795,10.0270%2053.5695))%27)&$expand=Locations)

Let's break this down:

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

You will receive only those things that location is within the given polygon. This can increase the speed of the network delivery as you can call for only those Things that are in your actual browser extent and you would only subscribe those.



### The REST API - mqtt ###
mqtt is a protocol made for the Internet of Things to keep an open connection to the server and communicate with pull (commands from client to server) and push (messages from server to client) over one connection without ever closing it.
In the browser this might be implemented using socket.io.
If you use npm you would use the mqtt package instead.

The client uses mqtt to subscribe to a topic.
A topic is a plain path to something (e.g. "v1.0/Datastreams(74)/Observations").
Note: The used host is given to mqtt at connect.
Therefore a topic leaves the hostname open.

After subscribing to a topic (e.g. "v1.0/Datastreams(74)/Observations") the server will push every new message (e.g. the Observation of the Datastream 74) over the opened mqtt connection to the client.
As mqtt can only subscribe and unsubscribe topics, you have to use http requests (as shown above) to assemble the parts of your topic.
All entities of the SensorThingsAPI can be requested as topic.

As mentioned before, you can only subscribe to plain REST urls. Everything in the query part will be ignored:

 - this will work fine with mqtt: mqtt://iot.hamburg.de/v1.0/Datastreams(74)/Observations
 - this woun't work with mqtt: mqtt://iot.hamburg.de/v1.0/Datastreams(74)?$expand=Observations


The currently used mqtt versions are:

 - mqtt v3.1:   [http://public.dhe.ibm.com/software/dw/webservices/ws-mqtt/mqtt-v3r1.html](http://public.dhe.ibm.com/software/dw/webservices/ws-mqtt/mqtt-v3r1.html)
 - mqtt v3.1.1: [https://docs.oasis-open.org/mqtt/mqtt/v3.1.1/mqtt-v3.1.1.html](https://docs.oasis-open.org/mqtt/mqtt/v3.1.1/mqtt-v3.1.1.html)
 - mqtt v5.0:   [https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html)






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

Please note that the http.get call in itself is asynchronous. All parameters of *SensorThingsHttp.get()* except for "url" are optional. It makes sense of cause to use at least onsuccess to receive the response.


### configuration ###
SensorThingsHttp can be configured with two parameters via constructor.


|name|mandatory|type|default|description|example|
|----|-------------|---|-------|------------|--------|
|removeIotLinks|No|Boolean|false|removes all "@iot.navigationLink" and "@iot.selfLink" from the response to reduce the size of the result|const http = new SensorThingsHttp({removeIotLinks: true});|
|httpClient|No|Function|null|can be used to change the default http handler (in our case axios), e.g. for testing|const http = new SensorThingsHttp({httpClient: (url, onsuccess, onerror) => {}});|




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



### @iot.nextLink on different levels ###
If you don't want to use *SensorThingsHttp* to automaticaly follow @iot.nextLink on different levels, here is a short discription of what awaits you.

Any structure (an array) in the response of the SensorThingsAPI can be splitted with an @iot.nextLink. This leads to @iot.nextLinks on multi levels.
Only the main structure uses a pure "@iot.nextLink" to describe its followups. Substructures use the key name as prefix. e.g. Observations@iot.nextLink, Datastreams@iot.nextLink

**example**

 - url: [https://udh-hh-iot-qs.germanynortheast.cloudapp.microsoftazure.de/v1.0/Things?$expand=Datastreams($top=2;$expand=Observations($top=2))](https://udh-hh-iot-qs.germanynortheast.cloudapp.microsoftazure.de/v1.0/Things?$expand=Datastreams($top=2;$expand=Observations($top=2)))
 - response: Many Things with many Datastreams with many Observations.
 - hint: In this example we use $top=2 to enforce splitting with [prefix]@iot.nextLink on any expanded sublevel.

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

Let's follow the Datastreams@iot.nextLink: [https://udh-hh-iot-qs.germanynortheast.cloudapp.microsoftazure.de/v1.0/Things(5432)/Datastreams?$top=2&$skip=2&$expand=Observations%28%24top%3D2%29](https://udh-hh-iot-qs.germanynortheast.cloudapp.microsoftazure.de/v1.0/Things(5432)/Datastreams?$top=2&$skip=2&$expand=Observations%28%24top%3D2%29)
We receive a structure for Datastreams only:
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

Keep in mind that a single Thing has no @iot.nextLink nor "value" key. e.g. [https://udh-hh-iot-qs.germanynortheast.cloudapp.microsoftazure.de/v1.0/Things(5432)?$expand=Datastreams($top=2)](https://udh-hh-iot-qs.germanynortheast.cloudapp.microsoftazure.de/v1.0/Things(5432)?$expand=Datastreams($top=2))
But even in this case there can be substructures with [prefix]@iot.nextLink to follow.





### @iot.nextLink and depth barriers ###
The end of @iot.nextLink followups is marked by the absence of a next @iot.nextLink to follow.
But: If you limit the response using some $top=X (with X the number of entities to load) an @iot.nextLink is given anyhow.
Following @iot.nextLink stoical, will lead to a cascade of server calls anytime you cut the response with $top=X.

e.g. [https://udh-hh-iot-qs.germanynortheast.cloudapp.microsoftazure.de/v1.0/Datastreams(13980)/Observations?$top=1](https://udh-hh-iot-qs.germanynortheast.cloudapp.microsoftazure.de/v1.0/Datastreams(13980)/Observations?$top=1)
```
#!json
{
  "@iot.nextLink" : "https://udh-hh-iot-qs.germanynortheast.cloudapp.microsoftazure.de/v1.0/Datastreams(13980)/Observations?$top=1&$skip=1",
  "value" : [ {...} ]
}
```

Unfortunately you can't simply ignore @iot.nextLink if you find a $top=X in the @iot.nextLink, as the X in $top=X can exceed "the service-driven pagination limitation":

_"In addition, if the $top value exceeds the service-driven pagination limitation (...), the $top query option SHALL be discarded and the server-side pagination limitation SHALL be imposed."_
[https://docs.opengeospatial.org/is/15-078r6/15-078r6.html#51](https://docs.opengeospatial.org/is/15-078r6/15-078r6.html#51)

A simple @iot.nextLink search for "$top=X" or "%24top=X" in combination with "$skip=Y" or "%24skip=Y" will do the trick, as any $top=X not related to the root structure is url encoded with "%3D" instead of "=".
e.g. [https://udh-hh-iot-qs.germanynortheast.cloudapp.microsoftazure.de/v1.0/Things(5432)/Datastreams?%24top=2&%24skip=2&%24expand=Observations%28%24top%3D2%29](https://udh-hh-iot-qs.germanynortheast.cloudapp.microsoftazure.de/v1.0/Things(5432)/Datastreams?%24top=2&%24skip=2&%24expand=Observations%28%24top%3D2%29)

 - Regex for $top=X: /[\$|%24]top=([0-9]+)/
 - Regex for $skip=X: /[\$|%24]skip=([0-9]+)/

Apply this code as your additional depth barrier:

```
// pseudo code, some nextLink is given
int topX = fetchTopFromNextLink(nextLink);
int skipX = fetchSkipFromNextLink(nextLink);

if (topX > 0 && topX <= skipX) {
    // do not follow (depth barrier)
}
```



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





## SensorThingsMqtt ##
For the Masterportal we developed a software layer to handle mqtt subscriptions for mqtt 3.1, mqtt 3.1.1 and mqtt 5.0.
You have to know what mqtt version runs on the mqtt server you connect to.

This is a basic example for mqtt 5.0:

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


This is a basic example for mqtt 3.1 or 3.1.1:

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

Received messages can only be assigned to the handler in the mqtt on(message)-event.
You have to find out the correct handler via topic.






### Configuration - Constructor ###
The software layer SensorThingsMqtt is a class you have to configure at construction time.
Creating a new instance, the connection to the mqtt server is established once for an instance in the background.

|name|mandatory|type|default|description|example|
|----|---------|----|-------|-----------|-------|
|mqttUrl|yes|String|""|The url to your mqtt server.|"wss://iot.hamburg.de/mqtt"|
|mqttVersion|no|String|"3.1.1"|The mqtt version your server runs on.|"3.1", "3.1.1", "5.0"|
|rhPath|no|String|""|For 3.1 and 3.1.1 only you need to give us the basic http path to your SensorThingsApi to simulate Retained Handling.|"https://iot.hamburg.de"|
|context|no|JavaScript Scope|The scope to run the events in.|If you set context to this, you can use this in your event functions to reach your current module.|this|



#### mqttUrl ####
Your mqttUrl is the url to connect to your mqtt service.
The URL can be on the following protocols: 'mqtt', 'mqtts', 'tcp', 'tls', 'ws', 'wss'. (see: [https://www.npmjs.com/package/mqtt](https://www.npmjs.com/package/mqtt))


#### mqttVersion ####
The mqttVersion will trigger different behaviors of the SensorThingsMqtt software layer.

 - "3.1": the internal protocolId is "MQIsdp" (3.1.1 and 5.0 uses "MQTT") and the internal protocolVersion is 3 (3.1.1 and 5.0 uses protocolVersion 4). Simulation of Retained Handling will be activated if you provide a rhPath.
 - "3.1.1": the simulation of Retained Handling will be activated if you provide a rhPath.
 - "5.0": no simulation of Retained Handling necessary (you must not provide a rhPath), the event on(disconnect) is provided as feature for 5.0


#### rhPath ####
The rhPath is used to simulate Retained Handling, if your mqtt version is 3.1 or 3.1.1.
To find out your rhPath just think of it as the missing prefix for a topic.

e.g. if you can access something in your SensorThingsApi like "https://iot.hamburg.de/v1.0/Things(1234)/Datastreams", you would subscribe to a topic via mqtt like "v1.0/Things(1234)/Datastreams".
Then your rhPath is what is missing in your topic to receive data via http. In this case: "https://iot.hamburg.de"

Be aware that your http path might differ from your mqtt path: e.g. "wss://iot.hamburg.de/mqtt" (with subscription on "v1.0/Things(1234)/Datastreams")




### Configuration - Subscribe ###
After construction you can subscribe with the instance of SensorThingsMqtt.

|name|mandatory|type|default|description|example|
|----|---------|----|-------|-----------|-------|
|qos|no|Number|0|Quality of service subscription level [https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901169](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901169)|0, 1 or 2|
|rh|no|Number|2|"This option specifies whether retained messages are sent when the subscription is established." [https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901169](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901169)|0, 1 or 2|


#### rh ####
Retained Handling (rh) between browser and server is only available for mqtt 5.0 - but:
As only mqtt 5.0 supports Retained Handling, for 3.1 and 3.1.1 our software layer simulates Retained Messages bypassing mqtt over http (using SensorThingsHttp to receive the last message from the sensor).

The Retained Handling can be configured as rh := 0, 1 or 2.

 - rh := 0; If you subscribe, you'll receive one old message (the last message) from the sensor immediately via message event.
 - rh := 1; If you subscribe, you'll receive one old message (the last message) only if you are the first process in your application to subscribe onto this topic.
 - rh := 2; If you subscribe, you will not receive any last message of the sensor, but only "fresh" messages in the future.





### Retained Handling ###
An important option for mqtt subscriptions is the so called "Retained Handling" (rh).

A "Retained Message" is a message from a sensor send some time in the past, but stored by the server to send immediately after subscription.

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

As this might be an unwanted behavior, Retained Handling is set off by default (rh: 2).

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

There will be times when you have to differ between a message received as Retained Message and a message received as new message from the server.

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



### close the mqtt connection ###
To close your mqtt connection, you can call "end" on the SensorThingsMqtt instance.

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

To understand more about the parameters please visit [https://www.npmjs.com/package/mqtt#end](https://www.npmjs.com/package/mqtt#end), as the end-call is passed through as it is.
