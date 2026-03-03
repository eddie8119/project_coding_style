import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, ref } from 'vue';

import CreateProjectDialog from '../CreateProjectDialog.vue';

const { mockElMessageSuccess } = vi.hoisted(() => ({
  mockElMessageSuccess: vi.fn(),
}));

const fieldValues = {
  title: ref(''),
  type: ref('residential'),
  constructionContainer: ref([] as Array<{ id: string; name: string }>),
};

const fieldErrors = {
  title: ref(''),
  type: ref(''),
  constructionContainer: ref(''),
};

const metaRef = ref({ valid: true });
const resetFormMock = vi.fn();

const mockCreateProject = vi.fn();
const isCreatingProject = ref(false);
const createProjectError = ref<Error | null>(null);

const newConstructionItem = ref('');
const localConstructionItems = ref<{ id: string; name: string }[]>([]);
const mockAddConstructionData = vi.fn();

const { BasicEditDialogStub, FloorPlanUploadInputStub } = vi.hoisted(() => {
  const { defineComponent, h } = require('vue');

  const BasicEditDialogStub = defineComponent({
    name: 'BasicEditDialogStub',
    props: {
      modelValue: {
        type: Boolean,
        required: true,
      },
      title: {
        type: String,
        required: false,
      },
      isSubmitting: {
        type: Boolean,
        required: false,
        default: false,
      },
      errorMessage: {
        type: String,
        required: false,
        default: '',
      },
      isInvalid: {
        type: Boolean,
        required: false,
        default: false,
      },
    },
    emits: ['update:modelValue', 'submit', 'cancel'],
    setup(
      props: {
        modelValue: boolean;
        title?: string;
        isSubmitting?: boolean;
        errorMessage?: string;
        isInvalid?: boolean;
      },
      { slots }: { slots: { default?: () => unknown[] } }
    ) {
      return () =>
        h(
          'div',
          {
            class: 'basic-edit-dialog-stub',
            'data-model-value': props.modelValue ? 'true' : 'false',
            'data-title': props.title ?? '',
            'data-is-submitting': props.isSubmitting ? 'true' : 'false',
            'data-error-message': props.errorMessage,
            'data-is-invalid': props.isInvalid ? 'true' : 'false',
          },
          slots.default ? slots.default() : []
        );
    },
  });

  const FloorPlanUploadInputStub = defineComponent({
    name: 'FloorPlanUploadInputStub',
    setup() {
      return () => h('div', { class: 'floor-plan-upload-stub' });
    },
  });

  return { BasicEditDialogStub, FloorPlanUploadInputStub };
});

vi.mock('@/components/core/dialog/BasicEditDialog.vue', () => ({
  default: BasicEditDialogStub,
}));

vi.mock('@/components/project/FloorPlanUploadInput.vue', () => ({
  default: FloorPlanUploadInputStub,
}));

vi.mock('@/constants/selection', () => {
  const projectTypes = [{ value: 'residential' }, { value: 'commercial' }];
  return {
    PROJECT_TYPES: projectTypes,
    PROJECT_TYPE_VALUES: projectTypes.map((type) => type.value),
  };
});

vi.mock('@/composables/query/useProject', () => ({
  useProject: () => ({
    createProject: mockCreateProject,
    isCreatingProject,
    createProjectError,
  }),
}));

vi.mock('@/composables/useCommonAction', () => ({
  useCommonAction: () => ({
    newConstructionItem,
    localConstructionItems,
    addConstructionData: mockAddConstructionData,
  }),
}));

vi.mock('@vee-validate/zod', () => ({
  toTypedSchema: (schema: unknown) => schema,
}));

vi.mock('vee-validate', () => ({
  useForm: () => ({
    handleSubmit:
      (
        fn: (values: {
          title: string;
          type: string;
          constructionContainer: unknown[];
          floorPlanUrls: [];
        }) => Promise<void>
      ) =>
      async () => {
        await fn({
          title: fieldValues.title.value,
          type: fieldValues.type.value,
          constructionContainer: fieldValues.constructionContainer.value,
          floorPlanUrls: [],
        });
      },
    meta: metaRef,
    resetForm: resetFormMock,
  }),
  useField: (name: keyof typeof fieldValues) => ({
    value: fieldValues[name],
    handleBlur: vi.fn(),
    errorMessage: fieldErrors[name],
  }),
}));

vi.mock('element-plus', () => ({
  ElMessage: {
    success: mockElMessageSuccess,
  },
}));

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

const ElFormItemStub = defineComponent({
  name: 'ElFormItemStub',
  setup(_props, { slots }) {
    return () => h('div', { class: 'el-form-item-stub' }, slots.default ? slots.default() : []);
  },
});

