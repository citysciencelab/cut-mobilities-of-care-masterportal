#!/usr/bin/env bash
# generic script for transfering data by git ftp according to the provided variables from the YAML file.

# Variables FTP_USERNAME, FTP_PASSWORD, FTP_SOURCE_PATH, FTP_TARGET_URL, FTP_UNTRACKED_PATH have to be provided in the pipeline YAML.
# install "git-ftp"
apt-get update && apt-get install -y git-ftp
# store configs for ftp transfer
git config git-ftp.deployedsha1file $FTP_GITLOGFILE
git config git-ftp.user $FTP_USERNAME
git config git-ftp.password $FTP_PASSWORD
git config git-ftp.syncroot $FTP_SOURCE_PATH
git config git-ftp.url $FTP_TARGET_URL
# ATTENTION: (next line) do init once per ftp target-folder to create and transport the .git-ftp.log file containing the SHA1 of the latest commit, after that comment out next line again
# init works once for empty folders after that an error occurs
# git ftp init -vv

echo "commit new files:"
git status
git add .
git commit -am "commit new files"
git status

#replace slashes in branchname with underscores and
tmp=$BITBUCKET_BRANCH
branchname=${tmp//[\/]/_}
# create temporariliy a file called ".git-ftp-include" containing the subfolders in folder ./dist, see https://github.com/git-ftp/git-ftp/blob/master/man/git-ftp.1.md
# Example for several folders:
STR=$FTP_UNTRACKED_PATH
# STR=$'!dist/master_'$branchname$'\n!dist/basic_'$branchname$'\n!dist/masterCustom_'$branchname$'\n!dist/masterDefault_'$branchname$'\n!dist/mastercode'
echo "$STR"  >> .git-ftp-include
echo "git status 1:"
git status
git add .git-ftp-include
git commit -m "Add new content for e2e test"
# catchup works with and without already uploaded files
git ftp catchup -vv
# push all folders defined in ".git-ftp-include" of the current branch to ftp host
git ftp push -b $BITBUCKET_BRANCH --all
echo "git status 2:"
git status



