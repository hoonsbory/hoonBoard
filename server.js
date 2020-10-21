const express = require('express');
const session = require('express-session');
const passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;
const passportConfig = require('./passport'); // 여기
const path = require('path');
const upload = require('./router/uploadS3')
const board = require('./router/board')
const view = require('./router/view')
const userRole = require('./router/userRole')
const models = require('./models')
const mysql = require('mysql')
const db = require('./db')
const connection = mysql.createConnection(db)
const bcrypt = require('bcrypt');
const MySQLStore = require('express-mysql-session')(session);
const fs = require("fs")
const cors = require('cors');
const corsOptions = {
  origin: "https://hoonboard.herokuapp.com",
  credentials: true
}
const dir = "client/build"
connection.on('error', function () { });

const app = express()
//request의 내용을 파싱하여 라우터가 이용할 수 있도록 위와 같이 두 가지 파서(body-parser 패키지에 있음)를 등록하게 된다. PayloadTooLargeError가 발생하는 원인은 파서가 읽을 수 있는 데이터 허용치보다 request가 보낸 데이터의 크기가 커서 정상적으로 파싱을 할 수 없을 때 발생하는 에러이다.
// 기본값으로는 .json()과 .urlencoded()가 100kb 까지만 파싱할 수 있도록 설정되어 있다.
//이렇게 하면 20메가까지 허용치를 늘려줄 수 있다.
app.use(express.urlencoded({ limit: "20mb", extended: false }));

app.use(cors(corsOptions));

//express에서 정적파일을 제공하는 방법.
app.use(express.static(path.join(__dirname, dir)));

//위에서 폴더르 static하게 해놓고 root url에 index.html파일을 보내서 렌더링한다.
//react-snap과 같이 쓰면 어떤식으로 써야할지 감이 안온다.


//예전에는 body parser로 파싱을 해야 data에 접근가능했지만 지금은 모듈 설치 없이 아래처럼 하면 파싱이된다.
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//rolling은 서버에 요청이 오면 자동으로 세션시간을 갱신해준다. saveUninitialized도 트루로 해줘야 갱신됨.
//production모드에서는 store를 정의해야 하는데, 기본은 MemoryStore에 저장된다. 그래서 서버가 껐다 켜지면 세션데이터가 전부 초기화된다.
//store에는 file store나 db에 저장하는 방법이 있는데, file로 세션을 저장하는건 실무에서는 잘쓰지 않는다고 한다. 
//그래서 나는 MysqlStore에 세션을 저장했다.
app.use(session({ resave: true, store: new MySQLStore(db), cookie: { maxAge: 1000 * 60 * 60 * 3, overwrite: true }, rolling: true, secret: '비밀코드', saveUninitialized: true })); // 세션 활성화
app.use(passport.initialize()); // passport 구동
app.use(passport.session()); // 세션 연결
passportConfig(); // 이 부분 추가

app.use('/api/reLogin', (req, res, next) => {
  try {

    req.session.passport = req.body.data
    console.log(req.session);
    res.send(true)
  } catch (error) {
    console.log(error);
    next(error)
  }
})
app.post('/api/login', passport.authenticate('local', {
  failureRedirect: 'err'
}), (req, res) => {
  res.send(req.user);
});

app.post('/api/signup', (req, res, next) => {
  try {
    bcrypt.hash(req.body.pw, 10, (err, hash) => {
      models.users.create({
        id: req.body.id,
        pw: hash,
        userName: req.body.name
      }).then(result => {
        res.send(true)
      }).catch(err => {
        next(err)
      })
    })
  } catch (error) {
    next(error)
  }

})

app.post('/api/duplicateCheck', (req, res, next) => {
  try {
    models.users.findOne({
      where: { id: req.body.id }
    }).then(result => {
      if (result) res.send(false)
      else res.send(true)
    }).catch(err => {
      next(err)
    })
  } catch (error) {
    next(error)
  }

})

app.get('/api/logout', (req, res, next) => {
  try {
    console.log(req.user);
    if (req.session.passport.user) {
      req.logout();
      res.send("로그아웃 성공")
    } else {
      res.send(false)
    }
  } catch (error) {
    next(error)
  }

})

app.get('/api/sessionCheck', (req, res, next) => {
  try {
    if (req.session.passport) res.send(req.session.passport.user)
    else res.send(false)
  } catch (error) {
    next(error)
  }
})



app.use('/api/', board)
app.use('/api/', view)

