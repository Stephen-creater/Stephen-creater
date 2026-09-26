<script setup>
import { onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'

const publicAsset = (path) => `${import.meta.env.BASE_URL}${path}`

const exploreCards = [
  {
    number: '01',
    label: 'portfolio',
    title: '作品集',
    description: '查看我正在做的 AI 产品、交互尝试与输出成果。',
    to: '/portfolio',
  },
  {
    number: '02',
    label: 'knowledge',
    title: '知识库',
    description: '进入我持续整理的 11 个知识板块：AI、项目、日常记录与方法沉淀。',
    to: '/knowledge',
  },
  {
    number: '03',
    label: 'interests',
    title: '兴趣',
    description: '看看我在电影、漫威和个人表达里的另一面。',
    to: '/interests',
  },
]

const nowItems = [
  { label: '工作', text: '以 AI FDE 的方式，在 AI 创业团队做业务落地：内容自动化与 AI 课程。' },
  { label: '开源', text: '维护 stephen-skills，沉淀我自己高频使用的 15 个 AI Skills。', href: 'https://github.com/Stephen-creater/stephen-skills' },
  { label: '写作', text: '持续输出 Harness Engineering、Skills、Agent 与 AI 产品的思考。', href: 'https://my.feishu.cn/wiki/ROodwcFqCifsTskEkHrcp95EnMh?table=tblc1Yo7L4Hl64Aw&view=vewbPqPWIX' },
]

let heroTimeline = null

onMounted(() => {
  const hero = document.querySelector('.home-hero')
  const title = hero?.querySelector('.home-hero__title')
  const microcopy = hero?.querySelector('.home-hero__microcopy')
  const actions = hero?.querySelector('.home-hero__actions')
  const illustration = hero?.querySelector('.hero-illustration')

  if (!hero || !title || !actions || !illustration) return

  heroTimeline = gsap.timeline({
    defaults: { ease: 'power2.out' },
    delay: 0.08,
  })

  heroTimeline.from(
    title,
    {
      y: 26,
      opacity: 0,
      filter: 'blur(10px)',
      duration: 0.7,
    },
    '-=0.18'
  )
  heroTimeline.from(
    microcopy,
    {
      y: 16,
      opacity: 0,
      duration: 0.42,
    },
    '-=0.28'
  )
  heroTimeline.from(
    actions,
    {
      y: 14,
      opacity: 0,
      duration: 0.36,
    },
    '-=0.2'
  )
  heroTimeline.fromTo(
    illustration,
    {
      x: 16,
      y: 20,
      opacity: 0,
      rotate: 5,
      filter: 'blur(14px)',
    },
    {
      x: 0,
      y: 0,
      opacity: 1,
      rotate: 2,
      filter: 'blur(0px)',
      duration: 0.82,
      ease: 'power2.out',
    },
    '-=0.55'
  )
})

onUnmounted(() => {
  heroTimeline?.kill()
  heroTimeline = null
})
</script>

<template>
  <div class="home-page">
    <section class="home-hero">
      <div class="container">
        <div class="home-hero__layout">
          <div class="home-hero__copy">
            <h1 class="home-hero__title">
              把技术做成<br>
              <span class="home-hero__title-accent">人能感受的体验。</span>
            </h1>
            <p class="home-hero__microcopy">叶耀楠<span>·</span>AI FDE &amp; AI PM<span>·</span>杭电 27 届</p>
            <div class="home-hero__actions">
              <a href="https://my.feishu.cn/wiki/KRCGwl4MniNsyBkszBgcXCM3nwg" target="_blank" rel="noreferrer" class="home-hero__cta">
                阅读个人说明书<span aria-hidden="true">→</span>
              </a>
            </div>
          </div>

          <div class="hero-illustration">
            <img
              :src="publicAsset('hero-illustration.png')"
              alt="AI × 设计"
              class="hero-illustration__img"
              draggable="false"
            />
          </div>
        </div>
      </div>
    </section>

    <section class="home-section home-now">
      <div class="container">
        <div class="explore-index__header">
          <span class="explore-index__eyebrow">Now</span>
          <div class="explore-index__rule"></div>
          <span class="home-now__date">2026.09</span>
        </div>
        <ul class="home-now__list">
          <li v-for="item in nowItems" :key="item.label" class="home-now__item">
            <span class="home-now__label">{{ item.label }}</span>
            <a v-if="item.href" :href="item.href" target="_blank" rel="noreferrer" class="home-now__text home-now__text--link">{{ item.text }}</a>
            <router-link v-else-if="item.to" :to="item.to" class="home-now__text home-now__text--link">{{ item.text }}</router-link>
            <span v-else class="home-now__text">{{ item.text }}</span>
          </li>
        </ul>
      </div>
    </section>

    <section class="home-section home-explore">
      <div class="container">
        <div class="explore-index">
          <div class="explore-index__header">
            <span class="explore-index__eyebrow">Explore</span>
            <div class="explore-index__rule"></div>
          </div>
          <nav class="explore-index__list">
            <router-link
              v-for="item in exploreCards"
              :key="item.title"
              :to="item.to"
              class="explore-row"
            >
              <span class="explore-row__number">{{ item.number }}</span>
              <div class="explore-row__main">
                <h2 class="explore-row__title">{{ item.title }}</h2>
                <p class="explore-row__desc">{{ item.description }}</p>
              </div>
              <div class="explore-row__meta">
                <span class="explore-row__label">{{ item.label }}</span>
                <span class="explore-row__arrow">→</span>
              </div>
            </router-link>
          </nav>
        </div>
      </div>
    </section>
  </div>
</template>
