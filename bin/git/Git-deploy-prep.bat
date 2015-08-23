IF EXIST ./Build/.git GOTO GITEXISTS
git clone "%deployUrl%" Release
:GITEXISTS
cd Build
git fetch --all
git reset --hard origin/master
robocopy %emptyDirForRobocopy% ./Build /purge /xd .git
