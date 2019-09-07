import './App.css';
import firebase from 'firebase'
import Home from './component/Home'
import React, {Component} from 'react';
import {Route, Switch, Redirect} from 'react-router-dom'
import fireInitialize from './config/fire'

class App extends Component{
  constructor(props){
    super(props)
    this.state = {
      phoneNumber: '',
      otp: false,
      otpSuccess: false,
      userCode: '',
      forgotBtn: true
    }
  }

  phoneValidation = () => {
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
      'size': 'invisible',
      'callback': function(response) {
      }
    });
    let phoneNumber = this.state.phoneNumber
    let appVerifier = window.recaptchaVerifier
    fireInitialize.auth().signInWithPhoneNumber(phoneNumber, appVerifier)
        .then(confirmationResult => {
          if(confirmationResult){
            this.setState({
              otp: true
            })
          }
          window.confirmationResult = confirmationResult
        })
        .catch(function (error) {
          console.log('Error!!: ', error)
        });
  }

  handleChange = (e) => {
    const {value, name} = e.target
    this.setState({
      [name]: value
    })
  }

  useOtp = () => {
    window.confirmationResult.confirm(this.state.userCode)
    .then(result => {
      this.setState({
        otpSuccess: true
      })
      console.log('Success OTP:', result)
    }).catch(error => {
      console.log('Error!!: ', error)
    });
  }

  render(){
    const {otp, otpSuccess, userCode, forgotBtn} = this.state
    return (
      <div className="App">
        <Switch>
          <Route path='/' render={
            () => otpSuccess ? <Home /> : <Redirect
              to={{
                pathname:'/login'
              }}
            />
          }/>
          <Route path='/login' Component={Home} />
        </Switch>
        {forgotBtn && !otp ? <h2 className='fotgotPass' onClick={() => {this.setState({forgotBtn: false})}}>Forgot Password?</h2> : <>
          {!otp && 
          <div className='loginApp'>
            <input onChange={this.handleChange} name='phoneNumber' type='tel' value={this.state.phoneNumber} autoFocus={true} placeholder='Enter your phone number' />
            <button onClick={this.phoneValidation}>Login</button>
            <div id="recaptcha-container"></div>
          </div>}
          {otp &&
          <>
            <input type='text' value={userCode} onChange={this.handleChange} name='userCode' />
            <button onClick={this.useOtp}>Reset</button>
          </>}
        </>}
      </div>
    );
  }
}

export default App;
