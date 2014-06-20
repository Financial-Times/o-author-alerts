'use strict';

var follow = require('./lib/follow');
var user = require('./user');

function FollowButton(rootEl, entity, options) {
	this.rootEl = rootEl;
  this.entity = entity;
	this.init();
}

FollowButton.prototype.init = function() {
  this.render()
  this.btn.addEventListener('click', this.toggleFollowState.bind(this), false);
  if(user.following && user.following.length) {
    this.setInitialState()
  } else {
    document.body.addEventListener('oFollow.userPreferencesLoaded', this.setInitialState.bind(this), false);
  }
}

FollowButton.prototype.render = function() {
  var btn = document.createElement('button');
  var span = document.createElement('span');
  span.innerText = this.entity.name;
  span.className = 'o-follow__name';
  btn.setAttribute('data-o-follow-id', this.entity.id);
  btn.setAttribute('data-o-follow-name', this.entity.name);
  btn.innerText = 'Start Following';
  this.btn = btn;
  this.rootEl.appendChild(span);
  this.rootEl.appendChild(btn);
}

function isBeingFollowed(entity, followingList) {
  var matched = false;
  followingList.forEach(function(following) {
    if(following.id === entity.id) {
      matched = true;
      return;
    }
  });
  return matched;
}

FollowButton.prototype.setInitialState = function(ev) {
  if(isBeingFollowed(this.entity, ev.detail.following)) {
    this.setStateToStop();
  }
}

FollowButton.prototype.toggleFollowState = function(ev) {
  var isCurrentlyFollowing = this.rootEl.getAttribute('data-o-follow-state');
  if(isCurrentlyFollowing) {
    follow.stop(this.entity, user.id )
    this.setStateToStart();
  } else {
    follow.start(this.entity, user.id);
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


module.exports = FollowButton;