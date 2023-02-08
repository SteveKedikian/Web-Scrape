const {MongoClient} = require('mongodb');

const url_host = "mongodb://localhost:27017";
const client = new MongoClient(url_host);

const database_name = "scraped_data";
const url_data = "url_data";


async function dbUrlData() {
    let result = await client.connect();
    db = result.db(database_name);
    return db.collection(url_data);
}

module.exports = dbUrlData;