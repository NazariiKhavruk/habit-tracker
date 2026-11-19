<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

// Простий SVG-графік стовпчиків для відсотків 0–100.
// Для екранних дикторів поруч є прихована таблиця з тими самими даними.
const props = defineProps({
  items: { type: Array, required: true }, // [{ label, value (0–100 або null), title }]
  caption: { type: String, required: true },
  height: { type: Number, default: 180 },
  labelEvery: { type: Number, default: 1 },
})

// Ширина SVG дорівнює реальній ширині блоку, тому текст не стискається на телефоні
const box = ref(null)
const width = ref(600)
let observer = null

onMounted(() => {
  observer = new ResizeObserver(([entry]) => {
    width.value = Math.max(240, Math.round(entry.contentRect.width))
  })
  observer.observe(box.value)
})
onBeforeUnmount(() => observer?.disconnect())

const PAD_LEFT = 38
const PAD_BOTTOM = 26
const PAD_TOP = 8

const chart = computed(() => {
  const innerW = width.value - PAD_LEFT
  const innerH = props.height - PAD_BOTTOM - PAD_TOP
  const step = innerW / props.items.length
  const barW = Math.max(2, Math.min(step * 0.7, 48))

  return {
    innerH,
    bars: props.items.map((item, index) => {
      const value = item.value ?? 0
      const h = (value / 100) * innerH
      return {
        ...item,
        x: PAD_LEFT + index * step + (step - barW) / 2,
        y: PAD_TOP + innerH - h,
        w: barW,
        h,
        cx: PAD_LEFT + index * step + step / 2,
        showLabel: index % props.labelEvery === 0 || index === props.items.length - 1,
      }
    }),
    grid: [0, 50, 100].map((value) => ({ value, y: PAD_TOP + innerH - (value / 100) * innerH })),
  }
})
</script>

<template>
  <figure ref="box" class="bar-chart">
    <svg
      :viewBox="`0 0 ${width} ${height}`"
      :width="width"
      :height="height"
      role="img"
      :aria-label="caption"
    >
      <g v-for="line in chart.grid" :key="line.value">
        <line class="grid-line" :x1="PAD_LEFT" :x2="width" :y1="line.y" :y2="line.y" />
        <text class="axis-text" x="0" :y="line.y + 4">{{ line.value }}%</text>
      </g>
      <g v-for="bar in chart.bars" :key="bar.label + bar.cx">
        <rect
          class="bar"
          :class="{ 'is-empty': bar.value === null }"
          :x="bar.x"
          :y="bar.value === null ? PAD_TOP + chart.innerH - 2 : bar.y"
          :width="bar.w"
          :height="bar.value === null ? 2 : Math.max(bar.h, 2)"
          rx="3"
        >
          <title>{{ bar.title }}</title>
        </rect>
        <text
          v-if="bar.showLabel"
          class="axis-text"
          :x="bar.cx"
          :y="height - 6"
          text-anchor="middle"
        >
          {{ bar.label }}
        </text>
      </g>
    </svg>
    <figcaption class="sr-only">{{ caption }}</figcaption>
    <!-- Таблицю ховаємо в div: сама таблиця не стискається до 1px -->
    <div class="sr-only">
      <table>
        <caption>
          {{
            caption
          }}
        </caption>
        <tbody>
          <tr v-for="item in items" :key="item.title">
            <th scope="row">{{ item.title }}</th>
            <td>{{ item.value === null ? 'немає запланованих звичок' : `${item.value}%` }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </figure>
</template>

<style scoped>
.bar-chart {
  position: relative;
  margin: 0;
}

svg {
  display: block;
  max-width: 100%;
  overflow: visible;
}

.grid-line {
  stroke: var(--border);
  stroke-dasharray: 4 4;
  vector-effect: non-scaling-stroke;
}

.axis-text {
  fill: var(--text-muted);
  font-size: 12px;
}

.bar {
  fill: var(--primary);
  transition:
    y 0.3s ease,
    height 0.3s ease;
}

.bar:hover {
  fill: var(--primary-hover);
}

.bar.is-empty {
  fill: var(--border);
}
</style>
