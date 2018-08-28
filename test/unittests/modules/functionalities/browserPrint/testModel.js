define(function (require) {
    var expect = require("chai").expect,
        BrowserPrint = require("../../../../modules/functionalities/browserPrint/model");

    describe("functionalities/browserPrint", function () {
        var model,
            defs;

        before(function () {
            model = new BrowserPrint();
        });
        beforeEach(function () {
            defs = {
                content: []
            };
        });

        describe("appendTitle", function () {
            it("should append title", function () {
                expect(model.appendTitle(defs, "date", "MyTitle")).to.deep.equal({
                    content: [
                        {
                            text: [
                                {
                                    text: "MyTitle",
                                    style: ["large", "bold", "center"]
                                },
                                {
                                    text: " (Stand: date)",
                                    style: ["normal", "center"]
                                }
                            ],
                            style: "header"
                        }
                    ]
                });
            });
        });
        describe("appendFooter", function () {
            it("should append footer", function () {
                var defsWithFooter = model.appendFooter(defs);

                defsWithFooter = model.appendFooter(defs, model.get("footerText"));

                expect(defsWithFooter.footer(1, 2)).to.deep.equal([
                    {
                        text: "1 / 2",
                        style: ["xsmall", "center"]
                    },
                    {
                        text: "Kartographie und Gestaltung: Freie und Hansestadt Hamburg \nLandesbetrieb Geoinformation und Vermessung",
                        style: ["xsmall", "center"]
                    }
                ]);
            });
        });
        describe("appendStyles", function () {
            it("should append styles", function () {
                expect(model.appendStyles(defs)).to.deep.equal({
                    content: [
                    ],
                    styles: {
                        large: {
                            fontSize: 18
                        },
                        header: {
                            margin: [0, 10]
                        },
                        subheader: {
                            fontSize: 14,
                            margin: [0, 10]
                        },
                        normal: {
                            fontSize: 12
                        },
                        bold: {
                            bold: true
                        },
                        small: {
                            fontSize: 10
                        },
                        xsmall: {
                            fontSize: 8
                        },
                        image: {
                            margin: [0, 10],
                            alignment: "left"
                        },
                        onGrey: {
                            margin: [10, 10]
                        },
                        center: {
                            alignment: "center"
                        }
                    }
                });
            });
        });
    });
});
