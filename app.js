require('dotenv').config()
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const _ = require("lodash");

mongoose.connect(process.env.URL);
app.set("view engine", "ejs"); // ejs
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const itemSchema = new mongoose.Schema({
  name: String,
});
const Item = mongoose.model("item", itemSchema);
const item1 = new Item({
  name: "welcome to our to-do-list",
});
const item2 = new Item({
  name: "hit + button to add an item",
});
const item3 = new Item({
  name: "<--- click this button to delete",
});
const defaultitems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  itemArr: [itemSchema],
});
const List = mongoose.model("list", listSchema);

app.get("/", function (req, res) {
  Item.find({}, function (err, founditems) {
    if (founditems.length === 0) {
      Item.insertMany(defaultitems, function (err) {
        if (err) console.log(err);
        else console.log("inserted default");
      });
      res.redirect("/");
    } else
      res.render("list", { newitemlist: founditems, listTitle: "home" });
  }); //ejs
});
app.post("/", function (req, res) {
  const listName = req.body.button;
  const newTask = req.body.task;
  const newItem = new Item({
    name: newTask,
  });
  if (listName === "home") {
    newItem.save().then(() => {
      res.redirect("/");
    })
  } else {
    List.findOne({ name: listName }, function (err, foundList) {
      if (foundList) {
        foundList.itemArr.push(newItem);
        foundList.save();
        res.redirect("/" + listName);
      }
    });
  }
});
app.post("/delete", function (req, res) {
  const itemid = req.body.checkbox;
  var listName = req.body.lName;
  if (_.lowerCase(listName) === "favicon ico")
    res.end()
  else if (_.lowerCase(listName) === "home") {
    Item.findByIdAndDelete(itemid, function (err) {
      if (err) console.log(err);
      else {
        res.redirect("/");
      }
    });
  } else {
    List.updateOne(
      { name: listName },
      { $pull: { itemArr: { _id: itemid } } },
      function (err) {
        if (!err) {
          res.redirect("/" + listName);
        }
      }
    );
  }
});
app.get("/:customListName", function (req, res) {
  var listName = req.params.customListName;
  listName = _.lowerCase(listName);
  if (_.lowerCase(listName) === "favicon ico")
    res.end()
  else if (listName === "availablelists") {
    List.find({}, (err, foundLists) => {
      if (err) console.log(err);
      else {
        res.render("otherLists", { listArr: foundLists });
      }
    })
  }
  else if (listName === "home") {
    Item.find({}, function (err, founditems) {
      if (founditems.length === 0) {
        Item.insertMany(defaultitems, function (err) {
          if (err) console.log(err);
          else console.log("inserted default");
        });
        res.redirect("/");
      } else
        res.render("list", { newitemlist: founditems, listTitle: "home" });
    }); //ejs
  } else {
    List.findOne({ name: listName }, function (err, foundList) {
      if (err) {
        console.log(err);
      } else {
        if (!foundList) {
          var listItem = new List({
            name: listName,
            itemArr: defaultitems,
          });
          listItem.save();
          res.redirect("/" + listItem.name);
        } else {
          res.render("list", {
            listTitle: foundList.name,
            newitemlist: foundList.itemArr,
          });
        }
      }
    });
  }
});
app.post("/addList", (req, res) => {
  const listName = _.lowerCase(req.body.newList);
  res.redirect("/" + listName);
})
app.post("/deleteList", (req, res) => {
  // _.lowerCase
  const listId = (req.body.checkbox);
  List.findByIdAndRemove(listId, (err) => {
    if (err) console.log(err);
    else {
      res.redirect("/availablelists")
    }
  })
})
app.get("/favicon.ico", (req, res) => {
  return "your faveicon";
});
let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
app.listen(port, function () {
  console.log("server has started");
});
