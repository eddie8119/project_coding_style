import { computed, ref } from 'vue';

import type { ExcelCell, GanttNoteType } from '@/types/gantt';
import type { ComputedRef } from 'vue';

type NoteRow = {
  id: GanttNoteType;
  map: ComputedRef<Map<number, ExcelCell>>;
};

type UpdateNotePayload = {
  type: NoteRow['id'];
  date: Date;
  value: string;
};

interface UseGanttNoteEditorOptions {
  noteRows: readonly NoteRow[];
  t: (key: string) => string;
  formatDateLabel: (date: Date) => string;
  emitUpdateNote: (payload: UpdateNotePayload) => void;
}

export function useGanttNoteEditor(options: UseGanttNoteEditorOptions) {
  const { noteRows, t, formatDateLabel, emitUpdateNote } = options;

  const noteEditorMeta = ref<{ rowId: NoteRow['id']; date: Date } | null>(null);
  const noteEditorValue = ref('');

  const noteRowLabels = computed<Record<NoteRow['id'], string>>(() => ({
    special: t('excel.progress_template.special_holiday'),
    payment: t('excel.progress_template.construction_payment_remittance'),
    preparation: t('excel.progress_template.pre_construction_preparation'),
  }));

  const noteEditorVisible = computed({
    get: () => noteEditorMeta.value !== null,
    set: (value: boolean) => {
      if (!value) {
        resetNoteEditor();
      }
    },
  });

  const noteEditorRowLabel = computed(() => {
    if (!noteEditorMeta.value) return '';
    return noteRowLabels.value[noteEditorMeta.value.rowId];
  });

  const noteEditorDateLabel = computed(() => {
    if (!noteEditorMeta.value) return '';
    return formatDateLabel(noteEditorMeta.value.date);
  });

  const noteEditorTitle = computed(() => {
    if (!noteEditorMeta.value) return '';
    return noteEditorRowLabel.value || noteEditorDateLabel.value || '';
  });

  const getNoteValueForCell = (rowId: NoteRow['id'], date: Date) => {
    const row = noteRows.find((item) => item.id === rowId);
    return (row?.map.value.get(date.getTime())?.value as string) ?? '';
  };

  const openNoteEditor = (rowId: NoteRow['id'], date: Date) => {
    noteEditorMeta.value = { rowId, date };
    noteEditorValue.value = getNoteValueForCell(rowId, date);
  };

  const resetNoteEditor = () => {
    noteEditorMeta.value = null;
    noteEditorValue.value = '';
  };

  const saveNoteEditor = () => {
    if (!noteEditorMeta.value) return;
    emitUpdateNote({
      type: noteEditorMeta.value.rowId,
      date: noteEditorMeta.value.date,
      value: noteEditorValue.value,
    });
    resetNoteEditor();
  };

  return {
    noteEditorVisible,
    noteEditorValue,
    noteEditorRowLabel,
    noteEditorDateLabel,
    noteEditorTitle,
    openNoteEditor,
    resetNoteEditor,
    saveNoteEditor,
  } as const;
}
