const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mysql = require('mysql')
const db = require('./db')
const connection = mysql.createConnection(db)
const bcrypt = require('bcrypt');   

module.exports = () => {
    passport.serializeUser((user, done) => { // Strategy 성공 시 호출됨
        done(null, user); // 여기의 user가 deserializeUser의 첫 번째 매개변수로 이동
    });

    passport.deserializeUser((user, done) => { // 매개변수 user는 serializeUser의 done의 인자 user를 받은 것
        connection.query("select * from users where id=?",[user.id], (err,result)=>{
            if(err) console.log("다시 로그인하세요");
            if(result.length === 0){
                
                return done(console.log("다시 로그인하세요"),"")
            }else{

                return done(console.log("본인 확인 완료"), user);
            }
        })
            // 여기의 user가 req.user가 됨
    });

    passport.use(new LocalStrategy({ // local 전략을 세움
        usernameField: 'id',
        passwordField: 'pw',
        session: true, // 세션에 저장 여부
        passReqToCallback: false,
    }, function (username, password, done) {
        var sql = 'SELECT * FROM users WHERE ID=?';
        connection.query(sql, [username], function (err, result) {
            if (err) console.log('mysql 에러');
            console.log(result);
            // 입력받은 ID와 비밀번호에 일치하는 회원정보가 없는 경우   
            if (result.length === 0) {
                console.log("결과 없음");
                //done의 두번째 인자값이 req.user로 들어간다. 현재 조건은 일치하는 아이디가 없을때이므로 false를 보내준다.
                return done(null, false);
            } else {
                //디비에서 id를 통해 가져온 암호화된 패스워드를 비교 후 true를 리턴할 시 로그인 성공.
                bcrypt.compare(password, result[0].pw, (err,res)=>{
                    if(res){
                    var json = JSON.stringify(result[0]);
                    console.log(json);
                    var userinfo = JSON.parse(json);
                    console.log(userinfo);
                    return done(null, userinfo);  // result값으로 받아진 회원정보를 return해줌
                    }else{
                        return done(null,false)
                    }
                })
            }
        })
    }));
};