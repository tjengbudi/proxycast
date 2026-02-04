//! 海报素材相关的 Tauri 命令
//!
//! 提供海报素材元数据（PosterMaterialMetadata）管理的前端 API，包括：
//! - 创建、获取、更新、删除海报素材元数据
//! - 按分类筛选素材

use tauri::State;

use crate::database::dao::poster_material_dao::PosterMaterialDao;
use crate::database::DbConnection;
use crate::models::project_model::{
    CreatePosterMetadataRequest, PosterMaterial, PosterMaterialMetadata,
};

// ============================================================================
// Tauri 命令
// ============================================================================

/// 创建海报素材元数据
///
/// 为已存在的素材创建海报专用元数据。
///
/// # 参数
/// - `db`: 数据库连接状态
/// - `req`: 创建请求
///
/// # 返回
/// - 成功返回创建的元数据
/// - 失败返回错误信息
#[tauri::command]
pub async fn create_poster_metadata(
    db: State<'_, DbConnection>,
    req: CreatePosterMetadataRequest,
) -> Result<PosterMaterialMetadata, String> {
    let conn = db.lock().map_err(|e| format!("数据库锁定失败: {e}"))?;
    PosterMaterialDao::create(&conn, &req).map_err(|e| e.to_string())
}

/// 获取海报素材元数据
///
/// 根据素材 ID 获取海报元数据。
///
/// # 参数
/// - `db`: 数据库连接状态
/// - `material_id`: 素材 ID
///
/// # 返回
/// - 成功返回 Option<PosterMaterialMetadata>
/// - 失败返回错误信息
#[tauri::command]
pub async fn get_poster_metadata(
    db: State<'_, DbConnection>,
    material_id: String,
) -> Result<Option<PosterMaterialMetadata>, String> {
    let conn = db.lock().map_err(|e| format!("数据库锁定失败: {e}"))?;
    PosterMaterialDao::get(&conn, &material_id).map_err(|e| e.to_string())
}

/// 获取完整的海报素材
///
/// 获取包含基础素材和元数据的完整海报素材。
///
/// # 参数
/// - `db`: 数据库连接状态
/// - `material_id`: 素材 ID
///
/// # 返回
/// - 成功返回 Option<PosterMaterial>
/// - 失败返回错误信息
#[tauri::command]
pub async fn get_poster_material(
    db: State<'_, DbConnection>,
    material_id: String,
) -> Result<Option<PosterMaterial>, String> {
    let conn = db.lock().map_err(|e| format!("数据库锁定失败: {e}"))?;
    PosterMaterialDao::get_poster_material(&conn, &material_id).map_err(|e| e.to_string())
}

/// 按图片分类获取素材列表
///
/// 获取指定项目下的图片素材，可按分类筛选。
///
/// # 参数
/// - `db`: 数据库连接状态
/// - `project_id`: 项目 ID
/// - `category`: 可选的图片分类
///
/// # 返回
/// - 成功返回海报素材列表
/// - 失败返回错误信息
#[tauri::command]
pub async fn list_by_image_category(
    db: State<'_, DbConnection>,
    project_id: String,
    category: Option<String>,
) -> Result<Vec<PosterMaterial>, String> {
    let conn = db.lock().map_err(|e| format!("数据库锁定失败: {e}"))?;
    PosterMaterialDao::list_by_image_category(&conn, &project_id, category.as_deref())
        .map_err(|e| e.to_string())
}

/// 按布局分类获取素材列表
///
/// 获取指定项目下的布局素材，可按分类筛选。
///
/// # 参数
/// - `db`: 数据库连接状态
/// - `project_id`: 项目 ID
/// - `category`: 可选的布局分类
///
/// # 返回
/// - 成功返回海报素材列表
/// - 失败返回错误信息
#[tauri::command]
pub async fn list_by_layout_category(
    db: State<'_, DbConnection>,
    project_id: String,
    category: Option<String>,
) -> Result<Vec<PosterMaterial>, String> {
    let conn = db.lock().map_err(|e| format!("数据库锁定失败: {e}"))?;
    PosterMaterialDao::list_by_layout_category(&conn, &project_id, category.as_deref())
        .map_err(|e| e.to_string())
}

/// 按配色氛围获取素材列表
///
/// 获取指定项目下的配色素材，可按氛围筛选。
///
/// # 参数
/// - `db`: 数据库连接状态
/// - `project_id`: 项目 ID
/// - `mood`: 可选的配色氛围
///
/// # 返回
/// - 成功返回海报素材列表
/// - 失败返回错误信息
#[tauri::command]
pub async fn list_by_mood(
    db: State<'_, DbConnection>,
    project_id: String,
    mood: Option<String>,
) -> Result<Vec<PosterMaterial>, String> {
    let conn = db.lock().map_err(|e| format!("数据库锁定失败: {e}"))?;
    PosterMaterialDao::list_by_mood(&conn, &project_id, mood.as_deref()).map_err(|e| e.to_string())
}

/// 更新海报素材元数据
///
/// 更新指定素材的海报元数据。如果元数据不存在，则创建新的。
///
/// # 参数
/// - `db`: 数据库连接状态
/// - `material_id`: 素材 ID
/// - `req`: 更新请求
///
/// # 返回
/// - 成功返回更新后的元数据
/// - 失败返回错误信息
#[tauri::command]
pub async fn update_poster_metadata(
    db: State<'_, DbConnection>,
    material_id: String,
    req: CreatePosterMetadataRequest,
) -> Result<PosterMaterialMetadata, String> {
    let conn = db.lock().map_err(|e| format!("数据库锁定失败: {e}"))?;
    PosterMaterialDao::update(&conn, &material_id, &req).map_err(|e| e.to_string())
}

/// 删除海报素材元数据
///
/// 删除指定素材的海报元数据。
/// 注意：这只删除元数据，不删除基础素材。
///
/// # 参数
/// - `db`: 数据库连接状态
/// - `material_id`: 素材 ID
///
/// # 返回
/// - 成功返回 ()
/// - 失败返回错误信息
#[tauri::command]
pub async fn delete_poster_metadata(
    db: State<'_, DbConnection>,
    material_id: String,
) -> Result<(), String> {
    let conn = db.lock().map_err(|e| format!("数据库锁定失败: {e}"))?;
    PosterMaterialDao::delete(&conn, &material_id).map_err(|e| e.to_string())
}
