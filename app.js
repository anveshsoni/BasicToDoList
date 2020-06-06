
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const _ =require("lodash");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.set('useFindAndModify', false);
mongoose.connect("mongodb+srv://admin-soni:qwerty123@cluster0-rijxd.mongodb.net/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true});

const itemsSchema = new mongoose.Schema({
  name: String
});
const Item =  mongoose.model("Item",itemsSchema);
const item1 = new Item({
  name: "Welcome To your ToDo List"
});
const item2 = new Item({
  name: "Hit the + Button to add a new item"
});
const item3 = new Item({
  name: "<-- Hit this to delete a item"
});

const defualtItems=[item1,item2,item3];

const listSchema = new mongoose.Schema({
  name:String,
  items:[itemsSchema]
});
const List = mongoose.model("List",listSchema);
app.get("/", function(req, res) {

    Item.find({},function(err,foundItems){
      if(foundItems.length === 0){
        Item.insertMany(defualtItems,function(err){
          if(err){
            console.log(err);
          }else{
            console.log("Succesfully Added to Db");
          }
        });
        res.redirect("/");
      }else{
        res.render("list", {listTitle: "Today", newListItems: foundItems});
      }
    });


});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });

  if(listName==="Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }
});

app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName=req.body.listName;
   if(listName==="Today"){
     Item.findByIdAndRemove(checkedItemId,function(err){
       if(err){
         console.log(err);
       }else{
         res.redirect("/");
       }
     });
   }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
      if(!err){
        res.redirect("/" +listName);
      }
    });
   }
});

app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name:customListName},function(err,foundList){
  if(!err){
    if(!foundList){
      //create a new List
      const list = new List({
        name:customListName,
        items: defualtItems
      });
      list.save();
      res.redirect("/"+customListName);
    }else{
      //show an existing list
      res.render("List",{listTitle:foundList.name,newListItems:foundList.items});
    }
  }
  });

});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.listen(port, function() {
  console.log("Server started on port 3000");
});
