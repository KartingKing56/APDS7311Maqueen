import express from "express";
import db from "../db/conn.mjs";
import {ObjectId} from "mongodb";

const router = express.Router();

//Get all the records.
router.get("/", async (req,res) => {
    let collection = await db.collection("posts");
    let results = await collection.find({}).toArray();
    res.send(results).status(200);
});

//Create a new record.
router.post("/upload", async (req,res) => {
    let newDocument = {
        user: req.body.user,
        contnent: req.body.contnent,
        image: req.body.image
    };
    let collection = await db.collection("posts");
    let result = await collection.insertOne(newDocument);
    res.send(result).status(204);
});


//Update a record by id
router.patch("/:id", async(req,res) => {
    const query = {_id: new ObjectId(req.params.id)};
    const updates = {
        $set: {
            name: req.body.name,
            comment: req.body.comment
        }
    };

    let collection = await db.collection("posts");
    let result = await collection.updateOne(query, updates);

    res.send(result).status(200);
});

//Gets a single record by id
router.get("/:id", async (req,res) => {
    let collection = await db.collection("posts");
    let query = {_id: new ObjectId(req.params.id)};
    let result = await collection.findOne(query);

    if (!result){
        res.send("Not found").status(404);
    }
    else{
        res.send(result).status(200);
    }
});

//Delete a record
router.delete("/:id", async (req,res) => {
    const query = {_id: new ObjectId(req.params.id)};

    const collection = db.collection("posts");
    let result = await collection.deleteOne(query);

    res.send(result.status(200));
});

//-------------------------------Davin-Start----------------------------------------------//

// User login and session regeneration. 
router.post("/login", async (req, res) => { 
    // Replace this with your actual user authentication logic. 
    const user = await authenticateUser(req.body.username, req.body.password); 
    
    if (user) {
        req.session.regenerate((err) => { 
            if (err) { 
                console.error("Session regeneration error:", err); 
                return res.status(500).send("Error regenerating session"); 
            } 
            
            // Set user information in the session. 
            req.session.user = { id: user.id, username: user.username }; 
            res.send("Logged in successfully"); 
        }); 
    } else { 
        res.status(401).send("Invalid username or password"); 
    } 
}); 

//-------------------------------Davin-End------------------------------------------------//

export default router;