var ncp = require("ncp").ncp,
    rimraf = require("rimraf");

ncp.limit = 16;

// process.argv.forEach(function (val, index, array) {
//   console.log(index + ": " + val);
// });

rimraf("dist/*", function (err) {
    if (err) {
        console.log (err)
    }

    console.log ("Successfully deleted a directory");
});

ncp("./portal/master", "dist", function (err) {
    if (err) {
        return console.error(err);
    }
    console.log("done!");
});

ncp("./build", "dist", function (err) {
    if (err) {
        return console.error(err);
    }
    console.log("done!");
});
