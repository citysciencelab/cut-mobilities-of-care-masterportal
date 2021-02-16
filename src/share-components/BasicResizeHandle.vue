<script>
export default {
    name: "BasicResizeHandle",
    props: {
        // Draggable element directly as is.
        targetEl: {
            type: String,
            default: "",
            required: false
        },
        // A query selector to find the resizable element. Will look upwards.
        targetSel: {
            type: String,
            default: "offsetParent",
            required: false
        },
        // Gridsize for snappy resize.
        grid: {
            type: Number,
            default: 1,
            required: false
        },
        // Position type of handle element (ie "bl" == "bottom left", "tr" == "top right" etc).
        hPos: {
            type: String,
            default: "bl",
            required: false
        },
        // Flag to determine if resize will be symmetric based on resizable element's center point
        symResize: {
            type: Boolean,
            default: false,
            required: false
        },
        // Resizable element's min width.
        minW: {
            type: Number,
            default: -Infinity,
            required: false
        },
        // Resizable element's max width.
        maxW: {
            type: Number,
            default: Infinity,
            required: false
        },
        // Resizable element's min height.
        minH: {
            type: Number,
            default: -Infinity,
            required: false
        },
        // Resizable element's max height.
        maxH: {
            type: Number,
            default: Infinity,
            required: false
        }
    },
    data: function () {
        return {
            isResizing: false, // Flag to determine, if element is resizing right now
            startC: {x: 0, y: 0}, // Initial cursor position before resize start
            diffCRot: {x: 0, y: 0}, // Cursor position difference during resizing (modified by rotation)
            startR: 0, // Initial element rotation
            startP: {top: 0, left: 0}, // Initial starting position of resizable element
            startD: {width: 0, height: 0}, // Initial starting dimanesions of resizable element
            touchStarted: false, // Flag to avoid ghost click event
            timeoutReference: null, // Timeout reference to avoid ghost click event
            hSigns: {
                tl: [-1, -1],
                t: [0, -1],
                tr: [1, -1],
                r: [1, 0],
                br: [1, 1],
                b: [0, 1],
                bl: [-1, 1],
                l: [-1, 0]
            }, // Signs for each handle type to calculate reposiitoning after resize
            cClasses: [
                "nwse-resize",
                "ns-resize",
                "nesw-resize",
                "ew-resize"
            ] // CSS Classes for each handle type to be set dynamically
        };
    },
    computed: {
        /**
         * Calculates a dynamic CSS class for handle regarding element's rotation. This is done to avoid
         * having a scale left/right cursor when hovering a 90deg rotated element's handle which would look
         * not intuitive. Since we have 8 possible handle types, with 4 possible CSS classes, we permute
         * them after steps of 45deg. For example a tr handle will get a t handle's CSS class if element is
         * rotated 22.5 up to 67.5 deg. Note there is an offset of 22.5 deg.
         * @returns {String} Dynamic CSS class for this handle
         */
        cursorClass: function () {
            const indexWithoutRot = Object.keys(this.hSigns).indexOf(this.hPos),
                indexAfterRot = Math.floor(Math.abs(this.startR + Math.PI / 8) / (Math.PI / 4)),
                index = (indexWithoutRot + indexAfterRot) % 4;

            return this.cClasses[index];
        },
        /**
         * Finds a single target resizable element for this handle.
         * @returns {object} Resizable element DOM node
         */
        targetElement: function () {
            let res = this.$el.offsetParent;

            if (this.targetEl !== "") {
                return document.querySelector(this.targetEl);
            }

            if (this.targetSel === "offsetParent") {
                return res;
            }

            res = this.$el.closest(this.targetSel);
            if (res === null) {
                console.warn("Vue-mp-simple-resizable Module: 'No target element found. Please verify your markup and selector. Currently defined target element selector:'", this.targetSel);
            }

            return res;
        },
        /**
         * Creates a data object for emitting events.
         * @returns {object}    Object containing all relevant data for event
         */
        eventData: function () {
            return {
                cursorClass: this.cursorClass,
                diffCRot: this.diffCRot,
                grid: this.grid,
                hPos: this.hPos,
                maxH: this.maxH,
                maxW: this.maxW,
                minH: this.minH,
                minW: this.minW,
                startC: this.startC,
                startD: this.startD,
                startP: this.startP,
                startR: this.startR,
                symResize: this.symResize,
                targetElement: this.targetElement
            };
        }
    },
    watch: {
        /**
         * When isResizing flag changes, add or remove the corresponding event listeners.
         * @param {boolean} newValue    Flag to determine if resizable element is resizing right now
         * @returns {void}
         */
        isResizing: function (newValue) {
            const eventNames = {
                move: this.isTouch ? "touchmove" : "mousemove",
                end: this.isTouch ? "touchend" : "mouseup"
            };

            if (newValue) {
                this.targetElement.classList.add("basic-resize-handle-is-resizing");
                document.addEventListener(eventNames.move, this.onMouseMove);
                document.addEventListener(eventNames.end, this.onMouseUp, {once: true});

                this.$emit("startResizing", this.eventData);
                document.querySelector("body").classList.add("basic-resize-handle-is-resizing");
            }
            else {
                this.targetElement.classList.remove("basic-resize-handle-is-resizing");
                document.removeEventListener(eventNames.move, this.onMouseMove);
                document.removeEventListener(eventNames.end, this.onMouseUp);

                this.$emit("endResizing", this.eventData);
                document.querySelector("body").classList.remove("basic-resize-handle-is-resizing");
            }
        }
    },
    methods: {
        /**
         * Calculates and sets new dimensions based on cursor position difference. To determine, if element
         * needs to be upscaled or downscaled, the handle type signs are used.
         * @returns {void}
         */
        setNewSize: function () {
            let newWidth,
                newHeight;

            if (this.hPos !== "t" && this.hPos !== "b") {
                newWidth = this.startD.width + this.hSigns[this.hPos][0] * this.diffCRot.x;
                if (newWidth < this.minW) {
                    newWidth = this.minW;
                }
                if (newWidth > this.maxW) {
                    newWidth = this.maxW;
                }
                this.targetElement.style.width = Math.round(newWidth) + "px";
            }

            if (this.hPos !== "l" && this.hPos !== "r") {
                newHeight = this.startD.height + this.hSigns[this.hPos][1] * this.diffCRot.y;
                if (newHeight < this.minH) {
                    newHeight = this.minH;
                }
                if (newHeight > this.maxH) {
                    newHeight = this.maxH;
                }
                this.targetElement.style.height = Math.round(newHeight) + "px";
            }

            if (this.targetElement.style.maxWidth !== "none") {
                this.targetElement.style.maxWidth = "none";
            }
            if (this.targetElement.style.maxHeight !== "none") {
                this.targetElement.style.maxHeight = "none";
            }
        },
        /**
         * Calculates and sets new position based on cursor position difference. When resizing a rotated
         * element, it gets dispositioned by half of its dimension difference (disposition correction 1).
         * To emulate a non symmetric resize, the element needs to be moved in the direction of the cursor
         * also by half of its dimension change. Further, to determine the correct direction, the handle
         * type signs are used.
         * point. This causes
         * @returns {void}
         */
        setNewPosition: function () {
            const diffW = this.startD.width - this.targetElement.offsetWidth,
                diffH = this.startD.height - this.targetElement.offsetHeight,
                sX = this.hSigns[this.hPos][0],
                sY = this.hSigns[this.hPos][1];

            let newLeft = this.startP.left,
                newTop = this.startP.top;

            // Disposition correction 1
            newLeft += 0.5 * diffW;
            newTop += 0.5 * diffH;

            // Disposition correction 2, only needed when symmetric resize is disabled
            if (!this.symResize) {
                newLeft -= 0.5 * (sX * diffW * Math.cos(this.startR) - sY * diffH * Math.sin(this.startR));
                newTop -= 0.5 * (sY * diffH * Math.cos(this.startR) + sX * diffW * Math.sin(this.startR));
            }

            this.targetElement.style.left = Math.round(newLeft) + "px";
            this.targetElement.style.top = Math.round(newTop) + "px";
        },
        /**
         * Stores initial element rotation. This is needed to calculate the new resize position while
         * resizing.
         * @returns {void}
         */
        storeStartingRotation: function () {
            const targetElStyle = window.getComputedStyle(this.targetElement, null),
                targetElTransform = targetElStyle.getPropertyValue("-webkit-transform") ||
                    targetElStyle.getPropertyValue("-moz-transform") ||
                    targetElStyle.getPropertyValue("-ms-transform") ||
                    targetElStyle.getPropertyValue("-o-transform") ||
                    targetElStyle.getPropertyValue("transform") ||
                    false;

            let values;

            if (targetElTransform !== "none" && targetElTransform !== false) {
                values = targetElTransform.split("(")[1].split(")")[0].split(",");
                this.startR = (Math.atan2(values[1], values[0]) + 2 * Math.PI) % (2 * Math.PI);
            }
            else {
                this.startR = 0;
            }
        },
        /**
         * Stores initial element position. This is needed to calculate the new resize position while
         * resizing.
         * @returns {void}
         */
        storeStartingPosition: function () {
            this.startP.left = this.targetElement.offsetLeft;
            this.startP.top = this.targetElement.offsetTop;
        },
        /**
         * Stores initial element dimensions. This is needed to calculate the new resize dimension and
         * disposition correction while resizing.
         * @returns {void}
         */
        storeStartingDimensions: function () {
            this.startD.width = this.targetElement.offsetWidth;
            this.startD.height = this.targetElement.offsetHeight;
            this.targetElement.style.width = this.startD.width;
            this.targetElement.style.height = this.startD.height;
        },
        /**
         * Stores initial cursor position. This is needed to calculate the cursor move distance while
         * resizing.
         * @param {object}  event   mousedown/touchstart event
         * @returns {void}
         */
        storeStartingCursorCoords: function (event) {
            this.startC.x = event.touches ? event.touches[0].clientX : event.clientX;
            this.startC.y = event.touches ? event.touches[0].clientY : event.clientY;
        },
        /**
         * Initiates a new resize. Storing initial positions, calculating limitations, setting resizing flag
         * to true. However, if no resizable element could be found, nothing happens.
         * @param {object}  event   mousedown/touchstart event
         * @returns {void}
         */
        startResizing: function (event) {
            if (this.targetElement === null) {
                return;
            }

            this.storeStartingCursorCoords(event);
            this.storeStartingPosition();
            this.storeStartingRotation();
            this.storeStartingDimensions();

            this.isResizing = true;
        },
        /**
         * Stopping the resize on mouseup event.
         * @returns {void}
         */
        onMouseUp: function () {
            this.isResizing = false;
        },
        /**
         * Starting the resize on mousedown event. If this is triggered by mousedown ghost click, ignore it.
         * @param {object}  event   mousedown event
         * @returns {void}
         */
        onMouseDown: function (event) {
            if (this.touchStarted) {
                return;
            }
            this.isTouch = false;
            this.startResizing(event);
        },
        /**
         * Starting the resize on touchstart event.
         * @param {object}  event   touchstart event
         * @returns {void}
         */
        onTouchStart: function (event) {
            this.setTouchStarted();
            this.isTouch = true;
            this.startResizing(event);
        },
        /**
         * Calculating cursor position difference while resizing. When cursor leaves window, stop resizing.
         * Cursor position difference will be adjusted by resizable element's rotation. This is needed to
         * keep resizing directions intuitive. If resizable element is not positioned relative, also
         * correct its disposition caused by its dimension change.
         * @returns {void}
         * @param {object}  event   mousemove event
         */
        onMouseMove: function (event) {
            const clientX = event.touches ? event.touches[0].clientX : event.clientX,
                clientY = event.touches ? event.touches[0].clientY : event.clientY,
                diffX = clientX - this.startC.x,
                diffY = clientY - this.startC.y;

            if (clientX < 0 || clientX > window.innerWidth || clientY < 0 || clientY > window.innerHeight) {
                this.$emit("leftScreen", this.eventData);
                this.isResizing = false;
            }

            this.diffCRot.x = diffX * Math.cos(this.startR) + diffY * Math.sin(this.startR);
            this.diffCRot.y = diffY * Math.cos(this.startR) - diffX * Math.sin(this.startR);

            if (this.grid > 1) {
                this.diffCRot.x = Math.round(this.diffCRot.x / this.grid) * this.grid;
                this.diffCRot.y = Math.round(this.diffCRot.y / this.grid) * this.grid;
            }

            this.setNewSize();

            if (["absolute", "fixed"].indexOf(window.getComputedStyle(this.targetElement, null).position) !== -1) {
                this.setNewPosition();
            }

            this.$emit("resizing", this.eventData);
        },
        /**
         * Setting touchStarted flag to true for a timespan. This is needed to cancel the mousedown ghost
         * click triggered by touchstart.
         * @returns {void}
         */
        setTouchStarted: function () {
            this.touchStarted = true;
            clearTimeout(this.timeoutReference);
            this.timeoutReference = setTimeout(() => {
                this.touchStarted = false;
            }, 400);
        }
    }
};
</script>

<template>
    <div
        class="basic-resize-handle"
        :class="[
            {'basic-resize-handle-is-resizing': isResizing},
            'basic-resize-handle-type-' + hPos,
            'basic-resize-handle-cursor-' + cursorClass
        ]"
        @touchstart="onTouchStart($event)"
        @mousedown="onMouseDown($event)"
        @mouseenter="storeStartingRotation"
    >
        <slot />
    </div>
</template>

<style scoped>
    body.basic-resize-handle-is-resizing * {
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none !important;
        user-select: none;
    }

    .basic-resize-handle.basic-resize-handle-cursor-nwse-resize{cursor:nwse-resize;}
    .basic-resize-handle.basic-resize-handle-cursor-ns-resize{cursor:ns-resize;}
    .basic-resize-handle.basic-resize-handle-cursor-nesw-resize{cursor:nesw-resize;}
    .basic-resize-handle.basic-resize-handle-cursor-ew-resize{cursor:ew-resize;}
</style>
