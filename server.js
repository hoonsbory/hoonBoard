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
const sequelize = require('sequelize')
const mysql = require('mysql')
const db = require('./db')
const connection = mysql.createConnection(db)
const bcrypt = require('bcrypt');
const  MemoryStore = require('memorystore')(session)
const cors = require('cors');
const corsOptions = {
  origin: "https://hoonboard.herokuapp.com",
  credentials: true
}
connection.on('error', function() {});

const app = express()

//request의 내용을 파싱하여 라우터가 이용할 수 있도록 위와 같이 두 가지 파서(body-parser 패키지에 있음)를 등록하게 된다. PayloadTooLargeError가 발생하는 원인은 파서가 읽을 수 있는 데이터 허용치보다 request가 보낸 데이터의 크기가 커서 정상적으로 파싱을 할 수 없을 때 발생하는 에러이다.
// 기본값으로는 .json()과 .urlencoded()가 100kb 까지만 파싱할 수 있도록 설정되어 있다.
//이렇게 하면 20메가까지 허용치를 늘려줄 수 있다.
app.use(express.urlencoded({ limit: "20mb", extended: false }));

app.use(cors(corsOptions));

//express에서 정적파일을 제공하는 방법.
app.use(express.static(path.join(__dirname, "client/build")));

//위에서 폴더르 static하게 해놓고 root url에 index.html파일을 보내서 렌더링한다.
//react-snap과 같이 쓰면 어떤식으로 써야할지 감이 안온다.


//예전에는 body parser로 파싱을 해야 data에 접근가능했지만 지금은 모듈 설치 없이 아래처럼 하면 파싱이된다.
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser('keyboard cat'));
//rolling은 서버에 요청이 오면 자동으로 세션시간을 갱신해준다. saveUninitialized도 트루로 해줘야 갱신됨.
//메모리 스토어를 통해 저장한다. 로컬에서는 없어도 됐었는데 배포하고 나니 필요해졌따.
app.use(session({store: new MemoryStore({checkPeriod: 1000 * 60 * 60 * 3}), cookie: { maxAge: 1000 * 60 * 60 * 3 }, rolling: true, secret: '비밀코드', saveUninitialized: true })); // 세션 활성화
app.use(passport.initialize()); // passport 구동
app.use(passport.session()); // 세션 연결
passportConfig(); // 이 부분 추가


app.post('/api/login', passport.authenticate('local', {
  failureRedirect: 'err'
}), (req, res) => {
  // console.log(req.user);
  // models.post.findAll({where:{userId : "hoon1"}})
  models.posts.findAll()
    .then(results => {
      console.log(results[0].userId);
    })
    .catch(err => {
      console.error(err);
    });
  res.send(req.user);
});

app.post('/api/signup', (req, res) => {
  bcrypt.hash(req.body.pw, 10, (err, hash) => {
    models.users.create({
      id: req.body.id,
      pw: hash,
      userName: req.body.name
    }).then(result => {
      res.send(true)
    }).catch(err => {
      console.log(err);
    })
  })
})

app.post('/api/duplicateCheck', (req, res) => {
  models.users.findOne({
    where: { id: req.body.id }
  }).then(result => {
    if (result) res.send(false)
    else res.send(true)
  }).catch(err => {
    console.log(err);
  })
})

app.get('/api/logout', (req, res) => {
  console.log(req.user);
  if (req.user) {
    req.logout();
    res.send("로그아웃 성공")
  }
})

app.get('/api/sessionCheck', (req, res) => {
  console.log("test" + req.user);
  if(req.user) res.send(req.user)
  else res.send(false)
})



app.use('/api/', board)
app.use('/api/', view)
app.route('/api/**').all((req,res,next)=>{
  if(!req.user){
    res.send(false)
  }else{
    next()
  }
})
 //전역에서 method를 막아주고 백단에서 바로 클라이언트를 로그인페이지로 리다이렉트 시켜주고 싶지만, 리액트는 spa라서 어려울 듯 하다..
//로그인되지 않았다면 특정값을 리턴하고 클라이언트단에서 값을 확인 후 이동시키는 방법 밖에는 없는 것 같다. 따로 라우터를 만들어서 관리해야할듯.
app.use('/api/', upload)
app.use('/api/',userRole)
//라우터 테스트




const PORT = process.env.PORT || 7000;
// "/"로 url을 잡으면 새로고침 및 url을 직접쳐서 접속할 떄 리액트의 라우터가 먼저 작동하지 않아서 에러가 난다. 그리고 *를 통해 전체를 잡아주면, 최하단에 
//위치해야 라우터에 영향을 주지 않는다.
app.get("*", (res, req) => {
  req.sendFile(path.join(__dirname, "client/build", "index.html"));
});
app.listen(PORT);
