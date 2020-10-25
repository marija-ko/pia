const request = require("request");
const bodyParser = require("body-parser");


module.exports.recaptcha = (req, res) => {
    let token = req.body.recaptcha;
    const secretKey = "6LdGsbwZAAAAALbc3wbgEu1WVaKBCYWhiDK452Aj";
      
    const url =  `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}&remoteip=${req.connection.remoteAddress}`
    
    console.log(`Recaptcha token ${token}`)
    
    if(token === null || token === undefined){
      res.status(201).send({success: false, message: "Token is empty or invalid"})
      return console.log("token empty");
    }
    
    request(url, (err, response, body)=>{
      body = JSON.parse(body);
      
      if(body.success !== undefined && !body.success){
           res.send({success: false, 'message': "Recaptcha failed"});
           return console.log("failed")
       }
      
       if(err) console.log('Recaptcha error')

       res.send({"success": true, 'message': "Recaptcha passed"});
      
    })
  
}