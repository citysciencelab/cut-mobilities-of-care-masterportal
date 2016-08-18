#!/bin/bash

NAME=""
PWD=""

function addCredentials () {
    sed -i "s/bitbucket/${NAME}\:${PWD}@bitbucket/g" bower.json
}
function removeCredentials () {
    git checkout bower.json
}
function bowerUpdate () {
    addCredentials
    bower update
    removeCredentials
}

