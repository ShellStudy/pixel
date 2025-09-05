import { useState, useEffect } from 'react'
import { useRoot } from '@hooks/RootProvider.jsx'
import { FastAPI } from '@utils/Network.js'
import { useNavigate, useParams } from "react-router-dom";

const FreeView = () => {
  const { access, getBoardFile, getUserNo, getFile, isStorage, modalEvent } = useRoot()
  const [board, setBoard] = useState({userFileNo: null})
  const [like, setLike] = useState({status: 0, likeNo: 0});
  const [comment, setComment] = useState([])
  const [isSubscribe, setIsSubscribe] = useState(true)
  const [subscribe, setSubscribe] = useState({});
  const [prompt, setPrompt] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);
  const params = useParams()

  const fallbackCopyTextToClipboard = (text) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    let successful = false;
    try {
      successful = document.execCommand('copy');
    } catch (err) {
      successful = false;
    }
    document.body.removeChild(textarea);
    return successful;
  };

  const handleCopy = async () => {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setError(null);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        setError('클립보드 복사에 실패했습니다.');
      }
    } else {
      const success = fallbackCopyTextToClipboard(board.prompt);
      if (success) {
        setCopied(true);
        setError(null);
        setTimeout(() => setCopied(false), 2000);
      } else {
        setError('클립보드 복사에 실패했습니다.');
      }
    }
  }

  const subscribeEvent = () => {
    if(isStorage("access")) {
      FastAPI("PUT", '/subsribe/1', {sNo: board.regUserNo, uNo: getUserNo()})
      .then(res => {
        if(res.status){
          setIsSubscribe(true)
        }
      })
    } else {
      modalEvent("Login")
    }
  }

  const likeEvent = () => {
    if(!access) {
      modalEvent("Login")
    } else {
      FastAPI("POST", "/like", {status: like.status, likeNo: like.likeNo, boardNo: params.no, userNo: getUserNo()})
      .then(res => {
        if(res.status) getData()
      })
    }
  }

  const commentEvent = (e) => {
    e.preventDefault()
    if(!access){
      modalEvent("Login"); 
      return;
    }
    if(e.target.txt.value === "") {
      e.target.txt.focus()
      return;
    }
    const param = {
      "boardNo": params.no,
      "regUserNo": getUserNo(),
      "txt": e.target.txt.value
    }
    FastAPI("PUT", "/community", param)
    .then(res => {
      if(res.status) {
        e.target.txt.value = ""
        setComment(res.result)
      }
    })
  }

  const getData = () => {
    FastAPI("POST", `/board/freeview/${params.no}/${getUserNo()}`, {})
    .then(res => {
      if(res.status) {
        setBoard(res.result.board)
        setLike(res.result.like)
        setSubscribe(res.result.subscribe)
        if(res.result.board.regUserNo === getUserNo()) {
          setIsSubscribe(true)
        } else if(res.result.subscribe) {
          setIsSubscribe(res.result.subscribe.useYn === 'Y')
        } else {
          setIsSubscribe(false)
        }
      }
    })
    FastAPI("POST", `/community/${params.no}`, {})
    .then(res => {
      if(res.status) {
        setComment(res.result)
      }
    })
  }

  useEffect(()=>{
    getData()
  }, [])
  return (
    <main className="content two-pane" id="splitRoot">
      <div className="center-stack">
        <section className="left-pane" aria-label="작품 및 정보">
          <header className="app-header-inset">
            <div className="user-info" onClick={()=>location.href = `/profile/media?no=${board.regUserNo}`}>
              <img src={getFile(board.userFileNo)} alt="User avatar" className="avatar" />
              <div className="meta">
                <strong className="username">{board.name}</strong>
              </div>
            </div>
            <div className="header-actions">
              {!isSubscribe && <button className="btn btn-primary" onClick={subscribeEvent}>구독</button>}
              {/* <button className="btn btn-cancel" type="button" aria-label="닫기">×</button> */}
            </div>
          </header>

          <section className="prompt-bar-inset">
            <p className={prompt ? "prompt-text" : "prompt-text collapsed"} id="promptText">{board.prompt}</p>
            <div className="prompt-actions">
              <label htmlFor="copyState" className="btn copy-btn" onClick={handleCopy}>{copied ? "복사 완료!" : "프롬프트 복사"}</label>
              <label htmlFor="promptToggle" className="btn expand-btn" onClick={()=>setPrompt(!prompt)}>더보기</label>
            </div>
          </section>

          <div className="image-area">
            <img src={getBoardFile(board.attachPath)} alt="Generated artwork" />

            <div className="image-actions">
              <label htmlFor="likeToggle" className="icon-btn sm like-btn" onClick={likeEvent}>
                {
                  like.status === 1 ?
                  <i className="fa-solid fa-heart icon-heart-solid"></i>
                  :
                  <i className="fa-regular fa-heart icon-heart-regular"></i>
                }
              </label>
            </div>

            <a className="view-original-btn"
               href={getBoardFile(board.attachPath)}
               target="_blank" rel="noopener">
              <i className="fa-solid fa-up-right-and-down-left-from-center"></i> 원본 보기
            </a>
          </div>
        </section>
      </div>

      <aside className="comments" aria-label="댓글" id="commentsPane" style={{'--listHeight':'70%'}}>
        <div className="comments-header">
          <h3>코멘트</h3>
        </div>

        <ul className="comment-list" id="commentList">
          {
            comment?.map((row, index) => {
              return (
                <li className="comment-item" key={index}>
                  <img className="comment-avatar" src={getFile(row.fileNo)} alt="" />
                  <div className="comment-content">
                    <strong>{row.name}</strong>
                    <p>{row.txt}</p>
                  </div>
                </li>
              )
            })
          }
        </ul>
        <form className="comment-input-row" onSubmit={commentEvent}>
          <textarea className="comment-input" name="txt" placeholder="코멘트 남기기..." style={{resize: 'none'}} onClick={()=> {if(!access){modalEvent("Login"); return;}}}></textarea>
          <button type='submit' className="send-btn" aria-label="전송">
            <i className="fa-solid fa-paper-plane"></i>
          </button>
        </form>
      </aside>
    </main>
  )
}

export default FreeView