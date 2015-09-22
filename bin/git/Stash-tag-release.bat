IF EXIST ./.git GOTO GITEXISTS
git clone "%stashUrl%" StashRelease
:GITEXISTS
cd StashRelease
git checkout master
git checkout -b "release/%bamboo_jira_version%"
git tag -a "v%bamboo_jira_version%" -m "Release v%bamboo_jira_version%"
git push origin "release/%bamboo_jira_version%" --tags
git checkout production
git merge "release/%bamboo_jira_version%"
git tag -a "v%bamboo_jira_version%" -m "Release v%bamboo_jira_version%" production
git push origin production --tags
