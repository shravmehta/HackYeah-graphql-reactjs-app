import React, {Component} from 'react';

import '../css/login.css';
import loginContext from '../context/login-context';

class LoginPage extends Component{
    state = {
        isLogin: true
    };

    static contextType = loginContext;
    constructor(props){
        super(props);
        this.emailElement = React.createRef();
        this.passElement = React.createRef();
    }

    switchHandler =() =>{
        this.setState(prevState=>{
            return {isLogin : !prevState.isLogin};
        })
    };
    loginHandler =(event)=>{
        event.preventDefault();
        const email = this.emailElement.current.value;
        const password = this.passElement.current.value;

        if(email.trim().length === 0 || password.trim().length === 0){
            return;
        }
        let reqBody = {
            query: `
            query{
                login(email:"${email}", password:"${password}"){
                    userId
                    token
                }
            }
            `
        };

        if(!this.state.isLogin){
            reqBody = {
                query:`
                mutation{
                    addUser(userInput:{email:"${email}", password:"${password}"}){
                        _id
                        email
                    }
                }
                `
            };
        }
         
        fetch('http://localhost:3001/graphql', {
            method:'POST',
            body: JSON.stringify(reqBody),
            headers:{
                'Content-Type': 'application/json'
            }
        }).then(res=>{
            if(res.status !== 200 && res.status !== 201){
                throw new Error('Failed to send data.');
            }
            return res.json();
        }).then(data =>{
            if(data.data.login.token){
                this.context.login(data.data.login.token, data.data.login.userId, data.data.login.tokenExpiration);
            }
            
        }).catch(err =>{
            console.log(err);
            
        });
        
    };
    render(){
        return <form className="login-form" onSubmit={this.loginHandler}>
        <div className="login-control">
            <label htmlFor="email">E-Mail</label>
            <input type="email" id="email" ref={this.emailElement}/>
        </div>
        <div className="login-control">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" ref={this.passElement}/>
        </div>
        <div className="login-actions">
            <button type="submit">Let's Hack!</button>
            <button type="button" onClick={this.switchHandler}>{this.state.isLogin ? 'Signup' : 'Login'}</button>
        </div>
        </form>;
    }
}

export default LoginPage;