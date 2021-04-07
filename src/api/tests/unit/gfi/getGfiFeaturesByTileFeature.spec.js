
import {expect} from "chai";
import {
    getGfiFeature,
    getLayerModelFromTileFeature,
    getGfiFeatureByCesium3DTileFeature,
    getGfiFeatureByCesiumEntity,
    getGfiFeatureByOlFeature,
    getGfiFeaturesByOlFeature
} from "../../../gfi/getGfiFeaturesByTileFeature.js";

before(function () {
    i18next.init({
        lng: "cimode",
        debug: false
    });
});

describe("src/api/gfi/getGfiFeaturesByTileFeature.js", () => {
    describe("getGfiFeature", () => {
        it("should use default values not for properties", () => {
            const result = getGfiFeature(null, null);

            expect(result.getTitle()).to.equal("common:modules.layerInformation.buildings");
            expect(result.getProperties()).to.deep.equal(null);
        });
        it("should get attributes and properties according to given parameters", () => {
            const layerAttributes = {
                    name: "name",
                    gfiTheme: "gfiTheme",
                    gfiAttributes: "gfiAttributes"
                },
                properties = "properties",
                result = getGfiFeature(layerAttributes, properties);

            expect(result.getTitle()).to.equal(layerAttributes.name);
            expect(result.getTheme()).to.equal(layerAttributes.gfiTheme);
            expect(result.getAttributesToShow()).to.deep.equal(layerAttributes.gfiAttributes);
            expect(result.getProperties()).to.equal("properties");
        });
        it("should use properties.attributes as properties if any", () => {
            const properties = {
                    attributes: "properties attributes"
                },
                result = getGfiFeature(null, properties);

            expect(result.getTitle()).to.equal("common:modules.layerInformation.buildings");
            expect(result.getTheme()).to.equal("buildings_3d");
            expect(result.getProperties()).to.equal("properties attributes");
        });
    });

    describe("getLayerModelFromTileFeature", () => {
        const Cesium = {
                Entity: function (layerReferenceId) {
                    this.layerReferenceId = layerReferenceId;
                },
                Cesium3DTileFeature: function (layerReferenceId) {
                    this.tileset = {
                        layerReferenceId
                    };
                }
            },
            dummy = {
                isCesium3dTileFeature: (feature) => {
                    return feature instanceof Cesium.Cesium3DTileFeature;
                },
                isCesiumEntity: (entity) => {
                    return entity instanceof Cesium.Entity;
                },
                getModelByAttributesOpt: (filter) => {
                    return filter;
                }
            };

        it("should return undefined if no tileFeature is given", () => {
            expect(getLayerModelFromTileFeature(undefined)).to.be.undefined;
            expect(getLayerModelFromTileFeature(null)).to.be.undefined;
            expect(getLayerModelFromTileFeature("")).to.be.undefined;
            expect(getLayerModelFromTileFeature(0)).to.be.undefined;
            expect(getLayerModelFromTileFeature(false)).to.be.undefined;
            expect(getLayerModelFromTileFeature("test")).to.be.undefined;
            expect(getLayerModelFromTileFeature(1234)).to.be.undefined;
            expect(getLayerModelFromTileFeature(true)).to.be.undefined;
        });
        it("should create a filter with the Cesium3DTileFeature and apply the filter to get the model", () => {
            const tileFeature = new Cesium.Cesium3DTileFeature("Cesium3DTileFeature.layerReferenceId"),
                result = getLayerModelFromTileFeature(tileFeature, dummy.getModelByAttributesOpt, dummy.isCesium3dTileFeature, dummy.isCesiumEntity),
                expected = {id: "Cesium3DTileFeature.layerReferenceId"};

            expect(result).to.deep.equal(expected);
        });
        it("should return undefined if tileFeature is no Cesium3DTileFeature nor Cesium3DTilePointFeature and has no valid primitive option", () => {
            expect(getLayerModelFromTileFeature({}, dummy.getModelByAttributesOpt, dummy.isCesium3dTileFeature, dummy.isCesiumEntity)).to.be.undefined;
            expect(getLayerModelFromTileFeature({primitive: null}, dummy.getModelByAttributesOpt, dummy.isCesium3dTileFeature, dummy.isCesiumEntity)).to.be.undefined;
            expect(getLayerModelFromTileFeature({primitive: true}, dummy.getModelByAttributesOpt, dummy.isCesium3dTileFeature, dummy.isCesiumEntity)).to.be.undefined;
        });
        it("should create a filter with a primitive.olLayer and apply the filter to get the model", () => {
            const tileFeature = {
                    primitive: {
                        olLayer: {
                            get: () => {
                                return "primitive.olLayer.id";
                            }
                        }
                    }
                },
                result = getLayerModelFromTileFeature(tileFeature, dummy.getModelByAttributesOpt, dummy.isCesium3dTileFeature, dummy.isCesiumEntity),
                expected = {id: "primitive.olLayer.id"};

            expect(result).to.deep.equal(expected);
        });
        it("should create a filter with a Cesium.Entity and apply the filter to get the model", () => {
            const tileFeature = {
                    primitive: {
                        id: new Cesium.Entity("Entity.layerReferenceId")
                    }
                },
                result = getLayerModelFromTileFeature(tileFeature, dummy.getModelByAttributesOpt, dummy.isCesium3dTileFeature, dummy.isCesiumEntity),
                expected = {id: "Entity.layerReferenceId"};

            expect(result).to.deep.equal(expected);
        });

        it("should use Cesium3DTileFeature before using primitive.olLayer or Cesium.Entity", () => {
            const tileFeature = Object.assign(new Cesium.Cesium3DTileFeature("Cesium3DTileFeature.layerReferenceId"), {
                    primitive: {
                        olLayer: {
                            get: () => {
                                return "primitive.olLayer.id";
                            }
                        },
                        id: new Cesium.Entity("Entity.layerReferenceId")
                    }
                }),
                result = getLayerModelFromTileFeature(tileFeature, dummy.getModelByAttributesOpt, dummy.isCesium3dTileFeature, dummy.isCesiumEntity),
                expected = {id: "Cesium3DTileFeature.layerReferenceId"};

            expect(result).to.deep.equal(expected);
        });
        it("should use primitive.olLayer before using Cesium.Entity", () => {
            const tileFeature = {
                    primitive: {
                        olLayer: {
                            get: () => {
                                return "primitive.olLayer.id";
                            }
                        },
                        id: new Cesium.Entity("Entity.layerReferenceId")
                    }
                },
                result = getLayerModelFromTileFeature(tileFeature, dummy.getModelByAttributesOpt, dummy.isCesium3dTileFeature, dummy.isCesiumEntity),
                expected = {id: "primitive.olLayer.id"};

            expect(result).to.deep.equal(expected);
        });
    });

    describe("getGfiFeatureByCesium3DTileFeature", () => {
        it("should return undefined if tileFeature is no object", () => {
            expect(getGfiFeatureByCesium3DTileFeature()).to.be.undefined;
            expect(getGfiFeatureByCesium3DTileFeature(null)).to.be.undefined;
            expect(getGfiFeatureByCesium3DTileFeature(1234)).to.be.undefined;
            expect(getGfiFeatureByCesium3DTileFeature("string")).to.be.undefined;
            expect(getGfiFeatureByCesium3DTileFeature(true)).to.be.undefined;
        });
        it("should return undefined if tileFeature has no functions getPropertyNames or getProperty", () => {
            expect(getGfiFeatureByCesium3DTileFeature({})).to.be.undefined;
            expect(getGfiFeatureByCesium3DTileFeature([])).to.be.undefined;
            expect(getGfiFeatureByCesium3DTileFeature({getPropertyNames: () => {
                return false;
            }})).to.be.undefined;
            expect(getGfiFeatureByCesium3DTileFeature({getProperty: () => {
                return false;
            }})).to.be.undefined;
        });
        it("should return undefined if tileFeature.getPropertyNames() does not return an array", () => {
            expect(getGfiFeatureByCesium3DTileFeature({getPropertyNames: () => {
                return false;
            }, getProperty: () => {
                return false;
            }})).to.be.undefined;
        });

        it("should create properties using tileFeature getPropertyNames function and getProperty function", () => {
            const props = {
                    key1: "value1",
                    key2: "value2"
                },
                tileFeature = {
                    getPropertyNames: () => {
                        return Object.keys(props);
                    },
                    getProperty: (key) => {
                        return props[key];
                    }
                };

            expect(getGfiFeatureByCesium3DTileFeature(tileFeature, "attributes", (attributes, properties) => {
                // getGfiFeatureOpt
                return properties;
            })).to.deep.equal(props);
        });
        it("should pass through attributes", () => {
            const tileFeature = {
                getPropertyNames: () => {
                    return [];
                },
                getProperty: () => {
                    return undefined;
                }
            };

            expect(getGfiFeatureByCesium3DTileFeature(tileFeature, "attributes", (attributes) => {
                // getGfiFeatureOpt
                return attributes;
            })).to.equal("attributes");
        });
        it("should add the property id as property attributes.gmlid if property id and property attribtues are given", () => {
            const props = {
                    id: "id",
                    attributes: {}
                },
                tileFeature = {
                    getPropertyNames: () => {
                        return Object.keys(props);
                    },
                    getProperty: (key) => {
                        return props[key];
                    }
                },
                expected = {
                    id: "id",
                    attributes: {
                        gmlid: "id"
                    }
                };

            expect(getGfiFeatureByCesium3DTileFeature(tileFeature, "attributes", (attributes, properties) => {
                // getGfiFeatureOpt
                return properties;
            })).to.deep.equal(expected);
        });
    });

    describe("getGfiFeatureByCesiumEntity", () => {
        it("should return undefined if tileFeature.primitive.id is not an object", () => {
            expect(getGfiFeatureByCesiumEntity()).to.be.undefined;
            expect(getGfiFeatureByCesiumEntity(null)).to.be.undefined;
            expect(getGfiFeatureByCesiumEntity(1234)).to.be.undefined;
            expect(getGfiFeatureByCesiumEntity("string")).to.be.undefined;
            expect(getGfiFeatureByCesiumEntity(true)).to.be.undefined;
            expect(getGfiFeatureByCesiumEntity([])).to.be.undefined;
            expect(getGfiFeatureByCesiumEntity({})).to.be.undefined;

            expect(getGfiFeatureByCesiumEntity({primitive: undefined})).to.be.undefined;
            expect(getGfiFeatureByCesiumEntity({primitive: null})).to.be.undefined;
            expect(getGfiFeatureByCesiumEntity({primitive: 1234})).to.be.undefined;
            expect(getGfiFeatureByCesiumEntity({primitive: "string"})).to.be.undefined;
            expect(getGfiFeatureByCesiumEntity({primitive: true})).to.be.undefined;
            expect(getGfiFeatureByCesiumEntity({primitive: []})).to.be.undefined;
            expect(getGfiFeatureByCesiumEntity({primitive: {}})).to.be.undefined;

            expect(getGfiFeatureByCesiumEntity({primitive: {id: undefined}})).to.be.undefined;
            expect(getGfiFeatureByCesiumEntity({primitive: {id: null}})).to.be.undefined;
            expect(getGfiFeatureByCesiumEntity({primitive: {id: 1234}})).to.be.undefined;
            expect(getGfiFeatureByCesiumEntity({primitive: {id: "string"}})).to.be.undefined;
            expect(getGfiFeatureByCesiumEntity({primitive: {id: true}})).to.be.undefined;
        });
        it("should use as properties whatever is given by tileFeature.primitive.id.attributes", () => {
            let tileFeature = null;

            tileFeature = {
                primitive: {
                    id: {}
                }
            };
            expect(getGfiFeatureByCesiumEntity(tileFeature, "attributes", (attributes, properties) => {
                // getGfiFeatureOpt
                return properties;
            })).to.be.undefined;

            tileFeature = {
                primitive: {
                    id: {attributes: true}
                }
            };
            expect(getGfiFeatureByCesiumEntity(tileFeature, "attributes", (attributes, properties) => {
                // getGfiFeatureOpt
                return properties;
            })).to.be.true;

            tileFeature = {
                primitive: {
                    id: {attributes: "primitive.attributes"}
                }
            };
            expect(getGfiFeatureByCesiumEntity(tileFeature, "attributes", (attributes, properties) => {
                // getGfiFeatureOpt
                return properties;
            })).to.equal("primitive.attributes");
        });
    });

    describe("getGfiFeatureByOlFeature", () => {
        it("should return undefined if olFeature is no object", () => {
            expect(getGfiFeatureByOlFeature()).to.be.undefined;
            expect(getGfiFeatureByOlFeature(null)).to.be.undefined;
            expect(getGfiFeatureByOlFeature(1234)).to.be.undefined;
            expect(getGfiFeatureByOlFeature("string")).to.be.undefined;
            expect(getGfiFeatureByOlFeature(true)).to.be.undefined;
        });
        it("should return undefined if olFeature has no functions getProperties or getProperty", () => {
            expect(getGfiFeatureByOlFeature({})).to.be.undefined;
            expect(getGfiFeatureByOlFeature([])).to.be.undefined;
            expect(getGfiFeatureByOlFeature({getProperties: () => {
                return false;
            }})).to.be.undefined;
            expect(getGfiFeatureByOlFeature({getProperty: () => {
                return false;
            }})).to.be.undefined;
        });
        it("should return undefined if olFeature.getProperties() does not return an array", () => {
            expect(getGfiFeatureByOlFeature({getProperties: () => {
                return false;
            }, getProperty: () => {
                return false;
            }})).to.be.undefined;
        });

        it("should create properties using olFeature getProperties and getProperty function", () => {
            const props = {
                    key1: "value1",
                    key2: "value2"
                },
                olFeature = {
                    getProperties: () => {
                        return Object.keys(props);
                    },
                    getProperty: (key) => {
                        return props[key];
                    }
                };

            expect(getGfiFeatureByOlFeature(olFeature, "attributes", (attributes, properties) => {
                // getGfiFeatureOpt
                return properties;
            })).to.deep.equal(props);
        });
        it("should pass through attributes", () => {
            const olFeature = {
                getProperties: () => {
                    return [];
                },
                getProperty: () => {
                    return undefined;
                }
            };

            expect(getGfiFeatureByOlFeature(olFeature, "attributes", (attributes) => {
                // getGfiFeatureOpt
                return attributes;
            })).to.equal("attributes");
        });
    });

    describe("getGfiFeaturesByOlFeature", () => {
        it("should return undefined if olFeature is no object", () => {
            expect(getGfiFeaturesByOlFeature()).to.be.undefined;
            expect(getGfiFeaturesByOlFeature(null)).to.be.undefined;
            expect(getGfiFeaturesByOlFeature(1234)).to.be.undefined;
            expect(getGfiFeaturesByOlFeature("string")).to.be.undefined;
            expect(getGfiFeaturesByOlFeature(true)).to.be.undefined;
        });
        it("should return undefined if olFeature has no functions getProperties or getProperty", () => {
            expect(getGfiFeaturesByOlFeature({})).to.be.undefined;
            expect(getGfiFeaturesByOlFeature([])).to.be.undefined;
            expect(getGfiFeaturesByOlFeature({getProperties: () => {
                return false;
            }})).to.be.undefined;
            expect(getGfiFeaturesByOlFeature({getProperty: () => {
                return false;
            }})).to.be.undefined;
        });
        it("should return undefined if olFeature.getProperties() does not return an array", () => {
            expect(getGfiFeaturesByOlFeature({getProperties: () => {
                return false;
            }, getProperty: () => {
                return false;
            }})).to.be.undefined;
        });

        it("should create an array of one gfiFeature if olFeature is valid and is not clustered (has no features property)", () => {
            const olFeature = {
                    getProperties: () => {
                        return [];
                    },
                    getProperty: () => {
                        return undefined;
                    }
                },
                result = getGfiFeaturesByOlFeature(olFeature, "attributes", (feature) => {
                    // getGfiFeatureByOlFeatureOpt
                    return feature;
                });

            expect(result).to.be.an("array").with.length(1);
            expect(result[0]).to.be.an("object").and.to.be.not.null;
            expect(typeof result[0].getProperties).to.equal("function");
            expect(typeof result[0].getProperty).to.equal("function");
            expect(result[0].getProperties()).to.be.an("array").that.is.empty;
            expect(result[0].getProperty()).to.be.undefined;
        });
        it("should pass through attributes if olFeature is valid and is not clustered (has no features property)", () => {
            const olFeature = {
                    getProperties: () => {
                        return [];
                    },
                    getProperty: () => {
                        return undefined;
                    }
                },
                result = getGfiFeaturesByOlFeature(olFeature, "attributes", (feature, attributes) => {
                    // getGfiFeatureByOlFeatureOpt
                    return attributes;
                });

            expect(result).to.be.an("array").with.length(1);
            expect(result[0]).to.equal("attributes");
        });
        it("should create an array of gfiFeatures if olFeature is valid and is clustered (has feature property)", () => {
            const props = {
                    features: [
                        {
                            getProperties: () => {
                                return [];
                            },
                            getProperty: () => {
                                return undefined;
                            }
                        }
                    ]
                },
                olFeature = {
                    getProperties: () => {
                        return props;
                    },
                    get: (key) => {
                        return props[key];
                    }
                },
                result = getGfiFeaturesByOlFeature(olFeature, "attributes", (feature) => {
                    // getGfiFeatureByOlFeatureOpt
                    return feature;
                });

            expect(result).to.be.an("array").with.length(1);
            expect(result[0]).to.be.an("object").and.to.be.not.null;
            expect(typeof result[0].getProperties).to.equal("function");
            expect(typeof result[0].getProperty).to.equal("function");
            expect(result[0].getProperties()).to.be.an("array").that.is.empty;
            expect(result[0].getProperty()).to.be.undefined;
        });
        it("should pass through attributes if olFeature is valid and is clustered (has feature property)", () => {
            const props = {
                    features: [
                        {
                            getProperties: () => {
                                return [];
                            },
                            getProperty: () => {
                                return undefined;
                            }
                        }
                    ]
                },
                olFeature = {
                    getProperties: () => {
                        return props;
                    },
                    get: (key) => {
                        return props[key];
                    }
                },
                testFunctions = {
                    getGfiFeatureByOlFeatureOpt: (feature, attributes) => {
                        // getGfiFeatureByOlFeatureOpt
                        return attributes;
                    }
                },
                result = getGfiFeaturesByOlFeature(olFeature, "attributes", testFunctions.getGfiFeatureByOlFeatureOpt);

            expect(result).to.be.an("array").with.length(1);
            expect(result[0]).to.equal("attributes");
        });
    });
});

