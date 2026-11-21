
window.LP_TRACK={ga4:"",pixel:""};
(function(){
  var c=window.LP_TRACK;
  function ok(v){return !!v&&v.indexOf("{{")!==0;}
  window.dataLayer=window.dataLayer||[];
  if(ok(c.ga4)){
    var g=document.createElement("script");g.async=true;
    g.src="https://www.googletagmanager.com/gtag/js?id="+encodeURIComponent(c.ga4);
    document.head.appendChild(g);
    window.gtag=function(){window.dataLayer.push(arguments);};
    gtag("js",new Date());gtag("config",c.ga4);
  }
  if(ok(c.pixel)){
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version="2.0";n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,"script","https://connect.facebook.net/en_US/fbevents.js");
    fbq("init",c.pixel);fbq("track","PageView");
  }
})();
