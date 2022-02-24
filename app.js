//jshint esversion:6

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");

const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const blogpostSchema = new mongoose.Schema({
  title: String,
  content: String,
  contentTruncated: String,
  url: String
});
const BlogPost = mongoose.model('BlogPost', blogpostSchema);

let posts = [];

// Home Page
app.get("/", function(req, res) {

  home().catch(err => console.log(err));

  async function home() {

    await mongoDbConnect();

    posts = await BlogPost.find({});

    mongoose.disconnect();

    res.render("home",
    {
      content: homeStartingContent,
      posts: posts
    });

  };

});

// About Us Page
app.get("/about", function(req, res) {
  res.render("about", {content: aboutContent});
});

// Contact Us Page
app.get("/contact", function(req, res) {
  res.render("contact", {content: contactContent});
});

// Compose Page
app.get("/compose", function(req, res) {
  res.render("compose");
});

app.post("/compose", function(req, res) {

  createPost().catch(err => console.log(err));

  async function createPost() {

    await mongoDbConnect();

    let blogpost = new BlogPost({
      title: req.body.postTitle,
      content: req.body.postBody,
      contentTruncated: _.truncate(req.body.postBody, { length: 100 }),
      url: `/posts/${_.kebabCase(req.body.postTitle)}`
    });

    await blogpost.save(function(err, post) {

      if (err) {
        console.log(err);
      } else {
        res.redirect("/");
      }

    });


  };

});

// Post Page
app.get("/posts/:title", function(req, res) {

  readMore().catch(err => console.log(err));

  async function readMore() {
    await mongoDbConnect();

    BlogPost.findOne(
      {title: {$regex: _.lowerCase(req.params.title), $options: "i"}},
      function(error, postDoc) {
        if (error) {
          console.log(error);
        } else {
          if (postDoc != undefined && postDoc != null) {
            res.render("post", { post: postDoc });
          } else {
            res.send("Invalid page.");
          }
          mongoose.disconnect();
        }
      });

  }

});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

async function mongoDbConnect() {
  let mongoUri = process.env.MONGODB_URI;
  let mongoDbName = process.env.MONGODB_NAME;
  let mongoUserName = process.env.MONGODB_USERNAME;
  let mongoUserPassword = process.env.MONGODB_USERPASSWORD;

  let mongooseOptions = { useNewUrlParser: true };
  let uri = _.replace(mongoUri, "<username>", mongoUserName);
  uri = _.replace(uri, "<password>", mongoUserPassword);
  uri = _.replace(uri, "<databasename>", mongoDbName);

  // console.log(`mongodb_uri => ${uri}`);

  await mongoose.connect(uri, mongooseOptions);
}
