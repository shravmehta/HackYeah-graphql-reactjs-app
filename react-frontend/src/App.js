import React, {Component} from 'react';
import {BrowserRouter, Route, Redirect, Switch} from 'react-router-dom';
import LoginPage from './view/login';
import BookingsPage from './view/bookings';
import EventsPage from './view/events';
import MainNav from './components/navigation/main-nav';
import LoginContext from './context/login-context';

import './App.css';


class App extends Component{
  state = {
    token: null,
    userId: null
  }
  login =(token, userId, tokenExpiration) =>{
    this.setState({token:token, userId: userId});
  };
  logout = () =>{
    this.setState({token: null, userId: null});
  };

  render(){
  return (
      <BrowserRouter>
      <React.Fragment>
      <LoginContext.Provider value={{token: this.state.token, userId: this.state.userId, login: this.login, logout: this.logout}}>
      <MainNav/>
      <main className="main-content">      
      <Switch>
      
      {this.state.token && <Redirect from="/" to="/events" exact/>}
      {this.state.token && <Redirect from="/login" to="/events" exact/>}
      {!this.state.token && <Route path="/login" component = {LoginPage} />}
      <Route path="/events" component = {EventsPage} />
      {this.state.token && <Route path="/bookings" component = {BookingsPage} />}
      {!this.state.token && <Redirect to="/login" exact/>}
      </Switch>
      </main>
      </LoginContext.Provider>
      </React.Fragment>
      </BrowserRouter>
      
  );
}
}

export default App;
