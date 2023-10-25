const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wyy6auz.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // Creating Collections..........
    const serviceCollection = client.db("carDoctorDB").collection("servicesDB")
    const orderCollection = client.db("carDoctorDB").collection("ordersDB")

    // Get data from the mongoDB..........
    app.get("/services", async(req, res)=>{
        const result = await serviceCollection.find().toArray()
        res.send(result)
    })

    // get data from mongodb for checkout page........
    app.get("/services/:id", async(req, res)=>{
        const id = req.params.id
        const query = {_id : new ObjectId(id)}
        const options = {
           
            // Include only the `title` and `imdb` fields in the returned document
            projection: { _id: 1, title: 1, price: 1, img: 1 },
          };

        const result = await serviceCollection.findOne(query, options)
        res.send(result)
      
    })

    // sent confirmed order data to the server
    app.post('/orders', async (req, res)=>{
        const order = req.body
        const result = await orderCollection.insertOne(order)
        res.send(result)
    })

    // get order data form mongodb
    app.get("/orders", async (req, res)=>{
        let query = {}
        if(req.query?.userId){
            query = {userId: req.query.userId}
        }
        const result = await orderCollection.find(query).toArray()
        res.send(result)
    })
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get("/", (req, res)=>{
    res.send("Car Doctor is running")
})

app.listen(port, ()=>{
    console.log(`Car doctor is running on the port ${port}`);
})
