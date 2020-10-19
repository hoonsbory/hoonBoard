const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const model = require('./models')
const bcrypt = require('bcrypt');

module.exports = () => {
    passport.serializeUser((user, done) => { // Strategy 성공 시 호출됨
        done(null, user); // 여기의 user가 deserializeUser의 첫 번째 매개변수로 이동
    });

    passport.deserializeUser((user, done) => { // 매개변수 user는 serializeUser의 done의 인자 user를 받은 것
        model.users.findOne({
            where: { id: user.id },
            raw: true
        })
            .then(result => {
                if (!result) {
                    return done(console.log("다시 로그인하세요"), "")
                } else {
                    return done(null, user); // 여기의 user가 req.user가 됨
                }
            })
    });

    passport.use(new LocalStrategy({ // local 전략을 세움
        usernameField: 'id', //클라이언트에서 값을 넘길 때 여기와 이름을 맞춰줘야 값이 읽힌다.
        passwordField: 'pw',
        session: true, // 세션에 저장 여부
        passReqToCallback: false,
    }, function (username, password, done) {
        //암호화된 비밀번호를 비교해야하기때문에 일단 id를 통해 유저 객체만 가져온다.
        model.users.findOne({
            where: { id: username },
            raw: true //data만 가져오게 설정. 
        })
            .then(result => {
                // 입력받은 ID와 일치하는 회원정보가 없는 경우   
                if (!result) {
                    console.log("결과 없음");
                    //done의 두번째 인자값이 req.user로 들어간다. 현재 조건은 일치하는 아이디가 없을때이므로 false를 보내준다.
                    return done(null, false);
                } else {
                    //디비에서 id를 통해 가져온 암호화된 패스워드를 비교 후 true를 리턴할 시 로그인 성공.
                    bcrypt.compare(password, result.pw, (err, res) => {
                        if (res) {
                            console.log(result);
                            return done(null, result);  // result값으로 받아진 회원정보를 return해줌
                        } else {
                            return done(null, false)
                        }
                    })
                }
            })
    }));
};