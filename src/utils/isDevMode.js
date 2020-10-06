/**
 * @const {Boolean} isDevMode if true, webpack indicates that dev mode is active
 */
const isDevMode = process.env.NODE_ENV === "development"; // eslint-disable-line

export default isDevMode;
