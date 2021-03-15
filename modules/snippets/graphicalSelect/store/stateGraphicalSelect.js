/**
     * @class GraphicalSelectModel
     * @extends SnippetDropdownModel
     * @memberof Snippets.GraphicalSelect
     * @description creates a dropdown to select an area in a map by square, circle or polygon. Create it like this: new GraphicalSelectModel({id: "idOfTheCaller"}).
     * The id is used to react only on events of the caller, not on all components, that use a graphicalSelectModel.
     * @constructs
     * @property {Boolean} isOpen=false dropdown is open or closed
     * @property {String} name="Geometrie" name of the dropdown
     * @property {String} type="string" type of the dropdown values
     * @property {String} displayName="Geometrie auswählen" label of the dropdown
     * @property {String} snippetType="graphicalSelect" type of the dropdown values
     * @property {Boolean} isMultiple=false dropdown multiple
     * @property {Object} drawInteraction=undefined the interaction to draw a square, circle or polygon
     * @property {ol.overlay} circleOverlay=new Overlay({offset: [15, 0], positioning: "center-left"}) circle overlay (tooltip) - shows the radius
     * @property {ol.overlay} tooltipOverlay=new Overlay({offset: [15, 20], positioning: "top-left"}) todo
     * @property {Object} snippetDropdownModel={} contains the model of the underlying dropdown
     * @property {Object} geographicValues={"Rechteck aufziehen": "Box", "Kreis aufziehen": "Circle", "Fläche zeichnen": "Polygon"} possible values
     * @property {String} currentValue="" contains the current geographic value for "Box",  "Circle" or "Polygon"
     * @property {String} tooltipMessage="Klicken zum Starten und Beenden" Meassage for tooltip
     * @property {String} tooltipMessagePolygon="Klicken um Stützpunkt hinzuzufügen" Meassage for tooltip
     * @property {ol.geojson} selectedAreaGeoJson={} the selected area as GeoJSON
     * @fires Core#RadioRequestMapCreateLayerIfNotExists
     * @fires Core#RadioTriggerMapAddOverlay
     * @fires Core#RadioTriggerMapRemoveOverlay
     * @fires Core#RadioTriggerMapRegisterListener
     * @fires Snippets.GraphicalSelect#setStatus
     * @fires Snippets.GraphicalSelect#resetView
     * @fires Snippets.GraphicalSelect#resetGeographicSelection
     * @fires Snippets.GraphicalSelect#featureToGeoJson
     * @listens Snippets.Dropdown#ValuesChanged
     * @listens Snippets.Checkbox#ValuesChanged
     */
const state = {
    isOpen: false,
    name: "Geometrie",
    type: "string",
    displayName: "Geometrie auswählen",
    snippetType: "graphicalSelect",
    isMultiple: false,
    drawInteraction: undefined,
    /* circleOverlay: new Overlay({
        offset: [15, 0],
        positioning: "center-left"
    }),
    tooltipOverlay: new Overlay({
        offset: [15, 20],
        positioning: "top-left"
    }), */
    snippetDropdownModel: {},
    currentValue: "",
    selectedAreaGeoJson: undefined,
    // translations
    geographicValues: {},
    tooltipMessage: "",
    tooltipMessagePolygon: "",
    selectedOption: "draw",
    options: {
        "rectangle": "Rechteck aufziehen",
        "circle": "Kreis aufziehen",
        "surface": "Fläche zeichnen"
    }
};


export default state;
