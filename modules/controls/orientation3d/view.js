define(function (require) {
    var Orientation3DTemplate = require("text!modules/controls/orientation3d/template.html"),
        Cesium = require("cesium"),
        Orientation3DView;

    Orientation3DView = Backbone.View.extend({
        className: "row",
        template: _.template(Orientation3DTemplate),
        events: {
            "click .3d-control-btn": "move",
            "mousedown .compass-pointer-north": "northDown",
            "click .compass-pointer-north": "northUp"
        },
        initialize: function () {
            var channel = Radio.channel("Map");
            this.render();
            if (Radio.request("Map", "isMap3d")) {
                this.show();
            }
            channel.on({
                "activateMap3d": this.show,
                "deactivateMap3d": this.hide
            }, this);
        },
        render: function () {
            // $("body").append(this.$el.html(this.template));
            this.$el.html(this.template);
            this.$el.hide();
        },
        hide: function () {
            if (this.unlisten) {
                this.unlisten();
                this.unlisten = null;
            }
            this.$el.hide();
        },
        show: function () {
            var scene = Radio.request("Map", "getMap3d").getCesiumScene(),
                camera = scene.camera;

            this.$el.show();
            if (this.unlisten) {
                this.unlisten();
                this.unlisten = null;
            }
            this.unlisten = scene.postRender.addEventListener(function () {
                this.$el.find("#north-pointer").css({transform: "rotate(" + camera.heading + "rad)"});
            }.bind(this));
            this.$el.show();
        },
        move: function (event) {
            var scene = Radio.request("Map", "getMap3d").getCesiumScene(),
                camera = scene.camera,
                distance = camera.positionCartographic.height / 2,
                angle = 0.15,
                down = camera.pitch + angle > 0 ? 0 : angle,
                up = camera.pitch - angle < Math.PI / -2 ? 0 : angle,
                directions = {
                    "compass_north": camera.moveUp.bind(camera, distance),
                    "compass_south": camera.moveDown.bind(camera, distance),
                    "compass_east": camera.moveRight.bind(camera, distance),
                    "compass_west": camera.moveLeft.bind(camera, distance),
                    "tilt-down": camera.lookUp.bind(camera, down),
                    "tilt-up": camera.lookDown.bind(camera, up),
                    "zoom-in": camera.zoomIn.bind(camera, distance),
                    "zoom-out": camera.zoomOut.bind(camera, distance)
                };
            directions[event.target.id]();
        },
        northDown: function (event) {
            var offsetRect = this.$el.find("#north-pointer").get(0).getBoundingClientRect(),
                scene = Radio.request("Map", "getMap3d").getCesiumScene(),
                camera = scene.camera,
                ray = new Cesium.Ray(camera.position, camera.direction),
                groundPositionCartesian = scene.globe.pick(ray, scene);

            this.startTime = new Date().getTime();
            this.cursorPosition = {x: event.clientX, y: event.clientY};
            this.correction = {
                y: offsetRect.top + offsetRect.height / 2 - this.cursorPosition.y,
                x: offsetRect.left + offsetRect.width / 2 - this.cursorPosition.x
            };

            if (groundPositionCartesian) {
                this.destination = groundPositionCartesian;
                this.distance = Cesium.Cartesian3.distance(camera.position, groundPositionCartesian);
            }

            this.mouseDraggedBound = this.mouseDragged.bind(this);
            window.addEventListener("mouseup", this.northUp.bind(this), {once: true});
            this.$el.on("mousemove", this.mouseDraggedBound);
        },
        northUp: function () {
            var endTime = new Date().getTime();
            if (endTime - this.startTime < 200) {
                this.setHeading(0);
            }
            this.$el.off("mousemove", this.mouseDraggedBound);
        },
        mouseDragged: function (event) {
            var offsetRect = this.$el.find(".compass").get(0).getBoundingClientRect(),
                top = offsetRect.top + offsetRect.height / 2,
                left = offsetRect.left + offsetRect.width / 2,
                y = event.clientY - top + this.correction.y,
                x = event.clientX - left + this.correction.x,
                rads = Math.atan2(y, x) + Math.PI / 2;

            event.preventDefault();
            rads = rads > 0 ? rads : rads + 2 * Math.PI;

            this.setHeading(rads);
        },
        setHeading: function (heading) {
            var scene = Radio.request("Map", "getMap3d").getCesiumScene(),
                camera = scene.camera,
                options = {
                    orientation: {
                        pitch: camera.pitch,
                        roll: camera.roll,
                        heading: heading
                    }
                };

            if (this.destination) {
                options.destination = this.destination;
            }

            camera.setView(options);
            if (this.distance !== null) {
                camera.moveBackward(this.distance);
            }
        }
    });

    return Orientation3DView;
});
