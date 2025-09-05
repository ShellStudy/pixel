import { useRoot } from '@hooks/RootProvider.jsx'
import { POST } from '@utils/Network.js'

const Email = () => {
  const { closeEvent, setStorage, getStorage, removeStorage } = useRoot()
  const codeEvent = () => {
    POST("/oauth/user/email", JSON.parse(getStorage("code")))
    .then(res => {
      if(res.status) {
        alert("Email를 확인해 주세요.")
      } else {
        alert(res.message)
      }
    })
  }
  const submitEvent = (e) => {
    e.preventDefault();
    POST("/oauth/user", {code : e.target.code.value})
    .then(res => {
      if(res.status) {
        if(setStorage("access", res.result)) {
          removeStorage("code")
          location.reload()
        }
      }else {
        alert(res.message);
      }
    });
  }
  return (
    <>
      <div className="overlay" onClick={closeEvent}></div>
    
      <section className="card modal">

        <div className="brand">
          <div className="brand__logo">AI</div>
          <div>
            <h1 id="title" className="brand__name">이메일 인증</h1>
            <p id="subtitle" className="subtitle">이메일 주소로 전송된 인증 코드를 입력해주세요.</p>
          </div>
        </div>

        <form onSubmit={submitEvent}>
          <div className="field">
            <label htmlFor="code">인증 코드</label>
            <input type="text" id="code" name="code" className="input" placeholder="6자리 숫자" maxLength="26" required />
            <p className="hint">인증 코드는 3분간 유효합니다.</p>
          </div>

          <button className="btn" type="submit" style={{width: '100%'}}>인증하기</button>

          <p className="footer">메일을 받지 못하셨나요? <span style={{color: 'red', cursor: 'pointer'}} onClick={codeEvent}>코드 재전송</span></p>
        </form>
      </section>
    </>
  )
}

export default Email