set path = c:\OpenSSL-Win32\bin;%windir%\Microsoft.NET\Framework\v4.0.30319;%path%
call node  "%~dp0\..\node_modules\azure-functions-core-tools\lib\main.js" %2 %3
