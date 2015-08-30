IF EXIST ./Release/.git GOTO GITEXISTS
git clone "%deployUrl%" Release
:GITEXISTS
cd Release
git fetch --all
git reset --hard origin/master
robocopy %emptyDir% ./ /purge /xd .git
if %ERRORLEVEL% LEQ 3 EXIT /B 0
