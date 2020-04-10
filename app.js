const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const mongoose = require('mongoose');

const graphSchema = require('./API/schema/index');
const graphResolvers = require('./API/resolvers/index');
const Auth = require('./API/middleware/auth');
const app = express();

app.use(bodyParser.json());
app.use((req,res,next)=>{
   res.setHeader('Access-Control-Allow-Origin','*');
   res.setHeader('Access-Control-Allow-Methods','POST,GET,OPTIONS');
   res.setHeader('Access-Control-Allow-Headers','Content-Type,Authorization');
   if (req.method === 'OPTIONS'){
       return res.sendStatus(200);
   }
   next();
});
app.use(Auth);



app.use('/graphql', graphqlHttp({
    schema: graphSchema,
    rootValue: graphResolvers,
    graphiql: true
}));

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PWD}@eventsdatacluster-si5ri.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`)
.then(()=>
{
    app.listen(3001);
    console.log("we are connected");
    
}).catch(
    err =>{console.log(err);
    }
);


