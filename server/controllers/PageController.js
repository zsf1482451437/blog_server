const Router = require("koa-router");
const PageViewModel = require("../viewModels/PageViewModel");

const router = new Router();
const pageViewModel = new PageViewModel();

// 监听 GET 请求
router.get("/allPageViews", async (ctx) => {
  try {
    const pages = await pageViewModel.getAllPages();
    ctx.status = 200;
    ctx.body = pages;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
});

// 监听 POST 请求
router.post("/incrementPageViews", async (ctx) => {
  const { path } = ctx.query;
  if (!path) {
    ctx.status = 400;
    ctx.body = { error: "缺少必要路径" };
  } else {
    try {
      const pageViews = await pageViewModel.incrementPageViews(path);
      ctx.status = 200;
      ctx.body = { path, pageViews };
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: error.message };
    }
  }
});

module.exports = router;
