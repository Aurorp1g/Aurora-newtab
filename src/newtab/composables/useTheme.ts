/*
  * @Description: 主题 Composable，处理深色/浅色/系统主题切换
  * @Author: Aurorp1g
  * @Date: 2026-07-20
  * @LastEditTime: 2026-07-24
  * @LastEditors: Aurorp1g
*/
import { ref, watch, onMounted } from 'vue'
import type { ThemeMode } from '@/types'

export function useTheme() {
  const theme = ref<ThemeMode>('system')
  const isDark = ref(false)

  function applyTheme(mode: ThemeMode) {
    let dark = false

    if (mode === 'system') {
      dark = window.matchMedia('(prefers-color-scheme: dark)').matches
    } else {
      dark = mode === 'dark'
    }

    isDark.value = dark

    if (dark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  function setTheme(mode: ThemeMode) {
    theme.value = mode
    applyTheme(mode)
  }

  function toggleTheme() {
    const modes: ThemeMode[] = ['light', 'dark', 'system']
    const currentIndex = modes.indexOf(theme.value)
    const nextMode = modes[(currentIndex + 1) % modes.length]
    setTheme(nextMode)
  }

  // Watch for system theme changes
  onMounted(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handler = () => {
      if (theme.value === 'system') {
        applyTheme('system')
      }
    }

    mediaQuery.addEventListener('change', handler)
    
    // Apply initial theme
    applyTheme(theme.value)
  })

  watch(theme, (newTheme) => {
    applyTheme(newTheme)
  })

  return {
    theme,
    isDark,
    setTheme,
    toggleTheme,
  }
}