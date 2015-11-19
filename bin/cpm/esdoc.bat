set path = c:\OpenSSL-Win32\bin;%windir%\Microsoft.NET\Framework\v4.0.30319;%path%
call cpm gulp docs_product
call "%~dp0/../../node_modules/.bin/esdoc -c ./doc.json"
