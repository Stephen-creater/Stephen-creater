<script setup>
import { onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'

const publicAsset = (path) => `${import.meta.env.BASE_URL}${path}`

let portfolioController = null
let activeCategory = 'all'

const copyIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8 16H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" />
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M10 20h8a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2z" />
  </svg>
`

const copiedIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
  </svg>
`

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

onMounted(() => {
  portfolioController = new AbortController()
  const { signal } = portfolioController

  const filterButtons = document.querySelectorAll('.filter-btn')
  const projectGrid = document.querySelector('.portfolio-grid')
  const projectCards = Array.from(document.querySelectorAll('.project-card'))
  const originalOrder = new Map(projectCards.map((card, index) => [card, index]))

  function getSortValue(card) {
    const explicitDate = card.dataset.date
    if (explicitDate) {
      return Number(explicitDate.replaceAll('-', ''))
    }

    const year = card.dataset.year
    if (year === 'year-26') return 20260000
    if (year === 'year-25') return 20250000
    if (year === 'year-24') return 20240000
    return 0
  }

  function sortVisibleCards(cards) {
    return [...cards].sort((a, b) => {
      const sortDiff = getSortValue(b) - getSortValue(a)
      if (sortDiff !== 0) return sortDiff
      return (originalOrder.get(a) ?? 0) - (originalOrder.get(b) ?? 0)
    })
  }

  function revealCards(cards) {
    gsap.fromTo(
      cards,
      { y: 22, opacity: 0, scale: 0.985, filter: 'blur(6px)' },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
        duration: 0.46,
        stagger: 0.045,
        ease: 'power2.out',
        clearProps: 'filter',
      }
    )
  }

  function filterProjects(category) {
    activeCategory = category
    const visibleCards = []

    projectCards.forEach((card) => {
      const matches =
        category === 'all' ||
        card.dataset.category === category ||
        card.dataset.year === category
      card.classList.toggle('is-filtered-out', !matches)

      if (matches) {
        card.style.display = ''
        visibleCards.push(card)
      } else {
        card.style.display = 'none'
      }
    })

    const sortedVisibleCards = sortVisibleCards(visibleCards)
    sortedVisibleCards.forEach((card) => projectGrid?.appendChild(card))

    requestAnimationFrame(() => revealCards(sortedVisibleCards))
  }

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      filterButtons.forEach((btn) => {
        btn.classList.remove('bg-accent-soft')
        btn.classList.add('bg-gray-800')
      })

      button.classList.remove('bg-gray-800')
      button.classList.add('bg-accent-soft')

      const category = button.dataset.category || 'all'
      if (category === activeCategory) return
      filterProjects(category)
    }, { signal })
  })

  const sortedProjectCards = sortVisibleCards(projectCards)
  sortedProjectCards.forEach((card) => projectGrid?.appendChild(card))
  revealCards(sortedProjectCards)

  document.querySelectorAll('.project-card').forEach((card) => {
    const copyButton = card.querySelector('button:not(.share-btn)')
    const shareButton = card.querySelector('.share-btn')
    const linkElement = card.querySelector('a[target="_blank"]')
    const buttonRow = card.querySelector('.flex.justify-between.items-center.mt-4')

    if (!copyButton || !linkElement || !buttonRow) return

    copyButton.classList.add('copy-fingerprint')
    copyButton.setAttribute('type', 'button')
    copyButton.setAttribute('title', '复制链接')
    copyButton.setAttribute('aria-label', '复制链接')
    copyButton.innerHTML = copyIcon
    linkElement.classList.add('visit-btn')

    const actionBar = document.createElement('div')
    actionBar.className = 'card-action-bar'
    actionBar.appendChild(linkElement)
    actionBar.appendChild(copyButton)
    buttonRow.replaceWith(actionBar)

    if (shareButton) shareButton.remove()

    copyButton.addEventListener('click', function() {
      const url = linkElement.getAttribute('href')
      if (!url) return

      copyText(url).then((copied) => {
        if (copied) {
          this.innerHTML = copiedIcon
          this.classList.add('is-copied')
          setTimeout(() => {
            this.classList.remove('is-copied')
            this.innerHTML = copyIcon
          }, 900)
        }
      })
    }, { signal })
  })
})

onUnmounted(() => {
  portfolioController?.abort()
  portfolioController = null
})
  
</script>

