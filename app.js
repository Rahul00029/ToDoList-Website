const express=require("express")
const bodyParser=require("body-parser")
const mongoose=require("mongoose");
// const { compile } = require("ejs");
const _=require("lodash");

const app=express()

app.set("view engine",'ejs')

app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static("public"))

//connect to mongodb
mongoose.connect("mongodb+srv://rbhadu29:Rahul%21%40%23123@cluster0.n76mg.mongodb.net/todolistDB");

//create a schema
const itemSchema=mongoose.Schema({
    name:String
});

// create a Collection
const Item=mongoose.model("Item",itemSchema);

//insert data
const item1=new Item({
    name:"Welcome to your toDoList."
});

const item2=new Item({
    name:"Hit the + button to add a new item."
});

const item3=new Item({
    name:"<-- Hit the checkbox to delete the item"
});
const defaultItems=[item1,item2,item3];

const listSchema=mongoose.Schema({
    name:String,
    items:[itemSchema]
});

const List=mongoose.model("List",listSchema);



app.get("/",function (req,res) {
    //access the database
    Item.find().then((item)=>{
        if(item.length===0){
        //insert many
            Item.insertMany(defaultItems).then(()=>{
                console.log("Items added to DB");
            }).catch((err)=>{
                console.log(err)
            });
            res.redirect("/");
        }
        else{
            res.render("list", {listTitle:"Today" ,newItem:item});
    }
    }).catch((err)=>{
        console.log(err)
    });
    
 
});

app.get("/:temp",function (req,res) {
    const customListName=_.capitalize(req.params.temp);
    List.findOne({name:customListName}).then((foundList)=>
    {
        if(!foundList){
            //create a new list
            const list=new List({
                name:customListName,
                items:defaultItems
            });
            list.save();
            res.redirect("/"+customListName);
        }
        else
        {
            //show an existing list
            res.render("list",{listTitle:customListName,newItem:foundList.items})
        }
    }).catch((err)=>{
        console.log(err)
    });

});

app.get("/about",function(req,res){
    res.render("about");
})


app.post("/",function (req,res) {
    let itemName=req.body.newTask;
    const listname=req.body.list;
    const newItem= new Item({
        name:itemName
    });
    console.log(listname);
    if(listname==="Today"){
        newItem.save();
        res.redirect("/");
    }
    else{
        List.findOne({name:listname}).then((foundlist)=>{
            foundlist.items.push(newItem);
            foundlist.save();
            res.redirect("/"+listname);
        });
    }
});

app.post("/delete",function(req,res) {
    const checkedItemId=req.body.checkbox;
    const listName=req.body.listName;

    if(listName==="Today"){
        Item.findByIdAndDelete(checkedItemId).then(()=>{
            console.log("deleted")
        }).catch((err)=>{
            console.log(err)
        });
        res.redirect("/");
    }else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}}).then((foundList)=>{
            res.redirect("/"+listName);
        });
    }



})

app.listen(3000,function () {
    console.log("Server started at port 3000")
    
})