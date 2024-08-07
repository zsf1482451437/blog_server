const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// 根据环境变量设置数据库文件路径
const dbPath =
  process.env.NODE_ENV === "production"
    ? path.resolve("/tmp", "database.db")
    : path.resolve(__dirname, "database.db");

// 预设的页面路径
const paths = [
  "/docs/工具/curl",
  "/docs/工具/git",
  "/docs/工具/typora",
  "/docs/后端/docker",
  "/docs/后端/java",
  "/docs/后端/linux",
  "/docs/计算机基础/数据结构与算法",
  "/docs/前端/工程化",
  "/docs/前端/微信小程序",
  "/docs/前端/性能",
  "/docs/前端/chrome浏览器",
  "/docs/前端/css",
  "/docs/前端/flutter",
  "/docs/前端/html",
  "/docs/前端/javaScript",
  "/docs/前端/node",
  "/docs/前端/react",
  "/docs/前端/typescript",
  "/docs/前端/vue",
  "/docs/网络/通识",
  "/docs/自我介绍",
  "/docs/category/工具",
  "/docs/category/前端",
  "/docs/category/后端",
  "/docs/category/网络",
  "/docs/category/计算机基础",
];

// 创建 init_flag 表，如果表不存在
const CREATE_INIT_FLAG_TABLE =
  "CREATE TABLE IF NOT EXISTS init_flag (id INTEGER PRIMARY KEY, initialized INTEGER)";

// 查询 init_flag 表中 id 为 1 的记录的 initialized 字段
const SELECT_INIT_FLAG = "SELECT initialized FROM init_flag WHERE id = 1";

// 创建 page 表，如果表不存在
const CREATE_PAGE_TABLE =
  "CREATE TABLE IF NOT EXISTS page (id INTEGER PRIMARY KEY AUTOINCREMENT, path TEXT, pageViews INTEGER)";

// 插入一条记录到 page 表中，包含 path 和 pageViews 字段
const INSERT_PAGE = "INSERT INTO page (path, pageViews) VALUES (?, ?)";

// 插入一条记录到 init_flag 表中，设置 id 为 1 和 initialized 为 1
const INSERT_INIT_FLAG =
  "INSERT INTO init_flag (id, initialized) VALUES (1, 1)";

// 查询 page 表中指定 path 的 pageViews 字段
const SELECT_PAGE_VIEWS = "SELECT pageViews FROM page WHERE path = ?";

// 更新 page 表中指定 path 的记录，将 pageViews 字段加 1
const UPDATE_PAGE_VIEWS =
  "UPDATE page SET pageViews = pageViews + 1 WHERE path = ?";

// 插入一条新记录到 page 表中，包含 path 和 pageViews 字段，pageViews 初始值为 648
const INSERT_NEW_PAGE = "INSERT INTO page (path, pageViews) VALUES (?, 648)";

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

class PageModel {
  constructor() {
    this.db = new sqlite3.Database(dbPath);
    this.initialize();
  }

  // 初始化数据库
  initialize() {
    this.db.serialize(() => {
      this.createInitFlagTable((err) => {
        if (err) {
          console.error("创建 init_flag 表时出错:", err.message);
        } else {
          this.checkInitFlag((err, initialized) => {
            if (err) {
              console.error("检查 init_flag 时出错:", err.message);
            } else if (!initialized) {
              this.createPageTable((err) => {
                if (err) {
                  console.error("创建 page 表时出错:", err.message);
                } else {
                  this.insertInitialPages();
                  this.setInitFlag();
                }
              });
            }
          });
        }
      });
    });
  }

  // 创建 init_flag 表
  createInitFlagTable(callback) {
    this.db.run(CREATE_INIT_FLAG_TABLE, callback);
  }

  // 检查是否已经初始化
  checkInitFlag(callback) {
    this.db.get(SELECT_INIT_FLAG, (err, row) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, row && row.initialized === 1);
      }
    });
  }

  // 创建 page 表
  createPageTable(callback) {
    this.db.run(CREATE_PAGE_TABLE, callback);
  }

  // 插入预设的页面
  insertInitialPages() {
    const insertStmt = this.db.prepare(INSERT_PAGE);
    paths.forEach((path) => insertStmt.run(path, getRandomNumber(1, 10000)));
    insertStmt.finalize();
  }

  setInitFlag() {
    this.db.run(INSERT_INIT_FLAG);
  }

  // 获取所有页面
  getAllPages() {
    return new Promise((resolve, reject) => {
      this.db.all("SELECT * FROM page", [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // 增加页面浏览量
  incrementPageViews(path) {
    return new Promise((resolve, reject) => {
      this.getPageViews(path)
        .then((row) => {
          if (row) {
            return this.updatePageViews(path);
          } else {
            return this.insertNewPage(path);
          }
        })
        .then((pageViews) => resolve(pageViews))
        .catch((err) => reject(err));
    });
  }

  // 查
  getPageViews(path) {
    return new Promise((resolve, reject) => {
      this.db.get(SELECT_PAGE_VIEWS, [path], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // 改
  updatePageViews(path) {
    return new Promise((resolve, reject) => {
      this.db.run(UPDATE_PAGE_VIEWS, [path], (err) => {
        if (err) {
          reject(err);
        } else {
          this.getPageViews(path)
            .then((row) => resolve(row.pageViews))
            .catch((err) => reject(err));
        }
      });
    });
  }

  // 增
  insertNewPage(path) {
    return new Promise((resolve, reject) => {
      this.db.run(INSERT_NEW_PAGE, [path], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(1);
        }
      });
    });
  }
}

module.exports = PageModel;
