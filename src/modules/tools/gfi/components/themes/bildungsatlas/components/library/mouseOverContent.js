/**
 * @todo: Diese Mousehover-Funktion ist zunächst ein Workaround. Ein späteres Refactoring ist geplant.
 * returns a mouseover content
 * @param {Object} attr the attributes to be inserted in the html content
 * @returns {Object[]}  a list of object{getTheme, getTitle, getAttributesToShow, getProperties, getGfiUrl} or an emtpy array
 */
function mouseOverCotentLivingLocation (attr) {
    const template = "<table class=\"table table-striped\">\n" +
        "    <thead>\n" +
        "        <tr>\n" +
        "            <th colspan=\"3\">" + attr.schoolName + "</th>\n" +
        "        </tr>\n" +
        "    </thead>\n" +
        "    <tbody>\n" +
        "        <tr>\n" +
        "            <td width=\"25%\">Adresse:</td>\n" +
        "            <td colspan=\"2\">" + attr.address.street + " " + attr.address.houseNumber + "<br" + attr.address.postalCode + " " + attr.address.city + "</td>\n" +
        "        </tr>\n" +
        "        <tr>\n" +
        "            <td colspan=\"2\">Gesamtanzahl der Schüler:</td>\n" +
        "            <td width=\"25%\">" + attr.numberOfStudents + "</td>\n" +
        "        </tr>\n" +
        "        <tr>\n" +
        "            <td colspan=\"2\">Anzahl der Schülerinnen und Schüler<br> in der Primarstufe:</td>\n" +
        "            <td>" + attr.numberOfStudentsPrimary + "</td>\n" +
        "        </tr>\n" +
        "        <tr>\n" +
        "            <td colspan=\"2\">Sozialindex der Schüler:</td>\n" +
        "            <td>" + attr.socialIndex + "</td>\n" +
        "        </tr>\n" +
        "        <tr>\n" +
        "            <td colspan=\"2\">Anteil der Schülerschaft des angeklickten<br> Gebiets, der diese Schule besucht<br> an der gesamten Schülerschaft des<br> angeklickten Gebiets (" + attr.schoolLevelTitle + "):</td>\n" +
        "            <td>" + attr.percentageOfStudentsFromDistrict + "%</td>\n" +
        "        </tr>\n" +
        "        <tr>\n" +
        "            <td colspan=\"2\">Anzahl:</td>\n" +
        "            <td>" + attr.numberOfStudentsFromDistrict + "</td>\n" +
        "        </tr>\n" +
        "    </tbody>\n" +
        "</table>";

    return template;
}

export default mouseOverCotentLivingLocation;
