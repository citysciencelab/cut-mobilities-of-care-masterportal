/**
 * Main.js specification
 * Loads the module and runs the test suite
 */
define(['main'], function (main) {
    'use strict';

    // Test suit
    describe('Main', function () {

        it('is available', function () {
            expect(main).not.toBe(null);
        });
    });
});