const PageModel = require("../models/PageModel");

class PageViewModel {
  constructor() {
    this.pageModel = new PageModel();
  }

  // 获取所有页面
  async getAllPages() {
    try {
      return await this.pageModel.getAllPages();
    } catch (error) {
      throw new Error("获取页面信息失败: " + error.message);
    }
  }

  // 增加页面浏览次数
  async incrementPageViews(path) {
    try {
      return await this.pageModel.incrementPageViews(path);
    } catch (error) {
      throw new Error("增加页面浏览次数失败: " + error.message);
    }
  }
}

module.exports = PageViewModel;
