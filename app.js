const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const https = require("https");
const app = express();


app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static(__dirname + "/public/"));


//Μόλις ο server λάβει ένα GET request, κάνει response στον browser το signup.html
app.get("/", function(req, res) {
  res.sendFile(__dirname + "/signup.html");
})

/*Μόλις ο server λάβει ένα POST request, στέλνει ένα GET request (μέσω https και χρήση API) στον mailchimp server,
o mailchimp server στέλνει ένα response στον server μας και τελικώς ο server μας στέλνει ένα response στον browser*/
app.post("/", function(req, res) {
  var firstName = req.body.name;
  var lastName = req.body.surname;
  var email = req.body.email;

  //Φτιάχνω ένα Javascript object με χρήση του API, για αποστολή των στοιχείων του χρήστη (GET request) στον mailchimp server
  var data = {
    members: [{
      email_address: email,
      status: "subscribed",
      merge_fields: {
        FNAME: firstName,
        LNAME: lastName
      }
    }]
  };
  var jsonData = JSON.stringify(data);
  var url = "https://us21.api.mailchimp.com/3.0/lists/03a84fd520";
  var options = {
    method: "POST",
    auth: "nikos:40288754c743e6337b4f6b57f4ba1b9e-us21"
  }

  //Tο GET request που πρόκειται να σταλεί στον mailchimp server
  const request = https.request(url, options, function(response) {
    //O mailchimp server στέλνει ένα response με data στον server μας
    response.on("data", function(data) {
      console.log(JSON.parse(data));
    })
    if (response.statusCode === 200)   //Αν η εγγραφή είναι επιτυχής
    {
      res.sendFile(__dirname + "/success.html") //Ο server μας στέλνει ως response στον browser το success.html
    } else {
      res.sendFile(__dirname + "/failure.html")
    }
  });

  request.write(jsonData); //Στέλνω το GET request στον mailchimp server
  request.end();
})

/*Μόλις ο χρήστης πατήσει το κουμπί 'Try again', στέλνεται ένα POST request στο route /failure. Με την
 παρακάτω post, ο server κάνει redirect στο home route, γεγονός που 'ενεργοποιεί την get() με παράμετρο το home route
 κατά την οποία ο server κάνει response στον browser το signup.html, δηλαδή την αρχική μας σελίδα*/
app.post("/failure", function(req, res) {
  res.redirect("/");
})


app.listen(4000, function() {
  console.log("Server is running in port 3000...");
})


module.export = app;
