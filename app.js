var express = require("express"),
    app = express(),
    mongo = require("mongodb"),
    dbAddress = process.env.MONGOLAB_URI || "mongo://localhost:27017/test",
    port = process.env.PORT || 3000,
    findAllSlides,
    postSlide;

app.configure(function () {
    app.set("port", process.env.PORT || 3000);
    app.use(express.bodyParser());
    app.use(express["static"](__dirname));  //THIS WILL SERVE UP ALL SOURCE CODE!!!
});

mongo.connect(dbAddress, {auto_reconnect: true}, function (error, db) {
    console.log("connected to mongodb: " + db);

    db.addListener("error", function (error) {
        console.log("Error connecting to mongodb");
    });

    db.collection("slides", function (error, collection) {
        findAllSlides = function (callback) {
            collection.find().toArray(callback);
        };

        postSlide = function (newSlide, callback) {
            collection.save(newSlide, {safe: true}, callback);
        };
    });
});

// BEGIN ROUTES
app.get("/slides", function (req, res) {
    findAllSlides(function (error, results) {
        if (error) {
            res.json(error, 400);
        } else if (!results) {
            res.send(404);
        } else {
            res.json(results);
        }
    });
});

app.post("/slide", function (req, res, next) {
    postSlide(req.body, function (error, result) {
        if (error) {
            res.json(error, 400);
        } else {
            res.json(req.body, 201);
        }
    });
});
// END ROUTES

app.listen(port, function () {
    console.log("Listening on port " + port);
});
