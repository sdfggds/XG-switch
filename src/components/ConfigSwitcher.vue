<template>
  <div class="flex-1 p-8 bg-gradient-to-br from-purple-50 via-white to-pink-50 overflow-y-auto">
    <div class="max-w-6xl mx-auto">
      <!-- 头部 -->
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center gap-4">
          <div class="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg">
            <ToggleLeft class="text-white" :size="32" />
          </div>
          <div>
            <h2 class="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              配置管理
            </h2>
            <p class="text-gray-600 text-sm mt-1">
              管理和切换不同站点的配置
            </p>
          </div>
        </div>

        <div class="flex gap-3">
          <button
            @click="handleImport"
            class="px-4 py-2 bg-white border-2 border-purple-300 text-purple-600 font-semibold rounded-xl hover:bg-purple-50 transition-all duration-200 flex items-center gap-2"
          >
            <Upload :size="18" />
            导入配置
          </button>
          <button
            @click="handleExport"
            class="px-4 py-2 bg-white border-2 border-purple-300 text-purple-600 font-semibold rounded-xl hover:bg-purple-50 transition-all duration-200 flex items-center gap-2"
          >
            <Download :size="18" />
            导出配置
          </button>
        </div>
      </div>

      <!-- 标签页 -->
      <div class="bg-gray-100 p-1.5 rounded-xl mb-6 inline-flex gap-1">
        <TabButton :active="activeTab === 'claude'" @click="activeTab = 'claude'">
          <ClaudeIcon :size="16" class="inline mr-2" />Claude Code
        </TabButton>
        <TabButton :active="activeTab === 'codex'" @click="activeTab = 'codex'">
          <CodexIcon :size="16" class="inline mr-2" />Codex
        </TabButton>
        <TabButton :active="activeTab === 'gemini'" @click="activeTab = 'gemini'">
          <GeminiIcon :size="16" class="inline mr-2" />Gemini
        </TabButton>
      </div>

      <!-- Claude 配置列表 -->
      <div v-show="activeTab === 'claude'" class="animate-fade-in">
        <div class="grid gap-4">
          <div v-if="claudeConfigs.length === 0" class="bg-white rounded-xl p-12 text-center shadow-lg">
            <ClaudeIcon :size="48" class="mx-auto text-gray-400 mb-4" />
            <p class="text-gray-500">暂无 Claude Code 配置</p>
            <p class="text-sm text-gray-400 mt-2">在 Claude Code 配置页面保存配置后，会在这里显示</p>
          </div>

          <div
            v-for="config in claudeConfigs"
            :key="config.id"
            class="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-2"
            :class="config.isActive ? 'border-blue-500' : 'border-transparent'"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <h3 class="text-lg font-semibold text-gray-900">{{ config.name }}</h3>
                  <span
                    v-if="config.isActive"
                    class="px-2 py-1 bg-blue-100 text-blue-600 text-xs font-semibold rounded-full"
                  >
                    当前使用
                  </span>
                </div>
                <p class="text-sm text-gray-600 mb-1">
                  <span class="font-medium">URL:</span> {{ config.baseUrl }}
                </p>
                <p class="text-xs text-gray-400">
                  创建时间: {{ formatDate(config.createdAt) }}
                </p>
              </div>

              <div class="flex gap-2">
                <button
                  @click="switchConfig('claude', config.id)"
                  :disabled="config.isActive || isLoading"
                  class="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed"
                >
                  {{ config.isActive ? '使用中' : '切换' }}
                </button>
                <button
                  @click="editConfig('claude', config)"
                  class="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Edit2 :size="18" />
                </button>
                <button
                  @click="deleteConfig('claude', config.id)"
                  class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 :size="18" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Codex 配置列表 -->
      <div v-show="activeTab === 'codex'" class="animate-fade-in">
        <div class="grid gap-4">
          <div v-if="codexConfigs.length === 0" class="bg-white rounded-xl p-12 text-center shadow-lg">
            <CodexIcon :size="48" class="mx-auto text-gray-400 mb-4" />
            <p class="text-gray-500">暂无 Codex 配置</p>
            <p class="text-sm text-gray-400 mt-2">在 Codex 配置页面保存配置后，会在这里显示</p>
          </div>

          <div
            v-for="config in codexConfigs"
            :key="config.id"
            class="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-2"
            :class="config.isActive ? 'border-green-500' : 'border-transparent'"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <h3 class="text-lg font-semibold text-gray-900">{{ config.name }}</h3>
                  <span
                    v-if="config.isActive"
                    class="px-2 py-1 bg-green-100 text-green-600 text-xs font-semibold rounded-full"
                  >
                    当前使用
                  </span>
                </div>
                <p class="text-sm text-gray-600 mb-1">
                  <span class="font-medium">URL:</span> {{ config.baseUrl }}
                </p>
                <p class="text-xs text-gray-400">
                  创建时间: {{ formatDate(config.createdAt) }}
                </p>
              </div>

              <div class="flex gap-2">
                <button
                  @click="switchConfig('codex', config.id)"
                  :disabled="config.isActive || isLoading"
                  class="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed"
                >
                  {{ config.isActive ? '使用中' : '切换' }}
                </button>
                <button
                  @click="editConfig('codex', config)"
                  class="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Edit2 :size="18" />
                </button>
                <button
                  @click="deleteConfig('codex', config.id)"
                  class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 :size="18" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Gemini 配置列表 -->
      <div v-show="activeTab === 'gemini'" class="animate-fade-in">
        <div class="grid gap-4">
          <div v-if="geminiConfigs.length === 0" class="bg-white rounded-xl p-12 text-center shadow-lg">
            <GeminiIcon :size="48" class="mx-auto text-gray-400 mb-4" />
            <p class="text-gray-500">暂无 Gemini 配置</p>
            <p class="text-sm text-gray-400 mt-2">Gemini 功能正在开发中</p>
          </div>

          <div
            v-for="config in geminiConfigs"
            :key="config.id"
            class="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 border-transparent"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <h3 class="text-lg font-semibold text-gray-900">{{ config.name }}</h3>
                  <span class="px-2 py-1 bg-yellow-100 text-yellow-600 text-xs font-semibold rounded-full">
                    开发中
                  </span>
                </div>
                <p class="text-sm text-gray-600 mb-1">
                  <span class="font-medium">URL:</span> {{ config.baseUrl }}
                </p>
                <p class="text-xs text-gray-400">
                  创建时间: {{ formatDate(config.createdAt) }}
                </p>
              </div>

              <div class="flex gap-2">
                <button
                  disabled
                  class="px-4 py-2 bg-gray-400 text-white font-medium rounded-lg cursor-not-allowed"
                >
                  开发中
                </button>
                <button
                  @click="deleteConfig('gemini', config.id)"
                  class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 :size="18" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 导入文件input（隐藏） -->
    <input
      ref="importInput"
      type="file"
      accept=".json"
      @change="handleFileImport"
      style="display: none"
    />

    <!-- 编辑配置模态框 -->
    <EditConfigModal
      :isOpen="isEditModalOpen"
      :config="editingConfig"
      :type="editingType"
      @close="isEditModalOpen = false"
      @save="handleEditSave"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import {
  ToggleLeft,
  Upload,
  Download,
  Edit2,
  Trash2
} from 'lucide-vue-next';
import TabButton from './TabButton.vue';
import EditConfigModal from './EditConfigModal.vue';
import ClaudeIcon from './icons/ClaudeIcon.vue';
import CodexIcon from './icons/CodexIcon.vue';
import GeminiIcon from './icons/GeminiIcon.vue';
import { useConfigManager } from '../composables/useConfigManager';

