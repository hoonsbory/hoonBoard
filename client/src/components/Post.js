import React, { useEffect } from 'react'
import Editor from './Editor'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as boardActions from '../store/modules/board';
const Post = ({ match, boardActions, viewPost, user }) => {

  const handleTrigger = () => {
    boardActions.renderTrigger()
  }
  useEffect(() => {
    if (!user.id) {
      document.getElementById("goHome").click()
      setTimeout(() => {
        document.getElementsByClassName("writeClass")[0].click()
      }, 1000);
    }
  }, [])

  return (
    <div>
      <Editor params={match.params.update} viewPost={viewPost} renderTrigger={handleTrigger}></Editor>
    </div>
  )
}
const mapStateToProps = ({ board }) => ({
  viewPost: board.viewPost,
  renderTrigger: board.renderTrigger
});

// 이런 구조로 하면 나중에 다양한 리덕스 모듈을 적용해야 하는 상황에서 유용합니다.
const mapDispatchToProps = dispatch => ({
  boardActions: bindActionCreators(boardActions, dispatch),
  // AnotherActions: bindActionCreators(anotherActions, dispatch)
});
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Post);

