import * as hljs from 'highlight.js';
import * as MarkdownIt from 'markdown-it';
import './main.css';

function render(text) {
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
  document.body.innerHTML = new MarkdownIt(option)
    .use(require('markdown-it-task-lists'))
    .use(require('markdown-it-texmath'), {
      engine: require('katex'),
      delimiters: 'dollars',
    })
    .render(text);
}

(() => {
  document.body.classList.add('markdown-body');
  let prev = document.body.innerText;
  render(prev);
  setInterval(() => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', location.href, true);
    xhr.onload = () => {
      const data = xhr.responseText;
      if (prev === data) {
        return;
      }
      prev = data;
      render(data);
    };
    xhr.send();
  }, 1000);
})();
