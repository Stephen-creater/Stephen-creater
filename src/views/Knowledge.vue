<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const knowledgeSections = [
  {
    title: 'Stephen',
    description: '我的个人说明书，知识库根目录。',
    href: 'https://my.feishu.cn/wiki/KRCGwl4MniNsyBkszBgcXCM3nwg',
    icon: 'M12 4a8 8 0 100 16 8 8 0 000-16zm0 3a2.25 2.25 0 110 4.5A2.25 2.25 0 0112 7zm0 11c-2.01 0-3.79-.98-4.88-2.48.1-1.62 3.26-2.52 4.88-2.52 1.61 0 4.78.9 4.88 2.52A5.96 5.96 0 0112 18z',
  },
  {
    title: 'AI',
    description: '分享 Skills、Harness Engineering、AI 产品、Agent、Coding 等内容。',
    href: 'https://my.feishu.cn/wiki/UTskwj6CJizP0ckxLnkcBI9wnwg',
    icon: 'M9.663 17h4.674M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.549-.547z',
  },
  {
    title: 'LifeOps',
    description: '我的日常记录，开源我每一天的行动和反思。',
    href: 'https://my.feishu.cn/wiki/WFuFwcKkfiZuHakeUmxcfqy2nKb',
    icon: 'M16.862 4.487a2.25 2.25 0 113.182 3.182L8.62 19.093 4 20l.907-4.62 11.955-11.893z',
  },
  {
    title: 'Project',
    description: '我做过的项目，包括实习经历、比赛和开源项目等。',
    href: 'https://my.feishu.cn/wiki/DK2awpkkkiYKxYk707OcR2Sunyc',
    icon: 'M3 7.5A1.5 1.5 0 014.5 6h15A1.5 1.5 0 0121 7.5v9A1.5 1.5 0 0119.5 18h-15A1.5 1.5 0 013 16.5v-9zM8 6V4.75A1.75 1.75 0 019.75 3h4.5A1.75 1.75 0 0116 4.75V6',
  },
  {
    title: 'Discipline',
    description: '高质量的课程、笔记记录，以及学校的课程。',
    href: 'https://my.feishu.cn/wiki/J5fZwXhnzieWtxkvf3nc08IAn2e',
    icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  },
  {
    title: 'Information',
    description: '高质量信息输入源的梳理：文章、书籍、视频与创业。',
    href: 'https://my.feishu.cn/wiki/Ntb7w2EiniYhPOk9ZWDcbmM8nOe',
    icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V9a2 2 0 012-2h2m-4 4H7m0 4h10m-10 4h6',
  },
  {
    title: 'Brand',
    description: '我的个人品牌与社交账号：AI产品Stephen。',
    href: 'https://my.feishu.cn/wiki/Ca2Ew5sq2iHRTakvdVvcLpJ0nKg',
    icon: 'M8 10.5h8M8 14h5m-7 6h12a3 3 0 003-3V7a3 3 0 00-3-3H6a3 3 0 00-3 3v10a3 3 0 003 3z',
  },
  {
    title: 'Finance',
    description: '投资、财务管理与 FIRE 规划系统。',
    href: 'https://my.feishu.cn/wiki/ZVlOwLukeiyho6k2kNFcarLdn6c',
    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    title: 'Network',
    description: '我接触到的优质社区、平台与组织。',
    href: 'https://my.feishu.cn/wiki/GfPrw3a0ViWzYmk6VP9ckbYcnne',
    icon: 'M12 21a9 9 0 100-18 9 9 0 000 18zm0 0c2.5-2.4 3.75-5.4 3.75-9S14.5 5.4 12 3m0 18c-2.5-2.4-3.75-5.4-3.75-9S9.5 5.4 12 3M3.5 9h17M3.5 15h17',
  },
  {
    title: 'Personal',
    description: '个人生活记录：观影笔记、灵感汇总与个人档案。',
    href: 'https://my.feishu.cn/wiki/OIE8wu539itrcck1PFac9UeanHh',
    icon: 'M4 5.5A1.5 1.5 0 015.5 4h13A1.5 1.5 0 0120 5.5v9a1.5 1.5 0 01-1.5 1.5h-13A1.5 1.5 0 014 14.5v-9zM2 19h20M9 16v3m6-3v3',
  },
  {
    title: 'Health',
    description: '身体、睡眠、饮食与健身的健康管理。',
    href: 'https://my.feishu.cn/wiki/DInkwZ3zLibDZuk87gicEqaCn7A',
    icon: 'M12 20s-7-4.35-7-10a4 4 0 017-2.65A4 4 0 0119 10c0 5.65-7 10-7 10zM8.5 11h2l1-2 1.5 4 1-2h1.5',
  },
  {
    title: 'Business',
    description: '把自己当作一家公司来运营：从 CEO 办公室到各职能部门。',
    href: 'https://my.feishu.cn/wiki/VZaZwtwFii9naVkswcoc0Yz6nmh',
    icon: 'M18.178 8c5.096 0 5.096 8 0 8-5.095 0-7.133-8-12.739-8-4.585 0-4.585 8 0 8 5.606 0 7.644-8 12.74-8z',
  },
]

const copiedStates = ref({})
let knowledgeController = null
let knowledgeObserver = null

async function copyText(text) {
  if (!text) return false
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {}
  try {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'absolute'
    textarea.style.left = '-9999px'
    document.body.appendChild(textarea)
    textarea.select()
    textarea.setSelectionRange(0, textarea.value.length)
    const copied = document.execCommand('copy')
    document.body.removeChild(textarea)
    return copied
  } catch {
    return false
  }
}

