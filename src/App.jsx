const App = () => {
  return (
    <div className="Login-container">
      <h1 className="form-title">Log in</h1>
      <p className="form-subtitle">By logging in, you agree to our <b> Terms of Use</b></p>
     
      <form action="#" className="login-form">
        <div className="input-wrapper">
          <p>Email</p>
          <input type="input-field" placeholder="Enter your email" className="input-field" required />
        <i1 className="material-symbols-rounded">mail</i1>
        </div>


        <div className="input-wrapper">
          <p>Password</p>
          <input type="input-field" placeholder="Enter your password" className="input-field" required />
        <i2 className="material-symbols-rounded">lock</i2>
        </div>
        <a href="#" className="forgot-password-link">Forgot password?</a>
        
        <button className="login-button">Connect</button>

      </form>

       <p className="sperator"><span>or</span></p>


 <div className="social-login">
        <button className="social-button">
          <img src="google.svg" alt="Google" className="social-icon" />
          Sign in with Google
        </button>
        <button className="social-button">
          <img src="wrench.svg" alt="Administrator" className="social-icon" />
          <a href="#" className="social-link">Sign in as Administrator</a>
        </button>
      
      </div>
      <p className="form-subtitle">For more information, see our <b>Privacy Policy</b></p>
    </div>
  

)
}
export default App 