import '@styles/App.css'
import '@styles/Style.css'
import NonePage from '@pages/component/NonePage.jsx'
import Aside from '@pages/component/Aside.jsx'
import Community from '@pages/component/Community.jsx'
import Root from '@pages/Root.jsx'
import Info from '@pages/user/Info.jsx'
import Login from '@pages/user/Login.jsx'
import SignUp from '@pages/user/SignUp.jsx'
import Email from '@pages/user/Email.jsx'
import MyPage from '@pages/mypage/MyPage.jsx'
import UserPage from '@pages/profile/UserPage.jsx'
import { useRoot } from '@hooks/RootProvider.jsx'
import { BrowserRouter, Routes, Route } from "react-router"

const App = () => {
  const { isUser, isLogin, isSignUp, isEmail } = useRoot()
  return (
    <>
      <div className="container">
        <Aside />
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<Root />} />
            <Route path='/mypage/*' element={<MyPage />} />
            <Route path='/profile/*' element={<UserPage />} />
            <Route path='/community' element={<Community />} />
            <Route path='*' element={<NonePage />} />
          </Routes>
        </BrowserRouter>
      </div>
      {isUser && <Info />}
      {isLogin && <Login />}
      {isSignUp && <SignUp />}
      {isEmail && <Email />}
    </>
  )
}

export default App
