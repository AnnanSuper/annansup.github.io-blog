@echo off
chcp 936 >nul
cd /d "%~dp0"
title 梦鸼博客 - 发布上线

echo.
echo   ============================================
echo     梦鸼博客 发布上线
echo   ============================================
echo.
echo   这个窗口会：找出你改过的文件 - 提交 - 推送到 GitHub
echo   推送后 GitHub 会自动重新生成网站。
echo.
echo   约 1 分钟后打开 https://annansup.com 就是新的了。
echo.
echo   --------------------------------------------
echo.

call npm run deploy

echo.
echo   --------------------------------------------
echo   想写一句自己的提交说明，别用这个窗口，改成在
echo   D:\网站 里执行：
echo.
echo       npm run deploy -- "说明文字"
echo.
pause
