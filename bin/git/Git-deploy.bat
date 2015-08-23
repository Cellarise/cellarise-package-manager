git rm . -r --cached
git add .
git status
git commit -m "Deploy release %bamboo_deploy_release%"
git push origin master
