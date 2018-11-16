import OverlaySynchronizer from "olcs/OverlaySynchronizer.js";

class FixedOverlaySynchronizer extends OverlaySynchronizer {
    constructor (map, scene) {
        super(map, scene);
    }

    /**
     * @api
     */
    addOverlays() {
        this.overlays_.forEach((overlay) => { this.addOverlay(overlay); });
    }
}

export default FixedOverlaySynchronizer;
