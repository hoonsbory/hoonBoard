const env = require('dotenv')
env.config();
//디비 커넥션 정보 모듈
//서버를 라우팅해서 쓸 거라 여러 곳에서 가져다 쓰기 쉽게 모듈화


module.exports =  {

  host: process.env.SQLHOST,
  port: '3306',
  user: process.env.DBUSER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE

}
