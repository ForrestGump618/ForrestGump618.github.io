const stars = {
  init(url, containerSelector = 'body') {
    const that = this;
    $.getJSON(url)
      .done(function(data) {
        for (const className in data) {
          if (!Object.prototype.hasOwnProperty.call(data, className)) continue;
          const classData = data[className];
          that.render(classData, className, containerSelector);
        }
      })
      .fail(function(jqxhr, textStatus, error) {
        console.error('Failed to load JSON:', textStatus, error);
      });
  },

  render(data, name, containerSelector = 'body') {
    if (!Array.isArray(data) || data.length === 0) return;
    const $container = $(containerSelector);
    if ($container.length === 0) {
      console.warn('Container not found:', containerSelector);
      return;
    }

    // 构造 HTML 字符串，最后一次性 append
    const html = data.map(item => {
      const nickname = this.escapeHtml(item.nickname || '');
      const site = item.site || '';
      const content = this.escapeHtml(item.content || '');
      // 使用 data-site 存储链接，避免内联 onclick
      return `<div class="card" data-site="${this.escapeAttr(site)}">
                <div class="card-header"><div>${nickname}</div></div>
                <div class="card-content"><div>${content}</div></div>
              </div>`;
    }).join('');

    $container.append(html);

    // 通过事件委托处理点击（只绑定一次）
    if (!$container.data('stars-click-bound')) {
      $container.on('click', '.card', function() {
        const url = $(this).data('site');
        if (url) window.open(url, '_blank');
      });
      $container.data('stars-click-bound', true);
    }
  },

  // 简单文本转义
  escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({
      '&': '&amp;',
      '<': '&lt;', '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[s]));
  },

  // 属性值中简单转义双引号
  escapeAttr(str) {
    return String(str).replace(/"/g, '&quot;');
  }
};

// 调用示例（假设页面上有 <div id="stars"></div>）
// stars.init('./allStars.json', '#stars');</':>