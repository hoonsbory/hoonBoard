import React from 'react'

const Loading = () => {
    const popup = {
        position: "fixed",
        left: "50%",
        top: "50%",
        borderRadius : "200px",
        transform: "translate(-50%,-50%)",
        background: "white",
        zIndex: "999"
    }
    const popupBg = {
        width: "100%",
        height: "100%",
        top: 0,
        left: 0,
        background: "rgba(0,0,0, 0.3)",
        position: "fixed",
        zIndex: '999',
        display: "none"
    }
    return (
        <div id="loadingBg" style={popupBg}>
            <div id="loading" style={popup}>
                <img style={{ width: "100px", position: "relative", top: "-10px" }} src="https://jaehoon-bucket.s3.ap-northeast-2.amazonaws.com/1601446938150loading.gif"></img>
            </div>
        </div>
    )
}

export default Loading