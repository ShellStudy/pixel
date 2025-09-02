import { useState, useEffect, useRef } from 'react'
import { useRoot } from '@hooks/RootProvider.jsx'
import { POST, PUT } from '@utils/Network.js'

const SignUp = () => {
  const { modalEvent, closeEvent, isValidEmail } = useRoot()
  const [email, setEmail] = useState(false);
  const [isButton, setIsButton] = useState(true);
  const emailRef = useRef(null)
  
  const checkEmail = () => {
    if(isValidEmail(emailRef.current.value)) {
      POST("/oauth/user/email", {email : emailRef.current.value, type : 1})
      .then(res => {
        if(res.status) {
          setIsButton(false)
          setEmail(true)
        } else {
          alert(res.message)
          modalEvent("Login")
        }
      });
    } else {
      alert("이메일 형식으로 넣어 주실까요?")
    }
  }
  const submitEvent = (e) => {
    e.preventDefault();
    PUT("/oauth/user", {service: 1, email: emailRef.current.value, name: e.target.name.value, type: 1})
    .then(res => {
      if(res.status) {
        modalEvent("Login")
      } else {
        alert(res.message)
      }
    });
  }
  return (
    <>
      <div className="overlay" onClick={closeEvent}></div>
      <section className="card modal">
        <div className="brand">
          <div className="brand__logo" >HI</div>
          <div>
            <h1 id="title" className="brand__name">PIXEL 가입</h1>
            <p id="subtitle" className="subtitle">프롬프트로 이미지를 만들고 공유하세요.</p>
          </div>
        </div>

          <div className="field">
            <label htmlFor="email">이메일</label>
            <input type="email" id="email" name="email" className="input" placeholder="id@example.com" ref={emailRef} required readOnly={email} />
            {isButton && <button className="btn" type="button" style={{width: '100%'}} onClick={checkEmail}>중복확인</button>}
          </div>

          {email &&
          <form onSubmit={submitEvent} >
            <div className="field">
              <label htmlFor="name">사용자 이름</label>
              <input type="text" id="name" name="name" className="input" placeholder="홍길동" minLength="2" required />
              <button className="btn" type="submit" style={{width: '100%'}}>회원가입</button>
            </div>
          </form>
          }

          <p className="footer">이미 계정이 있으신가요? <span style={{color: 'red', cursor: 'pointer'}} onClick={()=>modalEvent("Login")}>로그인</span></p>
      </section>
    </>
  )
}

export default SignUp