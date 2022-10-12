/**
 * click 2022/10/12.
 */
//*========== 折叠菜单 ============*//
$(function(){
  function expandMenu(){
      var $this = $(this),
          $inner = $this.next('.js_categoryInner'),
          $page = $this.parents('.page'),
          $parent = $(this).parent('li');
      var innerH = $inner.data('height');
      if(!innerH){
          $inner.css('height', 'auto');
          innerH = $inner.height();
          $inner.removeAttr('style');
          $inner.data('height', innerH);
      }
      if($parent.hasClass('js_show')){
          $parent.removeClass('js_show');
          $this.attr('aria-expanded','false');
          $this.children('img').attr('alt',' 展开');
          $inner.attr('aria-hidden','true');
          $('.js_item', $(this).siblings()).attr('tabindex','-1');
      }else{
          $parent.siblings().removeClass('js_show');
          $parent.siblings().children('.js_category').attr('aria-expanded','false');
          $parent.siblings().children('.js_category img').attr('alt',' 展开');
          $parent.siblings().children('.js_categoryInner').attr('aria-hidden','true');
          $('.js_item', $parent.siblings().children('.js_categoryInner')).attr('tabindex','-1');

          $parent.addClass('js_show');
          $this.attr('aria-expanded','true');
          $this.children('img').attr('alt',' 收起');
          $inner.attr('aria-hidden','false');
          $('.js_item', $(this).siblings()).attr('tabindex','0');
      }
  }
  $('.js_category').attr('tabindex','0');
  $('.js_item').attr('tabindex','0');
  $('.js_item', $('.js_category').siblings()).attr('tabindex','-1');
  $('.js_category').on('click', function(){
    $(this).attr('aria-live','assertive');
    expandMenu.call(this);
  });
  $('.js_category').on('keydown', function(event) {
    if (event.keyCode === 13) {
        expandMenu.call(this);
    }
  });
  //*========== 头像随机1、2 ============*//
  $('.weui_head-box').prepend('<img class="weui-img" data-lazy-src="./images/'+ (parseInt(Math.random()*2)+ 1) +'.png" alt="">');
    lazyLoadInit({
    coverColor:"",
    coverDiv:"",
    offsetBottom:0,
    offsetTopm:0,
    showTime:1100,
  });
  //*========== 复制  ============*//
  var $weuicopy = $('.weui_copy');
  var clipboard2 = new ClipboardJS('.weui-copy_box'); 
  clipboard2.on('success', function(e) {
    $weuicopy.text('Copied!');
    var $toast = $('#toast');
    if ($toast.css('display') != 'none') return;
    $toast.fadeIn(100);
    setTimeout(function () {
        $toast.fadeOut(100);
        $weuicopy.text('Copy');
    }, 2000);
  });
  clipboard2.on('error', function(e) {
    alert("复制失败！请手动复制")
  });
  //*========== title ============*//
  if(/Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent)) {document.title = '';}else{document.title = '孙洋';}
  //*========== 分享 ============*//
  var $iosActionsheet = $('#iosActionsheet');
  var $showIOSActionSheet = $('#showIOSActionSheet');
  var $iosMask = $('#iosMask');
  var pageUrl = window.document.location.href;
  function hideActionSheet() {
    $iosActionsheet.removeClass('js_dialog_opacity').attr('aria-hidden','true').fadeOut(180);
    $iosMask.fadeOut(180);
    $('#showIOSActionSheet').trigger('focus');
  }
  $iosMask.on('click', hideActionSheet);
  $('.weui-wa-hotarea').on('click', hideActionSheet);
  $showIOSActionSheet.on("click", function(){
    if (navigator.share) {
        navigator.share({
        text: '',
        url: pageUrl });
    }else {
      $iosActionsheet.attr('aria-hidden','false').addClass('js_dialog_opacity').fadeIn(180);
      $iosMask.fadeIn(180);
    }
  });
  //*===========  关闭  ===============*// 
  $(function(){
    var $warnToast = $('#warnToast');
    $('#showWarnToast').on('click', function(){
        if ($warnToast.css('display') != 'none') return;
        $warnToast.fadeIn(100);
        setTimeout(function () {
            $warnToast.fadeOut(100);
        }, 2000);
    });
  });
  //*============ 间隔动画  ==============*//
  var scrollTip = document.querySelector('.weui-share-main');
  scrollTip.classList.add('shake-vertical');
  scrollTip.addEventListener('animationend',function(){
  scrollTip.classList.remove('shake-vertical');
  setTimeout(function(){
    scrollTip.classList.add('shake-vertical');
    },1500)
  })
});
//*========== 禁止右键、选取 ============*//
document.oncontextmenu = function(){event.returnValue = false;};
document.oncontextmenu = function(){return false;};
document.onselectstart = function(){event.returnValue = false;};
document.onselectstart = function(){return false;};
// document.oncopy = function(){event.returnValue = false;};
// document.oncopy = function(){return false;};
//*========== 分享、weibo、Qzone ============*//
function shareToSinaWB(event){
  event.preventDefault();
  var _shareUrl = 'http://service.weibo.com/share/share.php?';    
      _shareUrl += '&url='+ window.location.href;     
      _shareUrl += '&appkey=' + "孙洋";
      _shareUrl += '&title=' +  $(".weui-signature").text();    
      _shareUrl += '&content=' + 'utf-8';   
      _shareUrl += '&pic=' + "https://link.sunyang.vip/images/2.png";  
      window.open(_shareUrl,'_blank');
};
function shareToQzone(event){
  event.preventDefault();
  var _shareUrl = 'https://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?';
      _shareUrl += 'url=' + window.location.href;  
      _shareUrl += '&showcount=' + 0 ; 
      _shareUrl += '&title=' + $(".weui-signature").text();
      _shareUrl += '&site=' + "孙洋";  
        _shareUrl += '&content=' + "utf-8";   
      _shareUrl += '&pics=' + "https://link.sunyang.vip/images/2.png";    
      window.open(_shareUrl,'_blank');
};