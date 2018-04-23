var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var expressHandlebars = require("express-handlebars");
// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");
var request = require("request");


//===========================================================================================================
// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI, function(er, er2) {
    console.log(er2)
});
//============================================================================================================

// Require all models
// var mongoose = require("./models");
// var Note = require("./models/Note.js");
// var Article = require("./models/Article.js");
var db = require("./models");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// Database configuration with mongoose
// mongoose.connect(
//   "mongodb://<dbuser>:<dbpassword>@ds249269.mlab.com:49269/heroku_gsbb7qzx"
// );
// var db = mongoose.connect();
//mongodb://localhost/newsMongo

// Show any mongoose errors


// Set Handlebars.
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Routes
// router.get("/", function(req, res) {

// },

app.get("/scrape", function(req, res) {
  console.log("TEST");
  //............................................................................................
  //toutor helped and said request insted of axios
  // Make request to grab the HTML from `awwards's` clean website section
  request("http://www.bbc.com/news", function(error, response, html) {
    // Load the HTML into cheerio
    var $ = cheerio.load(html);
    // console.log(response);
    // console.log($)

///////////////////////////////////////////////////////////
        //I WANT TO KNOW IF IF CAN DO THIS
        //WHY DOES THIS ERROR  CAN NOT READ FIND OF UNDEFINED 
// $(".gs-c-promo-body").each(function(i, element) {
//         var result = {};
//         result.title = $(this).children("div").children("gs-c-promo-heading").text();
//         result.link = $(this).children("div").children("gs-c-promo-heading").attr("href");
//         result.link = $(this).children("div").children("gs-c-promo-summary").text();
//         //
///////////////////////////////////////////////////////////

    // $("a").each(function(i, element) {
    $(".gs-c-promo-body").each(function(i, element) {
      // console.log(element);
      var result = {};
      //    .children("h3")
      result.title = $(this).text();
      result.link = $(this).attr("href");
      result.summary = $(this).next().text();
      //    console.log( $(this).children("h3").text())
      console.log(result);
//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
        // Create a new Article using the `result` object built from scraping
        db.Article.create(result)
          .then(function(dbArticle) {
            // View the added result in the console
            console.log(dbArticle);
          })
          .catch(function(err) {
            // If an error occurred, send it to the client
            return res.json(err);
          });
//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
    });

    // If we were able to successfully scrape and save an Article, send a message to the client
    res.send("Scrape Complete");
  });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
    // console.log(req);
    // console.log(res);
    // console.log(db);
    // console.log(db.Article);
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate(
        { _id: req.params.id },
        { note: dbNote._id },
        { new: true }
      );
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// var $ = cheerio.load(response.data);

// $(".gs-c-promo-heading").each(function(i, element){
// // href="/news/world-us-canada-43804253">
// // <h3 class="gs-c-promo-heading__title gel-pica-bold nw-o-link-split__text">
// // 'American hero' lands stricken airliner</h3></a>"

// // Save the text of the h4-tag as "title"
// var title = $(element).text();

// // Find the h4 tag's parent a-tag, and save it's href value as "link"
// var link = $(element).attr("href");
// db.Article.insert({
//     title: title,
//     link: link
//   },
//   function(err, inserted) {
//     if (err) {
//       // Log the error if one is encountered during the query
//       console.log(err);
//     }
//     else {
//       // Otherwise, log the inserted data
//       console.log(inserted);
//     }
//   });
//               //THIS IS WHAT i NEED TO FIX

// });

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
