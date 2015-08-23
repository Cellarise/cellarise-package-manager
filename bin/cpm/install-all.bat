REM set path to programs required by installers
set path = c:\OpenSSL-Win32\bin;%windir%\Microsoft.NET\Framework\v4.0.30319;%path%
call npm install --save --msvs_version=2013 %2
call npm dedupe --msvs_version=2013