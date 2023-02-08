const request = require('request');
const cheerio = require('cheerio');
const { ObjectId } = require('mongodb');

const dbUrlData = require('./dburldata');
const dbContentTokens = require('./dbcontenttokens');
const e = require('express');

// wikipedia urls
const url_data_array = ['https://en.wikipedia.org/wiki/Content_clause', 
                        'https://en.wikipedia.org/wiki/Content_writing_services',
                        'https://en.wikipedia.org/wiki/Content_management'];      

// json for url, headers, content

let url;
let headers;
let content;

const addUrlData = async (url, headers, content) => {
    let data = await dbUrlData();
    let result = await data.insertOne({"url": url, "headers": headers, "content": content});
    
    if (result.acknowledged) {
        console.log('data inserted !');
    }
}

const addContentTokens = async () => {
    let url_data = await dbUrlData();
    let content_data = await dbContentTokens();
    url_data = await url_data.find({}).toArray();

    // map_data.set('ff', 'dd');

    // obj = JSON.parse(content_data);
    // console.log(obj.url);

    for (let i = 0; i < url_data.length; ++i) {
        let id = url_data[i]._id.toString();
        let content = url_data[i].content.split(" ");

        // content_data.insertOne({word: content[10], id: 'lapux'});
        // data = await content_data.find({word: 'serce'}).toArray();
        // console.log(content);

        for (let j = 0; j < content.length; ++j) {
            let data = await content_data.find({word: content[j]}).toArray();

            if (data.length == 0) {
                content_data.insertOne({word: content[j], id: id});
            }
            else {
                let id_line = data[0].id.toString();
                // console.log(id_line);
                if (id_line.includes(id)) {
                    continue;
                }
                else {
                    id_line += ' ' + id;
                    const query = { word: content[j]};
                    const update = { $set: { id: id_line }};
                    const options = {};
                    content_data.updateOne(query, update, options);
                }
            }
        }
    }
}

// const addContentTokens = async () => {dbConnect().then((resp) => {
//     resp.find({_id: new ObjectId('63e2b828ec9da4f7828fcdb8')}).toArray().then((data) => {
//             console.log(data);
//         });
//     });
// }

function mySpliter(str) {
    new_str = '';
    token = '';

    for (let i = 0; i < str.length; ++i) {
        if (str[i] < 33 || str[i] > 126) {
            new_str += token + ' ';
            token = '';
            continue;
        }
        token += str[i];
    }
    new_str += token;

    return new_str;
}

function scrapWiki (url_array) {
    for (let i = 0; i < url_array.length; ++i) {
        request(url_array[i], (error, response, html) => {
        if (!error && response.statusCode == 200) {
            const $ = cheerio.load(html);

            url = url_array[i];

            // console.log('\nURL\n');
            // console.log(url);

            headers = $('h1').text();
            headers = mySpliter(headers);

            // console.log('\nheaders\n');
            // console.log(headers);

            content = $('p').text();
            content = mySpliter(content);

            // console.log('\ncontent\n');
            // console.log(content);

            addUrlData(url, headers, content);
            addContentTokens();
        }
    })
    }
}

scrapWiki(url_data_array);




















// const url_content_clause = 'https://en.wikipedia.org/wiki/Content_clause';

// let headers = [];
// let contents;
// let inverted_index = new Map();

// request(url_content_clause, (error, response, html) => {
//     if (!error && response.statusCode == 200) {
//         const $ = cheerio.load(html);

//         $('h1, h2, h3, h4, h5, h6').each((index, ref) => {
//             const elem = $(ref);
//             headers.push(elem.text());
//         })

//         contents = $('p').text();
//         // console.log(contents);
//         let token = contents.split(" ");

//         for (let i = 0; i < token.length; ++i) {
//             console.log(token[i]);
//         }

//         // for (let i = 0; i < contents.length; ++i) {
//         //   console.log(contents[i]);
//         // }

//         // for (let i = 0; i < contents.length; ++i) {
//         //   if (contents[i] == ' ') {
//         //     if (token === '') {
//         //       continue;
//         //     }
//         //     let count = inverted_index.get(token);

//         //     if (count == undefined) {
//         //       count = 0;
//         //     }

//         //     ++count;
//         //     inverted_index.set(token, count);
//         //     token = '';
//         //   }
//         //   token += contents[i];
//         // }

//         // contents.forEach(element => {
//         //   let count = inverted_index.get(element);
//         //   console.log(element + "______________________\n");
//         //   // ++count;
//         //   // inverted_index.set(element, count);
//         // })

//         // inverted_index.forEach((val, key) => {
//         //   console.log(key + ' = ' + val);
//         // });
//     }
// })

// const express = require('express')
// const { connectToDb, getDb } = require('./db')

// const app = express()
// app.use(express.json())

// // db connection
// let db

// connectToDb((error) => {
//   if (!error) {
//     // listening output
//     app.listen(3000, () => {
//       console.log('Listening to the PORT: 3000')
//     })
//     db = getDb()
//   }
// })

// // routhe to all data
// app.get('/url_data', (req, res) => {
//   let contents = []

//   db.collection('url_data')
//     .find() // kinda iterator in C++, it will iterate throw DB data
//     .sort({ name: 1})
//     .forEach(content => contents.push(content))
//     .then(() => {
//       res.status(200).json(contents) // all ok
//     })
//     .catch(() => {
//       res.status(500).json({error: 'Failed to fetch !'}) // problem
//     })
// })

// // routhe to name GET
// app.get('/url_data/:name', (req, res) => {
//   // if (!req.params.name) {
//   //   res.status(200).json({message: 'Nothing'})
//   // }

//   db.collection('url_data')
//     .findOne({name: req.params.name})
//     .then(doc => {
//       res.status(200).json(doc)
//     })
//     .catch(err => {
//       res.status(500).json({error: 'Failed to fetch !'})
//     })
// })

// // routhe to name SET
// app.post('/url_data', (req, res) => {
//   const data = req.body

//   db.collection('url_data')
//     .insertOne(data)
//     .then(result => {
//       res.status(201).json(result) // success
//     })
//     .catch(err => {
//       res.status(500).json({error: 'Failed to create !'})
//     })
// })












