(function(){
  var panel=document.getElementById('survey-panel');
  if(!panel)return;
  var frame=panel.querySelector('iframe[data-survey-src]');
  function loadForm(){
    if(!panel.open||!frame||frame.getAttribute('src'))return;
    frame.setAttribute('src',frame.getAttribute('data-survey-src'));
  }
  panel.addEventListener('toggle',loadForm);
  loadForm();
})();
