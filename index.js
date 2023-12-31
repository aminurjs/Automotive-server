const express = require("express");
const app = express();
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const port = process.env.port || 5000;

//MiddleWare
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sz2xe62.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const productsCollection = client.db("insertDB").collection("products");
const brandsCollection = client.db("insertDB").collection("brands");
const cartCollection = client.db("insertDB").collection("cart");

app.get("/brands", async (req, res) => {
  const brands = await brandsCollection.find().toArray();
  res.send(brands);
});
app.get("/brands/:name", async (req, res) => {
  const name = req.params.name;
  const query = { brand_name: name };
  const brand = await brandsCollection.findOne(query);
  res.send(brand);
});
app.get("/products", async (req, res) => {
  const products = await productsCollection.find().toArray();
  res.send(products);
});
app.get("/products/:name", async (req, res) => {
  const name = req.params.name;
  const query = { brand_name: name };
  const brandProducts = await productsCollection.find(query).toArray();
  res.send(brandProducts);
});
app.get("/product/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const product = await productsCollection.findOne(query);
  res.send(product);
});

app.post("/addproduct", async (req, res) => {
  const product = req.body;
  console.log(req.body);
  const result = await productsCollection.insertOne(product);
  res.send(result);
});

app.get("/carts", async (req, res) => {
  const carts = await cartCollection.find().toArray();
  res.send(carts);
});

app.post("/addcart", async (req, res) => {
  const product = req.body;
  const result = await cartCollection.insertOne(product);
  res.send(result);
});
app.delete("/carts/remove/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await cartCollection.deleteOne(query);
  res.send(result);
});
app.put("/update/:id", async (req, res) => {
  const id = req.params.id;
  const product = req.body;
  const filter = { _id: new ObjectId(id) };
  const options = { upsert: true };
  const updateProduct = {
    $set: {
      image: product.image,
      name: product.name,
      brand_name: product.brandName,
      type: product.type,
      price: product.price,
      rating: product.rating,
      description: product.description,
    },
  };
  console.log(updateProduct);
  const result = await productsCollection.updateOne(
    filter,
    updateProduct,
    options
  );
  res.send(result);
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
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

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(port, () => {
  console.log(`Server running in the port: ${port}`);
});
