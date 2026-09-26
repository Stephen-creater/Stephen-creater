<script setup>
import { onMounted, onUnmounted } from 'vue'

const publicAsset = (path) => `${import.meta.env.BASE_URL}${path}`

let contactController = null
let faqObserver = null

    onMounted(() => {
      contactController = new AbortController();
      const { signal } = contactController;

      // 复制功能
      const copyButtons = document.querySelectorAll('.copy-btn');
      copyButtons.forEach(btn => {
        btn.addEventListener('click', handleCopyClick, { signal });
      });
      
      // 提取复制处理函数，以避免重复绑定可能导致的多次触发
      function handleCopyClick(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const textToCopy = this.getAttribute('data-copy');
        const tooltip = this.nextElementSibling;
        
        // 如果已经有显示中的提示，先隐藏
        if (tooltip.style.opacity !== '0') {
          tooltip.style.opacity = '0';
        }
        
        // 修复复制功能
        const tempTextarea = document.createElement('textarea');
        tempTextarea.value = textToCopy;
        tempTextarea.style.position = 'absolute';
        tempTextarea.style.left = '-9999px';
        document.body.appendChild(tempTextarea);
        tempTextarea.select();
        
        try {
          document.execCommand('copy');
          // 显示提示
          tooltip.style.opacity = '1';
          
          // 1秒后隐藏提示（改为1秒）
          setTimeout(() => {
            tooltip.style.opacity = '0';
          }, 1000);
          
          console.log('成功复制:', textToCopy);
        } catch (err) {
          console.error('复制失败:', err);
          // 回退到原来的剪贴板API
          if (navigator.clipboard) {
            navigator.clipboard.writeText(textToCopy).then(function() {
              tooltip.style.opacity = '1';
              setTimeout(() => {
                tooltip.style.opacity = '0';
              }, 1000); // 改为1秒
            }).catch(function(err) {
              console.error('无法复制文本: ', err);
              alert('复制失败，请手动复制文本');
            });
          } else {
            alert('您的浏览器不支持自动复制，请手动复制文本');
          }
        }
        
        document.body.removeChild(tempTextarea);
      }
      
      // FAQ 展开/收起功能
      const faqQuestions = document.querySelectorAll('.faq-question');
      
      faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
          // 切换当前问题的打开状态
          const isOpen = question.classList.toggle('open');
          const answer = question.nextElementSibling;
          
          if (isOpen) {
            answer.classList.add('open');
          } else {
            answer.classList.remove('open');
          }
        }, { signal });
      });
      
      // FAQ 渐入动画
      const faqElements = document.querySelectorAll('.faq-appear');
      const faqObserverOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      };
      
      faqObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            // 添加延迟以实现顺序显示效果
            setTimeout(() => {
              entry.target.classList.add('visible');
            }, index * 100);
            faqObserver.unobserve(entry.target);
          }
        });
      }, faqObserverOptions);
      
      faqElements.forEach(el => {
        faqObserver.observe(el);
      });
    });

    onUnmounted(() => {
      contactController?.abort();
      contactController = null;
      faqObserver?.disconnect();
      faqObserver = null;
    });
  
</script>

