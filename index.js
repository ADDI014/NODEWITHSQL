const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');
const express = require("express");
const app = express();
const methodOverride = require("method-override");
const {v4 : uuidv4} = require("uuid");


const path = require("path");
app.set("view engine", "ejs");
app.set("views",path.join(__dirname,"/views"));
app.use(methodOverride("_method"));
app.use(express.urlencoded({extended:true}));




const connection  = mysql.createConnection(
    {
      host: "localhost",
      user: "root",
      database: "delta_app",
      password: "Ankit@132asdf"
    }
  );
  let getRandomUser = () => {
    return {
      userId: faker.string.uuid(),
      username: faker.internet.userName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    };
  }

  //home route
  app.get("/",(req,res)=>{
    let q = "SELECT count(*) FROM user";
   try {
    connection.query(q, (err,result)=>{
        if(err) throw err;
        let count = result[0]["count(*)"];
        res.render("home.ejs",{count});
    });
  }
  catch(err){
    console.log(err);
    res.send("some error");
  }
});

//show route 
app.get("/user",(req,res)=>{
  let q ="SELECT * FROM user";
  try {
    connection.query(q, (err,result)=>{
        if(err) throw err;
        let data = result;
        res.render("showusers.ejs", { data });
    });
  }
  catch(err){
    console.log(err);
    res.send("some error");
  }
})

//edit route
app.get("/user/:id/edit",(req,res)=>{
  let {id} = req.params;
  let q=`SELECT * FROM user WHERE id='${id}'`;
  try {
    connection.query(q , (err,result)=>{
      if(err) throw err;
      // console.log(result);
      let user = result[0];
      res.render("edit.ejs",{user});
    });
  }
  catch(err){
  console.log(err);
  res.send("some error in DB");
  }

  // res.render("edit.ejs");
})

//update route
app.patch("/user/:id",(req,res)=>{
  let {id} = req.params;
  let {password : formPass , username : newUserName} = req.body;
  let q = `SELECT * FROM user WHERE id='${id}'`;
  try{
    connection.query(q,(err,result)=>{
      if(err) throw err;
      let user = result[0];
      if(formPass != user.password){
        res.send("WRONG PASSWORD");
      }
      else{
        let q2 = `UPDATE user SET username='${newUserName}' WHERE id='${id}'`;

        connection.query(q2 , (err,result) =>{
          if(err) throw err;
          res.redirect("/user");
        });
      }
    })
  }
  catch(err){
    console.log(err);
    res.send("some error in DB");
  }
})

//add a new user
app.get("/user/new",(req,res)=>{
  res.render("new.ejs");
});


app.post("/user/new", (req, res) => {
  let { username, email, password } = req.body;
  let id = uuidv4();
  // Using placeholders in the query to prevent SQL injection
  let q = `INSERT INTO user (id, username, email, password) VALUES (?, ?, ?, ?)`;
  try {
    connection.query(q, [id, username, email, password], (err, result) => {
      if (err) throw err;
     console.log("added new user");
      res.redirect("/user");
    });
  } catch (err) {
    console.log(err);
    res.send("Some error occurred");
  }
});





//   let q = "INSERT INTO user (id , username , email , password) VALUES ? ";
//   let data = [];
//   for(let i=1;i<=100; i++){
//      data.push(Object.values(getRandomUser()));
//   } 

//   try {
//     connection.query(q, [data] , (err,result)=>{
//         if(err) throw err;
//         console.log(result);
//     });
//   }
//   catch(err){
//     console.log(err);
//   }
// connection.end();




// console.log(getRandomUser());



app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
