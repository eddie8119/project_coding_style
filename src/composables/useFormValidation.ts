/**
 * 用於表單驗證的組合式函數，整合 vee-validate 和 zod 的驗證功能。
 *
 * @template T - 表單數據的類型
 * @param {ZodSchema<T>} schema - Zod 驗證模式
 * @param {Partial<T>} initialValues - 表單的初始值
 *
 * @returns {Object}
 * @returns {Function} handleSubmit - 表單提交處理函數
 * @returns {Object} errors - 表單驗證錯誤信息
 * @returns {Function} resetForm - 重置表單函數
 * @returns {Ref<boolean>} isSubmitting - 表單提交狀態
 */

import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';

import type { GenericObject } from 'vee-validate';
import type { ZodSchema } from 'zod';

export function useFormValidation<T extends GenericObject>(
  schema: ZodSchema<T>,
  initialValues: Partial<T> = {} as Partial<T>
) {
  const { handleSubmit, errors, resetForm, isSubmitting } = useForm<T>({
    validationSchema: toTypedSchema(schema),
    initialValues: initialValues as any, // 使用 any 類型斷言
  });

  return {
    handleSubmit,
    errors,
    resetForm,
    isSubmitting,
  };
}
