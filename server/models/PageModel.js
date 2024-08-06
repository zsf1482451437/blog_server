const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath =
  process.env.DATABASE_PATH || path.resolve(__dirname, "..", "database.db");

class PageModel {
  constructor() {
    this.db = new sqlite3.Database(dbPath);
    this.initialize();
  }

  // 初始化数据库
  initialize() {
    this.db.serialize(() => {
      this.db.run(
        "CREATE TABLE IF NOT EXISTS init_flag (id INTEGER PRIMARY KEY, initialized INTEGER)",
        (err) => {
          if (err) {
            console.error("创建 init_flag 表时出错:", err.message);
          } else {
            this.db.get(
              "SELECT initialized FROM init_flag WHERE id = 1",
              (err, row) => {
                if (err) {
                  console.error("检查 init_flag 时出错:", err.message);
                } else if (!row || row.initialized !== 1) {
                  this.db.run(
                    "CREATE TABLE IF NOT EXISTS page (id INTEGER PRIMARY KEY AUTOINCREMENT, path TEXT, pageViews INTEGER)",
                    (err) => {
                      if (err) {
                        console.error("创建 page 表时出错:", err.message);
                      } else {
                        const insertStmt = this.db.prepare(
                          "INSERT INTO page (path, pageViews) VALUES (?, ?)"
                        );
                        insertStmt.run("/home", 100);
                        insertStmt.run("/about", 200);
                        insertStmt.run("/contact", 300);
                        insertStmt.finalize();

                        this.db.run(
                          "INSERT INTO init_flag (id, initialized) VALUES (1, 1)"
                        );
                      }
                    }
                  );
                }
              }
            );
          }
        }
      );
    });
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
      this.db.get(
        "SELECT pageViews FROM page WHERE path = ?",
        [path],
        (err, row) => {
          if (err) {
            reject(err);
          } else if (row) {
            // 如果路径存在，更新 pageViews
            this.db.run(
              "UPDATE page SET pageViews = pageViews + 1 WHERE path = ?",
              [path],
              (err) => {
                if (err) {
                  reject(err);
                } else {
                  this.db.get(
                    "SELECT pageViews FROM page WHERE path = ?",
                    [path],
                    (err, row) => {
                      if (err) {
                        reject(err);
                      } else {
                        resolve(row.pageViews);
                      }
                    }
                  );
                }
              }
            );
          } else {
            // 如果路径不存在，插入新记录
            this.db.run(
              "INSERT INTO page (path, pageViews) VALUES (?, 1)",
              [path],
              (err) => {
                if (err) {
                  reject(err);
                } else {
                  resolve(1);
                }
              }
            );
          }
        }
      );
    });
  }
}

module.exports = PageModel;
