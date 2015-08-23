cd Build
cpm gulp publish
git checkout -b "release/%bamboo_jira_version%"
git tag -a "v%bamboo_jira_version%" -m "Release v%bamboo_jira_version%"
git push -u origin "release/%bamboo_jira_version%" --tags
npm publish
