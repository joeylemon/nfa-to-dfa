/**
 * This is a fairly naiive implementation of a map
 * using a regular javascript object. I usually set
 * something like this up in my javascript projects,
 * mainly for the convenience and clarity of calling
 * something a map. - AK
 */

function Map() {
	this.contents = {};
}

Map.prototype.put = function(key, value) {
	this.contents[key] = value;
}

Map.prototype.putArray = function(arr, keyProperty) {
	var i, key;
	for(i = 0; i < arr.length; i++) {
		if(keyProperty === undefined) key = arr[i];
		else key = arr[i][keyProperty];
		this.contents[key] = arr[i];
	}
}

Map.prototype.find = function(key) {
	if(this.contents.hasOwnProperty(key)) {
		return this.contents[key];
	} else {
		return false;
	}
}

Map.prototype.remove = function(key) {
	var value = this.find(key);
	if(value != false) {
		delete this.contents[key];
	}
}

Map.prototype.clear = function() {
	for(var key in this.contents) {
		delete this.contents[key];
	}
}

Map.prototype.toArray = function() {
	var array = [];
	for(var key in this.contents) {
		array.push(this.contents[key]);
	}
	return array;
}