import * as hljs from 'highlight.js';
import * as MarkdownIt from 'markdown-it';
import './main.css';

const option = {
  html: true,
  linkify: true,
  highlight: (str, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(lang, str).value;
      } catch (__) {}
    }
    return '';
  },
};

const md = new MarkdownIt(option)
  .use(require('markdown-it-task-lists'))
  .use(require('markdown-it-texmath'), {
    engine: require('katex'),
    delimiters: 'dollars',
  });

(() => {
  document.body.classList.add('markdown-body');
  let prev = document.body.innerText;
  document.body.innerHTML = md.render(prev);
  setInterval(() => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', location.href, true);
    xhr.onload = () => {
      const text = xhr.responseText;
      if (prev === text) {
        return;
      }
      prev = text;
      document.body.innerHTML = md.render(text);
    };
    xhr.send();
  }, 1000);
})();
