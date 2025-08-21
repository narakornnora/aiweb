#Requires -Version 5.1
$ErrorActionPreference = 'Stop'

# ทำงานจากโฟลเดอร์โปรเจ็กต์ที่มีไฟล์ public/, server.js, package.json ฯลฯ
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $Root
Write-Host "Root:" (Get-Location)

# ไฟล์ที่จะรวมใส่ ZIP (เพิ่ม/ลดได้)
$Include = @(
  "public\index.html",
  "public\placeholder.svg",
  "server.js",
  "package.json",
  ".env.example",
  "README.md",
  "Scripts\zip.ps1"
)

# สร้างโฟลเดอร์ชั่วคราว แล้วคัดลอกไฟล์ที่มีอยู่จริง
$Temp = Join-Path $env:TEMP "aiwebfaz-zip"
if (Test-Path $Temp) { Remove-Item $Temp -Recurse -Force }
New-Item -ItemType Directory -Path $Temp | Out-Null

$ToCopy = @()
foreach ($p in $Include) {
  if (Test-Path $p) { $ToCopy += $p } else { Write-Warning "skip: $p (not found)" }
}
if (-not $ToCopy) { throw "No files to zip. Check project files." }

Copy-Item $ToCopy -Destination $Temp -Recurse -Force

# จุดหมาย ZIP บน Desktop
$ZipOut = Join-Path $env:USERPROFILE "Desktop\aiwebfaz-starter.zip"
if (Test-Path $ZipOut) { Remove-Item $ZipOut -Force }

# ใช้ Compress-Archive (Windows 10/11)
Compress-Archive -Path (Join-Path $Temp '*') -DestinationPath $ZipOut -Force

# ล้างไฟล์ชั่วคราว
Remove-Item $Temp -Recurse -Force

Write-Host "✅ ZIP created:" $ZipOut
