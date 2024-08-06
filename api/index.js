const Koa = require("koa");
const bodyParser = require("koa-bodyparser");
const cors = require("@koa/cors");

const PageController = require("../server/controllers/PageController");

const app = new Koa();

// 允许特定域名跨域请求
const corsOptions = {
  origin: "https://zsf-blog.vercel.app",
};

app.use(cors(corsOptions));

app.use(bodyParser());
app.use(PageController.routes());
app.use(PageController.allowedMethods());

app.listen(3000, () => {
  console.log("服务运行在 3000 端口");
});
