// Create express app
var express = require("express")
var app = express()
var db = require("./database.js")
var morgan      = require('morgan')
var jwt    = require('jsonwebtoken')
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const  ProtectedRoutes = express.Router(); 

app.delete('/api/items/:itemId', ProtectedRoutes);
app.patch("/api/items/:itemId", ProtectedRoutes);
ProtectedRoutes.use((req, res, next) =>{
    
    

    // check header for the token
    var token = req.headers['authentication'];
    if(token == "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE1NjI1NzI0NjQsImV4cCI6MTU5NDEwODQ2OSwiYXVkIjoid3d3LnN0dWRlbnRzLjJoYXRzLmNvbS5hdSIsInN1YiI6InVzZXJAMmhhdHMuY29tLmF1IiwiR2l2ZW5OYW1lIjoiSm9obiIsIlN1cm5hbWUiOiJTbm93IiwiRW1haWwiOiJqb2huc25vd0AyaGF0cy5jb20uYXUiLCJSb2xlIjoiSmFuaXRvciJ9.BEEqb2ihfP0ec8TBu91T9lk0kcBKpz1NkJv4PpyjxdE")
    {
        next();

    }
    
    else{
        res.send({ 
        
        success: 'false',
        message: 'Unauthorized' 
        });
    }
})
//  ProtectedRoutes.post('/api/items',(req,res)=>{
//      console.log("what is this")
//      items.foreach(req.body.itemId)
//     var data = {
//          itemId: req.body.itemId,
//          type: req.body.type,
//          color: req.body.color, 
//          stock: req.body.stock
//          }
//      var insert = 'INSERT INTO item (typeofitem, color, stock) VALUES (?,?,?)'
//      var params = []
 
//      res.json()
   
//     })

//Update item stock
   ProtectedRoutes.patch("/api/items/:itemId",(req,res,next)=>{
    console.log("I got")
    
    var data = {
        stock: req.body.stock
        }
    var update = 'UPDATE item set stock = COALESCE(?,stock) WHERE itemId = ?'
    var params = [data.stock,req.params.itemId]
    db.run(update, params, function(err, result) {
        if (err){
            res.status(400).json({"error": res.message})
            return;
        }
        console.log(this.changes)
        if(this.changes > 0){
            res.json({
            "message":"success",
            }) 
        }
        else{
            res.json({"message":"Id Could Not Be Found"})
        }     
    });
})
//delete an item
ProtectedRoutes.delete("/api/items/:itemId",(req,res,next)=>{
    console.log("I delete")
    var data = {
        stock: req.body.stock
        }
    var del = 'DELETE FROM item  WHERE itemId = ?'
    var params = [req.params.itemId]
    db.run(del, params, function(err, result) {
        if (err){
            res.status(400).json({"error": res.message})
            return;
        }
        if(this.changes > 0){
        res.json({"message":"deleted"})    
    }else{
        res.json({"message":"Id Could Not Be Found"})
    }
    });
})



// Server port
var HTTP_PORT = 8000 
// Start server
app.listen(HTTP_PORT, () => {
    console.log("Server running on port %PORT%".replace("%PORT%",HTTP_PORT))
});
// Root endpoint
app.get("/", (req, res, next) => {
    res.json({"message":"yes"})
});

// Insert here other API endpoints
app.get("/api/items", (req, res, next) => {
    var sql = "select * from item"
    var params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "success":"true",
            "items":rows
        })
      });
});

app.get("/api/items/:itemId", (req, res, next) => {
    
    
    var sql = "select * from item where itemId = ?"
    var params = [req.params.itemId]
    db.all(sql, params, (err, row) => {
        if (err){
            res.status(400).json({"error": res.message})
            return;
        }
        if (row.length > 0){
            res.json({
                "message":"success",
                "item":row
            })
        }  else{  
        res.send({"success":"fail",
        "message":"Id Could not be found"})
    }
      });
});
//GetAllOrders
app.get("/api/orders", (req, res, next) => {
    var sql = "select * from [Order]"
    var params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "success":"true",
            "orders":rows
        })
      });
});
//Get Orders for specific id
app.get("/api/orders/:id", (req, res, next) => {
    console.log([req.body.id])
    
    var sql = "select * from [Order] where id = ?"
    var params = [req.params.id]
    db.all(sql, params, (err, row) => {
        if (err){
            res.status(400).json({"error": res.message})
            return;
        }
        if (row.length > 0){
            res.json({
                "message":"success",
                "item":row
            })
        }  else{  
        res.send({"success":"fail",
        "message":"OrderId could not be found"})
    }

    });
});

//post orders
app.post("/api/orders", (req, res, next) => {
    //console.log([req.body.itemId])
    
    var data = {
    itemId: req.body.itemId,
    quantity: req.body.quantity
    }
    
    var insert = 'INSERT INTO [Order] (itemId, quantity) VALUES (?,?)'
    var params1 = [data.itemId, data.quantity]
    var sql = 'Select stock from item where itemId = ?'
    var params = [req.body.itemId]
    
    db.all(sql, params, function(err, row){
        if (err){
            res.status(400).json({"error": err.message})
            return;
        }
        if(row.length > 0){
        var availableStock = row.stock
        
        if(availableStock - data.quantity <= 0 ){
        res.send({"success":"fail",
        "message":"Item Out of stock"})
        }else{ 
        db.all(insert, params1, function(err, result){
        if (err){
            res.status(400).json({"error": err.message})
            return;
            }
            //console.log(yourOrder)
                res.json({
                "message": "success",
                "Order": data
                })
            })
        }
    }else{
        res.send({"success":"fail",
        "message":"Item could not be found"})
        }
    })
});
// Default response for any other request
app.use(function(req, res){
    res.status(404);
});