async function handleCopy(url, key) {
  const copied = await copyText(url)
  if (!copied) return
  copiedStates.value[key] = true
  window.setTimeout(() => {
    copiedStates.value[key] = false
  }, 900)
}

function setupScrollAnimations() {
  const cards = document.querySelectorAll('.knowledge-card')
  knowledgeObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible')
        }, index * 70)
      }
    })
  }, { threshold: 0.1 })

  cards.forEach((card) => {
    card.classList.add('category-appear')
    knowledgeObserver.observe(card)
  })
}

function setupHoverEffects(signal) {
  const cards = document.querySelectorAll('.knowledge-card')
  cards.forEach((card) => {
    if (getComputedStyle(card).position === 'static') {
      card.style.position = 'relative'
    }

    card.addEventListener('mouseenter', () => {
      card.classList.add('hover-active')
    }, { signal })

    card.addEventListener('mouseleave', () => {
      card.classList.remove('hover-active')
    }, { signal })
  })
}

onMounted(() => {
  knowledgeController = new AbortController()
  setupScrollAnimations()
  setupHoverEffects(knowledgeController.signal)
})

onUnmounted(() => {
  knowledgeController?.abort()
  knowledgeController = null
  knowledgeObserver?.disconnect()
  knowledgeObserver = null
})
</script>

<template>
  <div class="knowledge-page">
    <section class="page-hero">
      <div class="container">
        <div class="page-hero__card page-hero__card--compact">
          <h1 class="page-title" style="max-width: none;">
            个人<span class="accent-word">知识库</span>
          </h1>
          <p class="page-summary" style="margin-left: auto; margin-right: auto;">
            以下是我精心构建的个人知识体系，涵盖 AI、项目、日常记录、信息源、财务、健康等多个领域。全部开源分享，欢迎探索和学习。
          </p>
          <div class="page-hero__divider"></div>
        </div>
      </div>
    </section>

    <section class="pb-24">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <article
            v-for="section in knowledgeSections"
            :key="section.title"
            class="knowledge-card p-6"
          >
            <div class="flex items-center mb-4">
              <div class="p-3 rounded-full bg-accent-soft bg-opacity-30 mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-7 w-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  style="color: var(--accent-orange);"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.9"
                    :d="section.icon"
                  />
                </svg>
              </div>
              <h3 class="text-xl font-bold">{{ section.title }}</h3>
            </div>

            <p class="text-gray-400 mb-5 text-sm">{{ section.description }}</p>

            <div class="knowledge-action-stack">
              <div class="card-action-bar">
                <a
                  :href="section.href"
                  target="_blank"
                  rel="noreferrer"
                  class="details-link inline-flex items-center text-sm"
                >
                  <span>查看详情</span>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>

                <button
                  type="button"
                  class="copy-fingerprint"
                  :class="{ 'is-copied': copiedStates[section.title] }"
                  aria-label="复制链接"
                  title="复制链接"
                  @click.prevent.stop="handleCopy(section.href, section.title)"
                >
                  <svg
                    v-if="!copiedStates[section.title]"
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8 16H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M10 20h8a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2z" />
                  </svg>
                  <svg
                    v-else
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>

<style>
  .knowledge-card {
    position: relative;
    border-radius: 12px;
    background-color: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    transition: transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease;
    overflow: hidden;
    transform: translateY(0);
    will-change: transform;
  }

  .knowledge-card:hover,
  .knowledge-card.hover-active {
    transform: translateY(-5px);
    box-shadow: 0 14px 28px rgba(20, 20, 19, 0.08);
    background-color: rgba(255, 252, 246, 0.96);
  }

  .knowledge-card:hover .rounded-full,
  .knowledge-card.hover-active .rounded-full {
    background-color: rgba(217, 119, 87, 0.16);
    transform: scale(1.05);
  }

  .knowledge-card .rounded-full {
    transition: background-color 0.3s ease, transform 0.3s ease;
  }

  .details-link {
    position: relative;
    display: inline-flex;
    align-items: center;
    padding: 0 !important;
    background-color: transparent;
    border-radius: 0;
    border: none !important;
    font-weight: 500;
    transition: all 0.3s ease !important;
    box-shadow: none;
    text-decoration: underline;
    text-underline-offset: 0.22em;
  }

  .details-link:hover {
    background-color: transparent;
    border-color: transparent !important;
    box-shadow: none;
    transform: none;
    color: var(--accent-orange);
  }

  .details-link svg {
    transition: transform 0.3s ease;
  }

  .details-link:hover svg {
    transform: translateX(3px);
  }

  .copy-fingerprint {
    position: relative;
    z-index: 10;
    color: var(--muted);
    align-self: center;
    border: none;
    background: transparent;
    padding: 0;
    cursor: pointer;
    transition: color 0.2s ease, transform 0.2s ease;
  }

  .copy-fingerprint:hover {
    color: var(--accent-orange);
    transform: translateY(-1px);
  }

  .copy-fingerprint.is-copied {
    color: var(--accent-orange);
    transform: translateY(-1px);
  }

  .card-action-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-top: 1rem;
  }

  .knowledge-action-stack {
    margin-top: 1rem;
  }

  .category-appear {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.5s ease, transform 0.5s ease;
  }

  .category-appear.visible {
    opacity: 1;
    transform: translateY(0);
  }
</style>
