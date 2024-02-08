// mongodb+srv://akg:akg8894@cluster0.d6nstty.mongodb.net/?retryWrites=true&w=majority

const express = require("express");
const request = require("request");
const cheerio = require("cheerio");
const NodeCache = require("node-cache");
const mongoose = require("mongoose");

const app = express();
const port = 3000;

const cache = new NodeCache({ stdTTL: 600 }); // Cache TTL set to 10 minutes

const headers = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
};

mongoose.connect("mongodb+srv://akg:akg8894@cluster0.d6nstty.mongodb.net/?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const ImageUrlSchema = new mongoose.Schema({
  img_src: String,
});

const ImageUrl = mongoose.model("ImageUrl", ImageUrlSchema);

function getFinalRedirectedUrl(initialUrl) {
  return new Promise((resolve, reject) => {
    request.get(
      { url: initialUrl, headers, followRedirect: false },
      (error, response) => {
        if (response.statusCode === 302 || response.statusCode === 301) {
          resolve(response.headers.location);
        } else {
          resolve(initialUrl);
        }
      },
    );
  });
}



app.get("/", (req, res) => {
  res.send("Welcome to the GIF API!");
});


app.get("/delete", async (req, res) => {
  try {
    const collections = await mongoose.connection.db.collections();

    const deletionPromises = collections.map(async (collection) => {
      await collection.deleteMany({});
    });

    await Promise.all(deletionPromises);

    res.json({ message: "All documents deleted from all collections." });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An error occurred." });
  }
});

app.get("/random", async (req, res) => {
  try {
    const count = await ImageUrl.countDocuments();
    const randomIndex = Math.floor(Math.random() * count);
    const randomImageUrl = await ImageUrl.findOne().skip(randomIndex);

    res.json(randomImageUrl);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An error occurred." });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
