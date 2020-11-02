import React, { useEffect, useCallback } from 'react'
import '../css/board.scss'
import { Link } from 'react-router-dom'
import { throttling } from './throttle.js';
import { connect } from 'react-redux'

const Mobile = ({ list, pageChange, totalPage, dateCompare, handleChangeScroll, scroll, user }) => {
    const throttler = throttling();
    useEffect(() => {
        document.getElementById("boardUl").style.scrollBehavior = "auto"
        document.getElementById("boardUl").focus()
        //열람하기전 스크롤의 위치를 저장해놨다가 다시 표시해줌. scrollBehavior가 걸려있기때문에 이 순간만 잠깐 해제해준다.
        document.getElementById("boardUl").scrollTo(0, scroll)
        document.getElementById("boardUl").style.scrollBehavior = "smooth"
    }, [])

    const scrollEvent = useCallback(async () => {
        throttler.throttle(async () => {
            var boardUl = document.getElementById("boardUl")
            var scrollHeight = boardUl.scrollHeight
            var htmlHeight = boardUl.clientHeight
            var scrollPosition = boardUl.scrollTop
            handleChangeScroll(scrollPosition)

            if (scrollHeight < Math.round(scrollPosition) + htmlHeight + 400 && boardUl.childElementCount >= Math.round(window.innerHeight / 50)) {
                //맨 끝에 가기전까지는 로딩이미지, 맨 끝에서는 텍스트로 끝이라고 알려주기.
                if (boardUl.childElementCount < totalPage) {
                    if (!document.getElementById("pageLoading") && !document.getElementById("lastPost")) {
                        var loading = document.createElement('img')
                        loading.src = "https://jaehoon-bucket.s3.ap-northeast-2.amazonaws.com/1601446938150loading.gif"
                        loading.id = "pageLoading"
                        loading.width = 60
                        document.getElementsByClassName("mobileList")[0].appendChild(loading)
                    }
                    await pageChange(parseInt(sessionStorage.getItem("pageNum")) + 1, Math.round(window.innerHeight / 50), false)
                }
                else if (!document.getElementById("lastPost")) {
                    document.getElementById("pageLoading").remove()
                    var lastPost = document.createElement("h3")
                    lastPost.innerText = "페이지의 끝입니다."
                    lastPost.id = "lastPost"
                    boardUl.appendChild(lastPost)
                }

            }
        }, 400);
        // else if(scrollHeight === Math.round(scrollPosition) + htmlHeight + 1 && boardUl.childElementCount != totalPage){
        //     await pageChange(pageNum, Math.round(window.innerHeight / 86))
        // }
    }, [totalPage])

    const writeBtn = useCallback(() => {
        if (!user.id) {
            alert("로그인이 필요합니다")
            return
        } else {
            document.getElementById("writeLink").click()
        }

    }, [user])

    return (
        <div style={{ height: window.innerHeight - 40 }}>
            <ul id="boardUl" className="mobileList" onScroll={scrollEvent} style={{ scrollBehavior: "smooth", marginTop: "0", width: "100%", paddingBottom: "70px", paddingLeft: "10px", paddingRight: "10px", height: window.innerHeight - 40, overflow: "scroll", listStyleType: "none" }}>
                {list.map((data, index) => {
                    return (
                        <li key={index} className={data.thumbnail ? "boardList" : "boardList thumbnailLess"}>
                            <Link to={"/view/?postId=" + data.postId}>
                                {data.thumbnail ?
                                    <div className="right">
                                        <i>
                                            <img src={"https://jaehoon-bucket.s3.ap-northeast-2.amazonaws.com/" + data.thumbnail} alt="" />
                                        </i>
                                    </div> : ""
                                }
                                <div className={data.thumbnail ? "left thumbnail" : "left"}>
                                    <h3>{data.title}</h3>
                                    <dl className="write-info mb-2">
                                        <dd className="writer">{data.userId}</dd>
                                        {data.thumbnail ? <dd className="date thumbnail">{dateCompare(data.updatePost)}</dd> : <dd className="date">{dateCompare(data.updatePost)}</dd>}
                                        <dd className="etc">
                                            <span id="count-comment" className="iconSpan">{data.commentCount}</span>
                                            <span id="count-read" className="iconSpan">{data.views}</span>
                                            <span id="count-likes" className="iconSpan">{data.likeCount}</span>
                                        </dd>
                                    </dl>
                                </div>
                            </Link>
                        </li>)
                }
                )}
            </ul>
            <div id="bottomBtn">
                <img alt="goTop" onClick={() => document.getElementById("boardUl").firstChild.scrollIntoView()} id="topBtn" src="https://jaehoon-bucket.s3.ap-northeast-2.amazonaws.com/%EC%9C%84%EB%A1%9C%EA%B0%80%EA%B8%B0+%EB%B2%84%ED%8A%BC.png" />
                <Link id="writeLink" to="/post/false"></Link>
                <img alt="writeButton" onClick={writeBtn} id="writeBtn" className="writeClass" src="https://jaehoon-bucket.s3.ap-northeast-2.amazonaws.com/%EA%B8%80%EC%93%B0%EA%B8%B0%EB%B2%84%ED%8A%BC.png" />
            </div>
        </div>
    )
}

//스토어 객체에 접근할 수 있게 해줌.
const mapStateToProps = ({ board }) => ({
    user: board.user,
    scroll: board.scroll,
    list: board.list,
    totalPage: board.totalPage

});


export default connect(
    mapStateToProps
)(Mobile);
