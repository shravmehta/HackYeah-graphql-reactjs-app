import React from 'react';

import './event-item.css';

const eventItem = props =>(
    <li key={props._id} className="event-list-item">
        <div>
            <h1>{props.title}</h1>
            <h2>${props.fees} - {new Date(props.date).toLocaleDateString()}</h2>
        </div>
        <div>
            {props.userId === props.creatorId ? <p>Owner of this event.</p> : <button onClick={props.onDetail.bind(this,props.eventId)} className="btn">View</button>}
            
        </div>
    </li>
);

export default eventItem;