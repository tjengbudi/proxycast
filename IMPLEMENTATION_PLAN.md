# 图文海报功能实现计划

## 当前进度

### Phase 1: 品牌人设系统扩展 ✅ 完成
**Goal**: 扩展现有人设系统，支持海报设计专用字段（配色、字体、品牌调性）
**Status**: Complete

#### 已完成任务
- [x] 1.1 扩展数据模型 (`project_model.rs`)
  - 新增 BrandPersonality, DesignStyle 枚举
  - 新增 ColorScheme, Typography, LogoPlacement, ImageStyle, IconStyle 结构体
  - 新增 BrandTone, DesignConfig, VisualConfig 结构体
  - 新增 BrandPersonaExtension, BrandPersona, BrandPersonaTemplate 结构体
  - 新增相关请求类型

- [x] 1.2 扩展数据库 Schema (`schema.rs`)
  - 新增 `brand_persona_extensions` 表
  - 包含 persona_id, brand_tone_json, design_json, visual_json 字段

- [x] 1.3 创建 BrandPersona DAO (`brand_persona_dao.rs`)
  - 实现 create, get, update, delete 方法
  - 实现 get_brand_persona 获取完整品牌人设
  - 实现 list_templates 获取预设模板

- [x] 1.4 扩展 PersonaService (`persona_service.rs`)
  - 新增 get_brand_persona, get_brand_extension 方法
  - 新增 save_brand_extension, update_brand_extension 方法
  - 新增 delete_brand_extension, list_brand_persona_templates 方法

- [x] 1.5 扩展 Tauri 命令 (`persona_cmd.rs`)
  - 新增 get_brand_persona, get_brand_extension 命令
  - 新增 save_brand_extension, update_brand_extension 命令
  - 新增 delete_brand_extension, list_brand_persona_templates 命令
  - 在 runner.rs 中注册新命令

- [x] 1.6 新增前端类型 (`brand-persona.ts`)
  - 定义所有品牌人设相关的 TypeScript 类型
  - 包含预设配色方案、字体列表、默认值等常量

- [x] 1.7 新增 useBrandPersona Hook (`useBrandPersona.ts`)
  - 实现品牌人设的 CRUD 操作
  - 支持模板应用功能

- [x] 1.8 新增 BrandPersonaDialog 组件 (`BrandPersonaDialog.tsx`)
  - 分步骤创建品牌人设（品牌调性 → 配色方案 → 字体设置 → 预览确认）
  - 支持模板快速应用
  - 支持预设配色方案选择
  - 实时预览效果

#### 验证标准
- [x] 能够创建包含配色方案的品牌人设
- [x] 品牌人设能够正确保存和加载
- [x] 在项目详情页能够管理品牌人设

---

### Phase 2: 素材库扩展
**Goal**: 扩展素材库支持 icon, color, layout 类型
**Status**: Not Started

---

### Phase 3: 海报 Agent 系统
**Goal**: 实现 6 个专用 Agent，支持对话式海报设计
**Status**: Not Started

---

### Phase 4: 工作流系统
**Goal**: 实现 6 步引导工作流
**Status**: Not Started

---

### Phase 5: 多平台导出
**Goal**: 实现多平台尺寸适配和导出
**Status**: Not Started

---

## 新增文件清单

### 后端 (Rust)
- `src-tauri/src/database/dao/brand_persona_dao.rs` - 品牌人设 DAO

### 前端 (TypeScript/React)
- `src/types/brand-persona.ts` - 品牌人设类型定义
- `src/hooks/useBrandPersona.ts` - 品牌人设 Hook
- `src/components/projects/dialogs/BrandPersonaDialog.tsx` - 品牌人设对话框

## 修改文件清单

### 后端 (Rust)
- `src-tauri/src/models/project_model.rs` - 新增品牌人设数据模型
- `src-tauri/src/database/schema.rs` - 新增品牌人设扩展表
- `src-tauri/src/database/dao/mod.rs` - 导出新 DAO
- `src-tauri/src/services/persona_service.rs` - 新增品牌人设服务方法
- `src-tauri/src/commands/persona_cmd.rs` - 新增品牌人设命令
- `src-tauri/src/app/runner.rs` - 注册新命令

### 前端 (TypeScript/React)
- `src/types/index.ts` - 导出新类型
- `src/hooks/index.ts` - 导出新 Hook
- `src/components/projects/dialogs/index.ts` - 导出新组件
