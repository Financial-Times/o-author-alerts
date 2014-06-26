'use strict';

function createWrapper(tagName) {
	var wrapper = document.createElement(tagName);
	wrapper.className = 'o-follow__entity';
	return wrapper;
}

function createNameSpan(name){
 	var span = document.createElement('span');
  span.innerText = name;
  span.className = 'o-follow__name';
  return span;
}

function createButton(entity) {
	var btn = document.createElement('button');
  btn.className = 'o-follow__button';
  btn.setAttribute('data-o-follow-id', entity.id);
  btn.setAttribute('data-o-follow-name', entity.name);
  btn.innerText = 'Start Following';
  return btn;
}

exports.render = function(rootEl, entity) {
	var tagName = rootEl.tagName === ('UL') ? 'li' : 'div';
	var wrapper = createWrapper(tagName);
	wrapper.appendChild(createNameSpan(entity.name));
	wrapper.appendChild(createButton(entity));
	rootEl.appendChild(wrapper);
	return wrapper;
};
