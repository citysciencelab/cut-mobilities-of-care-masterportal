#!/usr/bin/env bash
set -e
apt-get -qq install git-ftp
git config git-ftp.user $LGV_TEST_FTP_USERNAME
git config git-ftp.password $LGV_TEST_FTP_PASSWORD
git config git-ftp.syncroot dist
git config git-ftp.url ftp://$LGV_TEST_FTP_HOST
# do init once per ftp target-folder to create and transport the .git-ftp.log file containing the SHA1 of the latest commit, after that do always push.
# - git ftp init -vv
STR=$'!dist/master_'$BITBUCKET_BRANCH$'\n!dist/basic_'$BITBUCKET_BRANCH$'\n!dist/masterCustom_'$BITBUCKET_BRANCH$'\n!dist/masterDefault_'$BITBUCKET_BRANCH$'\n!dist/mastercode'
echo "$STR"  >> .git-ftp-include
git add .git-ftp-include
git commit .git-ftp-include -m "Add new content for e2e test"
git status -uno --porcelain
git ftp push -b $BITBUCKET_BRANCH --all