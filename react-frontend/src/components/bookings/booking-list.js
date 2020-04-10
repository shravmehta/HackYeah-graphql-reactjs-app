import React from 'react';
import './booking-list.css';
const bookingList = props => (
    <ul className="booking-list"> 
        {props.bookings.map(booking=>{
            return (<li className= "booking-item" key={booking._id}>
                <div className="booking-item-data">
                {booking.event.title} - {new Date(booking.createdAt).toLocaleDateString()}
                </div>
                <div className="booking-item-actions">
                    <button className="btn" onClick={props.onDelete.bind(this,booking._id)}>Cancel</button>
                </div>
            </li>
            );
        })}
    </ul>
);

export default bookingList;