<template>
  <div class="portfolio-page">

  <!-- Header -->
  
  
  <!-- Portfolio Hero Section -->
  <section class="page-hero">
    <div class="container">
      <div class="page-hero__card page-hero__card--compact">
        <h1 class="page-title" style="max-width: none;">
          我的作品集
        </h1>
        <p class="page-summary" style="margin-left: auto; margin-right: auto;">
          AI 产品、开源 Skills、比赛作品与公众号文章，按时间倒序排列。
        </p>
        <div class="page-hero__divider"></div>
        
        <div class="flex flex-wrap items-center justify-center gap-2 mb-2 mt-8">
          <div class="text-accent flex items-center text-sm md:text-base mr-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 md:h-5 md:w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clip-rule="evenodd" />
            </svg>
            筛选类别:
          </div>
          <button class="filter-btn px-4 py-1.5 bg-accent-soft rounded-lg transition-colors text-white text-sm" data-category="all">所有</button>
          <button class="filter-btn px-4 py-1.5 bg-gray-800 rounded-lg transition-colors text-white text-sm" data-category="year-26">26年</button>
          <button class="filter-btn px-4 py-1.5 bg-gray-800 rounded-lg transition-colors text-white text-sm" data-category="year-25">25年</button>
          <button class="filter-btn px-4 py-1.5 bg-gray-800 rounded-lg transition-colors text-white text-sm" data-category="year-24">24年</button>
          <button class="filter-btn px-4 py-1.5 bg-gray-800 rounded-lg transition-colors text-white text-sm" data-category="wechat">公众号</button>
          <button class="filter-btn px-4 py-1.5 bg-gray-800 rounded-lg transition-colors text-white text-sm" data-category="build">开源 / 比赛</button>
        </div>
      </div>
    </div>
  </section>
  
  <!-- Portfolio Grid -->
  <section class="mb-12">
    <div class="container mx-auto px-4">
      <div class="portfolio-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- 项目1: 淘票票电影海报 -->
        <div class="project-card bg-gray-900 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300" data-category="coze" data-year="year-24">
          <div class="h-48 md:h-56 overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1025&q=80" 
              alt="淘票票电影海报" 
              class="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            >
          </div>
          <div class="p-4 md:p-5">
            <h3 class="text-xl font-bold mb-2">淘票票电影海报</h3>
            <p class="text-gray-400 mb-3 text-sm">基于Coze平台开发的智能体，能够生成专业的电影海报设计，适用于淘票票应用。为电影宣传提供高质量的视觉素材。</p>
            <div class="flex flex-wrap gap-1.5 mb-4">
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">24年</span>
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">Coze</span>
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">AI设计</span>
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">图像生成</span>
            </div>
            <a href="https://www.coze.cn/store/agent/7481301871815278592?from=bots_card&bid=6g3f07lgs9g1v" target="_blank" class="text-accent inline-flex items-center text-sm">
              访问作品
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
            <div class="flex justify-between items-center mt-4">
              <button class="text-gray-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
              </button>
              <button class="text-gray-400 hover:text-white transition-colors share-btn" title="复制链接">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            </div>
          </div>
      </div>
      
        <!-- 项目2: 批量提取抖音文案 -->
        <div class="project-card bg-gray-900 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300" data-category="coze" data-year="year-24">
          <div class="h-48 md:h-56 overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80" 
              alt="批量提取抖音文案" 
              class="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            >
          </div>
          <div class="p-4 md:p-5">
            <h3 class="text-xl font-bold mb-2">批量提取抖音文案</h3>
            <p class="text-gray-400 mb-3 text-sm">基于Coze工作流开发的智能体，能够从多个抖音链接中批量提取文案内容，为内容创作者和营销人员提供高效的文本采集工具。</p>
            <div class="flex flex-wrap gap-1.5 mb-4">
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">24年</span>
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">Coze</span>
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">内容采集</span>
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">自动化</span>
            </div>
            <a href="https://www.coze.cn/store/agent/7476668689690001448?from=bots_card&bid=6g3f08e7c1g0f" target="_blank" class="text-accent inline-flex items-center text-sm">
              访问作品
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
            <div class="flex justify-between items-center mt-4">
              <button class="text-gray-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
              </button>
              <button class="text-gray-400 hover:text-white transition-colors share-btn" title="复制链接">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- 项目3: AI日报长图 -->
        <div class="project-card bg-gray-900 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300" data-category="coze" data-year="year-24">
          <div class="h-48 md:h-56 overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1504711434969-e33886168f5c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" 
              alt="AI日报长图" 
              class="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            >
          </div>
          <div class="p-4 md:p-5">
            <h3 class="text-xl font-bold mb-2">AI日报长图</h3>
            <p class="text-gray-400 mb-3 text-sm">基于Coze平台开发的智能体，自动收集并整理AI领域最新动态，生成精美的长图日报。为AI爱好者提供及时、高质量的行业资讯。</p>
            <div class="flex flex-wrap gap-1.5 mb-4">
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">24年</span>
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">Coze</span>
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">信息聚合</span>
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">图像生成</span>
            </div>
            <a href="https://www.coze.cn/store/agent/7478227602050859035?from=bots_card&bid=6g3evupn4901j" target="_blank" class="text-accent inline-flex items-center text-sm">
              访问作品
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
            <div class="flex justify-between items-center mt-4">
              <button class="text-gray-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
              </button>
              <button class="text-gray-400 hover:text-white transition-colors share-btn" title="复制链接">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <!-- 项目4: 支付宝百宝箱创意奖作品 -->
        <div class="project-card bg-gray-900 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300" data-category="alipay" data-year="year-24">
          <div class="h-48 md:h-56 overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=987&q=80" 
              alt="支付宝百宝箱创意奖作品" 
              class="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            >
          </div>
          <div class="p-4 md:p-5">
            <h3 class="text-xl font-bold mb-2">支付宝百宝箱创意奖作品</h3>
            <p class="text-gray-400 mb-3 text-sm">在支付宝百宝箱第五期智能体大赛中获得创意奖的作品，利用先进的AI技术创造了创新的用户体验与实用解决方案。</p>
            <div class="flex flex-wrap gap-1.5 mb-4">
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">24年</span>
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">支付宝</span>
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">获奖作品</span>
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">AI应用</span>
            </div>
            <a href="https://tbox.alipay.com/pro/share/202502APHi9E00284100?platform=WebService" target="_blank" class="text-accent inline-flex items-center text-sm">
              访问作品
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
            <div class="flex justify-between items-center mt-4">
              <button class="text-gray-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
              </button>
              <button class="text-gray-400 hover:text-white transition-colors share-btn" title="复制链接">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <!-- 项目5: Coze智能体平台个人主页 -->
        <div class="project-card bg-gray-900 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300" data-category="coze" data-year="year-24">
          <div class="h-48 md:h-56 overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" 
              alt="Coze智能体平台个人主页" 
              class="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            >
          </div>
          <div class="p-4 md:p-5">
            <h3 class="text-xl font-bold mb-2">Coze智能体平台个人主页</h3>
            <p class="text-gray-400 mb-3 text-sm">我在Coze智能体平台上创建了38个不同的智能体作品，涵盖多种功能和应用场景，展示了我在AI智能体领域的专业能力和创造力。</p>
            <div class="flex flex-wrap gap-1.5 mb-4">
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">24年</span>
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">Coze</span>
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">智能体开发</span>
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">平台主页</span>
            </div>
            <a href="https://www.coze.cn/user/1484768162621659?access_entrance=share_my_link&bid=6fp998a2k4g09" target="_blank" class="text-accent inline-flex items-center text-sm">
              访问作品
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
            <div class="flex justify-between items-center mt-4">
              <button class="text-gray-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
              </button>
              <button class="text-gray-400 hover:text-white transition-colors share-btn" title="复制链接">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <!-- 项目6: Perplexity用户五要素分析 -->
        <div class="project-card bg-gray-900 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300" data-category="cursor" data-year="year-24">
          <div class="h-48 md:h-56 overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" 
              alt="Perplexity用户五要素分析" 
              class="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            >
          </div>
          <div class="p-4 md:p-5">
            <h3 class="text-xl font-bold mb-2">Perplexity用户五要素分析</h3>
            <p class="text-gray-400 mb-3 text-sm">深入分析Perplexity用户行为的五个关键要素，提供全面的洞察和数据分析。通过Cursor平台构建的交互式数据分析工具。</p>
            <div class="flex flex-wrap gap-1.5 mb-4">
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">24年</span>
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">Cursor</span>
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">数据分析</span>
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">用户研究</span>
            </div>
            <a href="https://896qvdfnyj.app.yourware.so/" target="_blank" class="text-accent inline-flex items-center text-sm">
              访问作品
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
            <div class="flex justify-between items-center mt-4">
              <button class="text-gray-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
              </button>
              <button class="text-gray-400 hover:text-white transition-colors share-btn" title="复制链接">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <!-- 项目7: Gemini 2.5 Pro登顶AI编程 -->
        <div class="project-card bg-gray-900 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300" data-category="cursor" data-year="year-24">
          <div class="h-48 md:h-56 overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1365&q=80" 
              alt="Gemini 2.5 Pro登顶AI编程" 
              class="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            >
          </div>
          <div class="p-4 md:p-5">
            <h3 class="text-xl font-bold mb-2">Gemini 2.5 Pro登顶AI编程</h3>
            <p class="text-gray-400 mb-3 text-sm">详细分析Gemini 2.5 Pro在AI编程领域的突破性进展和技术优势，探讨其对开发者工作流程的影响和未来应用前景。</p>
            <div class="flex flex-wrap gap-1.5 mb-4">
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">24年</span>
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">Cursor</span>
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">AI研究</span>
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">技术分析</span>
            </div>
            <a href="https://3ovqoo2h83.app.yourware.so/" target="_blank" class="text-accent inline-flex items-center text-sm">
              访问作品
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
            <div class="flex justify-between items-center mt-4">
              <button class="text-gray-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
              </button>
              <button class="text-gray-400 hover:text-white transition-colors share-btn" title="复制链接">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <!-- 项目8: 机器学习论文（决策树算法比较实验） -->
        <div class="project-card bg-gray-900 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300" data-category="cursor" data-year="year-24">
          <div class="h-48 md:h-56 overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1515879218367-8466d910aaa4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1169&q=80" 
              alt="机器学习论文（决策树算法比较实验）" 
              class="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            >
          </div>
          <div class="p-4 md:p-5">
            <h3 class="text-xl font-bold mb-2">决策树算法比较实验</h3>
            <p class="text-gray-400 mb-3 text-sm">机器学习领域学术论文，通过实验比较不同决策树算法的性能和准确率，包含详细的数据分析和可视化结果，为算法选择提供科学依据。</p>
            <div class="flex flex-wrap gap-1.5 mb-4">
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">24年</span>
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">Cursor</span>
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">机器学习</span>
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">学术研究</span>
            </div>
            <a href="https://ag6j4i7ans.app.yourware.so/" target="_blank" class="text-accent inline-flex items-center text-sm">
              访问作品
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
            <div class="flex justify-between items-center mt-4">
              <button class="text-gray-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
              </button>
              <button class="text-gray-400 hover:text-white transition-colors share-btn" title="复制链接">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <!-- 项目9: 龙门面筋-美食瑰宝 -->
        <div class="project-card bg-gray-900 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300" data-category="cursor" data-year="year-24">
          <div class="h-48 md:h-56 overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1565958011703-44f9829ba187?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1065&q=80" 
              alt="龙门面筋-美食瑰宝" 
              class="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            >
          </div>
          <div class="p-4 md:p-5">
            <h3 class="text-xl font-bold mb-2">龙门面筋-美食瑰宝</h3>
            <p class="text-gray-400 mb-3 text-sm">探索中国传统美食龙门面筋的制作工艺、历史渊源及其独特魅力，通过多媒体呈现这一美食瑰宝的文化价值和地方特色。</p>
            <div class="flex flex-wrap gap-1.5 mb-4">
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">24年</span>
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">Cursor</span>
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">美食文化</span>
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">传统工艺</span>
            </div>
            <a href="https://111hc81zw8.app.yourware.so/" target="_blank" class="text-accent inline-flex items-center text-sm">
              访问作品
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
            <div class="flex justify-between items-center mt-4">
              <button class="text-gray-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
              </button>
              <button class="text-gray-400 hover:text-white transition-colors share-btn" title="复制链接">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <!-- 项目10: 羊了个羊小游戏 -->
        <div class="project-card bg-gray-900 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300" data-category="cursor" data-year="year-24">
          <div class="h-48 md:h-56 overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1511882150382-421056c89033?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1171&q=80" 
              alt="羊了个羊小游戏" 
              class="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            >
          </div>
          <div class="p-4 md:p-5">
            <h3 class="text-xl font-bold mb-2">羊了个羊小游戏</h3>
            <p class="text-gray-400 mb-3 text-sm">基于前端技术开发的高人气消除类小游戏，玩家需要通过配对相同图案来消除卡片，挑战记忆力和策略思维，享受休闲娱乐体验。</p>
            <div class="flex flex-wrap gap-1.5 mb-4">
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">24年</span>
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">Cursor</span>
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">游戏开发</span>
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">前端交互</span>
          </div>
            <a href="https://paqbsqb5gj.app.yourware.so/" target="_blank" class="text-accent inline-flex items-center text-sm">
              访问作品
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
            <div class="flex justify-between items-center mt-4">
              <button class="text-gray-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
              </button>
              <button class="text-gray-400 hover:text-white transition-colors share-btn" title="复制链接">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <!-- 项目11: 飞机大战小游戏 -->
        <div class="project-card bg-gray-900 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300" data-category="cursor" data-year="year-24">
          <div class="h-48 md:h-56 overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1534732806146-b3bf32171b48?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80" 
              alt="飞机大战小游戏" 
              class="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            >
          </div>
          <div class="p-4 md:p-5">
            <h3 class="text-xl font-bold mb-2">飞机大战小游戏</h3>
            <p class="text-gray-400 mb-3 text-sm">经典射击类游戏，玩家控制战机击落敌方飞机，融合了HTML5 Canvas和JavaScript技术，通过精巧的游戏机制和流畅的操作体验带来紧张刺激的游戏乐趣。</p>
            <div class="flex flex-wrap gap-1.5 mb-4">
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">24年</span>
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">Cursor</span>
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">游戏开发</span>
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">Canvas</span>
            </div>
            <a href="https://cxt20et8h7.app.yourware.so/" target="_blank" class="text-accent inline-flex items-center text-sm">
              访问作品
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
            <div class="flex justify-between items-center mt-4">
              <button class="text-gray-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
              </button>
              <button class="text-gray-400 hover:text-white transition-colors share-btn" title="复制链接">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- 项目: 几十亿年的演化，几十年内“烧”完？ -->
        <div class="project-card bg-gray-900 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300" data-category="wechat" data-year="year-25" data-date="2025-10-18">
          <div class="h-48 md:h-56 overflow-hidden">
            <img 
              :src="publicAsset('article_images/%E3%80%9025.10.18%E3%80%91%E5%87%A0%E5%8D%81%E4%BA%BF%E5%B9%B4%E7%9A%84%E6%BC%94%E5%8C%96%EF%BC%8C%E5%87%A0%E5%8D%81%E5%B9%B4%E5%86%85%E2%80%9C%E7%83%A7%E2%80%9D%E5%AE%8C%EF%BC%9F.png')" 
              alt="几十亿年的演化，几十年内烧完" 
              class="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            >
          </div>
          <div class="p-4 md:p-5">
            <h3 class="text-xl font-bold mb-2">几十亿年的演化，几十年内“烧”完？</h3>
            <p class="text-gray-400 mb-3 text-sm">围绕能源、文明演化与 AI 发展展开讨论，从更长的时间尺度重新理解技术跃迁与资源消耗之间的张力，属于 AGI 和 ASI 主题下的深度观察。</p>
            <div class="flex flex-wrap gap-1.5 mb-4">
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">25年</span>
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">公众号</span>
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">AGI和ASI</span>
            </div>
            <a href="https://mp.weixin.qq.com/s/6fp_tg7kMZMh8ULvXVpBYA" target="_blank" class="text-accent inline-flex items-center text-sm">
              访问文章
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
            <div class="flex justify-between items-center mt-4">
              <button class="text-gray-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
              </button>
              <button class="text-gray-400 hover:text-white transition-colors share-btn" title="复制链接">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- 项目: 从iPhone 17，到“终局”的AI：为什么我们不能落下？ -->
        <div class="project-card bg-gray-900 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300" data-category="wechat" data-year="year-25" data-date="2025-10-19">
          <div class="h-48 md:h-56 overflow-hidden">
            <img 
              :src="publicAsset('article_images/%E3%80%9025.10.19%E3%80%91%E4%BB%8EiPhone%2017%EF%BC%8C%E5%88%B0%E2%80%9C%E7%BB%88%E5%B1%80%E2%80%9D%E7%9A%84AI%EF%BC%9A%E4%B8%BA%E4%BB%80%E4%B9%88%E6%88%91%E4%BB%AC%E4%B8%8D%E8%83%BD%E8%90%BD%E4%B8%8B%EF%BC%9F.png')" 
              alt="从iPhone 17 到终局的 AI" 
              class="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            >
          </div>
          <div class="p-4 md:p-5">
            <h3 class="text-xl font-bold mb-2">从iPhone 17，到“终局”的AI：为什么我们不能落下？</h3>
            <p class="text-gray-400 mb-3 text-sm">从消费电子的新周期切入，延伸到 AI 竞争格局与个人选择，讨论为什么在技术快速演化的节点上，我们既不能旁观，也不能轻易掉队。</p>
            <div class="flex flex-wrap gap-1.5 mb-4">
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">25年</span>
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">公众号</span>
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">AGI和ASI</span>
            </div>
            <a href="https://mp.weixin.qq.com/s/Ab5ZjIdoMNnVToyQl2qLig" target="_blank" class="text-accent inline-flex items-center text-sm">
              访问文章
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
            <div class="flex justify-between items-center mt-4">
              <button class="text-gray-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
              </button>
              <button class="text-gray-400 hover:text-white transition-colors share-btn" title="复制链接">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- 项目: 你的“天赋”和“热爱”，可能被时代和算法“杀死” -->
        <div class="project-card bg-gray-900 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300" data-category="wechat" data-year="year-25" data-date="2025-10-26">
          <div class="h-48 md:h-56 overflow-hidden">
            <img 
              :src="publicAsset('article_images/%E3%80%9025.10.26%E3%80%91%E4%BD%A0%E7%9A%84%E2%80%9C%E5%A4%A9%E8%B5%8B%E2%80%9D%E5%92%8C%E2%80%9C%E7%83%AD%E7%88%B1%E2%80%9D%EF%BC%8C%E5%8F%AF%E8%83%BD%E8%A2%AB%E6%97%B6%E4%BB%A3%E5%92%8C%E7%AE%97%E6%B3%95%E2%80%9C%E6%9D%80%E6%AD%BB%E2%80%9D.png')" 
              alt="你的天赋和热爱可能被时代和算法杀死" 
              class="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            >
          </div>
          <div class="p-4 md:p-5">
            <h3 class="text-xl font-bold mb-2">你的“天赋”和“热爱”，可能被时代和算法“杀死”</h3>
            <p class="text-gray-400 mb-3 text-sm">从时代变迁与算法推荐机制切入，讨论个人天赋、兴趣与社会结构之间的关系，反思我们如何在系统性推力中守住真正想要的人生。</p>
            <div class="flex flex-wrap gap-1.5 mb-4">
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">25年</span>
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">公众号</span>
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">人生系统</span>
            </div>
            <a href="https://mp.weixin.qq.com/s/b4ZUsz0nsJFFNg9eyqUQ8w" target="_blank" class="text-accent inline-flex items-center text-sm">
              访问文章
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
            <div class="flex justify-between items-center mt-4">
              <button class="text-gray-400 hover:text-white transition-colors"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg></button>
              <button class="text-gray-400 hover:text-white transition-colors share-btn" title="复制链接"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg></button>
            </div>
          </div>
        </div>

        <!-- 项目: 《AI 2027》：一份让人毛骨悚然的“未来编年史” -->
        <div class="project-card bg-gray-900 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300" data-category="wechat" data-year="year-25" data-date="2025-10-27">
          <div class="h-48 md:h-56 overflow-hidden">
            <img 
              :src="publicAsset('article_images/%E3%80%9025.10.27%E3%80%91%E3%80%8AAI%202027%E3%80%8B%EF%BC%9A%E4%B8%80%E4%BB%BD%E8%AE%A9%E4%BA%BA%E6%AF%9B%E9%AA%A8%E6%82%9A%E7%84%B6%E7%9A%84%E2%80%9C%E6%9C%AA%E6%9D%A5%E7%BC%96%E5%B9%B4%E5%8F%B2%E2%80%9D.png')" 
              alt="AI 2027 未来编年史" 
              class="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            >
          </div>
          <div class="p-4 md:p-5">
            <h3 class="text-xl font-bold mb-2">《AI 2027》：一份让人毛骨悚然的“未来编年史”</h3>
            <p class="text-gray-400 mb-3 text-sm">围绕《AI 2027》的叙事展开梳理，拆解其中关于智能体演进、治理滞后与社会冲击的推演，呈现一幅令人不安却值得正视的未来图景。</p>
            <div class="flex flex-wrap gap-1.5 mb-4"><span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">25年</span><span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">公众号</span><span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">AGI和ASI</span></div>
            <a href="https://mp.weixin.qq.com/s/R42WcbHDgYbRTD3ERA5TBQ" target="_blank" class="text-accent inline-flex items-center text-sm">访问文章<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></a>
            <div class="flex justify-between items-center mt-4"><button class="text-gray-400 hover:text-white transition-colors"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg></button><button class="text-gray-400 hover:text-white transition-colors share-btn" title="复制链接"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg></button></div>
          </div>
        </div>

        <!-- 项目: OpenAI的2028时间表，与白领的“终局” -->
        <div class="project-card bg-gray-900 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300" data-category="wechat" data-year="year-25" data-date="2025-11-01">
          <div class="h-48 md:h-56 overflow-hidden">
            <img :src="publicAsset('article_images/%E3%80%9025.11.1%E3%80%91OpenAI%E7%9A%842028%E6%97%B6%E9%97%B4%E8%A1%A8%EF%BC%8C%E4%B8%8E%E7%99%BD%E9%A2%86%E7%9A%84%E2%80%9C%E7%BB%88%E5%B1%80%E2%80%9D.png')" alt="OpenAI 的 2028 时间表" class="w-full h-full object-cover transition-transform duration-500 hover:scale-110">
          </div>
          <div class="p-4 md:p-5">
            <h3 class="text-xl font-bold mb-2">OpenAI的2028时间表，与白领的“终局”</h3>
            <p class="text-gray-400 mb-3 text-sm">结合 OpenAI 的发展节奏与白领工作的结构性变化，讨论知识工作将如何被重塑，以及个体在新周期里该如何重新定位自己。</p>
            <div class="flex flex-wrap gap-1.5 mb-4"><span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">25年</span><span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">公众号</span><span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">AGI和ASI</span></div>
            <a href="https://mp.weixin.qq.com/s/d4YH-WBA-1EQ3dttfr9GMQ" target="_blank" class="text-accent inline-flex items-center text-sm">访问文章<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></a>
            <div class="flex justify-between items-center mt-4"><button class="text-gray-400 hover:text-white transition-colors"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg></button><button class="text-gray-400 hover:text-white transition-colors share-btn" title="复制链接"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg></button></div>
          </div>
        </div>

        <!-- 项目: 我的宇宙观 -->
        <div class="project-card bg-gray-900 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300" data-category="wechat" data-year="year-25" data-date="2025-11-02">
          <div class="h-48 md:h-56 overflow-hidden"><img :src="publicAsset('article_images/%E3%80%9025.11.2%E3%80%91%E6%88%91%E7%9A%84%E5%AE%87%E5%AE%99%E8%A7%82.png')" alt="我的宇宙观" class="w-full h-full object-cover transition-transform duration-500 hover:scale-110"></div>
          <div class="p-4 md:p-5">
            <h3 class="text-xl font-bold mb-2">我的宇宙观</h3>
            <p class="text-gray-400 mb-3 text-sm">从个体生命、时间尺度与社会结构出发，梳理自己理解世界、理解成长以及理解未来的底层框架，属于人生系统主题下的核心表达。</p>
            <div class="flex flex-wrap gap-1.5 mb-4"><span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">25年</span><span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">公众号</span><span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">人生系统</span></div>
            <a href="https://mp.weixin.qq.com/s/Ds02GuDzd3zpiHRvCaODqQ" target="_blank" class="text-accent inline-flex items-center text-sm">访问文章<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></a>
            <div class="flex justify-between items-center mt-4"><button class="text-gray-400 hover:text-white transition-colors"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg></button><button class="text-gray-400 hover:text-white transition-colors share-btn" title="复制链接"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg></button></div>
          </div>
        </div>

        <!-- 项目: 我的偶像：Geoffrey Hinton和llya Sutskever -->
        <div class="project-card bg-gray-900 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300" data-category="wechat" data-year="year-25" data-date="2025-11-08">
          <div class="h-48 md:h-56 overflow-hidden"><img :src="publicAsset('article_images/%E3%80%9025.11.8%E3%80%91%E6%88%91%E7%9A%84%E5%81%B6%E5%83%8F%EF%BC%9AGeoffrey%20Hinton%E5%92%8Cllya%20Sutskever.png')" alt="我的偶像 Geoffrey Hinton 和 Ilya Sutskever" class="w-full h-full object-cover transition-transform duration-500 hover:scale-110"></div>
          <div class="p-4 md:p-5">
            <h3 class="text-xl font-bold mb-2">我的偶像：Geoffrey Hinton和llya Sutskever</h3>
            <p class="text-gray-400 mb-3 text-sm">以两位关键人物的研究路径与思想影响为线索，回看深度学习浪潮如何形成，以及他们为何会成为理解 AGI 时代时绕不开的坐标。</p>
            <div class="flex flex-wrap gap-1.5 mb-4"><span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">25年</span><span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">公众号</span><span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">AGI和ASI</span></div>
            <a href="https://mp.weixin.qq.com/s/pu9f1jJE39Dk8XXp2UcTvw" target="_blank" class="text-accent inline-flex items-center text-sm">访问文章<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></a>
            <div class="flex justify-between items-center mt-4"><button class="text-gray-400 hover:text-white transition-colors"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg></button><button class="text-gray-400 hover:text-white transition-colors share-btn" title="复制链接"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg></button></div>
          </div>
        </div>

        <!-- 项目: AI大洗牌：从移动互联网的冬天，到AI的春天 -->
        <div class="project-card bg-gray-900 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300" data-category="wechat" data-year="year-25" data-date="2025-11-09">
          <div class="h-48 md:h-56 overflow-hidden"><img :src="publicAsset('article_images/%E3%80%9025.11.9%E3%80%91AI%E5%A4%A7%E6%B4%97%E7%89%8C%EF%BC%9A%E4%BB%8E%E7%A7%BB%E5%8A%A8%E4%BA%92%E8%81%94%E7%BD%91%E7%9A%84%E5%86%AC%E5%A4%A9%EF%BC%8C%E5%88%B0AI%E7%9A%84%E6%98%A5%E5%A4%A9.png')" alt="AI大洗牌" class="w-full h-full object-cover transition-transform duration-500 hover:scale-110"></div>
          <div class="p-4 md:p-5">
            <h3 class="text-xl font-bold mb-2">AI大洗牌：从移动互联网的冬天，到AI的春天</h3>
            <p class="text-gray-400 mb-3 text-sm">把 AI 周期放回更长的产业史中，比较移动互联网退潮与 AI 崛起的结构差异，解释为什么这次变化更像重置，而不只是一次热点轮动。</p>
            <div class="flex flex-wrap gap-1.5 mb-4"><span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">25年</span><span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">公众号</span><span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">AGI和ASI</span></div>
            <a href="https://mp.weixin.qq.com/s/QPnZOnuXAG79uTr6ucDM4g" target="_blank" class="text-accent inline-flex items-center text-sm">访问文章<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></a>
            <div class="flex justify-between items-center mt-4"><button class="text-gray-400 hover:text-white transition-colors"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg></button><button class="text-gray-400 hover:text-white transition-colors share-btn" title="复制链接"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg></button></div>
          </div>
        </div>

        <!-- 项目: 你愿做清朝皇帝，还是3025年的普通人？ -->
        <div class="project-card bg-gray-900 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300" data-category="wechat" data-year="year-25" data-date="2025-11-15">
          <div class="h-48 md:h-56 overflow-hidden"><img :src="publicAsset('article_images/%E3%80%9025.11.15%E3%80%91%E4%BD%A0%E6%84%BF%E5%81%9A%E6%B8%85%E6%9C%9D%E7%9A%87%E5%B8%9D%EF%BC%8C%E8%BF%98%E6%98%AF3025%E5%B9%B4%E7%9A%84%E6%99%AE%E9%80%9A%E4%BA%BA%EF%BC%9F.png')" alt="清朝皇帝还是3025年普通人" class="w-full h-full object-cover transition-transform duration-500 hover:scale-110"></div>
          <div class="p-4 md:p-5">
            <h3 class="text-xl font-bold mb-2">你愿做清朝皇帝，还是3025年的普通人？</h3>
            <p class="text-gray-400 mb-3 text-sm">借一个极具反差的设问，重新讨论技术进步、生活质量与文明红利之间的关系，帮助读者从直觉偏好跳到长期主义视角思考未来。</p>
            <div class="flex flex-wrap gap-1.5 mb-4"><span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">25年</span><span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">公众号</span><span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">AGI和ASI</span></div>
            <a href="https://mp.weixin.qq.com/s/h-V_xJhYmp6thIrCxLu0pg" target="_blank" class="text-accent inline-flex items-center text-sm">访问文章<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></a>
            <div class="flex justify-between items-center mt-4"><button class="text-gray-400 hover:text-white transition-colors"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg></button><button class="text-gray-400 hover:text-white transition-colors share-btn" title="复制链接"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg></button></div>
          </div>
        </div>

        <!-- 项目: 你是生产者，还是被降维打击的消费者？ -->
        <div class="project-card bg-gray-900 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300" data-category="wechat" data-year="year-25" data-date="2025-11-16">
          <div class="h-48 md:h-56 overflow-hidden"><img :src="publicAsset('article_images/%E3%80%9025.11.16%E3%80%91%E4%BD%A0%E6%98%AF%E7%94%9F%E4%BA%A7%E8%80%85%EF%BC%8C%E8%BF%98%E6%98%AF%E8%A2%AB%E9%99%8D%E7%BB%B4%E6%89%93%E5%87%BB%E7%9A%84%E6%B6%88%E8%B4%B9%E8%80%85%EF%BC%9F.png')" alt="生产者还是消费者" class="w-full h-full object-cover transition-transform duration-500 hover:scale-110"></div>
          <div class="p-4 md:p-5">
            <h3 class="text-xl font-bold mb-2">你是生产者，还是被降维打击的消费者？</h3>
            <p class="text-gray-400 mb-3 text-sm">从个人能力结构与系统位置出发，讨论在 AI 与平台经济时代，创造价值的人和被动消费的人将面对怎样越来越大的分化。</p>
            <div class="flex flex-wrap gap-1.5 mb-4"><span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">25年</span><span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">公众号</span><span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">人生系统</span></div>
            <a href="https://mp.weixin.qq.com/s/iz46E3cckJVZFy7Bo0bnYQ" target="_blank" class="text-accent inline-flex items-center text-sm">访问文章<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></a>
            <div class="flex justify-between items-center mt-4"><button class="text-gray-400 hover:text-white transition-colors"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg></button><button class="text-gray-400 hover:text-white transition-colors share-btn" title="复制链接"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg></button></div>
          </div>
        </div>

        <!-- 项目: 有命赚钱没命花——完全错误的消费主义价值导向 -->
        <div class="project-card bg-gray-900 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300" data-category="wechat" data-year="year-25" data-date="2025-11-22">
          <div class="h-48 md:h-56 overflow-hidden"><img :src="publicAsset('article_images/%E3%80%9025.11.22%E3%80%91%E6%9C%89%E5%91%BD%E8%B5%9A%E9%92%B1%E6%B2%A1%E5%91%BD%E8%8A%B1%E2%80%94%E2%80%94%E5%AE%8C%E5%85%A8%E9%94%99%E8%AF%AF%E7%9A%84%E6%B6%88%E8%B4%B9%E4%B8%BB%E4%B9%89%E4%BB%B7%E5%80%BC%E5%AF%BC%E5%90%91.png')" alt="有命赚钱没命花" class="w-full h-full object-cover transition-transform duration-500 hover:scale-110"></div>
          <div class="p-4 md:p-5">
            <h3 class="text-xl font-bold mb-2">有命赚钱没命花——完全错误的消费主义价值导向</h3>
            <p class="text-gray-400 mb-3 text-sm">反思消费主义叙事如何塑造我们的时间、健康与欲望分配，讨论一种更长期、更不被市场裹挟的人生价值排序方式。</p>
            <div class="flex flex-wrap gap-1.5 mb-4"><span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">25年</span><span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">公众号</span><span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">人生系统</span></div>
            <a href="https://mp.weixin.qq.com/s/Kad0MUpqbKubfaIWAcxV_Q" target="_blank" class="text-accent inline-flex items-center text-sm">访问文章<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></a>
            <div class="flex justify-between items-center mt-4"><button class="text-gray-400 hover:text-white transition-colors"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg></button><button class="text-gray-400 hover:text-white transition-colors share-btn" title="复制链接"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg></button></div>
          </div>
        </div>

        <!-- 项目: n8n自动新闻爬取系统 -->
        <div class="project-card bg-gray-900 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300" data-category="n8n" data-year="year-25" data-date="2025-12-31">
          <div class="h-48 md:h-56 overflow-hidden">
            <img :src="publicAsset('article_images/n8n%E8%87%AA%E5%8A%A8%E6%96%B0%E9%97%BB%E7%88%AC%E5%8F%96%E7%B3%BB%E7%BB%9F.png')" alt="n8n自动新闻爬取系统" class="w-full h-full object-cover transition-transform duration-500 hover:scale-110">
          </div>
          <div class="p-4 md:p-5">
            <h3 class="text-xl font-bold mb-2">n8n自动新闻爬取系统</h3>
            <p class="text-gray-400 mb-3 text-sm">通过 N8N 每日爬取英国、西班牙主流新闻网站，结合 AI 自动分析铁路与火车出行相关资讯，沉淀为选题池，服务内容制作与后续选题规划。</p>
            <div class="flex flex-wrap gap-1.5 mb-4">
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">25年</span>
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">n8n</span>
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">携程</span>
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">ai工具</span>
            </div>
            <a href="https://my.feishu.cn/wiki/I2shwmfs9iSJnlkAkipclNqKnEY" target="_blank" class="text-accent inline-flex items-center text-sm">
              访问作品
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
            <div class="flex justify-between items-center mt-4">
              <button class="text-gray-400 hover:text-white transition-colors"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg></button>
              <button class="text-gray-400 hover:text-white transition-colors share-btn" title="复制链接"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg></button>
            </div>
          </div>
        </div>

        <!-- 项目: n8n学生公域竞品账号爬虫 -->
        <div class="project-card bg-gray-900 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300" data-category="n8n" data-year="year-25" data-date="2025-12-30">
          <div class="h-48 md:h-56 overflow-hidden">
            <img :src="publicAsset('article_images/n8n%E5%AD%A6%E7%94%9F%E5%85%AC%E5%9F%9F%E7%AB%9E%E5%93%81%E8%B4%A6%E5%8F%B7%E7%88%AC%E8%99%AB.png')" alt="n8n学生公域竞品账号爬虫" class="w-full h-full object-cover transition-transform duration-500 hover:scale-110">
          </div>
          <div class="p-4 md:p-5">
            <h3 class="text-xl font-bold mb-2">n8n学生公域竞品账号爬虫</h3>
            <p class="text-gray-400 mb-3 text-sm">根据提供的小红书、抖音、快手博主清单，批量抓取笔记标题、描述、发布时间、播放量、点赞、收藏、评论、分享以及封面和视频等核心数据，用于竞品监测与内容分析。</p>
            <div class="flex flex-wrap gap-1.5 mb-4">
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">25年</span>
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">n8n</span>
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">携程</span>
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">ai工具</span>
            </div>
            <a href="https://my.feishu.cn/wiki/I2shwmfs9iSJnlkAkipclNqKnEY" target="_blank" class="text-accent inline-flex items-center text-sm">
              访问作品
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
            <div class="flex justify-between items-center mt-4">
              <button class="text-gray-400 hover:text-white transition-colors"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg></button>
              <button class="text-gray-400 hover:text-white transition-colors share-btn" title="复制链接"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg></button>
            </div>
          </div>
        </div>

        <!-- 项目: 面霸pro -->
        <div class="project-card bg-gray-900 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300" data-category="startup" data-year="year-26" data-date="2026-12-31">
          <div class="h-48 md:h-56 overflow-hidden">
            <img :src="publicAsset('article_images/%E9%9D%A2%E9%9C%B8pro.png')" alt="面霸pro" class="w-full h-full object-cover transition-transform duration-500 hover:scale-110">
          </div>
          <div class="p-4 md:p-5">
            <h3 class="text-xl font-bold mb-2">面霸pro</h3>
            <p class="text-gray-400 mb-3 text-sm">围绕求职全流程 SOP 做提效，覆盖面试辅助、押题、简历修改和面试复盘等关键环节，帮助求职者更系统地准备并提升拿 offer 的概率。</p>
            <div class="flex flex-wrap gap-1.5 mb-4">
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">26年</span>
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">创业</span>
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">ai工具</span>
            </div>
            <a href="https://interviewace.zhijiayi.online/?invite_code=CPVR1W" target="_blank" class="text-accent inline-flex items-center text-sm">
              访问作品
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
            <div class="flex justify-between items-center mt-4">
              <button class="text-gray-400 hover:text-white transition-colors"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg></button>
              <button class="text-gray-400 hover:text-white transition-colors share-btn" title="复制链接"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg></button>
            </div>
          </div>
        </div>

                <!-- 项目: 一文讲透KV Cache和Prompt Caching（大白话版） -->
        <div class="project-card bg-gray-900 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300" data-category="wechat" data-year="year-26" data-date="2026-08-23">
          <div class="h-48 md:h-56 overflow-hidden"><img :src="publicAsset('article_images/26.08.23-kv-cache-prompt-caching.jpg')" alt="KV Cache 与 Prompt Caching" loading="lazy" class="w-full h-full object-cover transition-transform duration-500 hover:scale-110"></div>
          <div class="p-4 md:p-5">
            <h3 class="text-xl font-bold mb-2">一文讲透KV Cache和Prompt Caching（大白话版）</h3>
            <p class="text-gray-400 mb-3 text-sm">用大白话从 Attention 的计算过程讲起，拆解 KV Cache 如何省掉重复计算、Prompt Caching 又如何把缓存复用到多次请求，看完包能理解。</p>
            <div class="flex flex-wrap gap-1.5 mb-4"><span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">26年</span><span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">公众号</span><span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">大模型原理</span></div>
            <a href="https://mp.weixin.qq.com/s/NHcBOItKPuRvNe4gKScpTg" target="_blank" class="text-accent inline-flex items-center text-sm">访问文章<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></a>
            <div class="flex justify-between items-center mt-4"><button class="text-gray-400 hover:text-white transition-colors"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg></button><button class="text-gray-400 hover:text-white transition-colors share-btn" title="复制链接"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg></button></div>
          </div>
        </div>

        <!-- 项目: RAG就是一坨，知识库的版本答案叫Skill的references -->
        <div class="project-card bg-gray-900 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300" data-category="wechat" data-year="year-26" data-date="2026-08-21">
          <div class="h-48 md:h-56 overflow-hidden"><img :src="publicAsset('article_images/26.08.21-rag-vs-skill-references.jpg')" alt="RAG 与 Skill 的 references" loading="lazy" class="w-full h-full object-cover transition-transform duration-500 hover:scale-110"></div>
          <div class="p-4 md:p-5">
            <h3 class="text-xl font-bold mb-2">RAG就是一坨，知识库的版本答案叫Skill的references</h3>
            <p class="text-gray-400 mb-3 text-sm">对比切片 + 向量检索的 RAG 与 Skill references 的渐进式披露，解释为什么知识库的版本答案变了，以及 RAG 更适合封装为 MCP 挂在 Agent 外面。</p>
            <div class="flex flex-wrap gap-1.5 mb-4"><span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">26年</span><span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">公众号</span><span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">Skills</span></div>
            <a href="https://mp.weixin.qq.com/s/4Wd2bMaHN20rGh2LFOXO9w" target="_blank" class="text-accent inline-flex items-center text-sm">访问文章<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></a>
            <div class="flex justify-between items-center mt-4"><button class="text-gray-400 hover:text-white transition-colors"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg></button><button class="text-gray-400 hover:text-white transition-colors share-btn" title="复制链接"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg></button></div>
          </div>
        </div>

        <!-- 项目: 企业级 Skills的最佳实践与避坑指南 -->
        <div class="project-card bg-gray-900 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300" data-category="wechat" data-year="year-26" data-date="2026-08-19">
          <div class="h-48 md:h-56 overflow-hidden"><img :src="publicAsset('article_images/26.08.19-enterprise-skills.jpg')" alt="企业级 Skills 最佳实践" loading="lazy" class="w-full h-full object-cover transition-transform duration-500 hover:scale-110"></div>
          <div class="p-4 md:p-5">
            <h3 class="text-xl font-bold mb-2">企业级 Skills的最佳实践与避坑指南</h3>
            <p class="text-gray-400 mb-3 text-sm">总结企业级 Skills 治理的最佳实践与避坑指南：既做 AI 专家，又做业务专家，把 20-40 分的 Skill 一步步迭代到 90 分。</p>
            <div class="flex flex-wrap gap-1.5 mb-4"><span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">26年</span><span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">公众号</span><span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">Skills</span></div>
            <a href="https://mp.weixin.qq.com/s/MNjyf6TBjJ0kXgmdyHz76Q" target="_blank" class="text-accent inline-flex items-center text-sm">访问文章<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></a>
            <div class="flex justify-between items-center mt-4"><button class="text-gray-400 hover:text-white transition-colors"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg></button><button class="text-gray-400 hover:text-white transition-colors share-btn" title="复制链接"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg></button></div>
          </div>
        </div>

        <!-- 项目: FDE 的本质：问题和答案都不确定时，如何同时收敛两端 -->
        <div class="project-card bg-gray-900 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300" data-category="wechat" data-year="year-26" data-date="2026-08-18">
          <div class="h-48 md:h-56 overflow-hidden"><img :src="publicAsset('article_images/26.08.18-fde.jpg')" alt="FDE 的本质" loading="lazy" class="w-full h-full object-cover transition-transform duration-500 hover:scale-110"></div>
          <div class="p-4 md:p-5">
            <h3 class="text-xl font-bold mb-2">FDE 的本质：问题和答案都不确定时，如何同时收敛两端</h3>
            <p class="text-gray-400 mb-3 text-sm">一文讲透 FDE 的本质：在需求和产品都未确定时深入客户现场，通过快速工程验证让业务问题与产品能力同时收敛，既交付业务结果，也沉淀可复用的产品能力。</p>
            <div class="flex flex-wrap gap-1.5 mb-4"><span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">26年</span><span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">公众号</span><span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">AI FDE</span></div>
            <a href="https://mp.weixin.qq.com/s/4zVkczWJSEyHwo_1Bm-MbA" target="_blank" class="text-accent inline-flex items-center text-sm">访问文章<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></a>
            <div class="flex justify-between items-center mt-4"><button class="text-gray-400 hover:text-white transition-colors"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg></button><button class="text-gray-400 hover:text-white transition-colors share-btn" title="复制链接"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg></button></div>
          </div>
        </div>

        <!-- 项目: 1h速通Harness Engineering版本答案——Claude Code （上） -->
        <div class="project-card bg-gray-900 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300" data-category="wechat" data-year="year-26" data-date="2026-06-07">
          <div class="h-48 md:h-56 overflow-hidden"><img :src="publicAsset('article_images/26.06.07-harness-engineering-claude-code.jpg')" alt="Harness Engineering 与 Claude Code" loading="lazy" class="w-full h-full object-cover transition-transform duration-500 hover:scale-110"></div>
          <div class="p-4 md:p-5">
            <h3 class="text-xl font-bold mb-2">1h速通Harness Engineering版本答案——Claude Code （上）</h3>
            <p class="text-gray-400 mb-3 text-sm">深度拆解 Claude Code：基于 Learn Claude Code 项目二次开发中文学习版，从最小 Agent Loop 讲起，梳理 Harness Engineering 的核心架构与机制。</p>
            <div class="flex flex-wrap gap-1.5 mb-4"><span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">26年</span><span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">公众号</span><span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">Claude Code</span></div>
            <a href="https://mp.weixin.qq.com/s/qnSwFJxsQ5eBoFjqqS-mvg" target="_blank" class="text-accent inline-flex items-center text-sm">访问文章<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></a>
            <div class="flex justify-between items-center mt-4"><button class="text-gray-400 hover:text-white transition-colors"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg></button><button class="text-gray-400 hover:text-white transition-colors share-btn" title="复制链接"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg></button></div>
          </div>
        </div>

        <!-- 项目: 做了一个提醒 Skill，专治久坐、缺水和脑子发胀 -->
        <div class="project-card bg-gray-900 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300" data-category="wechat" data-year="year-26" data-date="2026-05-26">
          <div class="h-48 md:h-56 overflow-hidden"><img :src="publicAsset('article_images/26.05.26-reminder-skill.jpg')" alt="提醒 Skill" loading="lazy" class="w-full h-full object-cover transition-transform duration-500 hover:scale-110"></div>
          <div class="p-4 md:p-5">
            <h3 class="text-xl font-bold mb-2">做了一个提醒 Skill，专治久坐、缺水和脑子发胀</h3>
            <p class="text-gray-400 mb-3 text-sm">用 Codex 手搓一个轻量的喝水 + 活动定时提醒 Skill，只在电脑亮屏时计时，专治长时间久坐、缺水和脑子发胀，工作学习效率至少提高 2 倍。</p>
            <div class="flex flex-wrap gap-1.5 mb-4"><span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">26年</span><span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">公众号</span><span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">Skills</span></div>
            <a href="https://mp.weixin.qq.com/s/DZSohRTVNFrd6Fmicygtqg" target="_blank" class="text-accent inline-flex items-center text-sm">访问文章<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></a>
            <div class="flex justify-between items-center mt-4"><button class="text-gray-400 hover:text-white transition-colors"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg></button><button class="text-gray-400 hover:text-white transition-colors share-btn" title="复制链接"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg></button></div>
          </div>
        </div>

        <!-- 项目: stephen-skills -->
        <div class="project-card bg-gray-900 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300" data-category="build" data-year="year-26" data-date="2026-07-31">
          <div class="h-48 md:h-56 overflow-hidden"><img :src="publicAsset('article_images/26.07.31-stephen-skills.jpg')" alt="stephen-skills" loading="lazy" class="w-full h-full object-cover transition-transform duration-500 hover:scale-110"></div>
          <div class="p-4 md:p-5">
            <h3 class="text-xl font-bold mb-2">stephen-skills</h3>
            <p class="text-gray-400 mb-3 text-sm">我自己真正高频使用、亲手制作和近期采纳的 15 个 AI Skills，涵盖 Skill 优化、Codex 工作流与日常效率工具，欢迎提交 PR。</p>
            <div class="flex flex-wrap gap-1.5 mb-4"><span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">26年</span><span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">开源</span><span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">Skills</span></div>
            <a href="https://github.com/Stephen-creater/stephen-skills" target="_blank" class="text-accent inline-flex items-center text-sm">查看仓库<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></a>
            <div class="flex justify-between items-center mt-4"><button class="text-gray-400 hover:text-white transition-colors"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg></button><button class="text-gray-400 hover:text-white transition-colors share-btn" title="复制链接"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg></button></div>
          </div>
        </div>

        <!-- 项目: 归潮 Returning Tide · AdventureX 2026 铜奖 -->
        <div class="project-card bg-gray-900 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300" data-category="build" data-year="year-26" data-date="2026-07-26">
          <div class="h-48 md:h-56 overflow-hidden"><img :src="publicAsset('article_images/26.07.26-adventurex-returning-tide.jpg')" alt="归潮 Returning Tide · AdventureX 2026 铜奖" loading="lazy" class="w-full h-full object-cover transition-transform duration-500 hover:scale-110"></div>
          <div class="p-4 md:p-5">
            <h3 class="text-xl font-bold mb-2">归潮 Returning Tide · AdventureX 2026 铜奖</h3>
            <p class="text-gray-400 mb-3 text-sm">面向福建老酒出海的 AI 原型：我负责 AI 广告视频生产 Skills，从海外广告库找模板、拆分镜到复刻成片与质检，形成完整生产闭环。</p>
            <div class="flex flex-wrap gap-1.5 mb-4"><span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">26年</span><span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">比赛</span><span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">铜奖</span><span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">AI 视频</span></div>
            <a href="https://culture-insight-lab.fantasoday.workers.dev/" target="_blank" class="text-accent inline-flex items-center text-sm">访问作品<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></a>
            <div class="flex justify-between items-center mt-4"><button class="text-gray-400 hover:text-white transition-colors"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg></button><button class="text-gray-400 hover:text-white transition-colors share-btn" title="复制链接"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg></button></div>
          </div>
        </div>

        <!-- 项目: Learn Claude Code 中文导学 -->
        <div class="project-card bg-gray-900 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300" data-category="build" data-year="year-26" data-date="2026-06-07">
          <div class="h-48 md:h-56 overflow-hidden"><img :src="publicAsset('article_images/26.06.07-learn-claude-code-cn.jpg')" alt="Learn Claude Code 中文导学" loading="lazy" class="w-full h-full object-cover transition-transform duration-500 hover:scale-110"></div>
          <div class="p-4 md:p-5">
            <h3 class="text-xl font-bold mb-2">Learn Claude Code 中文导学</h3>
            <p class="text-gray-400 mb-3 text-sm">基于 Learn Claude Code 二次开发的中文学习版：四个学习阶段切换，接入 MiniMax 与仓库知识库检索，边读教程边在本地问 AI。</p>
            <div class="flex flex-wrap gap-1.5 mb-4"><span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">26年</span><span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">开源</span><span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">Claude Code</span></div>
            <a href="https://github.com/Stephen-creater/learn-claude-code-cn-tutor" target="_blank" class="text-accent inline-flex items-center text-sm">查看仓库<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></a>
            <div class="flex justify-between items-center mt-4"><button class="text-gray-400 hover:text-white transition-colors"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg></button><button class="text-gray-400 hover:text-white transition-colors share-btn" title="复制链接"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg></button></div>
          </div>
        </div>

        <!-- 项目: 问对——问对问题，遇见专家 -->
        <div class="project-card bg-gray-900 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300" data-category="build" data-year="year-26" data-date="2026-01-18">
          <div class="h-48 md:h-56 overflow-hidden"><img :src="publicAsset('article_images/26.01.18-wendui.jpg')" alt="问对——问对问题，遇见专家" loading="lazy" class="w-full h-full object-cover transition-transform duration-500 hover:scale-110"></div>
          <div class="p-4 md:p-5">
            <h3 class="text-xl font-bold mb-2">问对——问对问题，遇见专家</h3>
            <p class="text-gray-400 mb-3 text-sm">黑客松作品：一个 Skills 原生的对话产品，帮普通人把重复的提问沉淀为可复用的 Skill，在对话中直接调用。</p>
            <div class="flex flex-wrap gap-1.5 mb-4"><span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">26年</span><span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">比赛</span><span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">黑客松</span><span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">Skills</span></div>
            <a href="https://the-question-beryl.vercel.app" target="_blank" class="text-accent inline-flex items-center text-sm">访问作品<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></a>
            <div class="flex justify-between items-center mt-4"><button class="text-gray-400 hover:text-white transition-colors"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg></button><button class="text-gray-400 hover:text-white transition-colors share-btn" title="复制链接"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg></button></div>
          </div>
        </div>

