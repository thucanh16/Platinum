@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Hãy bật MySQL trước. Sau khi server chạy, mở http://localhost:3000
call npm start
pause
