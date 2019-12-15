var express = require('express');
var Event = require('./model/event');
var User = require('./model/user');
var Booking = require('./model/eventBooking');
var bodyParser = require('body-parser');
var bcrypt = require('bcryptjs'); //using to hash the user password
var jwt = require('jsonwebtoken'); //using this to store the token on the client side
var expressgraphQl = require('express-graphql');
const {buildSchema} = require('graphql');
var mongoose = require('mongoose');
var app = express();


app.use(bodyParser.json());


var events= eventids =>{
    return Event.find({_id: {$in: eventids}}).then(events =>{
        return events.map(event =>{
            return {...event._doc, _id: event.id,date: new Date(event._doc.date).toISOString(), creator: user.bind(this, event.creator)}
        })
    }).catch(err=>{
        throw err;
    })
}
var singleEvent = async eventid =>{
    try{
        const event = await Event.findById(eventid);
        return{...event._doc, _id: event.id, creator:user.bind(this,event.creator)};
    }catch(err){
        throw err;
    }
}
var user = userid =>{
    return User.findById(userid).then(user =>{
        return {...user._doc, _id: user.id, createdEvents: events.bind(this, user._doc.createdEvents)};
    }).catch(err=>{
        throw err;
    })
}

var authorization = function(req,res,next){
    var header = req.get('Authorization');
    console.log(header);
    
    // if there is authorization field then the user is not logged in 
    if(!header){
        req.Auth = false;
        return next();
    }
    var token = header.split(' ')[1];
    //if there is no token that means the user is not authenticated
    if(!token || token === ''){
        req.Auth = false;
        return next();
    }
    try{
        //token and authorization field exists so we can verify the user using our secret jwt key
       var verfiedtoken = jwt.verify(token, 'secretjwt'); 
    }catch(err){ req.Auth = false; return next();}
    if(!verfiedtoken){
        req.Auth = false;
        return next();
    }
    req.Auth = true;
    console.log(req.userId);
    console.log(verfiedtoken.userId);
    
    req.userId = verfiedtoken.userId;
    next();
}
//setting the request header allowed by the server for CORS
app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Methods','POST,GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers','Content-Type, Authorization');
    if(req.method ==="OPTIONS"){
        return res.sendStatus(200);
    }
    next();
});
app.use(authorization); //intializing the middleware function
app.use('/graphql',expressgraphQl({
    schema:buildSchema(`
        type Booking{
            _id: ID!
            event: Event!
            user: User!
            createdAt: String!
            updatedAt: String!
        }
        type Event{
            _id: ID!
            title: String!
            details: String!
            price: Float!
            date: String!
            creator: User!
         }
         type User{
             _id: ID!,
             email: String!,
             password: String,
             createdEvents:[Event!]
         }
         type loginData{
             userId: ID!
             token: String!
             tokenExpiration: Int!
         }
         input InputData{
            title: String!,
            details: String!,
            price: Float!,
            date: String!
         }
         input UserInput{
            email: String!,
            password: String! 
         }
        type rootQuery {
            events: [Event!]!
            bookings: [Booking!]!
            login(email: String!, password: String!): loginData!
        }
        type rootMutation {
            createEvent(inputData: InputData): Event
            addUser(userInput: UserInput): User
            bookEvent(eventId: ID!): Booking!
            cancelEvent(bookingId: ID!): Event!
        }
        schema {
            query: rootQuery
            mutation: rootMutation
        }
    `),
        rootValue:{
            events: ()=>{
                return Event.find().then(events=>{
                    //fixing the null data returned by creating the creator array which returns the doc and id of creator
                     return events.map(event =>{return{...event._doc, _id: event.id,date: new Date(event._doc.date).toISOString(), creator:user.bind(this, event._doc.creator)}})
                 }).catch((err)=>{
                     console.log(err);
                     throw err;
                 });
             },bookings: async(req)=>{
                
                 try{
                    var bookings = await Booking.find();
                    return bookings.map(booking=>{
                        return{...booking._doc, _id: booking.id,user: user.bind(this,booking._doc.user), event:singleEvent.bind(this, booking._doc.event),
                             createdAt: new Date(booking._doc.createdAt).toISOString(),updatedAt: new Date(booking._doc.createdAt).toISOString()};
                    })
                 } catch(err){
                     throw err;
                 }
             },
             createEvent: (args,req) =>{
                 console.log(req.Authorization +"auth code req");
                 
                 if(!req.authorization){
                     throw new Error('Unauthenticated access. Please login!');
                 }
                var event = new Event({
                    title: args.inputData.title,
                    details:args.inputData.details,
                    price: +args.inputData.price,
                    date: new Date(args.inputData.date),
                    creator: [req.userId, req.email]
                });
                var createdEvent =[];
                return event.save().then(result =>{
                    createdEvent ={...result._doc, id: result._doc._id.toString(),date: new Date(event._doc.date).toISOString(), creator:user.bind(this,result._doc.creator)}; //replacing the result of creator with the data from databse
                    return User.findById(req.userId)
                }).then(user=>{
                    if(!user){throw new Error('User not found');}
                    user.createdEvents.push(event);
                    return user.save();
                    }).then(result =>{
                        return createdEvent;
                    })
                  
                .catch(err=>{
                   console.log(err);
                   throw err;
               });
            },  addUser: args =>{
                //checks if the user exists in the DB or not
                return User.findOne({email:args.userInput.email}).then(user=>{
                    if(user){
                        throw new Error('User exists.');
                    }
                    //runs when there is no user in DB
                    return bcrypt.hash(args.userInput.password,12);
                }).then(hashedPass =>{
                    var user = new User({

                        email: args.userInput.email,
                        password: hashedPass
                    });
                    return user.save();
                }).then(result =>{
                    return{...result._doc, _id: result.id};
                }).catch(err=>
                    { throw err;});
                },
                bookEvent: async (args,req) =>{
                    if(!req.authorization){
                        throw new Error('Unauthenticaed acess. Please login');
                    }
                    var fetchedEvent = await Event.findOne({_id: args.eventId});
                    var booking = new Booking({
                        user: req.userId,
                        event: fetchedEvent
                    });
                    var result = await booking.save();
                    return{...result._doc, _id: result.id, user: user.bind(this,result._doc.user), event:singleEvent.bind(this, result._doc.event),createdAt:new Date(result._doc.createdAt).toISOString(), updatedAt:new Date(result._doc.updatedAt).toISOString()}
                    },
                cancelEvent: async (args,req) =>{
                    if(!req.authorization){
                        throw new Error('Unauthenticaed acess. Please login');
                    }
                    try{
                        var booking = await Booking.findById(args.bookingId).populate('event');
                        var event ={...booking.event._doc, _id: booking.event.id, creator: user.bind(this, booking.event._doc.creator)};
                        await Booking.deleteOne({_id: args.bookingId});
                        return event;
                    }catch(err){
                        throw err;
                    }
                },
                login: async({email, password}) =>{
                    var user = await User.findOne({email: email});
                    
                    if(!user){
                        throw new Error("User doesnt exist");
                    }
                   var check =  await bcrypt.compare(password,user.password);
                   console.log(password +"pass");
                   console.log(user.password +"check");
                   
                   
                   if(!check){
                       throw new Error(' Incorrect Password.');
                   }
                  var token = jwt.sign({userID: user.id, email: user.email},'secretjwt'); //initializing jwt token
                  return {userId: user.id, token: token, tokenExpiration: 1}
                }
            },
                graphiql: true
        })
);    


mongoose.connect(`mongodb+srv://shrav:0S6ceNdJG1cp0Bne@eventsdatacluster-si5ri.mongodb.net/EventDB?retryWrites=true&w=majority`).then(()=>{
    app.listen('5000');
    console.log("listening at 5000 and connected to mongoDB");
    
}).catch(err=>{
    console.log(err);   
});



// mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@eventsdatacluster-si5ri.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`,{ useNewUrlParser: true },{ useUnifiedTopology: true })
// .then(()=>{
//     app.listen('5000');
//     console.log("listening at 5000 and connected to mongoDB");
    
// }).catch(err=>{
//     console.log("cannot connect");
//     console.log(err);
    
// });
