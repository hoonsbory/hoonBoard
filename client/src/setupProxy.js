const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use("/api/**", createProxyMiddleware({ target: "http://localhost:7000", changeOrigin: true}));
};
//react-scripts 2.0이상부터는 package.json에 proxy를 적는 것이 아니라 미들웨어를 사용해서 프록시를 설정해야함.