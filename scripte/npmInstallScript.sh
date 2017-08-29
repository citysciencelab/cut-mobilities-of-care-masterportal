NAME=""
PASS=""
BUILDREPO="lgv-g12\/build-config"
CONFIGREPO="lgv-g12\/lgv-config"
function addCredentials () {
    sed -i "s/bitbucket/${NAME}\:${PASS}@bitbucket/g" $1
}
function removeCredentials () {
   sed -i "s/${NAME}\:${PASS}@bitbucket/bitbucket/g" $1
}
function selectRepo () {
    sed -i "s/lgv-g12\/build-config-public/${BUILDREPO}/g" $1
    sed -i "s/lgv-g12\/lgv-config-public/${CONFIGREPO}/g" $1
}
function bowerupdate () {
    addCredentials
    bower update $1 | sed 's/'${PASS}/'nichtSoNeugierigMarkus!/g'
    removeCredentials
    echo "update finished"
}
function npmInstall () {
    backupFile package.json
    addCredentials package.json
    selectRepo package.json
    npm install --verbose | sed 's/'${PASS}/'nichtSoNeugierigMarkus!/g'
    restoreFile package.json
}
function backupFile() {
    cp $1 $1.bak
}
function restoreFile() {
    mv "$1.bak" $1
}
