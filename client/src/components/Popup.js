import React, { useCallback } from 'react'
import Login from './Login'
import SignUp from './SignUp'

const Popup = ({closePopup}) => {
    const popup = {
        position : "fixed",
        left : "50%",
        top : "50%",
        transform: "translate(-50%,-50%)",
        background : "white",
        padding : window.innerWidth < 500 ? "30px "+window.innerWidth/7+"px" : "30px 70px",
        width : window.innerWidth < 500 ? "70%" : "unset",
        boxShadow: "1px 2px 2px 2px rgba(171,171,171,.5)",
        zIndex : "999",
        display : "none",
        opacity : 0
    }
    const popupChange = useCallback(() => {
        document.getElementById("loginDiv").style.animation = "fadeOut3 .3s forwards"
        setTimeout(() => {
            document.getElementById("loginDiv").style.display = "none"
            document.getElementById("signupDiv").style.display = "block"
            document.getElementById("signupDiv").style.animation = "fadeIn3 .6s forwards"
        }, 300);
    },[])
    return (
        <div id="popupDiv" style={popup}>
            <span onClick={closePopup} style={{cursor : "pointer",position : "absolute", right : "20px", top : "-10px", fontSize : "20px", fontWeight : "600"}}>x</span>
            <Login popupChange={popupChange}></Login>
            <SignUp></SignUp>
        </div>
    )
}

export default Popup
 