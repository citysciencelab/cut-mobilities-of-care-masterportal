# Choosing a version number

Masterportal versioning is done according to the rules of [semantic versioning](https://semver.org/), matching the following pattern:

**MAJOR.MINOR.PATCH**

Version numbers following this are e.g. `0.0.1`, `1.0.0`, or `2.5.265`. In short, these rules are used:

1. The **MAJOR** number is increased on changes to the public API introducing incompatibilities to prior versions.
2. The **MINOR** number is increased on adding functionalities. The product remains compatible to the public API of previously released versions.
3. The **PATCH** number is increased on bug fixes that do not have any effect on the package's API, also preserving backwards compatibility.
