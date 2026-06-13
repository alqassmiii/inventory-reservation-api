const express = require ('express');

const db = require('./Database');

const app = express();
app.use(express.json());


// Health check endpoint
app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'Inventory Reservation API is running' });
});


//First endpoint
app.post('/resources', (req, res) => {

    if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ error: 'request body must be JSON' });
    }

    const name = req.body.name;
    const total_capacity = req.body.total_capacity;


    // check if the name is valid
    if (typeof name !== 'string' || name.trim() === '') {
        res.status(400).json({error: "Name must be a non-empty string"});

        return;
    }
    
    // check if the total_capacity is valid
    if (!Number.isInteger(total_capacity) || total_capacity <= 0) {

    res.status(400).json({error: "total_capacity must be a positive integer"});

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
         if (!Number.isInteger(id) || id <= 0) {
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

//Thered endpoint
app.post('/resources/:id/reservations', (req, res) => {

    if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ error: 'request body must be JSON' });
    }

    const id = Number(req.params.id);
    const reserver_name = req.body.reserver_name;
    const quantity = req.body.quantity;

    if (!Number.isInteger(id) || id <= 0) {
        res.status(400).json({ error: "invalid id" });
        return;
    }

    // check resource exists
    const resource = db.prepare('SELECT * FROM resources WHERE id = ?').get(id);
    if (!resource) {
        res.status(404).json({ error: "resource not found" });
        return;
    }

    // check reserver_name is valid
    if (typeof reserver_name !== 'string' || reserver_name.trim() === '') {
        res.status(400).json({ error: "reserver_name must be a non-empty string" });
        return;
    }

    // check quantity is valid
    if (!Number.isInteger(quantity) || quantity <= 0) {
        res.status(400).json({ error: "quantity must be a positive integer" });
        return;
    }

    const row = db.prepare('SELECT COALESCE(SUM(quantity), 0) AS reserved FROM reservations WHERE resource_id = ?').get(id);
    const available = resource.total_capacity - row.reserved;

    // check there is enough seats
    if (quantity > available) {
        res.status(400).json({ error: "requested quantity exceeds available capacity" });
        return;
    }

    // insert the reservation into database 
    const insert = db.prepare('INSERT INTO reservations (resource_id, reserver_name, quantity) VALUES (?, ?, ?)');
    const result = insert.run(id, reserver_name, quantity);

    // include created_at in response
    const reservation = db.prepare('SELECT * FROM reservations WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
        id: reservation.id,
        resource_id: reservation.resource_id,
        reserver_name: reservation.reserver_name,
        quantity: reservation.quantity,
        created_at: reservation.created_at
    });
});

//Fourth endpoint
app.get('/resources/:id/reservations', (req, res) => {

    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        res.status(400).json({ error: "invalid id" });
        return;
    }

    // check resource exists
    const resource = db.prepare('SELECT * FROM resources WHERE id = ?').get(id);
    if (!resource) {
        res.status(404).json({ error: "resource not found" });
        return;
    }

    // get all reservations for this resource
    const reservations = db.prepare('SELECT * FROM reservations WHERE resource_id = ?').all(id);
    res.json(reservations);
    
});

// global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'something went wrong' });
});

const port = 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));