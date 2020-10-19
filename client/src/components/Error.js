import React from 'react'

const Error = () => {
    const style = {
        position : "absolute",
        left : "50%",
        top : "50%",
        transform : "translate(-50%,-50%)",
        minWidth : "254px"
    }
    return (
        <h4 style={style}>
            존재하지 않는 페이지입니다.
        </h4>
    )
}

export default Error
