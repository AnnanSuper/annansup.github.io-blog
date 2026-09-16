@echo off
chcp 936 >nul
cd /d "%~dp0"
title 梦鸼博客 - 本地预览

echo.
echo   ============================================
echo     梦鸼博客 本地预览
echo   ============================================
echo.
echo   稍等几秒，然后浏览器打开：
echo.
echo       http://localhost:4000
echo.
echo   改文件会自动刷新。
echo   看完按 Ctrl + C 停止，或直接关掉这个窗口。
echo.
echo   --------------------------------------------
echo.

call npm run server

echo.
echo   预览已停止。如果上面有红色报错，请截图发我。
echo.
pause
