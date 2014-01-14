<?php 

	$foo = "http://". $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
	
	$pos = strripos($foo, "/");

	$str = substr($foo, 0, $pos);
	echo $str;

?>
