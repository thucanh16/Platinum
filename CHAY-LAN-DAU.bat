@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 goto no_node
if not exist .env copy .env.example .env >nul
echo Sửa DB_HOST, DB_PORT, DB_USER, DB_PASSWORD theo MySQL trên máy rồi lưu file.
start /wait notepad .env
call npm ci
if errorlevel 1 goto failed
call npm run setup
if errorlevel 1 goto failed
echo Mở http://localhost:3000 sau khi server chạy.
call npm start
goto end
:no_node
echo Hãy cài Node.js 22 trở lên rồi mở lại file này.
goto end
:failed
echo Có lỗi. Hãy xem thông báo phía trên và hướng dẫn README.md.
:end
pause
