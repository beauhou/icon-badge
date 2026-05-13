import {
  buildEmbedCodes,
  buildBadgeUrl,
  optionsFromSearch,
  renderBadgeSvg,
} from './badge-core.js';

const form = document.querySelector('[data-badge-form]');
const preview = document.querySelector('[data-preview]');
const svgCode = document.querySelector('[data-svg-code]');
const markdownCode = document.querySelector('[data-markdown-code]');
const htmlCode = document.querySelector('[data-html-code]');
const urlCode = document.querySelector('[data-url-code]');
const dataUriCode = document.querySelector('[data-data-uri-code]');
const copyButtons = document.querySelectorAll('[data-copy]');
const downloadButton = document.querySelector('[data-download]');

function getFormOptions() {
  return Object.fromEntries(new FormData(form).entries());
}

function setInitialValues() {
  const options = optionsFromSearch(window.location.search);
  for (const [key, value] of Object.entries(options)) {
    const field = form.elements.namedItem(key);
    if (field) field.value = value;
  }
}

function updatePreview() {
  const options = getFormOptions();
  const svg = renderBadgeSvg(options);
  const staticSvgUrl = `${window.location.origin}${window.location.pathname.replace(/\/?$/, '/')}icon-badge.svg`;
  const generatorUrl = buildBadgeUrl(window.location.href.split('?')[0], options);
  const embed = buildEmbedCodes(staticSvgUrl, options);

  preview.innerHTML = svg;
  svgCode.value = svg;
  markdownCode.value = embed.markdownDataUri;
  htmlCode.value = embed.htmlDataUri;
  dataUriCode.value = embed.dataUri;
  urlCode.value = generatorUrl;
  window.history.replaceState(null, '', `?${generatorUrl.split('?')[1]}`);
}

async function copyValue(target) {
  const element = document.querySelector(`[data-${target}-code]`);
  await navigator.clipboard.writeText(element.value);
}

function downloadSvg() {
  const blob = new Blob([svgCode.value], { type: 'image/svg+xml;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'icon-badge.svg';
  link.click();
  URL.revokeObjectURL(link.href);
}

setInitialValues();
updatePreview();

form.addEventListener('input', updatePreview);
downloadButton.addEventListener('click', downloadSvg);
copyButtons.forEach((button) => {
  button.addEventListener('click', async () => {
    await copyValue(button.dataset.copy);
    button.textContent = '已复制';
    setTimeout(() => {
      button.textContent = button.dataset.label;
    }, 1200);
  });
});
