const express = require("express")
const app = express.Router();
const models = require('../models')
const sequelize = require('sequelize')

app.post('/updateViews', (req, res,next) => {
    try {
        //조회수 1증가
        models.posts.update(
            { views: sequelize.literal('views +1') },
            { where: { postId: req.body.postId } }
        ).then(result => {
            res.send(true)
        })
    } catch (error) {
        next(error)
    }
})

app.post('/viewPost', (req, res,next) => {
    var data = {
        post: {},
        comment: []
    }
    try {
        //조금만 복잡해져도 orm이용해서 못하겠어.. 이럴꺼면 orm왜쓰는거지..ㅋㅋㅋㅋ
        var sql = "select posts.content,posts.description, (SELECT userId FROM MyBoard.likes where postId= ? and userId=?) likeCheck,posts.postId,posts.userId,posts.views,date_format(posts.updatePost,'%Y-%m-%d %H:%i') updatePost,posts.title, count(likes.id) likeCount from posts left join likes on likes.postId = posts.postId group by posts.postId having posts.postId = ?"
        models.sequelize.query(sql,
            { replacements: [req.body.postId, req.user ? req.user.id : "", req.body.postId], type: sequelize.QueryTypes.SELECT }
        ).then(function (result) {
            if (!result[0]) {
                res.status(500).send("no data")
            } else {
                var sql2 = "SELECT ANY_VALUE(cl.id) likeId, c.*,date_format(c.createdAt,'%Y-%m-%d %H:%i') createdAt, count(cl.id) likeCount,  (SELECT userId FROM commentLikes where commentId = c.id and userId=?) likeCheck from comments c left join commentLikes cl on c.id = cl.commentId where postId = ? group by c.id order by c.groupId, c.createdAt;"
                data.post = result[0];
                //댓글리스트 가져오면서 댓글의 좋아요 개수 및 현재 접속한 유저가 좋아요를 누른지 체크
                models.sequelize.query(sql2,
                    { replacements: [req.user ? req.user.id : "", req.body.postId], type: sequelize.QueryTypes.SELECT }
                )
                    .then(result3 => {
                        data.comment = result3
                        res.send(data)
                    })
            }
        })

    } catch (error) {
        next(error)
    }
})
module.exports = app