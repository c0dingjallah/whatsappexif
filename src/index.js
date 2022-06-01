// external packages
const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
var admin = require("firebase-admin");
var E = require('exif').ExifImage;
const urlUtil = require('url');
const extName = require('ext-name');
const path = require("path");
var fs = require('fs');
const fetch = require('node-fetch');


var imgtitle = "image2"

const projectId = 'image-verifier'
const keyFilename = 'C:\\Users\\Preferred Customer\\JsProjects\\getImageData\\image-verifier-0eedf87a63e1.json'

const bucketName = 'image-verifier.appspot.com';

// The path to your file to upload


// The new ID for your GCS file


// Imports the Google Cloud client library
const {Storage} = require('@google-cloud/storage');


var serviceAccount = require("C:\\Users\\Preferred Customer\\JsProjects\\getImageData\\image-verifier-firebase-adminsdk-svz9w-c5166eb2cb.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'gs://image-verifier.appspot.com'
});

// Creates a client
const storagee = new Storage({projectId, keyFilename});
// Start the webapp
const webApp = express();

// Webapp settings
webApp.use(bodyParser.urlencoded({
    extended: true
}));
webApp.use(bodyParser.json());

// Server Port
const PORT = process.env.PORT;

// Home route
webApp.get('/', (req, res) => {
    res.send(`Hello World.!`);
});

const WA = require('../helper-function/whatsapp-send-message');

// Route for WhatsApp
webApp.post('/whatsapp', async (req, res) => {

    let message = req.body.Body;
    let senderID = req.body.From;

    // console.log(message);
     console.log(req.body);
    console.log(String(req.body.MediaUrl0));
  

      // eslint-disable-line
        const mediaUrl = req.body.MediaUrl0;
        const contentType = req.body.MediaContentType0;
        const extension = extName.mime(contentType)[0].ext;
        const mediaSid = path.basename(urlUtil.parse(mediaUrl).pathname);
        const filename = `${mediaSid}.${extension}`;

        console.log(filename);
  
        // mediaItems.push({ mediaSid, MessageSid, mediaUrl, filename });
        // saveOperations = mediaItems.map(mediaItem => SaveMedia(mediaItem));

        const fullPath = path.resolve(__dirname+"/"+filename);

        if (!fs.existsSync(fullPath)) {
          const response = await fetch(mediaUrl);
          const fileStream = fs.createWriteStream(fullPath);
  
         var stream = response.body.pipe(fileStream);
            console.log(response);   
            console.log(fullPath);

            var image1 = "src/"+filename;
            
          
        }
      
        stream.on('finish', function () {  
    try {
        new E({image : image1}, function(error, exifData){
    
          const filePath = image1;

            if(error)
                console.log('Error: '+error.message);
            else
                console.log('Original:'+exifData.exif.DateTimeOriginal);
    
                const destFileName = exifData.exif.DateTimeOriginal;
                            // 'file' comes from the Blob or File API
    
                            async function uploadFile() {
                              await storagee.bucket(bucketName).upload(filePath, {
                                destination: destFileName+'.jpg',
                              });
                            
                              console.log(`${filePath} uploaded to ${bucketName}`);
    
                              admin.firestore().collection('images').add({
                                image: exifData.exif.DateTimeOriginal,
                                title: imgtitle
                                });
                            }
                            
                            uploadFile().catch(console.error);
    
        });
    }   catch (error){
            console.log('Error: '+error.message)
    }

  });
  
    // Write a function to send message back to WhatsApp
  //  await WA.sendMessage('Hello from the other side.', senderID);

});

// Start the server
webApp.listen(PORT, () => {
    console.log(`Server is up and running at ${PORT}`);
});