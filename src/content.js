import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import taskLists from 'markdown-it-task-lists';
import katex from 'katex';
import texmath from 'markdown-it-texmath';
import mermaid from 'mermaid';
import './content.css';

const options = {
  html: true,
  linkify: true,
  highlight: (str, lang) => {
    if (lang === 'mermaid') {
      return '';
    }
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value;
      } catch (__) {}
    }
    return '';
  },
};

const md = new MarkdownIt(options).use(taskLists).use(texmath, {
  engine: katex,
  delimiters: 'dollars',
});

(async () => {
  mermaid.initialize({ startOnLoad: false });
  document.body.classList.add('markdown-body');
  let prev = document.body.innerText;
  document.body.innerHTML = md.render(prev);
  await mermaid.run({ querySelector: '.language-mermaid' });
  setInterval(() => {
    chrome.runtime.sendMessage({ href: location.href }, async (response) => {
      if (prev === response.text) {
        return;
      }
      prev = response.text;
      document.body.innerHTML = md.render(response.text);
      await mermaid.run({ querySelector: '.language-mermaid' });
    });
  }, 1000);
})();
