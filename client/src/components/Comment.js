import React from 'react'
import '../css/App.scss'

const Comment = ({sendParentComment}) => {
    const firstDiv = {
        width : "100%",
        height : "100px",
        padding : "8px",
        borderRadius : "5px",
        border : "1px solid"
    }
    const textDiv = {
        background : "white",
        height : '100%',
        width : "90%",
        float : 'left',
        overflowY: "auto"
    }
    const sendBtn = {
        background : "cornflowerblue",
        color : "white",
        height : "100%",
        width : "10%",
        float : "left",
        borderRadius : "19px"
    }
   
    return (
        <div id="commentDiv" style={firstDiv}>
            <div id="commentText" contentEditable="true"  placeholder="댓글을 입력해주세요" style={textDiv}></div>
            <button id="commentSendBtn" onClick={sendParentComment} style={sendBtn}>등록</button>
        </div>
    )
}

export default Comment