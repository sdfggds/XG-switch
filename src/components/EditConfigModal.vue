<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
      <!-- 头部 -->
      <div class="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-500 to-pink-500">
        <div class="flex items-center justify-between">
          <h3 class="text-xl font-bold text-white flex items-center gap-2">
            <Edit2 :size="24" />
            编辑配置
          </h3>
          <button
            @click="handleClose"
            class="p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X :size="24" class="text-white" />
          </button>
        </div>
      </div>

      <!-- 内容 -->
      <div class="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
        <div class="space-y-6">
          <!-- 配置名称 -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              配置名称
            </label>
            <input
              v-model="editedConfig.name"
              type="text"
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200"
              placeholder="给配置起个名字"
            />
          </div>

          <!-- Base URL -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Base URL
            </label>
            <input
              v-model="editedConfig.baseUrl"
              type="text"
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200"
              placeholder="API 基础地址"
            />
          </div>

          <!-- API 密钥 -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              API 密钥
            </label>
            <div class="relative">
              <input
                v-model="editedConfig.apiKey"
                :type="showApiKey ? 'text' : 'password'"
                class="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200"
                placeholder="输入您的 API 密钥"
              />
              <button
                @click="showApiKey = !showApiKey"
                class="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <Eye v-if="!showApiKey" :size="18" />
                <EyeOff v-else :size="18" />
              </button>
            </div>
          </div>

          <!-- Claude配置文件内容 -->
          <div v-if="props.type === 'claude'">
            <div class="flex items-center justify-between mb-2">
              <label class="text-sm font-semibold text-gray-700">
                配置文件内容（settings.json）
              </label>
              <div class="flex gap-2">
                <button
                  @click="resetToDefault"
                  class="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center gap-1"
                >
                  恢复默认
                </button>
                <button
                  @click="formatJson"
                  title="格式化JSON，使其更易读（需JSON格式正确）"
                  class="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors flex items-center gap-1"
                >
                  格式化
                </button>
              </div>
            </div>
            <textarea
              v-model="editedConfig.configContent"
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200 font-mono text-sm"
              rows="10"
              placeholder="配置文件的 JSON 内容"
            ></textarea>
            <p v-if="jsonError" class="mt-2 text-sm text-red-600">
              {{ jsonError }}
            </p>
          </div>

          <!-- Codex配置文件内容（双文件） -->
          <div v-if="props.type === 'codex'" class="space-y-4">
            <!-- auth.json -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="text-sm font-semibold text-gray-700">
                  auth.json（API密钥配置）
                </label>
                <div class="flex gap-2">
                  <button
                    @click="resetCodexAuth"
                    class="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center gap-1"
                  >
                    恢复默认
                  </button>
                  <button
                    @click="formatAuthJson"
                    title="格式化JSON，使其更易读（需JSON格式正确）"
                    class="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors flex items-center gap-1"
                  >
                    格式化
                  </button>
                </div>
              </div>
              <textarea
                v-model="editedConfig.authContent"
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200 font-mono text-sm"
                rows="4"
                placeholder='{"OPENAI_API_KEY": "你的API密钥"}'
              ></textarea>
              <p v-if="authJsonError" class="mt-2 text-sm text-red-600">
                {{ authJsonError }}
              </p>
            </div>

            <!-- config.toml -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="text-sm font-semibold text-gray-700">
                  config.toml（服务配置）
                </label>
                <button
                  @click="resetCodexToml"
                  class="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center gap-1"
                >
                  恢复默认
                </button>
              </div>
              <textarea
                v-model="editedConfig.configToml"
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200 font-mono text-sm"
                rows="10"
                placeholder="config.toml 内容"
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
        <button
          @click="handleClose"
          class="px-6 py-2 bg-white border-2 border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
        >
          取消
        </button>
        <button
          @click="handleSave"
          :disabled="(props.type === 'claude' && !!jsonError) || (props.type === 'codex' && !!authJsonError)"
          class="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed"
        >
          保存更改
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { Edit2, X, Eye, EyeOff } from 'lucide-vue-next';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  config: {
    type: Object,
    default: null
  },
  type: {
    type: String,
    required: true // 'claude' 或 'codex'
  }
});

const emit = defineEmits(['close', 'save']);

const editedConfig = ref({
  name: '',
  baseUrl: '',
  apiKey: '',
  configContent: '',
  authContent: '',  // Codex auth.json
  configToml: ''    // Codex config.toml
});

const showApiKey = ref(false);
const jsonError = ref('');
const authJsonError = ref('');

