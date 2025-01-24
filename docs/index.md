---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

title: 'Monorepo Package Manager'
titleTemplate: MonoPKG

hero:
  name: 'MonoPKG'
  text: 'Many Things, At Once'
  tagline: 'A simple, yet <s>powerful</s> indispensable package manager for monorepos.'
  actions:
    - theme: brand
      text: Get Started
      link: /guides/getting-started
    - theme: alt
      text: Learn More
      link: /guides/overview

features:
  - title: Unified Dependency Management
    icon: 📦
    details: Manage dependencies across all your packages with a single command. No more repetitive installations. Simplify your workflow and boost productivity.
  
  - title: Simplified Package Creation
    icon: 🛠️
    details: Create new packages from templates within your monorepo with ease. Save time and effort on manual setups. Focus on what matters most—building great software.
  
  - title: Run Scripts Across Packages
    icon: 🚀
    details: Execute scripts in multiple packages simultaneously, ensuring consistency and saving time. Streamline your development process with unparalleled efficiency.
  
  - title: Seamless Integration
    icon: 🔗
    details: Integrate seamlessly with your existing tools and workflows. MonoPKG adapts to your needs, not the other way around.

---

<div class="flex-row my-huge">
  <div class="flex-1 flex-row-center bg-soft">
    <pre>
      <code>
$ cd packages/package-a
$ bun add -D eslint prettier typescript
$ cd ../package-b
$ bun add -D eslint prettier typescript
$ cd ../package-c
$ bun add -D eslint prettier typescript
$ cd ../package-d
$ bun add -D eslint prettier typescript
$ ...
      </code>
    </pre>
  </div>
  <div class="flex-row-center">
    ->
  </div>
  <div class="flex-1 flex-row-center bg-soft">
    <pre>
      <code>
$ monopkg add -d eslint prettier typescript
      </code>
    </pre>
  </div>
</div>

<style>
  :root {
    --vp-home-hero-name-color: transparent;
    --vp-home-hero-name-background: -webkit-linear-gradient(120deg, #bd34fe 30%, #41d1ff);

    --vp-home-hero-image-background-image: linear-gradient(-45deg, #bd34fe 50%, #47caff 50%);
    --vp-home-hero-image-filter: blur(44px);
  }

  pre, code {
    display: flex;
    text-align: left;
    padding: 0;
    margin: 0;
    width: 100%
  }

  .flex-row {
    width: 100%;
    display: flex;
    gap: 16px;
  }

  .flex-row-center {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .flex-1 {
    flex: 1;
  }

  .bg-soft {
    background-color: var(--vp-c-bg-soft);
    border-radius: 12px;
    padding: 0 32px;
  }

  .my-huge {
    margin-top: 16px;
    margin-bottom: 16px;
  }

  @media (min-width: 640px) {
    :root {
      --vp-home-hero-image-filter: blur(56px);
    }
  }

  @media (min-width: 960px) {
    :root {
      --vp-home-hero-image-filter: blur(68px);
    }
  }
</style>

