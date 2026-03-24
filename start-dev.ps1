# ============================================
#  Dev Launcher - Expo App + FastAPI Backend
# ============================================

Write-Host ""
Write-Host "  Starting Development Environment..." -ForegroundColor Cyan
Write-Host ""

# --- Terminal 1: Expo App ---
Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
  `$host.UI.RawUI.WindowTitle = 'Expo App'
  Write-Host '[ Expo App ]' -ForegroundColor Yellow
  cd App
  npx expo start --clear
"@

# Small delay so windows don't overlap weirdly
Start-Sleep -Milliseconds 500

# --- Terminal 2: FastAPI Backend ---
Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
  `$host.UI.RawUI.WindowTitle = 'FastAPI Backend'
  Write-Host '[ FastAPI Backend ]' -ForegroundColor Green
  cd backend
  .\venv\Scripts\activate
  uvicorn api.server:app --host 0.0.0.0 --port 8000
"@

Write-Host "  Both terminals launched!" -ForegroundColor Green
Write-Host "  Expo: App/  |  FastAPI: http://192.168.1.4:8000" -ForegroundColor Gray
Write-Host ""