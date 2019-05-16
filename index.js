// dependencies
'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const { WebhookClient, Payload } = require('dialogflow-fulfillment');
const functions = require("firebase-functions");
const fetch = require('node-fetch');

let errorResposne = {
    results: []
};

const port = process.env.PORT || 9000;
// create serve and configure it.
const server = express();
server.use(bodyParser.urlencoded({
        extended: true
}));
server.use(bodyParser.json());

server.post('/', (req, res)=>{

  const agent = new WebhookClient({ request: req, response: res });


  const findItem = async (agent)=>{
          const itemname = req.body.queryResult.parameters.itemname;
          console.log(`ลูกค้าขอราคา ${itemname}`)

                const getItemsAsync= async (name)=>
                  {
                      let response = await fetch(encodeURI(`https://22f1d343.ngrok.io/api/ospos_items/findone?_where=(name,eq,${name})`));
                      let data = await response.json();
                      let finalPrice = data[0].unit_price;
                      return finalPrice;
                    }
          const price = await getItemsAsync(itemname);
          let result = `${itemname} ราคา ${price} บาท ครับผม`;
          console.log(`ข้อมูล: ${result}`);
          agent.add(result);
    }

  const evaluateJob = async (agent) =>{
    console.log('ตีราคางาน');
    const needtype=req.body.queryResult.parameters.profiling;
    const width=req.body.queryResult.parameters.width;
    const height=req.body.queryResult.parameters.height;
    const color=req.body.queryResult.parameters.color;
    const stdTypes = [
                        {name: "บานเลื่อนสี่บาน", price: 1800, color: "สีดำ"},
                        {name: "บานเลื่อนสี่บาน", price: 1400, color: "สีอบขาว"},
                        {name: "บานเลื่อนสี่บาน", price: 1300, color: "สีชา"}
    ]






  let finalPriceJob = await getPrice(type,color);
  let veryFinalPrice = parseInt(finalPriceJob*(width*height));
  let result = `ราคาประเมินชุด ${type} ราคา ${veryFinalPrice} บาท ครับผม`;
  agent.add(result);

}





  let intentMap = new Map();
  intentMap.set('pricechecker - custom - yes', findItem);
  intentMap.set('evaluateJobs - custom - yes', evaluateJob);
  agent.handleRequest(intentMap);
});

server.listen(port,()=> {
    console.log("Server is up and running...");
});
exports.fulfillmentExpressServer = functions.https.onRequest(server);
