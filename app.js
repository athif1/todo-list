const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require("mongoose")
const _ = require('lodash')



const app = express()



app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(express.static("public"));
mongoose.connect("mongodb+srv://admin-athif:root123@cluster0.dgyxa.mongodb.net/todolistDB",
{ useNewUrlParser: true ,
 useUnifiedTopology: true }
 )

const itemsSchema = {
  name:String
}

const Item = mongoose.model("item",itemsSchema)
const item1 = new Item({
  name:"Welcome to your todolist!"
});

const item2 = new Item({
  name:"Hit the + button to add a new item."
});

const item3 = new Item({
  name:"<-- Hit this to delete an item"
});

const defaultItems = [item1,item2,item3];

const listSchema = {
  name:String,
  items:[itemsSchema]
}

const List = mongoose.model("list",listSchema);



app.get("/", function(req, res) {
    Item.find({},function(err, founditems){

  if(founditems.length === 0){
    Item.insertMany(defaultItems,function(err){
      if(err){
        console.log(err);
      }else{
        console.log("the data base is sucessfull")
      }

    })
    res.redirect("/")
  }else{
    res.render("list", {
      listTitle: "today",
      newlistItems: founditems

    });
  }

})


  //res.render("list",{kindofDay:day});


})
app.post("/", function(req, res) {
  const itemName = req.body.newIteam;
  const listName = req.body.list;

  const item = new Item ({
    name:itemName
  })
  if(listName === "today"){
    item.save()
     res.redirect("/");
  }else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    })
  }


})

app.post("/delete",function(req,res){
  const checkedItemId =  req.body.checkbox;
 const listName = req.body.listName;

 if(listName === "today"){
   Item.findByIdAndRemove(checkedItemId,function(err){
     if(err){
       console.log(err);
     }else{
       console.log("delete sucessfull");
       res.redirect("/")
     }
   })
 }else{
 List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
   if(!err){
     res.redirect("/"+listName)
   }
 })

 }



})

app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name:customListName},function(err,foundlist){
   if (! err){
     if(! foundlist){
       //console.log("not exists")
       const list = new List({
         name:customListName,
         items:defaultItems
       })
       list.save()
       res.redirect("/" +customListName)

       }else{
         //console.log("it exists")
         res.render("list", {
           listTitle: foundlist.name,
           newlistItems: foundlist.items

         });

       }

   }

  })

})

app.get("/about", function(req, res) {
  res.render("about");
})

app.listen(3000, function() {
  console.log("the server is started ath port 3000");
})
