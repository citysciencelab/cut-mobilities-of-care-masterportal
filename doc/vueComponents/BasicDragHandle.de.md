# Der BasicDragHandle Component #

Dieser Component kann genutzt werden, um einem Container eine "Draggable" Fähigkeit zu verleihen. Der
Component selbst ist lediglich das Handle, um den Container zu bewegen.

Der Component kann wie folgt hinzugefügt und genutzt werden:

```
<script>

import BasicDragHandle from "./share-components/BasicDragHandle.vue";

// [...]

export default {
    name: "MyComponent",
    components: {
        BasicDragHandle
    },
    methods: {
        onStartDragging: function (event) {
            console.log(event);
        },
        onEndDragging: function (event) {
            console.log(event);
        },
        onLeftScreen: function (event) {
            console.log(event);
        },
        onDragging: function (event) {
            console.log(event);
        }
    }
};
</script>

<template>
    <div id="containment-element">
        <div 
            id="container-to-drag"
            @startDragging="onStartDragging"
            @endDragging="onEndDragging"
            @leftScreen="onLeftScreen"
            @dragging="onDragging"
        >
            <BasicDragHandle
                targetEl="#container-to-drag"
                margin="12"
                grid="10"
            >
                <p>
                    Use this drag handle!
                </p>
            </BasicDragHandle>
        </div>
    </div>
</template>

<style lang="less" scoped>
    #containment-element {
        position:relative;
        height:500px;
        width:500px;
        border:1px solid #AAAAAA;
    }
    #container-to-drag {
        position:absolute;
        width:100px;
        height:100px;
        background-color:#FF0000;
        
        p {
            position:absolute;
            top:0;
            right:0;
            left:0;
            height:20px;
            text-align:center;
            cursor:move;
        }
    }
</style>

```

## Parameter beim Nutzen des Components ##
|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|targetEl|nein|String|""|Selector von Document aus abwärts, welcher den draggable Container selektiert. Falls leer gelassen, wird "targetSel" genutzt.|
|targetSel|nein|String|"offsetParent"|Selector vom Handle Component aus aufwärts, welcher den draggable Container selektiert. Bei "offsetParent" wird automatisch der nächste positionierte Parent gewählt. Dieser Parameter wird nur genutzt, wenn "targetEl" nicht genutzt wird.|
|grid|nein|Number|1|Hier kann ein Grid definiert werden. Die größe entspricht der Anzahl Pixel, welche sich der draggable Container mindestens bewegen muss.|
|isEnabled|nein|Boolean|true|Flag, ob draggable Handle aktiviert ist.|
|margin|nein|Number|0|Margin des draggable Containers zum offsetParent.|
|marginTop|nein|Number|0|Margin-top des draggable Containers zum offsetParent. Überschreibt "margin".|
|marginRight|nein|Number|0|Margin-right des draggable Containers zum offsetParent. Überschreibt "margin".|
|marginBottom|nein|Number|0|Margin-bottom des draggable Containers zum offsetParent. Überschreibt "margin".|
|marginLeft|nein|Number|0|Margin-left des draggable Containers zum offsetParent. Überschreibt "margin".|

## Events ##
BasicDragHandle Component wirft folgende Events:
startDragging, endDragging, leftScreen, dragging