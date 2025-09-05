import { useState, useEffect, useRef } from 'react'
import { useRoot } from '@hooks/RootProvider.jsx'
import { POST } from '@utils/Network.js'

const Login = () => {
  const { modalEvent, closeEvent, isValidEmail, setStorage } = useRoot()
  const [ accept, setAccept ] = useState(false)
  const emailRef = useRef(null)
  const submitEvent = () => {
    if(isValidEmail(emailRef.current.value)) {
      setAccept(true)
      const param = {email : emailRef.current.value, type : 2}
      POST("/oauth/user/email", param)
      .then(res => {
        if(res.status) {
          setStorage("code", JSON.stringify(param))
          setAccept(false)
          modalEvent("Email")
        } else {
          alert(res.message)
        }
      });
    } else {
      alert("이메일 형식으로 넣어 주실까요?")
    }    
  }
  return (
    <>
      <div className="overlay" onClick={closeEvent}></div>
      <section className="card modal">
        <div className="brand" style={{marginBottom: '6px'}}>
          <div className="brand__logo">HI</div>
          <div>
            <h2 id="loginTitle" className="brand__name">로그인</h2>
            <p id="loginDesc" className="subtitle">계정으로 PIXEL에 접속하세요.</p>
          </div>
        </div>

        <div className="field">
          <label htmlFor="email">이메일</label>
          <input type="email" id="email" name="email" className="input" ref={emailRef} placeholder="id@example.com" required />
        </div>
        <button className="btn" type="button" style={{width: '100%'}} onClick={submitEvent} disabled={accept}>이메일 인증</button>
        <p className="footer">계정이 없으신가요? <span style={{color: 'red', cursor: 'pointer'}} onClick={()=>modalEvent("SignUp")}>회원가입</span></p>
      </section>
    </>
  )
}

export default Login