<?php

$SRC     = substr($_SERVER['DOCUMENT_ROOT'].(
	$_SERVER['QUERY_STRING'] ? substr($_SERVER['REQUEST_URI'], 0, - 1 - strlen($_SERVER['QUERY_STRING'])) : $_SERVER['REQUEST_URI']
), strlen(dirname(__FILE__)) + 1); // path to file
$DELAY   = 20;  // measured in milliseconds (1000 = 1 second)
$TIMEOUT = INF; // measured in milliseconds, infinite will never timeout
$MIME    = 'text/plain; charset=utf-8'; // mime type and charset

// set indefinite execution time for this script
set_time_limit(0);

// get modified header as time
$IF_MODIFIED_SINCE = strtotime($_SERVER['HTTP_IF_MODIFIED_SINCE']);

while (true) {
	// clear file status cache (allow multiple checks on the same file)
	clearstatcache();

	// get file modified time
	$LAST_MODIFIED = filemtime($SRC);

	// if modified times do not match or timeout expires
	if ($LAST_MODIFIED !== $IF_MODIFIED_SINCE || !$TIMEOUT) {
		// set cache headers to not cache
		header('Cache-Control: private, max-age=0, no-cache');
		// set mime type
		header('Content-Type: '.$MIME);
		// set updated modified header
		header('Last-Modified: '.gmdate('D, d M Y H:i:s T', $LAST_MODIFIED));

		// decode JSON data
		$DATA = json_decode(file_get_contents($SRC));

		// append server time
		$DATA->serverTime = floor(microtime(true) * 1000);

		// print the response
		print(json_encode($DATA));

		// end
		break;
	}
	// otherwise
	else {
		// reduce timeout by delay
		$TIMEOUT -= $DELAY;

		// wait for delay
		usleep($DELAY * 1000);

		// repeat
		continue;
	}
}