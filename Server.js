const express = require("express");
const session = require("express-session")
const mysql2 = require("mysql2/promise");
const cors = require("cors");
const jsonwebtoken = require("jsonwebtoken")
require("dotenv").config();
const app = express();

app.use(express.json());

const PORT = process.env.DB_PORT ||3000;
const dbConfig = mysql2.createPool({
    host:process.env.DB_HOST , 
    port:process.env.DB_PORT , 
    user: process.env.DB_USER , 
    password:process.env.DB_PASSWORD , 
    database:process.env.DB_NAME,
    connectTimeout:100 ,
    // ssl:{
    //     cert:false
    // }
})

// -------------------- CORS --------------------
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  process.env.REACT_APP_API_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(null, true);
    },
  })
);



// app.post("/login" , async(req , res)=>{
//     const token = await jsonwebtoken.sign({
        
//     }, process.env.Secrect_keys)
// })

app.get("/phone", async(req , res)=>{
    const [rows] = await dbConfig.execute("SELECT * FROM phones");
    if(rows.length===0) return res.status(404).json({message : "There is no any products in the database"});
    return res.json(rows);// return the response 

})

app.post("/phone" , async(req , res)=>{
    const {name , price , qty , model} = req.body;
    const [rows] = await dbConfig.execute("INSERT INTO (name , price , qty , model) VALUES(? , ? ,? ,?)", [name , price , qty ,model]);//nsert 
    if(rows.affectedRows===0) return res.status(500).json({message : "INSERTION operation failed"});
    return res.json(rows);// return the reponse 
})


app.put("/phone/:id" , async(req , res)=>{
    const id = Number(req.params.id);
    const {name , price , qty , model} = req.body;
    const [rows] = await dbConfig.execute("UPDATE phone SET name=? , price=? , qty=? , model =? WHERE id=?" , [name ,parseFloat(price) , qty ,model , id]);
    if(rows.affectedRows===0) return res.status(500).json({message : "UPDATE operation failed"});
    return res.json(rows);// retur
})

app.delete("/phone/:id" , async(req , res)=>{
    const id = Number(req.params.id)
    const [rows] = await dbConfig.execute("DELETE FROM phone WHERE id=?" , [id]);
    if(rows.affectedRows===0) return res.status(500).json({message : "Deletion operation failed"});
    return res.json(rows);//
})

app.use((req , res , next)=>{
    return res.status(404).json({message :" 404 route not found "})
})



app.listen(PORT , ()=>{
    console.log(`Server running at PORT ${PORT}`);
})

// session 
// app.use(session({
// secret:"", 
// cookie:{
//     maxAge:2000
// }
// }))