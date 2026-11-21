
(function(){
  var debug=/[?&]lpdebug=1/.test(location.search);
  var fired={},maxScroll=0,sectionsSeen=0,engaged=0,lastSig="";
  function send(name,p,once){
    if(once){if(fired[once])return;fired[once]=1;}
    p=p||{};
    if(debug&&window.console)console.log("[LP計測]",name,JSON.stringify(p));
    try{if(window.gtag)gtag("event",name,p);else window.dataLayer.push(Object.assign({event:name},p));}catch(e){}
    try{if(window.fbq)fbq("trackCustom",name,p);}catch(e){}
  }
  if(debug&&window.console)console.log("[LP計測] 有効:","GA4="+(window.gtag?"on":"off"),"Pixel="+(window.fbq?"on":"off"));
  var secs=[].slice.call(document.querySelectorAll("section[aria-labelledby]"));
  function nameOf(s){return s.getAttribute("aria-labelledby").replace(/-h$/,"");}
  function noOf(name){for(var i=0;i<secs.length;i++){if(nameOf(secs[i])===name)return i+1;}return 0;}
  function secNameOf(el){var s=el&&el.closest?el.closest("section[aria-labelledby]"):null;return s?nameOf(s):"";}
  /* 1) どの区切りまで読まれたか（画面の上から6割に区切りの先頭が入ったら「見た」） */
  if("IntersectionObserver" in window){
    var so=new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(!e.isIntersecting)return;
        so.unobserve(e.target);
        var n=nameOf(e.target);sectionsSeen++;
        send("lp_section_view",{section:n,section_no:noOf(n)},"sec_"+n);
      });
    },{threshold:0,rootMargin:"0px 0px -40% 0px"});
    secs.forEach(function(s){so.observe(s);});
  }
  /* 2) スクロールの深さ */
  var ticking=false;
  function onScroll(){
    if(ticking)return;ticking=true;
    requestAnimationFrame(function(){
      ticking=false;
      var h=document.documentElement.scrollHeight||1;
      var pct=Math.round((window.pageYOffset+window.innerHeight)/h*100);
      if(pct>maxScroll)maxScroll=pct;
      [25,50,75,90].forEach(function(t){if(pct>=t)send("lp_scroll",{percent:t},"scr_"+t);});
    });
  }
  window.addEventListener("scroll",onScroll,{passive:true});
  onScroll();
  /* 3) 申込ボタンのクリック（どの位置のボタンか） */
  document.addEventListener("click",function(ev){
    var a=ev.target&&ev.target.closest?ev.target.closest("a.cta"):null;
    if(!a)return;
    var pos=a.closest(".float")?"float":(a.closest("header")?"header":(secNameOf(a)||"other"));
    send("lp_cta_click",{cta_position:pos,section_no:noOf(pos),transport_type:"beacon"});
  },true);
  /* 4) よくある質問を開いたか／「ほかの方の声を読む」を開いたか */
  [].forEach.call(document.querySelectorAll('section[aria-labelledby="ask-h"] details'),function(d,i){
    d.addEventListener("toggle",function(){
      if(!d.open)return;
      var q=d.querySelector("summary");
      send("lp_faq_open",{faq_no:i+1,faq:q?q.textContent.replace(/\s+/g," ").trim().slice(0,40):""},"faq_"+i);
    });
  });
  var more=document.querySelector("details.more > summary");
  if(more)more.addEventListener("click",function(){send("lp_more_voices_click",{},"more");});
  /* 5) 画面を開いていた秒数（見えている間だけ数える） */
  setInterval(function(){
    if(document.visibilityState!=="visible")return;
    engaged++;
    if(engaged===30||engaged===60||engaged===120)send("lp_engaged",{seconds:engaged},"eng_"+engaged);
  },1000);
  /* 6) 離れる時のまとめ（1回の訪問で複数出ることがある。集計は訪問ごとの最大値を使う） */
  function leave(){
    if(!(maxScroll>0||engaged>0))return;
    var sig=maxScroll+"_"+sectionsSeen+"_"+engaged;
    if(sig===lastSig)return;lastSig=sig;
    send("lp_exit",{max_scroll:Math.min(maxScroll,100),sections_seen:sectionsSeen,engaged_sec:engaged,transport_type:"beacon"});
  }
  document.addEventListener("visibilitychange",function(){if(document.visibilityState==="hidden")leave();});
  window.addEventListener("pagehide",leave);
})();