// 监听配置变化
watch(() => props.config, (newConfig) => {
  if (newConfig) {
    if (props.type === 'claude') {
      // 先设置基本信息
      const apiKey = newConfig.apiKey || '';
      const baseUrl = newConfig.baseUrl || '';

      // 处理配置内容
      let configContent = newConfig.configContent;
      if (!configContent) {
        // 如果没有保存的configContent，根据实际值生成
        if (apiKey || baseUrl) {
          configContent = JSON.stringify({
            env: {
              "ANTHROPIC_AUTH_TOKEN": apiKey || "",
              "ANTHROPIC_BASE_URL": baseUrl || "https://www.88code.org/api",
              "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC": "1"
            },
            permissions: {
              allow: [],
              deny: []
            }
          }, null, 2);
        }
      }

      editedConfig.value = {
        name: newConfig.name || '',
        baseUrl: baseUrl,
        apiKey: apiKey,
        configContent: configContent || '',
        authContent: '',
        configToml: ''
      };
    } else if (props.type === 'codex') {
      // 解析Codex的组合配置
      const apiKey = newConfig.apiKey || '';
      const baseUrl = newConfig.baseUrl || '';
      let authContent = '';
      let configToml = '';

      if (newConfig.configContent) {
        try {
          const combined = JSON.parse(newConfig.configContent);
          authContent = combined.authJson;
          configToml = combined.configToml;
        } catch {
          // 解析失败，使用实际值生成
          authContent = '';
          configToml = '';
        }
      }

      // 如果没有authContent，生成包含实际值的auth.json
      if (!authContent) {
        authContent = JSON.stringify({
          "OPENAI_API_KEY": apiKey || ""
        }, null, 2);
      }

      // 如果没有configToml，生成包含实际值的config.toml
      if (!configToml) {
        configToml = `model_provider = "88code"
model = "gpt-5-codex"
model_reasoning_effort = "high"
disable_response_storage = true

[model_providers.88code]
name = "88code"
base_url = "${baseUrl || 'https://88code.org/openai/v1'}"
wire_api = "responses"
env_key = "key88"
requires_openai_auth = true`;
      }

      editedConfig.value = {
        name: newConfig.name || '',
        baseUrl: baseUrl,
        apiKey: apiKey,
        configContent: '',
        authContent: authContent || '',
        configToml: configToml || ''
      };
    }
  }
}, { immediate: true });

// 监听 JSON 内容变化，验证格式（Claude）
watch(() => editedConfig.value.configContent, (content) => {
  if (props.type !== 'claude') return;

  if (!content) {
    jsonError.value = '';
    return;
  }

  try {
    JSON.parse(content);
    jsonError.value = '';
  } catch (error) {
    jsonError.value = 'JSON 格式错误: ' + error.message;
  }
});

// 监听 auth.json 内容变化，验证格式（Codex）
watch(() => editedConfig.value.authContent, (content) => {
  if (props.type !== 'codex') return;

  if (!content) {
    authJsonError.value = '';
    return;
  }

  try {
    JSON.parse(content);
    authJsonError.value = '';
  } catch (error) {
    authJsonError.value = 'JSON 格式错误: ' + error.message;
  }
});

// 获取默认配置内容（Claude）- 始终使用实际值
function getDefaultConfigContent() {
  // 始终使用实际值，不使用占位符
  const apiKey = editedConfig.value.apiKey;
  const baseUrl = editedConfig.value.baseUrl;

  // 只有在没有值的情况下才使用默认URL
  const finalBaseUrl = baseUrl || "https://www.88code.org/api";
  const finalApiKey = apiKey || "";

  return JSON.stringify({
    env: {
      "ANTHROPIC_AUTH_TOKEN": finalApiKey,
      "ANTHROPIC_BASE_URL": finalBaseUrl,
      "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC": "1"
    },
    permissions: {
      allow: [],
      deny: []
    }
  }, null, 2);
}

// 获取默认auth.json（Codex）- 始终使用实际值
function getDefaultAuthJson() {
  // 始终使用实际值，不使用占位符
  const apiKey = editedConfig.value.apiKey || "";

  return JSON.stringify({
    "OPENAI_API_KEY": apiKey
  }, null, 2);
}

// 获取默认config.toml（Codex）- 始终使用实际值
function getDefaultConfigToml() {
  // 始终使用实际值，不使用占位符
  const baseUrl = editedConfig.value.baseUrl || 'https://88code.org/openai/v1';

  return `model_provider = "88code"
model = "gpt-5-codex"
model_reasoning_effort = "high"
disable_response_storage = true

[model_providers.88code]
name = "88code"
base_url = "${baseUrl}"
wire_api = "responses"
env_key = "key88"
requires_openai_auth = true`;
}

// 重置为默认配置
function resetToDefault() {
  if (props.type === 'claude') {
    editedConfig.value.configContent = getDefaultConfigContent();
  }
}

// 重置Codex TOML
function resetCodexToml() {
  editedConfig.value.configToml = getDefaultConfigToml();
}

// 重置Codex Auth
function resetCodexAuth() {
  editedConfig.value.authContent = getDefaultAuthJson();
}

// 格式化 JSON
function formatJson() {
  try {
    const parsed = JSON.parse(editedConfig.value.configContent);
    editedConfig.value.configContent = JSON.stringify(parsed, null, 2);
    jsonError.value = '';
  } catch (error) {
    jsonError.value = 'JSON 格式错误，请先修正格式再格式化';
  }
}

// 格式化auth.json
function formatAuthJson() {
  try {
    const parsed = JSON.parse(editedConfig.value.authContent);
    editedConfig.value.authContent = JSON.stringify(parsed, null, 2);
    authJsonError.value = '';
  } catch (error) {
    authJsonError.value = 'JSON 格式错误，请先修正格式再格式化';
  }
}

// 处理关闭
function handleClose() {
  emit('close');
}

// 处理保存
function handleSave() {
  if (props.type === 'claude') {
    if (jsonError.value) return;

    emit('save', {
      ...props.config,
      name: editedConfig.value.name,
      baseUrl: editedConfig.value.baseUrl,
      apiKey: editedConfig.value.apiKey,
      configContent: editedConfig.value.configContent
    });
  } else if (props.type === 'codex') {
    if (authJsonError.value) return;

    // 合并两个文件为一个JSON
    const combinedContent = JSON.stringify({
      authJson: editedConfig.value.authContent,
      configToml: editedConfig.value.configToml
    });

    emit('save', {
      ...props.config,
      name: editedConfig.value.name,
      baseUrl: editedConfig.value.baseUrl,
      apiKey: editedConfig.value.apiKey,
      configContent: combinedContent
    });
  }
}
</script>