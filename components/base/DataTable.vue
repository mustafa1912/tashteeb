<script setup>
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-vue-next'

const props = defineProps({
  columns: {
    type: Array,
    required: true // [{ key, label, sortable?, align? }]
  },
  rows: {
    type: Array,
    default: () => []
  },
  sortKey: {
    type: String,
    default: ''
  },
  sortDir: {
    type: String,
    default: 'asc' // asc | desc
  },
  rowKey: {
    type: String,
    default: 'id'
  }
})

const emit = defineEmits(['sort', 'row-click'])

function handleSort(col) {
  if (!col.sortable) return
  const nextDir = props.sortKey === col.key && props.sortDir === 'asc' ? 'desc' : 'asc'
  emit('sort', { key: col.key, dir: nextDir })
}
</script>

<template>
  <div class="overflow-x-auto rounded-card border border-border bg-surface shadow-card">
    <table class="w-full border-collapse text-start text-sm">
      <thead>
        <tr class="border-b border-border bg-sand/70 text-xs font-semibold uppercase text-ink-secondary">
          <th
            v-for="col in columns"
            :key="col.key"
            scope="col"
            class="px-4 py-3"
            :class="col.align === 'end' ? 'text-end' : 'text-start'"
          >
            <button
              v-if="col.sortable"
              type="button"
              class="inline-flex items-center gap-1 font-semibold uppercase text-ink-secondary hover:text-ink"
              @click="handleSort(col)"
            >
              <span>{{ col.label }}</span>
              <ArrowUp v-if="sortKey === col.key && sortDir === 'asc'" class="h-3.5 w-3.5 text-primary" :stroke-width="1.5" />
              <ArrowDown v-else-if="sortKey === col.key && sortDir === 'desc'" class="h-3.5 w-3.5 text-primary" :stroke-width="1.5" />
              <ArrowUpDown v-else class="h-3.5 w-3.5 opacity-60" :stroke-width="1.5" />
            </button>
            <span v-else>{{ col.label }}</span>
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-border">
        <tr
          v-for="(row, rIdx) in rows"
          :key="row[rowKey] ?? rIdx"
          class="transition-colors hover:bg-sand/35"
          @click="emit('row-click', row)"
        >
          <td
            v-for="col in columns"
            :key="col.key"
            class="px-4 py-3.5 text-sm text-ink"
            :class="col.align === 'end' ? 'text-end tabular-price' : 'text-start'"
          >
            <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
              {{ row[col.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
