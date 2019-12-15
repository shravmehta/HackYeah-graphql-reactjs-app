var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
   email:{
       type: String,
       required: true
   },
   password:{
       type: String,
       required: true
   },
   //stored events on user side
   createdEvents:[
       {
           type: Schema.Types.ObjectId, //returns the objectID defined by mongodb
           ref: 'Event' //reference to the event model and let mongoose merge the databases

       }
   ]
});

module.exports = mongoose.model('User', userSchema);