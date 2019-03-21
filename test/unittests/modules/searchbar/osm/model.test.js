import {expect} from "chai";
import Model from "@modules/searchbar/OSM/model.js";

describe("modules/searchbar/osm", function () {
    var model = {},
        config = {
            "searchBar":
            {
                "osm": {
                    "minChars": 3,
                    "serviceId": "10",
                    "limit": 60,
                    "states": "Hamburg",
                    "classes": "place,highway,building,shop,historic,leisure"
                },
                "visibleWFS":
                {
                    "minChars": 3
                },
                "zoomLevel": 9,
                "placeholder": "Suche nach Adresse/Krankenhaus/B-Plan"
            }
        };

    before(function () {
        model = new Model(config);
    });
    describe("isSearched", function () {
        var searched = {
                "place_id": "83615484",
                "licence": "Data © OpenStreetMap contributors, ODbL 1.0. https:\/\/osm.org\/copyright",
                "osm_type": "way",
                "osm_id": "30996321",
                "boundingbox": ["53.4962341", "53.4964279", "10.0088294", "10.0098278"],
                "lat": "53.4963541",
                "lon": "10.0094392",
                "display_name": "Neuenfelder Straße, Wilhelmsburg, Hamburg-Mitte, Kirchdorf, Hamburg, 21109, Deutschland",
                "class": "highway",
                "type": "secondary",
                "importance": 0.4,
                "address": {
                    "road": "Neuenfelder Straße",
                    "suburb": "Wilhelmsburg",
                    "city_district": "Hamburg-Mitte",
                    "hamlet": "Kirchdorf",
                    "state": "Hamburg",
                    "postcode": "21109",
                    "country": "Deutschland",
                    "country_code": "de"
                },
                "extratags": {
                    "lanes": "1",
                    "oneway": "yes",
                    "surface": "asphalt",
                    "maxspeed": "50",
                    "smoothness": "good"
                }
            },
            params = ["hamburg", "neuenfelder", "straße"];

        it("should be true by correct input response from osm", function () {
            expect(model.isSearched(searched, params)).to.be.true;
        });
        it("should be false for empty input object", function () {
            expect(model.isSearched({}, params)).to.be.false;
        });
        it("should be false for to short input object", function () {
            expect(model.isSearched({"address": {"road": "Neuenfelder Straße", "suburb": "Wilhelmsburg"}}, params)).to.be.false;
        });
    });
});
