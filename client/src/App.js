import React from 'react';
import { BrowserRouter, Link } from 'react-router-dom'
import './css/App.scss'
import BoardContainer from './containers/BoardContainer';

function App() {
  if (navigator.userAgent.indexOf("Mobile") > -1) document.body.style.width = "100%"

  //ios 메타태그에서 스케일 비활성화가 안돼서 이렇게 설정해줘야됨
  if(navigator.userAgent.indexOf("Mac") > -1 || navigator.userAgent.indexOf("iPad") > -1 || navigator.userAgent.indexOf("iPhone") > -1)
  document.addEventListener('touchmove', function (event) {
    if (event.scale !== 1) { event.preventDefault(); }
  }, { passive: false });
  window.addEventListener("resize", () => {
  })

  

  return (
    <div className="App">
      <BrowserRouter>
      <Link to="/" id="goHome"></Link>
        <BoardContainer></BoardContainer>
        {/* <Link className="mt-2" to="/test/test">테스트</Link> */}
        {/* 함수형 컴포넌트에서는 바인드를 해줘야한다. */}
        {/* <Link to="/post">글쓰기</Link> */}
        {/* <Link to="/post">글쓰기</Link>
        <Login login_process={login}></Login>
        <button onClick={test}>테스트</button> */}
      </BrowserRouter>
      {/* <PaletteContainer />  
        <CounterContainer /> 
        <WaitingContainer /> */}
    </div>
  );
}

export default App;