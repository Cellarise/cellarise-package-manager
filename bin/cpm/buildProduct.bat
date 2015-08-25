REM set path to programs required by installers
set path = c:\OpenSSL-Win32\bin;%windir%\Microsoft.NET\Framework\v4.0.30319;%path%
call npm install --msvs_version=2013 --production
call cpm gulp %bamboo_gulp_task%
