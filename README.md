# 🚗 Gokeral - NestJS Ride-Sharing Backend

A robust backend API built with **NestJS + MongoDB** for a ride-sharing platform with comprehensive user and driver management.

### ✨ Core Features

- 🔐 **JWT Authentication** - Secure token-based authentication
- 👤 **User Management** - Registration, login, and profile management
- 🚗 **Driver Management** - Full driver registration with license verification
- 🚙 **Vehicle Management** - Support for S3-based documents and images
- 📅 **Advanced Booking System** - Create, track, and rate rides with OTP verification
- 🔢 **OTP Verification** - Secure ride start with 4-digit OTP shared between user and driver
- 🛡️ **Role-Based Access Control** - USER and DRIVER roles with route guards
- 📝 **Global Exception Handling** - Unified error responses
- 📊 **HTTP Logging Middleware** - Request tracking and monitoring
- 🎯 **Scalable Architecture** - Modular, production-ready structure
- 📍 **Geolocation Tracking** - Real-time driver location updates with Haversine distance calculation
- 🔍 **Smart Driver Matching** - Find nearest 5 drivers by vehicle type and location proximity
- 🗺️ **Privacy-First Drop Location** - Drop location hidden until OTP verified

---

## 📁 Folder Structure

```
src/
│
├── auth/
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   ├── jwt.strategy.ts
│   ├── jwt-auth.guard.ts
│   └── dto/
│       ├── login.dto.ts
│       └── register.dto.ts
│
├── user/
│   ├── user.controller.ts
│   ├── user.service.ts
│   ├── user.module.ts
│   └── dto/
│       ├── create-user.dto.ts
│       ├── login-user.dto.ts
│       └── update-user.dto.ts
│
├── driver/
│   ├── driver.controller.ts
│   ├── driver.service.ts
│   ├── driver.module.ts
│   ├── booking/
│   │   ├── booking.controller.ts
│   │   ├── booking.service.ts
│   │   ├── booking.module.ts
│   │   └── dto/
│   │       ├── create-booking.dto.ts
│   │       ├── rate-booking.dto.ts
│   │       └── update-booking.dto.ts
│   ├── vehicle/
│   │   ├── vehicle.controller.ts
│   │   ├── vehicle.service.ts
│   │   ├── vehicle.module.ts
│   │   └── dto/
│   │       ├── create-vehicle.dto.ts
│   │       └── update-vehicle.dto.ts
│   └── dto/
│       ├── create-driver.dto.ts
│       ├── create-vehicle.dto.ts
│       ├── login-driver.dto.ts
│       ├── update-driver.dto.ts
│       └── update-vehicle.dto.ts
│
├── schemas/
│   ├── admin.schema.ts
│   ├── booking.schema.ts
│   ├── driver.schema.ts
│   ├── user.schema.ts
│   └── vehicle.schema.ts
│
└── common/
    ├── decorators/
    │   └── role.decorator.ts
    ├── enums/
    │   └── role.enum.ts
    ├── filters/
    │   ├── global-exception.filter.ts
    │   └── validation-exception.filter.ts
    ├── guards/
    │   ├── jwt-auth.guard.ts
    │   └── roles.guard.ts
    ├── middleware/
    │   └── http-logging.middleware.ts
    ├── services/
    │   └── logging.service.ts
    ├── transformers/
    │   └── date.transformer.ts
    └── utils/
        └── date.util.ts
```

---

## 🧰 Tech Stack

| Technology | Purpose |
|-----------|---------|
| NestJS | Node Framework |
| MongoDB + Mongoose | Database |
| Passport-JWT | Authentication Strategy |
| Bcrypt | Password Hashing |
| Class Validator | DTO Validation |

---

## 🚀 Installation & Setup

### 1️⃣ Clone Repo

```sh
git clone https://github.com/sourabhoncode/NestJS.git
cd NestJS
````

### 2️⃣ Install Dependencies

```sh
npm install
```

### 3️⃣ Configure MongoDB

Make sure for MONGODB:

```
create your own .ENV file
```

### 4️⃣ Start Server

```sh
npm run start:dev
```

API running 👉 [http://localhost:3000/](http://localhost:3000/)

---

## 🔐 Authentication Endpoints

### 🟩 Register User

```
POST /auth/register-user
```

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "+1234567890",
  "password": "Password123"
}
```

