<template>
  <div class="min-h-screen w-full bg-gradient-to-br from-blue-50 to-indigo-100">
    <div class="mx-auto w-full max-w-3xl px-4 py-5 sm:py-7">
      <!-- Chat Card -->
      <div class="bg-white/85 backdrop-blur rounded-3xl shadow-xl border border-white/30 overflow-hidden">
        <!-- Sub header -->
        <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-sm font-semibold text-gray-800">Bugün</span>
          </div>
          <div class="text-xs text-gray-500">
            {{ loading ? "Yanıt hazırlanıyor…" : "Hazır" }}
          </div>
        </div>

        <!-- Messages -->
        <div
          ref="chatContainer"
          class="h-[65vh] sm:h-[70vh] overflow-y-auto px-4 sm:px-5 py-5 space-y-4"
        >
          <div
            v-for="(msg, index) in messages"
            :key="index"
            class="flex"
            :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
          >
            <!-- Assistant -->
            <div v-if="msg.role === 'assistant'" class="flex items-start gap-3 max-w-[92%]">
              <div class="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow">
                <RobotIcon class="w-5 h-5" />
              </div>

              <div class="bg-white border border-gray-100 shadow-sm rounded-3xl px-4 py-3">
                <div class="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">
                  {{ msg.content }}
                </div>
                <div class="mt-2 text-[11px] text-gray-400">
                  Dietista • AI
                </div>
              </div>
            </div>

            <!-- User -->
            <div v-else class="flex items-start gap-3 max-w-[92%]">
              <div class="bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-sm rounded-3xl px-4 py-3">
                <div class="text-sm leading-relaxed whitespace-pre-wrap">
                  {{ msg.content }}
                </div>
                <div class="mt-2 text-[11px] text-white/70 text-right">
                  Sen
                </div>
              </div>

              <div class="w-9 h-9 rounded-2xl bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                <span class="text-sm font-extrabold text-gray-700">S</span>
              </div>
            </div>
          </div>

          <!-- Typing bubble -->
          <div v-if="loading" class="flex items-start gap-3">
            <div class="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow">
              <RobotIcon class="w-5 h-5" />
            </div>
            <div class="bg-white border border-gray-100 shadow-sm rounded-3xl px-4 py-3">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-gray-300 animate-bounce"></span>
                <span class="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style="animation-delay:120ms"></span>
                <span class="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style="animation-delay:240ms"></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Input -->
        <div class="p-4 sm:p-5 border-t border-gray-100 bg-white/70">
          <div class="flex items-center gap-2">
            <div class="flex-1 bg-gray-100 rounded-2xl px-3 py-2 border border-gray-200 focus-within:ring-2 focus-within:ring-blue-200">
              <input
                v-model="message"
                type="text"
                class="w-full bg-transparent outline-none text-sm text-gray-900 placeholder:text-gray-500"
                placeholder="Mesajınızı yazın…"
                @keyup.enter="sendMessage"
              />
            </div>

            <button
              @click="sendMessage"
              :disabled="loading || !message.trim()"
              class="px-4 sm:px-5 py-2 rounded-2xl text-sm font-semibold text-white shadow-lg transition
                     bg-gradient-to-r from-blue-500 to-indigo-600
                     hover:opacity-95 active:opacity-90
                     disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Gönder
            </button>
          </div>

          <!-- Quick prompts (demo için çok iyi durur) -->
          <div class="mt-3 grid grid-cols-2 gap-2">
            <button
              v-for="p in quickPrompts"
              :key="p"
              class="text-xs font-semibold px-3 py-2 rounded-2xl bg-white border border-gray-200 shadow-sm hover:bg-gray-50 text-left"
              @click="usePrompt(p)"
              :disabled="loading"
            >
              {{ p }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getChatResponse } from "../api/openrouter";

export default {
  name: "AIDietChat",
  components: {
    RobotIcon: () => import("./RobotIcon.vue"),
  },
  data() {
    return {
      message: "",
      loading: false,
      messages: [
        {
          role: "assistant",
          content:
            "Merhaba! 👋\nHedefini ve gün içinde kaç dakikan olduğunu yaz, sana uygun bir öneri çıkarayım.",
        },
      ],
      quickPrompts: [
        "Kısa bir kardiyo öner.",
        "Bugün ne yemeliyim?",
      ],
    };
  },
  methods: {
    async sendMessage() {
      const trimmed = this.message.trim();
      if (!trimmed || this.loading) return;

      this.messages.push({ role: "user", content: trimmed });
      this.message = "";
      this.loading = true;
      this.scrollToBottom();

      try {
        const aiReply = await getChatResponse(this.messages);
        this.messages.push({ role: "assistant", content: aiReply || "Tamam! 😊" });
      } catch (e) {
        this.messages.push({
          role: "assistant",
          content: "Şu an bir hata oldu. Lütfen tekrar dener misin?",
        });
      } finally {
        this.loading = false;
        this.scrollToBottom();
      }
    },

    usePrompt(p) {
      this.message = p;
      this.$nextTick(() => this.sendMessage());
    },

    resetChat() {
      this.message = "";
      this.loading = false;
      this.messages = [
        {
          role: "assistant",
          content:
            "Merhaba! 👋\nHedefini ve gün içinde kaç dakikan olduğunu yaz, sana uygun bir öneri çıkarayım.",
        },
      ];
      this.scrollToBottom();
    },

    scrollToBottom() {
      this.$nextTick(() => {
        const el = this.$refs.chatContainer;
        if (el) el.scrollTop = el.scrollHeight;
      });
    },
  },
};
</script>
