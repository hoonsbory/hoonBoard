const express = require("express")
const app = express.Router();
const models = require('../models')
const sequelize = require('sequelize')

app.post('/like', (req, res, next) => {
    try {
        models.likes.create({
            userId: req.user.id,
            postId: req.body.postId,
            id: req.user.id + "/" + req.body.postId
        }).then(result => {
            res.send(true)
        }).catch(err => {
            console.log(err);
        })
    } catch (error) {
        next(error)
    }

})

app.post('/unLike', (req, res, next) => {
    models.likes.destroy({
        where: { userId: req.user.id, postId: req.body.postId }
    })
        .then(result => {
            res.send(true)
        }).catch(err => {
            next(err)
        })
})

app.post("/deletePost", (req, res, next) => {
    models.posts.destroy({
        where: { postId: req.body.postId }
    })
        .then(result => {
            if (result === 1)
                res.send(true)
        }).catch(err => {
            next(err)
        })
})

app.post("/sendParentComment", (req, res, next) => {
    try {
        models.comments.findOne({
            where: { postId: req.body.postId },
            attributes: [
                [sequelize.fn('ANY_VALUE', sequelize.col('postId')), "postId"], [sequelize.fn('max', sequelize.col('groupId')), "groupId"]
            ]
        })
            .then(result => {
                models.comments.create({
                    userId: req.user.id,
                    postId: req.body.postId,
                    content: req.body.comment,
                    parentChild: "p",
                    groupId: result.dataValues.groupId ? result.dataValues.groupId + 1 : 1
                })
                    .then(result => {
                        console.log(result);
                        res.send(true)
                    }).catch(err => {
                        next(err)
                    })
            })
    } catch (error) {
        next(error)
    }

})

app.post("/sendChildComment", (req, res, next) => {
    models.comments.create({
        userId: req.user.id,
        postId: req.body.postId,
        content: req.body.comment,
        parentChild: "c",
        groupId: req.body.groupId
    })
        .then(result => {
            console.log(result);
            res.send(true)
        }).catch(err => {
            next(err)
        })
})

app.post("/sendUpdateComment", (req, res, next) => {
    models.comments.update(
        //순서가 중요함. 조건이 뒤에 와야한다.
        { content: req.body.comment },
        { where: { id: req.body.id } }
    )
        .then(result => {
            console.log(result);
            res.send(true)
        }).catch(err => {
            next(err)
        })
})

app.post('/deleteComment', (req, res, next) => {
    models.comments.update(
        { delete: true },
        { where: { id: req.body.id } }
    )
        .then(result => {
            console.log(result);
            res.send(true)
        }).catch(err => {
            next(err)
        })
})

app.post('/likeComment', (req, res, next) => {
    //클라이언트에서 debounce로 연속실행을 막아도 설정해놓은 시간에 맞춰서 따닥 눌러버리면 이벤트가 한 번 더 실행됨..... 그래서 그냥 서버에서 막아버림
    models.commentLikes.create({
        userId: req.user.id,
        commentId: req.body.commentId,
        id: req.user.id + "/" + req.body.commentId
    })
        .then(result => {
            res.send(true)
        }).catch(err => {
            next(err)
        })

})
app.post('/unLikeComment', (req, res, next) => {
    models.commentLikes.destroy({
        where: { id: req.body.likeId }
    })
        .then(result => {
            res.send(true)
        }).catch(err => {
            next(err)
        })
})

module.exports = app
