# Remote-Interface

Using Remote-Interface, any VueX Action may be called. Further, a set of dedicated functions may be called.

## Generic Remote-Interface to call VueX-Actions
|Name|Type|Explanation|
|----|---|------------|
|namespace|String|Namespace of VueX module|
|action|String|Name of called action|
|args|Object|Param-Object for called action|

#### Example
Any VueX action may be called as follows:

```js
const myIframe = document.getElementById("my-iframe");
myIframe.contentWindow.postMessage({
    namespace: "Name/Space/Of/VueX/Store",
    action: "nameOfAction",
    args: {
        "param1": "value1",
        "paramX": "valueX"
    }
});
```

Remote-Interface will actually call:

```js
store.dispatch("Name/Space/Of/VueX/Store/nameOfAction", {"param1": "value1", "paramX": "valueX"}, {root: true});

```

## Calling a deticated function via Remote-Interface
Using an object as param, its key represents the name of desired deticated function while its value represents the params given to the desired deticated function.

|Name|Type|Explanation|
|----|---|------------|
|nameOfFunction|Array|Params to invoke deticated function|
|domain|String|Receiver window's domain|

#### Example
A specific function may be invoked as follows:

```js
const myIframe = document.getElementById("my-iframe");
myIframe.contentWindow.postMessage({nameOfFunction: "specificFunction", ["param1", "param2", "paramX"]}, domain);
```

### List of deticated functions
#### showPositionByExtent
A map marker will be placed at the center of given extent. Map view will be centered on said marker.

|Name|Type|Explanation|
|----|---|------------|
|showPositionByExtent|Array|Extent, where the map marker shall be set|
|domain|String|Receiver window's domain|

#### Example

```js
const myIframe = document.getElementById("my-iframe").contentWindow;
iframe.postMessage({"showPositionByExtent": [xMin, yMin, xMax, yMax]}, domain);
```

#### showPositionByExtentNoScroll
A map marker will be placed at the center of given extent. Map view will not be centered.

|Name|Type|Explanation|
|----|---|------------|
|showPositionByExtentNoScroll|Array|Extent, where the map marker shall be set|
|domain|String|Receiver window's domain|

#### Example
```js
const myIframe = document.getElementById("my-iframe").contentWindow;
iframe.postMessage({"showPositionByExtentNoScroll": [xMin, yMin, xMax, yMax]}, domain);
```
#### transactFeatureById
Modify a feature of given WFST-Layer.

|Name|Type|Explanation|
|----|---|------------|
|transactFeaturesById|String|Id of Feature.|
|layerId|String|Id of Layer.|
|attributes|String|JSON containing feature attributes.|
|mode|String|Name of operation to be executed. Currently, only "update" is available|
|domain|String|Receiver window's domain|

#### Example
```js
const myIframe = document.getElementById("my-iframe").contentWindow;
iframe.postMessage({"transactFeatureById": "id", "layerId": layerId, "attributes": attrs, "mode": "update"}, domain);
```

#### zoomToExtent
Map view will be centered upon given extent.

|Name|Type|Explanation|
|----|---|------------|
|zoomToExtent|Array|Extent.|
|domain|String|Receiver window's domain|

#### Example
```js
const myIframe = document.getElementById("my-iframe").contentWindow;
iframe.postMessage({"zoomToExtent": [xmin, ymin, xmax, ymax]}, domain);
```

#### highlightfeature
Highlight a vector feature on the map.

|Name|Type|Explanation|
|----|---|------------|
|highlightfeature|String|LayerId and FeatureId as a String separated by comma|
|domain|String|Receiver window's domain|

#### Example
```js
const myIframe = document.getElementById("my-iframe").contentWindow;
iframe.postMessage({"highlightfeature": "layerid,featureId"}, domain);
```

#### hidePosition
Hide the map marker.

|Name|Type|Explanation|
|----|---|------------|
|hidePosition|String|Using "hidePosition" hides the marker|
|domain|String|Receiver window's domain|

#### Example
```js
const myIframe = document.getElementById("my-iframe").contentWindow;
iframe.postMessage("hidePosition", domain);
```

## Generic Remote-Interface for Backbone Radio (Depricated)
It is possible to communicate vie postMessage() by using Backbone Radio. When using this, you need to specify a radio channel and function name.

Notice: As this feature is based upon Backbone Radio, it is depricated all along.

|Name|Type|Explanation|
|----|---|------------|
|radio_channel|String|Desired Radio-Channel|
|radio_function|String|Desired function destributed by the Radio channel|
|radio_para_object|Object|(optional) A Param-Object to be forwarded to the invoked function|
|domain|String|Receiver window's domain|

#### Example
```js
const myIframe = document.getElementById("my-iframe").contentWindow;
iframe.postMessage({"radio_channel": "MyRadioChannel", "radio_function": "myRequestedFunction", "radio_para_object": {"param1": "param1", "paramX": "paramX"}}, domain);
```

Remote-Interface calls as follows:

```js
Radio.request("MyRadioChannel", "myRequestedFunction", {"param1": "param1", "paramX": "paramX"});
```

## Communicate from Master-Portal to parent window
As you may communicate from parent window to Master-Portal, you alsomay communicate vice versa.

|Name|Type|Explanation|
|----|---|------------|
|params|Object|Param-object to be sent to parent window|

#### Example

Inside a Vue component:
```js
this.$remoteInterface.sendMessage({"param1": "param1", "paramX": "paramX"});
```

Inside a VueX action:
```js
this._vm.$remoteInterface.sendMessage({"param1": "param1", "paramX": "paramX"});
```

Remote-Interface will call as follows:
```js
parent.postMessage({"param1": "param1", "paramX": "paramX"}, options.postMessageUrl);
```

## Communicate from Master-Portal to parent window via Backbone Radio (depricated)
Also possible is the usage of Backbone Radio.

|Name|Type|Explanation|
|----|---|------------|
|params|Object|Param-object to be sent to parent window|

#### Example
```js
Radio.trigger("RemoteInterface", "postMessage", {"param1": "param1", "paramX": "paramX"});
```