#!/usr/bin/env bash
set -e
# install "git-ftp"
apt-get -qq install git-ftp
# store configs for ftp transfer
git config git-ftp.user $LGV_TEST_FTP_USERNAME
git config git-ftp.password $LGV_TEST_FTP_PASSWORD
git config git-ftp.syncroot dist
git config git-ftp.url ftp://test.geoportal-hamburg.de/
git ftp catchup -vv
#replace slashes in branchname with underscores and
tmp=$BITBUCKET_BRANCH
branchname=${tmp//[\/]/_}
#create temporariliy a file called ".git-ftp-include" containing the subfolders in folder ./dist, see https://github.com/git-ftp/git-ftp/blob/master/man/git-ftp.1.md
STR=$'!dist/master_'$branchname$'\n!dist/basic_'$branchname$'\n!dist/masterCustom_'$branchname$'\n!dist/masterDefault_'$branchname$'\n!dist/mastercode'
echo "$STR"  >> .git-ftp-include
echo "git status 1:"
git status
echo "ls -al:"
ls -al
git add .git-ftp-include
git commit .git-ftp-include -m "Add new content for e2e test"
echo "git status 2:"
git status
git add addons/
git commit addons/ -m "is sometimes modified after install"
echo "git status 3:"
git status
# git commit package-lock.json -m "is sometimes modified after install"
echo "git status 4:"
git status
# ATTENTION: (next line) do init once per ftp target-folder to create and transport the .git-ftp.log file containing the SHA1 of the latest commit, after that comment out next line again
# git ftp init -vv
# push all folders defined in ".git-ftp-include" of the current branch to ftp host
git ftp push -b $BITBUCKET_BRANCH --all
