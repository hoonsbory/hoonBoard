import GetOffset from './GetOffset'
import GetCursorNode from './GetCursorNode'
import hljs from 'highlight.js/lib/core'

export default async function CodeKeyDown(){
    //코드에 하이라이트가 적용되면 커서가 맨앞으로 이동한다.
    //이를 처리하기 위해 커서 핸들링이 필요하다.
    //단순하게 현재 위치를 기억한 후 하이라이트 적용 후 커서를 옮겨주면 된다.
    //그러나 언어에 따라서 태그의 구조가 다르기 때문에, 완전탐색을 통해 최하위의 모든 Text노드를 탐색해서 length를 통해 커서 위치를 구해야한다.
    try {
        var node = window.getSelection().getRangeAt(0)
          // var offset = node.startContainer.length - node.startOffset
          var syntax = node.startContainer.parentElement
          while(true){ //편집중인 코드블락의 root 노드를 찾는다.
            if(syntax.className.indexOf("syntax") > -1) break
            else syntax = syntax.parentElement
          }
          //완전탐색을 통해 모든 text 노드까지 탐색한 후 text의 length를 더해서 커서 위치를 찾아낸다.
          var offset =  GetOffset(syntax.firstChild, node.startContainer,node.startOffset)
          
          var range, selection;
          
          //하이라이트된 html에 또 블락을 씌우면 쓸 데 없는 태그가 중첩되기때문에 text만 빼서 다시 블락을 씌운다.
          //편집중인 코드가 html이면 이스케이프 문자인 <를 아스키코드로 바꿔줘야함. 코드를 태그로 인식하기때문
          var syntaxText = syntax.innerText
          syntax.innerHTML = syntaxText.replace(/</g, "&lt;")
          await hljs.highlightBlock(syntax);    
  
  
  
          range = document.createRange()
          //완전탐색을 통해 모든 text 노드까지 탐색하여 length카운트 후 이전 커서위치에 도달하면 커서가 속한 node 리턴.
          var [targetNode, targetOffset] = GetCursorNode(syntax.firstChild,offset)
          range.selectNodeContents(targetNode)
          //찾아낸 노드를 기준으로 해당 offset까지 range 설정
          range.setEnd(targetNode,targetNode.length-targetOffset)
          range.collapse(false);//true는 텍스트의 시작점에 커서가 위치, false는 반대
          selection = window.getSelection();//셀렉션 객체 가져옴
          selection.removeAllRanges();//만들어져있던 모든 range제거 후
          selection.addRange(range);//위에서 만든 range를 window에 추가하므로 커서 변경.
      } catch (error) {
        document.getElementsByClassName("ql-editor")[0].focus()
        return
      }
}