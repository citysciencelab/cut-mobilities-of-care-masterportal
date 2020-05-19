import {expect} from "chai";
import EntitiesLayerModel from "@modules/core/modelList/layer/entities.js";

describe("core/modelList/layer/entities", function () {
    let entitiesLayer;

    const entityOptions = [
        {
            "url": "https://hamburg.virtualcitymap.de/gltf/4AQfNWNDHHFQzfBm.glb",
            "attributes": {
                "name": "Fernsehturm.kmz"
            },
            "latitude": 53.541831,
            "longitude": 9.917963,
            "height": 10,
            "heading": -1.2502079000000208,
            "pitch": 0,
            "roll": 0,
            "scale": 5,
            "allowPicking": true,
            "show": true
        }
    ];


    beforeEach(function () {
        entitiesLayer = new EntitiesLayerModel({
            entities: entityOptions
        });
        entitiesLayer.prepareLayerObject();
    });

    describe("prepareLayerObject", function () {
        it("should create Datasource", function () {
            expect(entitiesLayer.get("customDatasource")).to.be.an.instanceof(Cesium.CustomDataSource);
        });

        it("should add the provided entities to the datasource", function () {
            const datasource = entitiesLayer.get("customDatasource");

            expect(datasource).to.be.an.instanceof(Cesium.CustomDataSource);
            expect(datasource.entities.values).to.have.length(1);
        });
    });

    describe("addEntityFromOptions", function () {
        it("should return a Cesium Entity", function () {
            const entity = entitiesLayer.addEntityFromOptions(entityOptions[0]),
                datasource = entitiesLayer.get("customDatasource");

            expect(entity).to.be.an.instanceof(Cesium.Entity);
            expect(datasource.entities.values).to.have.length(2);
        });

        it("should add the entity to the datasource collection", function () {
            const entity = entitiesLayer.addEntityFromOptions(entityOptions[0]),
                datasource = entitiesLayer.get("customDatasource"),
                contains = datasource.entities.contains(entity);

            expect(datasource.entities.values).to.have.length(2);
            expect(contains).to.be.true;
        });

        it("should parse Attributes and add them to the Entity", function () {
            const entity = entitiesLayer.addEntityFromOptions(entityOptions[0]);

            expect(entity.attributes).to.deep.equal(entityOptions[0].attributes);
        });
    });

});
