const express = require("express")
const app = express.Router();
const AWS = require("aws-sdk")
// const awsConfig = require("./awsConfig")
const multer = require("multer");
const multerS3 = require('multer-s3');
const models = require('../models')
const sequelize = require('sequelize')
AWS.config.loadFromPath('./awsConfig.json')


let s3 = new AWS.S3();


const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'jaehoon-bucket',
    //자동으로 콘텐트타입설정, s3에서 이미지타입으로 저장되어야 링크를 통해 다운로드가 아닌 열람이 가능함.
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + file.originalname);
    },
    acl: 'public-read-write',
  }),
});
app.post("/uploadTest", upload.any(), (req, res) => {
  console.log(req.files[0]);
  res.send(decodeURI(req.files[0].location))
})

app.post("/upload", upload.any(), (req, res) => {
  console.log(req.files[0].key);
  res.send(req.files[0].key)
})

app.post("/deleteImg", (req, res, next) => {
  console.log(req.body.data);
  try {
    s3.deleteObject({
      Bucket: 'jaehoon-bucket', // 사용자 버켓 이름
      Key: req.body.data // 버켓 내 경로
    }, (err, data) => {
      if (err) { throw err; }
      console.log("err = " + err);
      console.log('s3 deleteObject ', data)
    })
    res.send("delete success")
  } catch (error) {
    next(error)
  }
})

app.post("/editorTest", (req, res,next) => {
  models.posts.create({
    userId: req.user.id,
    content: req.body.content,
    title: req.body.title,
    thumbnail: req.body.thumbnail,
    description: req.body.description.length < 10 ? req.body.title : req.body.description
  })
    .then(result => {
      // res.send([body])의 인자값으론 Buffer object, String, object, Array만 가능한데 인자값으로 Integer 값이 들어갔기 대문에 오류 발생.
      res.send(result.postId.toString());
    })
    .catch(err => {
      next(err)
    });
})

app.post("/updatePost", (req, res,next) => {
  console.log(req.body);
  models.posts.update({
    userId: req.user.id,
    content: req.body.content,
    title: req.body.title,
    thumbnail: req.body.thumbnail,
    description: req.body.description.length < 10 ? req.body.title : req.body.description
  },
    { where: { postId: req.body.postId } }
  )
    .then(result => {
      // res.send([body])의 인자값으론 Buffer object, String, object, Array만 가능한데 인자값으로 Integer 값이 들어갔기 대문에 오류 발생.
      res.send(req.body.postId.toString());
    })
    .catch(err => {
      next(err)
    });
})


module.exports = app