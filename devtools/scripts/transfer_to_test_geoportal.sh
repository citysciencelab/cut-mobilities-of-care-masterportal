#!/usr/bin/env bash
set -e
apt-get -qq install git-ftp
git config git-ftp.user $LGV_TEST_FTP_USERNAME
git config git-ftp.password $LGV_TEST_FTP_PASSWORD
git config git-ftp.syncroot dist
git config git-ftp.url ftp://$LGV_TEST_FTP_HOST
tmp=$BITBUCKET_BRANCH
#replace slashes in branchname with underscores
branchname=${tmp//[\/]/_}
STR=$'!dist/master_'$branchname$'\n!dist/basic_'$branchname$'\n!dist/masterCustom_'$branchname$'\n!dist/masterDefault_'$branchname$'\n!dist/mastercode'
echo "$STR"  >> .git-ftp-include
git add .git-ftp-include
git commit .git-ftp-include -m "Add new content for e2e test"
git commit package-lock.json -m "is sometimes modified after install"
git status
# do init once per ftp target-folder to create and transport the .git-ftp.log file containing the SHA1 of the latest commit, after that do always push.
#git ftp init -vv
echo 'before git ftp push'
git ftp push -b $BITBUCKET_BRANCH --all
echo 'after git ftp push'
git status