const Database = require('better-sqlite3');

const db = new Database('data.db');


db.exec(`CREATE TABLE IF NOT EXISTS resources (

    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    total_capacity INTEGER NOT NULL

    )
`);

 db.exec(`CREATE TABLE IF NOT EXISTS reservations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    resource_id INTEGER NOT NULL,
    reserver_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resource_id) REFERENCES resources(id)
    
    
    )
`);

module.exports = db;