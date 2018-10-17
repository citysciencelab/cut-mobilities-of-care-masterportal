var ncp = require("ncp").ncp,
    rimraf = require("rimraf"),
    copypathes = [
        {
            "source": "./portal/master",
            "destination": "dist"
        },
        {
            "source": "./build",
            "destination": "dist"
        }
    ];

ncp.limit = 16;

// process.argv.forEach(function (val, index, array) {
//   console.log(index + ": " + val);
// });
// empty dist
rimraf("../../dist/*", function (err) {
    if (err) {
        console.log (err)
    }

    console.log ("Successfully deleted 'dist' directory");
});

copypathes.forEach(function (path) {
    ncp(path.source, path.destination, function (err) {
        if (err) {
            return console.error(err);
        }
        console.log("Successfully Copied '" + path.source + "' to '" + path.destination + "' !" );
    });
});
