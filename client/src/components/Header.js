import React, { useState, useCallback } from 'react'
import '../css/header.scss'
import { Input,Button } from 'reactstrap';
import { Link } from 'react-router-dom'
import Popup from './Popup'
import { debounce } from 'lodash';
import { connect } from 'react-redux';
import axios from '../Axios'

const Header = ({ user, pageChange, ua, handleChangeUser, handleChange,  handleChangeInput, search }) => {
    const [open, setOpen] = useState(true)
    const [open2, setOpen2] = useState(true)
    const axiosfunc = axios(user)
    //useCallback을 처음써봤는데, 첫 렌더링떄만 생성되게하면, 함수안의 모든 값들이 렌더링시에 존재했던 값으로 읽혀서 쓸 수 가 없다. 그래서 효율적이게 쓸려면 필요한 값들이 업데이트 됐을때 
    //함수를 재생성하게하면된다
    //아래처럼 해주면 open의 값이 변경될떄만 함수가 재생성되므로 불필요한 함수의 재생성을 막을 수 있다. usecallback을 쓰지 않으면 다른 state값이 변경될때마다 재생성되므로 매우 비효율적.
    const openDiv = useCallback(() => {
        if (open) {
            document.getElementById("searchBar").style.animation = "fadeIn1 .5s forwards"
            document.getElementById("searchBar").style.display = "block"
            document.getElementById("searchInput").focus()
            setOpen(false)
        } else {
            document.getElementById("searchBar").style.animation = "fadeOut1 .5s forwards"
            document.getElementById("rightNav").style.pointerEvents = "none"
            setTimeout(() => {
                document.getElementById("searchBar").style.display = "none"
                document.getElementById("rightNav").style.pointerEvents = "auto"
            }, 500);
            setOpen(true)
        }
    },[open])
    const openPopup = useCallback(() => {
        if (open2) {
            document.getElementById("popupDiv").style.animation = "fadeIn2 1s forwards"
            document.getElementById("popupDiv").style.display = "block"
            document.getElementById("popupBg").style.display = "block"
            document.getElementById("loginDiv").style.display = "block"
            document.getElementById("loginDiv").style.animation = "unset"
            document.getElementById("signupDiv").style.display = "none"
            document.getElementById("loginId").focus()
            setOpen2(false)
        }
    },[open2])

    const closePopup = useCallback(() => {
        if(!open2){
        document.getElementById("popupDiv").style.animation = "fadeOut2 1s forwards"
        document.getElementById("popupBg").style.pointerEvents = "none"
        setTimeout(() => {
            document.getElementById("popupDiv").style.display = "none"
            document.getElementById("popupBg").style.display = "none"
            document.getElementById("popupBg").style.pointerEvents = "auto"
            setOpen2(true)
        }, 1000);
    }
    },[open2])

    const keyPress = useCallback((e) => {
        if(e.key === "Enter"){
            document.getElementById("searchBtn").click();
        }
    },[])

    const logout = debounce(useCallback(() => {
        axiosfunc.axiosGet('/api/logout',()=>{
            handleChangeUser("")
        },()=>{
            handleChangeUser("")
        })
    },[]),200)

    const popupBg = {
        width: "100%",
        height: "100%",
        top: 0,
        left: 0,
        position: "fixed",
        zIndex: '998',
        display: "none"
    }
    const searchBar = {
        position : "relative",
        top : "-9px",
        display : "inline",
        width : "170px"
    }
    return (
        <nav id="boardNav">
    {user.id ? <button id="leftNav" onClick={logout}>로그아웃</button>: <button id="leftNav" onClick={openPopup}>로그인</button>}
            <div id="popupBg" onClick={closePopup} style={popupBg}></div>
            <Popup closePopup={closePopup}></Popup>
            <button id="middleNav" onClick={() => document.getElementById("goHome").click()}>Hoon's Board</button>
            <button id="rightNav" onClick={openDiv}>검색</button>
            <div id="searchBar">
                <Input type="select" bsSize="sm" value={search} onChange={handleChange} >
                    <option value="title">제목</option>
                    <option value="titleContent">제목+내용</option>
                    <option value="userId">글쓴이</option>
                </Input>
                <Input id="searchInput" bsSize="sm" style={searchBar} placeholder="검색어를 입력하세요" onChange={handleChangeInput}  onKeyPress={keyPress}></Input>
                <Button style={{position : "relative" , top : "-11px"}} id="searchBtn" color="primary" size="sm" type="submit" onClick={debounce(async() => {
                    document.getElementById("goHome").click()
                    var boardUl = document.getElementById("boardUl")
                    if (ua()) {
                        //페이징은 스토어의 state를 받아서 바로 map을 통해 생성하므로 바로 갱신이 되지만,
                        //무한스크롤의 경우 렌더링할때 append하는 방식으로 해놔서 그 전 리스트는 삭 제해줘야 한다.
                        //haschild를 통해서 루프를 돌리면 리스트가 전부삭제되어 스크롤 이벤트가 발생되기 때문에
                        //직접 노드 자식수를 조건으로 루프를 돌려서 스크롤 이벤트가 발생하지 않게 한다.
                        //아래 조건은 리스트가 아닌 글작성중, 혹은 글을 보고 있을때 검색하면, 생성된 리스트가 없기때문에 에러가 발생하기떄문에 넣었다.
                        if (boardUl) {
                            await pageChange(1, Math.round(window.innerHeight / 50), true)
                            boardUl.scrollTo(0,0)
                        }
                    } else {
                        pageChange(0, 10,false)
                    }
                },200)}>입력</Button>
            </div>
        </nav>
    )
}

const mapStateToProps = ({ board }) => ({
    user: board.user,
});


export default connect(
    mapStateToProps
)(Header);
