<template>
  <footer>
    <div class="container site-footer">
      <p class="site-footer__copy">&copy; 2026 Stephen<span class="site-brand__dot">·</span>叶耀楠</p>
      <nav class="site-footer__links" aria-label="外部链接">
        <a href="mailto:yaonanye1@gmail.com">邮箱</a>
        <a href="https://github.com/Stephen-creater" target="_blank" rel="noreferrer">GitHub</a>
        <a href="https://my.feishu.cn/wiki/KRCGwl4MniNsyBkszBgcXCM3nwg" target="_blank" rel="noreferrer">个人说明书</a>
        <span>公众号 · AI产品Stephen</span>
      </nav>
    </div>
  </footer>
</template>

<style>
.site-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem 2rem;
  flex-wrap: wrap;
  font-size: 0.85rem;
}

.site-footer__links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.6rem;
}

footer .site-footer__links a {
  transition: color 180ms ease;
}

footer .site-footer__links a:hover {
  color: var(--accent-orange) !important;
}
</style>
