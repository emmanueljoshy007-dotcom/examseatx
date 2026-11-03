@echo off
title ExamSeatX - Automated Seating Allocation System
echo ========================================================
echo        ExamSeatX - System Launcher
echo ========================================================
echo.

echo [1/3] Starting Spring Boot Backend (Port 8080)...
start "ExamSeatX Backend" cmd /k "cd /d d:\CLASS PROJECT\examSeatX-backend && C:\maven\apache-maven-3.9.9\bin\mvn.cmd spring-boot:run"

timeout /t 8 /nobreak >nul

echo [2/3] Starting React Frontend (Port 5173)...
start "ExamSeatX Frontend" cmd /k "cd /d d:\CLASS PROJECT\examSeatX-frontend && npm.cmd run dev -- --host"

timeout /t 5 /nobreak >nul

echo [3/3] Starting Cloudflare Public Tunnel...
start "ExamSeatX Public Tunnel" cmd /k "d:\CLASS PROJECT\cloudflared.exe tunnel --protocol http2 --url http://localhost:5173"

echo.
echo ========================================================
echo System launched successfully!
echo - Local UI:       http://localhost:5173
echo - Backend API:    http://localhost:8080/api
echo - H2 DB Console:  http://localhost:8080/h2-console
echo - Public URL:     Check the 'ExamSeatX Public Tunnel' window
echo ========================================================
pause