<!-- 项目: All IN创业前，先来这里“死”一次 -->
        <div class="project-card bg-gray-900 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300" data-category="wechat" data-year="year-26" data-date="2026-03-23">
          <div class="h-48 md:h-56 overflow-hidden"><img :src="publicAsset('article_images/%E3%80%9026.3.23%E3%80%91All%20IN%E5%88%9B%E4%B8%9A%E5%89%8D%EF%BC%8C%E5%85%88%E6%9D%A5%E8%BF%99%E9%87%8C%E2%80%9C%E6%AD%BB%E2%80%9D%E4%B8%80%E6%AC%A1.png')" alt="All IN 创业前先来这里死一次" class="w-full h-full object-cover transition-transform duration-500 hover:scale-110"></div>
          <div class="p-4 md:p-5">
            <h3 class="text-xl font-bold mb-2">All IN创业前，先来这里“死”一次</h3>
            <p class="text-gray-400 mb-3 text-sm">产品体验链接【更新后】https://startup-48h-survival-game.vercel.app/</p>
            <div class="flex flex-wrap gap-1.5 mb-4"><span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">26年</span><span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">公众号</span><span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">创业</span></div>
            <a href="https://mp.weixin.qq.com/s/03_jLtEDYG1sn9FFGnUYOg" target="_blank" class="text-accent inline-flex items-center text-sm">访问文章<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></a>
            <div class="flex justify-between items-center mt-4"><button class="text-gray-400 hover:text-white transition-colors"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg></button><button class="text-gray-400 hover:text-white transition-colors share-btn" title="复制链接"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg></button></div>
          </div>
        </div>

        <!-- 项目: AI创青春 | Start up 0809团队介绍 -->
        <div class="project-card bg-gray-900 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300" data-category="wechat" data-year="year-24">
          <div class="h-48 md:h-56 overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" 
              alt="AI创青春 | Start up 0809团队介绍" 
              class="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            >
          </div>
          <div class="p-4 md:p-5">
            <h3 class="text-xl font-bold mb-2">【补档】AI创青春 | Start up 0809团队介绍</h3>
            <p class="text-gray-400 mb-3 text-sm">介绍我们的AI创业团队背景、核心成员和创新项目规划，展示团队在人工智能领域的专业能力和创新愿景。</p>
            <div class="flex flex-wrap gap-1.5 mb-4">
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">24年</span>
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">公众号</span>
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">团队介绍</span>
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">AI创业</span>
            </div>
            <a href="https://mp.weixin.qq.com/s/nA7umRXW76VF0YzM-y_s3w" target="_blank" class="text-accent inline-flex items-center text-sm">
              访问文章
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
            <div class="flex justify-between items-center mt-4">
              <button class="text-gray-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
              </button>
              <button class="text-gray-400 hover:text-white transition-colors share-btn" title="复制链接">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <!-- 项目: 【"职面"恐惧】第1期,大学生线上群面模拟活动 -->
        <div class="project-card bg-gray-900 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300" data-category="wechat" data-year="year-24">
          <div class="h-48 md:h-56 overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" 
              alt="【职面恐惧】第1期,大学生线上群面模拟活动" 
              class="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            >
          </div>
          <div class="p-4 md:p-5">
            <h3 class="text-xl font-bold mb-2">精彩回顾 |【"职面"恐惧】第1期,大学生群面模拟</h3>
            <p class="text-gray-400 mb-3 text-sm">详细回顾咨询行业群面模拟活动的全过程，包括专业面试官点评与实用技巧分享，为大学生求职提供实战经验。</p>
            <div class="flex flex-wrap gap-1.5 mb-4">
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">24年</span>
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">公众号</span>
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">求职技巧</span>
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">群面模拟</span>
            </div>
            <a href="https://mp.weixin.qq.com/s/_1zm6RQCZMrpbKnoLyp6Hg" target="_blank" class="text-accent inline-flex items-center text-sm">
              访问文章
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
            <div class="flex justify-between items-center mt-4">
              <button class="text-gray-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
              </button>
              <button class="text-gray-400 hover:text-white transition-colors share-btn" title="复制链接">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- 项目: 求职技巧分享｜无领导小组模拟 -->
        <div class="project-card bg-gray-900 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300" data-category="wechat" data-year="year-24">
          <div class="h-48 md:h-56 overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" 
              alt="求职技巧分享｜无领导小组模拟" 
              class="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            >
          </div>
          <div class="p-4 md:p-5">
            <h3 class="text-xl font-bold mb-2">求职技巧分享｜无领导小组模拟来啦~</h3>
            <p class="text-gray-400 mb-3 text-sm">深入讲解无领导小组讨论的流程、角色与应对策略，配合实际案例分析与现场模拟，帮助求职者掌握群面核心技巧。</p>
            <div class="flex flex-wrap gap-1.5 mb-4">
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">24年</span>
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">公众号</span>
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">求职指导</span>
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">无领导小组</span>
            </div>
            <a href="https://mp.weixin.qq.com/s/7Lr9PacQZn31Qti3w0hSmg" target="_blank" class="text-accent inline-flex items-center text-sm">
              访问文章
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
            <div class="flex justify-between items-center mt-4">
              <button class="text-gray-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
              </button>
              <button class="text-gray-400 hover:text-white transition-colors share-btn" title="复制链接">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <!-- 项目: 求职技巧分享｜如何准备一次面试？ -->
        <div class="project-card bg-gray-900 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300" data-category="wechat" data-year="year-24">
          <div class="h-48 md:h-56 overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" 
              alt="求职技巧分享｜如何准备一次面试？" 
              class="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            >
          </div>
          <div class="p-4 md:p-5">
            <h3 class="text-xl font-bold mb-2">求职技巧分享｜如何准备一次面试？</h3>
            <p class="text-gray-400 mb-3 text-sm">全面解析面试前的准备工作，包括公司研究、自我介绍准备、常见问题应对和形象管理等关键环节，提供实用的面试准备清单。</p>
            <div class="flex flex-wrap gap-1.5 mb-4">
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">24年</span>
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">公众号</span>
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">面试技巧</span>
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">求职指南</span>
          </div>
            <a href="https://mp.weixin.qq.com/s/9xF0qhipQBYCx2sPRqsrIA" target="_blank" class="text-accent inline-flex items-center text-sm">
              访问文章
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
            <div class="flex justify-between items-center mt-4">
              <button class="text-gray-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
              </button>
              <button class="text-gray-400 hover:text-white transition-colors share-btn" title="复制链接">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <!-- 项目: 高能回顾 |【不安分青年工作坊】大厂职业规划师的干货分享 -->
        <div class="project-card bg-gray-900 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300" data-category="wechat" data-year="year-24">
          <div class="h-48 md:h-56 overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" 
              alt="高能回顾 |【不安分青年工作坊】大厂职业规划师的干货分享" 
              class="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            >
          </div>
          <div class="p-4 md:p-5">
            <h3 class="text-xl font-bold mb-2">高能回顾 |【不安分青年工作坊】大厂职业规划</h3>
            <p class="text-gray-400 mb-3 text-sm">来自顶级互联网公司的职业规划师分享求职与职业发展的核心策略，包括行业选择、个人定位和长期发展规划的实用指导。</p>
            <div class="flex flex-wrap gap-1.5 mb-4">
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">24年</span>
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">公众号</span>
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">职业规划</span>
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">大厂分享</span>
            </div>
            <a href="https://mp.weixin.qq.com/s/9A5Yaohu3rs5ekkVTc8RRw" target="_blank" class="text-accent inline-flex items-center text-sm">
              访问文章
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
            <div class="flex justify-between items-center mt-4">
              <button class="text-gray-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
              </button>
              <button class="text-gray-400 hover:text-white transition-colors share-btn" title="复制链接">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- 项目: 电影解说《银河护卫队3》 -->
        <div class="project-card bg-gray-900 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300" data-category="clip" data-year="year-24">
          <div class="h-48 md:h-56 overflow-hidden">
            <img 
              src="https://media.themoviedb.org/t/p/w1000_and_h563_face/A7JQ7MIV5fkIxceI5hizRIe6DRJ.jpg" 
              alt="电影解说《银河护卫队3》" 
              class="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            >
          </div>
          <div class="p-4 md:p-5">
            <h3 class="text-xl font-bold mb-2">电影解说《银河护卫队3》</h3>
            <p class="text-gray-400 mb-3 text-sm">独立完成剪辑、文案和全流程设计的电影解说视频，通过精彩的视听语言和深入的剧情分析，为观众提供独特视角的《银河护卫队3》解读。</p>
            <div class="flex flex-wrap gap-1.5 mb-4">
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">24年</span>
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">剪辑</span>
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">文案创作</span>
              <span class="text-xs bg-gray-800 text-accent px-2.5 py-0.5 rounded-full">电影解说</span>
            </div>
            <a href="http://xhslink.com/a/0MfLH0Vwsydbb" target="_blank" class="text-accent inline-flex items-center text-sm">
              访问作品
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
            <div class="flex justify-between items-center mt-4">
              <button class="text-gray-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
              </button>
              <button class="text-gray-400 hover:text-white transition-colors share-btn" title="复制链接">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  
  </div>
