set path = c:\OpenSSL-Win32\bin;%windir%\Microsoft.NET\Framework\v4.0.30319;%path%
call "%~dp0clean.bat"
call cgulp %2 %3