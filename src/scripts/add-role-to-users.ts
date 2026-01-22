/**
 * Migration script: Add role field to existing users and drivers
 * Run this once to update all existing documents with the role field
 */

import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'dbnew';

async function migrateRoles() {
    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');

        const db = client.db(DB_NAME);

        // Update users collection - add role: 'USER' if not exists
        const userResult = await db.collection('users').updateMany(
            { role: { $exists: false } },
            { $set: { role: 'USER' } }
        );
        console.log(`✅ Updated ${userResult.modifiedCount} users with role: USER`);

        // Update drivers collection - add role: 'DRIVER' if not exists
        const driverResult = await db.collection('drivers').updateMany(
            { role: { $exists: false } },
            { $set: { role: 'DRIVER' } }
        );
        console.log(`✅ Updated ${driverResult.modifiedCount} drivers with role: DRIVER`);

        console.log('✅ Migration complete!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await client.close();
    }
}

// Run migration
migrateRoles();
