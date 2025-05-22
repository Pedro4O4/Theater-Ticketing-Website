const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://monemsomida:Monem%40010036@cluster0.izera.mongodb.net/';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function connectToDatabase() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        // You can add your database operations here
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
    } finally {
        await client.close();
    }
}

connectToDatabase();