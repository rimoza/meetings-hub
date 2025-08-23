@echo off
echo Formatting new/changed code for best practices...

echo.
echo Checking for modified files...
for /f "tokens=*" %%i in ('git diff --name-only HEAD') do (
    echo Found modified file: %%i
    if "%%~xi"==".js" call npx prettier --write "%%i"
    if "%%~xi"==".jsx" call npx prettier --write "%%i"
    if "%%~xi"==".ts" call npx prettier --write "%%i"
    if "%%~xi"==".tsx" call npx prettier --write "%%i"
    if "%%~xi"==".json" call npx prettier --write "%%i"
    if "%%~xi"==".css" call npx prettier --write "%%i"
    if "%%~xi"==".md" call npx prettier --write "%%i"
)

echo.
echo Checking for staged files...
for /f "tokens=*" %%i in ('git diff --cached --name-only') do (
    echo Found staged file: %%i
    if "%%~xi"==".js" call npx prettier --write "%%i"
    if "%%~xi"==".jsx" call npx prettier --write "%%i"
    if "%%~xi"==".ts" call npx prettier --write "%%i"
    if "%%~xi"==".tsx" call npx prettier --write "%%i"
    if "%%~xi"==".json" call npx prettier --write "%%i"
    if "%%~xi"==".css" call npx prettier --write "%%i"
    if "%%~xi"==".md" call npx prettier --write "%%i"
)

echo.
echo Running ESLint on changed files only...
git diff --name-only HEAD | findstr /E "\.(js|jsx|ts|tsx)$" > temp_files.txt
if not %errorlevel%==0 goto skip_eslint
for /f %%i in (temp_files.txt) do (
    call npx eslint "%%i" --fix
)
del temp_files.txt
:skip_eslint

echo.
echo Code formatting completed for new/changed files!
pause