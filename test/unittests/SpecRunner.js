// var context = require.context("./modules/", true, /.+\.js?$/);

// console.log(context.keys());
// context.keys().forEach(context);

// export default context;



function requireAll(req, cb) {
    // store moduleName => module mappings to prevent overriding
    let modules = {};

    if (!Array.isArray(req)) req = [req];
    // go trough each require.context
    for (let reqItem of req) {
        // go through each module
        for (let name of reqItem.keys()) {
            // skip module if it is already required
            if (modules.hasOwnProperty(name)) continue;
            // require module
            let module = reqItem(name);
            if (module.default) module = module.default;
            // callback
            if (cb) cb(module, name);
            // memorize module
            modules[name] = module;
        }
    }
    return modules;
}

var context = requireAll([
    require.context("./modules/", true, /.+\.js?$/),
    require.context("../../portalconfigs/test/", true, /.+\.js?$/)
    ]);

export default context;
