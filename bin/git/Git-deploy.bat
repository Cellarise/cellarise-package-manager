cd Release
git rm . -r --cached --quiet
git add .
git status
git commit -m "Deploy release %bamboo_deploy_release%"
git push origin master
