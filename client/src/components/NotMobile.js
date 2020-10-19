import React, { useEffect , useCallback} from 'react'
import PaginationComponent from "react-reactstrap-pagination";
import { Button } from 'reactstrap'
import '../css/board.scss'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux';

const NotMobile = ({ list2, totalPage, pageChange, dateCompare, pageNum, user }) => {
    //axios를 변수에 담지않고 렌더링전에 그냥 실행시키면 자꾸 무한 루프를 돈다. 이유는 모르겠다. 
    //정확히는 변수밖에서 실행된 axios안에서 state를 변경하면 무한 루프를 돈다. 그래서 useEffect로 데이터를 받기 전까지는
    //안보이게 해놓고 받으면 div가 나타나게 해놨다.

    const handleSelected = useCallback((selectedPage) => {
        pageChange(selectedPage, 10, false)
    },[])

    useEffect(() => {
        document.getElementsByClassName("pagination")[0].parentElement.style.display = "inline"
        document.getElementsByClassName("pagination")[0].parentElement.style.marginLeft = "60px"
    }, [])

    const writeBtn = useCallback(() => {
        if (!user.id) {
            alert("로그인이 필요합니다")
            return
        } else {
            document.getElementById("writeLink").click()
        }

    },[user])
    
    return (
        <div>
            <ul style={{ listStyleType: "none", padding: "0" }}>

                {list2.map((data, index) => {
                    return (
                        <li key={index} className={data.thumbnail ? "boardList" : "boardList thumbnailLess"}>
                            <Link to={"/view/?postId=" + data.postId}>
                                {data.thumbnail ?
                                    <div className="right pc">
                                        <i>
                                            <img src={"https://jaehoon-bucket.s3.ap-northeast-2.amazonaws.com/" + data.thumbnail} alt="" />
                                        </i>
                                    </div> : ""
                                }
                                <div className={data.thumbnail ? "left thumbnail" : "left"}>
                                    <h3>{data.title}</h3>
                                    <dl className="write-info mb-2">
                                        <dd className="writer">{data.userId}</dd>
                                        {data.thumbnail ? <dd className="date thumbnail">{dateCompare(data.updatePost)}</dd> : <dd className="date">{dateCompare(data.updatePost)}</dd>}
                                        <dd className="etc">
                                            <span id="count-comment" className="iconSpan">{data.commentCount}</span>

                                            <span id="count-read" className="iconSpan">{data.views}</span>
                                            <span id="count-likes" className="iconSpan">{data.likeCount}</span>
                                        </dd>
                                    </dl>
                                </div>
                            </Link>
                        </li>)
                }
                )}
            </ul>
            <div style={{ textAlign: "center" }}>
                {/* 페이징처리. 서버에서 row의 개수를 받아와서 10개 미만일시에는 1페이지만 나오게 10개 이상일때는 10을 나누어주어서 알맞게 나오게함 */}
                <PaginationComponent
                    totalItems={totalPage < 10 ? 1 : totalPage / 10}
                    pageSize={1}
                    onSelect={handleSelected}
                    maxPaginationNumbers={5}
                    defaultActivePage={pageNum === 1 ? 1 : pageNum -1}
                    size="sm"
                />
                <Link id="writeLink" to="/post/false"></Link>
                <Button  className="writeClass" onClick={writeBtn} style={{ float: "right", position: "relative", right: "15px" }} size="sm" color="primary">글쓰기</Button>
            </div>
        </div>
    )
}

const mapStateToProps = ({ board }) => ({
    list2: board.list2,
    user: board.user,
    totalPage : board.totalPage,
    pageNum : board.pageNum
});

export default connect(
    mapStateToProps
)(NotMobile);