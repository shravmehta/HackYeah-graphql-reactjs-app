import React from 'react';
import EventItem from './event-item';
import './event-list.css';

const eventList = props =>{
    const events = props.events.map(event=>{
        return (
            <EventItem key={event._id} 
            eventId = {event._id} 
            title={event.title}
            fees = {event.fees}
            date={event.date} 
            userId ={props.loginUserId} 
            creatorId ={event.creator._id}
            onDetail ={props.onViewDetail}/>
        );
    });
    return (<ul className="event-list">
    {events}
    </ul>);
};

export default eventList;