**Fields:**
- `fullName` (string, required) - User's full name
- `email` (string, required, unique) - Email address
- `phoneNumber` (string, required) - Contact number
- `password` (string, required, min 6 chars) - Login password

---

### 🟦 Register Driver

```
POST /auth/register-driver
```

**Request Body:**
```json
{
  "fullName": "Jane Smith",
  "email": "jane@example.com",
  "phoneNumber": "+1987654321",
  "driverLicenseNumber": "DL123456789",
  "password": "Password123"
}
```

**Fields:**
- `fullName` (string, required) - Driver's full name
- `email` (string, required, unique) - Email address
- `phoneNumber` (string, required) - Contact number
- `driverLicenseNumber` (string, required, unique) - License number
- `password` (string, required, min 6 chars) - Login password

---

### 🟨 User Login

```
POST /auth/login-user
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

---

### 🟧 Driver Login

```
POST /auth/login-driver
```

**Request Body:**
```json
{
  "email": "jane@example.com",
  "password": "Password123"
}
```

---

## 🧑 USER Routes (Token Required)

### Get Profile

```
GET /users/profile
Authorization: Bearer <token>
```

### Update Profile

```
PATCH /users/update
Authorization: Bearer <JWT_TOKEN>
```

**Request Body:**
```json
{
  "fullName": "Updated Name",
  "phoneNumber": "+1234567890",
  "address": "New Address"
}
```

---

## 🚘 DRIVER Routes (Token Required)

### Update Driver Profile

```
PATCH /drivers/update
Authorization: Bearer <JWT_TOKEN>
```

**Request Body:**
```json
{
  "fullName": "Updated Driver Name",
  "phoneNumber": "+1987654321"
}
```

### Reset Drivers Collection (Dev Only)

```
DELETE /drivers/reset
```

**Purpose:** Clear all drivers from database and reset MongoDB indexes. Use this during development to remove duplicate key conflicts.

**Note:** This endpoint is for development/testing only. Remove or protect it in production.

### Update Driver Location (Geolocation)

```
PATCH /drivers/location
Authorization: Bearer <JWT_TOKEN>
```

**Request Body:**
```json
{
  "latitude": 9.9312,
  "longitude": 76.2673,
  "isOnline": true
}
```

**Fields:**
- `latitude` (number, required) - Driver's current latitude
- `longitude` (number, required) - Driver's current longitude
- `isOnline` (boolean, optional) - Online status flag

**Response:**
```json
{
  "message": "Location updated successfully",
  "driver": {
    "_id": "...",
    "fullName": "Jane Smith",
    "latitude": 9.9312,
    "longitude": 76.2673,
    "isOnline": true,
    "lastLocationUpdate": "2026-01-07T10:30:45.123Z"
  }
}
```

---

## � VEHICLE Routes (Token Required - DRIVER Only)

### Create Vehicle

```
POST /drivers/vehicles
Authorization: Bearer <JWT_TOKEN>
```

**Request Body:**
```json
{
  "companyName": "Tesla Motors",
  "model": "Model 3",
  "year": 2023,
  "seats": 5,
  "licensePlateNumber": "ABC123XYZ",
  "vehicleType": "Sedan",
  "vehicleClass": "Economy",
  "vehicleImage": "https://example-bucket.s3.amazonaws.com/vehicles/tesla-model-3.jpg",
  "documents": {
    "drivingLicense": "https://example-bucket.s3.amazonaws.com/documents/dl.pdf",
    "insuranceProof": "https://example-bucket.s3.amazonaws.com/documents/insurance.pdf",
    "addressProof": "https://example-bucket.s3.amazonaws.com/documents/address.pdf",
    "policeCertificate": "https://example-bucket.s3.amazonaws.com/documents/police-cert.pdf"
  },
  "fareStructure": {
    "minimumFare": 5.00,
    "perKilometerRate": 1.50,
    "waitingChargePerMinute": 0.30
  }
}
```

### Get All Vehicles

```
GET /drivers/vehicles
Authorization: Bearer <JWT_TOKEN>
```

### Get Vehicle Details

```
GET /drivers/vehicles/:vehicleId
Authorization: Bearer <JWT_TOKEN>
```

### Update Vehicle

```
PATCH /drivers/vehicles/:vehicleId
Authorization: Bearer <JWT_TOKEN>
```

### Delete Vehicle

```
DELETE /drivers/vehicles/:vehicleId
Authorization: Bearer <JWT_TOKEN>
```

---

## 📅 BOOKING Routes (Token Required)

### Complete Booking Flow with OTP Verification

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        BOOKING FLOW WITH OTP                                │
├─────────────────────────────────────────────────────────────────────────────┤
│  1. USER creates booking → 4-digit OTP auto-generated                       │
│  2. USER gets current booking → Sees OTP to share with driver               │
│  3. DRIVER sees pending bookings → Accepts one (only pickup visible)        │
│  4. DRIVER travels to pickup → Marks "arrived"                              │
│  5. USER shares OTP verbally with driver → Driver enters OTP                │
│  6. OTP verified → Drop location revealed, ride starts                      │
│  7. DRIVER completes ride → Booking marked COMPLETED                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Privacy Note:** Drop location is hidden from the driver until OTP is verified. This ensures the driver picks up the correct passenger.

### Create Booking (User Only)

```
POST /bookings/create
Authorization: Bearer <JWT_TOKEN>
```

**Request Body:**
```json
{
  "userId": "user_id",
  "driverId": "driver_id",
  "vehicleId": "vehicle_id",
  "pickupLocation": "Downtown",
  "dropoffLocation": "Airport",
  "fare": 250.00
}
```

**Response (includes auto-generated OTP):**
```json
{
  "_id": "booking_id",
  "user": "user_id",
  "driver": "driver_id",
  "vehicle": "vehicle_id",
  "pickupLocation": "Downtown",
  "dropoffLocation": "Airport",
  "fare": 250.00,
  "status": "PENDING",
  "rideOtp": "4521",
  "otpVerified": false,
  "createdAt": "2026-01-08T..."
}
```

### Get My Bookings (User Only)

```
GET /bookings/my-bookings
Authorization: Bearer <JWT_TOKEN>
```

### Get User's Current Active Booking (User Only)

```
GET /bookings/my-bookings/current
Authorization: Bearer <JWT_TOKEN>
```

**Response (includes OTP for sharing with driver):**
```json
{
  "_id": "booking_id",
  "pickupLocation": "Downtown",
  "dropoffLocation": "Airport",
  "status": "ACCEPTED",
  "rideOtp": "4521",
  "otpVerified": false,
  "driver": { "fullName": "John Driver", "phoneNumber": "..." },
  "vehicle": { "companyName": "Tesla", "model": "Model 3" }
}
```

### Get Pending Bookings (Driver Only)

```
GET /bookings
Authorization: Bearer <JWT_TOKEN>
```

**Note:** Returns pending bookings. Drop location is hidden for non-accepted bookings.

### Get Driver's Current Active Booking (Driver Only)

```
GET /bookings/driver/current
Authorization: Bearer <JWT_TOKEN>
```

**Response (drop location hidden until OTP verified):**
```json
{
  "_id": "booking_id",
  "pickupLocation": "Downtown",
  "dropoffLocation": null,
  "status": "ACCEPTED",
  "otpVerified": false,
  "user": { "fullName": "Jane User", "phoneNumber": "..." }
}
```

### Get Specific Booking for Driver (Driver Only)

```
GET /bookings/driver/booking/:bookingId
Authorization: Bearer <JWT_TOKEN>
```

**Note:** Returns booking details with drop location visible only if OTP is verified.

### Get Booking Details

```
GET /bookings/:bookingId
Authorization: Bearer <JWT_TOKEN>
```

### Accept Booking (Driver Only)

```
PATCH /bookings/:bookingId/accept
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "_id": "booking_id",
  "status": "ACCEPTED",
  "acceptedTime": "2026-01-08T10:30:00.000Z",
  "pickupLocation": "Downtown",
  "dropoffLocation": null
}
```

**Note:** Drop location remains hidden. Driver only sees pickup location.

### Mark Driver Arrived (Driver Only)

```
PATCH /bookings/:bookingId/arrived
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "message": "Driver arrival marked successfully",
  "booking": {
    "_id": "booking_id",
    "status": "DRIVER_ARRIVED",
    "arrivedTime": "2026-01-08T10:45:00.000Z"
  }
}
```

### Verify OTP and Start Ride (Driver Only)

```
POST /bookings/:bookingId/verify-otp
Authorization: Bearer <JWT_TOKEN>
```

**Request Body:**
```json
{
  "otp": "4521"
}
```

**Success Response (drop location revealed):**
```json
{
  "message": "OTP verified successfully. Ride started!",
  "booking": {
    "_id": "booking_id",
    "status": "IN_PROGRESS",
    "otpVerified": true,
    "pickupLocation": "Downtown",
    "dropoffLocation": "Airport",
    "rideStartTime": "2026-01-08T10:50:00.000Z"
  },
  "dropLocation": {
    "address": "Airport",
    "coordinates": { "lat": 9.9500, "lng": 76.2800 }
  }
}
```

**Error Response (invalid OTP):**
```json
{
  "statusCode": 400,
  "message": "Invalid OTP. Please try again.",
  "error": "Bad Request"
}
```

### Update Booking Status (Driver Only)

```
PATCH /bookings/:bookingId/status
Authorization: Bearer <JWT_TOKEN>
```

**Request Body:**
```json
{
  "status": "COMPLETED"
}
```

**Valid Status Values:**
- `PENDING` - Waiting for driver
- `ACCEPTED` - Driver accepted
- `DRIVER_ARRIVED` - Driver at pickup
- `IN_PROGRESS` - Ride ongoing
- `COMPLETED` - Ride finished
- `CANCELLED` - Booking cancelled

### Cancel Booking

```
PATCH /bookings/:bookingId/cancel
Authorization: Bearer <JWT_TOKEN>
```

### Rate Booking

```
POST /bookings/:bookingId/rate
Authorization: Bearer <JWT_TOKEN>
```

**Request Body:**
```json
{
  "rating": 5,
  "comment": "Great driver and smooth ride!"
}
```

### Accept Booking (Driver Only)

```
POST /bookings/:bookingId/accept
Authorization: Bearer <JWT_TOKEN>
```

### Start Booking (Driver Only)

```
PATCH /bookings/:bookingId/start
Authorization: Bearer <JWT_TOKEN>
```

### Get Nearby Drivers (Radius-Based)

```
GET /bookings/nearby-drivers?latitude=9.93&longitude=76.26&radius=2
Authorization: Bearer <JWT_TOKEN>
```

**Query Parameters:**
- `latitude` (number, required) - User's current latitude
- `longitude` (number, required) - User's current longitude
- `radius` (number, optional) - Search radius in km (default: 2, max: 50)

**Response:**
```json
[
  {
    "_id": "...",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "+1234567890",
    "drivingExperience": {
      "averageRating": 4.8,
      "totalTripsCompleted": 250
    },
    "latitude": 9.931,
    "longitude": 76.262,
    "isOnline": true,
    "distance": 0.45
  }
]
```

**Features:**
- Returns all online drivers within specified radius
- Calculates distance using Haversine formula
- Sorted by proximity (nearest first)
- Returns drivers with complete profile info

---

### Find Nearest 5 Drivers (Smart Matching)

```
POST /bookings/find-nearest-drivers
Authorization: Bearer <JWT_TOKEN>
```

**Request Body:**
```json
{
  "pickupLatitude": 9.9312,
  "pickupLongitude": 76.2673,
  "vehicleType": "CAR"
}
```

**Fields:**
- `pickupLatitude` (number, required) - User's pickup latitude
- `pickupLongitude` (number, required) - User's pickup longitude
- `vehicleType` (string, required) - Vehicle type (CAR, AUTO, BIKE, etc.)

**Response:**
```json
{
  "drivers": [
    {
      "driverId": "...",
      "driverName": "John Doe",
      "vehicleType": "CAR",
      "vehicleDetails": {
        "make": "Toyota",
        "vehicleModel": "Camry",
        "year": 2023,
        "licensePlate": "KL-01-AB-1234",
        "seatsNo": 4,
        "vehicleImages": ["https://..."]
      },
      "distanceFromUser": 2.45,
      "rating": 4.8,
      "totalTrips": 250,
      "phoneNumber": "+1234567890"
    }
  ],
  "totalFound": 3,
  "requestedVehicleType": "CAR"
}
```

**Features:**
- Returns top 5 nearest drivers
- Filters by vehicle type
- Shows driver and vehicle details
- Includes distance and driver rating
- Only returns online drivers

---

## 🛡️ Role-Based Access Control (RBAC)

| Route                            | USER      | DRIVER    |
| :------------------------------- | :-------: | :-------: |
| `/auth/register-user`            | ✔ Public  | ✔ Public  |
| `/auth/register-driver`          | ✔ Public  | ✔ Public  |
| `/auth/login-user`               | ✔ Public  | ✔ Public  |
| `/auth/login-driver`             | ✔ Public  | ✔ Public  |
| `/users/profile`                 | ✔ Allowed | ❌ Blocked |
| `/users/update`                  | ✔ Allowed | ❌ Blocked |
| `/drivers/update`                | ❌ Blocked | ✔ Allowed |
| `/drivers/location`              | ❌ Blocked | ✔ Allowed |
| `/drivers/vehicles/*`            | ❌ Blocked | ✔ Allowed |
| `/bookings/create`               | ✔ Allowed | ❌ Blocked |
| `/bookings/my-bookings`          | ✔ Allowed | ❌ Blocked |
| `/bookings/my-bookings/current`  | ✔ Allowed | ❌ Blocked |
| `/bookings` (GET pending)        | ❌ Blocked | ✔ Allowed |
| `/bookings/driver/current`       | ❌ Blocked | ✔ Allowed |
| `/bookings/driver/booking/:id`   | ❌ Blocked | ✔ Allowed |
| `/bookings/:id/accept`           | ❌ Blocked | ✔ Allowed |
| `/bookings/:id/arrived`          | ❌ Blocked | ✔ Allowed |
| `/bookings/:id/verify-otp`       | ❌ Blocked | ✔ Allowed |
| `/bookings/:id/status`           | ❌ Blocked | ✔ Allowed |
| `/bookings/:id/rating`           | ✔ Allowed | ❌ Blocked |
| `/bookings/nearest-drivers`      | ✔ Allowed | ❌ Blocked |
| `/bookings/nearby-drivers`       | ✔ Allowed | ❌ Blocked |

**RBAC Implementation:**
- `@RoleRequired(Role.USER)` - User only routes
- `@RoleRequired(Role.DRIVER)` - Driver only routes
- `JwtAuthGuard` - Token validation
- `RolesGuard` - Role enforcement

---

## 🗄️ Database Schemas

### User Schema
- `fullName` - User's full name (string, required)
- `email` - Unique email address (string, required, unique)
- `phoneNumber` - Contact number (string, required)
- `password` - Hashed password using bcrypt (string, required)
- `address` - Physical address (string, required)
- `location` - GeoJSON point {type: "Point", coordinates: [longitude, latitude]}
- `agreement` - Terms acceptance flag (boolean, required)

### Driver Schema
- `fullName` - Driver's full name (string, required)
- `email` - Unique email address (string, required, unique)
- `phoneNumber` - Contact number (string, required)
- `driverLicenseNumber` - Unique license number (string, required, unique)
- `password` - Hashed password (string, required)
- `address` - Physical address (string, required)
- `profileImage` - Profile image S3 URL (string, optional)
- `latitude` - Current latitude for geolocation (number, optional)
- `longitude` - Current longitude for geolocation (number, optional)
- `isOnline` - Driver online status (boolean, default: false)
- `lastLocationUpdate` - Timestamp of last location update (Date, optional)
- `personalInfo` - Additional driver info including emergency contacts
- `drivingExperience` - Experience details (years, trips, rating)
- `role` - Always set to "DRIVER"

### Vehicle Schema
- `companyName` - Manufacturer/company (string, required)
- `model` - Vehicle model (string, required)
- `year` - Manufacturing year (number, required)
- `seats` - Seating capacity (number, required, min 1)
- `licensePlateNumber` - Unique plate number (string, required)
- `vehicleType` - Type: Sedan, SUV, Auto, etc. (string, required)
- `vehicleClass` - Class: Economy, Premium, Luxury (string, required)
- `vehicleImage` - Vehicle image S3 URL (string, optional)
- `documents` - S3 URLs for DL, insurance, address proof, police certificate
- `fareStructure` - Pricing: minimumFare, perKilometerRate, waitingChargePerMinute
- `driverId` - Reference to driver

### Booking Schema
- `userId` - Reference to User (ObjectId)
- `driverId` - Reference to Driver (ObjectId)
- `vehicleId` - Reference to Vehicle (ObjectId)
- `pickupLocation` - Pickup address (string, required)
- `dropoffLocation` - Dropoff address (string, required)
- `fare` - Ride fare amount (number, required)
- `status` - PENDING | ACCEPTED | DRIVER_ARRIVED | IN_PROGRESS | COMPLETED | CANCELLED
- `rideOtp` - 4-digit OTP for ride verification (string, auto-generated)
- `otpVerified` - Whether OTP was verified (boolean, default: false)
- `acceptedTime` - When driver accepted (Date, optional)
- `arrivedTime` - When driver arrived at pickup (Date, optional)
- `rideStartTime` - When ride started after OTP (Date, optional)
- `rideEndTime` - When ride completed (Date, optional)
- `rating` - Rating 1-5 (number, optional)
- `comment` - Feedback comment (string, optional)

---

## 🧩 Future Enhancements

- 🔁 Refresh token implementation
- 📄 Swagger/OpenAPI documentation
- 🔏 Password reset functionality
- 📱 Real-time notifications
- 💳 Payment gateway integration
- 🗺️ Advanced GPS tracking with route optimization
- ⭐ Advanced rating system
- 📞 SMS/Email notifications
- 🌐 MongoDB geospatial indexes for faster proximity queries
- 🔄 WebSocket real-time driver location streaming

---

## 📍 Geolocation Features (New - Jan 7, 2026)

### How It Works

1. **Driver Location Updates**
   - Driver calls `PATCH /drivers/location` to update position
   - Includes latitude, longitude, and online status
   - Updates stored in Driver schema

2. **Nearby Drivers Discovery**
   - User calls `GET /bookings/nearby-drivers` with their location
   - System finds all online drivers within specified radius
   - Uses Haversine formula for accurate distance calculation
   - Returns drivers sorted by distance (nearest first)

3. **Smart Driver Matching**
   - User calls `POST /bookings/find-nearest-drivers` with vehicle type
   - System finds drivers with matching vehicle type
   - Returns top 5 nearest drivers with complete details
   - Includes vehicle info and distance

### Utilities

**Geolocation Utility** (`src/common/utils/geolocation.util.ts`)
```typescript
calculateDistance(lat1, lon1, lat2, lon2): number
```
- Uses Haversine formula for accurate distance calculation
- Returns distance in kilometers
- Used by both nearby drivers endpoints

---

## 📄 License

MIT License - 2026

---

---

## 🚗 Driver-Specific Booking Flow

### Overview
Each driver should only see and receive ride requests assigned to them. The system uses:
- **Backend Authorization** - API enforces driver ownership of bookings
- **Real-Time Socket.io Events** - Targeted notifications to specific drivers
- **Driver Socket Rooms** - Each driver joins a private room on connection

### Backend Implementation

#### 1. Booking Endpoint - Driver-Specific Filtering
```typescript
// GET /bookings/driver/my-bookings
// Returns only bookings for the authenticated driver
@Get('driver/my-bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.DRIVER)
async getMyBookings(@Req() req: any) {
  return this.bookingService.getBookingsByDriver(req.user.id);
}
```

**Service Implementation:**
```typescript
async getBookingsByDriver(driverId: string) {
  return await this.bookingModel.find({ driverId }).sort({ createdAt: -1 });
}
```

#### 2. Authorization Guard - Prevent Cross-Driver Access
```typescript
// Verify driver can only access their own bookings
async getBooking(id: string, driverId: string) {
  const booking = await this.bookingModel.findById(id);
  if (booking.driverId.toString() !== driverId) {
    throw new ForbiddenException('Access denied');
  }
  return booking;
}
```

#### 3. Socket.io Targeted Emission
```typescript
// When creating a booking, emit to the assigned driver only
io.to(`driver:${driverId}`).emit('ride-request', {
  bookingId: booking._id,
  pickupLocation: booking.pickupLocation,
  phoneNumber: booking.phoneNumber,
  fare: booking.fare,
  distance: booking.distance,
  acceptedTime: booking.acceptedTime
});
```

#### 4. Socket Connection - Driver Room Setup
```typescript
// On driver socket connection, join their private room
@SubscribeMessage('connect')
handleConnect(@ConnectedSocket() socket: Socket, @MessageBody() data: any) {
  const driverId = data.driverId; // from JWT or auth token
  socket.join(`driver:${driverId}`);
  console.log(`Driver ${driverId} connected to room driver:${driverId}`);
}
```

### Frontend Implementation

#### 1. Socket Listener - Listen for Ride Requests
```typescript
useEffect(() => {
  socket.on('ride-request', (data) => {
    console.log('New ride request received:', data);
    setRide(data);
    setModalOpen(true);
  });
  return () => socket.off('ride-request');
}, []);
```

#### 2. Accept/Reject Handler
```typescript
const handleAccept = async () => {
  await api.post(`/bookings/${ride.bookingId}/accept`);
  setModalOpen(false);
};

const handleReject = async () => {
  await api.post(`/bookings/${ride.bookingId}/reject`);
  setModalOpen(false);
};
```

### Testing
1. Create a booking for a specific driver via API or admin panel.
2. Verify the driver socket receives `ride-request` event with correct data.
3. Test that other drivers' sockets do NOT receive the event (check browser dev console).
4. Test Accept/Reject endpoints return 403 if accessed by wrong driver.

---

## 👨‍💻 Developed by Corestone Innovations

For support and inquiries, contact the development team.

---

## 📝 Changelog

### January 8, 2026 (v2.1.0) - OTP Booking Flow
- 🔢 **OTP Verification System** - 4-digit OTP auto-generated on booking creation
- 🎯 **Privacy-First Drop Location** - Drop location hidden from driver until OTP verified
- 📍 **Driver Arrival Tracking** - New endpoint to mark driver arrival at pickup
- ✅ **Secure Ride Start** - OTP verification required to start ride and reveal destination
- 📊 **Enhanced Booking Response** - Detailed response with timestamps and drop location after verification

**New Endpoints:**
- `GET /bookings/my-bookings/current` - User's current active booking with OTP
- `GET /bookings/driver/current` - Driver's current active booking
- `GET /bookings/driver/booking/:id` - Get specific booking for driver
- `PATCH /bookings/:id/arrived` - Mark driver arrived at pickup
- `POST /bookings/:id/verify-otp` - Verify OTP and start ride

**Schema Updates:**
- Added `rideOtp` - 4-digit verification code
- Added `otpVerified` - OTP verification status
- Added `acceptedTime` - Booking acceptance timestamp
- Added `arrivedTime` - Driver arrival timestamp
- Added `DRIVER_ARRIVED` status

### January 7, 2026 (v2.0.0) - Geolocation Update
- ✨ Added geolocation tracking system
- ✨ Added smart driver matching (top 5 nearest drivers)
- ✨ Added nearby drivers discovery within radius
- 📍 Haversine distance calculation utility

### December 2025 (v1.0.0) - Initial Release
- 🚀 Initial release
- 🔐 JWT authentication system
- 👤 User & Driver management
- 🚗 Vehicle management with S3 documents
- 📅 Booking system with ratings

*Last Updated: January 8, 2026*
#   K e r i d e s B a c k e n d  
 #   K e r i d e s B a c k e n d  
 