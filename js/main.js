import "./app";

// CSS-Handling: Importieren von Css damit Webpack das verarbeitet.
import "../css/style.css";

// Less-Handling: Importieren von allen less-Files im modules-Ordner
var context = require.context("../modules/", true, /.+\.less?$/);

context.keys().forEach(context);

export default context;
