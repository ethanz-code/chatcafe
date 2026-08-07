<template>
  <div
    :class="[
      'min-h-[44px] max-w-full box-border markdown rounded-lg p-3 break-words break-all overflow-hidden',
      !item.disable
        ? item.role === 'assistant'
          ? 'bg-gray-100'
          : 'bg-[#4073fa] text-white'
        : 'p-0 pt-0.5'
    ]"
  >
    <van-loading v-if="text === ''" size="20" />
    <div v-else v-html="html"></div>
  </div>
</template>
<script setup lang="js">
import { computed, onMounted } from 'vue'
const props = defineProps(['showCursor', 'text', 'item'])

import { Marked } from 'marked'
import { markedHighlight } from 'marked-highlight'
import DOMPurify from 'dompurify'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import python from 'highlight.js/lib/languages/python'
import java from 'highlight.js/lib/languages/java'
import c from 'highlight.js/lib/languages/c'
import cpp from 'highlight.js/lib/languages/cpp'
import go from 'highlight.js/lib/languages/go'
import rust from 'highlight.js/lib/languages/rust'
import sql from 'highlight.js/lib/languages/sql'
import json from 'highlight.js/lib/languages/json'
import xml from 'highlight.js/lib/languages/xml'
import css from 'highlight.js/lib/languages/css'
import bash from 'highlight.js/lib/languages/bash'
import markdown from 'highlight.js/lib/languages/markdown'
import mdInCode from '@/utils/mdInCode'
import { v4 as uuidv4 } from 'uuid'
import copy from '@/utils/copyInformation'

hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('python', python)
hljs.registerLanguage('java', java)
hljs.registerLanguage('c', c)
hljs.registerLanguage('cpp', cpp)
hljs.registerLanguage('go', go)
hljs.registerLanguage('rust', rust)
hljs.registerLanguage('sql', sql)
hljs.registerLanguage('json', json)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('css', css)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('markdown', markdown)

const codeBuffer = {}
const marked = new Marked(
  markedHighlight({
    langPrefix: 'hljs language-',
      highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext'
      const codeUUID = uuidv4()
      const methodExtend = `<div class="absolute left-0 top-0 w-full py-2 bg-[#595b62] text-white flex gap-2 items-center justify-between px-3 box-border" >
          <span>${lang}</span>
          <span class="copyCode" data-code-uuid="${codeUUID}" >复制代码</span>
        </div>`
      // 将代码和uuid一并存到codeBuffer中
      codeBuffer[codeUUID] = code
      return `${methodExtend}${hljs.highlight(code, { language }).value}`
    }
  })
)

// 定义事件处理函数
function copyCode(code) {
  copy(code, () => {
    // eslint-disable-next-line no-undef
    showSuccessToast('复制成功')
  })
}

// 计算最终要显示的 html 文本
const html = computed(() => {
  // 将 markdown 转为 html
  function trans(text) {
    return DOMPurify.sanitize(marked.parse(text))
  }

  // 光标元素，可以用 css 美化成你想要的样子
  const cursor = '<span class="cursor"></span>'
  if (props.showCursor) {
    // 判断 AI 正在回的消息是否有未闭合的代码块。
    const inCode = mdInCode(props.text)
    if (inCode) {
      // 有未闭合的代码块，不显示光标
      return trans(props.text)
    } else {
      // 没有未闭合的代码块，将光标元素追加到最后。
      return trans(props.text + cursor)
    }
  } else {
    // 父组件明确不显示光标
    return trans(props.text)
  }
})

onMounted(() => {
  // 移除光标元素
  const cursor = document.querySelector('.cursor')
  if (cursor) cursor.remove()

  // 获取所有copyCode元素，为其添加拷贝事件
  let copyElements = document.querySelectorAll('.copyCode')
  copyElements = Array.from(copyElements)
  // 这一步过滤非常重要，仅处理当前message中存在的code块
  copyElements = copyElements.filter((el) => codeBuffer[el.dataset.codeUuid] !== undefined)
  copyElements.forEach(function (el) {
    el.removeEventListener('click', () => copyCode(codeBuffer[el.dataset.codeUuid]))
    el.addEventListener('click', () => copyCode(codeBuffer[el.dataset.codeUuid]))
  })
})
</script>
<style>
/** 设置代码块样式 **/
.markdown pre {
  --tw-bg-opacity: 1;
  position: relative;
  background-color: rgb(40 44 52 / var(--tw-bg-opacity));
  padding: 1rem /* 16px */;
  padding-top: 3rem;
  margin-top: 1rem /* 16px */;
  border-radius: 0.375rem 6px;
  box-sizing: border-box;
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity));
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}

/* .markdown code {
  width: 100%;
} */

/** 小代码块样式，对应 markdown 的 `code` **/
* .markdown :not(pre) > code {
  --tw-bg-opacity: 1;
  /* background-color: rgb(40 44 52 / var(--tw-bg-opacity)); */
  /* border-radius: 0.375rem; */
  padding-left: 0.25rem;
  padding-right: 0.25rem;
  --tw-text-opacity: 1;
  color: rgb(224 108 117 / var(--tw-text-opacity));
}

/** 列表样式 **/
.markdown ol {
  list-style-type: decimal;
  padding-left: 25px;
}
.markdown ul {
  list-style-type: disc;
  padding-left: 25px;
}

/** p标签首行缩进 **/
/* .markdown p {
  text-indent: 1rem;
} */

/** 光标样式 **/
.markdown .cursor {
  display: inline-block;
  width: 2px;
  height: 20px;
  --tw-bg-opacity: 1;
  background-color: rgb(31 41 55 / var(--tw-bg-opacity));
  animation: blink 1.2s step-end infinite;
  margin-left: 2px;
  vertical-align: bottom;
}
@keyframes blink {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>
