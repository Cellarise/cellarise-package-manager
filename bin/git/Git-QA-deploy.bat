git init
git remote add origin %bamboo_REMOTE_GIT%
git fetch
git reset origin/master
git rm . -r --cached --quiet
git add .
git commit -m "Deploy QA build %bamboo_buildNumber%"
git push origin master
