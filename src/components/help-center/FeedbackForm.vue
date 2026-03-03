<template>
  <section class="panel-container text-color-difference p-4">
    <div class="grid grid-cols-1 gap-5">
      <div class="space-y-2 md:col-span-1">
        <div class="space-y-2">
          <Label :label="t('label.title')" />
          <input v-model="form.title" type="text" class="input-border input-common p-2" />
        </div>
        <!-- <div class="md:col-span-2 space-y-2">
          <Label :label="t('label.type')" />
          <ElSelect v-model="form.type" class="w-full" :placeholder="t('label.type')">
            <ElOption :label="t('helpCenter.feedback_type.bug')" value="bug" />
            <ElOption :label="t('helpCenter.feedback_type.other')" value="other" />
          </ElSelect>
        </div> -->
      </div>

      <div class="md:col-span-2">
        <div class="space-y-2">
          <Label :label="t('label.description')" />
          <QuillEditor
            v-model:content="form.html"
            content-type="html"
            theme="snow"
            :toolbar="toolbarOptions"
            class="feedback-quill input-border input-common text-color-difference min-h-[220px]"
          />
        </div>
      </div>
    </div>

    <div class="mt-5 flex flex-col gap-3 sm:ml-auto sm:flex-row sm:items-center sm:justify-end">
      <TextButton
        variant="primary"
        size="md"
        :disabled="isSubmitting || !form.title || !hasContent"
        :loading="isSubmitting"
        class="px-6"
        @click="submit"
      >
        {{ t('button.submit') }}
      </TextButton>

      <span v-if="copied" class="text-sm text-green-600">{{ t('message.copied') }}</span>
    </div>
  </section>
</template>

<script setup lang="ts">
import { QuillEditor } from '@vueup/vue-quill';
import { ElMessage } from 'element-plus';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { feedbackApi } from '@/api/feedback';
import TextButton from '@/components/core/button/TextButton.vue';
import Label from '@/components/core/title/Label.vue';

const { t } = useI18n();

const form = ref({
  title: '',
  type: 'bug',
  html: '',
});
const isSubmitting = ref(false);
const copied = ref(false);

const toolbarOptions = [
  ['bold', 'italic', 'underline', 'strike'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['link', 'image'],
  ['clean'],
];

const hasContent = computed(() => {
  const html = (form.value.html || '').replace(/<p><br><\/p>/g, '').trim();
  return html.length > 0;
});

const buildEmailSubject = () => {
  const typeMap: Record<string, string> = {
    bug: 'Bug',
    feature: 'Feature',
    uiux: 'UI/UX',
    performance: 'Performance',
    other: 'Other',
  };
  return `[Feedback][${typeMap[form.value.type] ?? form.value.type}] ${form.value.title}`;
};

const submit = async () => {
  isSubmitting.value = true;
  try {
    const subject = buildEmailSubject();
    const html = form.value.html;
    const text = form.value.html
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    await feedbackApi.sendFeedback({ subject, html, text });
    ElMessage.success(t('helpCenter.feedback_form.sent_success') || 'Feedback sent. Thank you!');
    form.value = { title: '', type: 'bug', html: '' };
    copied.value = false;
  } catch (error) {
    console.error('Failed to send feedback', error);
    ElMessage.error(t('helpCenter.feedback_form.sent_failed') || 'Failed to send feedback.');
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style>
@import '@vueup/vue-quill/dist/vue-quill.snow.css';

.feedback-quill .ql-editor {
  font-size: 1.2rem;
  line-height: 1.6;
}

.feedback-quill .ql-container,
.feedback-quill .ql-editor {
  background-color: inherit;
}
</style>
