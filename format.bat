@echo off
echo Formatting code for best practices...

echo.
echo Installing Prettier if not already installed...
call npm install --save-dev prettier

echo.
echo Formatting TypeScript and JavaScript files with Prettier...
call npx prettier --write "**/*.{js,jsx,ts,tsx,json,css,md}"

echo.
echo Running ESLint to fix auto-fixable issues...
call npm run lint -- --fix

echo.
echo Code formatting completed!
pause