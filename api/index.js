const Koa = require("koa");
const bodyParser = require("koa-bodyparser");
const PageController = require("../server/controllers/PageController");

const app = new Koa();

app.use(bodyParser());
app.use(PageController.routes());
app.use(PageController.allowedMethods());

app.listen(3000, () => {
  console.log("服务运行在 3000 端口");
});
