<?php
	
	/* Setup */

	$globalPath = "id/";
	$image_directory = $_GET['image_directory'];
	$full_directory = $globalPath.$image_directory;

	$new = 0;

	if ($image_directory != -1) {
		// directory exists -> return json later
		$new = 0;
	} else {
		// create directory and return the path
		$new = 1;
	}

	$images = array();

	/* Create new directory */

	function getLatestId () {
		$id = file_get_contents("id.txt");
		$foo = (int) $id + 1;
		file_put_contents("id.txt", $foo);

		return $foo;
	}

	function create ($id) {
		
		global $globalPath;

		// think of something more secure :D
		$dir = $globalPath.$id;


		mkdir($dir, 0777);
		file_put_contents($dir."/data.json", "");

    	return $dir;
	}

	/* Check if feedback already exists */

	if ($new == 1) {
		$id = getLatestId();
		create($id);
		echo $globalPath.$id;
	} else {
		$images = file_get_contents($full_directory."/data.json");
		echo $images;
	}

	/* Return JSON containing list of images */

?>
