import React from 'react';
import {NavLink} from 'react-router-dom';
import './main-nav.css';
import LoginContext from '../../context/login-context';

const mainNav = props => (
    <LoginContext.Consumer>{(context)=>{
       return( <header className ="main-nav">
    <div className ="main-nav_logo">
        <h1>HackYeah!</h1>
    </div>
    <nav className="main-nav_item">
    <ul>
        {!context.token && 
        <li>
            <NavLink to="/login">Login</NavLink>
        </li> }
        <li>
            <NavLink to="events">Hackathons</NavLink>
        </li>
       {context.token &&  (
       <React.Fragment>  
       <li>
            <NavLink to="bookings">Bookings</NavLink>
        </li>
        <li>
            <button onClick={context.logout}>Logout</button>
        </li>
       </React.Fragment>  )}
    </ul>
    </nav>
</header>
    )}}
</LoginContext.Consumer>
);

export default mainNav;