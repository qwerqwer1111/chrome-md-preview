import * as hljs from 'highlight.js';
import * as MarkdownIt from 'markdown-it';
import './main.css';

const MATH_JAX_CONFIG: MathJax.Config = {
  showMathMenu: false,
  showProcessingMessages: false,
  messageStyle: 'none',
  displayAlign: 'left',
  displayIndent: '2em',
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

interface Attribute {
  qualifiedName: string;
  value: string;
}

class ElementBuilder {
  private tagName: string;
  private attributes: Attribute[];
  private innerHTML?: string;

  constructor(tagName: string) {
    this.tagName = tagName;
    this.attributes = [];
  }

  addAttribute(qualifiedName: string, value: string): ElementBuilder {
    this.attributes.push({ qualifiedName, value });
    return this;
  }

  withInnerHTML(innerHTML: string): ElementBuilder {
    this.innerHTML = innerHTML;
    return this;
  }

  appendTo(node: Node) {
    const e = document.createElement(this.tagName);
    this.attributes.forEach(a => e.setAttribute(a.qualifiedName, a.value));
    if (this.innerHTML) {
      e.innerText = this.innerHTML;
    }
    node.appendChild(e);
  }
}

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
  new ElementBuilder('script')
    .addAttribute('type', 'text/x-mathjax-config')
    .withInnerHTML(`MathJax.Hub.Config(${JSON.stringify(MATH_JAX_CONFIG)});`)
    .appendTo(document.head);

  new ElementBuilder('script')
    .addAttribute('type', 'text/javascript')
    .addAttribute(
      'src', chrome.extension.getURL('js/mathjax/MathJax.js?config=TeX-AMS-MML_HTMLorMML'))
    .appendTo(document.head);

  const mathJaxQueueFn = () => {
    document.body.addEventListener('MarkdownUpdated', () => {
      if (typeof window.MathJax !== 'undefined' && typeof window.MathJax.Hub !== 'undefined') {
        window.MathJax.Hub.Queue(['Typeset', window.MathJax.Hub, document.body]);
      }
    });
  };

  new ElementBuilder('script')
    .addAttribute('type', 'text/javascript')
    .withInnerHTML(`(${mathJaxQueueFn.toString()})();`)
    .appendTo(document.head);

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
