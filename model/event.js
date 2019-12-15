var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var eventSchema = new Schema({
    event_title: {
        type: String,
        required: true
    },
    details: {
        type: String,
        required: true
    },
    price:{
        type: Number,
        required: true
    },
    date:{
        type: Date,
        required: true
    },
    creator:{
        type: Schema.Types.ObjectId, //returns the objectID defined by mongodb
        ref: 'User' //reference to the event model and let mongoose merge the databases
    }
});

module.exports = mongoose.model('Event', eventSchema);