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
// Require all models
// var mongoose = require("./models");
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");

var PORT = 3000;

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
mongoose.connect("mongodb://<dbuser>:<dbpassword>@ds249269.mlab.com:49269/heroku_gsbb7qzx");
var db = mongoose.connection;
//mongodb://localhost/newsMongo

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});

// Set Handlebars.
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");



// Routes
// router.get("/", function(req, res) {

// },



app.get("/scrape", function(req, res) {
    console.log("TEST")
    // Make request to grab the HTML from `awwards's` clean website section
    request("http://www.bbc.com/news", function(error, response, html) {
    
      // Load the HTML into cheerio
      var $ = cheerio.load(html);
    // console.log(response);
        // console.log($)
        $("a").each(function(i, element){
            // console.log(element);
           var result = {}
        //    .children("h3")
           result.title = $(this).text();
           result.link = $(this).attr("href");
        //    console.log( $(this).children("h3").text())
        console.log(result);
        })

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
    });
    res.send("SCRAPE COMPLEAT");
    console.log(res);
});
// // Import routes and give the server access to them.
// var routes = require("./controllers/news.js");

// app.use(routes);



// Start the server
app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });
  