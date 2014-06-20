
function createWrapper() {
	var wrapper = document.createElement('div');
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
  btn.setAttribute('data-o-follow-id', entity.id);
  btn.setAttribute('data-o-follow-name', entity.name);
  btn.innerText = 'Start Following';
  return btn;
}

exports.render = function(rootEl, entity) {
	var wrapper = createWrapper();
	wrapper.appendChild(createNameSpan(entity.name));
	wrapper.appendChild(createButton(entity));
	rootEl.appendChild(wrapper);
	return wrapper;
}
