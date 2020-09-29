import React, { useCallback } from 'react'
import Axios from 'axios'
import { Form, Input, Button } from 'reactstrap';
import { bindActionCreators } from 'redux';
import * as boardActions from '../store/modules/board';
import { connect } from 'react-redux';
import { debounce } from 'lodash';

const Login = ({boardActions,popupChange}) => {
    const submitHandler = useCallback((event) => {
        event.preventDefault();
        login({
            id: event.target.id.value.trim(),
            pw: event.target.pw.value.trim()
        })
    },[])
    const login = debounce(useCallback((login_info) => {
        Axios.post('/api/login',

            login_info,

            //콘텐트 타입을 꼭 설정해줘야 에러가 안남
            {
                headers: {
                    "Content-Type": "application/json; charset=utf-8"
                }
            }
        ).then(res => {
            if (res.data.id === undefined) {	// 로그인 실패 빈 json형식이 넘어온 경우
                alert('login fail!');
            } else {
                boardActions.user(res.data)
                document.getElementById("loginId").value = ""
                document.getElementById("loginPw").value = ""
                document.getElementById("popupBg").click();
            }
            // this.setState({ users : data })

        })
    },[]),200)

    
    return (
            <div id="loginDiv">
            <h4>로그인</h4>
            <Form onSubmit={submitHandler}>
                <Input required bsSize="sm" id="loginId" type="text" name="id" placeholder="ID"></Input>
                <Input required bsSize="sm" id="loginPw" type="password" name="pw" placeholder="PASSWORD"></Input>
                <Button color="primary" size="sm" type="submit" style={{marginRight : "5px"}}>LOGIN</Button>
                <Button onClick={popupChange} type="button" size="sm">회원가입</Button>
            </Form>
            </div>
    )
}

const mapStateToProps = ({ board }) => ({
    user: board.user,
});

//스토어의 액션을 조작할 수 있게 해줌
const mapDispatchToProps = dispatch => ({
    boardActions: bindActionCreators(boardActions, dispatch),
    // AnotherActions: bindActionCreators(anotherActions, dispatch)
});
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Login);
