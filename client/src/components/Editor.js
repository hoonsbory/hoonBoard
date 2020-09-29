import React, { useEffect, useCallback } from 'react';
import Axios from 'axios'
import 'react-quill/dist/quill.snow.css';
import 'react-quill/dist/quill.core.css';
import hljs from 'highlight.js'
import 'react-quill/dist/quill.bubble.css';
import 'highlight.js/styles/darcula.css'
import ReactQuill, { Quill } from 'react-quill';
import { Button } from 'reactstrap'
import ImageResize from 'quill-image-resize-module-fix-for-mobile';
import { debounce } from 'lodash'

Quill.register('modules/ImageResize', ImageResize);


hljs.configure({
  languages: ['javascript', 'ruby', 'python', 'rust', 'html', 'css'],
})

const Editor = ({ params, handleTrigger, viewPost }) => {
  //s3에 업로드된 이미지 배열
  // const [finalFiles, setFinalFiles] = useState([1])

  //굳이 에디터의 값을 state로 핸들링할 필요가 없어서 지웠다. 그냥 innerHtml로 대체했다.
  // const handleChange = (editorState) => {
  //   setText(editorState)
  // };

  const modules = {
    ImageResize: {
      displaySize: true
    },
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, false] }, { 'font': [] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
      ['link', 'image', { 'color': [] }, { 'background': [] }],
      ['clean']
    ],
  }
  const formats = [
    'header', 'font',
    'bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block',
    'list', 'bullet', 'indent',
    'link', 'image', 'color', 'background'
  ]
  const style = {
    height: window.innerHeight - 240 + "px"
  }

  const onKeyDown = useCallback((e) => {
    if(window.getSelection().getRangeAt(0).startContainer.parentElement)
    var node = window.getSelection().getRangeAt(0).startContainer.parentElement
    else return
    if (node.className.indexOf("ql-syntax") > -1 && e.keyCode === 13) {
      hljs.highlightBlock(node);
      var range, selection;
      range = document.createRange();//range 생성
      range.selectNodeContents(node);//range를 적용한 노드 설정
      range.collapse(false);//true는 텍스트의 시작점에 커서가 위치, false는 반대
      selection = window.getSelection();//셀렉션 객체 가져옴
      selection.removeAllRanges();//만들어져있던 모든 range제거 후
      selection.addRange(range);//위에서 만든 range를 window에 추가하므로 커서 변경.

    }
  }, [])
  //quill에서 img가 base64로 인코딩되어 태그가 삽입되는데, 이 긴 문자열을 전부 db에 저장할 수 는 없다.
  //이미지를 올릴때 이미지태그를 찾아 이미지를 s3에 업로드하여 저장한 후 s3링크를 삽입하는 로직을 짜야겠따.




  var file2 = []
  var files = [];
  var editor;
  var input;
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
    //반복문을 통해 base64 이미지를 파일로 변환후 s3에 업로드한다. 그리고 리턴받은 url을 src에 넣어준다
    if (params !== "update") {
      for (var i = 0; i > -1; i++) {
        if (editor.getElementsByTagName("img")[i]) {
          var file = dataURLtoFile(editor.getElementsByTagName("img")[i].src, editor.getElementsByTagName("img")[i].alt)
          const formData = new FormData();
          formData.append('file', file);
          formData.append('name', file.name);
          await Axios.post('/api/uploadTest', formData)
            .then(res => {
              editor.getElementsByTagName("img")[i].src = res.data
            })
        } else {
          await Axios.post('/api/editorTest',
            {
              content: editor.innerHTML,
              thumbnail: editor.getElementsByTagName("img")[0] ? editor.getElementsByTagName("img")[0].src.split("https://jaehoon-bucket.s3.ap-northeast-2.amazonaws.com/")[1] : "",
              title: input.value.trim()
            }
          ).then((res) => {
            alert('글이 등록되었습니다!');
            window.location.href = "/view/" + res.data
          })
          break;
        }
      }
    } else { //수정할 때
      //s3에 잉여 이미지가 남지않고, 불필요한 업로드나 삭제를 최소화 하기 위한 로직. 두 개의 반복문을 통해, 수정 후 그대로인 이미지는 냅두고, 삭제되거나 추가된 이미지만 따로 처리했다.
      for (var i = 0; i > -1; i++) {
        //반복문을 통해서 유저가 업로드한 이미지를 배열에 넣는다.
        var check = false;
        if (editor.getElementsByTagName("img")[i]) {
          file2.push(editor.getElementsByTagName("img")[i].src)
        } else {
          break;
        }
      }
      //files는 수정전에 존재하던 이미지 배열, file2는 수정후의 이미지 배열
      //loop1은 수정후에는 존재하지않는 삭제해야할 이미지를 걸러내서 삭제하는 반복문이다.
      if (file2[0]) {
        loop1: for (var i = 0; i < files.length; i++) {
          for (var j = 0; j < file2.length; j++) {
            if (files[i] === file2[j]) {
              check = true;
              continue loop1;
            } else {
              check = false;
            }
          }
          if (!check) {
            await Axios.post('/api/deleteImg', {
              //한글로 된 파일명이 있기때문에 디코딩해줘야 삭제가 된다. url은 인코딩된 값이지만 s3의 객체 키값은 한글로 들어가있어서 한글로 키값을 보내줘야 삭제가능.
              data: decodeURI(files[i].split("https://jaehoon-bucket.s3.ap-northeast-2.amazonaws.com/")[1])
            }).then((res) => {
              alert(res.data);
            })
          }
        }

        //loop2는 새롭게 추가된 이미지를 s3에 업로드하는 반복문이다.
        loop2: for (var i = 0; i < file2.length; i++) {
          for (var j = 0; j < files.length; j++) {
            if (file2[i] === files[j]) {
              check = true
              continue loop2;
            } else {
              check = false
            }
          }
          if (!check) {
            var file = dataURLtoFile(editor.getElementsByTagName("img")[i].src, editor.getElementsByTagName("img")[i].alt)
            const formData = new FormData();
            formData.append('file', file);
            formData.append('name', file.name);
            await Axios.post('/api/uploadTest', formData)
              .then(res => {
                editor.getElementsByTagName("img")[i].src = res.data
              })
          }
        }
      } else {
        //사용자가 올렸던 사진을 전부 삭제했을 때
        files.forEach(async (i) => {
          await Axios.post('/api/deleteImg', {
            data: decodeURI(i.split("https://jaehoon-bucket.s3.ap-northeast-2.amazonaws.com/")[1])
          }).then((res) => {
          })
        })
      }



      await Axios.post('/api/updatePost',
        {
          content: editor.innerHTML,
          thumbnail: editor.getElementsByTagName("img")[0] ? editor.getElementsByTagName("img")[0].src.split("https://jaehoon-bucket.s3.ap-northeast-2.amazonaws.com/")[1] : "",
          title: input.value.trim(),
          postId: viewPost.postId
        }
      ).then((res) => {
        alert('글이 수정되었습니다!');
        window.location.href = "/view/" + res.data
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


  }, [params, viewPost]), 200)

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
          imageTag.style.maxWidth = window.innerWidth > 900 ? "860px" : "100%"
          // editor.focus();
          if (!cursor) {
            //커서 위치가 확인되지 않을때는 그냥 어펜드
            editor.appendChild(imageTag)
            return;
          }
          var leftText;
          var rightText;

          //커서위치 조건을 두 개 지정한 이유는 사진을 올리고 난 직후나, p태그(한 줄)에 아무 입력도 하지 않을 시에는, 커서가 p태그안의 자식에 위치한다고 나오지 않고, 그냥 p태그에 위치해있다고 나오기 때문.
          if (cursorTag.parentElement.className === "ql-editor" || cursorTag.className === 'ql-editor') {
            //커서기준으로 왼쪽 오른쪽의 텍스트를 노드화
            leftText = document.createTextNode(cursor.startContainer.textContent.substring(0, cursorOffset))
            rightText = document.createTextNode(cursor.startContainer.textContent.substring(cursorOffset, cursor.startContainer.textContent.length))
            if (cursorTag.className === 'ql-editor') {
              // if(cursor.startContainer.childNodes.length===cursorOffset){
              // cursorTag.insertBefore(imageTag, cursorTag.childNodes[cursorPosition+i+1]) 
              //여러개를 인풋해도 커서의 위치는 처음위치다, 사진이 여러개 더해진 뒤면 삽입되어야할 노드의 위치또한 뒤로 밀리기 때문에, 반복문의 인덱스에 +1해준 값이 적절한 노드 삽입 위치다.
              // }else{
              //위에는 커서가 사진 삽입 직후 노드의 끝에 있을때, 
              // }


              //위에 언급한 특별한 두 조건일때, 에디터 속의 한 줄, 즉 현재 속한  P태그에 insert해준다. 기준이 되는 노드는 커서의 offset에 인덱스 i만큼 더해준다
              //여러개를 인풋해도 커서의 위치는 처음위치고, 사진이 여러개 더해진 뒤면 삽입되어야할 노드의 위치또한 뒤로 밀리기 때문에
              cursor.startContainer.insertBefore(imageTag, cursor.startContainer.childNodes[cursorOffset + i])
            } else {
              //여러개를 업로드할 때 처음에만 양옆 텍스트들은 이미지와 함께 insert해주고 그 다음부터는 삽입된 이미지 다음 순서에 이미지만 삽입해준다.
              if (i == 0) {
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
            }
          } else {
            //에디터외의 장소에 커서가 위치할 경우 그냥 어펜드.
            editor.appendChild(imageTag)
          }
        }
        reader.readAsDataURL(input.target.files[i]);
      }
      //유저가 같은 사진을 또 업로드할 시에는 벨류가 그대로라 onchange가 작동을 안하기때문에 벨류 초기화시켜줌
      document.getElementById("imgInput").value = ""
    }
  },[])
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
    position: "relative",
    bottom: "-" + (window.innerWidth > 735 ? 52 : (window.innerWidth > 421 ? 76 : (window.innerWidth > 314 ? 100 : 124))) + "px",
    left: "50%",
    transform: "translateX(-50%)"
  }
  return (
    <div>
      <input type="file" hidden id="imgInput" accept="image/*" onChange={uploadImg.bind(this)} multiple></input>
      <input type="text" id="postTitle" placeholder="제목" maxLength="50" style={inputStyle} autoFocus />
      <ReactQuill
        // onChange={handleChange}
        modules={modules}
        formats={formats}
        style={style}
        onKeyDown={onKeyDown}
      />
      <Button id="sendBtn" color="primary" style={sendBtn} onClick={sendPost}>완료</Button>
    </div>
  )
}

export default Editor