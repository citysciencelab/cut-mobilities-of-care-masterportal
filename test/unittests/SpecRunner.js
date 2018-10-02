var context = require.context("./modules/", true, /.+\.js?$/);

context.keys().forEach(context);

export default context;
