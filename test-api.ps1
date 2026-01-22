# Test Script for User, Driver, and Booking APIs

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TESTING USER ENDPOINTS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 1. USER REGISTER
Write-Host "`n[1] USER REGISTER" -ForegroundColor Yellow
$userBody = @{
    firstName = "John"
    lastName = "Doe"
    email = "john.user@test.com"
    password = "password123"
    phone = "9876543210"
} | ConvertTo-Json

try {
    $userRes = Invoke-WebRequest -Uri http://localhost:3000/auth/register-user `
      -Method POST `
      -ContentType "application/json" `
      -Body $userBody -ErrorAction Stop | Select-Object -ExpandProperty Content | ConvertFrom-Json
    
    Write-Host "✓ SUCCESS" -ForegroundColor Green
    Write-Host "  User ID: $($userRes._id)"
    Write-Host "  Email: $($userRes.email)"
    $global:userId = $userRes._id
} catch {
    Write-Host "✗ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. USER LOGIN
Write-Host "`n[2] USER LOGIN" -ForegroundColor Yellow
$loginBody = @{
    email = "john.user@test.com"
    password = "password123"
} | ConvertTo-Json

try {
    $loginRes = Invoke-WebRequest -Uri http://localhost:3000/auth/login-user `
      -Method POST `
      -ContentType "application/json" `
      -Body $loginBody -ErrorAction Stop | Select-Object -ExpandProperty Content | ConvertFrom-Json
    
    Write-Host "✓ SUCCESS" -ForegroundColor Green
    Write-Host "  JWT Token: $($loginRes.access_token.Substring(0, 40))..."
    $global:userToken = $loginRes.access_token
} catch {
    Write-Host "✗ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. USER UPDATE
Write-Host "`n[3] USER UPDATE PROFILE" -ForegroundColor Yellow
$updateBody = @{
    firstName = "Jonathan"
    lastName = "Doe-Updated"
    phone = "9876543211"
} | ConvertTo-Json

try {
    $updateRes = Invoke-WebRequest -Uri http://localhost:3000/users/update `
      -Method PATCH `
      -ContentType "application/json" `
      -Headers @{"Authorization" = "Bearer $($global:userToken)"} `
      -Body $updateBody -ErrorAction Stop | Select-Object -ExpandProperty Content | ConvertFrom-Json
    
    Write-Host "✓ SUCCESS" -ForegroundColor Green
    Write-Host "  Updated Name: $($updateRes.firstName) $($updateRes.lastName)"
    Write-Host "  Updated Phone: $($updateRes.phone)"
} catch {
    Write-Host "✗ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TESTING DRIVER ENDPOINTS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 4. DRIVER REGISTER
Write-Host "`n[4] DRIVER REGISTER" -ForegroundColor Yellow
$driverBody = @{
    fullName = "Mike Johnson"
    email = "mike.driver@test.com"
    password = "driver123"
    phone = "8765432109"
    licenseNumber = "DL123456789"
    termsAccepted = $true
} | ConvertTo-Json

try {
    $driverRes = Invoke-WebRequest -Uri http://localhost:3000/auth/register-driver `
      -Method POST `
      -ContentType "application/json" `
      -Body $driverBody -ErrorAction Stop | Select-Object -ExpandProperty Content | ConvertFrom-Json
    
    Write-Host "✓ SUCCESS" -ForegroundColor Green
    Write-Host "  Driver ID: $($driverRes._id)"
    Write-Host "  License: $($driverRes.licenseNumber)"
    $global:driverId = $driverRes._id
} catch {
    Write-Host "✗ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. DRIVER LOGIN
Write-Host "`n[5] DRIVER LOGIN" -ForegroundColor Yellow
$dLoginBody = @{
    email = "mike.driver@test.com"
    password = "driver123"
} | ConvertTo-Json

try {
    $dLoginRes = Invoke-WebRequest -Uri http://localhost:3000/auth/login-driver `
      -Method POST `
      -ContentType "application/json" `
      -Body $dLoginBody -ErrorAction Stop | Select-Object -ExpandProperty Content | ConvertFrom-Json
    
    Write-Host "✓ SUCCESS" -ForegroundColor Green
    Write-Host "  JWT Token: $($dLoginRes.access_token.Substring(0, 40))..."
    $global:driverToken = $dLoginRes.access_token
} catch {
    Write-Host "✗ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# 6. DRIVER UPDATE
Write-Host "`n[6] DRIVER UPDATE PROFILE" -ForegroundColor Yellow
$dUpdateBody = @{
    fullName = "Michael Johnson"
    phone = "8765432108"
} | ConvertTo-Json

try {
    $dUpdateRes = Invoke-WebRequest -Uri http://localhost:3000/drivers/update `
      -Method PATCH `
      -ContentType "application/json" `
      -Headers @{"Authorization" = "Bearer $($global:driverToken)"} `
      -Body $dUpdateBody -ErrorAction Stop | Select-Object -ExpandProperty Content | ConvertFrom-Json
    
    Write-Host "✓ SUCCESS" -ForegroundColor Green
    Write-Host "  Updated Name: $($dUpdateRes.fullName)"
    Write-Host "  Updated Phone: $($dUpdateRes.phone)"
} catch {
    Write-Host "✗ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TESTING BOOKING ENDPOINTS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Note: Create vehicle first
Write-Host "`n[7] CREATE VEHICLE (required for booking)" -ForegroundColor Yellow
$vehicleBody = @{
    make = "Toyota"
    model = "Camry"
    year = 2023
    seats = 5
    licensePlate = "ABC123"
    vehicleType = "Sedan"
    vehicleClass = "Comfort"
    baseFare = 50
    perKilometerRate = 15
    minimumFare = 100
    waitingCharge = 5
} | ConvertTo-Json

try {
    $vehicleRes = Invoke-WebRequest -Uri http://localhost:3000/drivers/vehicles `
      -Method POST `
      -ContentType "application/json" `
      -Headers @{"Authorization" = "Bearer $($global:driverToken)"} `
      -Body $vehicleBody -ErrorAction Stop | Select-Object -ExpandProperty Content | ConvertFrom-Json
    
    Write-Host "✓ SUCCESS" -ForegroundColor Green
    Write-Host "  Vehicle ID: $($vehicleRes._id)"
    Write-Host "  Model: $($vehicleRes.make) $($vehicleRes.model)"
    $global:vehicleId = $vehicleRes._id
} catch {
    Write-Host "✗ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# 8. CREATE BOOKING
Write-Host "`n[8] CREATE BOOKING" -ForegroundColor Yellow
$bookingBody = @{
    vehicleId = $global:vehicleId
    userId = $global:userId
    pickupLocation = @{
        address = "Downtown Station"
        latitude = 40.7128
        longitude = -74.0060
    }
    dropoffLocation = @{
        address = "Airport Terminal"
        latitude = 40.7761
        longitude = -73.8735
    }
    bookingTime = (Get-Date).ToUniversalTime().ToString("o")
    estimatedDistance = 15.5
    estimatedFare = 250
} | ConvertTo-Json

try {
    $bookingRes = Invoke-WebRequest -Uri http://localhost:3000/drivers/bookings `
      -Method POST `
      -ContentType "application/json" `
      -Headers @{"Authorization" = "Bearer $($global:driverToken)"} `
      -Body $bookingBody -ErrorAction Stop | Select-Object -ExpandProperty Content | ConvertFrom-Json
    
    Write-Host "✓ SUCCESS" -ForegroundColor Green
    Write-Host "  Booking ID: $($bookingRes._id)"
    Write-Host "  Status: $($bookingRes.status)"
    Write-Host "  Estimated Fare: $($bookingRes.estimatedFare)"
    $global:bookingId = $bookingRes._id
} catch {
    Write-Host "✗ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# 9. ACCEPT BOOKING
Write-Host "`n[9] ACCEPT BOOKING" -ForegroundColor Yellow
try {
    $acceptRes = Invoke-WebRequest -Uri "http://localhost:3000/drivers/bookings/$($global:bookingId)/accept" `
      -Method POST `
      -ContentType "application/json" `
      -Headers @{"Authorization" = "Bearer $($global:driverToken)"} `
      -Body "{}" -ErrorAction Stop | Select-Object -ExpandProperty Content | ConvertFrom-Json
    
    Write-Host "✓ SUCCESS" -ForegroundColor Green
    Write-Host "  Status Changed: $($acceptRes.status)"
} catch {
    Write-Host "✗ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# 10. START RIDE
Write-Host "`n[10] START RIDE" -ForegroundColor Yellow
try {
    $startRes = Invoke-WebRequest -Uri "http://localhost:3000/drivers/bookings/$($global:bookingId)/start" `
      -Method POST `
      -ContentType "application/json" `
      -Headers @{"Authorization" = "Bearer $($global:driverToken)"} `
      -Body "{}" -ErrorAction Stop | Select-Object -ExpandProperty Content | ConvertFrom-Json
    
    Write-Host "✓ SUCCESS" -ForegroundColor Green
    Write-Host "  Status: $($startRes.status)"
    Write-Host "  Start Time: $($startRes.startTime)"
} catch {
    Write-Host "✗ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# 11. COMPLETE RIDE
Write-Host "`n[11] COMPLETE RIDE" -ForegroundColor Yellow
$completeBody = @{
    actualDistance = 15.8
    actualFare = 260
} | ConvertTo-Json

try {
    $completeRes = Invoke-WebRequest -Uri "http://localhost:3000/drivers/bookings/$($global:bookingId)/complete" `
      -Method POST `
      -ContentType "application/json" `
      -Headers @{"Authorization" = "Bearer $($global:driverToken)"} `
      -Body $completeBody -ErrorAction Stop | Select-Object -ExpandProperty Content | ConvertFrom-Json
    
    Write-Host "✓ SUCCESS" -ForegroundColor Green
    Write-Host "  Status: $($completeRes.status)"
    Write-Host "  Actual Distance: $($completeRes.actualDistance) km"
    Write-Host "  Actual Fare: $($completeRes.actualFare)"
} catch {
    Write-Host "✗ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# 12. RATE USER
Write-Host "`n[12] RATE USER" -ForegroundColor Yellow
$rateBody = @{
    rating = 5
    review = "Great passenger, courteous and clean"
} | ConvertTo-Json

try {
    $rateRes = Invoke-WebRequest -Uri "http://localhost:3000/drivers/bookings/$($global:bookingId)/rate-user" `
      -Method POST `
      -ContentType "application/json" `
      -Headers @{"Authorization" = "Bearer $($global:driverToken)"} `
      -Body $rateBody -ErrorAction Stop | Select-Object -ExpandProperty Content | ConvertFrom-Json
    
    Write-Host "✓ SUCCESS" -ForegroundColor Green
    Write-Host "  User Rating: $($rateRes.userRating) stars"
    Write-Host "  Review: $($rateRes.userReview)"
} catch {
    Write-Host "✗ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "ALL TESTS COMPLETED" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
