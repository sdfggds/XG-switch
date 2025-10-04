import { ref, computed } from 'vue';
import { invoke } from '@tauri-apps/api/core';

// 配置数据结构
const configStore = ref({
  claude_configs: [],
  codex_configs: [],
  gemini_configs: []
});

// 当前激活的配置
const activeConfigs = ref({
  claude: null,
  codex: null,
  gemini: null
});

// 本地存储键名
const STORAGE_KEY = 'xg_switch_configs';
const ACTIVE_KEY = 'xg_switch_active';

// 加载配置
function loadConfigs() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      configStore.value = JSON.parse(stored);
    }

    const active = localStorage.getItem(ACTIVE_KEY);
    if (active) {
      activeConfigs.value = JSON.parse(active);
    }
  } catch (error) {
    console.error('加载配置失败:', error);
  }
}

// 保存配置到localStorage
function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(configStore.value));
    localStorage.setItem(ACTIVE_KEY, JSON.stringify(activeConfigs.value));
  } catch (error) {
    console.error('保存配置失败:', error);
  }
}

// 生成唯一ID
function generateId() {
  return `config_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// 保存Claude配置
function saveClaudeConfig(name, baseUrl, apiKey, configContent = null) {
  const config = {
    id: generateId(),
    name: name || `配置 ${configStore.value.claude_configs.length + 1}`,
    baseUrl,
    apiKey,
    configContent: configContent || generateDefaultClaudeConfig(baseUrl, apiKey),
    createdAt: Date.now(),
    isActive: false
  };

  configStore.value.claude_configs.push(config);
  saveToStorage();

  return config;
}

// 保存Codex配置
function saveCodexConfig(name, baseUrl, apiKey, configContent = null) {
  const config = {
    id: generateId(),
    name: name || `配置 ${configStore.value.codex_configs.length + 1}`,
    baseUrl,
    apiKey,
    configContent: configContent || generateDefaultCodexConfig(baseUrl, apiKey),
    createdAt: Date.now(),
    isActive: false
  };

  configStore.value.codex_configs.push(config);
  saveToStorage();

  return config;
}

// 生成默认的Claude配置内容
function generateDefaultClaudeConfig(baseUrl, apiKey) {
  return JSON.stringify({
    providers: [{
      id: "claude.openrouter",
      settings: {
        baseUrl: baseUrl,
        headers: {
          "x-api-key": apiKey
        }
      }
    }],
    defaultProvider: "claude.openrouter"
  }, null, 2);
}

// 生成默认的Codex配置内容
function generateDefaultCodexConfig(baseUrl, apiKey) {
  return JSON.stringify({
    provider: {
      name: "custom-provider",
      api: {
        base_url: baseUrl,
        api_key: apiKey,
        model: "gpt-4"
      }
    }
  }, null, 2);
}

// 保存Gemini配置
function saveGeminiConfig(name, baseUrl, apiKey) {
  const config = {
    id: generateId(),
    name: name || `配置 ${configStore.value.gemini_configs.length + 1}`,
    baseUrl,
    apiKey,
    createdAt: Date.now(),
    isActive: false
  };

  configStore.value.gemini_configs.push(config);
  saveToStorage();

  return config;
}

// 切换Claude配置
async function switchClaudeConfig(configId) {
  const config = configStore.value.claude_configs.find(c => c.id === configId);
  if (!config) return { success: false, message: '配置不存在' };

  try {
    // 调用后端应用配置
    await invoke('configure_claude_code', {
      baseUrl: config.baseUrl,
      apiKey: config.apiKey
    });

    // 更新激活状态
    configStore.value.claude_configs.forEach(c => {
      c.isActive = c.id === configId;
    });

    activeConfigs.value.claude = configId;
    saveToStorage();

    return { success: true, message: 'Claude配置已切换' };
  } catch (error) {
    return { success: false, message: error.toString() };
  }
}

// 切换Codex配置
async function switchCodexConfig(configId) {
  const config = configStore.value.codex_configs.find(c => c.id === configId);
  if (!config) return { success: false, message: '配置不存在' };

  try {
    // 调用后端应用配置
    await invoke('configure_codex', {
      baseUrl: config.baseUrl,
      apiKey: config.apiKey
    });

    // 更新激活状态
    configStore.value.codex_configs.forEach(c => {
      c.isActive = c.id === configId;
    });

    activeConfigs.value.codex = configId;
    saveToStorage();

    return { success: true, message: 'Codex配置已切换' };
  } catch (error) {
    return { success: false, message: error.toString() };
  }
}

// 切换Gemini配置
async function switchGeminiConfig(configId) {
  const config = configStore.value.gemini_configs.find(c => c.id === configId);
  if (!config) return { success: false, message: '配置不存在' };

  // Gemini暂时只保存，不实际切换
  configStore.value.gemini_configs.forEach(c => {
    c.isActive = c.id === configId;
  });

  activeConfigs.value.gemini = configId;
  saveToStorage();

  return { success: true, message: 'Gemini配置已保存（功能开发中）' };
}

// 删除配置
function deleteConfig(type, configId) {
  const configKey = `${type}_configs`;
  const configs = configStore.value[configKey];

  if (!configs) return false;

  const index = configs.findIndex(c => c.id === configId);
  if (index === -1) return false;

  configs.splice(index, 1);

  // 如果删除的是激活的配置，清除激活状态
  if (activeConfigs.value[type] === configId) {
    activeConfigs.value[type] = null;
  }

  saveToStorage();
  return true;
}

// 更新配置
function updateConfig(type, configId, updates) {
  const configKey = `${type}_configs`;
  const configs = configStore.value[configKey];

  if (!configs) return false;

  const config = configs.find(c => c.id === configId);
  if (!config) return false;

  Object.assign(config, updates);
  saveToStorage();

  return true;
}

// 获取所有Claude配置
const getClaudeConfigs = computed(() => configStore.value.claude_configs);

// 获取所有Codex配置
const getCodexConfigs = computed(() => configStore.value.codex_configs);

// 获取所有Gemini配置
const getGeminiConfigs = computed(() => configStore.value.gemini_configs);

// 导出配置
async function exportConfigs() {
  const { save } = await import('@tauri-apps/plugin-dialog');
  const { writeTextFile } = await import('@tauri-apps/plugin-fs');

  try {
    // 打开保存文件对话框
    const filePath = await save({
      defaultPath: `xg-switch-configs-${Date.now()}.json`,
      filters: [{
        name: 'JSON配置文件',
        extensions: ['json']
      }]
    });

    // 用户取消保存
    if (!filePath) {
      return false;
    }

    // 生成配置数据
    const data = JSON.stringify(configStore.value, null, 2);

    // 写入文件
    await writeTextFile(filePath, data);

    return true;
  } catch (error) {
    console.error('导出配置失败:', error);
    return false;
  }
}

// 导入配置
async function importConfigs(file) {
  try {
    const text = await file.text();
    const data = JSON.parse(text);

    // 合并配置而不是替换
    if (data.claude_configs) {
      configStore.value.claude_configs.push(...data.claude_configs);
    }
    if (data.codex_configs) {
      configStore.value.codex_configs.push(...data.codex_configs);
    }
    if (data.gemini_configs) {
      configStore.value.gemini_configs.push(...data.gemini_configs);
    }

    saveToStorage();
    return { success: true, message: '配置导入成功' };
  } catch (error) {
    return { success: false, message: '配置文件格式错误' };
  }
}

// 初始化加载
loadConfigs();

// 导出函数
export function useConfigManager() {
  return {
    // 状态
    configStore,
    activeConfigs,

    // 计算属性
    getClaudeConfigs,
    getCodexConfigs,
    getGeminiConfigs,

    // 方法
    saveClaudeConfig,
    saveCodexConfig,
    saveGeminiConfig,
    switchClaudeConfig,
    switchCodexConfig,
    switchGeminiConfig,
    deleteConfig,
    updateConfig,
    exportConfigs,
    importConfigs,
    loadConfigs
  };
}