const emit = defineEmits(['success', 'error']);

const {
  getClaudeConfigs,
  getCodexConfigs,
  getGeminiConfigs,
  switchClaudeConfig,
  switchCodexConfig,
  switchGeminiConfig,
  deleteConfig: deleteConfigAction,
  updateConfig,
  exportConfigs,
  importConfigs
} = useConfigManager();

const activeTab = ref('claude');
const isLoading = ref(false);
const importInput = ref(null);

// 编辑模态框相关
const isEditModalOpen = ref(false);
const editingConfig = ref(null);
const editingType = ref('');

// 计算属性
const claudeConfigs = computed(() => getClaudeConfigs.value);
const codexConfigs = computed(() => getCodexConfigs.value);
const geminiConfigs = computed(() => getGeminiConfigs.value);

// 格式化日期
const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 切换配置
const switchConfig = async (type, configId) => {
  isLoading.value = true;

  try {
    let result;
    if (type === 'claude') {
      result = await switchClaudeConfig(configId);
    } else if (type === 'codex') {
      result = await switchCodexConfig(configId);
    } else if (type === 'gemini') {
      result = await switchGeminiConfig(configId);
    }

    if (result.success) {
      emit('success', result.message);
    } else {
      emit('error', result.message);
    }
  } catch (error) {
    emit('error', `切换配置失败: ${error}`);
  } finally {
    isLoading.value = false;
  }
};

// 编辑配置
const editConfig = (type, config) => {
  editingType.value = type;
  editingConfig.value = config;
  isEditModalOpen.value = true;
};

// 处理编辑保存
const handleEditSave = (updatedConfig) => {
  const success = updateConfig(editingType.value, updatedConfig.id, updatedConfig);
  if (success) {
    emit('success', '配置已更新');
    isEditModalOpen.value = false;
  } else {
    emit('error', '更新配置失败');
  }
};

// 删除配置
const deleteConfig = (type, configId) => {
  if (!confirm('确定要删除这个配置吗？')) {
    return;
  }

  const success = deleteConfigAction(type, configId);
  if (success) {
    emit('success', '配置已删除');
  } else {
    emit('error', '删除配置失败');
  }
};

// 导出配置
const handleExport = async () => {
  const success = await exportConfigs();
  if (success) {
    emit('success', '配置已成功导出到指定位置');
  } else if (success === false) {
    emit('error', '导出配置失败');
  }
  // success === null 表示用户取消，不显示任何提示
};

// 导入配置
const handleImport = () => {
  importInput.value?.click();
};

// 处理文件导入
const handleFileImport = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const result = await importConfigs(file);
  if (result.success) {
    emit('success', result.message);
  } else {
    emit('error', result.message);
  }

  // 清空input
  event.target.value = '';
};
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}
</style>