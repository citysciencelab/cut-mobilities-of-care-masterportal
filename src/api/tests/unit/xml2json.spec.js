import {expect} from "chai";
import xml2json from "../../xml2json";

describe("src/api/xml2json.js", () => {
    const xmlString = `<book>
                        <title>Borne</title>
                        <description>A giant bear...</description>
                        <author>
                            <id>1</id>
                            <name>Jeff Vandermeer</name>
                        </author>
                        <review>Nice book</review>
                        <review>This book is not so good</review>
                        <review>Amazing work</review>
                    </book>`;
    let xmlDoc, json;

    before(function () {
        const domParser = new DOMParser();

        xmlDoc = domParser.parseFromString(xmlString, "text/xml");
        json = xml2json(xmlDoc);
    });

    it("should be an object that represents a book", () => {
        expect(json).to.be.an("object");
        expect(json).to.have.all.key("book");
    });

    it("this book should have a title, a description, an author and at least one review", () => {
        expect(json.book).to.have.all.key("title", "description", "author", "review");
    });

    it("this book should have the title 'Borne'", () => {
        expect(json.book.title.getValue()).to.equal("Borne");
    });

    it("the author of the book should have an id and a name", () => {
        expect(json.book.author).to.have.all.key("id", "name");
    });

    it("the name of the author should be 'Jeff Vandermeer'", () => {
        expect(json.book.author.name.getValue()).to.equal("Jeff Vandermeer");
    });

    it("the book should have three reviews", () => {
        expect(json.book.review).to.be.an("array");
        expect(json.book.review).to.have.lengthOf(3);
    });

    it("the second review of the book should be 'This book is not so good'", () => {
        expect(json.book.review[1].getValue()).to.equal("This book is not so good");
    });
});
