<?php
	$id = $_GET["id"];
?>

<!DOCTYPE html>
<html lang="en" ng-app="feedbackApp">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
	<title>TeeBeeDee</title>

	<script type="text/javascript" src="js/jquery.js"></script>
	<script type="text/javascript" src="js/jquery-ui.js"></script>
	<script type="text/javascript" src="js/keymaster.min.js"></script>
	<script type="text/javascript" src="js/angular.js"></script>
	
	<script type="text/javascript" src="js/modules/center.js"></script>
	<script type="text/javascript" src="js/modules/contenteditable.js"></script>
	<script type="text/javascript" src="js/modules/draggable.js"></script>
	<script type="text/javascript" src="js/modules/focus.js"></script>
	<script type="text/javascript" src="js/modules/imagedrop.js"></script>
	<script type="text/javascript" src="js/modules/stretch.js"></script>
	<script type="text/javascript" src="js/modules/timesince.js"></script>
	<script type="text/javascript" src="js/modules/ui-sortable.js"></script>
	<script type="text/javascript" src="js/modules/auth.js"></script>
	
	<script type="text/javascript" src="js/firebase.js"></script>
	<script type="text/javascript" src="js/angularfire.min.js"></script>
	<script type="text/javascript" src="js/firebase-simple-login.js"></script>
	
	<script type="text/javascript" src="js/amonit.js"></script>
	<script type="text/javascript" src="js/trail.js"></script>

	<script type="text/javascript" src="//use.typekit.net/qxg4wno.js"></script>
	<script type="text/javascript">try{Typekit.load();}catch(e){}</script>

	<link rel="stylesheet" type="text/css" href="css/style.css">

	<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body ng-controller="FeedbackController" ng-init="init(<?php echo $id; ?>)" fullscreen>
	<div id="mouseTracker"><div ng-repeat="cursor in cursors" cursor style="position: absolute;width:10px; height: 10px; background: #ff0000; z-index: 2000"></div></div>
	<div id="overlay" ng-hide="true">
		<div id="brief">
			<div class="brief-content">
				<div class="brief-author">
					<img src="images/me.png">
					<strong class="brief-name light">Florian</strong><span class="brief-date light">Yesterday</span>
				</div>
	
				<h3>Feedback Request</h3>
				
				<p>
					Hello! I need your feedback on a couple of pages that I designed for <strong>CCN’s on Behance.</strong> 
				</p>
				<p>
					It’s supposed to explain the structure of the site and what’s customizable. 
				</p>
				<ol>
					<li>1. What do you think about the header design and the typography?</li>
					<li>2. Do you think we can implement the maginifying glass without using jQuery?</li>
					<li>3. Not sure about the copy.</li>
				</ol>
				
				<p>
					Please feel free to comment on anything that catches your eye!
				</p>
	
				<p>
					Kindly,<br>
					Florian
				</p>
	
				<div class="brief-info">
					<p>Please note that the following images are the <strong>first draft.</strong> Images are placeholder stock images and will be replaced in the final version.</p>
				</div>

				<div class="brief-footer">
					<form id="enter-name">
						<label for="name">Please enter your name to leave some feedback.</label>
						<input type="text" placeholder="Your Name" id="name" ng-model="username" capitalize-first autofocus />
						<button type="submit" ng-class="{btnokay: username!='', btndisabled:username==''}" class="form-block" ng-click="briefRead=true">Okay, let’s do this!</button>
					</form>
				</div>
			</div>
		</div>
		
	</div>

	<div imagedrop id="dropzone" on-image-drop="imageDropped()"><h1 center>Drop Images to Upload</h1></div>

	<!-- wrap -->
	<!-- header -->
	
		<header>
			<span class="logo space"><img src="images/logo.png" /></span>
			<div class="space split-button button-group">
				<input type="text" class="inset splitbutton-left" value="{{projectpath}}" onClick="this.select();" ng-keypress="$event.preventDefault()"/><button class="btn-sm inset-button splitbutton-right">Share</button>
			</div>
			<div class="button-group">
				<div id="login" ng-controller="AuthController">
					<span class="space" ng-show="username"><span class="icon before">U</span><span class="light">Hello,&nbsp;</span><strong>{{username}}!</strong></span>
					<span class="space" ng-hide="me"><span class="icon before">U</span><strong>Login</strong></span>
		
					<form ng-hide="true" class="form-inline">
						<input class="form-control form-group" type="text" ng-model="newemail" placeholder="Email">
						<input class="form-control form-group" type="password" ng-model="newpassword" placeholder="Password">
						<input class="form-control form-group" type="text" ng-model="firstname" placeholder="First name">
						<input class="form-control form-group" type="text" ng-model="lastname" placeholder="Last name">
						<button class="btn btn-primary btn-sm" ng-click="createUser(newemail, newpassword, firstname, lastname)">Sign up</button>
					</form>
					
					<form ng-hide="true" class="form-inline">
						<input class="form-control" type="text" ng-model="email" placeholder="Email">
						<input class="form-control" type="password" ng-model="password" placeholder="Password">
						<button class="btn-login" ng-click="login(email, password)">Log in</button>
					</form>
					<button ng-show="me" class="btn btn-danger btn-sm" ng-click="logout()">Logout</button>
					<span class="space" ng-hide="users.length == 0"><span class="icon before">E</span><span>On it now:&nbsp;</span><strong ng-repeat="user in users" ng-show="user.connections">{{user.name.first}}<span ng-show="!$last">, </span></strong></span>
				</div>
			</div>
	
			<div class="center" ng-show="false">
				<h5 ng-show="project.images.length!=0">{{project.images[currentIndex-1].filename}}</h5>
				<h4 ng-show="project.images.length!=0" click-to-edit="current.filename">{{current.filename}}</h4>
				<h5 ng-show="project.images.length!=0">{{project.images[currentIndex+1].filename}}</h5>
			</div>
	
			<ul>
				<li><a href=""><h2 ng-click="prev()">Previous</h2><span class="key">▲</span></a></li>	
				<li><a href=""><h2 ng-click="next()" ng-class="{flash:flashnext}">Next</h2><span class="key">▼</span></a></li>	
				<li><a href=""><span class="icon before">b</span><h2>New Set</h2></a></li>	
				<li><button class="btn btnokay" ng-click="toggleFullscreen()"><span class="icon before">`</span>Present<span class="key">P</span></button></li>
			</ul>
	
		</header>
	
		<!-- // end of header -->

	<div id="wrap">

		<!-- sidebar -->
	
		<aside id="left" class="animated" selectedscroll ng-hide="project.images.length == 0">
			<div id="leftspacer"></div>
		<ul>
			<li class="add-image upload-icon" filepicker order="before">c</li>
			<ul id="overview" ui-sortable ng-model="project.images" ng-class="{slideOut: !overviewShowing}">
				<li ng-repeat="image in project.images" ng-click="setImage($index)" ng-class="{selected:$index==currentIndex}"><img ng-src="{{image.path}}" /><span ng-click="removeImage($index)" class="icon light removeimage">y</span></li>
			</ul>
			<li ng-hide="project.images.length == 0" class="add-image upload-icon" filepicker order="after">c</li>
		</ul>
		</aside>
	
		<!-- // end of sidebar -->
		<!-- Comments -->
		
		<aside id="right" ng-hide="project.images.length == 0">
			<div id="feedback-header">
				<h3 class="spacing">Feedback</h3>
				<input class="search" ng-model="search" placeholder="Search…">
			</div>
			<ul class="feedback-container" ng-class="{semi:$index!=currentIndex}" ng-hide="image.annotations==null" ng-repeat="image in project.images | filter:search" ng-click="setImage($index)">
				<div class="clickable feedback-title" ng-mouseenter="disableAnnotationTransition()" ng-mousemove="$index==currentIndex && showAllAnnotations()" ng-mouseleave="$index==currentIndex && hideAllAnnotations()">{{image.filename}}</div>
				<div class="feedback-content">
					<li ng-repeat="annotation in image.annotations | typeFilter:commentTypes | filter:search" ng-mouseenter="$parent.$index==currentIndex && setActive($index)" ng-mouseleave="$parent.$index==currentIndex && setActive(-1)">
						<div class="brief-author">
							<img src="images/me.png">
							<strong class="brief-name light">{{annotation.author}}</strong><span class="brief-date light" time-since="annotation.timestamp"></span>
						</div>
						<div class="bubble"><span class="tag" ng-class="{green: annotation.type=='idea', purple:annotation.type=='question', blue: annotation.type=='onit'}">{{annotation.typeLabel}}</span> {{annotation.comment}}<span class="remove" ng-click="removeAnnotation($index)">×</span></div>
						<ul>
							<li ng-repeat="reply in annotation.replies">
								<div class="brief-author">
									<img src="images/me.png">
									<strong class="brief-name light">{{reply.user}}</strong><span class="brief-date light" time-since="reply.timestamp"></span>
								</div>
								{{reply.text}}
							</li>
						</ul>
					</li>
				</div>
			</ul>
		</aside>
		<!-- // end of comments -->
	
		<!-- main -->

		<div id="main" ng-class="{hasimages:project.images.length != 0}" >
			<div id="imgwrapper">
				<div filepicker order="before" class="emptystate" ng-show="project.images.length == 0"><div class="add-image upload-icon">c</div><h2>Drag & Drop Images Here</h2></div>
				<img annotatable ng-src="{{project.images[currentIndex].path}}" class="current-screen" ng-keypress="setActive(-1)" ng-click="addAnnotation($event)"  />
				<div draggable handle=".handle" annotation ng-repeat="annotation in project.images[currentIndex].annotations" ng-if="imageLoaded" class="circle note" ng-mouseenter="setActive($index)" ng-mouseleave="setActive(-1)" annotationid="{{$index}}">
					<!--<div ng-class="{pulsegreen:annotation.type=='idea', pulseblue:annotation.type=='onit', pulsepurple:annotation.type=='question'}" class="handle"></div>-->
					<div class="handle">{{$index + 1}}</div>
					<span class="tooltip" ng-class="{open: $index==selectedAnnotation || showingAll==true}" ng-keydown="blurTooltip($event, $index)" a="annotation" username="username" id="$index" types="commentTypes" tooltip></span>
				</div>
			</div>
		</div>
	
		<!-- // end of main -->	
	</div>

	<!-- // end of wrap -->

	<input type="file" id="filepicker" multiple uploader>
	<!--<canvas id='world'></canvas>-->
	<script>document.write('<script src="http://' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1"></' + 'script>')</script>
</body>
</html>
