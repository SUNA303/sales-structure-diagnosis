(function(){
  var keys=['utm_source','utm_medium','utm_campaign','utm_content','utm_term','utm_id','fbclid','gclid'];
  var params=new URLSearchParams(window.location.search),saved={};
  try{saved=JSON.parse(sessionStorage.getItem('trial_referrals')||'{}');}catch(e){}
  keys.forEach(function(key){var value=params.get(key);if(value)saved[key]=value.slice(0,500);});
  try{sessionStorage.setItem('trial_referrals',JSON.stringify(saved));}catch(e){}
  document.querySelectorAll('a[data-referral], a.cta').forEach(function(link){
    var href=link.getAttribute('href');if(!href||href.indexOf('{{')!==-1||href.charAt(0)==='#')return;
    var target=new URL(href,window.location.href);
    if(target.origin!==location.origin&&target.hostname!=='timerex.net')return;
    keys.forEach(function(key){if(saved[key])target.searchParams.set(key,saved[key]);});
    link.href=target.href;
  });
})();
