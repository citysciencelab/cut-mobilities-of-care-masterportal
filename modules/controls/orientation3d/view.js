define([
    "backbone",
    "backbone.radio",
    "text!modules/controls/orientation3d/template.html"
], function (Backbone, Radio, Orientation3DTemplate) {

    var Orientation3DView = Backbone.View.extend({
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
            if(Radio.request("Map", "isMap3d")){
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
        hide: function() {
            if (this.unlisten) {
                this.unlisten();
                this.unlisten = null;
            }
            this.$el.hide();
        },
        show: function() {
            this.$el.show();
            var scene = Radio.request("Map", "getMap3d").getCesiumScene();
            if (this.unlisten) {
                this.unlisten();
                this.unlisten = null;
            }
            var camera = scene.camera;
            this.unlisten = scene.postRender.addEventListener(function() {
                $("#north-pointer").css({ transform: 'rotate(' + camera.heading + 'rad)' });
            });
            this.$el.show(); },
        move: function(event) {
            var scene = Radio.request("Map", "getMap3d").getCesiumScene();
            var camera = scene.camera;

            var distance = camera.positionCartographic.height / 2;
            var angle = 0.15;
            var up = camera.pitch < 0 ? angle : null;
            var down = camera.pitch > Math.PI / -2 ? angle : null;
            var directions = {
                'compass_north': camera.moveUp.bind(camera, distance),
                'compass_south': camera.moveDown.bind(camera, distance),
                'compass_east': camera.moveRight.bind(camera, distance),
                'compass_west': camera.moveLeft.bind(camera, distance),
                'tilt-down': camera.lookUp.bind(camera, down),
                'tilt-up': camera.lookDown.bind(camera, up),
                'zoom-in': camera.zoomIn.bind(camera, distance),
                'zoom-out': camera.zoomOut.bind(camera, distance)
            };
            directions[event.target.id]();
        },
        northDown: function(event) {
            this.startTime = new Date().getTime();
            this.cursorPosition = { x: event.clientX, y: event.clientY };
            var offsetRect = $("#north-pointer").get(0).getBoundingClientRect();
            this.correction = {
                y: (offsetRect.top + (offsetRect.height / 2)) - this.cursorPosition.y,
                x: (offsetRect.left + (offsetRect.width / 2)) - this.cursorPosition.x,
            };

            var scene = Radio.request("Map", "getMap3d").getCesiumScene();
            var camera = scene.camera;
            var ray = new Cesium.Ray(camera.position, camera.direction);
            var groundPositionCartesian = scene.globe.pick(ray, scene);
            if (groundPositionCartesian) {
                this.destination = groundPositionCartesian;
                this.distance = Cesium.Cartesian3.distance(camera.position, groundPositionCartesian);
            }

            this.mouseDraggedBound = this.mouseDragged.bind(this);
            window.addEventListener('mouseup', this.northUp.bind(this), { once: true });
            window.addEventListener('mousemove', this.mouseDraggedBound);
        },
        northUp: function() {
            var endTime = new Date().getTime();
            if ((endTime - this.startTime) < 200) {
                this.setHeading(0);
            }
            window.removeEventListener('mousemove', this.mouseDraggedBound);
        },
        mouseDragged: function(event) {
            event.preventDefault();
            var offsetRect = $(".compass").get(0).getBoundingClientRect();
            var top = offsetRect.top + (offsetRect.height / 2);
            var left = offsetRect.left + (offsetRect.width / 2);
            var y = (event.clientY - top) + this.correction.y;
            var x = (event.clientX - left) + this.correction.x;
            var rads = Math.atan2(y, x) + (Math.PI / 2);
            rads = rads > 0 ? rads : rads + (2 * Math.PI);

            this.setHeading(rads);
        },
        setHeading: function(heading) {
            var scene = Radio.request("Map", "getMap3d").getCesiumScene();
            var camera = scene.camera;
            var options = {
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
            if (this.distance != null) {
                camera.moveBackward(this.distance);
            }
        }
    });

    return Orientation3DView;
});
