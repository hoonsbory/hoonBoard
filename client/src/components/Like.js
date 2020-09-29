import React from 'react'

const Like = ({likeCount,likeCheck,like}) => {

    const btn = {
        backgroundImage : likeCheck ? "URL(https://jaehoon-bucket.s3.ap-northeast-2.amazonaws.com/heart.png)" : "URL(https://jaehoon-bucket.s3.ap-northeast-2.amazonaws.com/emptyHeart.png)",
        backgroundRepeat : "no-repeat",
        backgroundSize : '100%',
        height  :"30px",
        width : '30px',
    }
    const div = {
        border : "2px solid gray",
        borderRadius : "10px",
        padding : "5px 20px",
        display : 'inline-block'
    }
    var dfs = "123"
    return (
        <div style={{textAlign : "center", marginBottom : "20px"}}>
            <div style={div}>
           <button onClick={like} id="heart" style={btn}></button> 
    <p id="likeCount" style={{marginBottom : "0"}}>{likeCount}</p>
           </div>
        </div>
    )
}

export default Like
