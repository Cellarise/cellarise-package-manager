REM set path to programs required by installers
set path = c:\OpenSSL-Win32\bin;%windir%\Microsoft.NET\Framework\v4.0.30319;%path%
call npm prune
call npm update --msvs_version=2013 --arch=ia32 %2
call npm dedupe --msvs_version=2013 --arch=ia32