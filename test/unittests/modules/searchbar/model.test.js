import Model from "@modules/searchbar/model.js";
import {expect} from "chai";
import sinon from "sinon";

describe("modules/searchbar", function () {
    let model = {},
        triggered = false;

    before(function () {
        model = new Model();
        sinon.stub(Radio, "trigger").callsFake(function (channel, topic) {
            if (topic === "alert") {
                triggered = true;
                return null;
            }
            return null;
        });
    });

    after(function () {
        sinon.restore();
    });

    describe("changeFileExtension", function () {
        it("should correctly change extension to extension with shorter length ", function () {
            expect(model.changeFileExtension("test.svg", ".js")).to.be.an("string").that.equals("test.js");
        });
        it("should  correctly change extension to extension with longer length ", function () {
            expect(model.changeFileExtension("test.js", ".svg")).to.be.an("string").that.equals("test.svg");
        });
        it("should return undefined if source is undefined", function () {
            expect(model.changeFileExtension("test.js", ".svg")).to.be.an("string").that.equals("test.svg");
        });
    });
    describe("shortenNames", function () {
        it("should return name if name is shorter then length", function () {
            expect(model.shortenString("test", 5)).to.be.an("string").that.equals("test");
        });
        it("should return name if name length is euqal to length", function () {
            expect(model.shortenString("test", 4)).to.be.an("string").that.equals("test");
        });
        it("should return name croped to length extended with '...' if name is longer then length", function () {
            expect(model.shortenString("test", 3)).to.be.an("string").that.equals("tes..");
        });
        it("should return undefined if name is undefined", function () {
            expect(model.shortenString(undefined, 1)).to.be.undefined;
        });

        describe("removeHits for object-filter", function () {
            it("remove multiple items if filter-attributes are matching", function () {

                model.set("hitList", [
                    {
                        "name": "Bebauungspläne im Verfahren (§ 2 BauGB)",
                        "type": "Thema",
                        "id": "1562"
                    },
                    {
                        "name": "Festgestellte Bebauungspläne (§ 10 BauGB)",
                        "type": "Thema",
                        "id": "1561"
                    }
                ]);

                model.removeHits("hitList", {type: "Thema"});

                expect(model.get("hitList")).to.be.empty;
            });

            it("keep multiple items if filter-attributes are not matching", function () {
                const hitListObj = [
                    {
                        "name": "Bebauungspläne im Verfahren (§ 2 BauGB)",
                        "type": "Thema",
                        "id": "1562"
                    },
                    {
                        "name": "Festgestellte Bebauungspläne (§ 10 BauGB)",
                        "type": "Thema",
                        "id": "1561"
                    }
                ];

                model.set("hitList", hitListObj);

                model.removeHits("hitList", {type: "OpenStreetMap"});

                expect(model.get("hitList")).to.deep.equal(hitListObj);
            });

            it("handle items with matching and not matching filter attributes", function () {

                const hitListObjInput = [
                        {
                            "name": "Bebauungspläne im Verfahren (§ 2 BauGB)",
                            "type": "Thema",
                            "id": "1562"
                        },
                        {
                            "name": "Hamburg",
                            "type": "OpenStreetMap"
                        }
                    ],
                    hitListObijOutput = [
                        {
                            "name": "Bebauungspläne im Verfahren (§ 2 BauGB)",
                            "type": "Thema",
                            "id": "1562"
                        }
                    ];

                model.set("hitList", hitListObjInput);

                model.removeHits("hitList", {type: "OpenStreetMap"});

                expect(model.get("hitList")).to.deep.equal(hitListObijOutput);
            });

            it("handle items with matching and not matching multi-key filter attributes", function () {

                const hitListObjInput = [
                        {
                            "name": "Bebauungspläne im Verfahren (§ 2 BauGB)",
                            "type": "Thema",
                            "id": "1562"
                        },
                        {
                            "name": "Festgestellte Bebauungspläne (§ 10 BauGB)",
                            "type": "Thema",
                            "id": "1561"
                        }
                    ],
                    hitListObijOutput = [
                        {
                            "name": "Bebauungspläne im Verfahren (§ 2 BauGB)",
                            "type": "Thema",
                            "id": "1562"
                        }
                    ];

                model.set("hitList", hitListObjInput);

                model.removeHits("hitList", {type: "Thema", id: "1561"});

                expect(model.get("hitList")).to.deep.equal(hitListObijOutput);
            });
        });
    });

    describe("checkInitialSearchResult", function () {
        it("should not trigger Radio when Array is not empty", function () {
            model.checkInitialSearchResult(["hit"]);
            expect(triggered).to.be.false;
        });
        it("should trigger Radio when Array is empty", function () {
            model.checkInitialSearchResult([]);
            expect(triggered).to.be.true;
        });
    });
});
