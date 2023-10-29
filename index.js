const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 3000;

require("dotenv").config();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

const uri = `mongodb+srv://${process.env.DB_Username}:${process.env.DB_Password}@cluster0.hzlter2.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const database = client.db("dataDB");
    const users = database.collection("users");

    app.get("/user", async (req, res) => {
      const cursor = users.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/user/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { email: id };
        const result = await users.findOne(query);
        res.send(result);
      } catch (err) {
        console.log(err);
      }
    });

    app.post("/addUser", async (req, res) => {
      try {
        const user = req.body;
        console.log(user);
        const result = await users.insertOne(user);
        console.log(
          `A document was inserted with the _id: ${result.insertedId}`
        );
        res.send(result);
      } catch (error) {
        res.send(error);
      }
    });

    app.put("/course/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const options = { upsert: true };
        const data = req.body;
        const userObject = {
          courseName: data.name,
          imageUrl: data.image,
        };
        const updateDoc = {
          $push: {
            user: [userObject],
          },
        };

        const result = await users.updateOne(filter, updateDoc, options);
        console.log(data);
        res.send(result);
      } catch (err) {
        console.log(err);
      }
    });
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);
