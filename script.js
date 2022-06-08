(function(){
    var script = {
 "scripts": {
  "pauseGlobalAudio": function(audio){  var audios = window.currentGlobalAudios; if(audios){ audio = audios[audio.get('id')]; } if(audio.get('state') == 'playing') audio.pause(); },
  "isCardboardViewMode": function(){  var players = this.getByClassName('PanoramaPlayer'); return players.length > 0 && players[0].get('viewMode') == 'cardboard'; },
  "getCurrentPlayers": function(){  var players = this.getByClassName('PanoramaPlayer'); players = players.concat(this.getByClassName('VideoPlayer')); players = players.concat(this.getByClassName('Video360Player')); players = players.concat(this.getByClassName('PhotoAlbumPlayer')); return players; },
  "updateMediaLabelFromPlayList": function(playList, htmlText, playListItemStopToDispose){  var changeFunction = function(){ var index = playList.get('selectedIndex'); if(index >= 0){ var beginFunction = function(){ playListItem.unbind('begin', beginFunction); setMediaLabel(index); }; var setMediaLabel = function(index){ var media = playListItem.get('media'); var text = media.get('data'); if(!text) text = media.get('label'); setHtml(text); }; var setHtml = function(text){ if(text !== undefined) { htmlText.set('html', '<div style=\"text-align:left\"><SPAN STYLE=\"color:#FFFFFF;font-size:12px;font-family:Verdana\"><span color=\"white\" font-family=\"Verdana\" font-size=\"12px\">' + text + '</SPAN></div>'); } else { htmlText.set('html', ''); } }; var playListItem = playList.get('items')[index]; if(htmlText.get('html')){ setHtml('Loading...'); playListItem.bind('begin', beginFunction); } else{ setMediaLabel(index); } } }; var disposeFunction = function(){ htmlText.set('html', undefined); playList.unbind('change', changeFunction, this); playListItemStopToDispose.unbind('stop', disposeFunction, this); }; if(playListItemStopToDispose){ playListItemStopToDispose.bind('stop', disposeFunction, this); } playList.bind('change', changeFunction, this); changeFunction(); },
  "playGlobalAudioWhilePlay": function(playList, index, audio, endCallback){  var changeFunction = function(event){ if(event.data.previousSelectedIndex == index){ this.stopGlobalAudio(audio); if(isPanorama) { var media = playListItem.get('media'); var audios = media.get('audios'); audios.splice(audios.indexOf(audio), 1); media.set('audios', audios); } playList.unbind('change', changeFunction, this); if(endCallback) endCallback(); } }; var audios = window.currentGlobalAudios; if(audios && audio.get('id') in audios){ audio = audios[audio.get('id')]; if(audio.get('state') != 'playing'){ audio.play(); } return audio; } playList.bind('change', changeFunction, this); var playListItem = playList.get('items')[index]; var isPanorama = playListItem.get('class') == 'PanoramaPlayListItem'; if(isPanorama) { var media = playListItem.get('media'); var audios = (media.get('audios') || []).slice(); if(audio.get('class') == 'MediaAudio') { var panoramaAudio = this.rootPlayer.createInstance('PanoramaAudio'); panoramaAudio.set('autoplay', false); panoramaAudio.set('audio', audio.get('audio')); panoramaAudio.set('loop', audio.get('loop')); panoramaAudio.set('id', audio.get('id')); var stateChangeFunctions = audio.getBindings('stateChange'); for(var i = 0; i<stateChangeFunctions.length; ++i){ var f = stateChangeFunctions[i]; if(typeof f == 'string') f = new Function('event', f); panoramaAudio.bind('stateChange', f, this); } audio = panoramaAudio; } audios.push(audio); media.set('audios', audios); } return this.playGlobalAudio(audio, endCallback); },
  "getPlayListItems": function(media, player){  var itemClass = (function() { switch(media.get('class')) { case 'Panorama': case 'LivePanorama': case 'HDRPanorama': return 'PanoramaPlayListItem'; case 'Video360': return 'Video360PlayListItem'; case 'PhotoAlbum': return 'PhotoAlbumPlayListItem'; case 'Map': return 'MapPlayListItem'; case 'Video': return 'VideoPlayListItem'; } })(); if (itemClass != undefined) { var items = this.getByClassName(itemClass); for (var i = items.length-1; i>=0; --i) { var item = items[i]; if(item.get('media') != media || (player != undefined && item.get('player') != player)) { items.splice(i, 1); } } return items; } else { return []; } },
  "setPanoramaCameraWithSpot": function(playListItem, yaw, pitch){  var panorama = playListItem.get('media'); var newCamera = this.cloneCamera(playListItem.get('camera')); var initialPosition = newCamera.get('initialPosition'); initialPosition.set('yaw', yaw); initialPosition.set('pitch', pitch); this.startPanoramaWithCamera(panorama, newCamera); },
  "playGlobalAudio": function(audio, endCallback){  var endFunction = function(){ audio.unbind('end', endFunction, this); this.stopGlobalAudio(audio); if(endCallback) endCallback(); }; audio = this.getGlobalAudio(audio); var audios = window.currentGlobalAudios; if(!audios){ audios = window.currentGlobalAudios = {}; } audios[audio.get('id')] = audio; if(audio.get('state') == 'playing'){ return audio; } if(!audio.get('loop')){ audio.bind('end', endFunction, this); } audio.play(); return audio; },
  "setStartTimeVideo": function(video, time){  var items = this.getPlayListItems(video); var startTimeBackup = []; var restoreStartTimeFunc = function() { for(var i = 0; i<items.length; ++i){ var item = items[i]; item.set('startTime', startTimeBackup[i]); item.unbind('stop', restoreStartTimeFunc, this); } }; for(var i = 0; i<items.length; ++i) { var item = items[i]; var player = item.get('player'); if(player.get('video') == video && player.get('state') == 'playing') { player.seek(time); } else { startTimeBackup.push(item.get('startTime')); item.set('startTime', time); item.bind('stop', restoreStartTimeFunc, this); } } },
  "syncPlaylists": function(playLists){  var changeToMedia = function(media, playListDispatched){ for(var i = 0, count = playLists.length; i<count; ++i){ var playList = playLists[i]; if(playList != playListDispatched){ var items = playList.get('items'); for(var j = 0, countJ = items.length; j<countJ; ++j){ if(items[j].get('media') == media){ if(playList.get('selectedIndex') != j){ playList.set('selectedIndex', j); } break; } } } } }; var changeFunction = function(event){ var playListDispatched = event.source; var selectedIndex = playListDispatched.get('selectedIndex'); if(selectedIndex < 0) return; var media = playListDispatched.get('items')[selectedIndex].get('media'); changeToMedia(media, playListDispatched); }; var mapPlayerChangeFunction = function(event){ var panoramaMapLocation = event.source.get('panoramaMapLocation'); if(panoramaMapLocation){ var map = panoramaMapLocation.get('map'); changeToMedia(map); } }; for(var i = 0, count = playLists.length; i<count; ++i){ playLists[i].bind('change', changeFunction, this); } var mapPlayers = this.getByClassName('MapPlayer'); for(var i = 0, count = mapPlayers.length; i<count; ++i){ mapPlayers[i].bind('panoramaMapLocation_change', mapPlayerChangeFunction, this); } },
  "pauseGlobalAudiosWhilePlayItem": function(playList, index, exclude){  var self = this; var item = playList.get('items')[index]; var media = item.get('media'); var player = item.get('player'); var caller = media.get('id'); var endFunc = function(){ if(playList.get('selectedIndex') != index) { if(hasState){ player.unbind('stateChange', stateChangeFunc, self); } self.resumeGlobalAudios(caller); } }; var stateChangeFunc = function(event){ var state = event.data.state; if(state == 'stopped'){ this.resumeGlobalAudios(caller); } else if(state == 'playing'){ this.pauseGlobalAudios(caller, exclude); } }; var mediaClass = media.get('class'); var hasState = mediaClass == 'Video360' || mediaClass == 'Video'; if(hasState){ player.bind('stateChange', stateChangeFunc, this); } this.pauseGlobalAudios(caller, exclude); this.executeFunctionWhenChange(playList, index, endFunc, endFunc); },
  "shareFacebook": function(url){  window.open('https://www.facebook.com/sharer/sharer.php?u=' + url, '_blank'); },
  "getMediaHeight": function(media){  switch(media.get('class')){ case 'Video360': var res = media.get('video'); if(res instanceof Array){ var maxH=0; for(var i=0; i<res.length; i++){ var r = res[i]; if(r.get('height') > maxH) maxH = r.get('height'); } return maxH; }else{ return r.get('height') } default: return media.get('height'); } },
  "shareWhatsapp": function(url){  window.open('https://api.whatsapp.com/send/?text=' + encodeURIComponent(url), '_blank'); },
  "pauseCurrentPlayers": function(onlyPauseCameraIfPanorama){  var players = this.getCurrentPlayers(); var i = players.length; while(i-- > 0){ var player = players[i]; if(player.get('state') == 'playing') { if(onlyPauseCameraIfPanorama && player.get('class') == 'PanoramaPlayer' && typeof player.get('video') === 'undefined'){ player.pauseCamera(); } else { player.pause(); } } else { players.splice(i, 1); } } return players; },
  "playAudioList": function(audios){  if(audios.length == 0) return; var currentAudioCount = -1; var currentAudio; var playGlobalAudioFunction = this.playGlobalAudio; var playNext = function(){ if(++currentAudioCount >= audios.length) currentAudioCount = 0; currentAudio = audios[currentAudioCount]; playGlobalAudioFunction(currentAudio, playNext); }; playNext(); },
  "getPlayListItemByMedia": function(playList, media){  var items = playList.get('items'); for(var j = 0, countJ = items.length; j<countJ; ++j){ var item = items[j]; if(item.get('media') == media) return item; } return undefined; },
  "showPopupImage": function(image, toggleImage, customWidth, customHeight, showEffect, hideEffect, closeButtonProperties, autoCloseMilliSeconds, audio, stopBackgroundAudio, loadedCallback, hideCallback){  var self = this; var closed = false; var playerClickFunction = function() { zoomImage.unbind('loaded', loadedFunction, self); hideFunction(); }; var clearAutoClose = function(){ zoomImage.unbind('click', clearAutoClose, this); if(timeoutID != undefined){ clearTimeout(timeoutID); } }; var resizeFunction = function(){ setTimeout(setCloseButtonPosition, 0); }; var loadedFunction = function(){ self.unbind('click', playerClickFunction, self); veil.set('visible', true); setCloseButtonPosition(); closeButton.set('visible', true); zoomImage.unbind('loaded', loadedFunction, this); zoomImage.bind('userInteractionStart', userInteractionStartFunction, this); zoomImage.bind('userInteractionEnd', userInteractionEndFunction, this); zoomImage.bind('resize', resizeFunction, this); timeoutID = setTimeout(timeoutFunction, 200); }; var timeoutFunction = function(){ timeoutID = undefined; if(autoCloseMilliSeconds){ var autoCloseFunction = function(){ hideFunction(); }; zoomImage.bind('click', clearAutoClose, this); timeoutID = setTimeout(autoCloseFunction, autoCloseMilliSeconds); } zoomImage.bind('backgroundClick', hideFunction, this); if(toggleImage) { zoomImage.bind('click', toggleFunction, this); zoomImage.set('imageCursor', 'hand'); } closeButton.bind('click', hideFunction, this); if(loadedCallback) loadedCallback(); }; var hideFunction = function() { self.MainViewer.set('toolTipEnabled', true); closed = true; if(timeoutID) clearTimeout(timeoutID); if (timeoutUserInteractionID) clearTimeout(timeoutUserInteractionID); if(autoCloseMilliSeconds) clearAutoClose(); if(hideCallback) hideCallback(); zoomImage.set('visible', false); if(hideEffect && hideEffect.get('duration') > 0){ hideEffect.bind('end', endEffectFunction, this); } else{ zoomImage.set('image', null); } closeButton.set('visible', false); veil.set('visible', false); self.unbind('click', playerClickFunction, self); zoomImage.unbind('backgroundClick', hideFunction, this); zoomImage.unbind('userInteractionStart', userInteractionStartFunction, this); zoomImage.unbind('userInteractionEnd', userInteractionEndFunction, this, true); zoomImage.unbind('resize', resizeFunction, this); if(toggleImage) { zoomImage.unbind('click', toggleFunction, this); zoomImage.set('cursor', 'default'); } closeButton.unbind('click', hideFunction, this); self.resumePlayers(playersPaused, audio == null || stopBackgroundAudio); if(audio){ if(stopBackgroundAudio){ self.resumeGlobalAudios(); } self.stopGlobalAudio(audio); } }; var endEffectFunction = function() { zoomImage.set('image', null); hideEffect.unbind('end', endEffectFunction, this); }; var toggleFunction = function() { zoomImage.set('image', isToggleVisible() ? image : toggleImage); }; var isToggleVisible = function() { return zoomImage.get('image') == toggleImage; }; var setCloseButtonPosition = function() { var right = zoomImage.get('actualWidth') - zoomImage.get('imageLeft') - zoomImage.get('imageWidth') + 10; var top = zoomImage.get('imageTop') + 10; if(right < 10) right = 10; if(top < 10) top = 10; closeButton.set('right', right); closeButton.set('top', top); }; var userInteractionStartFunction = function() { if(timeoutUserInteractionID){ clearTimeout(timeoutUserInteractionID); timeoutUserInteractionID = undefined; } else{ closeButton.set('visible', false); } }; var userInteractionEndFunction = function() { if(!closed){ timeoutUserInteractionID = setTimeout(userInteractionTimeoutFunction, 300); } }; var userInteractionTimeoutFunction = function() { timeoutUserInteractionID = undefined; closeButton.set('visible', true); setCloseButtonPosition(); }; this.MainViewer.set('toolTipEnabled', false); var veil = this.veilPopupPanorama; var zoomImage = this.zoomImagePopupPanorama; var closeButton = this.closeButtonPopupPanorama; if(closeButtonProperties){ for(var key in closeButtonProperties){ closeButton.set(key, closeButtonProperties[key]); } } var playersPaused = this.pauseCurrentPlayers(audio == null || !stopBackgroundAudio); if(audio){ if(stopBackgroundAudio){ this.pauseGlobalAudios(); } this.playGlobalAudio(audio); } var timeoutID = undefined; var timeoutUserInteractionID = undefined; zoomImage.bind('loaded', loadedFunction, this); setTimeout(function(){ self.bind('click', playerClickFunction, self, false); }, 0); zoomImage.set('image', image); zoomImage.set('customWidth', customWidth); zoomImage.set('customHeight', customHeight); zoomImage.set('showEffect', showEffect); zoomImage.set('hideEffect', hideEffect); zoomImage.set('visible', true); return zoomImage; },
  "showPopupPanoramaOverlay": function(popupPanoramaOverlay, closeButtonProperties, imageHD, toggleImage, toggleImageHD, autoCloseMilliSeconds, audio, stopBackgroundAudio){  var self = this; this.MainViewer.set('toolTipEnabled', false); var cardboardEnabled = this.isCardboardViewMode(); if(!cardboardEnabled) { var zoomImage = this.zoomImagePopupPanorama; var showDuration = popupPanoramaOverlay.get('showDuration'); var hideDuration = popupPanoramaOverlay.get('hideDuration'); var playersPaused = this.pauseCurrentPlayers(audio == null || !stopBackgroundAudio); var popupMaxWidthBackup = popupPanoramaOverlay.get('popupMaxWidth'); var popupMaxHeightBackup = popupPanoramaOverlay.get('popupMaxHeight'); var showEndFunction = function() { var loadedFunction = function(){ if(!self.isCardboardViewMode()) popupPanoramaOverlay.set('visible', false); }; popupPanoramaOverlay.unbind('showEnd', showEndFunction, self); popupPanoramaOverlay.set('showDuration', 1); popupPanoramaOverlay.set('hideDuration', 1); self.showPopupImage(imageHD, toggleImageHD, popupPanoramaOverlay.get('popupMaxWidth'), popupPanoramaOverlay.get('popupMaxHeight'), null, null, closeButtonProperties, autoCloseMilliSeconds, audio, stopBackgroundAudio, loadedFunction, hideFunction); }; var hideFunction = function() { var restoreShowDurationFunction = function(){ popupPanoramaOverlay.unbind('showEnd', restoreShowDurationFunction, self); popupPanoramaOverlay.set('visible', false); popupPanoramaOverlay.set('showDuration', showDuration); popupPanoramaOverlay.set('popupMaxWidth', popupMaxWidthBackup); popupPanoramaOverlay.set('popupMaxHeight', popupMaxHeightBackup); }; self.resumePlayers(playersPaused, audio == null || !stopBackgroundAudio); var currentWidth = zoomImage.get('imageWidth'); var currentHeight = zoomImage.get('imageHeight'); popupPanoramaOverlay.bind('showEnd', restoreShowDurationFunction, self, true); popupPanoramaOverlay.set('showDuration', 1); popupPanoramaOverlay.set('hideDuration', hideDuration); popupPanoramaOverlay.set('popupMaxWidth', currentWidth); popupPanoramaOverlay.set('popupMaxHeight', currentHeight); if(popupPanoramaOverlay.get('visible')) restoreShowDurationFunction(); else popupPanoramaOverlay.set('visible', true); self.MainViewer.set('toolTipEnabled', true); }; if(!imageHD){ imageHD = popupPanoramaOverlay.get('image'); } if(!toggleImageHD && toggleImage){ toggleImageHD = toggleImage; } popupPanoramaOverlay.bind('showEnd', showEndFunction, this, true); } else { var hideEndFunction = function() { self.resumePlayers(playersPaused, audio == null || stopBackgroundAudio); if(audio){ if(stopBackgroundAudio){ self.resumeGlobalAudios(); } self.stopGlobalAudio(audio); } popupPanoramaOverlay.unbind('hideEnd', hideEndFunction, self); self.MainViewer.set('toolTipEnabled', true); }; var playersPaused = this.pauseCurrentPlayers(audio == null || !stopBackgroundAudio); if(audio){ if(stopBackgroundAudio){ this.pauseGlobalAudios(); } this.playGlobalAudio(audio); } popupPanoramaOverlay.bind('hideEnd', hideEndFunction, this, true); } popupPanoramaOverlay.set('visible', true); },
  "existsKey": function(key){  return key in window; },
  "getPanoramaOverlayByName": function(panorama, name){  var overlays = this.getOverlays(panorama); for(var i = 0, count = overlays.length; i<count; ++i){ var overlay = overlays[i]; var data = overlay.get('data'); if(data != undefined && data.label == name){ return overlay; } } return undefined; },
  "changeBackgroundWhilePlay": function(playList, index, color){  var stopFunction = function(event){ playListItem.unbind('stop', stopFunction, this); if((color == viewerArea.get('backgroundColor')) && (colorRatios == viewerArea.get('backgroundColorRatios'))){ viewerArea.set('backgroundColor', backgroundColorBackup); viewerArea.set('backgroundColorRatios', backgroundColorRatiosBackup); } }; var playListItem = playList.get('items')[index]; var player = playListItem.get('player'); var viewerArea = player.get('viewerArea'); var backgroundColorBackup = viewerArea.get('backgroundColor'); var backgroundColorRatiosBackup = viewerArea.get('backgroundColorRatios'); var colorRatios = [0]; if((color != backgroundColorBackup) || (colorRatios != backgroundColorRatiosBackup)){ viewerArea.set('backgroundColor', color); viewerArea.set('backgroundColorRatios', colorRatios); playListItem.bind('stop', stopFunction, this); } },
  "setOverlayBehaviour": function(overlay, media, action){  var executeFunc = function() { switch(action){ case 'triggerClick': this.triggerOverlay(overlay, 'click'); break; case 'stop': case 'play': case 'pause': overlay[action](); break; case 'togglePlayPause': case 'togglePlayStop': if(overlay.get('state') == 'playing') overlay[action == 'togglePlayPause' ? 'pause' : 'stop'](); else overlay.play(); break; } if(window.overlaysDispatched == undefined) window.overlaysDispatched = {}; var id = overlay.get('id'); window.overlaysDispatched[id] = true; setTimeout(function(){ delete window.overlaysDispatched[id]; }, 2000); }; if(window.overlaysDispatched != undefined && overlay.get('id') in window.overlaysDispatched) return; var playList = this.getPlayListWithMedia(media, true); if(playList != undefined){ var item = this.getPlayListItemByMedia(playList, media); if(playList.get('items').indexOf(item) != playList.get('selectedIndex')){ var beginFunc = function(e){ item.unbind('begin', beginFunc, this); executeFunc.call(this); }; item.bind('begin', beginFunc, this); return; } } executeFunc.call(this); },
  "setMediaBehaviour": function(playList, index, mediaDispatcher){  var self = this; var stateChangeFunction = function(event){ if(event.data.state == 'stopped'){ dispose.call(this, true); } }; var onBeginFunction = function() { item.unbind('begin', onBeginFunction, self); var media = item.get('media'); if(media.get('class') != 'Panorama' || (media.get('camera') != undefined && media.get('camera').get('initialSequence') != undefined)){ player.bind('stateChange', stateChangeFunction, self); } }; var changeFunction = function(){ var index = playListDispatcher.get('selectedIndex'); if(index != -1){ indexDispatcher = index; dispose.call(this, false); } }; var disposeCallback = function(){ dispose.call(this, false); }; var dispose = function(forceDispose){ if(!playListDispatcher) return; var media = item.get('media'); if((media.get('class') == 'Video360' || media.get('class') == 'Video') && media.get('loop') == true && !forceDispose) return; playList.set('selectedIndex', -1); if(panoramaSequence && panoramaSequenceIndex != -1){ if(panoramaSequence) { if(panoramaSequenceIndex > 0 && panoramaSequence.get('movements')[panoramaSequenceIndex-1].get('class') == 'TargetPanoramaCameraMovement'){ var initialPosition = camera.get('initialPosition'); var oldYaw = initialPosition.get('yaw'); var oldPitch = initialPosition.get('pitch'); var oldHfov = initialPosition.get('hfov'); var previousMovement = panoramaSequence.get('movements')[panoramaSequenceIndex-1]; initialPosition.set('yaw', previousMovement.get('targetYaw')); initialPosition.set('pitch', previousMovement.get('targetPitch')); initialPosition.set('hfov', previousMovement.get('targetHfov')); var restoreInitialPositionFunction = function(event){ initialPosition.set('yaw', oldYaw); initialPosition.set('pitch', oldPitch); initialPosition.set('hfov', oldHfov); itemDispatcher.unbind('end', restoreInitialPositionFunction, this); }; itemDispatcher.bind('end', restoreInitialPositionFunction, this); } panoramaSequence.set('movementIndex', panoramaSequenceIndex); } } if(player){ item.unbind('begin', onBeginFunction, this); player.unbind('stateChange', stateChangeFunction, this); for(var i = 0; i<buttons.length; ++i) { buttons[i].unbind('click', disposeCallback, this); } } if(sameViewerArea){ var currentMedia = this.getMediaFromPlayer(player); if(currentMedia == undefined || currentMedia == item.get('media')){ playListDispatcher.set('selectedIndex', indexDispatcher); } if(playList != playListDispatcher) playListDispatcher.unbind('change', changeFunction, this); } else{ viewerArea.set('visible', viewerVisibility); } playListDispatcher = undefined; }; var mediaDispatcherByParam = mediaDispatcher != undefined; if(!mediaDispatcher){ var currentIndex = playList.get('selectedIndex'); var currentPlayer = (currentIndex != -1) ? playList.get('items')[playList.get('selectedIndex')].get('player') : this.getActivePlayerWithViewer(this.MainViewer); if(currentPlayer) { mediaDispatcher = this.getMediaFromPlayer(currentPlayer); } } var playListDispatcher = mediaDispatcher ? this.getPlayListWithMedia(mediaDispatcher, true) : undefined; if(!playListDispatcher){ playList.set('selectedIndex', index); return; } var indexDispatcher = playListDispatcher.get('selectedIndex'); if(playList.get('selectedIndex') == index || indexDispatcher == -1){ return; } var item = playList.get('items')[index]; var itemDispatcher = playListDispatcher.get('items')[indexDispatcher]; var player = item.get('player'); var viewerArea = player.get('viewerArea'); var viewerVisibility = viewerArea.get('visible'); var sameViewerArea = viewerArea == itemDispatcher.get('player').get('viewerArea'); if(sameViewerArea){ if(playList != playListDispatcher){ playListDispatcher.set('selectedIndex', -1); playListDispatcher.bind('change', changeFunction, this); } } else{ viewerArea.set('visible', true); } var panoramaSequenceIndex = -1; var panoramaSequence = undefined; var camera = itemDispatcher.get('camera'); if(camera){ panoramaSequence = camera.get('initialSequence'); if(panoramaSequence) { panoramaSequenceIndex = panoramaSequence.get('movementIndex'); } } playList.set('selectedIndex', index); var buttons = []; var addButtons = function(property){ var value = player.get(property); if(value == undefined) return; if(Array.isArray(value)) buttons = buttons.concat(value); else buttons.push(value); }; addButtons('buttonStop'); for(var i = 0; i<buttons.length; ++i) { buttons[i].bind('click', disposeCallback, this); } if(player != itemDispatcher.get('player') || !mediaDispatcherByParam){ item.bind('begin', onBeginFunction, self); } this.executeFunctionWhenChange(playList, index, disposeCallback); },
  "resumePlayers": function(players, onlyResumeCameraIfPanorama){  for(var i = 0; i<players.length; ++i){ var player = players[i]; if(onlyResumeCameraIfPanorama && player.get('class') == 'PanoramaPlayer' && typeof player.get('video') === 'undefined'){ player.resumeCamera(); } else{ player.play(); } } },
  "getPixels": function(value){  var result = new RegExp('((\\+|\\-)?\\d+(\\.\\d*)?)(px|vw|vh|vmin|vmax)?', 'i').exec(value); if (result == undefined) { return 0; } var num = parseFloat(result[1]); var unit = result[4]; var vw = this.rootPlayer.get('actualWidth') / 100; var vh = this.rootPlayer.get('actualHeight') / 100; switch(unit) { case 'vw': return num * vw; case 'vh': return num * vh; case 'vmin': return num * Math.min(vw, vh); case 'vmax': return num * Math.max(vw, vh); default: return num; } },
  "cloneCamera": function(camera){  var newCamera = this.rootPlayer.createInstance(camera.get('class')); newCamera.set('id', camera.get('id') + '_copy'); newCamera.set('idleSequence', camera.get('initialSequence')); return newCamera; },
  "stopAndGoCamera": function(camera, ms){  var sequence = camera.get('initialSequence'); sequence.pause(); var timeoutFunction = function(){ sequence.play(); }; setTimeout(timeoutFunction, ms); },
  "autotriggerAtStart": function(playList, callback, once){  var onChange = function(event){ callback(); if(once == true) playList.unbind('change', onChange, this); }; playList.bind('change', onChange, this); },
  "setMainMediaByIndex": function(index){  var item = undefined; if(index >= 0 && index < this.mainPlayList.get('items').length){ this.mainPlayList.set('selectedIndex', index); item = this.mainPlayList.get('items')[index]; } return item; },
  "init": function(){  if(!Object.hasOwnProperty('values')) { Object.values = function(o){ return Object.keys(o).map(function(e) { return o[e]; }); }; } var history = this.get('data')['history']; var playListChangeFunc = function(e){ var playList = e.source; var index = playList.get('selectedIndex'); if(index < 0) return; var id = playList.get('id'); if(!history.hasOwnProperty(id)) history[id] = new HistoryData(playList); history[id].add(index); }; var playLists = this.getByClassName('PlayList'); for(var i = 0, count = playLists.length; i<count; ++i) { var playList = playLists[i]; playList.bind('change', playListChangeFunc, this); } },
  "resumeGlobalAudios": function(caller){  if (window.pauseGlobalAudiosState == undefined || !(caller in window.pauseGlobalAudiosState)) return; var audiosPaused = window.pauseGlobalAudiosState[caller]; delete window.pauseGlobalAudiosState[caller]; var values = Object.values(window.pauseGlobalAudiosState); for (var i = 0, count = values.length; i<count; ++i) { var objAudios = values[i]; for (var j = audiosPaused.length-1; j>=0; --j) { var a = audiosPaused[j]; if(objAudios.indexOf(a) != -1) audiosPaused.splice(j, 1); } } for (var i = 0, count = audiosPaused.length; i<count; ++i) { var a = audiosPaused[i]; if (a.get('state') == 'paused') a.play(); } },
  "setEndToItemIndex": function(playList, fromIndex, toIndex){  var endFunction = function(){ if(playList.get('selectedIndex') == fromIndex) playList.set('selectedIndex', toIndex); }; this.executeFunctionWhenChange(playList, fromIndex, endFunction); },
  "setStartTimeVideoSync": function(video, player){  this.setStartTimeVideo(video, player.get('currentTime')); },
  "stopGlobalAudio": function(audio){  var audios = window.currentGlobalAudios; if(audios){ audio = audios[audio.get('id')]; if(audio){ delete audios[audio.get('id')]; if(Object.keys(audios).length == 0){ window.currentGlobalAudios = undefined; } } } if(audio) audio.stop(); },
  "showComponentsWhileMouseOver": function(parentComponent, components, durationVisibleWhileOut){  var setVisibility = function(visible){ for(var i = 0, length = components.length; i<length; i++){ var component = components[i]; if(component.get('class') == 'HTMLText' && (component.get('html') == '' || component.get('html') == undefined)) { continue; } component.set('visible', visible); } }; if (this.rootPlayer.get('touchDevice') == true){ setVisibility(true); } else { var timeoutID = -1; var rollOverFunction = function(){ setVisibility(true); if(timeoutID >= 0) clearTimeout(timeoutID); parentComponent.unbind('rollOver', rollOverFunction, this); parentComponent.bind('rollOut', rollOutFunction, this); }; var rollOutFunction = function(){ var timeoutFunction = function(){ setVisibility(false); parentComponent.unbind('rollOver', rollOverFunction, this); }; parentComponent.unbind('rollOut', rollOutFunction, this); parentComponent.bind('rollOver', rollOverFunction, this); timeoutID = setTimeout(timeoutFunction, durationVisibleWhileOut); }; parentComponent.bind('rollOver', rollOverFunction, this); } },
  "getPlayListWithMedia": function(media, onlySelected){  var playLists = this.getByClassName('PlayList'); for(var i = 0, count = playLists.length; i<count; ++i){ var playList = playLists[i]; if(onlySelected && playList.get('selectedIndex') == -1) continue; if(this.getPlayListItemByMedia(playList, media) != undefined) return playList; } return undefined; },
  "getMediaByName": function(name){  var list = this.getByClassName('Media'); for(var i = 0, count = list.length; i<count; ++i){ var media = list[i]; if((media.get('class') == 'Audio' && media.get('data').label == name) || media.get('label') == name){ return media; } } return undefined; },
  "executeFunctionWhenChange": function(playList, index, endFunction, changeFunction){  var endObject = undefined; var changePlayListFunction = function(event){ if(event.data.previousSelectedIndex == index){ if(changeFunction) changeFunction.call(this); if(endFunction && endObject) endObject.unbind('end', endFunction, this); playList.unbind('change', changePlayListFunction, this); } }; if(endFunction){ var playListItem = playList.get('items')[index]; if(playListItem.get('class') == 'PanoramaPlayListItem'){ var camera = playListItem.get('camera'); if(camera != undefined) endObject = camera.get('initialSequence'); if(endObject == undefined) endObject = camera.get('idleSequence'); } else{ endObject = playListItem.get('media'); } if(endObject){ endObject.bind('end', endFunction, this); } } playList.bind('change', changePlayListFunction, this); },
  "loopAlbum": function(playList, index){  var playListItem = playList.get('items')[index]; var player = playListItem.get('player'); var loopFunction = function(){ player.play(); }; this.executeFunctionWhenChange(playList, index, loopFunction); },
  "shareTwitter": function(url){  window.open('https://twitter.com/intent/tweet?source=webclient&url=' + url, '_blank'); },
  "showPopupPanoramaVideoOverlay": function(popupPanoramaOverlay, closeButtonProperties, stopAudios){  var self = this; var showEndFunction = function() { popupPanoramaOverlay.unbind('showEnd', showEndFunction); closeButton.bind('click', hideFunction, this); setCloseButtonPosition(); closeButton.set('visible', true); }; var endFunction = function() { if(!popupPanoramaOverlay.get('loop')) hideFunction(); }; var hideFunction = function() { self.MainViewer.set('toolTipEnabled', true); popupPanoramaOverlay.set('visible', false); closeButton.set('visible', false); closeButton.unbind('click', hideFunction, self); popupPanoramaOverlay.unbind('end', endFunction, self); popupPanoramaOverlay.unbind('hideEnd', hideFunction, self, true); self.resumePlayers(playersPaused, true); if(stopAudios) { self.resumeGlobalAudios(); } }; var setCloseButtonPosition = function() { var right = 10; var top = 10; closeButton.set('right', right); closeButton.set('top', top); }; this.MainViewer.set('toolTipEnabled', false); var closeButton = this.closeButtonPopupPanorama; if(closeButtonProperties){ for(var key in closeButtonProperties){ closeButton.set(key, closeButtonProperties[key]); } } var playersPaused = this.pauseCurrentPlayers(true); if(stopAudios) { this.pauseGlobalAudios(); } popupPanoramaOverlay.bind('end', endFunction, this, true); popupPanoramaOverlay.bind('showEnd', showEndFunction, this, true); popupPanoramaOverlay.bind('hideEnd', hideFunction, this, true); popupPanoramaOverlay.set('visible', true); },
  "updateVideoCues": function(playList, index){  var playListItem = playList.get('items')[index]; var video = playListItem.get('media'); if(video.get('cues').length == 0) return; var player = playListItem.get('player'); var cues = []; var changeFunction = function(){ if(playList.get('selectedIndex') != index){ video.unbind('cueChange', cueChangeFunction, this); playList.unbind('change', changeFunction, this); } }; var cueChangeFunction = function(event){ var activeCues = event.data.activeCues; for(var i = 0, count = cues.length; i<count; ++i){ var cue = cues[i]; if(activeCues.indexOf(cue) == -1 && (cue.get('startTime') > player.get('currentTime') || cue.get('endTime') < player.get('currentTime')+0.5)){ cue.trigger('end'); } } cues = activeCues; }; video.bind('cueChange', cueChangeFunction, this); playList.bind('change', changeFunction, this); },
  "historyGoBack": function(playList){  var history = this.get('data')['history'][playList.get('id')]; if(history != undefined) { history.back(); } },
  "getGlobalAudio": function(audio){  var audios = window.currentGlobalAudios; if(audios != undefined && audio.get('id') in audios){ audio = audios[audio.get('id')]; } return audio; },
  "triggerOverlay": function(overlay, eventName){  if(overlay.get('areas') != undefined) { var areas = overlay.get('areas'); for(var i = 0; i<areas.length; ++i) { areas[i].trigger(eventName); } } else { overlay.trigger(eventName); } },
  "setMapLocation": function(panoramaPlayListItem, mapPlayer){  var resetFunction = function(){ panoramaPlayListItem.unbind('stop', resetFunction, this); player.set('mapPlayer', null); }; panoramaPlayListItem.bind('stop', resetFunction, this); var player = panoramaPlayListItem.get('player'); player.set('mapPlayer', mapPlayer); },
  "setMainMediaByName": function(name){  var items = this.mainPlayList.get('items'); for(var i = 0; i<items.length; ++i){ var item = items[i]; if(item.get('media').get('label') == name) { this.mainPlayList.set('selectedIndex', i); return item; } } },
  "historyGoForward": function(playList){  var history = this.get('data')['history'][playList.get('id')]; if(history != undefined) { history.forward(); } },
  "keepComponentVisibility": function(component, keep){  var key = 'keepVisibility_' + component.get('id'); var value = this.getKey(key); if(value == undefined && keep) { this.registerKey(key, keep); } else if(value != undefined && !keep) { this.unregisterKey(key); } },
  "registerKey": function(key, value){  window[key] = value; },
  "showWindow": function(w, autoCloseMilliSeconds, containsAudio){  if(w.get('visible') == true){ return; } var closeFunction = function(){ clearAutoClose(); this.resumePlayers(playersPaused, !containsAudio); w.unbind('close', closeFunction, this); }; var clearAutoClose = function(){ w.unbind('click', clearAutoClose, this); if(timeoutID != undefined){ clearTimeout(timeoutID); } }; var timeoutID = undefined; if(autoCloseMilliSeconds){ var autoCloseFunction = function(){ w.hide(); }; w.bind('click', clearAutoClose, this); timeoutID = setTimeout(autoCloseFunction, autoCloseMilliSeconds); } var playersPaused = this.pauseCurrentPlayers(!containsAudio); w.bind('close', closeFunction, this); w.show(this, true); },
  "getOverlays": function(media){  switch(media.get('class')){ case 'Panorama': var overlays = media.get('overlays').concat() || []; var frames = media.get('frames'); for(var j = 0; j<frames.length; ++j){ overlays = overlays.concat(frames[j].get('overlays') || []); } return overlays; case 'Video360': case 'Map': return media.get('overlays') || []; default: return []; } },
  "getCurrentPlayerWithMedia": function(media){  var playerClass = undefined; var mediaPropertyName = undefined; switch(media.get('class')) { case 'Panorama': case 'LivePanorama': case 'HDRPanorama': playerClass = 'PanoramaPlayer'; mediaPropertyName = 'panorama'; break; case 'Video360': playerClass = 'PanoramaPlayer'; mediaPropertyName = 'video'; break; case 'PhotoAlbum': playerClass = 'PhotoAlbumPlayer'; mediaPropertyName = 'photoAlbum'; break; case 'Map': playerClass = 'MapPlayer'; mediaPropertyName = 'map'; break; case 'Video': playerClass = 'VideoPlayer'; mediaPropertyName = 'video'; break; }; if(playerClass != undefined) { var players = this.getByClassName(playerClass); for(var i = 0; i<players.length; ++i){ var player = players[i]; if(player.get(mediaPropertyName) == media) { return player; } } } else { return undefined; } },
  "getComponentByName": function(name){  var list = this.getByClassName('UIComponent'); for(var i = 0, count = list.length; i<count; ++i){ var component = list[i]; var data = component.get('data'); if(data != undefined && data.name == name){ return component; } } return undefined; },
  "initGA": function(){  var sendFunc = function(category, event, label) { ga('send', 'event', category, event, label); }; var media = this.getByClassName('Panorama'); media = media.concat(this.getByClassName('Video360')); media = media.concat(this.getByClassName('Map')); for(var i = 0, countI = media.length; i<countI; ++i){ var m = media[i]; var mediaLabel = m.get('label'); var overlays = this.getOverlays(m); for(var j = 0, countJ = overlays.length; j<countJ; ++j){ var overlay = overlays[j]; var overlayLabel = overlay.get('data') != undefined ? mediaLabel + ' - ' + overlay.get('data')['label'] : mediaLabel; switch(overlay.get('class')) { case 'HotspotPanoramaOverlay': case 'HotspotMapOverlay': var areas = overlay.get('areas'); for (var z = 0; z<areas.length; ++z) { areas[z].bind('click', sendFunc.bind(this, 'Hotspot', 'click', overlayLabel), this); } break; case 'CeilingCapPanoramaOverlay': case 'TripodCapPanoramaOverlay': overlay.bind('click', sendFunc.bind(this, 'Cap', 'click', overlayLabel), this); break; } } } var components = this.getByClassName('Button'); components = components.concat(this.getByClassName('IconButton')); for(var i = 0, countI = components.length; i<countI; ++i){ var c = components[i]; var componentLabel = c.get('data')['name']; c.bind('click', sendFunc.bind(this, 'Skin', 'click', componentLabel), this); } var items = this.getByClassName('PlayListItem'); var media2Item = {}; for(var i = 0, countI = items.length; i<countI; ++i) { var item = items[i]; var media = item.get('media'); if(!(media.get('id') in media2Item)) { item.bind('begin', sendFunc.bind(this, 'Media', 'play', media.get('label')), this); media2Item[media.get('id')] = item; } } },
  "getMediaWidth": function(media){  switch(media.get('class')){ case 'Video360': var res = media.get('video'); if(res instanceof Array){ var maxW=0; for(var i=0; i<res.length; i++){ var r = res[i]; if(r.get('width') > maxW) maxW = r.get('width'); } return maxW; }else{ return r.get('width') } default: return media.get('width'); } },
  "startPanoramaWithCamera": function(media, camera){  if(window.currentPanoramasWithCameraChanged != undefined && window.currentPanoramasWithCameraChanged.indexOf(media) != -1){ return; } var playLists = this.getByClassName('PlayList'); if(playLists.length == 0) return; var restoreItems = []; for(var i = 0, count = playLists.length; i<count; ++i){ var playList = playLists[i]; var items = playList.get('items'); for(var j = 0, countJ = items.length; j<countJ; ++j){ var item = items[j]; if(item.get('media') == media && (item.get('class') == 'PanoramaPlayListItem' || item.get('class') == 'Video360PlayListItem')){ restoreItems.push({camera: item.get('camera'), item: item}); item.set('camera', camera); } } } if(restoreItems.length > 0) { if(window.currentPanoramasWithCameraChanged == undefined) { window.currentPanoramasWithCameraChanged = [media]; } else { window.currentPanoramasWithCameraChanged.push(media); } var restoreCameraOnStop = function(){ var index = window.currentPanoramasWithCameraChanged.indexOf(media); if(index != -1) { window.currentPanoramasWithCameraChanged.splice(index, 1); } for (var i = 0; i < restoreItems.length; i++) { restoreItems[i].item.set('camera', restoreItems[i].camera); restoreItems[i].item.unbind('stop', restoreCameraOnStop, this); } }; for (var i = 0; i < restoreItems.length; i++) { restoreItems[i].item.bind('stop', restoreCameraOnStop, this); } } },
  "loadFromCurrentMediaPlayList": function(playList, delta){  var currentIndex = playList.get('selectedIndex'); var totalItems = playList.get('items').length; var newIndex = (currentIndex + delta) % totalItems; while(newIndex < 0){ newIndex = totalItems + newIndex; }; if(currentIndex != newIndex){ playList.set('selectedIndex', newIndex); } },
  "visibleComponentsIfPlayerFlagEnabled": function(components, playerFlag){  var enabled = this.get(playerFlag); for(var i in components){ components[i].set('visible', enabled); } },
  "setComponentVisibility": function(component, visible, applyAt, effect, propertyEffect, ignoreClearTimeout){  var keepVisibility = this.getKey('keepVisibility_' + component.get('id')); if(keepVisibility) return; this.unregisterKey('visibility_'+component.get('id')); var changeVisibility = function(){ if(effect && propertyEffect){ component.set(propertyEffect, effect); } component.set('visible', visible); if(component.get('class') == 'ViewerArea'){ try{ if(visible) component.restart(); else if(component.get('playbackState') == 'playing') component.pause(); } catch(e){}; } }; var effectTimeoutName = 'effectTimeout_'+component.get('id'); if(!ignoreClearTimeout && window.hasOwnProperty(effectTimeoutName)){ var effectTimeout = window[effectTimeoutName]; if(effectTimeout instanceof Array){ for(var i=0; i<effectTimeout.length; i++){ clearTimeout(effectTimeout[i]) } }else{ clearTimeout(effectTimeout); } delete window[effectTimeoutName]; } else if(visible == component.get('visible') && !ignoreClearTimeout) return; if(applyAt && applyAt > 0){ var effectTimeout = setTimeout(function(){ if(window[effectTimeoutName] instanceof Array) { var arrayTimeoutVal = window[effectTimeoutName]; var index = arrayTimeoutVal.indexOf(effectTimeout); arrayTimeoutVal.splice(index, 1); if(arrayTimeoutVal.length == 0){ delete window[effectTimeoutName]; } }else{ delete window[effectTimeoutName]; } changeVisibility(); }, applyAt); if(window.hasOwnProperty(effectTimeoutName)){ window[effectTimeoutName] = [window[effectTimeoutName], effectTimeout]; }else{ window[effectTimeoutName] = effectTimeout; } } else{ changeVisibility(); } },
  "setPanoramaCameraWithCurrentSpot": function(playListItem){  var currentPlayer = this.getActivePlayerWithViewer(this.MainViewer); if(currentPlayer == undefined){ return; } var playerClass = currentPlayer.get('class'); if(playerClass != 'PanoramaPlayer' && playerClass != 'Video360Player'){ return; } var fromMedia = currentPlayer.get('panorama'); if(fromMedia == undefined) { fromMedia = currentPlayer.get('video'); } var panorama = playListItem.get('media'); var newCamera = this.cloneCamera(playListItem.get('camera')); this.setCameraSameSpotAsMedia(newCamera, fromMedia); this.startPanoramaWithCamera(panorama, newCamera); },
  "changePlayListWithSameSpot": function(playList, newIndex){  var currentIndex = playList.get('selectedIndex'); if (currentIndex >= 0 && newIndex >= 0 && currentIndex != newIndex) { var currentItem = playList.get('items')[currentIndex]; var newItem = playList.get('items')[newIndex]; var currentPlayer = currentItem.get('player'); var newPlayer = newItem.get('player'); if ((currentPlayer.get('class') == 'PanoramaPlayer' || currentPlayer.get('class') == 'Video360Player') && (newPlayer.get('class') == 'PanoramaPlayer' || newPlayer.get('class') == 'Video360Player')) { var newCamera = this.cloneCamera(newItem.get('camera')); this.setCameraSameSpotAsMedia(newCamera, currentItem.get('media')); this.startPanoramaWithCamera(newItem.get('media'), newCamera); } } },
  "unregisterKey": function(key){  delete window[key]; },
  "fixTogglePlayPauseButton": function(player){  var state = player.get('state'); var buttons = player.get('buttonPlayPause'); if(typeof buttons !== 'undefined' && player.get('state') == 'playing'){ if(!Array.isArray(buttons)) buttons = [buttons]; for(var i = 0; i<buttons.length; ++i) buttons[i].set('pressed', true); } },
  "getKey": function(key){  return window[key]; },
  "pauseGlobalAudios": function(caller, exclude){  if (window.pauseGlobalAudiosState == undefined) window.pauseGlobalAudiosState = {}; if (window.pauseGlobalAudiosList == undefined) window.pauseGlobalAudiosList = []; if (caller in window.pauseGlobalAudiosState) { return; } var audios = this.getByClassName('Audio').concat(this.getByClassName('VideoPanoramaOverlay')); if (window.currentGlobalAudios != undefined) audios = audios.concat(Object.values(window.currentGlobalAudios)); var audiosPaused = []; var values = Object.values(window.pauseGlobalAudiosState); for (var i = 0, count = values.length; i<count; ++i) { var objAudios = values[i]; for (var j = 0; j<objAudios.length; ++j) { var a = objAudios[j]; if(audiosPaused.indexOf(a) == -1) audiosPaused.push(a); } } window.pauseGlobalAudiosState[caller] = audiosPaused; for (var i = 0, count = audios.length; i < count; ++i) { var a = audios[i]; if (a.get('state') == 'playing' && (exclude == undefined || exclude.indexOf(a) == -1)) { a.pause(); audiosPaused.push(a); } } },
  "showPopupMedia": function(w, media, playList, popupMaxWidth, popupMaxHeight, autoCloseWhenFinished, stopAudios){  var self = this; var closeFunction = function(){ playList.set('selectedIndex', -1); self.MainViewer.set('toolTipEnabled', true); if(stopAudios) { self.resumeGlobalAudios(); } this.resumePlayers(playersPaused, !stopAudios); if(isVideo) { this.unbind('resize', resizeFunction, this); } w.unbind('close', closeFunction, this); }; var endFunction = function(){ w.hide(); }; var resizeFunction = function(){ var getWinValue = function(property){ return w.get(property) || 0; }; var parentWidth = self.get('actualWidth'); var parentHeight = self.get('actualHeight'); var mediaWidth = self.getMediaWidth(media); var mediaHeight = self.getMediaHeight(media); var popupMaxWidthNumber = parseFloat(popupMaxWidth) / 100; var popupMaxHeightNumber = parseFloat(popupMaxHeight) / 100; var windowWidth = popupMaxWidthNumber * parentWidth; var windowHeight = popupMaxHeightNumber * parentHeight; var footerHeight = getWinValue('footerHeight'); var headerHeight = getWinValue('headerHeight'); if(!headerHeight) { var closeButtonHeight = getWinValue('closeButtonIconHeight') + getWinValue('closeButtonPaddingTop') + getWinValue('closeButtonPaddingBottom'); var titleHeight = self.getPixels(getWinValue('titleFontSize')) + getWinValue('titlePaddingTop') + getWinValue('titlePaddingBottom'); headerHeight = closeButtonHeight > titleHeight ? closeButtonHeight : titleHeight; headerHeight += getWinValue('headerPaddingTop') + getWinValue('headerPaddingBottom'); } var contentWindowWidth = windowWidth - getWinValue('bodyPaddingLeft') - getWinValue('bodyPaddingRight') - getWinValue('paddingLeft') - getWinValue('paddingRight'); var contentWindowHeight = windowHeight - headerHeight - footerHeight - getWinValue('bodyPaddingTop') - getWinValue('bodyPaddingBottom') - getWinValue('paddingTop') - getWinValue('paddingBottom'); var parentAspectRatio = contentWindowWidth / contentWindowHeight; var mediaAspectRatio = mediaWidth / mediaHeight; if(parentAspectRatio > mediaAspectRatio) { windowWidth = contentWindowHeight * mediaAspectRatio + getWinValue('bodyPaddingLeft') + getWinValue('bodyPaddingRight') + getWinValue('paddingLeft') + getWinValue('paddingRight'); } else { windowHeight = contentWindowWidth / mediaAspectRatio + headerHeight + footerHeight + getWinValue('bodyPaddingTop') + getWinValue('bodyPaddingBottom') + getWinValue('paddingTop') + getWinValue('paddingBottom'); } if(windowWidth > parentWidth * popupMaxWidthNumber) { windowWidth = parentWidth * popupMaxWidthNumber; } if(windowHeight > parentHeight * popupMaxHeightNumber) { windowHeight = parentHeight * popupMaxHeightNumber; } w.set('width', windowWidth); w.set('height', windowHeight); w.set('x', (parentWidth - getWinValue('actualWidth')) * 0.5); w.set('y', (parentHeight - getWinValue('actualHeight')) * 0.5); }; if(autoCloseWhenFinished){ this.executeFunctionWhenChange(playList, 0, endFunction); } var mediaClass = media.get('class'); var isVideo = mediaClass == 'Video' || mediaClass == 'Video360'; playList.set('selectedIndex', 0); if(isVideo){ this.bind('resize', resizeFunction, this); resizeFunction(); playList.get('items')[0].get('player').play(); } else { w.set('width', popupMaxWidth); w.set('height', popupMaxHeight); } this.MainViewer.set('toolTipEnabled', false); if(stopAudios) { this.pauseGlobalAudios(); } var playersPaused = this.pauseCurrentPlayers(!stopAudios); w.bind('close', closeFunction, this); w.show(this, true); },
  "getMediaFromPlayer": function(player){  switch(player.get('class')){ case 'PanoramaPlayer': return player.get('panorama') || player.get('video'); case 'VideoPlayer': case 'Video360Player': return player.get('video'); case 'PhotoAlbumPlayer': return player.get('photoAlbum'); case 'MapPlayer': return player.get('map'); } },
  "getActivePlayerWithViewer": function(viewerArea){  var players = this.getByClassName('PanoramaPlayer'); players = players.concat(this.getByClassName('VideoPlayer')); players = players.concat(this.getByClassName('Video360Player')); players = players.concat(this.getByClassName('PhotoAlbumPlayer')); players = players.concat(this.getByClassName('MapPlayer')); var i = players.length; while(i-- > 0){ var player = players[i]; if(player.get('viewerArea') == viewerArea) { var playerClass = player.get('class'); if(playerClass == 'PanoramaPlayer' && (player.get('panorama') != undefined || player.get('video') != undefined)) return player; else if((playerClass == 'VideoPlayer' || playerClass == 'Video360Player') && player.get('video') != undefined) return player; else if(playerClass == 'PhotoAlbumPlayer' && player.get('photoAlbum') != undefined) return player; else if(playerClass == 'MapPlayer' && player.get('map') != undefined) return player; } } return undefined; },
  "setCameraSameSpotAsMedia": function(camera, media){  var player = this.getCurrentPlayerWithMedia(media); if(player != undefined) { var position = camera.get('initialPosition'); position.set('yaw', player.get('yaw')); position.set('pitch', player.get('pitch')); position.set('hfov', player.get('hfov')); } },
  "openLink": function(url, name){  if(url == location.href) { return; } var isElectron = (window && window.process && window.process.versions && window.process.versions['electron']) || (navigator && navigator.userAgent && navigator.userAgent.indexOf('Electron') >= 0); if (name == '_blank' && isElectron) { if (url.startsWith('/')) { var r = window.location.href.split('/'); r.pop(); url = r.join('/') + url; } var extension = url.split('.').pop().toLowerCase(); if(extension != 'pdf' || url.startsWith('file://')) { var shell = window.require('electron').shell; shell.openExternal(url); } else { window.open(url, name); } } else if(isElectron && (name == '_top' || name == '_self')) { window.location = url; } else { var newWindow = window.open(url, name); newWindow.focus(); } }
 },
 "children": [
  "this.MainViewer",
  "this.Container_7F59BED9_7065_6DCD_41D6_B4AD3EEA9174"
 ],
 "id": "rootPlayer",
 "defaultVRPointer": "laser",
 "class": "Player",
 "start": "this.playAudioList([this.audio_5DF15EFC_40E1_DA9A_418A_0627C2B825A5]); this.init()",
 "paddingRight": 0,
 "downloadEnabled": false,
 "borderSize": 0,
 "paddingLeft": 0,
 "scrollBarColor": "#000000",
 "width": "100%",
 "minHeight": 20,
 "borderRadius": 0,
 "overflow": "visible",
 "propagateClick": true,
 "verticalAlign": "top",
 "minWidth": 20,
 "scrollBarVisible": "rollOver",
 "horizontalAlign": "left",
 "scrollBarOpacity": 0.5,
 "desktopMipmappingEnabled": false,
 "height": "100%",
 "definitions": [{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 105.26,
  "pitch": 0
 },
 "id": "camera_4FB528C3_4113_C5F8_41CF_DE2510533D69",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 0,
  "pitch": 0
 },
 "id": "panorama_4BEE9D91_40E2_DF6A_41C1_C8AF69BA1B59_camera",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "mouseControlMode": "drag_rotation",
 "class": "PanoramaPlayer",
 "viewerArea": "this.MainViewer",
 "gyroscopeVerticalDraggingEnabled": true,
 "touchControlMode": "drag_rotation",
 "id": "MainViewerPanoramaPlayer",
 "displayPlaybackBar": true
},
{
 "hfovMin": "135%",
 "label": "IMG_20220607_111139",
 "id": "panorama_4BED7614_40E2_CD6B_41CC_E385B25B2DC1",
 "thumbnailUrl": "media/panorama_4BED7614_40E2_CD6B_41CC_E385B25B2DC1_t.jpg",
 "hfov": 360,
 "class": "Panorama",
 "pitch": 0,
 "hfovMax": 130,
 "frames": [
  {
   "class": "CubicPanoramaFrame",
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BED7614_40E2_CD6B_41CC_E385B25B2DC1_0/f/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 2560,
      "colCount": 5,
      "rowCount": 5,
      "height": 2560
     },
     {
      "url": "media/panorama_4BED7614_40E2_CD6B_41CC_E385B25B2DC1_0/f/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_4BED7614_40E2_CD6B_41CC_E385B25B2DC1_0/f/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_4BED7614_40E2_CD6B_41CC_E385B25B2DC1_0/f/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BED7614_40E2_CD6B_41CC_E385B25B2DC1_0/u/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 2560,
      "colCount": 5,
      "rowCount": 5,
      "height": 2560
     },
     {
      "url": "media/panorama_4BED7614_40E2_CD6B_41CC_E385B25B2DC1_0/u/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_4BED7614_40E2_CD6B_41CC_E385B25B2DC1_0/u/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_4BED7614_40E2_CD6B_41CC_E385B25B2DC1_0/u/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BED7614_40E2_CD6B_41CC_E385B25B2DC1_0/r/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 2560,
      "colCount": 5,
      "rowCount": 5,
      "height": 2560
     },
     {
      "url": "media/panorama_4BED7614_40E2_CD6B_41CC_E385B25B2DC1_0/r/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_4BED7614_40E2_CD6B_41CC_E385B25B2DC1_0/r/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_4BED7614_40E2_CD6B_41CC_E385B25B2DC1_0/r/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BED7614_40E2_CD6B_41CC_E385B25B2DC1_0/b/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 2560,
      "colCount": 5,
      "rowCount": 5,
      "height": 2560
     },
     {
      "url": "media/panorama_4BED7614_40E2_CD6B_41CC_E385B25B2DC1_0/b/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_4BED7614_40E2_CD6B_41CC_E385B25B2DC1_0/b/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_4BED7614_40E2_CD6B_41CC_E385B25B2DC1_0/b/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BED7614_40E2_CD6B_41CC_E385B25B2DC1_0/d/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 2560,
      "colCount": 5,
      "rowCount": 5,
      "height": 2560
     },
     {
      "url": "media/panorama_4BED7614_40E2_CD6B_41CC_E385B25B2DC1_0/d/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_4BED7614_40E2_CD6B_41CC_E385B25B2DC1_0/d/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_4BED7614_40E2_CD6B_41CC_E385B25B2DC1_0/d/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BED7614_40E2_CD6B_41CC_E385B25B2DC1_0/l/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 2560,
      "colCount": 5,
      "rowCount": 5,
      "height": 2560
     },
     {
      "url": "media/panorama_4BED7614_40E2_CD6B_41CC_E385B25B2DC1_0/l/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_4BED7614_40E2_CD6B_41CC_E385B25B2DC1_0/l/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_4BED7614_40E2_CD6B_41CC_E385B25B2DC1_0/l/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "thumbnailUrl": "media/panorama_4BED7614_40E2_CD6B_41CC_E385B25B2DC1_t.jpg"
  }
 ],
 "adjacentPanoramas": [
  {
   "class": "AdjacentPanorama",
   "panorama": "this.panorama_4BF83BFC_40E2_DA9A_41C3_1ED8550EB1CB",
   "yaw": 35.04,
   "distance": 1,
   "backwardYaw": -74.74
  }
 ],
 "vfov": 180,
 "overlays": [
  "this.overlay_51BC4F83_40EE_5B6D_41B9_D84F38FE4DC0",
  "this.panorama_4BED7614_40E2_CD6B_41CC_E385B25B2DC1_tcap0"
 ],
 "partial": false
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 47.73,
  "pitch": 0
 },
 "id": "camera_4F7FB864_4113_C4BF_41C4_35804CA4DC77",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 180,
  "pitch": -3.27
 },
 "id": "panorama_4BED7614_40E2_CD6B_41CC_E385B25B2DC1_camera",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "hfovMin": "135%",
 "label": "IMG_20220607_110820",
 "id": "panorama_4BEED95D_40E2_479A_41AB_C0FC40701619",
 "thumbnailUrl": "media/panorama_4BEED95D_40E2_479A_41AB_C0FC40701619_t.jpg",
 "hfov": 360,
 "class": "Panorama",
 "pitch": 0,
 "hfovMax": 130,
 "frames": [
  {
   "class": "CubicPanoramaFrame",
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BEED95D_40E2_479A_41AB_C0FC40701619_0/f/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 2560,
      "colCount": 5,
      "rowCount": 5,
      "height": 2560
     },
     {
      "url": "media/panorama_4BEED95D_40E2_479A_41AB_C0FC40701619_0/f/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_4BEED95D_40E2_479A_41AB_C0FC40701619_0/f/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_4BEED95D_40E2_479A_41AB_C0FC40701619_0/f/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BEED95D_40E2_479A_41AB_C0FC40701619_0/u/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 2560,
      "colCount": 5,
      "rowCount": 5,
      "height": 2560
     },
     {
      "url": "media/panorama_4BEED95D_40E2_479A_41AB_C0FC40701619_0/u/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_4BEED95D_40E2_479A_41AB_C0FC40701619_0/u/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_4BEED95D_40E2_479A_41AB_C0FC40701619_0/u/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BEED95D_40E2_479A_41AB_C0FC40701619_0/r/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 2560,
      "colCount": 5,
      "rowCount": 5,
      "height": 2560
     },
     {
      "url": "media/panorama_4BEED95D_40E2_479A_41AB_C0FC40701619_0/r/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_4BEED95D_40E2_479A_41AB_C0FC40701619_0/r/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_4BEED95D_40E2_479A_41AB_C0FC40701619_0/r/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BEED95D_40E2_479A_41AB_C0FC40701619_0/b/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 2560,
      "colCount": 5,
      "rowCount": 5,
      "height": 2560
     },
     {
      "url": "media/panorama_4BEED95D_40E2_479A_41AB_C0FC40701619_0/b/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_4BEED95D_40E2_479A_41AB_C0FC40701619_0/b/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_4BEED95D_40E2_479A_41AB_C0FC40701619_0/b/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BEED95D_40E2_479A_41AB_C0FC40701619_0/d/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 2560,
      "colCount": 5,
      "rowCount": 5,
      "height": 2560
     },
     {
      "url": "media/panorama_4BEED95D_40E2_479A_41AB_C0FC40701619_0/d/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_4BEED95D_40E2_479A_41AB_C0FC40701619_0/d/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_4BEED95D_40E2_479A_41AB_C0FC40701619_0/d/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BEED95D_40E2_479A_41AB_C0FC40701619_0/l/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 2560,
      "colCount": 5,
      "rowCount": 5,
      "height": 2560
     },
     {
      "url": "media/panorama_4BEED95D_40E2_479A_41AB_C0FC40701619_0/l/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_4BEED95D_40E2_479A_41AB_C0FC40701619_0/l/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_4BEED95D_40E2_479A_41AB_C0FC40701619_0/l/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "thumbnailUrl": "media/panorama_4BEED95D_40E2_479A_41AB_C0FC40701619_t.jpg"
  }
 ],
 "adjacentPanoramas": [
  {
   "class": "AdjacentPanorama",
   "panorama": "this.panorama_4BC127A4_40E2_CAAB_41C7_EF5056BCD510",
   "yaw": 86.29,
   "distance": 1,
   "backwardYaw": -117.45
  },
  {
   "class": "AdjacentPanorama",
   "panorama": "this.panorama_4BFC03A2_40E2_CAAE_41CB_34B6FD320E0C",
   "yaw": -106.14,
   "distance": 1,
   "backwardYaw": 68.71
  }
 ],
 "vfov": 180,
 "overlays": [
  "this.overlay_5092F86E_40E2_45B7_41C5_8C9B01659C1F",
  "this.overlay_502E9E65_40E2_5DAA_4195_A2FE7657E7EB",
  "this.panorama_4BEED95D_40E2_479A_41AB_C0FC40701619_tcap0"
 ],
 "partial": false
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -135.91,
  "pitch": 0
 },
 "id": "camera_4F9D988D_4113_C589_4195_BAC3D0DAA606",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -144.96,
  "pitch": 0
 },
 "id": "camera_4FBAD8B5_4113_C598_41BF_83177FFC08B0",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 68.08,
  "pitch": 6.78
 },
 "displayOriginPosition": {
  "hfov": 165,
  "class": "RotationalCameraDisplayPosition",
  "yaw": 68.08,
  "stereographicFactor": 1,
  "pitch": -90
 },
 "id": "panorama_4BFC03A2_40E2_CAAE_41CB_34B6FD320E0C_camera",
 "displayMovements": [
  {
   "duration": 1000,
   "class": "TargetRotationalCameraDisplayMovement",
   "easing": "linear"
  },
  {
   "duration": 3000,
   "class": "TargetRotationalCameraDisplayMovement",
   "targetPitch": 6.78,
   "targetStereographicFactor": 0,
   "easing": "cubic_in_out"
  }
 ],
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 121.59,
  "pitch": 0
 },
 "id": "camera_4F81B8A7_4113_C5B8_41B0_386C4847AED8",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -86.42,
  "pitch": 0
 },
 "id": "camera_4FE93919_4113_C489_41A2_327592505FBF",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "hfovMin": "135%",
 "label": "IMG_20220607_110845",
 "id": "panorama_4BEE9D91_40E2_DF6A_41C1_C8AF69BA1B59",
 "thumbnailUrl": "media/panorama_4BEE9D91_40E2_DF6A_41C1_C8AF69BA1B59_t.jpg",
 "hfov": 360,
 "class": "Panorama",
 "pitch": 0,
 "hfovMax": 130,
 "frames": [
  {
   "class": "CubicPanoramaFrame",
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BEE9D91_40E2_DF6A_41C1_C8AF69BA1B59_0/f/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 2560,
      "colCount": 5,
      "rowCount": 5,
      "height": 2560
     },
     {
      "url": "media/panorama_4BEE9D91_40E2_DF6A_41C1_C8AF69BA1B59_0/f/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_4BEE9D91_40E2_DF6A_41C1_C8AF69BA1B59_0/f/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_4BEE9D91_40E2_DF6A_41C1_C8AF69BA1B59_0/f/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BEE9D91_40E2_DF6A_41C1_C8AF69BA1B59_0/u/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 2560,
      "colCount": 5,
      "rowCount": 5,
      "height": 2560
     },
     {
      "url": "media/panorama_4BEE9D91_40E2_DF6A_41C1_C8AF69BA1B59_0/u/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_4BEE9D91_40E2_DF6A_41C1_C8AF69BA1B59_0/u/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_4BEE9D91_40E2_DF6A_41C1_C8AF69BA1B59_0/u/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BEE9D91_40E2_DF6A_41C1_C8AF69BA1B59_0/r/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 2560,
      "colCount": 5,
      "rowCount": 5,
      "height": 2560
     },
     {
      "url": "media/panorama_4BEE9D91_40E2_DF6A_41C1_C8AF69BA1B59_0/r/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_4BEE9D91_40E2_DF6A_41C1_C8AF69BA1B59_0/r/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_4BEE9D91_40E2_DF6A_41C1_C8AF69BA1B59_0/r/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BEE9D91_40E2_DF6A_41C1_C8AF69BA1B59_0/b/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 2560,
      "colCount": 5,
      "rowCount": 5,
      "height": 2560
     },
     {
      "url": "media/panorama_4BEE9D91_40E2_DF6A_41C1_C8AF69BA1B59_0/b/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_4BEE9D91_40E2_DF6A_41C1_C8AF69BA1B59_0/b/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_4BEE9D91_40E2_DF6A_41C1_C8AF69BA1B59_0/b/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BEE9D91_40E2_DF6A_41C1_C8AF69BA1B59_0/d/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 2560,
      "colCount": 5,
      "rowCount": 5,
      "height": 2560
     },
     {
      "url": "media/panorama_4BEE9D91_40E2_DF6A_41C1_C8AF69BA1B59_0/d/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_4BEE9D91_40E2_DF6A_41C1_C8AF69BA1B59_0/d/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_4BEE9D91_40E2_DF6A_41C1_C8AF69BA1B59_0/d/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BEE9D91_40E2_DF6A_41C1_C8AF69BA1B59_0/l/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 2560,
      "colCount": 5,
      "rowCount": 5,
      "height": 2560
     },
     {
      "url": "media/panorama_4BEE9D91_40E2_DF6A_41C1_C8AF69BA1B59_0/l/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_4BEE9D91_40E2_DF6A_41C1_C8AF69BA1B59_0/l/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_4BEE9D91_40E2_DF6A_41C1_C8AF69BA1B59_0/l/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "thumbnailUrl": "media/panorama_4BEE9D91_40E2_DF6A_41C1_C8AF69BA1B59_t.jpg"
  }
 ],
 "adjacentPanoramas": [
  {
   "class": "AdjacentPanorama",
   "panorama": "this.panorama_4BFC03A2_40E2_CAAE_41CB_34B6FD320E0C",
   "yaw": 116.19,
   "distance": 1,
   "backwardYaw": -108.66
  }
 ],
 "vfov": 180,
 "overlays": [
  "this.overlay_50C9E7E1_40E3_CAAA_41C3_1F3EAC0A4C83",
  "this.panorama_4BEE9D91_40E2_DF6A_41C1_C8AF69BA1B59_tcap0"
 ],
 "partial": false
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -50.75,
  "pitch": 0
 },
 "id": "camera_4F764872_4113_C49B_41BB_702FE2DBD19D",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -63.81,
  "pitch": 0
 },
 "id": "camera_4E157934_4113_C49F_41BA_8B86E7F5C8B1",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -56.03,
  "pitch": 0
 },
 "id": "camera_4F78F856_4113_C49B_41CD_F80B4ED02EE0",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 0,
  "pitch": 0
 },
 "id": "panorama_4BED90B6_40E2_4696_4190_7C660E9B5B7E_camera",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 17.58,
  "pitch": 0
 },
 "id": "camera_4F60B880_4113_C477_41C0_627C9228009E",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -93.71,
  "pitch": 0
 },
 "id": "camera_4FE44926_4113_C4BB_41A0_0E66DAC70975",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -76.12,
  "pitch": -6.03
 },
 "id": "panorama_4BF83BFC_40E2_DA9A_41C3_1ED8550EB1CB_camera",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 40.45,
  "pitch": -3.52
 },
 "id": "panorama_4BC127A4_40E2_CAAB_41C7_EF5056BCD510_camera",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "hfovMin": "135%",
 "label": "IMG_20220607_111222",
 "id": "panorama_4BEDD4DE_40E2_4E96_41C6_540F09E61BA7",
 "thumbnailUrl": "media/panorama_4BEDD4DE_40E2_4E96_41C6_540F09E61BA7_t.jpg",
 "hfov": 360,
 "class": "Panorama",
 "pitch": 0,
 "hfovMax": 130,
 "frames": [
  {
   "class": "CubicPanoramaFrame",
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BEDD4DE_40E2_4E96_41C6_540F09E61BA7_0/f/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 2560,
      "colCount": 5,
      "rowCount": 5,
      "height": 2560
     },
     {
      "url": "media/panorama_4BEDD4DE_40E2_4E96_41C6_540F09E61BA7_0/f/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_4BEDD4DE_40E2_4E96_41C6_540F09E61BA7_0/f/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_4BEDD4DE_40E2_4E96_41C6_540F09E61BA7_0/f/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BEDD4DE_40E2_4E96_41C6_540F09E61BA7_0/u/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 2560,
      "colCount": 5,
      "rowCount": 5,
      "height": 2560
     },
     {
      "url": "media/panorama_4BEDD4DE_40E2_4E96_41C6_540F09E61BA7_0/u/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_4BEDD4DE_40E2_4E96_41C6_540F09E61BA7_0/u/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_4BEDD4DE_40E2_4E96_41C6_540F09E61BA7_0/u/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BEDD4DE_40E2_4E96_41C6_540F09E61BA7_0/r/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 2560,
      "colCount": 5,
      "rowCount": 5,
      "height": 2560
     },
     {
      "url": "media/panorama_4BEDD4DE_40E2_4E96_41C6_540F09E61BA7_0/r/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_4BEDD4DE_40E2_4E96_41C6_540F09E61BA7_0/r/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_4BEDD4DE_40E2_4E96_41C6_540F09E61BA7_0/r/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BEDD4DE_40E2_4E96_41C6_540F09E61BA7_0/b/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 2560,
      "colCount": 5,
      "rowCount": 5,
      "height": 2560
     },
     {
      "url": "media/panorama_4BEDD4DE_40E2_4E96_41C6_540F09E61BA7_0/b/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_4BEDD4DE_40E2_4E96_41C6_540F09E61BA7_0/b/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_4BEDD4DE_40E2_4E96_41C6_540F09E61BA7_0/b/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BEDD4DE_40E2_4E96_41C6_540F09E61BA7_0/d/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 2560,
      "colCount": 5,
      "rowCount": 5,
      "height": 2560
     },
     {
      "url": "media/panorama_4BEDD4DE_40E2_4E96_41C6_540F09E61BA7_0/d/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_4BEDD4DE_40E2_4E96_41C6_540F09E61BA7_0/d/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_4BEDD4DE_40E2_4E96_41C6_540F09E61BA7_0/d/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BEDD4DE_40E2_4E96_41C6_540F09E61BA7_0/l/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 2560,
      "colCount": 5,
      "rowCount": 5,
      "height": 2560
     },
     {
      "url": "media/panorama_4BEDD4DE_40E2_4E96_41C6_540F09E61BA7_0/l/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_4BEDD4DE_40E2_4E96_41C6_540F09E61BA7_0/l/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_4BEDD4DE_40E2_4E96_41C6_540F09E61BA7_0/l/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "thumbnailUrl": "media/panorama_4BEDD4DE_40E2_4E96_41C6_540F09E61BA7_t.jpg"
  }
 ],
 "adjacentPanoramas": [
  {
   "class": "AdjacentPanorama",
   "panorama": "this.panorama_4BFADABB_40E2_5A9E_41CB_CD93DB1F4D6B",
   "yaw": -133.53,
   "distance": 1,
   "backwardYaw": 129.25
  }
 ],
 "vfov": 180,
 "overlays": [
  "this.overlay_532B34A9_40FE_4EBA_41C7_A264F826B223",
  "this.panorama_4BEDD4DE_40E2_4E96_41C6_540F09E61BA7_tcap0"
 ],
 "partial": false
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 62.55,
  "pitch": 0
 },
 "id": "camera_4FCFF8FD_4113_C589_41C6_E0570F22E582",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 46.47,
  "pitch": 0
 },
 "id": "camera_4FD508EE_4113_C588_41A3_E9FDCF8A5FD5",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -83.91,
  "pitch": 0
 },
 "id": "camera_4F94E89A_4113_C588_41B8_5B20271C064F",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 71.34,
  "pitch": 0
 },
 "id": "camera_4FAE48D2_4113_C598_41CB_300EF883E4AF",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 0,
  "pitch": 0
 },
 "id": "panorama_4BEDD4DE_40E2_4E96_41C6_540F09E61BA7_camera",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "hfovMin": "135%",
 "label": "IMG_20220607_111125",
 "id": "panorama_4BF83BFC_40E2_DA9A_41C3_1ED8550EB1CB",
 "thumbnailUrl": "media/panorama_4BF83BFC_40E2_DA9A_41C3_1ED8550EB1CB_t.jpg",
 "hfov": 360,
 "class": "Panorama",
 "pitch": 0,
 "hfovMax": 130,
 "frames": [
  {
   "class": "CubicPanoramaFrame",
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BF83BFC_40E2_DA9A_41C3_1ED8550EB1CB_0/f/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 2560,
      "colCount": 5,
      "rowCount": 5,
      "height": 2560
     },
     {
      "url": "media/panorama_4BF83BFC_40E2_DA9A_41C3_1ED8550EB1CB_0/f/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_4BF83BFC_40E2_DA9A_41C3_1ED8550EB1CB_0/f/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_4BF83BFC_40E2_DA9A_41C3_1ED8550EB1CB_0/f/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BF83BFC_40E2_DA9A_41C3_1ED8550EB1CB_0/u/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 2560,
      "colCount": 5,
      "rowCount": 5,
      "height": 2560
     },
     {
      "url": "media/panorama_4BF83BFC_40E2_DA9A_41C3_1ED8550EB1CB_0/u/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_4BF83BFC_40E2_DA9A_41C3_1ED8550EB1CB_0/u/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_4BF83BFC_40E2_DA9A_41C3_1ED8550EB1CB_0/u/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BF83BFC_40E2_DA9A_41C3_1ED8550EB1CB_0/r/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 2560,
      "colCount": 5,
      "rowCount": 5,
      "height": 2560
     },
     {
      "url": "media/panorama_4BF83BFC_40E2_DA9A_41C3_1ED8550EB1CB_0/r/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_4BF83BFC_40E2_DA9A_41C3_1ED8550EB1CB_0/r/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_4BF83BFC_40E2_DA9A_41C3_1ED8550EB1CB_0/r/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BF83BFC_40E2_DA9A_41C3_1ED8550EB1CB_0/b/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 2560,
      "colCount": 5,
      "rowCount": 5,
      "height": 2560
     },
     {
      "url": "media/panorama_4BF83BFC_40E2_DA9A_41C3_1ED8550EB1CB_0/b/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_4BF83BFC_40E2_DA9A_41C3_1ED8550EB1CB_0/b/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_4BF83BFC_40E2_DA9A_41C3_1ED8550EB1CB_0/b/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BF83BFC_40E2_DA9A_41C3_1ED8550EB1CB_0/d/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 2560,
      "colCount": 5,
      "rowCount": 5,
      "height": 2560
     },
     {
      "url": "media/panorama_4BF83BFC_40E2_DA9A_41C3_1ED8550EB1CB_0/d/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_4BF83BFC_40E2_DA9A_41C3_1ED8550EB1CB_0/d/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_4BF83BFC_40E2_DA9A_41C3_1ED8550EB1CB_0/d/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BF83BFC_40E2_DA9A_41C3_1ED8550EB1CB_0/l/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 2560,
      "colCount": 5,
      "rowCount": 5,
      "height": 2560
     },
     {
      "url": "media/panorama_4BF83BFC_40E2_DA9A_41C3_1ED8550EB1CB_0/l/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_4BF83BFC_40E2_DA9A_41C3_1ED8550EB1CB_0/l/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_4BF83BFC_40E2_DA9A_41C3_1ED8550EB1CB_0/l/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "thumbnailUrl": "media/panorama_4BF83BFC_40E2_DA9A_41C3_1ED8550EB1CB_t.jpg"
  }
 ],
 "adjacentPanoramas": [
  {
   "class": "AdjacentPanorama",
   "panorama": "this.panorama_4BEE91AB_40E2_C6BD_41C2_F4498EFC0B70",
   "yaw": 96.09,
   "distance": 1,
   "backwardYaw": -58.41
  },
  {
   "class": "AdjacentPanorama",
   "panorama": "this.panorama_4BED7614_40E2_CD6B_41CC_E385B25B2DC1",
   "yaw": -74.74,
   "distance": 1,
   "backwardYaw": 35.04
  }
 ],
 "vfov": 180,
 "overlays": [
  "this.overlay_51CF4F30_40E1_BBAB_41C6_E7B883E1CCD0",
  "this.overlay_52CC8156_40EE_C796_41C4_647F08DF3296",
  "this.panorama_4BF83BFC_40E2_DA9A_41C3_1ED8550EB1CB_tcap0"
 ],
 "partial": false
},
{
 "hfovMin": "135%",
 "label": "IMG_20220607_111210",
 "id": "panorama_4BFADABB_40E2_5A9E_41CB_CD93DB1F4D6B",
 "thumbnailUrl": "media/panorama_4BFADABB_40E2_5A9E_41CB_CD93DB1F4D6B_t.jpg",
 "hfov": 360,
 "class": "Panorama",
 "pitch": 0,
 "hfovMax": 130,
 "frames": [
  {
   "class": "CubicPanoramaFrame",
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BFADABB_40E2_5A9E_41CB_CD93DB1F4D6B_0/f/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 2560,
      "colCount": 5,
      "rowCount": 5,
      "height": 2560
     },
     {
      "url": "media/panorama_4BFADABB_40E2_5A9E_41CB_CD93DB1F4D6B_0/f/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_4BFADABB_40E2_5A9E_41CB_CD93DB1F4D6B_0/f/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_4BFADABB_40E2_5A9E_41CB_CD93DB1F4D6B_0/f/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BFADABB_40E2_5A9E_41CB_CD93DB1F4D6B_0/u/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 2560,
      "colCount": 5,
      "rowCount": 5,
      "height": 2560
     },
     {
      "url": "media/panorama_4BFADABB_40E2_5A9E_41CB_CD93DB1F4D6B_0/u/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_4BFADABB_40E2_5A9E_41CB_CD93DB1F4D6B_0/u/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_4BFADABB_40E2_5A9E_41CB_CD93DB1F4D6B_0/u/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BFADABB_40E2_5A9E_41CB_CD93DB1F4D6B_0/r/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 2560,
      "colCount": 5,
      "rowCount": 5,
      "height": 2560
     },
     {
      "url": "media/panorama_4BFADABB_40E2_5A9E_41CB_CD93DB1F4D6B_0/r/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_4BFADABB_40E2_5A9E_41CB_CD93DB1F4D6B_0/r/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_4BFADABB_40E2_5A9E_41CB_CD93DB1F4D6B_0/r/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BFADABB_40E2_5A9E_41CB_CD93DB1F4D6B_0/b/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 2560,
      "colCount": 5,
      "rowCount": 5,
      "height": 2560
     },
     {
      "url": "media/panorama_4BFADABB_40E2_5A9E_41CB_CD93DB1F4D6B_0/b/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_4BFADABB_40E2_5A9E_41CB_CD93DB1F4D6B_0/b/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_4BFADABB_40E2_5A9E_41CB_CD93DB1F4D6B_0/b/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BFADABB_40E2_5A9E_41CB_CD93DB1F4D6B_0/d/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 2560,
      "colCount": 5,
      "rowCount": 5,
      "height": 2560
     },
     {
      "url": "media/panorama_4BFADABB_40E2_5A9E_41CB_CD93DB1F4D6B_0/d/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_4BFADABB_40E2_5A9E_41CB_CD93DB1F4D6B_0/d/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_4BFADABB_40E2_5A9E_41CB_CD93DB1F4D6B_0/d/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BFADABB_40E2_5A9E_41CB_CD93DB1F4D6B_0/l/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 2560,
      "colCount": 5,
      "rowCount": 5,
      "height": 2560
     },
     {
      "url": "media/panorama_4BFADABB_40E2_5A9E_41CB_CD93DB1F4D6B_0/l/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_4BFADABB_40E2_5A9E_41CB_CD93DB1F4D6B_0/l/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_4BFADABB_40E2_5A9E_41CB_CD93DB1F4D6B_0/l/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "thumbnailUrl": "media/panorama_4BFADABB_40E2_5A9E_41CB_CD93DB1F4D6B_t.jpg"
  }
 ],
 "adjacentPanoramas": [
  {
   "class": "AdjacentPanorama",
   "panorama": "this.panorama_4BED90B6_40E2_4696_4190_7C660E9B5B7E",
   "yaw": -132.27,
   "distance": 1,
   "backwardYaw": 7.16
  },
  {
   "class": "AdjacentPanorama",
   "panorama": "this.panorama_4BEDD4DE_40E2_4E96_41C6_540F09E61BA7",
   "yaw": 129.25,
   "distance": 1,
   "backwardYaw": -133.53
  }
 ],
 "vfov": 180,
 "overlays": [
  "this.overlay_511D49B6_40EE_4697_41B7_5EF57B6B0CD6",
  "this.overlay_52140E0A_40E1_DD7F_41B3_A1C53EBF9335",
  "this.panorama_4BFADABB_40E2_5A9E_41CB_CD93DB1F4D6B_tcap0"
 ],
 "partial": false
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 86.42,
  "pitch": -0.5
 },
 "id": "panorama_4BEED95D_40E2_479A_41AB_C0FC40701619_camera",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 73.86,
  "pitch": 0
 },
 "id": "camera_4E03C941_4113_C4F9_41C3_CB0DB2C18676",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "hfovMin": "135%",
 "label": "IMG_20220607_110833",
 "id": "panorama_4BFC03A2_40E2_CAAE_41CB_34B6FD320E0C",
 "thumbnailUrl": "media/panorama_4BFC03A2_40E2_CAAE_41CB_34B6FD320E0C_t.jpg",
 "hfov": 360,
 "class": "Panorama",
 "pitch": 0,
 "hfovMax": 130,
 "frames": [
  {
   "class": "CubicPanoramaFrame",
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BFC03A2_40E2_CAAE_41CB_34B6FD320E0C_0/f/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 2560,
      "colCount": 5,
      "rowCount": 5,
      "height": 2560
     },
     {
      "url": "media/panorama_4BFC03A2_40E2_CAAE_41CB_34B6FD320E0C_0/f/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_4BFC03A2_40E2_CAAE_41CB_34B6FD320E0C_0/f/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_4BFC03A2_40E2_CAAE_41CB_34B6FD320E0C_0/f/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BFC03A2_40E2_CAAE_41CB_34B6FD320E0C_0/u/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 2560,
      "colCount": 5,
      "rowCount": 5,
      "height": 2560
     },
     {
      "url": "media/panorama_4BFC03A2_40E2_CAAE_41CB_34B6FD320E0C_0/u/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_4BFC03A2_40E2_CAAE_41CB_34B6FD320E0C_0/u/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_4BFC03A2_40E2_CAAE_41CB_34B6FD320E0C_0/u/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BFC03A2_40E2_CAAE_41CB_34B6FD320E0C_0/r/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 2560,
      "colCount": 5,
      "rowCount": 5,
      "height": 2560
     },
     {
      "url": "media/panorama_4BFC03A2_40E2_CAAE_41CB_34B6FD320E0C_0/r/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_4BFC03A2_40E2_CAAE_41CB_34B6FD320E0C_0/r/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_4BFC03A2_40E2_CAAE_41CB_34B6FD320E0C_0/r/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BFC03A2_40E2_CAAE_41CB_34B6FD320E0C_0/b/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 2560,
      "colCount": 5,
      "rowCount": 5,
      "height": 2560
     },
     {
      "url": "media/panorama_4BFC03A2_40E2_CAAE_41CB_34B6FD320E0C_0/b/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_4BFC03A2_40E2_CAAE_41CB_34B6FD320E0C_0/b/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_4BFC03A2_40E2_CAAE_41CB_34B6FD320E0C_0/b/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BFC03A2_40E2_CAAE_41CB_34B6FD320E0C_0/d/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 2560,
      "colCount": 5,
      "rowCount": 5,
      "height": 2560
     },
     {
      "url": "media/panorama_4BFC03A2_40E2_CAAE_41CB_34B6FD320E0C_0/d/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_4BFC03A2_40E2_CAAE_41CB_34B6FD320E0C_0/d/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_4BFC03A2_40E2_CAAE_41CB_34B6FD320E0C_0/d/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BFC03A2_40E2_CAAE_41CB_34B6FD320E0C_0/l/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 2560,
      "colCount": 5,
      "rowCount": 5,
      "height": 2560
     },
     {
      "url": "media/panorama_4BFC03A2_40E2_CAAE_41CB_34B6FD320E0C_0/l/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_4BFC03A2_40E2_CAAE_41CB_34B6FD320E0C_0/l/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_4BFC03A2_40E2_CAAE_41CB_34B6FD320E0C_0/l/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "thumbnailUrl": "media/panorama_4BFC03A2_40E2_CAAE_41CB_34B6FD320E0C_t.jpg"
  }
 ],
 "adjacentPanoramas": [
  {
   "class": "AdjacentPanorama",
   "panorama": "this.panorama_4BEE9D91_40E2_DF6A_41C1_C8AF69BA1B59",
   "yaw": -108.66,
   "distance": 1,
   "backwardYaw": 116.19
  },
  {
   "class": "AdjacentPanorama",
   "panorama": "this.panorama_4BEED95D_40E2_479A_41AB_C0FC40701619",
   "yaw": 68.71,
   "distance": 1,
   "backwardYaw": -106.14
  }
 ],
 "vfov": 180,
 "overlays": [
  "this.overlay_4F98846A_40E2_4DBE_41CD_B82D9F1E4B9E",
  "this.overlay_502A5BD5_40E2_5A95_4193_AB6A286C6961",
  "this.panorama_4BFC03A2_40E2_CAAE_41CB_34B6FD320E0C_tcap0"
 ],
 "partial": false
},
{
 "hfovMin": "135%",
 "label": "IMG_20220607_111112",
 "id": "panorama_4BEE91AB_40E2_C6BD_41C2_F4498EFC0B70",
 "thumbnailUrl": "media/panorama_4BEE91AB_40E2_C6BD_41C2_F4498EFC0B70_t.jpg",
 "hfov": 360,
 "class": "Panorama",
 "pitch": 0,
 "hfovMax": 130,
 "frames": [
  {
   "class": "CubicPanoramaFrame",
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BEE91AB_40E2_C6BD_41C2_F4498EFC0B70_0/f/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 2560,
      "colCount": 5,
      "rowCount": 5,
      "height": 2560
     },
     {
      "url": "media/panorama_4BEE91AB_40E2_C6BD_41C2_F4498EFC0B70_0/f/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_4BEE91AB_40E2_C6BD_41C2_F4498EFC0B70_0/f/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_4BEE91AB_40E2_C6BD_41C2_F4498EFC0B70_0/f/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BEE91AB_40E2_C6BD_41C2_F4498EFC0B70_0/u/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 2560,
      "colCount": 5,
      "rowCount": 5,
      "height": 2560
     },
     {
      "url": "media/panorama_4BEE91AB_40E2_C6BD_41C2_F4498EFC0B70_0/u/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_4BEE91AB_40E2_C6BD_41C2_F4498EFC0B70_0/u/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_4BEE91AB_40E2_C6BD_41C2_F4498EFC0B70_0/u/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BEE91AB_40E2_C6BD_41C2_F4498EFC0B70_0/r/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 2560,
      "colCount": 5,
      "rowCount": 5,
      "height": 2560
     },
     {
      "url": "media/panorama_4BEE91AB_40E2_C6BD_41C2_F4498EFC0B70_0/r/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_4BEE91AB_40E2_C6BD_41C2_F4498EFC0B70_0/r/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_4BEE91AB_40E2_C6BD_41C2_F4498EFC0B70_0/r/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BEE91AB_40E2_C6BD_41C2_F4498EFC0B70_0/b/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 2560,
      "colCount": 5,
      "rowCount": 5,
      "height": 2560
     },
     {
      "url": "media/panorama_4BEE91AB_40E2_C6BD_41C2_F4498EFC0B70_0/b/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_4BEE91AB_40E2_C6BD_41C2_F4498EFC0B70_0/b/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_4BEE91AB_40E2_C6BD_41C2_F4498EFC0B70_0/b/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BEE91AB_40E2_C6BD_41C2_F4498EFC0B70_0/d/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 2560,
      "colCount": 5,
      "rowCount": 5,
      "height": 2560
     },
     {
      "url": "media/panorama_4BEE91AB_40E2_C6BD_41C2_F4498EFC0B70_0/d/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_4BEE91AB_40E2_C6BD_41C2_F4498EFC0B70_0/d/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_4BEE91AB_40E2_C6BD_41C2_F4498EFC0B70_0/d/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BEE91AB_40E2_C6BD_41C2_F4498EFC0B70_0/l/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 2560,
      "colCount": 5,
      "rowCount": 5,
      "height": 2560
     },
     {
      "url": "media/panorama_4BEE91AB_40E2_C6BD_41C2_F4498EFC0B70_0/l/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_4BEE91AB_40E2_C6BD_41C2_F4498EFC0B70_0/l/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_4BEE91AB_40E2_C6BD_41C2_F4498EFC0B70_0/l/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "thumbnailUrl": "media/panorama_4BEE91AB_40E2_C6BD_41C2_F4498EFC0B70_t.jpg"
  }
 ],
 "adjacentPanoramas": [
  {
   "class": "AdjacentPanorama",
   "panorama": "this.panorama_4BED90B6_40E2_4696_4190_7C660E9B5B7E",
   "yaw": 123.97,
   "distance": 1,
   "backwardYaw": -162.42
  },
  {
   "class": "AdjacentPanorama",
   "panorama": "this.panorama_4BC127A4_40E2_CAAB_41C7_EF5056BCD510",
   "yaw": 93.58,
   "distance": 1,
   "backwardYaw": 44.09
  },
  {
   "class": "AdjacentPanorama",
   "panorama": "this.panorama_4BF83BFC_40E2_DA9A_41C3_1ED8550EB1CB",
   "yaw": -58.41,
   "distance": 1,
   "backwardYaw": 96.09
  }
 ],
 "vfov": 180,
 "overlays": [
  "this.overlay_5354B1B3_40E2_46AE_4194_A3D960481E0B",
  "this.overlay_54D6C699_40E3_CA9A_41B1_4CB90084C646",
  "this.overlay_54C00ED3_40FE_DAED_4168_9486D3FFEEC0",
  "this.panorama_4BEE91AB_40E2_C6BD_41C2_F4498EFC0B70_tcap0"
 ],
 "partial": false
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -111.29,
  "pitch": 0
 },
 "id": "camera_4FFAF90B_4113_C489_41B4_43928A07BEA1",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "class": "MediaAudio",
 "audio": {
  "class": "AudioResource",
  "mp3Url": "media/audio_5DF15EFC_40E1_DA9A_418A_0627C2B825A5.mp3",
  "oggUrl": "media/audio_5DF15EFC_40E1_DA9A_418A_0627C2B825A5.ogg"
 },
 "autoplay": true,
 "id": "audio_5DF15EFC_40E1_DA9A_418A_0627C2B825A5",
 "data": {
  "label": "Brown Suga"
 }
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -66.32,
  "pitch": -3.77
 },
 "id": "panorama_4BEE91AB_40E2_C6BD_41C2_F4498EFC0B70_camera",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": 28.14,
  "pitch": -0.25
 },
 "id": "panorama_4BFADABB_40E2_5A9E_41CB_CD93DB1F4D6B_camera",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "class": "PlayList",
 "items": [
  {
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_4BFC03A2_40E2_CAAE_41CB_34B6FD320E0C_camera",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 0, 1)",
   "media": "this.panorama_4BFC03A2_40E2_CAAE_41CB_34B6FD320E0C",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_4BEE9D91_40E2_DF6A_41C1_C8AF69BA1B59_camera",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 1, 2)",
   "media": "this.panorama_4BEE9D91_40E2_DF6A_41C1_C8AF69BA1B59",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_4BEDD4DE_40E2_4E96_41C6_540F09E61BA7_camera",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 2, 3)",
   "media": "this.panorama_4BEDD4DE_40E2_4E96_41C6_540F09E61BA7",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_4BEE91AB_40E2_C6BD_41C2_F4498EFC0B70_camera",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 3, 4)",
   "media": "this.panorama_4BEE91AB_40E2_C6BD_41C2_F4498EFC0B70",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_4BC127A4_40E2_CAAB_41C7_EF5056BCD510_camera",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 4, 5)",
   "media": "this.panorama_4BC127A4_40E2_CAAB_41C7_EF5056BCD510",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_4BF83BFC_40E2_DA9A_41C3_1ED8550EB1CB_camera",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 5, 6)",
   "media": "this.panorama_4BF83BFC_40E2_DA9A_41C3_1ED8550EB1CB",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_4BED7614_40E2_CD6B_41CC_E385B25B2DC1_camera",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 6, 7)",
   "media": "this.panorama_4BED7614_40E2_CD6B_41CC_E385B25B2DC1",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_4BED90B6_40E2_4696_4190_7C660E9B5B7E_camera",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 7, 8)",
   "media": "this.panorama_4BED90B6_40E2_4696_4190_7C660E9B5B7E",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "class": "PanoramaPlayListItem",
   "camera": "this.panorama_4BFADABB_40E2_5A9E_41CB_CD93DB1F4D6B_camera",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 8, 9)",
   "media": "this.panorama_4BFADABB_40E2_5A9E_41CB_CD93DB1F4D6B",
   "player": "this.MainViewerPanoramaPlayer"
  },
  {
   "class": "PanoramaPlayListItem",
   "end": "this.trigger('tourEnded')",
   "player": "this.MainViewerPanoramaPlayer",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 9, 0)",
   "media": "this.panorama_4BEED95D_40E2_479A_41AB_C0FC40701619",
   "camera": "this.panorama_4BEED95D_40E2_479A_41AB_C0FC40701619_camera"
  }
 ],
 "id": "mainPlayList"
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "yaw": -172.84,
  "pitch": 0
 },
 "id": "camera_4FD8D8E0_4113_C5B8_41C6_C8B41A091182",
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_in"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 323,
    "easing": "linear"
   },
   {
    "yawSpeed": 7.96,
    "class": "DistancePanoramaCameraMovement",
    "yawDelta": 18.5,
    "easing": "cubic_out"
   }
  ],
  "restartMovementOnUserInteraction": false
 }
},
{
 "hfovMin": "135%",
 "label": "IMG_20220607_111157",
 "id": "panorama_4BED90B6_40E2_4696_4190_7C660E9B5B7E",
 "thumbnailUrl": "media/panorama_4BED90B6_40E2_4696_4190_7C660E9B5B7E_t.jpg",
 "hfov": 360,
 "class": "Panorama",
 "pitch": 0,
 "hfovMax": 130,
 "frames": [
  {
   "class": "CubicPanoramaFrame",
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BED90B6_40E2_4696_4190_7C660E9B5B7E_0/f/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 2560,
      "colCount": 5,
      "rowCount": 5,
      "height": 2560
     },
     {
      "url": "media/panorama_4BED90B6_40E2_4696_4190_7C660E9B5B7E_0/f/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_4BED90B6_40E2_4696_4190_7C660E9B5B7E_0/f/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_4BED90B6_40E2_4696_4190_7C660E9B5B7E_0/f/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BED90B6_40E2_4696_4190_7C660E9B5B7E_0/u/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 2560,
      "colCount": 5,
      "rowCount": 5,
      "height": 2560
     },
     {
      "url": "media/panorama_4BED90B6_40E2_4696_4190_7C660E9B5B7E_0/u/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_4BED90B6_40E2_4696_4190_7C660E9B5B7E_0/u/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_4BED90B6_40E2_4696_4190_7C660E9B5B7E_0/u/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BED90B6_40E2_4696_4190_7C660E9B5B7E_0/r/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 2560,
      "colCount": 5,
      "rowCount": 5,
      "height": 2560
     },
     {
      "url": "media/panorama_4BED90B6_40E2_4696_4190_7C660E9B5B7E_0/r/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_4BED90B6_40E2_4696_4190_7C660E9B5B7E_0/r/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_4BED90B6_40E2_4696_4190_7C660E9B5B7E_0/r/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BED90B6_40E2_4696_4190_7C660E9B5B7E_0/b/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 2560,
      "colCount": 5,
      "rowCount": 5,
      "height": 2560
     },
     {
      "url": "media/panorama_4BED90B6_40E2_4696_4190_7C660E9B5B7E_0/b/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_4BED90B6_40E2_4696_4190_7C660E9B5B7E_0/b/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_4BED90B6_40E2_4696_4190_7C660E9B5B7E_0/b/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BED90B6_40E2_4696_4190_7C660E9B5B7E_0/d/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 2560,
      "colCount": 5,
      "rowCount": 5,
      "height": 2560
     },
     {
      "url": "media/panorama_4BED90B6_40E2_4696_4190_7C660E9B5B7E_0/d/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_4BED90B6_40E2_4696_4190_7C660E9B5B7E_0/d/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_4BED90B6_40E2_4696_4190_7C660E9B5B7E_0/d/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BED90B6_40E2_4696_4190_7C660E9B5B7E_0/l/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 2560,
      "colCount": 5,
      "rowCount": 5,
      "height": 2560
     },
     {
      "url": "media/panorama_4BED90B6_40E2_4696_4190_7C660E9B5B7E_0/l/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_4BED90B6_40E2_4696_4190_7C660E9B5B7E_0/l/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_4BED90B6_40E2_4696_4190_7C660E9B5B7E_0/l/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "thumbnailUrl": "media/panorama_4BED90B6_40E2_4696_4190_7C660E9B5B7E_t.jpg"
  }
 ],
 "adjacentPanoramas": [
  {
   "class": "AdjacentPanorama",
   "panorama": "this.panorama_4BEE91AB_40E2_C6BD_41C2_F4498EFC0B70",
   "yaw": -162.42,
   "distance": 1,
   "backwardYaw": 123.97
  },
  {
   "class": "AdjacentPanorama",
   "panorama": "this.panorama_4BFADABB_40E2_5A9E_41CB_CD93DB1F4D6B",
   "yaw": 7.16,
   "distance": 1,
   "backwardYaw": -132.27
  }
 ],
 "vfov": 180,
 "overlays": [
  "this.overlay_5175B614_40EF_CD6B_41A2_A4533CF7B719",
  "this.overlay_51408756_40EE_CB97_419F_FCC108B44E51",
  "this.panorama_4BED90B6_40E2_4696_4190_7C660E9B5B7E_tcap0"
 ],
 "partial": false
},
{
 "hfovMin": "135%",
 "label": "IMG_20220607_111047",
 "id": "panorama_4BC127A4_40E2_CAAB_41C7_EF5056BCD510",
 "thumbnailUrl": "media/panorama_4BC127A4_40E2_CAAB_41C7_EF5056BCD510_t.jpg",
 "hfov": 360,
 "class": "Panorama",
 "pitch": 0,
 "hfovMax": 130,
 "frames": [
  {
   "class": "CubicPanoramaFrame",
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BC127A4_40E2_CAAB_41C7_EF5056BCD510_0/f/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 2560,
      "colCount": 5,
      "rowCount": 5,
      "height": 2560
     },
     {
      "url": "media/panorama_4BC127A4_40E2_CAAB_41C7_EF5056BCD510_0/f/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_4BC127A4_40E2_CAAB_41C7_EF5056BCD510_0/f/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_4BC127A4_40E2_CAAB_41C7_EF5056BCD510_0/f/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BC127A4_40E2_CAAB_41C7_EF5056BCD510_0/u/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 2560,
      "colCount": 5,
      "rowCount": 5,
      "height": 2560
     },
     {
      "url": "media/panorama_4BC127A4_40E2_CAAB_41C7_EF5056BCD510_0/u/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_4BC127A4_40E2_CAAB_41C7_EF5056BCD510_0/u/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_4BC127A4_40E2_CAAB_41C7_EF5056BCD510_0/u/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BC127A4_40E2_CAAB_41C7_EF5056BCD510_0/r/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 2560,
      "colCount": 5,
      "rowCount": 5,
      "height": 2560
     },
     {
      "url": "media/panorama_4BC127A4_40E2_CAAB_41C7_EF5056BCD510_0/r/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_4BC127A4_40E2_CAAB_41C7_EF5056BCD510_0/r/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_4BC127A4_40E2_CAAB_41C7_EF5056BCD510_0/r/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BC127A4_40E2_CAAB_41C7_EF5056BCD510_0/b/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 2560,
      "colCount": 5,
      "rowCount": 5,
      "height": 2560
     },
     {
      "url": "media/panorama_4BC127A4_40E2_CAAB_41C7_EF5056BCD510_0/b/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_4BC127A4_40E2_CAAB_41C7_EF5056BCD510_0/b/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_4BC127A4_40E2_CAAB_41C7_EF5056BCD510_0/b/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BC127A4_40E2_CAAB_41C7_EF5056BCD510_0/d/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 2560,
      "colCount": 5,
      "rowCount": 5,
      "height": 2560
     },
     {
      "url": "media/panorama_4BC127A4_40E2_CAAB_41C7_EF5056BCD510_0/d/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_4BC127A4_40E2_CAAB_41C7_EF5056BCD510_0/d/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_4BC127A4_40E2_CAAB_41C7_EF5056BCD510_0/d/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BC127A4_40E2_CAAB_41C7_EF5056BCD510_0/l/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 2560,
      "colCount": 5,
      "rowCount": 5,
      "height": 2560
     },
     {
      "url": "media/panorama_4BC127A4_40E2_CAAB_41C7_EF5056BCD510_0/l/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1536,
      "colCount": 3,
      "rowCount": 3,
      "height": 1536
     },
     {
      "url": "media/panorama_4BC127A4_40E2_CAAB_41C7_EF5056BCD510_0/l/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": "ondemand",
      "width": 1024,
      "colCount": 2,
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_4BC127A4_40E2_CAAB_41C7_EF5056BCD510_0/l/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "tags": [
       "ondemand",
       "preload"
      ],
      "width": 512,
      "colCount": 1,
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "thumbnailUrl": "media/panorama_4BC127A4_40E2_CAAB_41C7_EF5056BCD510_t.jpg"
  }
 ],
 "adjacentPanoramas": [
  {
   "class": "AdjacentPanorama",
   "panorama": "this.panorama_4BEE91AB_40E2_C6BD_41C2_F4498EFC0B70",
   "yaw": 44.09,
   "distance": 1,
   "backwardYaw": 93.58
  },
  {
   "class": "AdjacentPanorama",
   "panorama": "this.panorama_4BEED95D_40E2_479A_41AB_C0FC40701619",
   "yaw": -117.45,
   "distance": 1,
   "backwardYaw": 86.29
  }
 ],
 "vfov": 180,
 "overlays": [
  "this.overlay_5078EAFE_40E2_7A96_41A2_B44537E39B6E",
  "this.overlay_515964DA_40E1_CE9F_41A0_0F8229498831",
  "this.panorama_4BC127A4_40E2_CAAB_41C7_EF5056BCD510_tcap0"
 ],
 "partial": false
},
{
 "toolTipFontWeight": "normal",
 "playbackBarBackgroundColorDirection": "vertical",
 "id": "MainViewer",
 "left": 0,
 "playbackBarRight": 0,
 "class": "ViewerArea",
 "playbackBarProgressBorderRadius": 0,
 "progressBarBorderSize": 0,
 "playbackBarProgressBorderSize": 0,
 "progressBarBorderRadius": 0,
 "width": "100%",
 "paddingLeft": 0,
 "playbackBarBorderRadius": 0,
 "toolTipShadowOpacity": 0,
 "minHeight": 50,
 "playbackBarProgressBorderColor": "#000000",
 "toolTipFontStyle": "normal",
 "playbackBarHeadBorderColor": "#000000",
 "toolTipFontFamily": "Georgia",
 "progressLeft": 0,
 "propagateClick": true,
 "toolTipTextShadowOpacity": 0,
 "playbackBarHeadBorderRadius": 0,
 "height": "100%",
 "minWidth": 100,
 "playbackBarBorderSize": 0,
 "playbackBarHeadBorderSize": 0,
 "playbackBarProgressOpacity": 1,
 "vrPointerSelectionColor": "#FF6600",
 "playbackBarBackgroundOpacity": 1,
 "playbackBarHeadBackgroundColor": [
  "#111111",
  "#666666"
 ],
 "playbackBarHeadShadowColor": "#000000",
 "progressRight": 0,
 "firstTransitionDuration": 0,
 "progressOpacity": 1,
 "toolTipBackgroundColor": "#000000",
 "progressBarBackgroundColorDirection": "vertical",
 "toolTipFontColor": "#FFFFFF",
 "vrPointerSelectionTime": 2000,
 "progressHeight": 10,
 "playbackBarHeadShadow": true,
 "progressBottom": 0,
 "shadow": false,
 "playbackBarHeadBackgroundColorDirection": "vertical",
 "progressBackgroundOpacity": 1,
 "playbackBarProgressBackgroundColor": [
  "#3399FF"
 ],
 "playbackBarOpacity": 1,
 "playbackBarHeadShadowOpacity": 0.7,
 "vrPointerColor": "#FFFFFF",
 "toolTipPaddingRight": 10,
 "playbackBarHeadShadowVerticalLength": 0,
 "paddingRight": 0,
 "progressBarOpacity": 1,
 "borderSize": 0,
 "toolTipPaddingTop": 7,
 "toolTipBorderSize": 1,
 "toolTipDisplayTime": 600,
 "toolTipPaddingLeft": 10,
 "progressBorderSize": 0,
 "displayTooltipInTouchScreens": true,
 "progressBorderRadius": 0,
 "playbackBarBorderColor": "#FFFFFF",
 "toolTipBorderRadius": 3,
 "borderRadius": 0,
 "transitionMode": "blending",
 "playbackBarProgressBackgroundColorRatios": [
  0
 ],
 "progressBackgroundColorRatios": [
  0.01
 ],
 "playbackBarHeadHeight": 15,
 "playbackBarHeadBackgroundColorRatios": [
  0,
  1
 ],
 "top": 0,
 "playbackBarHeadShadowBlurRadius": 3,
 "progressBarBorderColor": "#0066FF",
 "progressBarBackgroundColorRatios": [
  0
 ],
 "progressBackgroundColorDirection": "vertical",
 "transitionDuration": 500,
 "playbackBarHeadOpacity": 1,
 "playbackBarBottom": 5,
 "progressBorderColor": "#FFFFFF",
 "playbackBarLeft": 0,
 "toolTipShadowSpread": 0,
 "toolTipShadowBlurRadius": 3,
 "paddingBottom": 0,
 "toolTipTextShadowColor": "#000000",
 "toolTipOpacity": 0.5,
 "toolTipBorderColor": "#767676",
 "playbackBarHeadShadowHorizontalLength": 0,
 "toolTipFontSize": 13,
 "paddingTop": 0,
 "toolTipPaddingBottom": 7,
 "progressBarBackgroundColor": [
  "#3399FF"
 ],
 "playbackBarProgressBackgroundColorDirection": "vertical",
 "toolTipTextShadowBlurRadius": 3,
 "progressBackgroundColor": [
  "#FFFFFF"
 ],
 "data": {
  "name": "Main Viewer"
 },
 "toolTipShadowColor": "#333333",
 "playbackBarHeight": 10,
 "playbackBarBackgroundColor": [
  "#FFFFFF"
 ],
 "playbackBarHeadWidth": 6
},
{
 "children": [
  "this.Container_7FF1F5EF_706F_7FC6_41C7_BCBB555D2D3D",
  "this.Container_7DB20382_7065_343F_4186_6E0B0B3AFF36"
 ],
 "id": "Container_7F59BED9_7065_6DCD_41D6_B4AD3EEA9174",
 "left": "0%",
 "width": 300,
 "class": "Container",
 "paddingRight": 0,
 "borderSize": 0,
 "backgroundOpacity": 0,
 "paddingLeft": 0,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "top": "0%",
 "scrollBarVisible": "rollOver",
 "propagateClick": false,
 "verticalAlign": "top",
 "minWidth": 1,
 "horizontalAlign": "left",
 "scrollBarOpacity": 0.5,
 "height": "100%",
 "gap": 10,
 "layout": "absolute",
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "paddingTop": 0,
 "scrollBarWidth": 10,
 "contentOpaque": false,
 "shadow": false,
 "data": {
  "name": "--- LEFT PANEL"
 }
},
{
 "enabledInCardboard": true,
 "class": "HotspotPanoramaOverlay",
 "areas": [
  {
   "mapColor": "#FF0000",
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_4BF83BFC_40E2_DA9A_41C3_1ED8550EB1CB, this.camera_4FB528C3_4113_C5F8_41CF_DE2510533D69); this.mainPlayList.set('selectedIndex', 5)"
  }
 ],
 "data": {
  "label": "Circle Arrow 02a"
 },
 "maps": [
  {
   "hfov": 13.91,
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 35.04,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BED7614_40E2_CD6B_41CC_E385B25B2DC1_1_HS_0_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 28,
      "height": 16
     }
    ]
   },
   "pitch": -8.37
  }
 ],
 "useHandCursor": true,
 "items": [
  {
   "hfov": 13.91,
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_55D1247D_40E2_4D9A_41AB_1973A46AF0F4",
   "pitch": -8.37,
   "yaw": 35.04,
   "distance": 100
  }
 ],
 "id": "overlay_51BC4F83_40EE_5B6D_41B9_D84F38FE4DC0",
 "rollOverDisplay": false
},
{
 "rotate": false,
 "class": "TripodCapPanoramaOverlay",
 "angle": 0,
 "distance": 50,
 "hfov": 45,
 "id": "panorama_4BED7614_40E2_CD6B_41CC_E385B25B2DC1_tcap0",
 "inertia": false,
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/panorama_4BFC03A2_40E2_CAAE_41CB_34B6FD320E0C_tcap0.png",
    "class": "ImageResourceLevel",
    "width": 1080,
    "height": 1080
   }
  ]
 }
},
{
 "enabledInCardboard": true,
 "class": "HotspotPanoramaOverlay",
 "areas": [
  {
   "mapColor": "#FF0000",
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_4BFC03A2_40E2_CAAE_41CB_34B6FD320E0C, this.camera_4FFAF90B_4113_C489_41B4_43928A07BEA1); this.mainPlayList.set('selectedIndex', 0)"
  }
 ],
 "data": {
  "label": "Circle Arrow 02a"
 },
 "maps": [
  {
   "hfov": 12.62,
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -106.14,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BEED95D_40E2_479A_41AB_C0FC40701619_1_HS_0_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 28,
      "height": 16
     }
    ]
   },
   "pitch": -26.2
  }
 ],
 "useHandCursor": true,
 "items": [
  {
   "hfov": 12.62,
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_55D0C47E_40E2_4D96_41A9_51AF6679DA3F",
   "pitch": -26.2,
   "yaw": -106.14,
   "distance": 100
  }
 ],
 "id": "overlay_5092F86E_40E2_45B7_41C5_8C9B01659C1F",
 "rollOverDisplay": false
},
{
 "enabledInCardboard": true,
 "class": "HotspotPanoramaOverlay",
 "areas": [
  {
   "mapColor": "#FF0000",
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_4BC127A4_40E2_CAAB_41C7_EF5056BCD510, this.camera_4FCFF8FD_4113_C589_41C6_E0570F22E582); this.mainPlayList.set('selectedIndex', 4)"
  }
 ],
 "data": {
  "label": "Circle Arrow 02a"
 },
 "maps": [
  {
   "hfov": 13.95,
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 86.29,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BEED95D_40E2_479A_41AB_C0FC40701619_1_HS_1_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 28,
      "height": 16
     }
    ]
   },
   "pitch": -7.36
  }
 ],
 "useHandCursor": true,
 "items": [
  {
   "hfov": 13.95,
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_55D7147E_40E2_4D96_41CE_17B0A1E0E281",
   "pitch": -7.36,
   "yaw": 86.29,
   "distance": 100
  }
 ],
 "id": "overlay_502E9E65_40E2_5DAA_4195_A2FE7657E7EB",
 "rollOverDisplay": false
},
{
 "rotate": false,
 "class": "TripodCapPanoramaOverlay",
 "angle": 0,
 "distance": 50,
 "hfov": 45,
 "id": "panorama_4BEED95D_40E2_479A_41AB_C0FC40701619_tcap0",
 "inertia": false,
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/panorama_4BFC03A2_40E2_CAAE_41CB_34B6FD320E0C_tcap0.png",
    "class": "ImageResourceLevel",
    "width": 1080,
    "height": 1080
   }
  ]
 }
},
{
 "enabledInCardboard": true,
 "class": "HotspotPanoramaOverlay",
 "areas": [
  {
   "mapColor": "#FF0000",
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_4BFC03A2_40E2_CAAE_41CB_34B6FD320E0C, this.camera_4FAE48D2_4113_C598_41CB_300EF883E4AF); this.mainPlayList.set('selectedIndex', 0)"
  }
 ],
 "data": {
  "label": "Circle Arrow 02a"
 },
 "maps": [
  {
   "hfov": 13.97,
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 116.19,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BEE9D91_40E2_DF6A_41C1_C8AF69BA1B59_1_HS_0_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 28,
      "height": 16
     }
    ]
   },
   "pitch": -6.61
  }
 ],
 "useHandCursor": true,
 "items": [
  {
   "hfov": 13.97,
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_55D3647C_40E2_4D9A_41A6_AC8A74024A44",
   "pitch": -6.61,
   "yaw": 116.19,
   "distance": 100
  }
 ],
 "id": "overlay_50C9E7E1_40E3_CAAA_41C3_1F3EAC0A4C83",
 "rollOverDisplay": false
},
{
 "rotate": false,
 "class": "TripodCapPanoramaOverlay",
 "angle": 0,
 "distance": 50,
 "hfov": 45,
 "id": "panorama_4BEE9D91_40E2_DF6A_41C1_C8AF69BA1B59_tcap0",
 "inertia": false,
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/panorama_4BFC03A2_40E2_CAAE_41CB_34B6FD320E0C_tcap0.png",
    "class": "ImageResourceLevel",
    "width": 1080,
    "height": 1080
   }
  ]
 }
},
{
 "enabledInCardboard": true,
 "class": "HotspotPanoramaOverlay",
 "areas": [
  {
   "mapColor": "#FF0000",
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_4BFADABB_40E2_5A9E_41CB_CD93DB1F4D6B, this.camera_4F764872_4113_C49B_41BB_702FE2DBD19D); this.mainPlayList.set('selectedIndex', 8)"
  }
 ],
 "data": {
  "label": "Circle Arrow 02a"
 },
 "maps": [
  {
   "hfov": 13.07,
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -133.53,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BEDD4DE_40E2_4E96_41C6_540F09E61BA7_0_HS_0_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 28,
      "height": 16
     }
    ]
   },
   "pitch": -21.68
  }
 ],
 "useHandCursor": true,
 "items": [
  {
   "hfov": 13.07,
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_549B7F75_40FE_DBAA_41C8_3607EF0B915F",
   "pitch": -21.68,
   "yaw": -133.53,
   "distance": 100
  }
 ],
 "id": "overlay_532B34A9_40FE_4EBA_41C7_A264F826B223",
 "rollOverDisplay": false
},
{
 "rotate": false,
 "class": "TripodCapPanoramaOverlay",
 "angle": 0,
 "distance": 50,
 "hfov": 45,
 "id": "panorama_4BEDD4DE_40E2_4E96_41C6_540F09E61BA7_tcap0",
 "inertia": false,
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/panorama_4BFC03A2_40E2_CAAE_41CB_34B6FD320E0C_tcap0.png",
    "class": "ImageResourceLevel",
    "width": 1080,
    "height": 1080
   }
  ]
 }
},
{
 "enabledInCardboard": true,
 "class": "HotspotPanoramaOverlay",
 "areas": [
  {
   "mapColor": "#FF0000",
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_4BED7614_40E2_CD6B_41CC_E385B25B2DC1, this.camera_4FBAD8B5_4113_C598_41BF_83177FFC08B0); this.mainPlayList.set('selectedIndex', 6)"
  }
 ],
 "data": {
  "label": "Circle Arrow 02a"
 },
 "maps": [
  {
   "hfov": 13.2,
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -74.74,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BF83BFC_40E2_DA9A_41C3_1ED8550EB1CB_1_HS_0_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 28,
      "height": 16
     }
    ]
   },
   "pitch": -20.17
  }
 ],
 "useHandCursor": true,
 "items": [
  {
   "hfov": 13.2,
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_55D2847C_40E2_4D9A_4196_88DC1F0E88D6",
   "pitch": -20.17,
   "yaw": -74.74,
   "distance": 100
  }
 ],
 "id": "overlay_51CF4F30_40E1_BBAB_41C6_E7B883E1CCD0",
 "rollOverDisplay": false
},
{
 "enabledInCardboard": true,
 "class": "HotspotPanoramaOverlay",
 "areas": [
  {
   "mapColor": "#FF0000",
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_4BEE91AB_40E2_C6BD_41C2_F4498EFC0B70, this.camera_4F81B8A7_4113_C5B8_41B0_386C4847AED8); this.mainPlayList.set('selectedIndex', 3)"
  }
 ],
 "data": {
  "label": "Circle Arrow 02a"
 },
 "maps": [
  {
   "hfov": 13.92,
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 96.09,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BF83BFC_40E2_DA9A_41C3_1ED8550EB1CB_1_HS_1_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 28,
      "height": 16
     }
    ]
   },
   "pitch": -8.11
  }
 ],
 "useHandCursor": true,
 "items": [
  {
   "hfov": 13.92,
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_55D2D47D_40E2_4D9A_41CC_DFE647F9F848",
   "pitch": -8.11,
   "yaw": 96.09,
   "distance": 100
  }
 ],
 "id": "overlay_52CC8156_40EE_C796_41C4_647F08DF3296",
 "rollOverDisplay": false
},
{
 "rotate": false,
 "class": "TripodCapPanoramaOverlay",
 "angle": 0,
 "distance": 50,
 "hfov": 45,
 "id": "panorama_4BF83BFC_40E2_DA9A_41C3_1ED8550EB1CB_tcap0",
 "inertia": false,
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/panorama_4BFC03A2_40E2_CAAE_41CB_34B6FD320E0C_tcap0.png",
    "class": "ImageResourceLevel",
    "width": 1080,
    "height": 1080
   }
  ]
 }
},
{
 "enabledInCardboard": true,
 "class": "HotspotPanoramaOverlay",
 "areas": [
  {
   "mapColor": "#FF0000",
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_4BED90B6_40E2_4696_4190_7C660E9B5B7E, this.camera_4FD8D8E0_4113_C5B8_41C6_C8B41A091182); this.mainPlayList.set('selectedIndex', 7)"
  }
 ],
 "data": {
  "label": "Circle Arrow 02a"
 },
 "maps": [
  {
   "hfov": 12.53,
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -132.27,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BFADABB_40E2_5A9E_41CB_CD93DB1F4D6B_1_HS_0_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 28,
      "height": 16
     }
    ]
   },
   "pitch": -26.96
  }
 ],
 "useHandCursor": true,
 "items": [
  {
   "hfov": 12.53,
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_55D0247D_40E2_4D9A_41C9_2EE31103997D",
   "pitch": -26.96,
   "yaw": -132.27,
   "distance": 100
  }
 ],
 "id": "overlay_511D49B6_40EE_4697_41B7_5EF57B6B0CD6",
 "rollOverDisplay": false
},
{
 "enabledInCardboard": true,
 "class": "HotspotPanoramaOverlay",
 "areas": [
  {
   "mapColor": "#FF0000",
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_4BEDD4DE_40E2_4E96_41C6_540F09E61BA7, this.camera_4FD508EE_4113_C588_41A3_E9FDCF8A5FD5); this.mainPlayList.set('selectedIndex', 2)"
  }
 ],
 "data": {
  "label": "Circle Arrow 02a"
 },
 "maps": [
  {
   "hfov": 13.75,
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 129.25,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BFADABB_40E2_5A9E_41CB_CD93DB1F4D6B_1_HS_1_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 28,
      "height": 16
     }
    ]
   },
   "pitch": -12.13
  }
 ],
 "useHandCursor": true,
 "items": [
  {
   "hfov": 13.75,
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_55D0947E_40E2_4D96_41CF_6CD86CC3E094",
   "pitch": -12.13,
   "yaw": 129.25,
   "distance": 100
  }
 ],
 "id": "overlay_52140E0A_40E1_DD7F_41B3_A1C53EBF9335",
 "rollOverDisplay": false
},
{
 "rotate": false,
 "class": "TripodCapPanoramaOverlay",
 "angle": 0,
 "distance": 50,
 "hfov": 45,
 "id": "panorama_4BFADABB_40E2_5A9E_41CB_CD93DB1F4D6B_tcap0",
 "inertia": false,
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/panorama_4BFC03A2_40E2_CAAE_41CB_34B6FD320E0C_tcap0.png",
    "class": "ImageResourceLevel",
    "width": 1080,
    "height": 1080
   }
  ]
 }
},
{
 "enabledInCardboard": true,
 "class": "HotspotPanoramaOverlay",
 "areas": [
  {
   "mapColor": "#FF0000",
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_4BEED95D_40E2_479A_41AB_C0FC40701619, this.camera_4E03C941_4113_C4F9_41C3_CB0DB2C18676); this.mainPlayList.set('selectedIndex', 9)"
  }
 ],
 "data": {
  "label": "Circle Arrow 02a"
 },
 "maps": [
  {
   "hfov": 14.02,
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 68.71,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BFC03A2_40E2_CAAE_41CB_34B6FD320E0C_1_HS_0_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 28,
      "height": 16
     }
    ]
   },
   "pitch": -4.35
  }
 ],
 "useHandCursor": true,
 "items": [
  {
   "hfov": 14.02,
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_55DCB47A_40E2_4D9E_41A3_FD42E8398779",
   "pitch": -4.35,
   "yaw": 68.71,
   "distance": 100
  }
 ],
 "id": "overlay_4F98846A_40E2_4DBE_41CD_B82D9F1E4B9E",
 "rollOverDisplay": false
},
{
 "enabledInCardboard": true,
 "class": "HotspotPanoramaOverlay",
 "areas": [
  {
   "mapColor": "#FF0000",
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_4BEE9D91_40E2_DF6A_41C1_C8AF69BA1B59, this.camera_4E157934_4113_C49F_41BA_8B86E7F5C8B1); this.mainPlayList.set('selectedIndex', 1)"
  }
 ],
 "data": {
  "label": "Circle Arrow 02a"
 },
 "maps": [
  {
   "hfov": 12.93,
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -108.66,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BFC03A2_40E2_CAAE_41CB_34B6FD320E0C_1_HS_1_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 28,
      "height": 16
     }
    ]
   },
   "pitch": -23.19
  }
 ],
 "useHandCursor": true,
 "items": [
  {
   "hfov": 12.93,
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_55D3247B_40E2_4D9E_41C1_4317140D38D7",
   "pitch": -23.19,
   "yaw": -108.66,
   "distance": 100
  }
 ],
 "id": "overlay_502A5BD5_40E2_5A95_4193_AB6A286C6961",
 "rollOverDisplay": false
},
{
 "rotate": false,
 "class": "TripodCapPanoramaOverlay",
 "angle": 0,
 "distance": 50,
 "hfov": 45,
 "id": "panorama_4BFC03A2_40E2_CAAE_41CB_34B6FD320E0C_tcap0",
 "inertia": false,
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/panorama_4BFC03A2_40E2_CAAE_41CB_34B6FD320E0C_tcap0.png",
    "class": "ImageResourceLevel",
    "width": 1080,
    "height": 1080
   }
  ]
 }
},
{
 "enabledInCardboard": true,
 "class": "HotspotPanoramaOverlay",
 "areas": [
  {
   "mapColor": "#FF0000",
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_4BF83BFC_40E2_DA9A_41C3_1ED8550EB1CB, this.camera_4F94E89A_4113_C588_41B8_5B20271C064F); this.mainPlayList.set('selectedIndex', 5)"
  }
 ],
 "data": {
  "label": "Circle Arrow 02a"
 },
 "maps": [
  {
   "hfov": 13.07,
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -58.41,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BEE91AB_40E2_C6BD_41C2_F4498EFC0B70_0_HS_0_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 28,
      "height": 16
     }
    ]
   },
   "pitch": -21.68
  }
 ],
 "useHandCursor": true,
 "items": [
  {
   "hfov": 13.07,
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_59A04179_40E2_479A_41CD_DEBCB493B3BC",
   "pitch": -21.68,
   "yaw": -58.41,
   "distance": 100
  }
 ],
 "id": "overlay_5354B1B3_40E2_46AE_4194_A3D960481E0B",
 "rollOverDisplay": false
},
{
 "enabledInCardboard": true,
 "class": "HotspotPanoramaOverlay",
 "areas": [
  {
   "mapColor": "#FF0000",
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_4BED90B6_40E2_4696_4190_7C660E9B5B7E, this.camera_4F60B880_4113_C477_41C0_627C9228009E); this.mainPlayList.set('selectedIndex', 7)"
  }
 ],
 "data": {
  "label": "Circle Arrow 02a"
 },
 "maps": [
  {
   "hfov": 13.51,
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 123.97,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BEE91AB_40E2_C6BD_41C2_F4498EFC0B70_0_HS_1_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 28,
      "height": 16
     }
    ]
   },
   "pitch": -16.15
  }
 ],
 "useHandCursor": true,
 "items": [
  {
   "hfov": 13.51,
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_59A0917A_40E2_479E_41A9_B4064B32D260",
   "pitch": -16.15,
   "yaw": 123.97,
   "distance": 100
  }
 ],
 "id": "overlay_54D6C699_40E3_CA9A_41B1_4CB90084C646",
 "rollOverDisplay": false
},
{
 "enabledInCardboard": true,
 "class": "HotspotPanoramaOverlay",
 "areas": [
  {
   "mapColor": "#FF0000",
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_4BC127A4_40E2_CAAB_41C7_EF5056BCD510, this.camera_4F9D988D_4113_C589_4195_BAC3D0DAA606); this.mainPlayList.set('selectedIndex', 4)"
  }
 ],
 "data": {
  "label": "Circle Arrow 02a"
 },
 "maps": [
  {
   "hfov": 13.71,
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 93.58,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BEE91AB_40E2_C6BD_41C2_F4498EFC0B70_0_HS_2_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 28,
      "height": 16
     }
    ]
   },
   "pitch": -12.89
  }
 ],
 "useHandCursor": true,
 "items": [
  {
   "hfov": 13.71,
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_54BCDBB1_40FE_5AAD_41CE_3BB0E9C331D8",
   "pitch": -12.89,
   "yaw": 93.58,
   "distance": 100
  }
 ],
 "id": "overlay_54C00ED3_40FE_DAED_4168_9486D3FFEEC0",
 "rollOverDisplay": false
},
{
 "rotate": false,
 "class": "TripodCapPanoramaOverlay",
 "angle": 0,
 "distance": 50,
 "hfov": 45,
 "id": "panorama_4BEE91AB_40E2_C6BD_41C2_F4498EFC0B70_tcap0",
 "inertia": false,
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/panorama_4BFC03A2_40E2_CAAE_41CB_34B6FD320E0C_tcap0.png",
    "class": "ImageResourceLevel",
    "width": 1080,
    "height": 1080
   }
  ]
 }
},
{
 "enabledInCardboard": true,
 "class": "HotspotPanoramaOverlay",
 "areas": [
  {
   "mapColor": "#FF0000",
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_4BEE91AB_40E2_C6BD_41C2_F4498EFC0B70, this.camera_4F78F856_4113_C49B_41CD_F80B4ED02EE0); this.mainPlayList.set('selectedIndex', 3)"
  }
 ],
 "data": {
  "label": "Circle Arrow 02a"
 },
 "maps": [
  {
   "hfov": 12.62,
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -162.42,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BED90B6_40E2_4696_4190_7C660E9B5B7E_1_HS_0_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 28,
      "height": 16
     }
    ]
   },
   "pitch": -26.2
  }
 ],
 "useHandCursor": true,
 "items": [
  {
   "hfov": 12.62,
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_55D1947D_40E2_4D9A_41CF_7C5147B64768",
   "pitch": -26.2,
   "yaw": -162.42,
   "distance": 100
  }
 ],
 "id": "overlay_5175B614_40EF_CD6B_41A2_A4533CF7B719",
 "rollOverDisplay": false
},
{
 "enabledInCardboard": true,
 "class": "HotspotPanoramaOverlay",
 "areas": [
  {
   "mapColor": "#FF0000",
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_4BFADABB_40E2_5A9E_41CB_CD93DB1F4D6B, this.camera_4F7FB864_4113_C4BF_41C4_35804CA4DC77); this.mainPlayList.set('selectedIndex', 8)"
  }
 ],
 "data": {
  "label": "Circle Arrow 02a"
 },
 "maps": [
  {
   "hfov": 13.13,
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 7.16,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BED90B6_40E2_4696_4190_7C660E9B5B7E_1_HS_1_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 28,
      "height": 16
     }
    ]
   },
   "pitch": -20.93
  }
 ],
 "useHandCursor": true,
 "items": [
  {
   "hfov": 13.13,
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_55D1C47D_40E2_4D9A_41C6_91D5289BA753",
   "pitch": -20.93,
   "yaw": 7.16,
   "distance": 100
  }
 ],
 "id": "overlay_51408756_40EE_CB97_419F_FCC108B44E51",
 "rollOverDisplay": false
},
{
 "rotate": false,
 "class": "TripodCapPanoramaOverlay",
 "angle": 0,
 "distance": 50,
 "hfov": 45,
 "id": "panorama_4BED90B6_40E2_4696_4190_7C660E9B5B7E_tcap0",
 "inertia": false,
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/panorama_4BFC03A2_40E2_CAAE_41CB_34B6FD320E0C_tcap0.png",
    "class": "ImageResourceLevel",
    "width": 1080,
    "height": 1080
   }
  ]
 }
},
{
 "enabledInCardboard": true,
 "class": "HotspotPanoramaOverlay",
 "areas": [
  {
   "mapColor": "#FF0000",
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_4BEE91AB_40E2_C6BD_41C2_F4498EFC0B70, this.camera_4FE93919_4113_C489_41A2_327592505FBF); this.mainPlayList.set('selectedIndex', 3)"
  }
 ],
 "data": {
  "label": "Circle Arrow 02a"
 },
 "maps": [
  {
   "hfov": 13.38,
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 44.09,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BC127A4_40E2_CAAB_41C7_EF5056BCD510_1_HS_0_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 28,
      "height": 16
     }
    ]
   },
   "pitch": -17.91
  }
 ],
 "useHandCursor": true,
 "items": [
  {
   "hfov": 13.38,
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_55D3F47C_40E2_4D9A_41CF_165E1E065EAF",
   "pitch": -17.91,
   "yaw": 44.09,
   "distance": 100
  }
 ],
 "id": "overlay_5078EAFE_40E2_7A96_41A2_B44537E39B6E",
 "rollOverDisplay": false
},
{
 "enabledInCardboard": true,
 "class": "HotspotPanoramaOverlay",
 "areas": [
  {
   "mapColor": "#FF0000",
   "class": "HotspotPanoramaOverlayArea",
   "click": "this.startPanoramaWithCamera(this.panorama_4BEED95D_40E2_479A_41AB_C0FC40701619, this.camera_4FE44926_4113_C4BB_41A0_0E66DAC70975); this.mainPlayList.set('selectedIndex', 9)"
  }
 ],
 "data": {
  "label": "Circle Arrow 02a"
 },
 "maps": [
  {
   "hfov": 12.72,
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -117.45,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_4BC127A4_40E2_CAAB_41C7_EF5056BCD510_1_HS_1_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 28,
      "height": 16
     }
    ]
   },
   "pitch": -25.2
  }
 ],
 "useHandCursor": true,
 "items": [
  {
   "hfov": 12.72,
   "class": "HotspotPanoramaOverlayImage",
   "image": "this.AnimatedImageResource_55D2247C_40E2_4D9A_41C4_99C1362CF64D",
   "pitch": -25.2,
   "yaw": -117.45,
   "distance": 100
  }
 ],
 "id": "overlay_515964DA_40E1_CE9F_41A0_0F8229498831",
 "rollOverDisplay": false
},
{
 "rotate": false,
 "class": "TripodCapPanoramaOverlay",
 "angle": 0,
 "distance": 50,
 "hfov": 45,
 "id": "panorama_4BC127A4_40E2_CAAB_41C7_EF5056BCD510_tcap0",
 "inertia": false,
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/panorama_4BFC03A2_40E2_CAAE_41CB_34B6FD320E0C_tcap0.png",
    "class": "ImageResourceLevel",
    "width": 1080,
    "height": 1080
   }
  ]
 }
},
{
 "children": [
  "this.Container_7FF195EF_706F_7FC6_41D7_A104CA87824D",
  "this.IconButton_7FF185EF_706F_7FC6_41A5_21B418265412"
 ],
 "id": "Container_7FF1F5EF_706F_7FC6_41C7_BCBB555D2D3D",
 "left": "0%",
 "width": 66,
 "class": "Container",
 "paddingRight": 0,
 "borderSize": 0,
 "backgroundOpacity": 0,
 "paddingLeft": 0,
 "scrollBarColor": "#000000",
 "creationPolicy": "inAdvance",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "top": "0%",
 "scrollBarVisible": "rollOver",
 "propagateClick": true,
 "verticalAlign": "top",
 "minWidth": 1,
 "horizontalAlign": "left",
 "scrollBarOpacity": 0.5,
 "height": "100%",
 "gap": 10,
 "layout": "absolute",
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "paddingTop": 0,
 "scrollBarWidth": 10,
 "visible": false,
 "contentOpaque": false,
 "shadow": false,
 "data": {
  "name": "- COLLAPSE"
 }
},
{
 "children": [
  "this.Image_7DB3C373_7065_34DE_41BA_CF5206137DED",
  "this.Container_7DB3F373_7065_34CE_41B4_E77DDA40A4F3",
  "this.Container_7DBCC382_7065_343F_41D5_9D3C36B5F479",
  "this.IconButton_7DB21382_7065_343F_41B1_484EDBCD16A4"
 ],
 "id": "Container_7DB20382_7065_343F_4186_6E0B0B3AFF36",
 "class": "Container",
 "width": 300,
 "borderSize": 0,
 "right": "0%",
 "backgroundOpacity": 0.7,
 "paddingLeft": 40,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 40,
 "backgroundColorRatios": [
  0
 ],
 "propagateClick": true,
 "verticalAlign": "top",
 "backgroundColor": [
  "#000000"
 ],
 "top": "0%",
 "minWidth": 1,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "height": "100%",
 "gap": 10,
 "layout": "absolute",
 "scrollBarMargin": 2,
 "paddingBottom": 40,
 "paddingTop": 40,
 "scrollBarWidth": 10,
 "horizontalAlign": "left",
 "backgroundColorDirection": "vertical",
 "shadow": false,
 "contentOpaque": false,
 "data": {
  "name": "- EXPANDED"
 }
},
{
 "class": "AnimatedImageResource",
 "rowCount": 6,
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_55D1247D_40E2_4D9A_41AB_1973A46AF0F4",
 "levels": [
  {
   "url": "media/panorama_4BED7614_40E2_CD6B_41CC_E385B25B2DC1_1_HS_0_0.png",
   "class": "ImageResourceLevel",
   "width": 1080,
   "height": 900
  }
 ],
 "frameCount": 24
},
{
 "class": "AnimatedImageResource",
 "rowCount": 6,
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_55D0C47E_40E2_4D96_41A9_51AF6679DA3F",
 "levels": [
  {
   "url": "media/panorama_4BEED95D_40E2_479A_41AB_C0FC40701619_1_HS_0_0.png",
   "class": "ImageResourceLevel",
   "width": 1080,
   "height": 900
  }
 ],
 "frameCount": 24
},
{
 "class": "AnimatedImageResource",
 "rowCount": 6,
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_55D7147E_40E2_4D96_41CE_17B0A1E0E281",
 "levels": [
  {
   "url": "media/panorama_4BEED95D_40E2_479A_41AB_C0FC40701619_1_HS_1_0.png",
   "class": "ImageResourceLevel",
   "width": 1080,
   "height": 900
  }
 ],
 "frameCount": 24
},
{
 "class": "AnimatedImageResource",
 "rowCount": 6,
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_55D3647C_40E2_4D9A_41A6_AC8A74024A44",
 "levels": [
  {
   "url": "media/panorama_4BEE9D91_40E2_DF6A_41C1_C8AF69BA1B59_1_HS_0_0.png",
   "class": "ImageResourceLevel",
   "width": 1080,
   "height": 900
  }
 ],
 "frameCount": 24
},
{
 "class": "AnimatedImageResource",
 "rowCount": 6,
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_549B7F75_40FE_DBAA_41C8_3607EF0B915F",
 "levels": [
  {
   "url": "media/panorama_4BEDD4DE_40E2_4E96_41C6_540F09E61BA7_0_HS_0_0.png",
   "class": "ImageResourceLevel",
   "width": 1080,
   "height": 900
  }
 ],
 "frameCount": 24
},
{
 "class": "AnimatedImageResource",
 "rowCount": 6,
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_55D2847C_40E2_4D9A_4196_88DC1F0E88D6",
 "levels": [
  {
   "url": "media/panorama_4BF83BFC_40E2_DA9A_41C3_1ED8550EB1CB_1_HS_0_0.png",
   "class": "ImageResourceLevel",
   "width": 1080,
   "height": 900
  }
 ],
 "frameCount": 24
},
{
 "class": "AnimatedImageResource",
 "rowCount": 6,
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_55D2D47D_40E2_4D9A_41CC_DFE647F9F848",
 "levels": [
  {
   "url": "media/panorama_4BF83BFC_40E2_DA9A_41C3_1ED8550EB1CB_1_HS_1_0.png",
   "class": "ImageResourceLevel",
   "width": 1080,
   "height": 900
  }
 ],
 "frameCount": 24
},
{
 "class": "AnimatedImageResource",
 "rowCount": 6,
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_55D0247D_40E2_4D9A_41C9_2EE31103997D",
 "levels": [
  {
   "url": "media/panorama_4BFADABB_40E2_5A9E_41CB_CD93DB1F4D6B_1_HS_0_0.png",
   "class": "ImageResourceLevel",
   "width": 1080,
   "height": 900
  }
 ],
 "frameCount": 24
},
{
 "class": "AnimatedImageResource",
 "rowCount": 6,
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_55D0947E_40E2_4D96_41CF_6CD86CC3E094",
 "levels": [
  {
   "url": "media/panorama_4BFADABB_40E2_5A9E_41CB_CD93DB1F4D6B_1_HS_1_0.png",
   "class": "ImageResourceLevel",
   "width": 1080,
   "height": 900
  }
 ],
 "frameCount": 24
},
{
 "class": "AnimatedImageResource",
 "rowCount": 6,
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_55DCB47A_40E2_4D9E_41A3_FD42E8398779",
 "levels": [
  {
   "url": "media/panorama_4BFC03A2_40E2_CAAE_41CB_34B6FD320E0C_1_HS_0_0.png",
   "class": "ImageResourceLevel",
   "width": 1080,
   "height": 900
  }
 ],
 "frameCount": 24
},
{
 "class": "AnimatedImageResource",
 "rowCount": 6,
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_55D3247B_40E2_4D9E_41C1_4317140D38D7",
 "levels": [
  {
   "url": "media/panorama_4BFC03A2_40E2_CAAE_41CB_34B6FD320E0C_1_HS_1_0.png",
   "class": "ImageResourceLevel",
   "width": 1080,
   "height": 900
  }
 ],
 "frameCount": 24
},
{
 "class": "AnimatedImageResource",
 "rowCount": 6,
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_59A04179_40E2_479A_41CD_DEBCB493B3BC",
 "levels": [
  {
   "url": "media/panorama_4BEE91AB_40E2_C6BD_41C2_F4498EFC0B70_0_HS_0_0.png",
   "class": "ImageResourceLevel",
   "width": 1080,
   "height": 900
  }
 ],
 "frameCount": 24
},
{
 "class": "AnimatedImageResource",
 "rowCount": 6,
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_59A0917A_40E2_479E_41A9_B4064B32D260",
 "levels": [
  {
   "url": "media/panorama_4BEE91AB_40E2_C6BD_41C2_F4498EFC0B70_0_HS_1_0.png",
   "class": "ImageResourceLevel",
   "width": 1080,
   "height": 900
  }
 ],
 "frameCount": 24
},
{
 "class": "AnimatedImageResource",
 "rowCount": 6,
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_54BCDBB1_40FE_5AAD_41CE_3BB0E9C331D8",
 "levels": [
  {
   "url": "media/panorama_4BEE91AB_40E2_C6BD_41C2_F4498EFC0B70_0_HS_2_0.png",
   "class": "ImageResourceLevel",
   "width": 1080,
   "height": 900
  }
 ],
 "frameCount": 24
},
{
 "class": "AnimatedImageResource",
 "rowCount": 6,
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_55D1947D_40E2_4D9A_41CF_7C5147B64768",
 "levels": [
  {
   "url": "media/panorama_4BED90B6_40E2_4696_4190_7C660E9B5B7E_1_HS_0_0.png",
   "class": "ImageResourceLevel",
   "width": 1080,
   "height": 900
  }
 ],
 "frameCount": 24
},
{
 "class": "AnimatedImageResource",
 "rowCount": 6,
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_55D1C47D_40E2_4D9A_41C6_91D5289BA753",
 "levels": [
  {
   "url": "media/panorama_4BED90B6_40E2_4696_4190_7C660E9B5B7E_1_HS_1_0.png",
   "class": "ImageResourceLevel",
   "width": 1080,
   "height": 900
  }
 ],
 "frameCount": 24
},
{
 "class": "AnimatedImageResource",
 "rowCount": 6,
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_55D3F47C_40E2_4D9A_41CF_165E1E065EAF",
 "levels": [
  {
   "url": "media/panorama_4BC127A4_40E2_CAAB_41C7_EF5056BCD510_1_HS_0_0.png",
   "class": "ImageResourceLevel",
   "width": 1080,
   "height": 900
  }
 ],
 "frameCount": 24
},
{
 "class": "AnimatedImageResource",
 "rowCount": 6,
 "colCount": 4,
 "frameDuration": 41,
 "id": "AnimatedImageResource_55D2247C_40E2_4D9A_41C4_99C1362CF64D",
 "levels": [
  {
   "url": "media/panorama_4BC127A4_40E2_CAAB_41C7_EF5056BCD510_1_HS_1_0.png",
   "class": "ImageResourceLevel",
   "width": 1080,
   "height": 900
  }
 ],
 "frameCount": 24
},
{
 "id": "Container_7FF195EF_706F_7FC6_41D7_A104CA87824D",
 "left": "0%",
 "width": 36,
 "class": "Container",
 "borderSize": 0,
 "backgroundOpacity": 0.4,
 "paddingLeft": 0,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "paddingRight": 0,
 "backgroundColorRatios": [
  0
 ],
 "propagateClick": true,
 "verticalAlign": "top",
 "backgroundColor": [
  "#000000"
 ],
 "top": "0%",
 "minWidth": 1,
 "scrollBarVisible": "rollOver",
 "scrollBarOpacity": 0.5,
 "height": "100%",
 "gap": 10,
 "layout": "absolute",
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "paddingTop": 0,
 "scrollBarWidth": 10,
 "horizontalAlign": "left",
 "backgroundColorDirection": "vertical",
 "shadow": false,
 "contentOpaque": false,
 "data": {
  "name": "Container black"
 }
},
{
 "maxWidth": 80,
 "id": "IconButton_7FF185EF_706F_7FC6_41A5_21B418265412",
 "left": 10,
 "maxHeight": 80,
 "width": 50,
 "class": "IconButton",
 "paddingRight": 0,
 "borderSize": 0,
 "backgroundOpacity": 0,
 "paddingLeft": 0,
 "horizontalAlign": "center",
 "minHeight": 1,
 "borderRadius": 0,
 "top": "40%",
 "transparencyActive": true,
 "propagateClick": true,
 "verticalAlign": "middle",
 "minWidth": 1,
 "click": "this.setComponentVisibility(this.Container_7FF1F5EF_706F_7FC6_41C7_BCBB555D2D3D, false, 0, null, null, false); this.setComponentVisibility(this.Container_7DB20382_7065_343F_4186_6E0B0B3AFF36, true, 0, null, null, false)",
 "bottom": "40%",
 "rollOverIconURL": "skin/IconButton_7FF185EF_706F_7FC6_41A5_21B418265412_rollover.png",
 "paddingBottom": 0,
 "mode": "push",
 "paddingTop": 0,
 "iconURL": "skin/IconButton_7FF185EF_706F_7FC6_41A5_21B418265412.png",
 "cursor": "hand",
 "shadow": false,
 "data": {
  "name": "IconButton arrow"
 }
},
{
 "maxWidth": 1095,
 "id": "Image_7DB3C373_7065_34DE_41BA_CF5206137DED",
 "left": "0%",
 "maxHeight": 1095,
 "width": "100%",
 "class": "Image",
 "paddingRight": 0,
 "borderSize": 0,
 "backgroundOpacity": 0,
 "paddingLeft": 0,
 "horizontalAlign": "left",
 "url": "skin/Image_7DB3C373_7065_34DE_41BA_CF5206137DED.jpg",
 "minHeight": 30,
 "borderRadius": 0,
 "top": "0%",
 "propagateClick": true,
 "verticalAlign": "top",
 "height": "25%",
 "minWidth": 40,
 "paddingBottom": 0,
 "paddingTop": 0,
 "scaleMode": "fit_inside",
 "shadow": false,
 "data": {
  "name": "Image Company"
 }
},
{
 "children": [
  "this.Container_7DB3E382_7065_343F_41C2_E1E6BB5BA055",
  "this.Button_7DBCA382_7065_343F_41DB_48D975E3D9EC",
  "this.Container_7DBCD382_7065_343F_41D8_FC14DFF91DA9",
  "this.Button_5605E054_40E2_C5EA_41B2_5FF376E942F1",
  "this.Container_7DBCB382_7065_343F_41D8_AB382D384291",
  "this.Button_57E6C470_40E2_CDAA_41CF_D0760CD6CFDD",
  "this.Container_7DB32382_7065_343F_419E_6594814C420F"
 ],
 "id": "Container_7DB3F373_7065_34CE_41B4_E77DDA40A4F3",
 "left": "0%",
 "width": "100%",
 "class": "Container",
 "paddingRight": 0,
 "borderSize": 0,
 "backgroundOpacity": 0,
 "paddingLeft": 0,
 "minHeight": 1,
 "overflow": "scroll",
 "scrollBarColor": "#000000",
 "borderRadius": 0,
 "top": "30.86%",
 "scrollBarVisible": "rollOver",
 "propagateClick": true,
 "verticalAlign": "middle",
 "minWidth": 1,
 "horizontalAlign": "left",
 "bottom": "25%",
 "scrollBarOpacity": 0.5,
 "gap": 0,
 "layout": "vertical",
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "paddingTop": 0,
 "scrollBarWidth": 10,
 "contentOpaque": false,
 "shadow": false,
 "data": {
  "name": "-Container buttons"
 }
},
{
 "children": [
  "this.Container_7DB2F382_7065_343F_41C8_85C6AE9C717F",
  "this.HTMLText_7DB2E382_7065_343F_41C2_951F708170F1"
 ],
 "id": "Container_7DBCC382_7065_343F_41D5_9D3C36B5F479",
 "width": "100%",
 "class": "Container",
 "right": "0%",
 "paddingRight": 0,
 "borderSize": 0,
 "backgroundOpacity": 0,
 "paddingLeft": 0,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "scrollBarVisible": "rollOver",
 "propagateClick": true,
 "verticalAlign": "bottom",
 "height": "26.316%",
 "minWidth": 1,
 "horizontalAlign": "left",
 "bottom": "0%",
 "scrollBarOpacity": 0.5,
 "gap": 10,
 "layout": "vertical",
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "paddingTop": 0,
 "scrollBarWidth": 10,
 "contentOpaque": false,
 "shadow": false,
 "data": {
  "name": "-Container footer"
 }
},
{
 "maxWidth": 80,
 "id": "IconButton_7DB21382_7065_343F_41B1_484EDBCD16A4",
 "maxHeight": 80,
 "width": 42,
 "class": "IconButton",
 "paddingRight": 0,
 "borderSize": 0,
 "right": "-0.67%",
 "backgroundOpacity": 0,
 "paddingLeft": 0,
 "horizontalAlign": "center",
 "minHeight": 1,
 "borderRadius": 0,
 "transparencyActive": true,
 "propagateClick": true,
 "verticalAlign": "middle",
 "height": 42,
 "top": "37.13%",
 "minWidth": 1,
 "click": "this.setComponentVisibility(this.Container_7DB20382_7065_343F_4186_6E0B0B3AFF36, false, 0, null, null, false); this.setComponentVisibility(this.Container_7FF1F5EF_706F_7FC6_41C7_BCBB555D2D3D, true, 0, null, null, false)",
 "mode": "push",
 "rollOverIconURL": "skin/IconButton_7DB21382_7065_343F_41B1_484EDBCD16A4_rollover.png",
 "paddingBottom": 0,
 "paddingTop": 0,
 "iconURL": "skin/IconButton_7DB21382_7065_343F_41B1_484EDBCD16A4.png",
 "cursor": "hand",
 "shadow": false,
 "data": {
  "name": "IconButton collapse"
 }
},
{
 "id": "Container_7DB3E382_7065_343F_41C2_E1E6BB5BA055",
 "class": "Container",
 "paddingRight": 0,
 "borderSize": 0,
 "paddingLeft": 0,
 "scrollBarColor": "#000000",
 "backgroundOpacity": 0.3,
 "width": "100%",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "height": 1,
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": true,
 "verticalAlign": "top",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "minWidth": 1,
 "scrollBarVisible": "rollOver",
 "horizontalAlign": "left",
 "scrollBarOpacity": 0.5,
 "gap": 10,
 "layout": "absolute",
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "paddingTop": 0,
 "scrollBarWidth": 10,
 "backgroundColorDirection": "vertical",
 "shadow": false,
 "contentOpaque": false,
 "data": {
  "name": "line"
 }
},
{
 "fontFamily": "Oswald",
 "fontColor": "#FFFFFF",
 "shadowBlurRadius": 6,
 "id": "Button_7DBCA382_7065_343F_41DB_48D975E3D9EC",
 "rollOverBackgroundColor": [
  "#5CA1DE"
 ],
 "class": "Button",
 "shadowColor": "#000000",
 "borderSize": 0,
 "backgroundOpacity": 0,
 "iconHeight": 32,
 "paddingLeft": 10,
 "horizontalAlign": "left",
 "width": "100%",
 "minHeight": 1,
 "borderRadius": 0,
 "borderColor": "#000000",
 "paddingRight": 0,
 "rollOverBackgroundColorRatios": [
  0
 ],
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": true,
 "verticalAlign": "middle",
 "height": 50,
 "minWidth": 1,
 "rollOverBackgroundOpacity": 0.8,
 "label": "WhatsApp",
 "shadowSpread": 1,
 "mode": "push",
 "layout": "horizontal",
 "backgroundColor": [
  "#000000",
  "#000000"
 ],
 "click": "this.openLink('https://api.whatsapp.com/send?phone=553434844046&text=Ol%C3%A1%2C%20gostaria%20de%20falar%20na%20com%20um%20Contador.', '_blank')",
 "gap": 5,
 "iconBeforeLabel": true,
 "fontSize": 18,
 "paddingBottom": 0,
 "fontStyle": "italic",
 "paddingTop": 0,
 "pressedBackgroundOpacity": 1,
 "iconWidth": 32,
 "backgroundColorDirection": "vertical",
 "fontWeight": "normal",
 "textDecoration": "none",
 "cursor": "hand",
 "shadow": false,
 "data": {
  "name": "Button Contact"
 }
},
{
 "id": "Container_7DBCD382_7065_343F_41D8_FC14DFF91DA9",
 "class": "Container",
 "paddingRight": 0,
 "borderSize": 0,
 "paddingLeft": 0,
 "scrollBarColor": "#000000",
 "backgroundOpacity": 0.3,
 "width": "100%",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "height": 1,
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": true,
 "verticalAlign": "top",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "minWidth": 1,
 "scrollBarVisible": "rollOver",
 "horizontalAlign": "left",
 "scrollBarOpacity": 0.5,
 "gap": 10,
 "layout": "absolute",
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "paddingTop": 0,
 "scrollBarWidth": 10,
 "backgroundColorDirection": "vertical",
 "shadow": false,
 "contentOpaque": false,
 "data": {
  "name": "line"
 }
},
{
 "fontFamily": "Oswald",
 "fontColor": "#FFFFFF",
 "shadowBlurRadius": 6,
 "id": "Button_5605E054_40E2_C5EA_41B2_5FF376E942F1",
 "rollOverBackgroundColor": [
  "#5CA1DE"
 ],
 "class": "Button",
 "shadowColor": "#000000",
 "borderSize": 0,
 "backgroundOpacity": 0,
 "iconHeight": 32,
 "paddingLeft": 10,
 "horizontalAlign": "left",
 "width": "100%",
 "minHeight": 1,
 "borderRadius": 0,
 "borderColor": "#000000",
 "paddingRight": 0,
 "rollOverBackgroundColorRatios": [
  0
 ],
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": true,
 "verticalAlign": "middle",
 "height": 50,
 "minWidth": 1,
 "rollOverBackgroundOpacity": 0.8,
 "label": "Instagram",
 "shadowSpread": 1,
 "mode": "push",
 "layout": "horizontal",
 "backgroundColor": [
  "#000000",
  "#000000"
 ],
 "click": "this.openLink('https://www.instagram.com/sabercontabiloficial/', '_blank')",
 "gap": 5,
 "iconBeforeLabel": true,
 "fontSize": 18,
 "paddingBottom": 0,
 "fontStyle": "italic",
 "paddingTop": 0,
 "pressedBackgroundOpacity": 1,
 "iconWidth": 32,
 "backgroundColorDirection": "vertical",
 "fontWeight": "normal",
 "textDecoration": "none",
 "cursor": "hand",
 "shadow": false,
 "data": {
  "name": "Button Contact"
 }
},
{
 "id": "Container_7DBCB382_7065_343F_41D8_AB382D384291",
 "class": "Container",
 "paddingRight": 0,
 "borderSize": 0,
 "paddingLeft": 0,
 "scrollBarColor": "#000000",
 "backgroundOpacity": 0.3,
 "width": "100%",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "height": 1,
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": true,
 "verticalAlign": "top",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "minWidth": 1,
 "scrollBarVisible": "rollOver",
 "horizontalAlign": "left",
 "scrollBarOpacity": 0.5,
 "gap": 10,
 "layout": "absolute",
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "paddingTop": 0,
 "scrollBarWidth": 10,
 "backgroundColorDirection": "vertical",
 "shadow": false,
 "contentOpaque": false,
 "data": {
  "name": "line"
 }
},
{
 "fontFamily": "Oswald",
 "fontColor": "#FFFFFF",
 "shadowBlurRadius": 6,
 "id": "Button_57E6C470_40E2_CDAA_41CF_D0760CD6CFDD",
 "rollOverBackgroundColor": [
  "#5CA1DE"
 ],
 "class": "Button",
 "shadowColor": "#000000",
 "borderSize": 0,
 "backgroundOpacity": 0,
 "iconHeight": 32,
 "paddingLeft": 10,
 "horizontalAlign": "left",
 "width": "100%",
 "minHeight": 1,
 "borderRadius": 0,
 "borderColor": "#000000",
 "paddingRight": 0,
 "rollOverBackgroundColorRatios": [
  0
 ],
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": true,
 "verticalAlign": "middle",
 "height": 50,
 "minWidth": 1,
 "rollOverBackgroundOpacity": 0.8,
 "label": "Localiza\u00e7\u00e3o",
 "shadowSpread": 1,
 "mode": "push",
 "layout": "horizontal",
 "backgroundColor": [
  "#000000",
  "#000000"
 ],
 "click": "this.openLink('https://goo.gl/maps/cRB6EnZ2E2YMYrf99', '_blank')",
 "gap": 5,
 "iconBeforeLabel": true,
 "fontSize": 18,
 "paddingBottom": 0,
 "fontStyle": "italic",
 "paddingTop": 0,
 "pressedBackgroundOpacity": 1,
 "iconWidth": 32,
 "backgroundColorDirection": "vertical",
 "fontWeight": "normal",
 "textDecoration": "none",
 "cursor": "hand",
 "shadow": false,
 "data": {
  "name": "Button Contact"
 }
},
{
 "id": "Container_7DB32382_7065_343F_419E_6594814C420F",
 "class": "Container",
 "paddingRight": 0,
 "borderSize": 0,
 "paddingLeft": 0,
 "scrollBarColor": "#000000",
 "backgroundOpacity": 0.3,
 "width": "100%",
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "scroll",
 "height": 1,
 "backgroundColorRatios": [
  0,
  1
 ],
 "propagateClick": true,
 "verticalAlign": "top",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "minWidth": 1,
 "scrollBarVisible": "rollOver",
 "horizontalAlign": "left",
 "scrollBarOpacity": 0.5,
 "gap": 10,
 "layout": "absolute",
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "paddingTop": 0,
 "scrollBarWidth": 10,
 "backgroundColorDirection": "vertical",
 "shadow": false,
 "contentOpaque": false,
 "data": {
  "name": "line"
 }
},
{
 "id": "Container_7DB2F382_7065_343F_41C8_85C6AE9C717F",
 "width": 40,
 "class": "Container",
 "borderSize": 0,
 "paddingRight": 0,
 "paddingLeft": 0,
 "scrollBarColor": "#000000",
 "backgroundOpacity": 1,
 "minHeight": 1,
 "borderRadius": 0,
 "overflow": "visible",
 "height": 2,
 "backgroundColorRatios": [
  0
 ],
 "propagateClick": true,
 "verticalAlign": "top",
 "backgroundColor": [
  "#5CA1DE"
 ],
 "minWidth": 1,
 "scrollBarVisible": "rollOver",
 "horizontalAlign": "left",
 "scrollBarOpacity": 0.5,
 "gap": 10,
 "layout": "horizontal",
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "paddingTop": 0,
 "scrollBarWidth": 10,
 "backgroundColorDirection": "vertical",
 "contentOpaque": false,
 "shadow": false,
 "data": {
  "name": "blue line"
 }
},
{
 "id": "HTMLText_7DB2E382_7065_343F_41C2_951F708170F1",
 "class": "HTMLText",
 "borderSize": 0,
 "backgroundOpacity": 0,
 "paddingLeft": 0,
 "scrollBarColor": "#000000",
 "width": "100%",
 "minHeight": 1,
 "borderRadius": 0,
 "paddingRight": 0,
 "scrollBarVisible": "rollOver",
 "propagateClick": true,
 "height": 78,
 "minWidth": 1,
 "scrollBarOpacity": 0.5,
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "scrollBarWidth": 10,
 "paddingTop": 0,
 "html": "<div style=\"text-align:left; color:#000; \"><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0px;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"color:#ffffff;font-size:14px;font-family:'Oswald Regular';\"><I>Saber Cont\u00e1bil</I></SPAN></SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0px;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"color:#ffffff;font-size:14px;font-family:'Oswald Regular';\"><I>Av Francisco Ribeiro, 1366</I></SPAN></SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0px;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"color:#ffffff;font-size:14px;font-family:'Oswald Regular';\"><I>Bairro Santa M\u00f4nica</I></SPAN></SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0px;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"color:#ffffff;font-size:14px;font-family:'Oswald Regular';\"><I>Uberl\u00e2ndia - MG</I></SPAN></SPAN></DIV></div>",
 "shadow": false,
 "data": {
  "name": "HTMLText47602"
 }
}],
 "gap": 10,
 "layout": "absolute",
 "scrollBarMargin": 2,
 "paddingBottom": 0,
 "backgroundPreloadEnabled": true,
 "paddingTop": 0,
 "scrollBarWidth": 10,
 "mouseWheelEnabled": true,
 "vrPolyfillScale": 0.9,
 "mobileMipmappingEnabled": false,
 "contentOpaque": false,
 "shadow": false,
 "data": {
  "name": "Player468"
 }
};

    
    function HistoryData(playList) {
        this.playList = playList;
        this.list = [];
        this.pointer = -1;
    }

    HistoryData.prototype.add = function(index){
        if(this.pointer < this.list.length && this.list[this.pointer] == index) {
            return;
        }
        ++this.pointer;
        this.list.splice(this.pointer, this.list.length - this.pointer, index);
    };

    HistoryData.prototype.back = function(){
        if(!this.canBack()) return;
        this.playList.set('selectedIndex', this.list[--this.pointer]);
    };

    HistoryData.prototype.forward = function(){
        if(!this.canForward()) return;
        this.playList.set('selectedIndex', this.list[++this.pointer]);
    };

    HistoryData.prototype.canBack = function(){
        return this.pointer > 0;
    };

    HistoryData.prototype.canForward = function(){
        return this.pointer >= 0 && this.pointer < this.list.length-1;
    };
    //

    if(script.data == undefined)
        script.data = {};
    script.data["history"] = {};    //playListID -> HistoryData

    TDV.PlayerAPI.defineScript(script);
})();
