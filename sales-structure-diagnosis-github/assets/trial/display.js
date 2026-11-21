
(function(){
  document.documentElement.classList.add('js');
  var more=document.querySelector('.more');
  var mq=window.matchMedia('(min-width:768px)');
  function sync(){if(more&&mq.matches){more.open=true;}}
  sync();
  if(mq.addEventListener){mq.addEventListener('change',sync);}else if(mq.addListener){mq.addListener(sync);}
  var fl=document.getElementById('float');
  var targets=[document.getElementById('hero-cta'),document.getElementById('apply-cta')];
  if(!fl)return;
  if(!('IntersectionObserver' in window)){fl.classList.add('on');return;}
  var seen={};
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){seen[e.target.id]=e.isIntersecting;});
    fl.classList.toggle('on',!seen['hero-cta']&&!seen['apply-cta']);
  });
  targets.forEach(function(t){if(t)io.observe(t);});
})();
