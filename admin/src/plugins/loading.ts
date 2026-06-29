// @unocss-include
import { getRgbOfColor } from '@sa/utils';
import { $t } from '@/locales';
import { localStg } from '@/utils/storage';
import systemLogo from '@/assets/svg-icon/logo.svg?raw';

export function setupLoading() {
  const themeColor = localStg.get('themeColor') || '#646cff';
  const themeSettings = localStg.get('themeSettings');
  const isDark =
    themeSettings?.themeScheme === 'dark' ||
    (themeSettings?.themeScheme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const { r, g, b } = getRgbOfColor(themeColor);

  const primaryColor = `--primary-color: ${r} ${g} ${b}`;

  const bgColor = isDark ? 'background:#18181c;' : '';
  const textColor = isDark ? 'color:rgba(255,255,255,0.82);' : 'color:#646464;';

  const loadingClasses = [
    'left-0 top-0',
    'left-0 bottom-0 animate-delay-500',
    'right-0 top-0 animate-delay-1000',
    'right-0 bottom-0 animate-delay-1500'
  ];

  const logoWithClass = systemLogo.replace('<svg', `<svg class="size-128px text-primary"`);

  const dot = loadingClasses
    .map(item => {
      return `<div class="absolute w-16px h-16px bg-primary rounded-8px animate-pulse ${item}"></div>`;
    })
    .join('\n');

  const loading = `
<div class="fixed-center flex-col" style="${primaryColor}${bgColor}">
  ${logoWithClass}
  <div class="w-56px h-56px my-36px">
    <div class="relative h-full animate-spin">
      ${dot}
    </div>
  </div>
  <h2 class="text-28px" style="${textColor};font-family:'Playwrite DE Grund',cursive">ChatCafe Admin</h2>
</div>`;

  const app = document.getElementById('app');

  if (app) {
    app.innerHTML = loading;
  }
}
