import React, { useEffect, useState, useCallback } from 'react';
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
import { debounce } from 'lodash'
import { Helmet } from 'react-helmet-async'
import Error from '../components/Error'
import axios from '../Axios'

const BoardContainer = ({ boardActions, search, input, renderTrigger }) => {
    const [reload, setReload] = useState(false);
    const axiosfunc = axios("")



    window.addEventListener("resize", useCallback(() => {
        if (ua()) {
            document.getElementById("boardNav").style.width = "100%"
            document.body.style.width = "100%"
            if (document.getElementsByClassName("postList")[0]) {
                //가로모드 세로모드 전환 시 화면 꽉차게 변경
                document.getElementsByClassName("postList")[0].style.width = "100%"
                document.getElementsByClassName("ReactVirtualized__Grid__innerScrollContainer")[0].style.width = "100%"
                document.getElementsByClassName("ReactVirtualized__Grid__innerScrollContainer")[0].style.maxWidth = "none"
                document.getElementsByClassName("postList")[0].style.height = window.innerHeight - 40 + "px"
                document.getElementsByClassName("ReactVirtualized__Grid__innerScrollContainer")[0].style.height = window.innerHeight - 40 + "px"
                document.getElementsByClassName("ReactVirtualized__Grid__innerScrollContainer")[0].style.maxHeight = "none"
                document.getElementById("boardUl").style.height = window.innerHeight - 40 + "px"
                document.getElementById("boardUl").parentElement.style.height = window.innerHeight - 40 + "px"
            }
        } else {
            document.getElementById("boardNav").style.width = "900px"
            document.body.style.width = "900px"
        }
    }, []))
    const ua = () => {
        // return window.innerWidth <= 900 ? true : false
        return navigator.userAgent.indexOf("Mac") > -1 || navigator.userAgent.indexOf("Mobile") > -1 || navigator.userAgent.indexOf("iPad") > -1 || navigator.userAgent.indexOf("iPhone") > -1
    }
    const handleChange = (e) => {
        boardActions.search(e.target.value)
    }
    const handleChangeInput = (e) => {
        var value = e.target.value.trim()
        debounceFunc(value)
    }

    //한 300밀리세컨드정도로 설정하고싶은데, 검색버튼을 통해 통신하기때문에, 정해진 밀리세컨드보다 빨리 버튼을 누르면 검색이벤트함수에서 값을 못읽는다..
    const debounceFunc = debounce((value) => {
        boardActions.changeInput(value)
    }, 100)

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
        var pageSize = parseInt(sessionStorage.getItem("pageSize"))
        if (pageSize && pageSize !== size) size = pageSize
            await axiosfunc.axiosPost('/api/boardList', { page: selectedPage, size: size, search: search, input: input, mobileReload: mobileReload }, (res) => {
                if (!res.data.list) {
                    alert('검색결과가 없습니다');
                    return
                }
                if (document.getElementById("pageLoading"))
                    document.getElementById("pageLoading").remove()
                boardActions.totalPage(res.data.length)
                if (!ua()) {
                    //번호 페이징형식의 리스트
                    boardActions.list2(res.data.list)
                }
                else {
                    //무한스크롤의 두번째부터 리스트
                    //좋아요를 누르거나 댓글을 등록하고나서 정보를 다시 로드해야하기 떄문에, 쿼리에서 limit를 다시 설정해줄 필요가 있어서 조건을 걸어주었다.
                    if (mobileReload) {
                        boardActions.mobileReload(res.data.list)
                    }
                    else {
                        boardActions.list(res.data.list)
                        if(!document.getElementById("pageLoading")){
                            var loading = document.createElement('img')
                            loading.src = "https://jaehoon-bucket.s3.ap-northeast-2.amazonaws.com/1601446938150loading.gif"
                            loading.id = "pageLoading"
                            loading.width = 60
                            document.getElementById("boardUl").appendChild(loading)
                            }
                    }
                }
                //과도하게 컨테이너 하나로 운영하려다가 렌더링 폭격맞고 조금이라도 줄여보려고 state를 sessionStorage로 바꿈 ㅜ
                //현재는 불필요한 렌더링이 페이지 로드할 때 딱 한번 더 일어나는 것 말고는 없다.
                //나는 뭔가 컨트롤 타워마냥 한 군데에서 뿌려주는 것이 깔끔해보여서 컨테이너하나로 시작했는데, 컨테이너에서 state의 변경까지만 하고
                //state값을 사용하지는 말았어야 했다. 너무 함수의 재활용에만 집중해서 설계를 잘못했다.
                sessionStorage.setItem("pageNum", selectedPage)
                boardActions.pageNum(parseInt(selectedPage))
                sessionStorage.setItem("pageSize", size)
            })
    }


    useEffect(() => {
        //첫렌더링시 유저검증하고, height값에 따라 pageSize 결정 후 reload값을 true로 줘서 다음 렌더링부터는 다른 조건 적용.
        if (!reload) {
            setReload(true)
            sessionStorage.setItem("pageSize", "")
            axiosfunc.axiosGet('/api/sessionCheck',(res)=>{
                if (res.data.id) handleChangeUser(res.data)
            })
            if (ua()) {
                //쿼리에서 limit를 정할때 뷰포트의 높이값에서 li태그를 나눈 값으로 한다. 어느 기기에서든 리스트 길이가 딱들어맞는다.
                pageChange(1, Math.round(window.innerHeight / 50), false)
                document.getElementById("boardNav").style.width = "100%"
                document.body.style.width = "100%"
                document.querySelector('html').style.overflow = "unset"
            } else {
                document.querySelector('html').style.overflow = "unset"
                pageChange(0, 10, false)
            }
            document.getElementById("boardDiv").style.display = "block"
        } else {
            //댓글등록, 좋아요 등 정보가 바뀔시에 렌더링.
            if (!ua()) {
                pageChange(sessionStorage.getItem("pageNum"), 10, false)
            } else {
                pageChange(sessionStorage.getItem("pageNum"), Math.round(window.innerHeight / 50), true)
            }
        }
    }, [renderTrigger])



    //db에서 받아오는 객체는 제로필이 되어있어서 시간 비교를 위해 직접 포맷코딩함
    const dateFormat = useCallback((n, digits) => {
        var zero = '';
        n = n.toString();

        if (n.length < digits) {
            zero += '0';
        }
        return zero + n;
    }, [])

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
    }, [])

    const rowRenderer = useCallback(
        () => {
            return (
                <Mobile dateCompare={dateCompare} handleChangeScroll={handleChangeScroll} pageChange={pageChange}

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
            <Helmet>
                <title>FullStack Junior's Note</title>
                <meta property="og:title" content="FullStack Junior's Note" />
                <meta property="og:description" content="풀스택 주니어의 웹개발노트입니다." />
                <meta property="og:site_name" content="FullStack Junior's Note" />
                <link rel="canonical" href="https://hoondevnote.ml" />
                <meta name="description" content="풀스택 주니어의 웹개발노트입니다."></meta>
                <meta property="twitter:title" content="FullStack Junior's Note" />
                <meta property="twitter:description" content="풀스택 주니어의 웹개발노트입니다." />
                <meta property="twitter:site" content="FullStack Junior's Note" />
            </Helmet>
            <Header handleChangeUser={handleChangeUser} handleChangeInput={handleChangeInput} ua={ua} search={search} handleChange={handleChange} pageChange={pageChange}></Header>
            <div style={{ marginTop: "40px" }}>
                <Route path="/error" render={({ location }) => <Error location={location}></Error>}></Route>
                <Route path="/view" render={({ location, match }) => <ViewPost location={location} match={match} dateCompare={dateCompare}></ViewPost>} ></Route>
                <Route path="/post/:update" render={({ match }) => <Post match={match} ></Post>}></Route>
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
                    <Route exact path="/" render={() => <NotMobile dateCompare={dateCompare} pageChange={pageChange}></NotMobile>}></Route>
                }
            </div>



        </div>
    )
}
//스토어 객체에 접근할 수 있게 해줌.
const mapStateToProps = ({ board }) => ({
    input: board.input,
    search: board.search,
    renderTrigger: board.renderTrigger,
    reload: board.reload
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
