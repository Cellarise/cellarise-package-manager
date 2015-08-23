setlocal enabledelayedexpansion
SET _find=ssh://git@stash.cellarise.com:7999
SET _replace=https://john.barry@stash.cellarise.com/scm

call set repositoryUrl=%%bamboo_planRepository_repositoryUrl:!_find!=!_replace!%%
setlocal disabledelayedexpansion

git clone "%repositoryUrl%" Git
cd Git
git checkout master
git checkout -b "release/%bamboo_jira_version%"
git tag -a "v%bamboo_jira_version%" -m "Release v%bamboo_jira_version%"
git push origin "release/%bamboo_jira_version%" --tags
git checkout production
git merge "release/%bamboo_jira_version%"
git tag -a "v%bamboo_jira_version%" -m "Release v%bamboo_jira_version%" production
git push origin production --tags
