# ADR 0001：JSON 作為專案真實來源

## 決策

使用可讀的 `storyboard.json` 作為唯一可攜真實來源，SQLite 只作索引與 cache。

## 理由

- 方便版本控制、備份與 Agent 操作。
- App 損壞時仍可救回資料。
- 可與其他影片工具交換。

## 代價

- 大型專案整檔寫入成本較高。
- 需要 atomic save、backup 與 migration。
