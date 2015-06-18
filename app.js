var express = require("express"),
app = express(),

bodyParser = require("body-parser"),
methodOverride = require('method-override'),
morgan = require("morgan"),
db = require("./models");

app.set('view engine', 'ejs');
app.use(morgan('tiny'));
app.use(methodOverride('_method'));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended:true}));

app.get("/", function(req, res){
	res.redirect("/zoos");
});

//ROUTES FOR ZOOS

//index for zoos
app.get("/zoos", function(req, res){
	//find all zoos
	db.Zoo.find({}, function(err, zoos){
		//show them on the index page for zoos
		res.render("zoos/index.ejs", {zoos:zoos});
	});
});

//form for new zoos
app.get("/zoos/new", function(req, res){
	res.render("zoos/new.ejs")
});

//create new zoo and push to the database then direct back to zoos
app.post("/zoos", function(req, res){
	db.Zoo.create(req.body.zoo, function(err, zoos){
		if(err){
			console.log("Error")
		} else {
			res.redirect("/zoos")
		}
	});
});

//show zoo by id
app.get("/zoos/:id", function(req, res){
	db.Zoo.findById(req.params.id).populate("animals").exec(function(err,zoo){
		res.render("zoos/show.ejs", {zoo:zoo});
	});
});

//get edit form
app.get("/zoos/:id/edit", function(req, res){
	db.Zoo.findById(req.params.id).populate("animals").exec(function(err,zoo){
		res.render("zoos/edit.ejs", {zoo:zoo})
	});
});

//update with edit form
app.put("/zoos/:id", function(req, res){
	db.Zoo.findByIdAndUpdate(req.params.id, req.body.zoo, function(err, zoo){
		if(err){
			console.log("Error")
		} else {
			res.redirect("/zoos")
		}
	});
});

//delete the zoo
app.delete("/zoos/:id", function(req, res){
	db.Zoo.findById(req.params.id, function(err, zoo){
		if(err){
			console.log("Error")
		} else {
			zoo.remove();
			res.redirect("/zoos")
		}
	});
});

//ROUTES FOR ANIMALS
app.get('/zoos/:zoo_id/animals', function(req,res){
  db.Zoo.findById(req.params.zoo_id).populate('animals').exec(function(err,zoo){
    res.render("animals/index", {zoo:zoo});
  });
});

// NEW
app.get('/zoos/:zoo_id/animals/new', function(req,res){
  db.Zoo.findById(req.params.zoo_id,
    function (err, zoo) {
      res.render("animals/new", {zoo:zoo});
    });
});

// CREATE
app.post('/zoos/:zoo_id/animals', function(req,res){
  db.Animal.create(req.body.animal, function(err, animals){
    if(err) {
      console.log(err);
      res.render("animals/new");
    }
    else {
      db.Zoo.findById(req.params.zoo_id,function(err,zoo){
        zoo.animals.push(animals);
        animals.zoo = zoo._id;
        animals.save();
        zoo.save();
        res.redirect("/zoos/"+ req.params.zoo_id +"/animals");
      });
    }
  });
});

// SHOW
app.get('/animals/:id', function(req,res){
  db.Animal.findById(req.params.id)
    .populate('zoo')
    .exec(function(err,animal){
      res.render("animals/show", {animal:animal});
    });
});

// EDIT
app.get('/animals/:id/edit', function(req,res){
  db.Animal.findById(req.params.id, function(err,animal){
      res.render("animals/edit", {animal:animal});
    });
});

// UPDATE
app.put('/animals/:id', function(req,res){
 db.Animal.findByIdAndUpdate(req.params.id, req.body.animal,
     function (err, animal) {
      console.log("ANIMAL!", animal)
       if(err) {
         res.render("animals/edit");
       }
       else {
         res.redirect("/zoos/" + animal.zoo + "/animals");
       }
     });
});

// DESTROY
app.delete('/animals/:id', function(req,res){
 db.Animal.findByIdAndRemove(req.params.id,
      function (err, animal) {
        if(err) {
          console.log(err);
          res.render("animals/edit");
        }
        else {
          res.redirect("/zoos/" + animal.zoo  + "/animals");
        }
      });
});

// CATCH ALL
app.get('*', function(req,res){
  res.render('errors/404');
});


//start server
app.listen(3000, function(){
	console.log("Server is on!");
});