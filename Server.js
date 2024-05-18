const express = require("express");
const cors = require("cors");
require("./db/config"); // import config file that have our server connection link.
const app = express();
const users = require("./db/User"); // import User file that have our Schema or data model that we'll send to Databse.
const Product = require("./db/Product")

const Jwt = require("jsonwebtoken")
const jwtkey = "e-com"


app.use(express.json()); // This is middleware which help us to see what data we have posted or updated on Insomnia/Postman api.

app.use(cors()); // This is middleware package to resolve CORS error at backen.




// Following post request is for sign up
app.post("/signup", async (req, res) => {
  let user = new users(req.body);
  let result = await user.save();
  result = result.toObject()
  delete result.password      // this is intentionally done to keep password hidden.
  res.send(result); 
});



// Following post reqest is for login

app.post("/login", async (req, resp) => {
  if (req.body.password && req.body.email) {
    const userdata = await users.findOne(req.body).select("-password"); // findOne will find the user with matching credentials. But password is intentinally hidden.
    if (userdata) {
      
      Jwt.sign({userdata},jwtkey,{expiresIn:"24h"},(err,token)=>{
        if(err){
          resp.send({result:"Something went wrong please try after sometime"})
        }
        resp.send({userdata,auth:token});
      })

     
    } else {
      resp.send({ result: "No User Found in Database" });
    }
  } else {
    resp.send({ result: "No User Found in Database" });
  }
});


// Followinng is Add product API or post request.

app.post("/add-product",verifyAccessToken,async(req,res)=>{
    const product = new Product(req.body)
    const result = await product.save()
    res.send(result)
    
})


// Following API is to get all Products in the database 

app.get("/products",verifyAccessToken, async (req, res) => {
    const products = await Product.find();
    if (products.length > 0) {
        res.json(products);
    } else {
        res.status(404).json({ message: "No Product found" });
    }
});


// Following API is to delete product from database.

app.delete("/products/:id",verifyAccessToken,async(req,resp)=>{
  const result = await Product.deleteOne({_id:req.params.id})
  resp.send(result)
})


// Following Api is used to GET data of single product when we want to UPDATE

app.get("/products/:id",verifyAccessToken,async(req,res)=>{
  const result = await Product.findOne({_id:req.params.id})
  if(result){
    res.send(result)
  }
  else{
    res.send({result:"No record found"})
  }
})


//Following API is used to UPDATE single product at a time.

app.put("/product/:id",verifyAccessToken,async(req,res)=>{
  const result = await Product.updateOne(
    {
      _id:req.params.id
    },
    {
      $set :req.body
    }
  )
  res.send(result)
})


// Following API is to search result 

app.get("/search/:key",verifyAccessToken,async(req,res)=>{
  const result = await Product.find({
    "$or" :[
      {name:{$regex:req.params.key}},
      {price:{$regex:req.params.key}},
      {category:{$regex:req.params.key}}
    ]
  })
  res.send(result)
})


// Following is middleware function it used to verify token send by user.

function verifyAccessToken(req, res, next) {
  let token = req.headers["authorization"];

  if (token) {
    token = token.split(' ')[1];

    Jwt.verify(token, jwtkey, (err, decoded) => {
      if (err) {
        console.error("Error verifying token:", err); // Log the error for debugging
        return res.status(401).send({ result: "Invalid token" });
      } else {
        // Token is valid, you can access the decoded information if needed
        req.user = decoded; // Assuming your JWT payload contains user information
        console.log("Token Valid");
        next();
      }
    });
  } else {
    res.status(403).send({ result: "Please provide token in headers" });
  }
}

app.listen(5000);
