import React, { useEffect, useState, useCallback } from 'react'
import Axios from 'axios'
import Like from './Like'
import Comment from './Comment'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux'
import * as boardActions from '../store/modules/board'
import CommentList from './CommentList'
import { debounce } from 'lodash'
import Loading from './Loading'


const ViewPost = ({ match, user, boardActions, renderTrigger, viewPost, dateCompare }) => {

    const [commentList, setCommentList] = useState([])

    const getPost = useCallback(() => {
        Axios.post("/api/viewPost", { postId: match.params.postId })
            .then((res) => {
                boardActions.viewPost(res.data.post)
                setCommentList(res.data.comment)
                document.getElementById("viewPost").innerHTML = res.data.post.content
                document.getElementById("viewHeader").parentNode.style.display = "block"
                sessionStorage.setItem("check", true)
            }).catch((err) => {

            })
    }, [])

    //처음 들어왔을때만 조회수1증가. 
    useEffect(() => {
        Axios.post("/api/updateViews", { postId: match.params.postId })
            .then(res => {

            })
    }, [])


    useEffect(() => {
        getPost()
        //답글달기 버튼을 눌렀을때 함수를 바인딩하기때문에 로그인을 하고나도 이전에 바인딩된 함수이기 떄문에 user객체가 읽히지가 않기때문에 다시 바인딩해준다.
        if (document.getElementById("replyText")) document.getElementById("replyText").nextElementSibling.onclick = sendChildComment
        if (document.getElementById("updateText")) document.getElementById("updateText").nextElementSibling.onclick = sendUpdateComment
    }, [user, renderTrigger]) //로그인 및 로그아웃 시에 좋아요 표시나 수정 삭제 버튼 등등이 다시 표시해야하기 때문에 user가 바뀌면 렌더링

    const postStyle = {
        padding: "0 !important",
        borderTop: "1px solid #f4f4f4",
        marginBottom: "20px",
        display: "flow-root",
        overflowX: "auto"
    }

    const viewHeader = {
        padding: "10px 0"
    }

    const like = debounce(useCallback(() => {
        if (!user.id) {
            alert("로그인이 필요합니다")
            return
        }
        if (!viewPost.likeCheck) {
            Axios.post('/api/like', { postId: viewPost.postId })
                .then(res => {
                    if (res.data)
                        boardActions.renderTrigger()
                })
        } else {
            Axios.post('/api/unLike', { postId: viewPost.postId })
                .then(res => {
                    if (res.data)
                        boardActions.renderTrigger()
                })
        }
    }, [user, viewPost]), 200)

    const likeComment = debounce(useCallback((id, likeCheck) => {
        if (!user.id) {
            alert("로그인이 필요합니다")
            return
        }
        if (!likeCheck) {
            Axios.post('/api/likeComment', { commentId: id })
                .then(res => {
                    if (res.data)
                        boardActions.renderTrigger()
                })
        } else {
            Axios.post('/api/unLikeComment', { likeId: id })
                .then(res => {
                    if (res.data)

                        boardActions.renderTrigger()
                })
        }
    }, [user]), 200)

    const deletePost = useCallback(async () => {
        if (!user.id) {
            alert("로그인이 필요합니다")
            return
        }
        if (window.confirm("정말 삭제하시겠습니까?")) {
            document.getElementById("loadingBg").style.display = "block"
            for (var i = 0; i > -1; i++) {
                if (document.getElementById("viewPost").getElementsByTagName("img")[i]) {
                    await Axios.post('/api/deleteImg', {
                        //한글로 된 파일명이 있기때문에 디코딩해줘야 삭제가 된다. url은 인코딩된 값이지만 s3의 객체 키값은 한글로 들어가있어서 한글로 키값을 보내줘야 삭제가능.
                        data: decodeURI(document.getElementById("viewPost").getElementsByTagName("img")[i].src.split("https://jaehoon-bucket.s3.ap-northeast-2.amazonaws.com/")[1])
                    }).then((res) => {
                        alert(res.data);
                    })
                } else {
                    await Axios.post("/api/deletePost", { postId: viewPost.postId })
                        .then(res => {
                            document.getElementById("loadingBg").style.display = "none"
                            document.getElementById("goHome").click()
                            boardActions.renderTrigger()
                        })
                        return;
                }
            }


        }
    }, [user, viewPost])

    const sendParentComment = debounce(useCallback(() => {
        if (!user.id) {
            alert("로그인이 필요합니다")
            return
        }
        if (!(/^.{1,400}$/).test(document.getElementById("commentText").innerText)) {
            alert("내용은 1~400자 사이로 입력해주세요")
            return
        }
        Axios.post("/api/sendParentComment", { postId: viewPost.postId, comment: document.getElementById("commentText").innerHTML })
            .then(res => {
                document.getElementById("commentText").innerText = ""
                boardActions.renderTrigger()
                setTimeout(() => {
                    //댓글리로드한 후 맨아래로.
                    window.scrollTo(0, document.body.scrollHeight)
                }, 500);
            })
    }, [user, viewPost]), 200)

    const sendChildComment = debounce(useCallback(() => {
        if (!user.id) {
            alert("로그인이 필요합니다")
            return
        }
        if (!(/^.{1,400}$/).test(document.getElementById("replyText").innerText)) {
            alert("내용은 1~400자 사이로 입력해주세요")
            return
        }
        Axios.post("/api/sendChildComment", { groupId: document.getElementById("replyText").nextElementSibling.id, postId: commentList[0].postId, comment: document.getElementById("replyText").innerHTML })
            .then(res => {
                document.getElementById("replyDiv").remove()
                boardActions.renderTrigger()
            })
    }, [user, commentList]), 200)

    const sendUpdateComment = debounce(useCallback(() => {
        if (!user.id) {
            alert("로그인이 필요합니다")
            return
        }
        if (!(/^.{1,400}$/).test(test.document.getElementById("updateText").innerText)) {
            alert("내용은 1~400자 사이로 입력해주세요")
            return
        }
        Axios.post("/api/sendUpdateComment", { id: document.getElementById("updateText").nextElementSibling.id, comment: document.getElementById("updateText").innerHTML })
            .then(res => {
                document.getElementById("replyDiv").remove()
                boardActions.renderTrigger()
            })
    }, [user]), 200)

    const deleteComment = useCallback((id) => {
        if (!user.id) {
            alert("로그인이 필요합니다")
            return
        }
        if (window.confirm("정말 삭제하시겠습니까?"))
            Axios.post("/api/deleteComment", { id: id })
                .then(res => {
                    boardActions.renderTrigger()
                })
    }, [user])

    const deleteUpdate = {
        float: "right",
        fontSize: ".8em",
    }

    return (
        <div style={{ display: "none", padding: '0 20px' }}>
            <Loading></Loading>
            <div id="viewHeader" style={viewHeader}>
                <h4>{viewPost.title}</h4>
                <dl className="write-info mb-0" >
                    <dd style={{ marginRight: '5px', float: "unset" }} className="write">{viewPost.userId}</dd>
                    <dd style={{ marginRight: '5px' }} className="date">{viewPost.updatePost ? dateCompare(viewPost.updatePost) : ""}</dd>
                    <dd id="count-read" className="iconSpan">{viewPost.views}</dd>
                    {user.id === viewPost.userId ? <div style={deleteUpdate}><Link style={{ color: "gray" }} to={"/post/update"}>수정</Link>&nbsp;<button onClick={deletePost} style={{ color: "gray" }}>삭제</button></div> : ""}
                </dl>
            </div>
            <div className="ql-container ql-snow" style={{ border: "unset" }}>
                <div id="viewPost" className="ql-editor view" style={postStyle}></div>
            </div>
            <Like like={like} likeCheck={viewPost.likeCheck} likeCount={viewPost.likeCount}></Like>
            <h4>댓글 ({commentList.length})</h4>
            <Comment sendParentComment={sendParentComment}></Comment>
            <CommentList likeComment={likeComment} deleteComment={deleteComment} sendUpdateComment={sendUpdateComment} user={user} sendChildComment={sendChildComment} boardActions={boardActions} dateCompare={dateCompare} commentList={commentList}></CommentList>
        </div>
    )
}

const mapStateToProps = ({ board }) => ({
    user: board.user,
    likeCheck: board.likeCheck,
    renderTrigger: board.renderTrigger,
    viewPost: board.viewPost
})

const mapDispatchToProps = dispatch => ({
    boardActions: bindActionCreators(boardActions, dispatch),
})


export default connect(mapStateToProps, mapDispatchToProps)(ViewPost)