<template>
  <div class="contact-page">

  <!-- Header -->
  
  
  <!-- Hero Section -->
  <section class="page-hero">
    <div class="container">
      <div class="page-hero__card page-hero__card--compact">
        <h1 class="page-title" style="max-width: none;">
          <span class="text-accent">联系</span>我
        </h1>
        <div class="page-hero__divider"></div>
      </div>
    </div>
  </section>
  
  <!-- Contact Section -->
  <section class="pb-10 relative z-10 contact-section-tight">
    <div class="container mx-auto px-4">
      <div class="contact-shell">
        <div class="contact-grid contact-grid--single">
          <div class="contact-info-col contact-info-col--centered">
            <!-- Email -->
            <div class="contact-method relative">
              <div class="contact-icon">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div class="contact-method__content">
                <h3 class="text-base font-medium">电子邮箱</h3>
                <p class="text-gray-400 text-sm" id="emailText">yaonanye1@gmail.com</p>
              </div>
              <button class="copy-btn p-2" data-copy="yaonanye1@gmail.com" aria-label="复制邮箱地址">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
              <div class="copy-tooltip">已复制!</div>
              <a href="mailto:yaonanye1@gmail.com" class="absolute inset-0" aria-label="发送邮件"></a>
            </div>
            
            <!-- Phone -->
            <div class="contact-method relative">
              <div class="contact-icon">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div class="contact-method__content">
                <h3 class="text-base font-medium">手机号码</h3>
                <p class="text-gray-400 text-sm" id="phoneText">+86 151 6822 4355</p>
              </div>
              <button class="copy-btn p-2" data-copy="+86 151 6822 4355" aria-label="复制手机号码">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
              <div class="copy-tooltip">已复制!</div>
            </div>
            
            <!-- WeChat -->
            <div class="contact-method">
              <div class="contact-icon">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div class="contact-method__content">
                <h3 class="text-base font-medium">微信</h3>
                <p class="text-gray-400 text-sm" id="wechatText">thanoswillreturn</p>
              </div>
              <button class="copy-btn p-2" data-copy="thanoswillreturn" aria-label="复制微信号">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
              <div class="copy-tooltip">已复制!</div>
            </div>
            
            <!-- GitHub -->
            <div class="contact-method relative">
              <div class="contact-icon">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 00-1.3-3.2 4.2 4.2 0 00-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 00-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 00-.1 3.2A4.6 4.6 0 004 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />
                </svg>
              </div>
              <div class="contact-method__content">
                <h3 class="text-base font-medium">GitHub</h3>
                <a href="https://github.com/Stephen-creater" target="_blank" rel="noreferrer" class="text-gray-400 text-sm hover:text-accent">github.com/Stephen-creater</a>
              </div>
              <button class="copy-btn p-2" data-copy="https://github.com/Stephen-creater" aria-label="复制 GitHub 链接">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
              <div class="copy-tooltip">已复制!</div>
            </div>

            <!-- QR Code -->
            <div class="contact-qr">
              <div class="text-center">
                <p class="text-gray-400 mb-2 text-sm">扫描下方二维码添加</p>
                <div class="qr-container mx-auto">
                  <img :src="publicAsset('assets/images/wechat.jpg')" alt="微信二维码" class="w-full h-full object-contain">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  
  <!-- FAQ Section -->
  <section class="py-16 relative z-10">
    <div class="container mx-auto px-4">
      <div v-fade-in class="max-w-3xl mx-auto">
        <div class="contact-faq-heading">
          <span class="contact-faq-heading__eyebrow">Quick intro</span>
          <h2 class="text-3xl font-bold text-center">认识我，最快的 5 个问题</h2>
          <p class="contact-faq-heading__body">
            比起一段标准自我介绍，我更想用五个问题，把我正在相信、正在做、也正在成为的东西讲清楚。
          </p>
        </div>
        
        <div class="faq-container">
          <!-- FAQ Item 1 -->
          <div class="faq-item faq-appear">
            <div class="faq-question">
              <span>你会怎么介绍现在的自己？</span>
              <div class="faq-icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-6 h-6">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <div class="faq-answer">
              <p>我是杭电 27 届学生，现在的定位是 AI FDE &amp; AI PM：深入真实业务，把 AI 能力做成能落地、能复用的产品和交付。</p>
              <p>如果要再补一句，我大概算是一个脚踏实地的理想主义者吧。一边学技术、做产品、写内容，一边又很执着地相信，AI 会真正改变这个时代。现在的我，还在路上，但方向已经非常清楚了。</p>
            </div>
          </div>
          
          <!-- FAQ Item 2 -->
          <div class="faq-item faq-appear">
            <div class="faq-question">
              <span>你为什么会这么相信 AI？</span>
              <div class="faq-icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-6 h-6">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <div class="faq-answer">
              <p>我从小就是个很重度的科幻迷。漫威宇宙、《万神殿》还有很多科幻作品，几乎构成了我理解未来世界的底色。</p>
              <p>所以当 AI 真的开始从幻想走进现实的时候，我会有一种非常强烈的感觉：就是它不只是一个工具升级，而是下一次范式革命。</p>
              <p>我一直很相信一句话：Superintelligence is the last invention humans will create.</p>
              <p>如果有生之年能亲眼见证那一天，我会觉得自己活在了一个很值得的时代。</p>
            </div>
          </div>
          
          <!-- FAQ Item 3 -->
          <div class="faq-item faq-appear">
            <div class="faq-question">
              <span>你平时都在折腾些什么？</span>
              <div class="faq-icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-6 h-6">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <div class="faq-answer">
              <p>我大部分时间都花在三件事上：做 AI 产品、学最新的 AI 技术、持续写内容。</p>
              <p>过去一年，我在携程 AI 团队做过 4 个半月的出海业务，用 n8n 搭了热点新闻和爆款视频的自动采集系统；之后在 AI 创业团队里做内容自动化和 AI 课程，也和队友拿了 AdventureX 2026 的铜奖。平时用得顺手的 Skills，我都开源在了 GitHub 上。</p>
              <p>对我来说，“折腾”不是瞎忙，而是在不断试着把想法变成作品，把输入变成结构，把兴趣变成长期积累。</p>
            </div>
          </div>
          
          <!-- FAQ Item 4 -->
          <div class="faq-item faq-appear">
            <div class="faq-question">
              <span>除了做项目，你还在认真经营什么？</span>
              <div class="faq-icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-6 h-6">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <div class="faq-answer">
              <p>我一直在搭自己的知识库。</p>
              <p>我把它分成了 11 个板块：AI、项目、日常记录、课程、信息源、财务、健康……本质上是把自己当作一家公司来运营。因为我越来越觉得，人生其实就是一个可以持续迭代的系统。</p>
              <p>很多东西当下看起来很碎，但只要你愿意长期记录、复盘、调整，最后它们会慢慢连成你的方法论，也会变成你自己的背景板。</p>
              <p>所以某种程度上，我不是在“记笔记”，我是在给未来的自己留线索。</p>
            </div>
          </div>
          
          <!-- FAQ Item 5 -->
          <div class="faq-item faq-appear">
            <div class="faq-question">
              <span>什么样的人，你会很想认识？</span>
              <div class="faq-icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-6 h-6">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <div class="faq-answer">
              <p>如果你也相信 AI 会真正重塑世界，如果你也对未来还有很强的好奇心和想象力，如果你是一个真诚、直接、不太愿意按旧规则活着的人，那我会很想认识你。</p>
              <p>我一直很喜欢乔布斯那句 Think Different。</p>
              <p>不是为了显得特别，而是因为我真的觉得，很多值得做的事，本来就不该只是重复别人已经走过的路。</p>
              <p>所以比起“认识更多人”，我更期待遇到那些真的有想法、有热情、也愿意行动的人～</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  
  </div>
