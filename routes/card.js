const express = require('express');
const https = require('https');
const router = express.Router();
const { processImage } = require('../cardGenerator.js')

require('dotenv').config()
const AWS = require('aws-sdk')

const redis = require('redis')

const redisClient = redis.createClient();
(async () => {
    try {
        await redisClient.connect();
    } catch (err) {
        console.log(err)
    }
})();

//S3 Setup
const bucketName = "anthony-and-dulce-card-deck-storage"
const s3 = new AWS.S3({apiVersion: "2006-03-01"})

(async () => {
    try {
        await s3.createBucket({Bucket: bucketName}).promise();
        console.log(`Created Bucket: ${bucketName}`);
    } catch(err){
        if (err.statusCode != 409){
            console.log(`Error creating bucket: ${err}`)
        }
        else {
            console.log(err)
        }
    }
})()


//Global variables
let theme;
let cardKey


router.get('/:query', async (req, res) => {
     theme = encodeURI(req.params.query); 
     cardKey = `CardKey:${theme}`;

     const s3Params = {Bucket: bucketName, Key: cardKey}
     const redisCacheResult = await redisClient.get(cardKey)
    

     if(redisCacheResult) {
        const resultJSON = JSON.parse(redisCacheResult)
        console.log("resultJSON.themecards: ", resultJSON.themeCards);
        res.send(resultJSON.themeCards);
        
     }
     else
    {
        try{
            
        } catch (err){
            const options = createFlickrOptions(theme, 53)
            const flickReq = https.request(options, async (flickRes) => {

            let body = [];

            flickRes.on('data', function(chunk) {
                body.push(chunk)
            })

            flickRes.on('end', async function() {
                const bodyString = body.join('')
                const rsp = JSON.parse(bodyString)
                const s = await parsePhotoRsp(rsp);
                console.log(s)
                res.send(s)
                res.end()
            }) 
        });

        flickReq.on('error', (e) => {
            console.error(e);
        })
        flickReq.end();
        }

    }
    
})

const flickr = {
    method: 'flickr.photos.search',
    api_key: "6acbc768b71411be47c153d1aeb956d4",
    format: "json",
    media: "photos",
    nojsoncallback: 1
};

function createFlickrOptions(query,number) {
    const options = {
    hostname: 'api.flickr.com',
    port: 443,
    path: '/services/rest/?',
    method: 'GET'
 }
 const str = 'method=' + flickr.method +
    '&api_key=' + flickr.api_key +
    '&tags=' + query +
    '&per_page=' + number +
    '&format=' + flickr.format +
    '&media=' + flickr.media +
    '&nojsoncallback=' + flickr.nojsoncallback;
    options.path += str;
    return options;
} 


async function parsePhotoRsp(rsp) {
    cardNames=["2c","2d","2h","2s","3c","3d","3h","3s","4c","4d","4h","4s","5c","5d","5h",
    "5s","6c","6d","6h","6s","7c","7d","7h","7s","8c","8d","8h","8s","9c","9d","9h","9s","10c","10d","10h","10s",
    "ac","ad","ah","as","bj","jc","jd","jh","js","kc","kd","kh","ks","qc","qd","qh","qs"]
    themeCards = [];

    for (let i = 0; i < rsp.photos.photo.length; i++) {
    photo = rsp.photos.photo[i];
    url = `https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}_b.jpg`;
    let themeCard = await processImage(url, cardNames[i]);
    let jsonCard = {name: `${cardNames[i]}`, buffer: `${themeCard}`}
     themeCards.push(jsonCard);
    }


    await redisClient.setEx(cardKey, 3600, JSON.stringify({source: "Redis Cache", themeCards}))

    return themeCards;

}

// function createPage(title,rsp) {
//     const number = rsp.photos.photo.length;
//     parsePhotoRsp(rsp);
//     //Headers and opening body, then main content and close
//     const str = '<!DOCTYPE html>' +
//     '<html><head><title>Flickr JSON</title></head>' +
//     '<body>' +
//     '<h1>' + title + '</h1>' +
//     'Total number of entries is: ' + number + '</br>' +
//     '</body></html>';
//     return str;
// }



module.exports = router; 
