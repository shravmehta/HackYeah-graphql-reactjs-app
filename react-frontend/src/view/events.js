import React, {Component} from 'react';
import Modal from '../components/modal/modal';
import Backdrop from '../components/backdrop/backdrop';
import LoginContext from '../context/login-context';
import EventList from '../components/events/event-list';
import Spinner from '../components/spinner/spinner';
import '../css/events.css';

class EventsPage extends Component{
    state ={
        start: false,
        events: [],
        isLoad: false,
        selectedEvent: null
    };

    isActive = true;

    static contextType = LoginContext;

    constructor(props){
        super(props);
        this.titleElementRef = React.createRef();
        this.feesElementRef = React.createRef();
        this.dateElementRef = React.createRef();
        this.descriptionElementRef = React.createRef();
    }

    startEventHandler = () =>{
        this.setState({start: true});
    };

    componentDidMount(){
        this.getEvents();
    }
    confirmHandler = () =>{
        this.setState({start:false});
        const title = this.titleElementRef.current.value;
        const fees = +this.feesElementRef.current.value;
        const date = this.dateElementRef.current.value;
        const description = this.descriptionElementRef.current.value;
        if(title.trim().length === 0 || fees <= 0 || date.trim().length === 0 || description.trim().length === 0){
            return;
        }
        const event = {title,fees, date, description};
        console.log(event);

        const reqBody = {
            query: `
            mutation{
                createEvent(eventInput : {title:"${title}", description:"${description}", fees:${fees}, date:"${date}"}){
                    _id
                    title
                    description
                    fees
                    date
                }
            }
            `
        };

        const token = this.context.token;
         
        fetch('http://localhost:3001/graphql', {
            method:'POST',
            body: JSON.stringify(reqBody),
            headers:{
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        }).then(res=>{
            if(res.status !== 200 && res.status !== 201){
                throw new Error('Failed to send data.');
            }
            return res.json();
        }).then(data =>{
           this.setState(prev =>{
               const updateEvents = [...prev.events];
               updateEvents.push({
                _id: data.data.createEvent._id,
                title: data.data.createEvent.title,
                description: data.data.createEvent.description,
                fees : data.data.createEvent.fees,
                date : data.data.createEvent.date,
                creator: {
                    _id: this.context.userId,
                }
               });
              return {events: updateEvents}; 
           });
           
        }).catch(err =>{
            console.log(err);  
        });
        
        
    };

    cancelHandler = () =>{
        this.setState({start:false, selectedEvent: null});
    }

    getEvents() {
        this.setState({isLoad: true});
        const reqBody = {
            query: `
            query{
                events{
                    _id
                    title
                    description
                    fees
                    date
                    creator {
                        _id
                        email
                    }
                }
            }
            `
        };
        fetch('http://localhost:3001/graphql', {
            method:'POST',
            body: JSON.stringify(reqBody),
            headers:{
                'Content-Type': 'application/json'
            }
        }).then(res=>{
            if(res.status !== 200 && res.status !== 201){
                throw new Error('Failed to get data.');
            }
            return res.json();
        }).then(data =>{
            const events = data.data.events;
            if(this.isActive){
            this.setState({events:events, isLoad:false});
            }
        }).catch(err =>{
            console.log(err);
            if(this.isActive){
            this.setState({isLoad:false});
            }
        });
            
    };

    DetailHandler = eventId =>{
        this.setState(prev =>{
            const selectedEvent = prev.events.find(e=> e._id === eventId);
            return {selectedEvent: selectedEvent};
        });
    }

    registerEventHandler = () =>{
        if(!this.context.token){
            this.setState({selectedEvent: null});
        }
        const reqBody = {
            query: `
            mutation{
                registerEvent(eventID: "${this.state.selectedEvent._id}"){
                    _id
                    createdAt
                    updatedAt
                }
            }
            `
        };
        const token = this.context.token;
        fetch('http://localhost:3001/graphql', {
            method:'POST',
            body: JSON.stringify(reqBody),
            headers:{
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        }).then(res=>{
            if(res.status !== 200 && res.status !== 201){
                throw new Error('Failed!');
            }
            return res.json();
        }).then(data =>{
            console.log(data);
            this.setState({selectedEvent: null});
        }).catch(err =>{
            console.log(err);
        });
    };

    componentWillUnmount(){
        this.active = false
    }
    render(){
        return (
            <React.Fragment>
            {(this.state.start || this.state.selectedEvent) && <Backdrop/>}
            {this.state.start && <Modal title="Add Hackathon" canCancel canConfirm onCancel ={this.cancelHandler} onConfirm ={this.confirmHandler} confirmText = "Confirm">
                <form>
                    <div className="form-control">
                        <label htmlFor="title">Title</label>
                        <input type="text" id="title" ref={this.titleElementRef}></input>
                    </div>
                    <div className="form-control">
                        <label htmlFor="fees">Entrance Fees</label>
                        <input type="number" id="fees" ref={this.feesElementRef}></input>
                    </div>
                    <div className="form-control">
                        <label htmlFor="date">Date</label>
                        <input type="datetime-local" id="date" ref={this.dateElementRef}></input>
                    </div>
                    <div className="form-control">
                        <label htmlFor="description">Description</label>
                        <textarea id="desc" rows="4" ref={this.descriptionElementRef}></textarea>
                    </div>
                </form>
            </Modal>}
           
            {this.state.selectedEvent && (<Modal 
            title={this.state.selectedEvent.title} 
            canCancel 
            canConfirm 
            onCancel ={this.cancelHandler} 
            onConfirm ={this.registerEventHandler}
            confirmText = {this.context.token ? 'Register':'Confirm'}>
            <h1>{this.state.selectedEvent.title}</h1>
            <h2>${this.state.selectedEvent.fees} - {new Date(this.state.selectedEvent.date).toLocaleDateString()}</h2>
            <p>{this.state.selectedEvent.description}</p>
            </Modal>)}

            {this.context.token && <div className="event-control">
                <p> Let's Hack! Create your events.</p>
                <button className="btn" onClick={this.startEventHandler}>Create Event</button>
            </div>}
            {this.state.isLoad ? <Spinner/> : <EventList events = {this.state.events} loginUserId ={this.context.userId} onViewDetail = {this.DetailHandler}/>}
           
            </React.Fragment>
        );
    }
}

export default EventsPage;