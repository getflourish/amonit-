<?php
	$id = $_GET["id"];
?>

<!DOCTYPE html>
<html lang="en" ng-app="feedbackApp">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
	<title>Amonit – What do you think?</title>

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
	<script type="text/javascript" src="js/modules/ui-sortable.js"></script>
	<script type="text/javascript" src="js/modules/auth.js"></script>
	
	<script type="text/javascript" src="https://cdn.firebase.com/v0/firebase.js"></script>
	<script type="text/javascript" src="https://cdn.firebase.com/libs/angularfire/0.5.0/angularfire.min.js"></script>
	<script type="text/javascript" src="https://cdn.firebase.com/v0/firebase-simple-login.js"></script>
	
	<script type="text/javascript" src="js/amonit.js"></script>

	<link rel="stylesheet" type="text/css" href="css/style.css">
	<link rel="stylesheet" type="text/css" href="css/bootstrap.min.css">

	<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body ng-controller="FeedbackController" ng-init="setId(<?php echo $id; ?>)">

	<!-- header -->

	<header>
		<span class="logo">Amonit<em>| Show what you’re working on. </em><a href="/amonit2/{{data.path}}">amonit.io/{{data.path}}</a></span>
		<div class="center">
			<h5 ng-show="images.length!=0">{{images[currentIndex-1].filename}}</h5>
			<h4 ng-show="images.length!=0" click-to-edit="current.filename">{{current.filename}}</h4>
			<h5 ng-show="images.length!=0">{{images[currentIndex+1].filename}}</h5>
		</div>
		<div class="user">
			Moderator: <strong>Florian Schulz</strong><br>
			Viewing: 

			<div id="login" ng-controller="AuthController">

				<ul>
					<li ng-repeat="user in users" ng-show="user.connections">{{user.name.first}}</li>
				</ul>

				<form ng-hide="user" class="form-inline">
					<input class="form-control form-group" type="text" ng-model="newemail" placeholder="Email">
					<input class="form-control form-group" type="password" ng-model="newpassword" placeholder="Password">
					<input class="form-control form-group" type="text" ng-model="firstname" placeholder="First name">
					<input class="form-control form-group" type="text" ng-model="lastname" placeholder="Last name">
					<button class="btn btn-primary btn-sm" ng-click="createUser(newemail, newpassword, firstname, lastname)">Sign up</button>
				</form>
				
				<form ng-hide="user" class="form-inline">
					<input class="form-control" type="text" ng-model="email" placeholder="Email">
					<input class="form-control" type="password" ng-model="password" placeholder="Password">
					<button class="btn btn-success btn-sm" ng-click="login(email, password)">Log in</button>
				</form>
				<button ng-show="user" class="btn btn-danger  btn-sm" ng-click="logout()">Logout</button>
			</div>
		</div>

	</header>

	<!-- // end of header -->

	<div imagedrop id="dropzone" on-image-drop="imageDropped()"><h1 center>Drop Images to Upload</h1></div>

	<!-- wrap -->

	<div id="wrap">

		<!-- sidebar -->
	
		<aside id="left" ng-class"{foo: true}" class="animated">
		<ul>
			<li class="add-image" filepicker order="before">+</li>
			<ul id="overview" ui-sortable ng-model="images">
				<li ng-repeat="image in images" ng-click="setImage($index)" ng-class="{selected:$index==currentIndex}"><span click-to-edit="image.filename">{{image.filename}}</span><span ng-click="removeImage($index)">Remove</span><img ng-src="{{image.path}}" /></li>
			</ul>
			<li ng-hide="images.length == 0" class="add-image" filepicker order="after">+</li>
		</ul>
		</aside>
	
		<!-- // end of sidebar -->
	
		<div id="content">
	
		<!-- Comments -->
	
		<aside id="right" ng-hide="images.length == 0">
			<h3><span class="icon">w</span>Comments</h3>
			<ul>
				<input type="checkbox" ng-repeat-start="filter in commentTypes" ng-model="filter.show" id="filter-{{filter.type}}"><label class="tag" ng-class="{green: filter.type=='idea', purple:filter.type=='question', blue: filter.type=='onit'}" ng-repeat-end for="filter-{{filter.type}}">{{filter.typeLabel}}</label>
			</ul>
			<ul ng-class="{semi:$index!=currentIndex}" ng-hide="image.annotations.length == 0" ng-repeat="image in images" ng-mouseenter="setImage($index)">
				<h5 class="clickable" ng-mouseenter="disableAnnotationTransition()" ng-mousemove="showAllAnnotations()" ng-mouseleave="hideAllAnnotations()">{{image.filename}}</h5>
				<li ng-repeat="annotation in image.annotations | typeFilter:commentTypes" ng-mouseenter="setActive($index)" ng-mouseleave="setActive(-1)"><span class="tag" ng-class="{green: annotation.type=='idea', purple:annotation.type=='question', blue: annotation.type=='onit'}">{{annotation.typeLabel}}</span> {{annotation.comment}}<span class="remove" ng-click="removeAnnotation($index)">×</span></li>
			</ul>
		</aside>
	
		<!-- // end of comments -->
	
		<!-- main -->
	
		<div id="main">
			<div class="emptystate" ng-show="images.length == 0"><h2>Drag & Drop Images Here</h2></div>
			<div ng-hide="currentIndex == -1" id="imgwrapper">
				<img annotatable ng-src="{{current.path}}" class="current-screen" ng-keypress="setActive(-1)" ng-click="addAnnotation($event.offsetX, $event.offsetY)" />
				<div draggable handle=".handle" annotation ng-repeat="annotation in current.annotations" ng-if="imageLoaded" class="circle note" ng-class="{animate:$index!=selectedAnnotation, large:$index==selectedAnnotation}" ng-mouseenter="setActive($index)" ng-mouseleave="setActive(-1)" annotationid="{{$index}}"><div ng-class="{pulsegreen:annotation.type=='idea', pulseblue:annotation.type=='onit', pulsepurple:annotation.type=='question'}" class="handle"></div>
				<span class="tooltip" ng-class="{open: $index==selectedAnnotation}" ng-keydown="blurTooltip($event, $index)" a="annotation" id="$index" types="commentTypes" tooltip>
			</div>
		</div>
	
		<!-- // end of main -->
	
	</div>

	<!-- // end of wrap -->

	<input type="file" id="filepicker" multiple uploader>

	<div id="mouseTracker" ng-controller="AuthController"><div ng-hide="cursor.id==me.id" ng-repeat="cursor in cursors" cursor style="position: absolute;width:10px; height: 10px; background: #ff0000"></div></div>
</body>
</html>