</template>

<style>

    /* 联系方式卡片 */
    .contact-method {
      display: grid;
      grid-template-columns: 48px minmax(0, 1fr) 28px;
      align-items: center;
      gap: 0.9rem;
      width: 100%;
      max-width: 420px;
      margin-bottom: 1.15rem;
      padding: 0.9rem 0;
      border-bottom: 1px solid rgba(20, 20, 19, 0.08);
      transition: color 0.3s ease, transform 0.3s ease;
    }
    
    .contact-method:hover {
      transform: translateY(-2px);
      box-shadow: none;
    }
    
    .contact-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      background-color: rgba(217, 119, 87, 0.12);
      border-radius: 12px;
      margin-right: 1rem;
      transition: all 0.3s ease;
    }
    
    .contact-method:hover .contact-icon {
      background-color: rgba(217, 119, 87, 0.18);
      transform: scale(1.05);
    }

    .contact-method__content {
      min-width: 0;
      display: grid;
      gap: 0.1rem;
    }
    
    /* 复制成功提示 */
    .copy-tooltip {
      position: absolute;
      background-color: rgba(20, 20, 19, 0.86);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
      right: 40px;
      top: 50%;
      transform: translateY(-50%);
      white-space: nowrap;
      z-index: 10;
    }
    
    /* 复制按钮样式调整 */
    .copy-btn {
      cursor: pointer;
      color: var(--muted);
      transition: all 0.3s ease;
      position: relative;
      z-index: 5;
    }
    
    .copy-btn:hover {
      color: var(--accent-orange);
    }
    
    /* 二维码容器 */
    .qr-container {
      border: 1px solid rgba(217, 119, 87, 0.22);
      padding: 8px;
      border-radius: 12px;
      background-color: rgba(255, 252, 246, 0.72);
      width: 140px;
      height: 140px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 12px 28px rgba(150, 114, 73, 0.08);
    }
    
    /* 联系页面布局调整 */
    .contact-shell {
      max-width: 820px;
      margin: 0 auto;
      background: transparent !important;
      border: none !important;
      outline: none !important;
      border-radius: 0 !important;
      box-shadow: none !important;
      overflow: visible;
    }

    .contact-section-tight {
      margin-top: -2.75rem;
    }
    
    .contact-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
    }

    .contact-grid--single {
      grid-template-columns: minmax(0, 1fr);
      justify-content: center;
      border: none !important;
      outline: none !important;
      box-shadow: none !important;
      background: transparent !important;
    }
    
    @media (max-width: 768px) {
      .contact-grid {
        grid-template-columns: 1fr;
      }
    }
    
    .contact-header {
      padding-bottom: 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      margin-bottom: 1.5rem;
    }
    
    .contact-info-col {
      padding: 2rem;
    }

    .contact-info-col--centered {
      max-width: 460px;
      margin: 0 auto;
      width: 100%;
      border: none !important;
      outline: none !important;
      box-shadow: none !important;
      background: transparent !important;
    }

    .contact-qr {
      display: flex;
      justify-content: center;
      margin-top: 1.8rem;
    }
    
    /* 精简页面元素间距 */
    .space-y-6 > :not([hidden]) ~ :not([hidden]) {
      --tw-space-y-reverse: 0;
      margin-top: calc(1rem * calc(1 - var(--tw-space-y-reverse)));
      margin-bottom: calc(1rem * var(--tw-space-y-reverse));
    }
    
    /* FAQ样式 */
    .faq-container {
      max-width: 800px;
      margin: 0 auto;
    }

    .contact-faq-heading {
      display: grid;
      gap: 0.9rem;
      margin-bottom: 2rem;
      text-align: center;
    }

    .contact-faq-heading__eyebrow {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.45rem;
      width: fit-content;
      margin: 0 auto;
      padding: 0.32rem 0.72rem;
      border: 1px solid rgba(20, 20, 19, 0.08);
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.66);
      color: var(--muted);
      font-family: var(--font-mono);
      font-size: 0.72rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .contact-faq-heading__body {
      max-width: 680px;
      margin: 0 auto;
      color: var(--muted);
      line-height: 1.8;
      font-size: 0.98rem;
    }
    
    .faq-item {
      background-color: rgba(10, 12, 16, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 16px;
      overflow: hidden;
      margin-bottom: 1rem;
      transition: all 0.3s ease;
    }
    
    .faq-item:hover {
      background-color: rgba(20, 24, 30, 0.7);
      border-color: rgba(217, 119, 87, 0.22);
      box-shadow: 0 10px 28px rgba(217, 119, 87, 0.12);
    }
    
    .faq-question {
      color: #fff;
      padding: 1.25rem;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 500;
      font-size: 1.125rem;
      position: relative;
    }
    
    .faq-answer {
      color: #b7b7b7;
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.5s ease, padding 0.3s ease;
      border-top: 0px solid rgba(255, 255, 255, 0.05);
      line-height: 1.7;
    }

    .faq-answer.open {
      max-height: 900px;
      padding: 0 1.25rem 1.25rem 1.25rem;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
    }

    .faq-answer p + p {
      margin-top: 0.8rem;
    }
    
    .faq-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.4s ease;
      color: var(--accent-orange);
      height: 24px;
      width: 24px;
    }
    
    .faq-question.open .faq-icon {
      transform: rotate(180deg);
    }
    
    /* 渐入动画 */
    .faq-appear {
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.5s ease, transform 0.5s ease;
    }
    
    .faq-appear.visible {
      opacity: 1;
      transform: translateY(0);
    }
  
</style>
