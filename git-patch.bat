setlocal enabledelayedexpansion
set commit=%%1
del update.zip
set output=
for /f "delims=" %%a in ('git diff --name-only %1 --diff-filter=ACMRTUXB') do ( set output=!output! "%%a" )
git archive -o update.zip HEAD %output%
endlocal
