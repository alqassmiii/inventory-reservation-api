const express = require ('express');

const db = require('./Database');

const app = express();
app.use(express.json());

const port = 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));




//First endpoint
app.post('/resources', (req, res) => {

    const name = req.body.name;
    const total_capacity = req.body.total_capacity;


    // check if the name is valid 
    if (typeof name !== 'string' || name.trim() === '') { 
        res.status(400).json({error: "the name must be String"});

        return;
    }
    
    // check if the total_capacity is valid 
    if (!Number.isInteger(total_capacity) || total_capacity <= 0) {

    res.status(400).json({error: "the total capacity must be integer positive number"});

        return;  
    }


    //insert the data
    const insert = db.prepare(`INSERT INTO resources (name, total_capacity) VALUES (?, ?)`);
    const result = insert.run(name, total_capacity);

    //preparing the response
    res.status(201).json({
      id: result.lastInsertRowid,
      name: name,
      total_capacity: total_capacity,
      available: total_capacity

    });
    });

    //Secound endpoint

app.get('/resources/:id', (req, res) => {
    const id = Number(req.params.id);

        //check if the id is in database 
         if (!Number.isInteger(id)) {
        res.status(400).json({ error: "invalid id" });
        return;
        }

        // find the resource
    const resource = db.prepare('SELECT * FROM resources WHERE id = ?').get(id);

         if (!resource) {
        res.status(404).json({ error: "resource not found" });
        return;
         }

         // sum up all reservations for this resource
    const row = db.prepare('SELECT COALESCE(SUM(quantity), 0) AS reserved FROM reservations WHERE resource_id = ?').get(id);
    const available = resource.total_capacity - row.reserved;


    res.json({
        id: resource.id,
        name: resource.name,
        total_capacity: resource.total_capacity,
        available: available
    });


});
