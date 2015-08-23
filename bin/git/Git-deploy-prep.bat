IF EXIST ./.git GOTO GITEXISTS
git clone "%deployUrl%" Release
:GITEXISTS
git fetch --all
git reset --hard origin/master
robocopy %emptyDirForRobocopy% ./ /purge /xd .git
