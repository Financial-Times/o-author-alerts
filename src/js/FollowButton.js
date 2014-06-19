'use strict';

var Follow = require('./Follow');


function FollowButton(rootEl) {
	this.rootEl = rootEl;
  this.btn = null;
  this.follow = null;
	this.init();
}

FollowButton.prototype.init = function() {
	console.log('init for ', this.rootEl);
  this.btn = this.rootEl.querySelector('[data-o-follow-id]');
  this.btn.addEventListener('click', this.toggleFollowState.bind(this), false);
  this.follow = new Follow(this.btn.getAttribute('data-o-follow-id'),
     this.btn.getAttribute('data-o-follow-name'));
}

FollowButton.prototype.toggleFollowState = function(ev) {
  var isCurrentlyFollowing = this.rootEl.getAttribute('data-o-follow-state');
  if(isCurrentlyFollowing) {
    this.follow.stop();
    this.setStateToStart();
  } else {
    this.follow.start();
    this.setStateToStop();
  }
}   

FollowButton.prototype.setStateToStart = function() {
  this.btn.innerText = "Start Following";
  this.rootEl.setAttribute('data-o-follow-state', true);
}

FollowButton.prototype.setStateToStop = function() {
  this.btn.innerText = "Stop Following";
  this.rootEl.setAttribute('data-o-follow-state', false);

}



FollowButton.prototype.createAllIn = function(el){
	var followButtons = [], fEls, c, l;
  el = el || document.body;
  if (el.querySelectorAll) {
      fEls = el.querySelectorAll('[data-o-component=o-follow]');
      for (c = 0, l = fEls.length; c < l; c++) {
          if (!fEls[c].classList.contains('o-follow--js')) {
              followButtons.push(new FollowButton(fEls[c]));
          }
      }
  }
  return followButtons;
};


module.exports = FollowButton;