//유저가 아니면 더 이상 아래의 api에 접근하지 못한다.
app.use('/api/**', (req, res, next) => {
  try {

    if (!req.session.passport.user) {
      console.log(123);
      res.status(404).send("retry")
    } else {
      next()
    }
  } catch (error) {
    res.status(404).send("retry")
  }
})
app.use('/api/', upload)
app.use('/api/', userRole)




const PORT = process.env.PORT || 7000;
// "/"로 url을 잡으면 새로고침 및 url을 직접쳐서 접속할 떄 리액트의 라우터가 먼저 작동하지 않아서 에러가 난다. 그리고 *를 통해 전체를 잡아주면, 최하단에 
//위치해야 라우터에 영향을 주지 않는다.

app.get('/post/**', (req, res) => {
  res.sendFile(path.join(__dirname, "client/build", "index.html"));
})

app.get('/view', function (req, res, next) {
  //리액트 라우터의 view로 이동하기전에 메타태그를 변경하기 위해서 짰는데,
  //게시글 정보를 가져와야해서 쿼리를 요청해야한다.
  //리액트에서 로드될때도 요청을 하기때문에 불필요한 동작이다.
  //서버에서 메타태그를 변경해서 보내주는 방법은, 동적으로 html의 파일을 읽어서 문자열만 교체해서 send하는 것이기 때문에, 
  //따로 게시글 데이터까지 같이 보내는 방법은 쿼리스트링밖에는 없는 듯하다. 그렇다고 그 긴 데이터를 쿼리스트링으로 보낼 수 는 없다..
  //서버만 빨랐어도 이런 고민 안했을텐데,, 귀찮더라도 aws ec2를 하나 더 파야되나 고민이 된다.
  models.posts.findOne({
    where: { postId: req.query.postId },
    raw: true
  }).then(result => {
    if (result) {
      const filePath = path.resolve(__dirname, dir, 'index.html')
      fs.readFile(filePath, 'utf8', function (err, data) {
        if (err) {
          return console.log(err);
        }
        data = data.replace(/\FullStack Junior's Note/g, result.title);
        data = data.replace(/\풀스택 주니어의 웹개발노트입니다./g, result.description);
        result2 = data.replace(/\hoondevnote.ml/g, "hoondevnote.ml/view?postId=" + req.query.postId);
        fs.writeFileSync(dir + "/index"+req.query.postId + ".html", result2, (err) => {
          console.log(err);
        })
      });
      //사이트맵 생성
      fs.readFile(dir + "/sitemap.xml", 'utf8', (err, data) => {
        if (err) return console.log(err);
        if (data.indexOf("postId=" + req.query.postId) === -1) {
          data = data.replace(/\/urlset/g, "url")
          data += "\n<loc>https://hoonboard.herokuapp.com/view?postId=" + req.query.postId + "</loc>\n</url>\n</urlset>"
          fs.writeFile(dir + "/sitemap.xml", data, (err) => {
            console.log(err);
          })
        }
      })

      res.sendFile(path.join(__dirname, dir, "index" + req.query.postId + ".html"));
    } else {
      res.redirect("/error")
    }
  }).catch(err => {
    res.redirect("/error")
  })

});
app.use(function (err, req, res, next) {
  console.log(err);
  res.status(500).send(false)
  //에러를 하나하나 친절하게 안내해줄 고객이 있는 것은 아니니까 그냥 대충 잘못된 요청이라고만 클라이언트에서 alert띄워줌
});
app.get('/error', function (req, res) {
  res.sendFile(path.join(__dirname, dir, "index.html"));
});

//맨 마지막에 모든 유효하지 않은 경로에 대해 예외처리를 한다.
//그 전에 설정한 유효한 페이지들은 위에서 걸러지기때문에 맨밑에 설정해서 예외처리를 할 수 있다.
//리액트의 build된 index파일을 호스팅하고 있기 때문에, 직접 url을 통해 들어오는 경우는 서버 쪽 api로 먼저 들어온다.
//그렇기 떄문에 서버에서 유효하지 않은 페이지를 감지하고나서 redirect를 하는데 여기서 리액트 router의 path인 /error로 redirect를 하면
//바로 리액트 라우터를 통해 이동하는 것이 아닌, 서버에서 /error을 먼저 찾는다. 그리고 여기서 빌드된 index파일을 보내주면, 
//href가 /error인 상태이기 때문에 , 리액트 라우터가 정상 작동한다.
app.get('/**', function (req, res) {
  res.redirect("/error")
});
app.listen(PORT);
