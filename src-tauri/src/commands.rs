use crate::claude_config;
use crate::codex_config;
use crate::config;
use crate::env_manager;
use crate::vscode;

/// 默认的 Base URL
const DEFAULT_CLAUDE_BASE_URL: &str = "https://www.88code.org/api";
const DEFAULT_CODEX_BASE_URL: &str = "https://88code.org/openai/v1";

/// 配置 Claude Code
#[tauri::command]
pub async fn configure_claude_code(base_url: String, api_key: String) -> Result<String, String> {
    // 验证输入
    if api_key.trim().is_empty() {
        return Err("API 密钥不能为空".to_string());
    }

    // 如果 base_url 为空，使用 Claude 默认值
    let base_url = if base_url.trim().is_empty() {
        DEFAULT_CLAUDE_BASE_URL.to_string()
    } else {
        base_url.trim().to_string()
    };

    // 配置 Claude Code
    claude_config::configure_claude_code(base_url, api_key)?;

    Ok("Claude Code 配置成功！".to_string())
}

/// 配置 Codex 并设置环境变量
#[tauri::command]
pub async fn configure_codex(base_url: String, api_key: String) -> Result<String, String> {
    // 验证输入
    if api_key.trim().is_empty() {
        return Err("API 密钥不能为空".to_string());
    }

    // 如果 base_url 为空，使用 Codex 默认值
    let base_url = if base_url.trim().is_empty() {
        DEFAULT_CODEX_BASE_URL.to_string()
    } else {
        base_url.trim().to_string()
    };

    // 配置 Codex
    codex_config::configure_codex(base_url, api_key.clone())?;

    // 设置环境变量 key88
    env_manager::set_key88_env(api_key)?;

    #[cfg(windows)]
    {
        Ok("Codex 配置成功！环境变量 key88 已设置，请重启 Codex 以使环境变量生效。".to_string())
    }

    #[cfg(not(windows))]
    {
        Ok("Codex 配置成功！环境变量 key88 已添加到 shell 配置文件，请重启终端或运行 'source ~/.zshrc' (或相应的配置文件) 以使环境变量生效。".to_string())
    }
}

/// 获取配置路径信息
#[tauri::command]
pub async fn get_config_paths() -> Result<config::ConfigPaths, String> {
    Ok(config::get_config_paths_info())
}

/// 读取当前 Claude Code 配置
#[tauri::command]
pub async fn get_current_claude_config() -> Result<Option<claude_config::ClaudeSettings>, String> {
    match claude_config::get_claude_config() {
        Ok(settings) => Ok(Some(settings)),
        Err(_) => Ok(None),
    }
}

/// 读取当前 Codex 配置
#[tauri::command]
pub async fn get_current_codex_auth() -> Result<Option<codex_config::CodexAuth>, String> {
    codex_config::get_codex_auth()
}

/// 配置 VSCode Claude 扩展
#[tauri::command]
pub async fn configure_vscode_claude(base_url: String, api_key: String) -> Result<String, String> {
    // 如果 api_key 为空，使用默认值 "key"
    let api_key = if api_key.trim().is_empty() {
        "key".to_string()
    } else {
        api_key.trim().to_string()
    };

    // VSCode Claude 扩展只需要 API Key，base_url 不做检查
    vscode::configure_vscode_claude(api_key, base_url)
}

/// 配置 VSCode Codex 扩展
#[tauri::command]
pub async fn configure_vscode_codex(base_url: String, api_key: String) -> Result<String, String> {
    if api_key.trim().is_empty() {
        return Err("API 密钥不能为空".to_string());
    }

    // 如果 base_url 为空，使用 Codex 默认值
    let base_url = if base_url.trim().is_empty() {
        DEFAULT_CODEX_BASE_URL.to_string()
    } else {
        base_url.trim().to_string()
    };

    vscode::configure_vscode_codex(base_url, api_key)
}

/// 获取 VSCode 配置路径
#[tauri::command]
pub async fn get_vscode_paths() -> Result<Vec<String>, String> {
    Ok(vscode::get_vscode_paths_info())
}

/// 使用自定义内容配置 Claude Code
#[tauri::command]
pub async fn configure_claude_with_content(config_content: String) -> Result<String, String> {
    use crate::config::{get_claude_settings_path, write_text_file};

    // 验证 JSON 格式
    let _: serde_json::Value = serde_json::from_str(&config_content)
        .map_err(|e| format!("配置内容格式错误: {}", e))?;

    // 获取配置文件路径
    let settings_path = get_claude_settings_path();

    // 写入配置文件
    write_text_file(&settings_path, &config_content)?;

    log::info!("Claude Code 自定义配置成功: {:?}", settings_path);
    Ok("Claude Code 配置成功（使用自定义内容）！".to_string())
}

/// 使用自定义内容配置 Codex
#[tauri::command]
pub async fn configure_codex_with_content(config_content: String) -> Result<String, String> {
    use crate::config::{get_codex_config_path, get_codex_auth_path, write_text_file, write_json_file};
    use crate::codex_config::CodexAuth;
    use serde_json::Value;
    use std::collections::HashMap;

    // 解析 JSON 内容
    let config_json: Value = serde_json::from_str(&config_content)
        .map_err(|e| format!("配置内容格式错误: {}", e))?;

    // 检查是否包含authJson和configToml（来自前端高级配置）
    if let (Some(auth_json_str), Some(config_toml_str)) =
        (config_json.get("authJson").and_then(|v| v.as_str()),
         config_json.get("configToml").and_then(|v| v.as_str())) {

        // 处理auth.json
        let auth_json: Value = serde_json::from_str(auth_json_str)
            .map_err(|e| format!("auth.json格式错误: {}", e))?;

        if let Some(api_key) = auth_json.get("OPENAI_API_KEY").and_then(|v| v.as_str()) {
            let auth = CodexAuth {
                openai_api_key: api_key.to_string(),
                extra: HashMap::new(),
            };
            let auth_path = get_codex_auth_path();
            write_json_file(&auth_path, &auth)?;

            // 设置环境变量 key88
            env_manager::set_key88_env(api_key.to_string())?;
        }

        // 写入config.toml
        let config_path = get_codex_config_path();
        write_text_file(&config_path, config_toml_str)?;

    } else if let Some(provider) = config_json.get("provider") {
        // 旧格式的兼容处理
        let config_path = get_codex_config_path();

        // 生成 config.toml 内容
        let base_url = provider.get("api")
            .and_then(|api| api.get("base_url"))
            .and_then(|url| url.as_str())
            .unwrap_or(DEFAULT_CODEX_BASE_URL);

        let config_toml = format!(
            r#"model_provider = "88code"
model = "gpt-5-codex"
model_reasoning_effort = "high"
disable_response_storage = true

[model_providers.88code]
name = "88code"
base_url = "{}"
wire_api = "responses"
env_key = "key88"
requires_openai_auth = true
"#,
            base_url
        );

        write_text_file(&config_path, &config_toml)?;

        // 如果有 api_key，也写入 auth.json
        if let Some(api_key) = provider.get("api")
            .and_then(|api| api.get("api_key"))
            .and_then(|key| key.as_str()) {
            let auth = CodexAuth {
                openai_api_key: api_key.to_string(),
                extra: HashMap::new(),
            };
            let auth_path = get_codex_auth_path();
            write_json_file(&auth_path, &auth)?;

            // 设置环境变量 key88
            env_manager::set_key88_env(api_key.to_string())?;
        }
    } else {
        return Err("配置格式不正确".to_string());
    }

    log::info!("Codex 自定义配置成功");
    Ok("Codex 配置成功（使用自定义内容）！".to_string())
}
