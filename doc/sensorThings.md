>Zurück zur **[Dokumentation Masterportal](doc.md)**.

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
mqtt is a protocol made for the Internet of Things to keep an open connection to the server and communicate with pull (commands from client to server) and push (messages from server to client) over one connection without ever closing it. In the browser this might be implemented using socket.io. If you use npm you would use the mqtt package instead.

The client uses mqtt to subscribe to a topic. A topic is a plain path to something (e.g. "v1.0/Datastreams(74)/Observations"). Note: The used host is given to mqtt at connect. Therefore a topic leaves the hostname open.

After subscribing to a topic (e.g. "v1.0/Datastreams(74)/Observations") the server will push every new message (e.g. the Observation of the Datastream 74) over the opened mqtt connection to the client. As mqtt can only subscribe and unsubscribe topics, you have to use http requests (as shown above) to assemble the parts of your topic. All entities of the SensorThingsAPI can be requested as topic.

As mentioned before, you can only subscribe to plain REST urls. Everything in the query part will be ignored:

 - this will work fine with mqtt: mqtt://iot.hamburg.de/v1.0/Datastreams(74)/Observations
 - this woun't work with mqtt: mqtt://iot.hamburg.de/v1.0/Datastreams(74)?$expand=Observations

The currently used mqtt version in the Masterportal is: 3.1.1

 - More information about mqtt 3.1.1: [https://docs.oasis-open.org/mqtt/mqtt/v3.1.1/mqtt-v3.1.1.html](https://docs.oasis-open.org/mqtt/mqtt/v3.1.1/mqtt-v3.1.1.html)
 - More information about mqtt 5.0.0: [https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html)



### mqtt - Retained Messages ###
Following the mqtt protocol, the publisher (sensor) must declare themselves as slow. Therefore the broker (server) is asked to cache (retain) its latest received message to send to subscribing clients to come. If a publisher has a high frequency (e.g. every second a new measurment) the publisher should not demand the use of Retained Messages for performance reasons.

With Retained Messages the mqtt broker (server) keeps the latest message of the publisher (sensor) in its cache. Without Retained Messages only new received messages from the publisher are broadcasted to listening clients. In conclusion no "last message" from the brokers cache will be send to subscribing clients if the publisher disclaims the use of Retained Messages.

 - For more information about Retained Messages demanded by the publisher: [https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901104](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901104)
 - For more information about Retained Messages Flags of the client and their purpose: [https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc384800440](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc384800440)



### FROST Server and Retained Messages ###
Currently the FROST Server does not support Retained Messages. If you want to receive the latest message at subscription time you need to get it by a different path. Currently the FROST Server only broadcasts received messages without caching them regardless of what the publisher demands regarding Retained Messages.

To solve this problem the Masterportal has its own mqtt software layer called **[sensorThingsMqtt](#sensorthingsmqtt)** that simulates Retained Messages.



## sensorThingsMqtt ##
Currently the FROST Server does not support Retained Messages. The Masterportal provides you with a mqtt software layer that can simulate Retained Messages to avoid bypassing this information otherwise and changing your sensor architecture because of the special needs of the FROST Server.


### how to implement mqtt ###
The out of the book implementation of npms mqtt package with JavaScript goes like this:

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

Because the FROST Server does not support Retained Messages, the on message event will not be triggert by the broker (server) immediately after the subscription. If the topic is part of a slow measuring publisher (sensor, e.g. a charging station) the on message event will be called somewhere in the distant future but not immediately. Retained Messages would have provide us with the latest message shortly after subscription. But we have no Retained Messages using the FROST Server.


### Simulation of Retained Messages ###
Our solution for the Masterportal is a simulation of Retained Messages in a software layer called **SensorThingsMqtt**. Using this software layer you can use mqtt as if Retained Messages are available. The implementation is something similar to the "out of the book implementation" above.

It goes like this:

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

Note the changes:

 - context: here you can set your this scope for the events (on connect and on message)
 - rm_simulate: if set to true a simulation of Retained Messages via https will take place
 - jsonPayload: using sensorThingsMqtt the payload is always delivered as a JavaScript Object or JSON - no need to parse it furthermore
 - note that no simulation of Retained Messages will take place if retain is set to 2 (even if rm_simulate is true). Negate this sentence: "If the Retain Handling option is not 2, all matching retained messages are sent to the Client." ([source](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc384800440))


### Configuration ###
The software layer SensorThingsMqtt can be used similar to npm mqtt (as shown above).

Nevertheless there are some additions in the configuration of mqtt.connect and client.subscribe.

#### Options: SensorThingsMqtt.connect ####
|name|mandatory|type|default|description|example|
|----|---------|----|-------|-----------|-------|
|host|yes|String|-|the host to connect mqtt to|iot.hamburg.de|
|protocol|no|String|mqtt|the protocol to use|mqtt, mqtts, ws, wss, wx, wxs|
|path|no|String|emtpy|The path to follow for the mqtt application on the server. This could be the case if you use a different protocol than mqtt.|e.g. host: "iot.hamburg.de", protocol: "wss", path: "/mqtt" -> results in wss://iot.hamburg.de/mqtt|
|context|no|JavaScript Scope|The scope to run the events in.|If you set context to this, you can use this in your event functions to reach your current module.|

Example:

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

#### Options: SensorThingsMqttClient.subscribe ####
|name|mandatory|type|default|description|example|
|----|---------|----|-------|-----------|-------|
|qos|no|Number|0|The maximum Quality of Service level at which the Server can send Application Messages to the Client. [link](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901169)|0, 1 or 2|
|retain|no|Number|0|flag of how to use Retained Messages for this subscription [link](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc385349265)|0: get latest message on subscription, 1: get latest message only if first to subscribe on topic, 2: do not send messages on subscription|
|rm_simulate|no|Boolean|false|activate the simulation of Retained Messages||
|rm_path|no|String|empty|a path on the server in case the path differs from the standard implementation|if http REST is http://test.com/subpath/Datastreams but mqtt is mqtt://test.com/Datastreams you then want to set rm_path to "subpath/"|
|rm_protocol|no|String|"https"|the protocol to use for the simulation|http, https, ...|
|rm_httpClient|no|Function|SensorThingsClientHttp|an alternative function to call http urls with; the default http handler uses axios|if you prefer a different httpclient set rm_httpClient as a function(url, onsuccess) with onsuccess as function(resp)|

Example:

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



### Scalability and Performance ###
Our solution to simulate Retained Messages for each subscription via http has a low scalability and a weak performance. We choose this solution out of fife potential resolutions. To follow our thoughts keep in mind that with real Retained Messages cached by the server scalability and performance would not be an issue for the sensor layer of the Masterportal. We had to compromise as follows:

 1. the FROST Server implements Retained Messages
    - high scalability and high performance
    - not available at this point in time
 2. call at once and before any subscription has been made: get all initial data of all topics you want to subscribe to with one http request
    - low scalability
    - performance depends on the quality of server and network
    - hard to implement in a comprehensible way
 3. call one by one for each topic: get the data of each topic with http after a subscription is made (simulation of Retained Messages)
    - low scalability
    - performance depends on the quality of the network
 4. estimation of the approximately best size for requests (like 2.) and then sending many of queued requests before any subscripition is done
    - scalability and performance debend on the estimation, might be low
    - nearly impossible to estimate
    - no programmer should take responsibility for something like this
 5. like 2. but with a defined maximum of topics to subscribe to (e.g. 200)
    - high scalability (mustn't scale up)
    - high performance (no need for it)
    - bad UI
    - contradicts with the philosophy of the Masterportal

On january 30th 2020 a decision has been made for 3.:

  - it is the easiest way to implement
  - it is simply exchangeable if the FROST Server would support Retained Messages in the future, because only one software layer would be affected



