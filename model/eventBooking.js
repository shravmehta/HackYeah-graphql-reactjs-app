var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var eventBookingSchema = new Schema(
    {
    event: {
        type: Schema.Types.ObjectId,
        ref: 'Event' //reference to eventSchema
    },
    User:{
        type: Schema.Types.ObjectId,
        ref: 'User' //reference to userSchema
    }
},
    {timestamps: true}
);

module.exports = mongoose.model('Booking', eventBookingSchema);