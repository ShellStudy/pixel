import { useState, useEffect, useRef } from 'react'
import { useRoot } from '@hooks/RootProvider.jsx'
import { FastAPI } from '@utils/Network.js'

const Root = () => {
  const { access, setAccess, modalEvent, isStorage, getBoardFile, isFreeView, setIsFreeView, getUserNo, targetImage } = useRoot()
  const [images, setImages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  
  const promptRef = useRef()

  const getBoards = () => {
    FastAPI("POST", "/board", {})
    .then(res => {
      if(res.status) {
        setImages(res.result)
        setAccess(isStorage("access"))
      } else {
        alert("이미지 목록 조회 중 네트워크 오류가 발생 했습니다.")
      }
    })
  }

  const isChecck = () => {
    if(!access) modalEvent("Login")
  }

  const applyEvent = () => {
    setIsLoading(true)
    FastAPI("POST", "/gen", {p: promptRef.current.value, no: getUserNo()})
    .then(res => {
      if(res.status){
        getBoards()
        promptRef.current.value = ""
      } else {
        alert("이미지 생성이 실패 하였습니다.")
      }
      setIsLoading(false)
    })
  }

  useEffect(() => {
    getBoards()
  }, []);

  return (
    <>
    <main className="main-content">
      <header className="prompt-section">
        <div className="prompt-input-wrapper" onClick={isChecck}>
          {/* <input type="text" ref={promptRef} placeholder="Imagine something... a futuristic city in the style of Van Gogh" /> */}
          <textarea style={{resize:'none'}} ref={promptRef} placeholder="Imagine something... a futuristic city in the style of Van Gogh"></textarea>
          <button type='button' className="btn-generate" disabled={!access} onClick={applyEvent}>Generate</button>
        </div>
      </header>

      <section className="gallery">
        {isLoading &&
        <div className="loading-box-inline">
          {/* <button className="cancel-button" type="button">X 취소</button> */}
          <div className="spinner" aria-hidden="true"></div>
          <h2>잠시만요...</h2>
          <p>AI Gen이 이미지를 만들고 있어요.</p>
        </div>
        }
        { /* 이미지 반복 */
          images?.map((row, index) => {
            return (
              <div className="gallery-item" key={index} onClick={()=>location.href = `/freeView/${row.no}`}>
                <img src={getBoardFile(row.attachPath)} alt="AI generated image" />
                <div className="overlay">
                  <p className="prompt-text">{row.prompt}</p>
                </div>
            </div>
            )
          })
        }
      </section>
  </main>
  </>
  )
}

export default Root