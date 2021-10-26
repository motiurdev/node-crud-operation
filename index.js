const express = require('express')
const cors = require('cors')
const { MongoClient } = require('mongodb');
const objectId = require('mongodb').ObjectId;

require('dotenv').config()

const app = express()

app.use(cors())
app.use(express.json())

const port = process.env.PORT || 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.aobjx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("Memebers");
        const userCollection = database.collection("member");

        // post api
        app.post('/adduser', async (req, res) => {
            const data = req.body;
            const result = await userCollection.insertOne(data)
            res.send(result)
        })

        // get api
        app.get('/users', async (req, res) => {
            const result = userCollection.find({});
            const cursor = await result.toArray()
            res.send(cursor)
        })

        app.get('/users/update/:id', async (req, res) => {
            const id = req.params.id
            const item = { _id: objectId(id) }
            const result = await userCollection.findOne(item)
            res.send(result)
        })

        // update api
        app.put('/users/update/:id', async (req, res) => {
            const id = req.params.id;
            const updatedUser = req.body;
            const filter = { _id: objectId(id) }
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    name: updatedUser.name,
                    email: updatedUser.email,
                    password: updatedUser.password
                },
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.json(result)
        })

        app.delete('/deleteUser/:id', async (req, res) => {
            const id = req.params.id;
            const item = { _id: objectId(id) }
            const result = await userCollection.deleteOne(item)
            res.send(result.acknowledged)
        })

    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send("Hello World!")
})

app.listen(port, () => {
    console.log("listening to port", port);
})