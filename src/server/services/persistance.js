require("dotenv").config();
const AWS = require("aws-sdk");
const redis = require("redis");

//Setup S3
const bucketName = "card-deck-generator";
const s3 = new AWS.S3({ apiVersion: "2006-03-01", region: "ap-southeast-2" });


//Set up redis
const redisClient = redis.createClient();
(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.log(err);
  }
})();

async function addToS3AndRedis(themeCards, cardKey){
    //Add to S3
    const body = JSON.stringify({ source: "S3 Bucket", themeCards });
    const objectParams = { Bucket: bucketName, Key: cardKey, Body: body };
    try{
      await s3.putObject(objectParams).promise();
      console.log(`Successfully uploaded data to AWS to ${bucketName}/${cardKey}`);
    }
    catch (err){
      if (err.code === "NoSuchBucket"){
        try {
          await s3.createBucket({ Bucket: bucketName }).promise();
          console.log(`Created Bucket: ${bucketName}`);
          await s3.putObject(objectParams).promise();
          console.log(`Successfully uploaded data to AWS to ${bucketName}/${cardKey}`);
        } catch (err) {
          if (err.statusCode != 409) {
            console.log(`Error creating bucket: ${err}`);
          }
        }
      }
    }
    //Add to Redis
    await redisClient.setEx(
        cardKey,
        300,
        JSON.stringify({ source: "Redis Cache", themeCards })
    );
    console.log(`Successfully uploaded data to redis ${cardKey}`);
    }

async function getFromS3(s3Params, cardKey){
  const s3Result = await s3.getObject(s3Params).promise();
  const s3JSON = JSON.parse(s3Result.Body);
  let responseJSON = JSON.parse(s3Result.Body);
  let jsonThemeCards = responseJSON;
  // Add to redis
  await redisClient.setEx(
    cardKey,
    300,
    JSON.stringify({ source: "Redis Cache", ...jsonThemeCards })
  );
  console.log("Getting cards from the S3 Cache");
  
  return(s3JSON.themeCards)
}

async function isItInRedis(){
    return await redisClient.get(cardKey);
}

async function isItInS3(){
    const s3Params = { Bucket: bucketName, Key: cardKey };
    return await getFromS3(s3Params, cardKey);
}

module.exports = {addToS3AndRedis,  isItInRedis, isItInS3};
