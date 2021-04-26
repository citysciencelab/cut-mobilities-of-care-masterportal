/*
Copyright (c) 2020 Mikhail Losev

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

masterportal: we needed to copy this reporter for making some changes.
*/
const Mocha = require("mocha");
const milliseconds = require("ms"),

    {
        EVENT_RUN_BEGIN,
        EVENT_RUN_END,
        EVENT_SUITE_BEGIN,
        EVENT_SUITE_END,
        EVENT_TEST_FAIL,
        EVENT_TEST_PASS,
        EVENT_TEST_PENDING,
        EVENT_TEST_RETRY
    } = Mocha.Runner.constants,

    {inherits} = Mocha.utils,

    Base = Mocha.reporters.Base,
    color = Base.color;

exports = module.exports = SpecWithRetries;

/**
 * A mocha reporter like the SPEC but additional info aubout rettries.
 * @param {object} runner moch testrunner
 * @param {object} options options
 * @returns {void}
 */
function SpecWithRetries (runner, options) {
    Base.call(this, runner, options);

    this.stats.unstables = [];

    /* eslint-disable-next-line consistent-this */
    const self = this;
    let indents = 0,
        n = 0;

    /**
     * Idents.
     * @returns {string} the indents joined with space
     */
    function indent () {
        return Array(indents).join("  ");
    }

    /**
     * Groups by...
     * @param {array} collection the collection
     * @param {function} predicate the prodicate
     * @returns {array} reduced collection
     */
    function groupBy (collection, predicate) {
        return collection.reduce((r, v, i, a, k = predicate(v)) => ((r[k] || (r[k] = [])).push(v), r), {}); // eslint-disable-line no-sequences
    }

    /**
     * epilogue
     * @returns {void}
     */
    function epilogue () {
        const stats = this.stats;
        let fmt;

        Base.consoleLog();

        // passes
        fmt =
            color("bright pass", " ") +
            color("green", " %d passing") +
            color("light", " (%s)");

        Base.consoleLog(fmt, stats.passes || 0, milliseconds(stats.duration));

        // pending
        if (stats.pending) {
            fmt = color("pending", " ") + color("pending", " %d pending");

            Base.consoleLog(fmt, stats.pending);
        }

        // failures
        if (stats.failures) {
            fmt = color("fail", "  %d failing");

            Base.consoleLog(fmt, stats.failures);

            Base.list(this.failures);
        }

        // unstable tests
        if (stats.unstables.length) {
            Base.consoleLog();

            fmt = color("bright yellow", "  Retried test(s):");

            Base.consoleLog(fmt);

            const groupedByFile = groupBy(stats.unstables, unstable => unstable.file);

            Object.entries(groupedByFile)
                .forEach(([key, value]) => {
                    Base.consoleLog(color("bright yellow", "    %s"), key);

                    value.forEach(unstableTest => {
                        Base.consoleLog(color("bright yellow", "      %s"), unstableTest.fullTitle());
                    });
                });
        }

        Base.consoleLog();
    }

    /**
     * returns the testindex
     * @param {array} collection  the collection
     * @param {object} test the test
     * @returns {number} the testindex
     */
    function findTestIndex (collection, test) {
        return collection.findIndex(item => {
            return item.file === test.file &&
                item.title === test.title;
        });
    }

    runner.on(EVENT_RUN_BEGIN, function () {
        Base.consoleLog();
    });

    runner.on(EVENT_SUITE_BEGIN, function (suite) {
        ++indents;
        Base.consoleLog(color("suite", "%s%s"), indent(), suite.title);
    });

    runner.on(EVENT_SUITE_END, function () {
        --indents;
        if (indents === 1) {
            Base.consoleLog();
        }
    });

    runner.on(EVENT_TEST_PENDING, function (test) {
        const fmt = indent() + color("pending", "  - %s");

        Base.consoleLog(fmt, test.title);
    });

    runner.on(EVENT_TEST_PASS, function (test) {
        let fmt;

        if (test.speed === "fast") {
            fmt =
                indent() +
                color("checkmark", "  " + Base.symbols.ok) +
                color("pass", " %s");
            Base.consoleLog(fmt, test.title);
        }
        else {
            fmt =
                indent() +
                color("checkmark", "  " + Base.symbols.ok) +
                color("pass", " %s") +
                color(test.speed, " (%dms)");
            Base.consoleLog(fmt, test.title, test.duration);
        }
    });

    runner.on(EVENT_TEST_FAIL, function (test) {
        Base.consoleLog(indent() + color("fail", "  %d) %s"), ++n, test.title);

        const index = findTestIndex(this.stats.unstables, test);

        if (index > -1) {
            this.stats.unstables.splice(index, 1);
        }
    });

    runner.on(EVENT_TEST_RETRY, test => {
        this.stats.unstables.push(test);
    });

    runner.once(EVENT_RUN_END, () => {
        epilogue.call(self);
    });
}

inherits(SpecWithRetries, Base);

SpecWithRetries.description = "hierarchical & verbose & display retried tests";