</template>

<style>
    .project-card {
      position: relative;
      overflow: hidden;
      border: 1px solid rgba(202, 158, 112, 0.14);
      background:
        linear-gradient(180deg, rgba(255, 249, 241, 0.48) 0%, rgba(247, 239, 229, 0.42) 100%);
      box-shadow:
        0 18px 34px rgba(150, 114, 73, 0.05),
        inset 0 1px 0 rgba(255, 255, 255, 0.44);
      transition:
        transform 260ms cubic-bezier(0.22, 1, 0.36, 1),
        box-shadow 260ms ease,
        border-color 260ms ease,
        background-color 260ms ease;
    }

    .project-card::before {
      content: '';
      position: absolute;
      inset: 0;
      pointer-events: none;
      background: linear-gradient(135deg, rgba(217, 119, 87, 0.1), transparent 38%, transparent 78%, rgba(217, 119, 87, 0.04));
      opacity: 0;
      transition: opacity 260ms ease;
    }

    .project-card:hover {
      transform: translateY(-8px);
      border-color: rgba(217, 119, 87, 0.22);
      box-shadow:
        0 22px 42px rgba(150, 114, 73, 0.08),
        0 0 0 1px rgba(217, 119, 87, 0.06),
        inset 0 1px 0 rgba(255, 255, 255, 0.5);
    }

    .project-card:hover::before {
      opacity: 1;
    }

    .project-card .h-48,
    .project-card .h-48.md\:h-56 {
      position: relative;
    }

    .project-card .h-48::after,
    .project-card .h-48.md\:h-56::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(20, 20, 19, 0.1), transparent 52%);
      opacity: 0.55;
      transition: opacity 260ms ease;
      pointer-events: none;
    }

    .project-card:hover .h-48::after,
    .project-card:hover .h-48.md\:h-56::after {
      opacity: 0.28;
    }

    .project-card img {
      transition: transform 520ms cubic-bezier(0.22, 1, 0.36, 1), filter 520ms ease;
      transform-origin: center;
    }

    .project-card:hover img {
      transform: scale(1.045);
      filter: saturate(1.04) contrast(1.02);
    }

    .project-card.is-filtered-out {
      pointer-events: none;
    }

    .project-card .copy-fingerprint {
      position: relative;
      flex: 0 0 auto;
      color: var(--muted);
      align-self: center;
    }
    
    .project-card .copy-fingerprint:hover {
      color: var(--accent-orange);
    }
    
    .project-card .copy-fingerprint:active {
      transform: translateY(0) scale(0.96);
    }

    .project-card .copy-fingerprint.is-copied {
      color: var(--accent-orange);
      transform: translateY(-1px);
    }

    /* 增强访问作品链接样式 */
    .project-card a.text-accent {
      display: inline-flex;
      align-items: center;
      background-color: transparent;
      border: none;
      border-radius: 0;
      padding: 6px 0;
      font-weight: 500;
      transition: all 0.3s ease;
      box-shadow: none;
      text-decoration: underline;
      text-underline-offset: 0.22em;
      color: var(--ink);
    }
    
    .project-card a.text-accent:hover {
      color: var(--accent-orange);
      box-shadow: none;
      transform: none;
    }
    
    .project-card a.text-accent svg {
      transition: transform 0.3s ease;
    }
    
    .project-card a.text-accent:hover svg {
      transform: translateX(3px);
    }
    
    /* 增强标签样式 */
    .project-card .text-xs.bg-gray-800.text-accent {
      background-color: rgba(255, 249, 240, 0.96);
      border: 1px solid rgba(208, 168, 122, 0.46);
      box-shadow: 0 1px 0 rgba(255, 255, 255, 0.75);
      padding: 5px 11px;
      font-weight: 700;
      letter-spacing: 0.02em;
      transition: border-color 0.3s ease, color 0.3s ease, background-color 0.3s ease;
      color: rgba(108, 77, 47, 0.98);
      font-family: var(--font-mono);
      border-radius: 999px;
    }
    
    .project-card:hover .text-xs.bg-gray-800.text-accent {
      background-color: rgba(255, 249, 240, 0.96);
      border-color: rgba(208, 168, 122, 0.56);
      box-shadow: 0 1px 0 rgba(255, 255, 255, 0.75);
    }

</style>
