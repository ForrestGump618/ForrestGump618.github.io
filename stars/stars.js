var stars = {
  init: function(url) {
    var that = this;
    $(function() {  // DOM ready
      $.getJSON(url, function(data){
        for(var className in data){
          var classData = data[className];
          that.render(classData, className);
        }
      });
    });
  },
  render: function(data, name) {
    var nickname, site, content, li = "";
    for (var i = 0; i < data.length; i++) {
      nickname = data[i].nickname;
      site = data[i].site;
      content = data[i].content;
      li += '<div class="card" onclick="window.open(\'' + site +'\')">' +
              '<div class="card-header"><div>' + nickname + '</div></div>' +
              '<div class="card-content"><div>' + content + '</div></div>' +
            '</div>';
    }
    $('.' + name).append(li);  // 加上 . 选择器
  }
}

// 调用初始化
stars.init("./allStars.json");
