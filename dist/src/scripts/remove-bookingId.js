"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const booking_schema_1 = require("../schemas/booking.schema");
const Booking = mongoose_1.default.model('Booking', booking_schema_1.BookingSchema);
async function run() {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        console.error('MONGO_URI not set. Set it and re-run this script.');
        process.exit(1);
    }
    await mongoose_1.default.connect(uri, { autoIndex: false });
    console.log('Removing bookingId field from all bookings...');
    const result = await Booking.updateMany({}, { $unset: { bookingId: '' } });
    console.log('Modified count:', result.modifiedCount || result.nModified || 0);
    try {
        await Booking.collection.dropIndex('bookingId_1');
        console.log('Dropped bookingId index (if it existed)');
    }
    catch (e) {
        console.log('No bookingId index to drop or error:', e?.message || e);
    }
    await mongoose_1.default.disconnect();
    console.log('Done');
}
run().catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
});
//# sourceMappingURL=remove-bookingId.js.map