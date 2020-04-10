const Event = require('../../model/event');
const bcrypt = require('bcryptjs');
const User = require('../../model/user');
const Booking = require('../../model/booking');
const jwt = require('jsonwebtoken');

const DataLoader = require('dataloader');

const eventLoader = new DataLoader((eventIds)=>{
    return events(eventIds);
});

const userLoader = new DataLoader((userIds)=>{
    return User.find({_id:{$in:userIds}});
});

//helper function for returning the events data
const returnEvent = event =>{
    return {...event._doc, 
            date: new Date(event._doc.date).toISOString(), 
            creator: user.bind(this, event._doc.creator)
        };
}

const returnBooking = booking =>{
    return {...booking._doc,
        user: user.bind(this, booking._doc.user),
        event: singleEvent.bind(this, booking._doc.event),
        createdAt: new Date(booking._doc.createdAt).toISOString(), 
        updatedAt: new Date(booking._doc.updatedAt).toISOString()
    };
}


// events and user function are used to set dynamic relations between the events (creator[userid] from user) and users (createdEvents(userid) from events]
const events = async eventIds =>{
    try{
    const events = await Event.find({_id: {$in:eventIds}});
    events.sort((a,b)=>{
        return eventIds.indexOf(a._id.toString()) - eventIds.indexOf(b._id.toString());
    });
     return events.map(event =>{
            return returnEvent(event);
        });
        } catch(err){
        throw err;
    }
} 

const user = async userId =>{
    try{
        const user = await userLoader.load(userId.toString());
        return {...user._doc, createdEvents: ()=>eventLoader.loadMany(user._doc.createdEvents)};
    }catch(err){
        throw err;
    }
}

const singleEvent = async eventId =>{
    try{
        const event = await eventLoader.load(eventId.toString());
        return event;
    }catch(err){throw err;}
}



module.exports = { 
    events: async ()=>{
        try{
       const events = await Event.find();
            return events.map(event =>{
                return returnEvent(event);
            });
        }catch(err){
            throw err;
        }
    },
    bookings: async (args, req)=>{
        if(!req.isAuth){
            throw new Error('Unauthenticated!!');
        }
        try{
            const bookings = await Booking.find({user: req.userId});
            return bookings.map(booking=>{
                return returnBooking(booking);
            });
        }catch(err){throw err;}
    },
    createEvent: async (args,req) =>{
        if(!req.isAuth){
            throw new Error('Unauthenticated!!');
        }
        const event = new Event({
            title: args.eventInput.title,
            description:args.eventInput.description,
            fees: +args.eventInput.fees,
            date: new Date(args.eventInput.date),
            creator: req.userId
        });
        try{
        const result = await event.save();
            let createdEvent = returnEvent(result);
            const creator = await User.findById(req.userId);

            if(!creator){
               throw new Error('User not found.');
           }
           creator.createdEvents.push(event);
           await creator.save();
           return createdEvent;
        }catch(err){
            throw err;
        }
    },

    addUser: async args =>{
        try{
       const checkUser = await User.findOne({email: args.userInput.email});
            if(checkUser){
                throw new Error('User exists.')
            }
            const hashedpwd = await bcrypt.hash(args.userInput.password, 12);
            const user = new User({
                email: args.userInput.email,
                password: hashedpwd
            });
        const result = await user.save();
        return {...result._doc, password: null};
        }            
        catch(err){
            throw err;
        }
    },

    login: async ({email, password}) =>{
        const user = await User.findOne({email: email});
        if(!user){
            throw new Error('User does not exists!');
        }
       const checkPwd =  await bcrypt.compare(password, user.password);
       if(!checkPwd){
           throw new Error('Password is incorrect!');
       }
       const token = jwt.sign({userId: user.id, email: user.email}, 'secretkey', {expiresIn: '1h'});
       return {userId: user.id, token: token, tokenExpire: 1};
    },
    registerEvent: async (args,req) =>{
        if(!req.isAuth){
            throw new Error('Unauthenticated!!');
        }
        console.log(args.eventID);
        
        const fetchEvent = await Event.findOne({_id: args.eventID});
        const booking = new Booking({
            user: req.userId,
            event: fetchEvent
        });
        const result = await booking.save();
        return returnBooking(result);
    },
    cancelRegisteration: async (args,req) =>{
        if(!req.isAuth){
            throw new Error('Unauthenticated!!');
        }
        try{
            console.log(args);
            const booking = await Booking.findById(args.bookingId).populate('event');
            const event = returnEvent(booking.event);
            await Booking.deleteOne({_id:args.bookingId});
            return event;
        }catch(err){throw err;}
    }
}