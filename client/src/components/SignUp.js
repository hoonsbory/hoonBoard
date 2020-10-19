import React, { useState, useCallback } from 'react'
import { Form, Input, Button } from 'reactstrap';
import { debounce } from 'lodash';
import axios from '../Axios'

const SignUp = () => {
    const [duplicate, setDuplicate] = useState(false)
    const [duplicateId, setDuplicateId] = useState("")
    const axiosfunc = axios("")

    const submitHandler = useCallback((event) => {
        event.preventDefault();
        if (!duplicate) {
            document.getElementById("duplicateMsg").style.animation = "highlight 1s"
            setTimeout(() => {
                document.getElementById("duplicateMsg").style.animation = "unset"
            }, 1000);
            return
        }
        if (!(/^(?=.*\d)(?=.*[a-zA-z]).{4,15}$/).test(event.target.pw.value.trim())) {
            alert('비밀번호는 영문과 숫자를 섞어 4~15자까지만 가능합니다.');
            return;
        }
        if (!(/^.{2,12}$/).test(event.target.id.value.trim())) {
            alert('ID는 2~12자까지만 가능합니다.');
            return
        }
        if (!(/^.{2,10}$/).test(event.target.name.value.trim())) {
            alert('이름은 2~10자까지만 가능합니다.');
            return
        }
        signup({
            id: event.target.id.value.trim(),
            pw: event.target.pw.value.trim(),
            name: event.target.name.value.trim()
        })
    }, [duplicate])

    const duplicateCheck = debounce(useCallback(() => {
        if (!document.getElementById("inputId").value) return
        axiosfunc.axiosPost('/api/duplicateCheck', { id: document.getElementById("inputId").value }, (res) => {
            if (res.data) {
                setDuplicate(true)
                setDuplicateId(document.getElementById("inputId").value)
            }
            else alert("이미 가입된 아이디입니다.")
        })
    }, []), 200)

    //아이디를 입력해야만 중복체크가 뜸. 중복체크 성공시에 저장해놨던 state랑 비교 후 다른 아이디를 다시 입력했을때 다시 중복체크뜨게함.
    const keyUp = useCallback((e) => {
        if (duplicateId !== e.target.value) {
            setDuplicate(false)
        } else if (duplicateId) {
            setDuplicate(true)
        }
    }, [duplicateId])

    const signup = debounce((data) => {
        axiosfunc.axiosPost('/api/signup', data, (res) => {
            if (res) {
                alert("가입이 완료되었습니다. 로그인해주세요")
                document.getElementById("inputId").value = ""
                document.getElementById("inputName").value = ""
                document.getElementById("inputPw").value = ""
            }
            document.getElementById("popupBg").click()
            setTimeout(() => {
                document.getElementById("leftNav").click()
            }, 1000);
        })
    }, 200)
    const duplicateMsg = {
        color: "red",
        fontSize: "8px"
    }
    const duplicateMsg2 = {
        color: "blue",
        fontSize: "8px"
    }
    const duplicateBtn = {
        fontSize: "8px",
        color: "#007bff",
        textDecoration: "underline",
        cursor: "pointer"
    }
    return (
        <div id="signupDiv" style={{ display: "none" }}>
            <h4>회원가입</h4>
            <Form style={{ lineHeight: 2 }} onSubmit={submitHandler}>
                아이디 {duplicate ? '' : <a onClick={duplicateCheck} style={duplicateBtn}>중복체크</a>}<Input onChange={keyUp} bsSize="sm" type="text" name="id" id="inputId" placeholder="ID"></Input>
                {duplicate ? <span style={duplicateMsg2} id="duplicateTrue">*사용가능한 아이디입니다.<br></br></span> : <span id="duplicateMsg" style={duplicateMsg}>*중복체크를 완료해주세요<br></br></span>}
                이름<Input id="inputName" bsSize="sm" type="text" name="name" placeholder="이름"></Input>
                패스워드<Input id="inputPw" bsSize="sm" type="password" name="pw" placeholder="PASSWORD"></Input>
                <Button color="primary" size="sm" type="submit" style={{ marginRight: "5px" }}>가입</Button>
            </Form>
        </div>
    )
}

export default SignUp
