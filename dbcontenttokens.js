const {MongoClient} = require('mongodb');

const url_host = "mongodb://localhost:27017";
const client = new MongoClient(url_host);

const database_name = "scraped_data";
const content_tokens = "content_tokens";

async function dbContentTokens() {
    let result = await client.connect();
    db = result.db(database_name);
    return db.collection(content_tokens);
}

module.exports = dbContentTokens;