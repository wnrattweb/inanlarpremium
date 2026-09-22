(() => {
 'use strict';
 if(document.documentElement.dataset.languageRedirect === 'true') return;
 const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
 const words=JSON.parse($('#ui-words').textContent),config=window.INANLAR_SETTINGS||{};
 document.documentElement.classList.add('js');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let paused=false;try{paused=localStorage.getItem('inanlar-premium-motion')==='off'}catch(_){}
 const motion=$('.motion-toggle'),heroMotion=$('.hero-motion');let timer=null;
 const slides=$$('.hero-slide'),slideButtons=$$('[data-go-slide]');let slideIndex=0;
 function stopSlides(){clearInterval(timer);timer=null}
 function showSlide(index){slideIndex=(index+slides.length)%slides.length;slides.forEach((slide,n)=>{slide.classList.toggle('active',n===slideIndex);slide.setAttribute('aria-hidden',String(n!==slideIndex))});slideButtons.forEach((button,n)=>button.setAttribute('aria-pressed',String(n===slideIndex)))}
 function startSlides(){stopSlides();if(slides.length>1&&!paused&&!reduced.matches&&!document.hidden)timer=setInterval(()=>showSlide(slideIndex+1),8000)}
 function applyMotion(){document.documentElement.classList.toggle('no-motion',paused||reduced.matches);motion.textContent=paused?words.play:words.pause;motion.setAttribute('aria-pressed',String(paused));if(heroMotion){heroMotion.setAttribute('aria-pressed',String(paused));heroMotion.setAttribute('aria-label',paused?words.play:words.pause);heroMotion.textContent=paused?'▷':'Ⅱ'}startSlides()}
 motion.addEventListener('click',()=>{paused=!paused;try{localStorage.setItem('inanlar-premium-motion',paused?'off':'on')}catch(_){}applyMotion()});
 if(heroMotion)heroMotion.addEventListener('click',()=>motion.click());
 reduced.addEventListener('change',applyMotion);document.addEventListener('visibilitychange',startSlides);applyMotion();
 slideButtons.forEach(button=>button.addEventListener('click',()=>{showSlide(Number(button.dataset.goSlide));stopSlides()}));
 const menu=$('#mobile-menu'),toggle=$('.menu-toggle');
 function closeMenu(focus=false){menu.hidden=true;toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label',words.menu);if(focus)toggle.focus()}
 toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';menu.hidden=!open;toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?words.close:words.menu)});
 $$('#mobile-menu a').forEach(a=>a.addEventListener('click',()=>closeMenu()));
 document.addEventListener('click',e=>{if(!menu.hidden&&!menu.contains(e.target)&&!toggle.contains(e.target))closeMenu()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden)closeMenu(true)});
 matchMedia('(min-width:801px)').addEventListener('change',e=>{if(e.matches)closeMenu()});
 const dialogs=$$('dialog');let opener=null;
 function openDialog(dialog,source){opener=source;dialog.showModal();document.body.classList.add('locked');stopSlides()}
 dialogs.forEach(dialog=>{dialog.addEventListener('close',()=>{document.body.classList.remove('locked');if(opener)opener.focus({preventScroll:true});opener=null;startSlides()});dialog.addEventListener('click',e=>{const r=dialog.getBoundingClientRect();if(e.target===dialog&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))dialog.close()})});
 const reservation=$('.reservation-dialog');
 $$('[data-reservation]').forEach(a=>{if(config.bookingUrl&&/^https:\/\//.test(config.bookingUrl)){a.href=config.bookingUrl;a.target='_blank';a.rel='noopener noreferrer'}else a.addEventListener('click',e=>{if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||e.button)return;if(typeof reservation.showModal!=='function')return;e.preventDefault();openDialog(reservation,a)})});
 $('.reservation-close').addEventListener('click',()=>reservation.close());
 const lightbox=$('.lightbox'),lightboxImage=$('#lightbox-image');let group=[],photoIndex=0;
 function showPhoto(index){photoIndex=(index+group.length)%group.length;const a=group[photoIndex];lightboxImage.src=a.href;lightboxImage.alt=a.dataset.caption||'';$('#lightbox-caption').textContent=a.dataset.caption||'';$('#lightbox-counter').textContent=`${photoIndex+1} / ${group.length}`}
 $$('[data-lightbox]').forEach(a=>a.addEventListener('click',e=>{if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||e.button||typeof lightbox.showModal!=='function')return;e.preventDefault();group=$$('[data-lightbox]').filter(x=>x.dataset.lightbox===a.dataset.lightbox&&!x.closest('[hidden]'));showPhoto(group.indexOf(a));openDialog(lightbox,a)}));
 $('.lightbox-close').addEventListener('click',()=>lightbox.close());$('.lightbox-prev').addEventListener('click',()=>showPhoto(photoIndex-1));$('.lightbox-next').addEventListener('click',()=>showPhoto(photoIndex+1));
 lightbox.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();showPhoto(photoIndex+1)}if(e.key==='ArrowLeft'){e.preventDefault();showPhoto(photoIndex-1)}});
 let touchX=null;lightboxImage.addEventListener('touchstart',e=>{touchX=e.changedTouches[0].clientX},{passive:true});lightboxImage.addEventListener('touchend',e=>{if(touchX===null)return;const dx=e.changedTouches[0].clientX-touchX;if(Math.abs(dx)>50)showPhoto(photoIndex+(dx<0?1:-1));touchX=null},{passive:true});
 const filters=$$('[data-filter]');filters.forEach(button=>button.addEventListener('click',()=>{let count=0;filters.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));$$('.gallery-item').forEach(item=>{item.hidden=button.dataset.filter!=='all'&&item.dataset.category!==button.dataset.filter;if(!item.hidden)count++});$('#gallery-status').textContent=`${count} ${words.shown}`}));
 const form=$('#contact-form');if(form)form.addEventListener('submit',e=>{e.preventDefault();if(!form.reportValidity())return;const fields=new FormData(form);const body=`${words.name}: ${fields.get('name')}\n${words.email}: ${fields.get('email')}\n${words.phone}: ${fields.get('phone')||'—'}\n\n${fields.get('body')}`;const url='mailto:'+config.email+'?subject='+encodeURIComponent(words.subject)+'&body='+encodeURIComponent(body);const a=document.createElement('a');a.href=url;a.hidden=true;document.body.appendChild(a);a.click();a.remove();const status=$('#form-status');status.hidden=false;status.textContent=words.formOpened;});
 const map=$('[data-load-map]');if(map)map.addEventListener('click',()=>{const shell=map.closest('[data-map-src]'),frame=document.createElement('iframe');frame.src=shell.dataset.mapSrc;frame.title='İnanlar Premium · Uzungöl';frame.loading='lazy';frame.allowFullscreen=true;frame.referrerPolicy='no-referrer-when-downgrade';shell.replaceChildren(frame)});
 if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.remove('waiting');observer.unobserve(entry.target)}}),{threshold:.05});$$('.reveal').forEach(el=>{if(el.getBoundingClientRect().top>innerHeight)el.classList.add('waiting');observer.observe(el)})}
 $$('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
})();
