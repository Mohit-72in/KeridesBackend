import mongoose from 'mongoose';
import { BookingSchema } from '../schemas/booking.schema';

const Booking = mongoose.model('Booking', BookingSchema as any);

async function run() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI not set. Set it and re-run this script.');
    process.exit(1);
  }

  await mongoose.connect(uri, { autoIndex: false });

  console.log('Removing bookingId field from all bookings...');
  const result = await Booking.updateMany({}, { $unset: { bookingId: '' } });
  console.log('Modified count:', (result as any).modifiedCount || (result as any).nModified || 0);

  try {
    await Booking.collection.dropIndex('bookingId_1');
    console.log('Dropped bookingId index (if it existed)');
  } catch (e: any) {
    console.log('No bookingId index to drop or error:', e?.message || e);
  }

  await mongoose.disconnect();
  console.log('Done');
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});