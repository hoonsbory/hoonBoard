import React, { useEffect, useCallback } from 'react';
import '../css/quill.snow.css';
import hljs from 'highlight.js/lib/core'
import 'highlight.js/styles/railscasts.css'
import ReactQuill, { Quill } from 'react-quill';
import { Button } from 'reactstrap'
import ImageResize from 'quill-image-resize-module-fix-for-mobile';
import { debounce } from 'lodash'
import Loading from './Loading';
import javascript from 'highlight.js/lib/languages/javascript';
import css from 'highlight.js/lib/languages/css';
import html from 'highlight.js/lib/languages/xml';
import java from 'highlight.js/lib/languages/java';
import json from 'highlight.js/lib/languages/json';
import bash from 'highlight.js/lib/languages/bash';
import sql from 'highlight.js/lib/languages/sql';
import axios from '../Axios'

Quill.register('modules/ImageResize', ImageResize);


hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('css', css);
hljs.registerLanguage('html', html);
hljs.registerLanguage('java', java);
hljs.registerLanguage('json', json);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('sql', sql);


const Editor = ({ user, params, renderTrigger, viewPost, handleUser }) => {
  //s3에 업로드된 이미지 배열
  // const [finalFiles, setFinalFiles] = useState([1])

  //굳이 에디터의 값을 state로 핸들링할 필요가 없어서 지웠다. 그냥 innerHtml로 대체했다.
  // const handleChange = (editorState) => {
  //   setText(editorState)
  // };
  const axiosfunc = axios(handleUser,renderTrigger)

  const modules = {
    ImageResize: {
      displaySize: true
    },
    toolbar: [
      //      [{ 'header': [1, 2, 3, 4, 5, false] }, { 'font': [] }],
      //      ['bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block'],
      //      [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
      //      ['link', 'image', { 'color': [] }, { 'background': [] }],
      //      ['clean']
      ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
      ['blockquote', 'code-block', 'image', 'link'],

      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'script': 'sub' }, { 'script': 'super' }],      // superscript/subscript
      [{ 'indent': '-1' }, { 'indent': '+1' }],          // outdent/indent
      //  	[{ 'direction': 'rtl' }],                         // text direction

      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

      [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
      [{ 'font': [] }],
      [{ 'align': [] }],

      ['clean']
    ],
  }
  const style = {
    height: `${window.innerHeight - 240}px`
  }

  const onKeyDown = debounce(useCallback((e) => {
    try {
      var node = window.getSelection().getRangeAt(0)
      if (node.startContainer.parentElement.className.indexOf("ql-syntax") > -1) {
        var offset = node.startContainer.length - node.startOffset
        //코드블락이 씌워지면 커서가 0번째 문자로 간다.
        //그래서 원래 있던 커서 위치를 기억해놨다가 다시 설정해줘야하는데.
        //커서 위치를 기억해놔도 span태그 등으로 블락이 씌워지면 인덱스가 다 바뀌기 떄문에
        //제 위치를 찾을 수가 없다.
        //진짜 삽질에 삽질을 거듭해서 조건문을 겨우 간추렸다... if문만 3개에서 4개정도 썼는데... 몇시간째 붙잡다보니까 머리가 굳었나보다. 하나면 될것을..
        //커서위치조정은 collapse로 선택된 노드의 양끝으로 이동가능한 것 같다. 아무리 구글링해도 안나옴 ㅜ
        //그래서 selectNodeContents를 통해 원하는 위치까지만 선택해서 끝으로 커서를 이동시켜줬다.
        var syntax = node.startContainer.parentElement
        var beforeNode = node.startContainer
        var beforeNodeCount = node.startContainer.parentElement.childNodes.length
        var beforeNodeIndex = getIndex(beforeNode)
        var range, selection;

        //코드블락이 된 상태에서 또 코드블락이 씌워져서 겉으로는 멀쩡하지만 불필요한 태그가 계속 중첩되어 덮어씌워진다.
        //그래서 코드블락 직전에, 텍스트만 빼내서 innerHTML로 넣어준다. innerText로는 enter가 감지안됨.
        var syntaxText = syntax.innerText
        syntax.innerHTML = syntaxText.replace(/</g, "&lt;")
        hljs.highlightBlock(syntax);
        range = document.createRange()
        range.selectNodeContents(node.startContainer)

        //커서위치의 노드가 마지막노드면 그냥 에디터의 마지막 노드에서 커서 조정.
        // if (nextSibling) {
        var afterNodeCount = node.startContainer.childNodes.length;
        //코드블락이 새로 생긴 경우, 그 전의 노드 수를 비교해서 처리했다.
        if (afterNodeCount !== beforeNodeCount) {
          //계산을 통해 늘어난 자식수를 구해서 커서가 위치했던 노드인덱스와 더해주면, 코드블락이 생성된 후의 위치를 잡아낼 수 있다.
          var insertBeforeNode = (afterNodeCount - beforeNodeCount) + (beforeNodeIndex)
          range.setEnd(node.startContainer.childNodes[insertBeforeNode], node.startContainer.childNodes[insertBeforeNode].length - offset)
          //코드블락이 적용되지 않은 경우엔 그대로 같은 인덱스를 통해서 커서를 잡아준다.
        } else {
          range.setEnd(node.startContainer.childNodes[beforeNodeIndex], node.startContainer.childNodes[beforeNodeIndex].length - offset)
        }
        // }
        //  else {
        //   range.setEnd(node.startContainer.lastChild, node.startContainer.lastChild.length - offset)
        // }
        range.collapse(false);//true는 텍스트의 시작점에 커서가 위치, false는 반대
        selection = window.getSelection();//셀렉션 객체 가져옴
        selection.removeAllRanges();//만들어져있던 모든 range제거 후
        selection.addRange(range);//위에서 만든 range를 window에 추가하므로 커서 변경.

      }
    } catch (error) {
      document.getElementsByClassName("ql-editor")[0].focus()
      return
    }
  }, []), 1000)
  //quill에서 img가 base64로 인코딩되어 태그가 삽입되는데, 이 긴 문자열을 전부 db에 저장할 수 는 없다.
  //이미지를 올릴때 이미지태그를 찾아 이미지를 s3에 업로드하여 저장한 후 s3링크를 삽입하는 로직을 짜야겠따.




  var file2 = []
  var files = [];
  var editor;
  var input;
  // const history = useHistory(); //react router 5버전부터 사용가능하다고 한다. 
  //history.push("/view/"+res.data) 이런 식으로 사용가능. 원래는 withrouter나 browserHistory로 모듈을 감싸서 사용했는데 이게 좀 더 깔끔한거 같다.
  const sendPost = debounce(useCallback(async () => {
    editor = document.getElementsByClassName("ql-editor")[0]
    input = document.getElementById("postTitle")
    if (input.value.trim().length === 0) {
      alert("제목을 입력해주세요")
      return
    }
    if (editor.innerText.trim().length === 0) {
      alert("내용을 입력해주세요")
      return
    }

    document.getElementById("loadingBg").style.display = "block"
    //반복문을 통해 base64 이미지를 파일로 변환후 s3에 업로드한다. 그리고 리턴받은 url을 src에 넣어준다
    if (params !== "update") {
      for (var i = 0; i > -1; i++) {
        if (editor.getElementsByTagName("img")[i]) {
          //내가 만든 에디터의 버튼을 통해 업로드하면 파일이름을 받아서 alt값으로 넣어주는데, 그림을 복사해서 에디터에 붙여넣기를 해버리면, 
          //alt값이 없는 경우도 있고, 아니면 이미 호스팅되고 있는 이미지를 가져와버리면 에러가 나기 때문에 처리를 해줘야 함.
          if (editor.getElementsByTagName("img")[i].src.indexOf("http") === -1) {
            var file = dataURLtoFile(editor.getElementsByTagName("img")[i].src, editor.getElementsByTagName("img")[i].alt || "unknown")
            const formData = new FormData();
            formData.append('file', file);
            formData.append('name', file.name);
            await axiosfunc.axiosPost('/api/uploadTest', formData, (res) => {
              editor.getElementsByTagName("img")[i].src = res.data
            })
          }
        } else {
          await axiosfunc.axiosPost('/api/editorTest', {
            user : user,
            content: editor.innerHTML,
            thumbnail: editor.getElementsByTagName("img")[0] ? editor.getElementsByTagName("img")[0].src.split("https://jaehoon-bucket.s3.ap-northeast-2.amazonaws.com/")[1] : "",
            title: input.value.trim(),
            description: editor.textContent.trim().substr(0, 150)
          }, (res) => {
            renderTrigger()
            document.getElementById("loadingBg").style.display = "none"
            alert('글이 등록되었습니다!');
            window.location.href = "/view/" + res.data
            // history.push("/view?postId=" + res.data)
          })
          break;
        }
      }
    } else { //수정할 때
      //s3에 잉여 이미지가 남지않고, 불필요한 업로드나 삭제를 최소화 하기 위한 로직. 두 개의 반복문을 통해, 수정 후 그대로인 이미지는 냅두고, 삭제되거나 추가된 이미지만 따로 처리했다.
      for (var i2 = 0; i2 > -1; i2++) {
        //반복문을 통해서 유저가 업로드한 이미지를 배열에 넣는다.
        var check = false;
        if (editor.getElementsByTagName("img")[i2]) {
          file2.push(editor.getElementsByTagName("img")[i2].src)
        } else {
          break;
        }
      }
      //files는 수정전에 존재하던 이미지 배열, file2는 수정후의 이미지 배열
      //loop1은 수정후에는 존재하지않는 삭제해야할 이미지를 걸러내서 삭제하는 반복문이다.
      if (file2[0]) {
        loop1: for (var i3 = 0; i3 < files.length; i3++) {
          for (var j3 = 0; j3 < file2.length; j3++) {
            if (files[i3] === file2[j3]) {
              check = true;
              continue loop1;
            } else {
              check = false;
            }
          }
          if (!check) {
            await axiosfunc.axiosPost('/api/deleteImg', {
              //한글로 된 파일명이 있기때문에 디코딩해줘야 삭제가 된다. url은 인코딩된 값이지만 s3의 객체 키값은 한글로 들어가있어서 한글로 키값을 보내줘야 삭제가능.
              data: decodeURI(files[i3].split("https://jaehoon-bucket.s3.ap-northeast-2.amazonaws.com/")[1])
            })
          }
        }

        //loop2는 새롭게 추가된 이미지를 s3에 업로드하는 반복문이다.
        loop2: for (var i4 = 0; i4 < file2.length; i4++) {
          for (var j4 = 0; j4 < files.length; j4++) {
            if (file2[i4] === files[j4]) {
              check = true
              continue loop2;
            } else {
              check = false
            }
          }
          if (!check) {
            var fileInfo = dataURLtoFile(editor.getElementsByTagName("img")[i4].src, editor.getElementsByTagName("img")[i4].alt)
            const formData = new FormData();
            formData.append('file', fileInfo);
            formData.append('name', fileInfo.name);
            await axiosfunc.axiosPost('/api/uploadTest', formData, (res) => {
              editor.getElementsByTagName("img")[i4].src = res.data
            })
          }
        }
      } else {
        //사용자가 올렸던 사진을 전부 삭제했을 때
        files.forEach(async (i) => {
          await axiosfunc.axiosPost('/api/deleteImg', {
            data: decodeURI(i.split("https://jaehoon-bucket.s3.ap-northeast-2.amazonaws.com/")[1])
          })
        })
      }


      await axiosfunc.axiosPost('/api/updatePost', {
        user : user,
        content: editor.innerHTML,
        thumbnail: editor.getElementsByTagName("img")[0] ? editor.getElementsByTagName("img")[0].src.split("https://jaehoon-bucket.s3.ap-northeast-2.amazonaws.com/")[1] : "",
        title: input.value.trim(),
        postId: viewPost.postId,
        description: editor.textContent.trim().substr(0, 150)
      }, (res) => {
        renderTrigger()
        document.getElementById("loadingBg").style.display = "none"
        alert('글이 수정되었습니다!');
        window.location.href = "/view/" + res.data
        // history.push("/view?postId=" + res.data)
      })
    }


    //에디터 내에 이미지파일이 남아있을때 포문을 돌려서 업로드했다가 사용자가 지운 파일을 찾아내서 삭제함.
    //기존에 있던 방식은 사용자가 이미지만 업로드한 후 글을 등록하지 않고 페이지를 벗어날 수 있기 때문에, 스토리지에 잉여 이미지가 남는다.
    //onbeforeunload로는 제어가 불가능해서, 에디터내의 이미지는 그대로 base64로 보여주고 글을 등록했을 떄 반복문을 돌아서 업로드 후 src을 리턴받은 스토리지 주소로 대체한다.
    // if (file2[0]) {
    //   files.forEach(async (i) => {
    //     var check = false;
    //     file2.forEach((j) => {
    //       if (i === j) {
    //         check = true;
    //       }
    //     })
    //     if (!check) {
    //       await Axios.post('/deleteImg', {
    //         data: i
    //       }).then((res) => {
    //         alert(res.data);
    //       })
    //     }
    //   })
    // } else {
    //   //사용자가 올렸던 사진을 전부 삭제했을 때
    //   files.forEach(async (i) => {
    //     await Axios.post('/deleteImg', {
    //       data: i
    //     }).then((res) => {
    //       alert(res.data);
    //     })
    //   })
    // }


  }, [params, viewPost,user]), 200)

  //base64를 이미지파일로 변환
  const dataURLtoFile = (dataurl, fileName) => {

    var arr = dataurl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], fileName, { type: mime });
  }

  const getIndex = (elem) => {
    for (var i = 0; i < elem.parentNode.childNodes.length; i++) {
      if (elem.parentNode.childNodes[i] === elem) {
        return i;
      }
    }
  }

  useEffect(() => {
    //이미지 업로드 부분만 커스텀하기위해서 기존 노드를 삭제하고 복제한 노드에 이벤트를 주었다.
    //기존 것에 이벤트를 삭제하고 덮어씌우고 싶었지만 불가능했다.
    editor = document.getElementsByClassName("ql-editor")[0]
    input = document.getElementById("postTitle")
    var imageIcon = document.getElementsByClassName("ql-image")[0]
    var clone = imageIcon.cloneNode(true)
    imageIcon.parentElement.appendChild(clone)
    imageIcon.remove()
    clone.addEventListener("click", () => {
      document.getElementById("imgInput").click()
    })
    //quill내에서 highlight가 적용이 안돼서, 직접 적용시켰다. 엔터키를 누를때마다 적용이되고, 아래처럼 아이콘을 클릭해도 적용이 된다.
    document.getElementsByClassName("ql-code-block")[0].onclick = () => {
      document.querySelectorAll('pre').forEach((block) => {
        if (block.className.indexOf("hljs") === -1)
          hljs.highlightBlock(block);
      });
    }
    if (params === "update") {
      input.value = viewPost.title
      editor.innerHTML = viewPost.content
      for (var i = 0; i > -1; i++) {
        if (editor.getElementsByTagName("img")[i]) {
          // setFiles(files => [...files, editor.getElementsByTagName("img")[i].src])
          files.push(editor.getElementsByTagName("img")[i].src)
        } else {
          break;
        }
      }
    } else {
      input.value = ""
      editor.innerHTML = ""
    }
    input.focus();
  }, [])


  //s3에 이미지를 업로드하고 리턴 받은 url을 이미지태그로 만든다.
  //에디터의 특성을 살리기 위해서 텍스트를 쓰다가 이미지를 넣으면 마지막 커서위치 옆에 이미지가 삽입된다. 
  const uploadImg = useCallback((input) => {
    editor = document.getElementsByClassName("ql-editor")[0]
    if (input.target.files[0]) {
      var cursorTag;
      var cursorOffset;
      var cursor;
      if (window.getSelection().type === "None") {
        cursor = false;
      } else {
        cursor = window.getSelection().getRangeAt(0)
        cursorTag = cursor.startContainer.parentElement
        //커서위치를 가져오는 함수
        cursorOffset = cursor.startOffset
      }
      var cursorPosition;
      var length = input.target.files.length
      for (let i = 0; i < length; i++) {
        let fileName = input.target.files[i].name
        //반복문을 통해 다중 업로드를 구현하려는데 무조건 마지막 사진만 업로드 되고 그 전 사진들은 읽히지가 않았다.
        //구글링을 해보니 var 대신 let을 써보란다. 설마했는데 됐다. 이유는 선언된 변수가 반복문을 돌면서 메모리에 남아있기 때문이라고 한다.
        //사실 var와 let의 차이는 배웠는데 까먹었다. var는 같은 이름의 변수를 또 선언할 수 있다. let은 에러가 난다. 

        //이제 업로드된 이미지를 서버로 보내 s3에 업로드한 후 img태그의 src들을 s3 주소로 바꿔주는 작업을 해야한다.
        let reader = new FileReader()
        reader.onload = () => {
          var imageTag = document.createElement("img")
          imageTag.src = reader.result
          imageTag.alt = fileName
          // imageTag.style.maxWidth = window.innerWidth > 900 ? "860px" : "100%"
          editor.focus();
          if (!cursor) {
            //커서 위치가 확인되지 않을때는 그냥 어펜드
            editor.appendChild(imageTag)
            return;
          }
          var leftText;
          var rightText;
          //커서위치 조건을 두 개 지정한 이유는 사진을 올리고 난 직후나, p태그(한 줄)에 아무 입력도 하지 않을 시에는, 커서가 p태그안의 자식에 위치한다고 나오지 않고, 그냥 p태그에 위치해있다고 나오기 때문.
          if (cursorTag.className === 'ql-editor') {
            //offset에 i를 더해주는 이유는 다중 업로드시 인덱스가 밀리기 때문.
            cursor.startContainer.insertBefore(imageTag, cursor.startContainer.childNodes[cursorOffset + i])
          } else {
            var node = cursorTag;
            //에디터안에서 여러 태그가 씌워질 가능성이 있으므로 에디터안에 속한 노드인지 확인하기 위해 반복문 돌림.
            //에디터에 속하지 않으면 결국 에러가 나기때문에 catch에서 이미지를 에디터 끝에 어펜드.
            while (true) {
              try {
                node = node.parentNode;
                if (node.className === "ql-editor") {
                  leftText = document.createTextNode(cursor.startContainer.textContent.substring(0, cursorOffset))
                  rightText = document.createTextNode(cursor.startContainer.textContent.substring(cursorOffset, cursor.startContainer.textContent.length))
                  //여러개를 업로드할 때 처음에만 양옆 텍스트들은 이미지와 함께 insert해주고 그 다음부터는 삽입된 이미지 다음 순서에 이미지만 삽입해준다.
                  if (i === 0) {
                    //현재 커서가 속한 태그가 몇번째 자식인지 알아냄
                    cursorPosition = getIndex(cursor.startContainer)
                    //인서트하기전 원래 있던 노드 삭제.
                    cursor.startContainer.remove()
                    //역순으로 insertBefore를 해주어서 순서를 맞춰준다. 예)사진은 (이미지 삽입할 곳. 현재 커서위치) 이렇다.    결과 -> 사진은 <img> 이렇다.
                    cursorTag.insertBefore(rightText, cursorTag.childNodes[cursorPosition])
                    cursorTag.insertBefore(imageTag, cursorTag.childNodes[cursorPosition])
                    cursorTag.insertBefore(leftText, cursorTag.childNodes[cursorPosition])
                  } else {
                    cursorTag.insertBefore(imageTag, cursorTag.childNodes[cursorPosition + i + 1])
                  }
                  break;
                }
              } catch (error) {
                editor.appendChild(imageTag)
                break;
              }

            }
          }
          // if (cursorTag.parentElement.parentElement.className === "ql-editor" || cursorTag.parentElement.className === "ql-editor" || cursorTag.className === 'ql-editor') {
          //   //커서기준으로 왼쪽 오른쪽의 텍스트를 노드화
          //   leftText = document.createTextNode(cursor.startContainer.textContent.substring(0, cursorOffset))
          //   rightText = document.createTextNode(cursor.startContainer.textContent.substring(cursorOffset, cursor.startContainer.textContent.length))
          //   if (cursorTag.className === 'ql-editor') {
          //     // if(cursor.startContainer.childNodes.length===cursorOffset){
          //     // cursorTag.insertBefore(imageTag, cursorTag.childNodes[cursorPosition+i+1]) 
          //     //여러개를 인풋해도 커서의 위치는 처음위치다, 사진이 여러개 더해진 뒤면 삽입되어야할 노드의 위치또한 뒤로 밀리기 때문에, 반복문의 인덱스에 +1해준 값이 적절한 노드 삽입 위치다.
          //     // }else{
          //     //위에는 커서가 사진 삽입 직후 노드의 끝에 있을때, 
          //     // }


          //     //위에 언급한 특별한 두 조건일때, 에디터 속의 한 줄, 즉 현재 속한  P태그에 insert해준다. 기준이 되는 노드는 커서의 offset에 인덱스 i만큼 더해준다
          //     //여러개를 인풋해도 커서의 위치는 처음위치고, 사진이 여러개 더해진 뒤면 삽입되어야할 노드의 위치또한 뒤로 밀리기 때문에
          //     cursor.startContainer.insertBefore(imageTag, cursor.startContainer.childNodes[cursorOffset + i])
          //   } else {
          //     //여러개를 업로드할 때 처음에만 양옆 텍스트들은 이미지와 함께 insert해주고 그 다음부터는 삽입된 이미지 다음 순서에 이미지만 삽입해준다.
          //     if (i === 0) {
          //       //현재 커서가 속한 태그가 몇번째 자식인지 알아냄
          //       cursorPosition = getIndex(cursor.startContainer)
          //       //인서트하기전 원래 있던 노드 삭제.
          //       cursor.startContainer.remove()
          //       console.log(rightText);
          //       console.log(leftText);
          //       console.log(cursorTag);
          //       //역순으로 insertBefore를 해주어서 순서를 맞춰준다. 예)사진은 (이미지 삽입할 곳. 현재 커서위치) 이렇다.    결과 -> 사진은 <img> 이렇다.
          //       cursorTag.insertBefore(rightText, cursorTag.childNodes[cursorPosition])
          //       cursorTag.insertBefore(imageTag, cursorTag.childNodes[cursorPosition])
          //       cursorTag.insertBefore(leftText, cursorTag.childNodes[cursorPosition])
          //     } else {
          //       cursorTag.insertBefore(imageTag, cursorTag.childNodes[cursorPosition + i + 1])
          //     }
          //   }
          // } else {
          //   //에디터외의 장소에 커서가 위치할 경우 그냥 어펜드.
          //   editor.appendChild(imageTag)
          // }
        }
        reader.readAsDataURL(input.target.files[i]);
      }
      //유저가 같은 사진을 또 업로드할 시에는 벨류가 그대로라 onchange가 작동을 안하기때문에 벨류 초기화시켜줌
      document.getElementById("imgInput").value = ""
    }
  }, [])
  const inputStyle = {
    width: "100%",
    height: "50px",
    paddingLeft: "20px",
    fontSize: "25px",
    border: 0,
    marginTop: "5px",
    outline: 0
  }
  const sendBtn = {
    width: '58px'
  }
  return (
    <div>
      <input type="file" hidden id="imgInput" accept="image/*" onChange={uploadImg.bind(this)} multiple></input>
      <div style={{ display: "flex" }}>
        <input type="text" id="postTitle" placeholder="제목" maxLength="50" style={inputStyle} autoFocus />
        <Button id="sendBtn" color="primary" style={sendBtn} onClick={sendPost}>완료</Button>
      </div>
      <ReactQuill
        // onChange={handleChange}
        modules={modules}
        style={style}
        onKeyDown={onKeyDown}
      />
      <Loading></Loading>
    </div>
  )
}

export default Editor