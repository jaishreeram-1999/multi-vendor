import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable")
}

/**
 * Cache interface
 */
interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

/**
 * Extend global type
 */
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined
}

/**
 * Create or reuse cached connection
 */
const globalWithMongoose = global as typeof global & {
  mongoose?: MongooseCache
}

const cached: MongooseCache =
  globalWithMongoose.mongoose ?? {
    conn: null,
    promise: null,
  }

if (!globalWithMongoose.mongoose) {
  globalWithMongoose.mongoose = cached
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI as string, {
      bufferCommands: false,
    })
  }

  cached.conn = await cached.promise
  return cached.conn
}
