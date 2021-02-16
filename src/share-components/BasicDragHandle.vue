<script>
export default {
    name: "BasicDragHandle",
    props: {
        // Draggable element directly as is.
        targetEl: {
            type: String,
            default: "",
            required: false
        },
        // A query selector to find the draggable element. Will look upwards.
        targetSel: {
            type: String,
            default: "offsetParent",
            required: false
        },
        // Gridsize for snappy drag.
        grid: {
            type: Number,
            default: 1,
            required: false
        },
        // Flag if functionality is enabled
        isEnabled: {
            type: Boolean,
            default: true,
            required: false
        },
        // If you want a spacing between draggable element and containment element, use the following.
        margin: {
            type: Number,
            default: 0,
            required: false
        },
        // Spacing only top. This will override the margin prop.
        marginTop: {
            type: Number,
            default: null,
            required: false
        },
        // Spacing only right. This will override the margin prop.
        marginRight: {
            type: Number,
            default: null,
            required: false
        },
        // Spacing only bottom. This will override the margin prop.
        marginBottom: {
            type: Number,
            default: null,
            required: false
        },
        // Spacing only left. This will override the margin prop.
        marginLeft: {
            type: Number,
            default: null,
            required: false
        }
    },
    data: function () {
        return {
            isDragging: false, // Flag to determine, if element is dragging right now
            startC: {x: 0, y: 0}, // Initial cursor position before drag start
            diffC: {x: 0, y: 0}, // Cursor position difference during dragging
            startP: {top: 0, left: 0}, // Initial starting position of draggable element
            contP: {top: 0, right: 0, bottom: 0, left: 0}, // Calculated positioning limitations
            touchStarted: false, // Flag to avoid ghost click event
            timeoutReference: null // Timeout reference to avoid ghost click event
        };
    },
    computed: {
        /**
         * Calculates spacing between draggable element and containment element.
         * @returns {Object} Spacing object
         */
        spacing: function () {
            return {
                top: this.marginTop || this.margin,
                right: this.marginRight || this.margin,
                bottom: this.marginBottom || this.margin,
                left: this.marginLeft || this.margin
            };
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
         * Finds the containment element which is always the offset parent.
         * @returns {Object} Containment element DOM node
         */
        containmentElement: function () {
            return this.targetElement.offsetParent;
        },
        /**
         * Creates a data object for emitting events.
         * @returns {object}    Object containing all relevant data for event
         */
        eventData: function () {
            return {
                diffC: this.diffC,
                grid: this.grid,
                startC: this.startC,
                startP: this.startP,
                contP: this.contP,
                targetElement: this.targetElement
            };
        }
    },
    watch: {
        /**
         * When isDraggin flag changes, add or remove the corresponding event listeners.
         * @param {boolean} newValue    Flag to determine if draggable element is dragging right now
         * @returns {void}
         */
        isDragging: function (newValue) {
            const eventNames = {
                move: this.isTouch ? "touchmove" : "mousemove",
                end: this.isTouch ? "touchend" : "mouseup"
            };

            if (newValue) {
                document.addEventListener(eventNames.move, this.onMouseMove);
                document.addEventListener(eventNames.end, this.onMouseUp, {once: true});

                this.$emit("startDragging", this.eventData);
                document.querySelector("body").classList.add("basic-drag-handle-is-dragging");
            }
            else {
                document.removeEventListener(eventNames.move, this.onMouseMove);
                document.removeEventListener(eventNames.end, this.onMouseUp);

                this.$emit("endDragging", this.eventData);
                document.querySelector("body").classList.remove("basic-drag-handle-is-dragging");
            }
        }
    },
    methods: {
        /**
         * Calculates and sets new position based on cursor position difference.
         * @returns {void}
         */
        setNewPosition: function () {
            let newTop,
                newLeft;

            newTop = this.startP.top + this.diffC.y;
            if (newTop < this.contP.top) {
                newTop = this.contP.top;
            }
            if (newTop > this.contP.bottom) {
                newTop = this.contP.bottom;
            }

            newLeft = this.startP.left + this.diffC.x;
            if (newLeft < this.contP.left) {
                newLeft = this.contP.left;
            }
            if (newLeft > this.contP.right) {
                newLeft = this.contP.right;
            }

            this.targetElement.style.left = Math.round(newLeft) + "px";
            if (this.targetElement.style.right !== "auto") {
                this.targetElement.style.right = "auto";
            }

            this.targetElement.style.top = Math.round(newTop) + "px";
            if (this.targetElement.style.bottom !== "auto") {
                this.targetElement.style.bottom = "auto";
            }
        },
        /**
         * Calculates and sets positioning limitations based on bounding client rect. This is needed
         * especially if draggable element is rotated.
         * @returns {void}
         */
        calcContainmentPosition: function () {
            const contElHeight = this.containmentElement.clientHeight,
                contElWidth = this.containmentElement.clientWidth,
                h = this.targetElement.offsetHeight,
                w = this.targetElement.offsetWidth,
                wBound = this.targetElement.getBoundingClientRect().width,
                hBound = this.targetElement.getBoundingClientRect().height;

            this.contP.top = -0.5 * (h - hBound) + this.spacing.top;
            this.contP.right = contElWidth - wBound - 0.5 * (w - wBound) - this.spacing.right;
            this.contP.bottom = contElHeight - hBound - 0.5 * (h - hBound) - this.spacing.bottom;
            this.contP.left = -0.5 * (w - wBound) + this.spacing.left;
        },
        /**
         * Stores initial element position. This is needed to calculate the new drag position while dragging.
         * @returns {void}
         */
        storeStartingPosition: function () {
            this.startP.left = this.targetElement.offsetLeft;
            this.startP.top = this.targetElement.offsetTop;
        },
        /**
         * Stores initial cursor position. This is needed to calculate the cursor move distance while
         * dragging.
         * @param {object}  event   mousedown/touchstart event
         * @returns {void}
         */
        storeStartingCursorCoords: function (event) {
            this.startC.x = event.touches ? event.touches[0].clientX : event.clientX;
            this.startC.y = event.touches ? event.touches[0].clientY : event.clientY;
        },
        /**
         * Initiates a new drag. Storing initial positions, calculating limitations, setting dragging flag
         * to true.
         * @param {object}  event   mousedown/touchstart event
         * @returns {void}
         */
        startDragging: function (event) {
            if (!this.isEnabled) {
                return;
            }
            this.storeStartingCursorCoords(event);
            this.storeStartingPosition();
            this.calcContainmentPosition();
            this.isDragging = true;
        },
        /**
         * Stopping the drag on mouseup event.
         * @returns {void}
         */
        onMouseUp: function () {
            this.isDragging = false;
        },
        /**
         * Starting the drag on mousedown event. If this is triggered by mousedown ghost click, ignore it.
         * @param {object}  event   mousedown event
         * @returns {void}
         */
        onMouseDown: function (event) {
            if (this.touchStarted) {
                return;
            }
            this.isTouch = false;
            this.startDragging(event);
        },
        /**
         * Starting the drag on touchstart event.
         * @param {object}  event   touchstart event
         * @returns {void}
         */
        onTouchStart: function (event) {
            this.setTouchStarted();
            this.isTouch = true;
            this.startDragging(event);
        },
        /**
         * Calculating cursor position difference while dragging. When cursor leaves window, stop dragging.
         * @returns {void}
         * @param {object}  event   mousemove event
         */
        onMouseMove: function (event) {
            const clientX = event.touches ? event.touches[0].clientX : event.clientX,
                clientY = event.touches ? event.touches[0].clientY : event.clientY;

            if (clientX < 0 || clientX > window.innerWidth || clientY < 0 || clientY > window.innerHeight) {
                this.$emit("leftScreen", this.eventData);
                this.isDragging = false;
            }

            this.diffC.x = clientX - this.startC.x;
            this.diffC.y = clientY - this.startC.y;

            if (this.grid > 1) {
                this.diffC.x = Math.round(this.diffC.x / this.grid) * this.grid;
                this.diffC.y = Math.round(this.diffC.y / this.grid) * this.grid;
            }

            this.setNewPosition();

            this.$emit("dragging", this.eventData);
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
        class="basic-drag-handle"
        :class="{
            'basic-drag-handle-is-enabled': isEnabled,
            'basic-drag-handle-is-dragging': isDragging
        }"
        @touchstart="onTouchStart($event)"
        @mousedown="onMouseDown($event)"
    >
        <slot />
    </div>
</template>

<style scoped>
    .basic-drag-handle.basic-drag-handle-is-enabled {
        cursor:move;
    }
    body.basic-drag-handle-is-dragging * {
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none !important;
        user-select: none;
    }
</style>
