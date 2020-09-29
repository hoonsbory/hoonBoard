const express = require("express")
const app = express.Router();
const models = require('../models')
const sequelize = require('sequelize')


app.post('/boardList', (req, res) => {
    // models.posts.hasMany(models.likes, {foreignKey : 'postId'})
    // models.likes.belongsTo(models.posts, {foreignKey : 'postId'})
    // console.log(req.body.page);
    // //한번에 찾아옴과 동시에 로우의 개수까지 리턴해준다. 리밋과 오프셋을 통해 쉽게 페이징을 할 수 있었다.
    // models.posts.findAndCountAll({
    //   limit : 10,
    //   offset : req.body.page*10 ==0 ? 0 :(req.body.page*10)-10,
    //   where : {},
    //   include:[
    //       {
    //           model : models.likes,
    //           required : false,
    //           attributes: {
    //               include: [[sequelize.cast(sequelize.fn('COUNT', sequelize.col('likes.id')), 'INTEGER'), 'likeCount']],
    //             },
    //             group : ['posts.postId'],
    //         }
    //     ],
    // }).then((result)=>{
    //   console.log(result);
    //     res.send({
    //       list : result.rows,
    //       length : result.count
    //     })
    // })
    //orm사용해서 해볼려고 했는데 조금이라도 복잡해지면 작동시키기가 너무어렵다.. 포기하고 로우쿼리로...
    //스프링의 jpa가 그립다.
    var sql;
    var pageSize;
    var page;
    if (!req.body.mobileReload) {
        pageSize = req.body.size
        page = req.body.page * pageSize == 0 ? 0 : (req.body.page * pageSize) - pageSize
    }else{
        pageSize = req.body.page * req.body.size 
        page = 0;
    }

    var input = "%" + req.body.input + "%"
    var option = {}
    switch (req.body.search) {
        case "title":
            option = {
                replacements: [
                    input, input, page, pageSize
                ],
                type: sequelize.QueryTypes.SELECT
            }
            sql = "select posts.thumbnail,posts.postId,posts.userId,posts.views,date_format(posts.updatePost,'%Y-%m-%d %H:%i') updatePost,posts.title,count(distinct comments.id) commentCount, count(distinct likes.id) likeCount, (select count(postId) from posts where title like(?)) length from posts left join likes on likes.postId = posts.postId left join comments on comments.postId = posts.postId group by posts.postId having posts.title like(?) order by posts.updatePost desc  limit ? , ?;"
            //orm 모델에서 date format를 설정해줘도 쿼리를 통해 가져오는 date에는 포맷이 먹히지않기때문에 쿼리 자체에서 해줘야함.

            break;
        case "titleContent":
            option = {
                replacements: [
                    input, input, input, input, page, pageSize
                ],
                type: sequelize.QueryTypes.SELECT
            }
            sql = "select posts.content,posts.thumbnail,posts.postId,posts.userId,posts.views,date_format(posts.updatePost,'%Y-%m-%d %H:%i') updatePost,posts.title,count(distinct comments.id) commentCount, count(distinct likes.id) likeCount,(select count(postId) from posts where title like(?) or content like(?)) length from posts left join likes on likes.postId = posts.postId left join comments on comments.postId = posts.postId group by posts.postId having posts.title like(?) or posts.content like(?) order by posts.updatePost desc  limit ? , ?;"


            break;
        case "userId":
            option = {
                replacements: [
                    input, input, page, pageSize
                ],
                type: sequelize.QueryTypes.SELECT
            }
            sql = "select posts.thumbnail,posts.postId,posts.userId,posts.views,date_format(posts.updatePost,'%Y-%m-%d %H:%i') updatePost,posts.title,count(distinct comments.id) commentCount, count(distinct likes.id) likeCount,(select count(postId) from posts where userId like(?)) length from posts left join likes on likes.postId = posts.postId left join comments on comments.postId = posts.postId group by posts.postId having posts.userId like(?) order by posts.updatePost desc  limit ? , ?;"

            break;
        default:
            option = {
                replacements: [
                    page, pageSize
                ],
                type: sequelize.QueryTypes.SELECT
            }
            sql = "select posts.thumbnail,posts.postId,posts.userId,posts.views,date_format(posts.updatePost,'%Y-%m-%d %H:%i') updatePost,posts.title,count(distinct comments.id) commentCount, count(distinct likes.id) likeCount,(select count(postId) from posts) length from posts left join likes on likes.postId = posts.postId left join comments on comments.postId = posts.postId group by posts.postId order by posts.updatePost  limit ? , ?;"


            break;
    }
    models.sequelize.query(sql, option
    ).then(function (result) {
        if(result[0])
        res.send({list: result, length: result[0].length})
        else res.send({list : false})
    })

})

module.exports = app