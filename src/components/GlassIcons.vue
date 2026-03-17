<template>
  <div :class="['grid gap-[3em] grid-cols-3 mx-auto py-[2em] overflow-visible', className]">
    <button
      v-for="(item, index) in items"
      :key="index"
      type="button"
      :aria-label="item.label"
      :class="[
        'relative bg-transparent outline-none w-[5em] h-[5em] [perspective:24em] [transform-style:preserve-3d] [-webkit-tap-highlight-color:transparent] group cursor-pointer',
        item.customClass
      ]"
      @click="() => handleClick(item)"
    >
      <span
        class="absolute top-0 left-0 w-full h-full rounded-[1.25em] block transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.83,0,0.17,1)] origin-[100%_100%] rotate-[15deg] group-hover:[transform:rotate(25deg)_translate3d(-0.5em,-0.5em,0.5em)]"
        :style="{
          ...getBackgroundStyle(item.color),
          boxShadow: '0.5em -0.5em 0.75em hsla(223, 10%, 10%, 0.15)'
        }"
      ></span>

      <span
        class="absolute top-0 left-0 w-full h-full rounded-[1.25em] bg-[hsla(0,0%,100%,0.15)] transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.83,0,0.17,1)] origin-[80%_50%] flex backdrop-blur-[0.75em] [-webkit-backdrop-filter:blur(0.75em)] transform group-hover:[transform:translateZ(2em)]"
        :style="{
          boxShadow: '0 0 0 0.1em hsla(0, 0%, 100%, 0.3) inset'
        }"
      >
        <span class="m-auto w-[2em] h-[2em] flex items-center justify-center text-white" aria-hidden="true">
          {{ item.icon }}
        </span>
      </span>

      <span
        class="absolute top-full left-0 right-0 text-center whitespace-nowrap leading-[2] text-base opacity-0 transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.83,0,0.17,1)] translate-y-0 group-hover:opacity-100 group-hover:[transform:translateY(20%)] text-white font-medium"
      >
        {{ item.label }}
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
interface GlassIconsItem {
  icon: string;
  color: string;
  label: string;
  value: string;
  customClass?: string;
}

interface Props {
  items: GlassIconsItem[];
  className?: string;
}

interface Emits {
  (e: 'select', value: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  className: ''
});

const emit = defineEmits<Emits>();

const handleClick = (item: GlassIconsItem) => {
  emit('select', item.value);
};

const gradientMapping: Record<string, string> = {
  blue: 'linear-gradient(135deg, hsl(223, 90%, 50%), hsl(208, 90%, 50%))',
  purple: 'linear-gradient(135deg, hsl(283, 90%, 50%), hsl(268, 90%, 50%))',
  red: 'linear-gradient(135deg, hsl(3, 90%, 50%), hsl(348, 90%, 50%))',
  indigo: 'linear-gradient(135deg, hsl(253, 90%, 50%), hsl(238, 90%, 50%))',
  orange: 'linear-gradient(135deg, hsl(43, 90%, 50%), hsl(28, 90%, 50%))',
  green: 'linear-gradient(135deg, hsl(123, 90%, 40%), hsl(108, 90%, 40%))',
  gold: 'linear-gradient(135deg, hsl(45, 90%, 50%), hsl(35, 90%, 45%))',
  cyan: 'linear-gradient(135deg, hsl(180, 90%, 50%), hsl(195, 90%, 50%))'
};

const getBackgroundStyle = (color: string): Record<string, string> => {
  if (gradientMapping[color]) {
    return { background: gradientMapping[color] };
  }
  return { background: color };
};
</script>