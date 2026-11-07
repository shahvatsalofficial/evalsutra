@echo off
node "%~dp0..\packages\cli\evalsutra.mjs" %*
exit /b %errorlevel%
