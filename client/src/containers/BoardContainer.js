import React, { useEffect, useState, useCallback } from 'react';
import Axios from "axios"
import NotMobile from '../components/NotMobile';
import Mobile from '../components/Mobile';
import Post from '../components/Post';

import { List } from 'react-virtualized';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as boardActions from '../store/modules/board';
import Header from '../components/Header'
import { Route } from 'react-router-dom'
import ViewPost from '../components/ViewPost';

const BoardContainer = ({ boardActions, list, list2, pageNum, search, input, scroll, user,  renderTrigger }) => {
    const [totalPage, setTotalPage] = useState(5);
    const [pageSize, setPageSize] = useState(0);
    const [reload, setReload] = useState(false);


    window.addEventListener("resize", useCallback(() => {
        if (ua()) {
            document.getElementById("boardNav").style.width = "100%"
            document.body.style.width = "100%"
            if (document.getElementsByClassName("postList")[0]) {
                //가로모드 세로모드 전환 시 화면 꽉차게 변경
                document.getElementsByClassName("postList")[0].style.width = "100%"
                document.getElementsByClassName("ReactVirtualized__Grid__innerScrollContainer")[0].style.width = "100%"
                document.getElementsByClassName("ReactVirtualized__Grid__innerScrollContainer")[0].style.maxWidth = "none"
                document.getElementsByClassName("postList")[0].style.height = window.innerHeight + "px"
                document.getElementsByClassName("ReactVirtualized__Grid__innerScrollContainer")[0].style.height = window.innerHeight + "px"
                document.getElementsByClassName("ReactVirtualized__Grid__innerScrollContainer")[0].style.maxHeight = "none"
                document.getElementById("boardUl").style.height = window.innerHeight + "px"
            }
        } else {
            document.getElementById("boardNav").style.width = "900px"
            document.body.style.width = "900px"
        }
    },[]))

    const ua = () => {
        // return window.innerWidth <= 900 ? true : false
        return navigator.userAgent.indexOf("Mac") > -1 || navigator.userAgent.indexOf("Mobile") > -1 || navigator.userAgent.indexOf("iPad") > -1 || navigator.userAgent.indexOf("iPhone") > -1
    }
    const handleChange = (e) => {
        boardActions.search(e.target.value)
    }
    const handleChangeInput = (e) => {
        boardActions.changeInput(e.target.value.trim())
    }
    const handleChangePageNum = (e) => {
        boardActions.pageNum(e)
    }
    const handleChangeScroll = (e) => {
        boardActions.scroll(e)
    }
    const handleChangeUser = (e) => {
        boardActions.user(e)
    }
    //무한스크롤버전과 번호형식의 페이징버전을 한 함수로 통일하려고 했지만,
    //스크롤 이벤트가 발생하고 state를 갱신후 loop를 통해 노드를 생성하는데, 훅의 usestate를 써도, 리덕스를 써도 ,async와 await을 사용해도 갱신된 state가 같은 함수내에서 표현이 안된다.
    //settimeout을 통해 다른 함수로 꺼내놓고 실행을 해도 안된다. 
    //그래서 결국 스크롤이 진행되면 1번째때 받아온 리스트를 2번쨰의 이벤트에서 노드생성을 한다. 이렇게되면 마지막에 불필요한 쿼리를 날린다.
    //예 -> 비동기처리방식 때문에 스토어에 10번째 리스트가 있으면 실제로 스크롤때 생성되는건 9번째기때문에. 마지막 10번째 리스트를 생성하기 위해선
    //11번째 리스트를 부르기위한 쿼리를 날려야한다.


    const pageChange = async (selectedPage, size, mobileReload) => {
        //모바일 기기 가로 세로 전환 시 뷰포트의 높이에 따라 생성되던 리스트 길이가 달라지기 때문에, 데이터의 순서가 꼬인다. 
        //높이가 달라져도 유지할 수 있게 조건을 넣어줌.
        if (pageSize !== 0 && pageSize !== size) size = pageSize
        await Axios.post('/api/boardList', { page: selectedPage, size: size, search: search, input: input, mobileReload: mobileReload })
            .then((res) => {
                if(!res.data.list){
                    alert('검색결과가 없습니다');
                    return
                }
                setTotalPage(res.data.length)
                if (!ua()) {
                    //번호 페이징형식의 리스트
                    boardActions.list2(res.data.list)
                }
                else {
                    //무한스크롤의 두번째부터 리스트
                    //좋아요를 누르거나 댓글을 등록하고나서 정보를 다시 로드해야하기 떄문에, 쿼리에서 limit를 다시 설정해줄 필요가 있어서 조건을 걸어주었다.
                    if(mobileReload) 
                    boardActions.mobileReload(res.data.list)
                    else 
                    boardActions.list(res.data.list)
                }
                boardActions.pageNum(selectedPage)
                setPageSize(size)

            })
    }


    useEffect(() => {
        Axios.get('/api/sessionCheck')
        .then(res => {
            if(res.data.id)
            handleChangeUser(res.data)
        })
        if (ua()) {
            //쿼리에서 limit를 정할때 뷰포트의 높이값에서 li태그를 나눈 값으로 한다. 어느 기기에서든 리스트 길이가 딱들어맞는다.
            pageChange(1, Math.round(window.innerHeight / 86), false)
            document.getElementById("boardNav").style.width = "100%"
            document.body.style.width = "100%"
            document.querySelector('html').style.overflow = "unset"
        } else {
            document.querySelector('html').style.overflow = "unset"
            pageChange(0, 10, false)
        }
        document.getElementById("boardDiv").style.display = "block"
    }, [])

    //댓글등록, 좋아요 등 정보가 바뀔시에 렌더링.
    useEffect(() => {
        //state가 이전과 같은 값이기 떄문에 렌더링이 일어나면 안되는데, axios를 통해 받아서 넣는건 렌더링이 일어난다. 분명 리덕스 콘솔에도 state가 이전과 값이 같다고 나오지만
        //렌더링은 된다.. 이유가 뭘까
       
        if (reload) {
            if (!ua()) {
                pageChange(pageNum - 1, 10, false)
            } else {
                pageChange(pageNum - 1, Math.round(window.innerHeight / 86), true)
            }
        }
        setReload(true)
        
    }, [renderTrigger])

    //그냥 loop를 컴포넌트에서 꺼내와서 여기에서 썼다. 스토어든 useState든 자식에게 넘길떄 함수내에서 동기 처리가 되지않아서.
    //그냥 부모로 가져와서 자식에게 리스트를 뿌려주는 걸로 변경했다. 부모에서도 state는 비동기처리지만, useEffect로 state의 변경을
    //감지해서 리스트를 뿌려주도록 설계했다. 
    //피씨와 모바일 컴포넌트를 이쁘게 분리하고 싶었지만 결국 실패했다. 


    //db에서 받아오는 객체는 제로필이 되어있어서 시간 비교를 위해 직접 포맷코딩함
    const dateFormat = useCallback((n, digits) => {
        var zero = '';
        n = n.toString();

        if (n.length < digits) {
            zero += '0';
        }
        return zero + n;
    },[])

    const dateCompare = useCallback((postDate) => {
        var date = new Date();
        var today =
            date.getFullYear() + '-' +
            //month는 1월이 0으로 표현
            dateFormat(date.getMonth() + 1, 2) + '-' +
            dateFormat(date.getDate(), 2);
        if (today !== postDate.substr(0, 10)) {

            return postDate
        } else {
            return postDate.substr(11, 5)
        }
    },[])

    const rowRenderer = useCallback(
        () => {
            return (
                <Mobile user={user} dateCompare={dateCompare} scroll={scroll} handleChangeScroll={handleChangeScroll} pageNum={pageNum} list={list} list2={list2} pageChange={pageChange} totalPage={totalPage}

                />
            );
        },
    );

    //함수를 최대한 재활용하고 싶어서, 데이터를 받아오는 함수를 하나로 만들어서 공유할 수 있게 했지만,
    //무한스크롤인 모바일버전에서 아무리 값을 잘받아와도, state가 바로 갱신이 되지가 않는다.. 이유을 모르겠다. 이거 때문에 6시간가까이를 삽질을 했다.
    //훅을 배우고 기쁜 나머지, 함수형과 클래스형의 장단점도 모른 채 훅을 사용한 것 같다. 항상 공부보다는 닥치고 코딩하는 습관 덕에, 구글링만 늘고, 개념은 텅텅 비었다.
    //제발 개념정리를 잘하자.. 당장 실행되는게 전부가 아니다.. 알면서도 항상 안되네 ㅜ

    //그냥 깔끔함은 포기했다. 그래도 나눠진 컴포넌트에서라도 이쁘게 정리를 잘해야겠따.
    //그리고 무한스크롤은 노드가 많아질수록 버벅임이 심해져서, react-virtualized를 통해서 뷰포트 상에 들어오는 노드들만 보이게 처리해서 속도가 아주빠르다.
    return (
        <div id="boardDiv" style={{ display: "none" }}>
            <Header handleChangeUser={handleChangeUser} user={user} handleChangePageNum={handleChangePageNum} pageSize={pageSize} handleChangeInput={handleChangeInput} ua={ua} search={search} handleChange={handleChange} pageChange={pageChange}></Header>
            <div style={{ marginTop: "40px" }}>
                <Route path="/view/:postNum"  render={({match})=> <ViewPost match={match} dateCompare={dateCompare}></ViewPost>} ></Route>
                <Route path="/post/:update"  render={({match})=> <Post match={match} user={user}></Post>}></Route>
                {ua() ?
                    <Route exact path="/" render={() => <List
                        className="postList"
                        width={window.innerWidth}
                        height={window.innerHeight - 40}
                        rowCount={1}
                        rowHeight={window.innerHeight - 40}
                        rowRenderer={rowRenderer}
                    />}></Route>
                    :
                    <Route exact path="/" render={() => <NotMobile user={user} pageNum={pageNum} dateCompare={dateCompare} list2={list2} totalPage={totalPage} pageChange={pageChange}></NotMobile>}></Route>
                }
            </div>



        </div>
    )
}
//스토어 객체에 접근할 수 있게 해줌.
const mapStateToProps = ({ board }) => ({
    input: board.input,
    list: board.list,
    list2: board.list2,
    pageNum: board.pageNum,
    search: board.search,
    user: board.user,
    scroll: board.scroll,
    renderTrigger: board.renderTrigger
});

//스토어의 액션을 조작할 수 있게 해줌
const mapDispatchToProps = dispatch => ({
    boardActions: bindActionCreators(boardActions, dispatch),
    // AnotherActions: bindActionCreators(anotherActions, dispatch)
});
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(BoardContainer);
