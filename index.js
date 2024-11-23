const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const {
  MongoClient,
  ServerApiVersion,
  Collection,
  ObjectId,
} = require("mongodb");
const port = process.env.PORT || 5000;

// middlewares
app.use(cors());
app.use(express.json());

// mongoDB connected

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.zwnyjff.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

    // bikes Collection
    const bikeCollection = client.db("cycleHubDB").collection("bikes");
    // user collection
    const userCollection = client.db("cycleHubDB").collection("users");
    // cycle collection
    const cycleCollection = client.db("cycleHubDB").collection("cycles");
    // employees collection
    const employeeCollection = client.db("cycleHubDB").collection("employees");
    // added items collection
    const addedItemCollection = client
      .db("cycleHubDB")
      .collection("addedItems");

    // get / find / read all bikes
    app.get("/bikes", async (req, res) => {
      try {
        const result = await bikeCollection.find().toArray();
        res.status(200).send(result);
      } catch (error) {
        console.error(error.message);
      }
    });

    // cycle collection
    // get / find cycles
    app.get("/cycles", async (req, res) => {
      try {
        const result = await cycleCollection.find().toArray();
        res.status(200).send(result);
      } catch (error) {
        console.error(error.message);
      }
    });

    // get / find a single cycle
    app.get("/cycles/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await cycleCollection.findOne(query);
        res.status(200).send(result);
      } catch (error) {
        console.error(error.message);
      }
    });

    // post / create a single cycle
    app.post("/cycles", async (req, res) => {
      try {
        const cycle = req.body;
        const result = await cycleCollection.insertOne(cycle);
        res.status(200).send(result);
      } catch (error) {
        console.error(error.message);
      }
    });

    // update a single cycle
    app.put("/cycles/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const previousCycle = req.body;
        const filter = { _id: new ObjectId(id) };
        const options = { upsert: true };
        const updateCycle = {
          $set: {
            name: previousCycle?.name,
            brand: previousCycle?.brand,
            model: previousCycle?.model,
            brakes: previousCycle?.brakes,
            features: previousCycle?.features,
            description: previousCycle?.description,
            price: previousCycle?.price,
            // photo: previousCycle?.photo,
          },
        };
        const result = await cycleCollection.updateOne(
          filter,
          updateCycle,
          options
        );
        res.status(200).send(result);
      } catch (error) {
        console.error(error.message);
      }
    });

    // delete / remove a single cycle
    app.delete("/cycles/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await cycleCollection.deleteOne(query);
        res.status(200).send(result);
      } catch (error) {
        console.error(error.message);
      }
    });

    // added item collection start from here
    // get / find added item
    app.get("/added-item", async (req, res) => {
      try {
        const email = req.query.email;
        const query = { email: email };
        const result = await addedItemCollection.find(query).toArray();
        res.status(200).send(result);
      } catch (error) {
        console.log(error.message);
      }
    });

    // post / create
    app.post("/added-item", async (req, res) => {
      try {
        const addedItem = req.body;
        const result = await addedItemCollection.insertOne(addedItem);
        res.status(200).send(result);
      } catch (error) {
        console.error(error.message);
      }
    });

    // delete / remove a single added item
    app.delete("/added-item/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await addedItemCollection.deleteOne(query);
        res.status(200).send(result);
      } catch (error) {
        console.error(error.message);
      }
    });

    // users collection start from here
    // get / find user
    app.get("/users/:email", async (req, res) => {
      try {
        const email = req.params.email;
        const query = { email: email };
        const result = await userCollection.findOne(query);
        res.status(200).send(result);
      } catch (error) {
        console.error(error.message);
      }
    });

    // post / create user
    app.post("/users", async (req, res) => {
      try {
        const newUser = req.body;
        const result = await userCollection.insertOne(newUser);
        res.status(200).send(result);
      } catch (error) {
        console.error(error.message);
      }
    });

    // user role update
    app.patch("/users/admin/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const updateUser = {
          $set: {
            role: "admin",
          },
        };
        const result = await userCollection.updateOne(filter, updateUser);
        res.status(200).send(result);
      } catch (error) {
        console.error(error.message);
      }
    });

    // admin role find using email
    app.get("/users/admin/:email", async (req, res) => {
      try {
        const email = req.params.email;
        const query = { email: email };
        const result = await userCollection.findOne(query);
        let admin = false;
        if (result) {
          admin = result?.role === "admin";
        }
        res.status(200).send({ admin });
      } catch (error) {
        console.error(error.message);
      }
    });

    // employees collection here
    // get / find all employees
    app.get("/testimonials", async (req, res) => {
      try {
        const result = await employeeCollection.find().toArray();
        res.status(200).send(result);
      } catch (error) {
        console.error(error.message);
      }
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", async (req, res) => {
  try {
    res.status(200).send(`cycle-hub server worked now!`);
  } catch (error) {
    console.error(error.message);
  }
});

app.listen(port, () => {
  console.log(`server is running at port ${port}`);
});
