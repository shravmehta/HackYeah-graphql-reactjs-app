import React, {Component} from 'react';
import LoginContext from '../context/login-context';
import Spinner from '../components/spinner/spinner';
import BookingList from '../components/bookings/booking-list';

class BookingsPage extends Component{
    state ={
        isLoad: false,
        bookings: []
    }

    static contextType = LoginContext;

    componentDidMount(){
        this.getBookings();
    }

    getBookings = () => {
        this.setState({isLoad: true});
        const reqBody = {
            query: `
            query{
                bookings{
                    _id
                    createdAt
                    event{
                        _id
                        title
                        date
                    }
                }
            }
            `
        };
        fetch('http://localhost:3001/graphql', {
            method:'POST',
            body: JSON.stringify(reqBody),
            headers:{
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.context.token
            }
        }).then(res=>{
            if(res.status !== 200 && res.status !== 201){
                throw new Error('Failed to get data.');
            }
            return res.json();
        }).then(data =>{
            const bookings = data.data.bookings;
            this.setState({bookings:bookings, isLoad:false});
        }).catch(err =>{
            console.log(err);
            this.setState({isLoad:false});
        });
    }

    DeleteHandler = bookingId =>{
        this.setState({isLoad: true});
        const reqBody = {
            query: `
            mutation{
                cancelRegisteration(bookingId:"${bookingId}"){
                    _id
                    title
                }
            }
            `
        };
        fetch('http://localhost:3001/graphql', {
            method:'POST',
            body: JSON.stringify(reqBody),
            headers:{
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.context.token
            }
        }).then(res=>{
            if(res.status !== 200 && res.status !== 201){
                throw new Error('Failed to get data.');
            }
            return res.json();
        }).then(data =>{
            this.setState(prev =>{
                const updateBooking = prev.bookings.filter(booking=>{
                    return booking._id !== bookingId;
                });
                return {bookings: updateBooking, isLoad:false};
            });
        }).catch(err =>{
            console.log(err);
            this.setState({isLoad:false});
        });
    };

    render(){
        return (
        <React.Fragment>
            {this.state.isLoad ? <Spinner/> : <BookingList bookings={this.state.bookings} onDelete={this.DeleteHandler}/>}
        </React.Fragment>
        );
    }
}

export default BookingsPage;