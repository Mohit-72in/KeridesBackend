# Test Backend with Debugger
$baseUrl = "http://localhost:3000"

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Testing User Register" -ForegroundColor Yellow
Write-Host "======================================" -ForegroundColor Cyan
$userRegisterBody = @{
    fullName = "John Doe"
    email = "john@example.com"
    phoneNumber = "+1234567890"
    password = "Password123"
} | ConvertTo-Json

try {
    $userRegisterResponse = Invoke-WebRequest -Uri "$baseUrl/auth/register-user" -Method Post -ContentType "application/json" -Body $userRegisterBody
    Write-Host "Response Status: " $userRegisterResponse.StatusCode
    Write-Host $userRegisterResponse.Content
    $userToken = ($userRegisterResponse.Content | ConvertFrom-Json).access_token
    Write-Host "User Token: $userToken"
} catch {
    Write-Host "Error: " $_.Exception.Message
}

Write-Host "`n======================================" -ForegroundColor Cyan
Write-Host "Testing User Login" -ForegroundColor Yellow
Write-Host "======================================" -ForegroundColor Cyan
$userLoginBody = @{
    email = "john@example.com"
    password = "Password123"
} | ConvertTo-Json

try {
    $userLoginResponse = Invoke-WebRequest -Uri "$baseUrl/auth/login-user" -Method Post -ContentType "application/json" -Body $userLoginBody
    Write-Host "Response Status: " $userLoginResponse.StatusCode
    Write-Host $userLoginResponse.Content
    $userToken = ($userLoginResponse.Content | ConvertFrom-Json).access_token
    Write-Host "User Token: $userToken"
} catch {
    Write-Host "Error: " $_.Exception.Message
}

Write-Host "`n======================================" -ForegroundColor Cyan
Write-Host "Testing Driver Register" -ForegroundColor Yellow
Write-Host "======================================" -ForegroundColor Cyan
$driverRegisterBody = @{
    fullName = "Jane Smith"
    email = "jane@example.com"
    phoneNumber = "+1987654321"
    driverLicenseNumber = "DL123456789"
    password = "Password123"
} | ConvertTo-Json

try {
    $driverRegisterResponse = Invoke-WebRequest -Uri "$baseUrl/auth/register-driver" -Method Post -ContentType "application/json" -Body $driverRegisterBody
    Write-Host "Response Status: " $driverRegisterResponse.StatusCode
    Write-Host $driverRegisterResponse.Content
    $driverToken = ($driverRegisterResponse.Content | ConvertFrom-Json).access_token
    Write-Host "Driver Token: $driverToken"
} catch {
    Write-Host "Error: " $_.Exception.Message
}

Write-Host "`n======================================" -ForegroundColor Cyan
Write-Host "Testing Driver Login" -ForegroundColor Yellow
Write-Host "======================================" -ForegroundColor Cyan
$driverLoginBody = @{
    email = "driver@test.com"
    password jane@example.com"
    password = "Password123

try {
    $driverLoginResponse = Invoke-WebRequest -Uri "$baseUrl/auth/login-driver" -Method Post -ContentType "application/json" -Body $driverLoginBody
    Write-Host "Response Status: " $driverLoginResponse.StatusCode
    Write-Host $driverLoginResponse.Content
    $driverToken = ($driverLoginResponse.Content | ConvertFrom-Json).access_token
    Write-Host "Driver Token: $driverToken"
} catch {
    Write-Host "Error: " $_.Exception.Message
}

Write-Host "`nAll tests completed - check breakpoints in VS Code debugger!"
