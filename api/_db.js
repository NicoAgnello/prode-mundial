import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI
let client
let clientPromise

if (!uri) throw new Error('MONGODB_URI no está definido')

const options = {
  tls: true,
  serverSelectionTimeoutMS: 8000,
  connectTimeoutMS: 8000,
  socketTimeoutMS: 9000,
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default async function conectarDB() {
  const client = await clientPromise
  return client.db('prode-mundial')
}