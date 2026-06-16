const copy = (value = '', trigger = () => {}) => {
  // 创建输入框
  const textarea = document.createElement('textarea');
  document.body.appendChild(textarea);
  // 隐藏此输入框
  textarea.style.position = 'absolute';
  textarea.style.clip = 'rect(0 0 0 0)';
  // 赋值
  textarea.value = value;
  // 选中
  textarea.select();
  // 复制
  document.execCommand('copy', true);
  // 移除输入框
  document.body.removeChild(textarea);

  trigger();
};

export default copy;
