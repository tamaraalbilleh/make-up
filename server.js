'use strict';

const express = require ('express');
const server = express();
require ('dotenv').config();
const PORT = process.env.PORT;
server.use(express.urlencoded({ extended: true }));
server.set ('view engine' , 'ejs');
server.use('/public',express.static('public'))
const cors = require('cors');
server.use(cors());
const superagent = require('superagent');
const pg = require ('pg')
const client = new pg.Client({ connectionString: process.env.DATABASE_URL,
     ssl: { rejectUnauthorized: false }
     });
const methodOverride = require('method-override');
server.use(methodOverride('_method'));



server.get('/',homepageHandler)
function homepageHandler (req,res){
    res.render ('pages/index')
}

server.post ('/byPrice' , productByPriceHandler)
function productByPriceHandler (req,res){
    let url = `http://makeup-api.herokuapp.com/api/v1/products.json?brand=${req.body.brand}&price_greater_than=${req.body.grater}&price_less_than=${req.body.less}`;
    superagent.get(url).then(data=>{
    let dataBody = data.body;
    res.render('pages/Product By Price', {card: dataBody})
    })
    .catch (error=>{
        res.send(error)
    })
}

server.get('/all', allProductHandler)
function allProductHandler (req,res){
    let url = `http://makeup-api.herokuapp.com/api/v1/products.json?brand=maybelline`;
    superagent.get(url).then(data=>{
        let mData = data.body;
        let resultData = mData.map (item=>{
            return new Maybelline (item);
        })
        res.render('pages/Maybelline Products',{card : resultData})
    })
    .catch (error=>{
        res.send (error)
    })
}

server.post ('/add' , addHandler)
function addHandler (req,res){
    let sql =`INSERT INTO makeup (name, price, image, description) VALUES ($1, $2, $3 ,$4) RETURNING *;`;
    let safe = req.body;
    let safeValues = [safe.name, safe.price, safe.image, safe.description];
    client.query(sql,safeValues).then (()=>{
        res.redirect ('/myCard') 
    })
}

server.get ('/myCard' , myCardHandler)
function myCardHandler (req,res){
    let sql = `SELECT * FROM makeup;`;
    client.query(sql).then(result=>{
            res.render ('pages/My Card',{card : result.rows})
    })
}

server.get ('/myCard/:id', detailHandler)
function detailHandler (req,res){
    let sql =`SELECT * FROM makeup WHERE id=$1;`;
    let safeValue = [req.params.id];
    client.query (sql,safeValue).then (result=>{
        res.render ('pages/Product Details', {card : result.rows[0]})
    })
}

server.put ('/myCard/:id' , updateHandler)
function updateHandler (req,res){
    let sql = `UPDATE makeup SET name=$1, price=$2, image=$3, description=$4;`;
    let safe = req.body;
    let safeValues = [safe.name, safe.price, safe.image, safe.description];
    client.query (sql,safeValues).then (()=>{
        res.redirect(`/myCard/${req.params.id}`)
    })
}

server.delete ('/myCard/:id' ,deleteHandler)
function deleteHandler (req,res){
    let sql =`DELETE FROM makeup WHERE id=$1;`;
    let safe=[req.params.id];
    client.query (sql,safe).then(()=>{
        res.redirect('/myCard')
    })
}


function Maybelline (data){
    this.name = data.name;
    this.price = data.price;
    this.image = data.api_featured_image;
    this.description = data.description;
}


client.connect().then(()=>{
    server.listen(PORT,()=>{
        console.log (`listening on PORT :${ PORT}`)
    })
})
