import axios from 'axios'


const Axios = (user,handleUser,renderTrigger) => {

    return {
        async axiosPost(url, data, callback, error) {
            await axios.post(url, data)
                .then(res => {
                    if (callback) callback(res)
                }).catch(err => {
                    if (error) {
                        error()
                    }
                    else {
                        if(err.response.data === "retry" && user){
                            if(window.confirm("로그인 기한이 만료되었습니다. 재로그인 하시겠습니까?")){
                                axios.post('/api/reLogin', {data : {user : user}})
                                .then(res=>{
                                    renderTrigger()
                                    if(document.getElementById("loadingBg")) document.getElementById("loadingBg").style.display = "none"
                                    alert('안전하게 로그인되었습니다.');
                                })
                            }else{
                                if(document.getElementById("loadingBg")) document.getElementById("loadingBg").style.display = "none"
                                handleUser()
                            }
                        }else{
                            alert("잘못된 요청입니다. 다시 로그인해주세요.")
                        }
                    }
                })
        },
        axiosGet(url, callback, error) {
            axios.get(url)
                .then(res => {
                    if (callback) callback(res)
                }).catch(err => {
                    if (error) {
                        error()
                    }
                    else {
                        alert("잘못된 요청입니다.")
                    }
                })
        }
    };
};

// const mapStateToProps = ({ board }) => ({
//     user: board.user,
//     likeCheck: board.likeCheck,
//     renderTrigger: board.renderTrigger,
//     viewPost: board.viewPost
// })

// const mapDispatchToProps = dispatch => ({
//     boardActions: bindActionCreators(boardActions, dispatch),
// })


export default Axios
