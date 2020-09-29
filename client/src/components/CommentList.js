import React, { useCallback } from 'react'

const CommentList = ({ user, commentList, dateCompare, sendChildComment, sendUpdateComment, deleteComment, likeComment }) => {

    const reply = {
        paddingLeft: "40px",
        width: "100%"
    }
    const nonReply = {
        width: "100%"
    }
    const btn = {
        marginTop: "10px",
        color: "gray",
        fontSize: "13px",
        marginBottom : 0,
        paddingLeft : 0
    }
    const like = {
        backgroundImage : "URL(https://jaehoon-bucket.s3.ap-northeast-2.amazonaws.com/heart.png)",
        backgroundRepeat : "no-repeat",
        backgroundSize : '100%',
        height  :"14px",
        marginRight : "3px",
        position : "relative",
        top : "4px"
    }
    const unLike = {
        backgroundImage : "URL(https://jaehoon-bucket.s3.ap-northeast-2.amazonaws.com/emptyHeart.png)",
        backgroundRepeat : "no-repeat",
        backgroundSize : '100%',
        height  :"14px",
        marginRight : "3px",
        position : "relative",
        top : "4px"
    }
    const deleteUpdate = {
        float: "right",
        color: "gray",
        fontSize: "13px",
        marginRight: "10px"
    }



    const replyComment = useCallback((index, groupId) => {
        if (document.getElementById("replyDiv")) document.getElementById("replyDiv").remove()
        var commentDiv = document.getElementById("commentDiv").cloneNode(true)
        commentDiv.id = "replyDiv"
        commentDiv.firstChild.id = "replyText"
        commentDiv.firstChild.setAttribute("placeholder", "답글을 입력해주세요")
        commentDiv.firstChild.innerHTML = ''
        commentDiv.childNodes[1].id = groupId
        commentDiv.childNodes[1].onclick = sendChildComment
        if (!document.getElementById("boardList" + index).nextSibling) {
            document.getElementById("boardUl").appendChild(commentDiv)
        } else {
            if (document.getElementById("boardList" + index).nextSibling.id !== "replyDiv") {
                document.getElementById("boardUl").insertBefore(commentDiv, document.getElementById("boardList" + (index + 1)))
            }
        }
        commentDiv.firstChild.focus()
    },[commentList])

    const updateComment = useCallback((index, id) => {
       
        if (document.getElementById("replyDiv")) document.getElementById("replyDiv").remove()
        var commentDiv = document.getElementById("commentDiv").cloneNode(true)
        commentDiv.id = "replyDiv"
        commentDiv.firstChild.id = "updateText"
        commentDiv.firstChild.innerHTML = document.getElementById("boardList" + index).getElementsByTagName("h3")[0].innerHTML
        commentDiv.childNodes[1].id = id
        commentDiv.childNodes[1].onclick = sendUpdateComment
        if (!document.getElementById("boardList" + index).nextSibling) {
            document.getElementById("boardUl").appendChild(commentDiv)
        } else {
            if (document.getElementById("boardList" + index).nextSibling.id !== "replyDiv") {
                document.getElementById("boardUl").insertBefore(commentDiv, document.getElementById("boardList" + (index + 1)))
            }
        }
        commentDiv.firstChild.focus()
        var node = window.getSelection().getRangeAt(0).startContainer.parentElement
        var range, selection;
        range = document.createRange();//range 생성
        range.selectNodeContents(node);//range를 적용한 노드 설정
        range.collapse(false);//true는 텍스트의 시작점에 커서가 위치, false는 반대
        selection = window.getSelection();//셀렉션 객체 가져옴
        selection.removeAllRanges();//만들어져있던 모든 range제거 후
        selection.addRange(range);//위에서 만든 range를 window에 추가하므로 커서 변경.
    },[commentList])

    return (
        <ul id="boardUl" style={{ marginTop: "0", width: "100%", paddingBottom: "130px", paddingLeft: "15px", listStyleType: "none" }}>
            {commentList.map((data, index) => {
                return (
                    <li className="boardList" id={"boardList" + index}>
                        {data.delete ?
                            (data.parentChild === 'p' ?
                                <h5 style={{ padding: "15px 0", fontSize: "15px" }}>삭제된 댓글입니다</h5> :
                                <h5 style={{ padding: "15px 0", paddingLeft: "40px", fontSize: "15px" }}>삭제된 댓글입니다</h5>) :
                            <div className="left" style={data.parentChild === "p" ? nonReply : reply}>
                                <dl className="write-info mb-2">
                                    <dd className="writer">{data.userId}</dd>
                                    <dd className="date">{dateCompare(data.createdAt)}</dd>
                                    <dd style={{color : "gray"}}>{data.likeCheck ? <button id="unLikeCommentBtn" onClick={()=>likeComment(data.likeId,true)} style={like}></button> : <button id="likeCommentBtn" onClick={()=>likeComment(data.id,false)} style={unLike}></button>}{data.likeCount}</dd>
                                    {user.id === data.userId ? <dd style={deleteUpdate}>
                                        <button onClick={() => updateComment(index, data.id)} style={{ color: "gray" }}>수정</button>
                                        <button onClick={() => deleteComment(data.id)} style={{ color: "gray" }}>삭제</button>
                                    </dd> : ""
                                    }
                                    {/* <dd className="etc">
                                            <span className="count-comment">0</span>
                                        </dd> */}
                                </dl>
                                <h3 dangerouslySetInnerHTML={{ __html : data.content}}></h3>
                                <dl style={btn}>
                                {data.parentChild === 'p' ? <button style={{color: "gray", marginRight : "5px"}} onClick={() => replyComment(index, data.groupId)}>답글 달기</button> : ""}
                                    </dl>
                            </div>
                        }
                    </li>)
            }
            )}
        </ul>
    )
}

export default CommentList