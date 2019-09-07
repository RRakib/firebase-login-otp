import './App.css';
import firebase from 'firebase'
import Home from './component/Home'
import React, {Component} from 'react';
import {Route, Switch, Redirect, Link} from 'react-router-dom'
import fireInitialize from './config/fire'

class App extends Component{
  constructor(props){
    super(props)
    this.state = {
      phoneNumber: '',
      otp: false,
      otpSuccess: false,
      userCode: '',
      forgotBtn: true,
      errors: '',
      loginSuccess: false
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
    const {password, confirmPass} = this.state
    this.setState({
      [name]: value
    }, () => {
      if (name === 'confirmPass' && password !== value){
        localStorage.setItem('password', password)
        this.setState({
          errors: 'Password Did Not Match'
        })
      } else {
        this.setState({
          errors: ''
        })
      }
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
      this.setState({
        errors: 'Wrong Code!'
      })
    });
  }

  login = () => {
    if(this.state.confirmPass === localStorage.getItem('password')){
      this.setState({
        loginSuccess: true
      })
    }
  }

  render(){
    const {otp, otpSuccess, userCode, forgotBtn, confirmPass, password, errors, loginSuccess, passwordCheck} = this.state
    return (
      <div className="App">
        <Switch>
          <Route path='/home' render={
            () => otpSuccess && loginSuccess ? <Home /> : <Redirect
              to={{
                pathname:'/'
              }}
            />
          }/>

          <Route exact path='/' Component={App} />
        </Switch>
        {(!otpSuccess || !loginSuccess) && <>
        {forgotBtn && !otp ? <h2 className='fotgotPass' onClick={() => {this.setState({forgotBtn: false})}}>Forgot Password?</h2> : <>
          {!otp && 
          <div className='loginApp'>
            <input onChange={this.handleChange} name='phoneNumber' type='tel' value={this.state.phoneNumber} autoFocus={true} placeholder='Enter your phone number' />
            <button onClick={this.phoneValidation}>Get Code</button>
            <div id="recaptcha-container"></div>
          </div>}
          {!otpSuccess ? otp &&
          <>
            <div className='loginApp2'>
              {errors && <p>{errors}</p>}
              <input type='text' value={userCode} onChange={this.handleChange} name='userCode' autoFocus={true} placeholder='Enter the code'/>
              <input type='password' value={password} onChange={this.handleChange} name='password' placeholder='Enter Password'/>
              <input type='password' value={confirmPass} onChange={this.handleChange} name='confirmPass' placeholder='Confirm Password'/>
              <button onClick={this.useOtp}>Reset</button>
            </div>
          </> : <div className='loginApp2'>
              <input type='text' placeholder='Enter Your Name'/>
              <input type='password' value={passwordCheck} onChange={this.handleChange} name='passwordCheck' placeholder='Enter Password'/>
              <button onClick={this.login}><Link to='/home'>Log In </Link></button>
          </div>}
        </>}
        </>}
      </div>
    );
  }
}

export default App;
