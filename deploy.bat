@echo off
echo ========================================
echo  快速部署到服务器
echo ========================================
echo.

set SERVER=root@yukigallery.com
set DEPLOY_FILE=deploy.tar.gz

echo 请确保:
echo 1. 已运行 build.bat
echo 2. 服务器 SSH 连接正常
echo 3. 已配置域名 DNS
echo.

set /p CONTINUE="继续部署? (y/n): "
if /i not "%CONTINUE%"=="y" (
    echo 取消部署.
    pause
    exit /b 0
)

echo.
echo [1/3] 创建部署包...
cd deploy
tar -czf ../%DEPLOY_FILE% *
cd ..
if errorlevel 1 (
    echo 打包失败！请先运行 build.bat
    pause
    exit /b 1
)

echo.
echo [2/3] 上传到服务器...
scp %DEPLOY_FILE% %SERVER%:/tmp/
if errorlevel 1 (
    echo 上传失败！请检查:
    echo - 服务器是否可连接
    echo - SSH 密钥是否配置
    pause
    exit /b 1
)

echo.
echo [3/3] 在服务器上安装...
echo 正在连接服务器...
plink %SERVER% "cd /tmp && tar -xzf %DEPLOY_FILE% && cd /opt/haruhi-gallery && tar -xzf /tmp/%DEPLOY_FILE% && systemctl restart haruhi-gallery && nginx -s reload"

if errorlevel 1 (
    echo 远程安装失败！
    echo 请手动 SSH 到服务器执行:
    echo ssh %SERVER%
    pause
    exit /b 1
)

echo.
echo ========================================
echo  部署完成！
echo ========================================
echo.
echo 访问网站: https://yukigallery.com
echo.
pause
