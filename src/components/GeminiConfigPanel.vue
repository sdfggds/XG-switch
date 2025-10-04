<template>
  <div class="flex-1 p-8 bg-gradient-to-br from-green-50 via-white to-emerald-50 overflow-y-auto">
    <div class="max-w-4xl mx-auto">
      <!-- 头部 -->
      <div class="flex items-center gap-4 mb-8">
        <div class="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
          <GeminiIcon :size="32" color="white" />
        </div>
        <div>
          <h2 class="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Gemini 配置
          </h2>
          <p class="text-gray-600 text-sm mt-1">
            配置您的 Gemini AI 服务连接
          </p>
        </div>
      </div>

      <!-- 配置表单 -->
      <div class="bg-white rounded-2xl shadow-xl p-8 mb-6 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
        <div class="mb-6">
          <label class="block text-sm font-semibold text-gray-700 mb-3">
            配置名称
          </label>
          <input
            v-model="geminiConfig.name"
            type="text"
            class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200"
            placeholder="给配置起个名字（可选）"
          />
        </div>

        <div class="mb-6">
          <label class="block text-sm font-semibold text-gray-700 mb-3">
            Base URL
          </label>
          <input
            v-model="geminiConfig.baseUrl"
            type="text"
            class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200"
            placeholder="https://api.example.com/gemini"
            disabled
          />
        </div>

        <div class="mb-8">
          <label class="block text-sm font-semibold text-gray-700 mb-3">
            API 密钥
          </label>
          <input
            v-model="geminiConfig.apiKey"
            type="password"
            class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200"
            placeholder="输入您的 API 密钥"
            disabled
          />
        </div>

        <div class="flex gap-4">
          <button
            @click="handleSaveConfig"
            :disabled="true"
            class="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 text-white font-semibold py-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save :size="20" />
            保存配置（开发中）
          </button>

          <button
            @click="handleAutoConfigure"
            :disabled="true"
            class="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 text-white font-semibold py-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Settings :size="20" />
            自动配置（开发中）
          </button>
        </div>
      </div>

      <!-- 开发中提示 -->
      <div class="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-8 text-center">
        <div class="inline-block p-4 bg-yellow-100 rounded-full mb-4">
          <AlertCircle :size="48" class="text-yellow-600" />
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">功能开发中</h3>
        <p class="text-gray-600 mb-6">
          Gemini 配置功能正在开发中，敬请期待！
        </p>
        <div class="inline-flex items-center gap-2 text-sm text-yellow-700 bg-yellow-100 px-4 py-2 rounded-lg">
          <Clock :size="16" />
          <span>预计在下一个版本中推出</span>
        </div>
      </div>

      <!-- 说明信息 -->
      <div class="bg-green-50 border-2 border-green-200 rounded-xl p-5 mt-6">
        <h3 class="text-sm font-semibold text-green-900 mb-3 flex items-center gap-2">
          <Info :size="16" />关于 Gemini
        </h3>
        <ul class="text-xs text-green-700 space-y-2">
          <li class="flex items-start gap-2">
            <span class="text-green-500 mt-0.5">•</span>
            <span>Gemini 是 Google 开发的先进 AI 模型</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-green-500 mt-0.5">•</span>
            <span>支持多模态输入和输出</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-green-500 mt-0.5">•</span>
            <span>提供强大的代码生成和理解能力</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-green-500 mt-0.5">•</span>
            <span>功能即将上线，敬请期待</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Settings, Save, AlertCircle, Info, Clock } from 'lucide-vue-next';
import GeminiIcon from './icons/GeminiIcon.vue';
import { useConfigManager } from '../composables/useConfigManager';

const props = defineProps({
  configPaths: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['success', 'error']);

const { saveGeminiConfig } = useConfigManager();

const geminiConfig = ref({
  name: '',
  baseUrl: 'https://api.gemini.com',
  apiKey: ''
});

const handleSaveConfig = async () => {
  // 功能开发中
  emit('error', 'Gemini 配置功能正在开发中');
};

const handleAutoConfigure = async () => {
  // 功能开发中
  emit('error', 'Gemini 自动配置功能正在开发中');
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