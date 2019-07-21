var sqlite3 = require('sqlite3').verbose()
// var md5 = require('md5')

const DBSOURCE = "db.sqlite"

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
       // Cannot open database
      console.error(err.message)
      throw err
    }else{
        console.log('Connected to the SQLite database.')
        db.run(`CREATE TABLE item (
            itemId INTEGER PRIMARY KEY AUTOINCREMENT,
            typeofitem text,
            color text,
            stock INTEGER
            )`, 
        (err) => {
            if (err) {
                 // Table already created
            }else{
                 // Table just created, creating some rows
                var insert = 'INSERT INTO item (typeofitem, color, stock) VALUES (?,?,?)'
                db.run(insert, ["shirt", "blue", 50])
                db.run(insert, ["tshirt", "green", 20])
            }
        });
        db.run(`CREATE TABLE [Order] (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            itemId INTEGER,
            quantity INTEGER,
            CONSTRAINT fk_item
            FOREIGN KEY (itemId)
            REFERENCES item(itemId)           
            )`, (err) => {
                if (err) {
                  // console.log(err.message)
                    
                     // Table already created
                }
                // else{
                //      // Table just created, creating some rows
                //      console.log('Connected to the')
                //     var insert = 'INSERT INTO [Order] (itemId, quantity) VALUES (?,?)'
                //     db.run(insert, ["1", 10])
                //     db.run(insert, ["2", 5])
                //     console.log('Insert to the')
                // }
            }); 
    }
});


module.exports = db
