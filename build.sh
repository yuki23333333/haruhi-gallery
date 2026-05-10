@echo off
echo ========================================
echo  Haruhi Gallery - 构建部署脚本
echo ========================================
echo.

echo [1/4] 清理旧文件...
if exist dist rmdir /s /q dist
if exist haruhi-gallery.exe del haruhi-gallery.exe
echo 完成.

echo.
echo [2/4] 构建前端...
cd frontend
call npm run build
if errorlevel 1 (
    echo 前端构建失败！
    pause
    exit /b 1
)
cd ..
echo 完成.

echo.
echo [3/4] 构建后端 (Linux)...
set GOOS=linux
set GOARCH=amd64
go build -o haruhi-gallery cmd/main.go
if errorlevel 1 (
    echo 后端构建失败！
    pause
    exit /b 1
)
echo 完成.

echo.
echo [4/4] 创建部署包...
mkdir deploy
mkdir deploy\frontend
xcopy /e /i /y frontend\dist deploy\frontend\dist
copy haruhi-gallery deploy\
if not exist deploy\uploads mkdir deploy\uploads

echo.
echo ========================================
echo  构建完成！
echo ========================================
echo.
echo 部署包位置: deploy\
echo.
echo 下一步:
echo 1. 将 deploy 目录上传到服务器
echo 2. 在服务器上执行: bash install.sh
echo.
pause
