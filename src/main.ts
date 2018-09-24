import * as hljs from 'highlight.js';
import * as MarkdownIt from 'markdown-it';
import './main.css';

const MATH_JAX_CONFIG: MathJax.Config = {
  showMathMenu: false,
  showProcessingMessages: false,
  messageStyle: 'none',
  tex2jax: {
    inlineMath: [
      ['\\(', '\\)']
    ],
    displayMath: [
      ['\\[', '\\]']
    ],
    processEscapes: true
  },
  TeX: {
    Macros: {
      argmax: ['\\mathop{\\mathrm{argmax}}\\limits'],
      argmin: ['\\mathop{\\mathrm{argmin}}\\limits']
    }
  }
};

function render(text: string): void {
  const options: MarkdownIt.Options = {
    html: true,
    linkify: true,
    highlight: (str, lang) => {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(lang, str).value;
        } catch (__) {}
      }
      return '';
    }
  };

  document.body.innerHTML = new MarkdownIt(options)
    .use(require('markdown-it-mathjax')())
    .use(require('markdown-it-task-lists'))
    .render(text);

  document.body.dispatchEvent(new CustomEvent('MarkdownUpdated'));
}

(() => {
  const mathJaxConfigScript = document.createElement('script');
  mathJaxConfigScript.setAttribute('type', 'text/x-mathjax-config');
  mathJaxConfigScript.innerHTML = `MathJax.Hub.Config(${JSON.stringify(MATH_JAX_CONFIG)});`;
  document.head.appendChild(mathJaxConfigScript);

  const mathJaxScript = document.createElement('script');
  mathJaxScript.setAttribute('type', 'text/javascript');
  mathJaxScript.setAttribute(
    'src', chrome.extension.getURL('js/mathjax/MathJax.js?config=TeX-AMS-MML_HTMLorMML'));
  document.head.appendChild(mathJaxScript);

  const mathJaxQueueFn = () => {
    document.body.addEventListener('MarkdownUpdated', () => {
      if (typeof window.MathJax !== 'undefined' && typeof window.MathJax.Hub !== 'undefined') {
        window.MathJax.Hub.Queue(['Typeset', window.MathJax.Hub, document.body]);
      }
    });
  };

  const mathJaxUpdateScript = document.createElement('script');
  mathJaxUpdateScript.setAttribute('type', 'text/javascript');
  mathJaxUpdateScript.innerHTML = `(${mathJaxQueueFn.toString()})();`;
  document.head.appendChild(mathJaxUpdateScript);

  document.body.classList.add('markdown-body');

  let prevText = document.body.innerText;

  render(prevText);

  setInterval(() => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', location.href, true);
    xhr.onload = () => {
      const data = xhr.responseText;
      if (prevText === data) {
        return;
      }
      prevText = data;
      render(data);
    };
    xhr.send();
  }, 1000);
})();
