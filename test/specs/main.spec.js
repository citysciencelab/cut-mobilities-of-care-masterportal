/**
 * App.js specification
 * Loads the module and runs the test suite
 */
define(['app'], function (app) {
    'use strict';

    // Test suit
    describe('Application', function () {

        it('is available', function () {
            expect(app).not.toBe(null);
        });
    });
});
