@echo off
title Push ExamSeatX to GitHub
cd /d "d:\CLASS PROJECT"
echo ========================================================
echo        Pushing ExamSeatX to GitHub Repository
echo ========================================================
echo.
"d:\CLASS PROJECT\git\cmd\git.exe" push -u origin main
echo.
if %ERRORLEVEL% equ 0 (
    echo ========================================================
    echo  SUCCESS! Code pushed to GitHub!
    echo ========================================================
) else (
    echo.
    echo If GitHub asks for sign-in, complete the browser login.
)
pause

