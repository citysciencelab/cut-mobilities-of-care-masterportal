# Der BasicResizeHandle Component #

Dieser Component kann genutzt werden, um einem Container eine "Resizable" Fähigkeit zu verleihen. Der
Component selbst ist lediglich das Handle, um den Container in seiner Größe zu manipulieren.

Der Component kann wie folgt hinzugefügt und genutzt werden:

```
<script>

import BasicResizeHandle from "./share-components/BasicResizeHandle.vue";

// [...]

export default {
    name: "MyComponent",
    components: {
        BasicResizeHandle
    },
    methods: {
        onStartResizing: function (event) {
            console.log(event);
        },
        onEndResizing: function (event) {
            console.log(event);
        },
        onLeftScreen: function (event) {
            console.log(event);
        },
        onResizing: function (event) {
            console.log(event);
        }
    }
};
</script>

<template>
    <div 
        id="container-to-resize"
        @startResizing="onStartResizing"
        @endResizing="onEndResizing"
        @leftScreen="onLeftScreen"
        @resizing="onResizing"
    >
        <BasicResizeHandle
            v-for="hPos in ['tl', 't', 'tr', 'r', 'br', 'b', 'bl', 'l']"
            :key="hPos"
            :hPos="hPos"
            targetEl="#container-to-resize"
            grid="10"
            minW="50"
            minH="50"
        />
    </div>
</template>

<style lang="less" scoped>
    #container-to-resize {
        width:100px;
        height:100px;
        background-color:#AAAAAA;
        
        .basic-resize-handle {
            position:absolute;
            width:6px;
            height:6px;
            background-color:#FF0000;
        }
        #basic-resize-handle-tl { top:0px; left:0px; }
        #basic-resize-handle-t { top:0px; left:50%; }
        #basic-resize-handle-tr { top:0px; right:0px;}
        #basic-resize-handle-r { top:50%; right:0px;}
        #basic-resize-handle-br { bottom:0px; right:0px;}
        #basic-resize-handle-b { bottom:0px; right:50%;}
        #basic-resize-handle-bl { bottom:0px; left:0px;}
        #basic-resize-handle-l { bottom:50%; left:0px;}
    }
</style>

```

## Parameter beim Nutzen des Components ##
|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|targetEl|nein|String|""|Selector von Document aus abwärts, welcher den draggable Container selektiert. Falls leer gelassen, wird "targetSel" genutzt.|
|targetSel|nein|String|"offsetParent"|Selector vom Handle Component aus aufwärts, welcher den draggable Container selektiert. Bei "offsetParent" wird automatisch der nächste positionierte Parent gewählt. Dieser Parameter wird nur genutzt, wenn "targetEl" nicht genutzt wird.|
|grid|nein|Number|1|Hier kann ein Grid definiert werden. Die größe entspricht der Anzahl Pixel, welche sich der draggable Container mindestens bewegen muss.|
|hPos|nein|String|"bl"|Position des Handles. Achtung, dieser Parameter hat lediglich Einfluss auf das Verhalten des Components, nicht jedoch auf die tatsächliche Positionierung des Handles im DOM. Mögliche Werte sind "tl" (top left), "t" (top), "tr" (top right), "r" (right), "br" (bottom right), "b" (bottom), "bl" (bottom left), "l" (left).|
|symResize|nein|Boolean|false|Flag, ob Resize symmetrisch ist. Wenn ja, wird das Element sich relativ zu seinem Mittelpunkt verändern. Falls nein, relativ zum gegenüberliegenden Punkt.|
|minW|nein|Number|-Infinity|Minimale Breite des Elements.|
|maxW|nein|Number|Infinity|Maximale Breite des Elements.|
|minH|nein|Number|-Infinity|Minimale Höhe des Elements.|
|minH|nein|Number|Infinity|Maximale Höhe des Elements.|

## Events ##
BasicResizeHandle Component wirft folgende Events:
startResizing, endResizing, leftScreen, resizing
