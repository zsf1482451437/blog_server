const Router = require("koa-router");
const path = require("path");
const fs = require("fs").promises;
const { incrementPageViews } = require("../viewModels/pageViewsViewModel");

const router = new Router();

router.get("/test", async (ctx) => {
  try {
    ctx.body = "test";
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
});

// post 请求,修改txt文件
router.post("/test", async (ctx) => {
  const filePath = "./1.txt";
  const content = ctx.query.path;

  if (!filePath || !content) {
    ctx.status = 400;
    ctx.body = { error: "文件路径和内容是必需的" };
    return;
  }

  try {
    const absolutePath = path.resolve(__dirname, filePath);
    await fs.writeFile(absolutePath, content, "utf8");
    ctx.body = { message: "文件已成功修改" };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
});

router.post("/pageviews", async (ctx) => {
  const path = ctx.query.path;
  if (!path) {
    ctx.status = 400;
    ctx.body = { error: "路径参数是必需的" };
    return;
  }

  try {
    const count = await incrementPageViews(path);
    ctx.body = { count };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
});

module.exports = router;
