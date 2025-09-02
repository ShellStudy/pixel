import { useState, useEffect } from 'react'
import { useRoot } from '@hooks/RootProvider.jsx'
import { FastAPI } from '@utils/Network.js'
import { useNavigate } from "react-router-dom";

const FreeView = () => {
  const { setIsFreeView, getBoardFile, getUserNo, getFile, board } = useRoot()
  const [follow, setFollow] = useState(false);
  const [like, setLike] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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

  const handleOpenNewTab = () => {
    window.open(getBoardFile(board.attachPath), "_blank", board.prompt);
    // const a = document.createElement('a');
    // a.href = getBoardFile(board.attachPath);
    // a.target = '_blank';
    // a.rel = board.prompt;
    // a.click();
  };

  const likeEvent = () => {
    FastAPI("POST", "/like", {boardNo: board.no, userNo: getUserNo()})
    .then(res => {
      console.log(res)
    })
  }

  useEffect(() => {
    setFollow(!(getUserNo() === board.userNo))

    // 구독, 좋아요 확인 처리 추가 
    setLike(!(getUserNo() === board.userNo))
  }, [])

  return (
    <div id="image-modal" className="modal-overlay">
      <div className="overlay" onClick={()=>setIsFreeView(false)}></div>
      <div className="modal-content">
        <header className="modal-header">
          <div className="user-info" onClick={()=>location.href = `/profile/media?no=${board.userNo}`}>
            <img src={getFile(board.userFileNo)} alt="User avatar" className="avatar" />
            <span className="username">{board.name}</span>
          </div>
          <div className="header-buttons">
            { follow && <button className="follow-btn">구독</button> }
            <button className="close-button" onClick={()=>setIsFreeView(false)}>&times;</button>
          </div>
        </header>

        <section className="prompt-section">
          <p className="prompt-text">{board.prompt}</p>
          <button className="copy-btn" onClick={handleCopy}>
            <i className="fa-regular fa-copy"></i> 프롬프트 복사
          </button>
        </section>

        <div className="modal-main-body">
          <div className="image-wrapper">
              <img src={getBoardFile(board.attachPath)} alt="Enlarged AI art" className="modal-image" />
              <button className="view-original-btn" onClick={handleOpenNewTab}>
                  <i className="fa-solid fa-expand"></i> 원본 사이즈
              </button>
          </div>

          <aside className="comments-panel">
              <div className="comments-header">
                <h3>코멘트</h3>
                <button className="panel-close-btn">&times;</button>
              </div>

              <ul className="comment-list">
                <li className="comment-item">
                  <img className="comment-avatar" src="https://picsum.photos/seed/a/40/40" alt="" />
                  <div className="comment-content">
                    <strong>PixelPush</strong>
                    <p>정말 멋진 작품이네요! 별의 표현이 인상적이에요.</p>
                    <span className="comment-timestamp">24시간 전</span>
                  </div>
                </li>

                <li className="comment-item">
                  <img className="comment-avatar" src="https://picsum.photos/seed/b/40/40" alt="" />
                  <div className="comment-content">
                    <strong>ArtisticAI (나)</strong>
                    <p>감사합니다! 영감을 받아서 작업해봤어요.</p>
                    <span className="comment-timestamp">14시간 전</span>
                  </div>
                </li>

                <li className="comment-item">
                  <img className="comment-avatar" src="https://picsum.photos/seed/c/40/40" alt="" />
                  <div className="comment-content">
                    <strong>FutureScapes</strong>
                    <p>프롬프트 참고해서 저도 만들어봐야겠어요!</p>
                    <span className="comment-timestamp">30분 전</span>
                  </div>
                </li>
              </ul>
            </aside>
        </div>

        <footer className="modal-footer">
          <div className="actions-bar">
            { like && 
            <button className="like-btn" onClick={likeEvent}>
              <i className="fa-regular fa-heart"></i>
            </button>
            }
            <button className="comment-btn">
              <i className="fa-regular fa-comment"></i>
            </button>
          </div>

          <div className="comment-section">
            <div className="comment-box">
              <input type="text" className="comment-input" placeholder="코멘트 남기기..." />
              <button className="send-btn">
                <i className="fa-solid fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default FreeView