const ElInputStub = defineComponent({
  name: 'ElInputStub',
  props: {
    modelValue: {
      type: [String, Number, Object],
      default: '',
    },
  },
  emits: ['update:modelValue', 'blur', 'keyup'],
  setup(props, { emit }) {
    return () =>
      h('input', {
        class: 'el-input-stub',
        value: props.modelValue as string | number | undefined,
        onInput: (event: Event) =>
          emit('update:modelValue', (event.target as HTMLInputElement).value),
        onBlur: (event: Event) => emit('blur', event),
        onKeyup: (event: KeyboardEvent) => emit('keyup', event),
      });
  },
});

const ElSelectStub = defineComponent({
  name: 'ElSelectStub',
  props: {
    modelValue: {
      type: [Array, String, Object],
      default: null,
    },
  },
  emits: ['update:modelValue', 'blur'],
  setup(_props, { slots, emit }) {
    return () =>
      h(
        'div',
        {
          class: 'el-select-stub',
          onBlur: (event: Event) => emit('blur', event),
        },
        slots.default ? slots.default() : []
      );
  },
});

const ElOptionStub = defineComponent({
  name: 'ElOptionStub',
  setup(_props, { slots }) {
    return () => h('div', { class: 'el-option-stub' }, slots.default ? slots.default() : []);
  },
});

const ElButtonStub = defineComponent({
  name: 'ElButtonStub',
  emits: ['click'],
  setup(_props, { emit, slots }) {
    return () =>
      h(
        'button',
        {
          class: 'el-button-stub',
          onClick: (event: Event) => emit('click', event),
        },
        slots.default ? slots.default() : []
      );
  },
});

const createWrapper = () =>
  mount(CreateProjectDialog, {
    props: {
      modelValue: true,
    },
    global: {
      stubs: {
        ElFormItem: ElFormItemStub,
        ElInput: ElInputStub,
        ElSelect: ElSelectStub,
        ElOption: ElOptionStub,
        ElButton: ElButtonStub,
      },
    },
  });

describe('CreateProjectDialog.vue', () => {
  beforeEach(() => {
    fieldValues.title.value = '';
    fieldValues.type.value = 'residential';
    fieldValues.constructionContainer.value = [];

    fieldErrors.title.value = '';
    fieldErrors.type.value = '';
    fieldErrors.constructionContainer.value = '';

    metaRef.value = { valid: true };

    newConstructionItem.value = '';
    localConstructionItems.value = [];

    isCreatingProject.value = false;
    createProjectError.value = null;

    mockCreateProject.mockReset();
    mockAddConstructionData.mockReset();
    resetFormMock.mockReset();
    mockElMessageSuccess.mockReset();
  });

  it('passes loading, error, and validation states to BasicEditDialog', () => {
    isCreatingProject.value = true;
    createProjectError.value = new Error('Network error');
    metaRef.value = { valid: false };

    const wrapper = createWrapper();
    const dialog = wrapper.findComponent(BasicEditDialogStub);

    expect(dialog.props('isSubmitting')).toBe(true);
    expect(dialog.props('errorMessage')).toBe('Network error');
    expect(dialog.props('isInvalid')).toBe(true);
  });

  it('submits the form successfully and closes the dialog', async () => {
    fieldValues.title.value = 'New Project';
    fieldValues.type.value = 'commercial';
    fieldValues.constructionContainer.value = [{ id: '1', name: 'Electrical' }];

    mockCreateProject.mockResolvedValue({ id: 'project-1' });

    const wrapper = createWrapper();
    const dialog = wrapper.findComponent(BasicEditDialogStub);

    await dialog.vm.$emit('submit');
    await flushPromises();

    expect(mockCreateProject).toHaveBeenCalledWith({
      title: 'New Project',
      type: 'commercial',
      constructionContainer: [{ id: '1', name: 'Electrical' }],
      floorPlanUrls: [],
    });

    expect(resetFormMock).toHaveBeenCalledWith({
      values: {
        title: '',
        type: 'residential',
        constructionContainer: [],
        floorPlanUrls: [],
      },
    });

    expect(mockElMessageSuccess).toHaveBeenCalledWith('message.success.create');
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]]);
  });

  it('keeps the dialog open when createProject returns falsy', async () => {
    fieldValues.title.value = 'Draft Project';
    mockCreateProject.mockResolvedValue(null);

    const wrapper = createWrapper();
    const dialog = wrapper.findComponent(BasicEditDialogStub);

    await dialog.vm.$emit('submit');
    await flushPromises();

    expect(resetFormMock).not.toHaveBeenCalled();
    expect(mockElMessageSuccess).not.toHaveBeenCalled();
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });

  it('emits update:modelValue=false when cancel is triggered', async () => {
    const wrapper = createWrapper();
    const dialog = wrapper.findComponent(BasicEditDialogStub);

    await dialog.vm.$emit('cancel');

    expect(wrapper.emitted('update:modelValue')).toEqual([[false]]);
  });
});
