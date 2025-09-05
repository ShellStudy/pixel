import { useState, useEffect, useRef } from 'react'
import { useRoot } from '@hooks/RootProvider.jsx'
import { GET, DELETE, FileUpload } from '@utils/Network.js'
import None from '@assets/none.png'

const Info = () => {
  const { closeEvent, removeStorage, isStorage, getFile } = useRoot()
  const [isEdit, setIsEdit] = useState(true)
  const [user, setUser] = useState({ email: '', name: '' })
  const [image, setImage] = useState(None);
  const fileRef = useRef(null);
  const btn1Event = () => {
    if(!isEdit) {
      const formData = new FormData();
      if(fileRef.current.files.length > 0) {
        formData.append("file", fileRef.current.files[0]);
      }
      formData.append("name", user.name);
      FileUpload(`/oauth/user/${user.no}`, formData)
      .then(res => {
        if(res.status) {
          setIsEdit(!isEdit)
        } else {
          alert(res.message)
        }
      })
    } else {
      setIsEdit(!isEdit)
    }
  }
  const btn2Event = () => {
    DELETE(`/oauth/user/${user.no}`, {})
    .then(res => {
      if(res.status) {
        removeStorage("access")
      } else {
        alert(res.message)
      }
    });
  }
  const imageEvent = () => {
    if(!isEdit) fileRef.current.click()
  }
  const imageChange = () => {
    const file = fileRef.current.files[0];
    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result);
    reader.readAsDataURL(file);
  }
  const changeEvent = (e) => {
    const {name, value} = e.target;
    setUser({...user, [name]:value})
  }
  useEffect(() => {
    if(isStorage("access")) {
      GET("/oauth/user")
      .then(res => {
        if(res.status) {
          setUser(res.result)
          setImage(getFile(res.result.fileNo))
        } else {
          closeEvent()
        }
      });
    } else {
      location.reload();
    }
  }, [])
  return (
    <>
      <div className="overlay" onClick={closeEvent}></div>
      <section className="card modal">

        <div className="brand">
          <img src={image} alt="유저 아이콘" onClick={imageEvent}
              style={{width:'60px', height: '60px', borderRadius: '50%', objectFit: 'cover', boxShadow: '0 4px 10px rgba(0,0,0,.4)'}} />
          <input type="file" style={{display: 'none'}} accept="image/*" ref={fileRef} onChange={imageChange}/>
          <div>
            <h1 className="brand__name">유저 정보</h1>
            <p className="subtitle">계정 관리</p>
          </div>
        </div>

        <form >
          <div className="field">
            <label htmlFor="email">이메일</label>
            <input type="email" id="email" name="email" className="input" placeholder="id@example.com" value={user?.email} onChange={changeEvent} readOnly />
          </div>

          <div className="field">
            <label htmlFor="name">사용자 이름</label>
            <input type="text" id="name" name="name" className="input" placeholder="홍길동" minLength="2" value={user?.name} onChange={changeEvent} required readOnly={isEdit} />
          </div>
        </form>

        <div className="row">
          <button type='button' className="btn" onClick={btn1Event}>회원정보 {isEdit ? '수정' : '저장'}</button>
          <button type='button' className="btn" onClick={btn2Event} disabled={isEdit}
            style={{background: 'var(--danger)', borderColor: 'var(--danger)', boxShadow: '0 10px 22px rgba(255,90,122,.28)', color: '#fff'}}>
            회원탈퇴
          </button>
        </div>
        
      </section>
    </>
  )
}

export default Info
