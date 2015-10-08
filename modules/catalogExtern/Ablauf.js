Ablauf


AddWMS:loadAndAddLayers(){}
    EventBus.trigger("layerlist:addNewModel", layerObj);
    Effekt:     {
                    Layer:list.addExternalLayer()
                }
    //nachdem alle Layers hinzugefügt wurden
    EventBus.trigger("layerList:sendExternalFolders");
    Effekt:     {
                    // Die namen der Ordner
                    Layer:list.sendExternalNodeNames() {}
                        EventBus.trigger("catEx:sendExternalNodeNames", _.uniq(folders));
                        Effekt: {
                                    //Ordner erzeugen
                                    cataloExtern:list.createNodes() {}
                                        EventBus.trigger("catalogExtern/node:getLayers");
                                        Effekt: {
                                            //anonyme funktion, wird aufgerufen, damit alle nodes sich ihre (name=foldername) layer holen
                                            catalogExtern:node.function () {}
                                                    EventBus.trigger("layerlist:getLayerListForNode", this.get("category"), this.get("name"));
                                                    Effekt: {
                                                        //holt alles Layer die als "folder" attribut nodeName haben
                                                        Layer:list.sendLayerListForNode(){}
                                                        EventBus.trigger("layerlist:sendLayerListForExternalNode", this.where({folder: nodeName}));
                                                        Effekt: {
                                                            //setzt die Layer
                                                            catalogExtern:node.setLayerList
                                                        }
                                                    }
                                        }
                        }

    }
