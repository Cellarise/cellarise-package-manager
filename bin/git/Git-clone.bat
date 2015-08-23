setlocal enabledelayedexpansion
SET _find=ssh://git@stash.cellarise.com:7999
SET _replace=https://john.barry@stash.cellarise.com/scm

call set repositoryUrl=%%bamboo_planRepository_repositoryUrl:!_find!=!_replace!%%
setlocal disabledelayedexpansion

git clone "%repositoryUrl%" Git
