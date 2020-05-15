## DPF js Library

**Depth Panoramic Frame** is an omnidirectional data transport for panoramic media, conceived for VR. It targets modern browsers, (multi)-touch devices and VR dissemination (WebVR), suitable for online and local contexts. It offers full sense of presence and scale within VR fruition by restoring a 3D space without transmitting original dataset (e.g.: very large point-clouds) using instead an egocentric optimized encoding.

When using the library (or just for more details) please link [full paper](https://diglib.eg.org/handle/10.2312/gch20161380) presented in [EuroGraphics GCH 2016](http://gch2016.ge.imati.cnr.it/) - Genoa (IT).

The DPF data transport and DPF Library provide:
* Correct VR stereoscopic fruition, by restoring a 3D virtual space on the fly
* Encoding/Decoding of omnidirectional data, Semantic queries and 3D Restoration are all GPU-based
* Streaming of compact and optimized image-based data (no geometry)
* Optimal detail for HMDs, minimizing data transmission
* Fast and easy semantic enrichment by non-professional users
* Support for video-streams
* Support for real-time Depth-of-Field effects
* Easy event handling on semantically enriched areas (see examples)
* Easy deployment on a webpage
* Easy integration with external devices

## Dependencies

* [jQuery](https://jquery.com/) - jQuery
* [Bluebird](http://bluebirdjs.com/docs/getting-started.html) - Bluebird
* [Hammer](http://hammerjs.github.io/) - Hammer js (multi-touch support)
* [OSG.js](https://cedricpinson.github.io/osgjs-website/) - OSG js

## API

You can find the full and updated API documentation [here](http://osiris.itabc.cnr.it/API/dpf/)

## Getting Started

You'll find full HTML examples in **examples** folder to play with. First off, to include DPF.js library and its functionalities in your web page, you just need to add DPF.js library in your HTML head, along with its dependencies. For instance if you place all *.js in "js/" subfolder, your would have something like this (with DPF library as last):

```xml
<head>
<script src="js/jquery.min.js"></script>
<script src="js/bluebird.min.js"></script>
<script src="js/hammer.min.js"></script>
<script src="js/OSG.min.js"></script>
<script src="js/DPF.min.js"></script>
<head>
```

## Basic Samples

In general, you may setup something like this for your HTML page:

```javascript
window.addEventListener( 'load', function () {
	// First we grab our canvas element
	var canvas = document.getElementById( 'View' );

	// Create our DPF handler and attach to canvas element
	var myExplorer = new DPFhandler( canvas );

	// Load GLSL resources from folder
	myExplorer.loadShadersFromPath("my/shaders/folder");
	
	// ...Loading and setup of DPF stuff goes here...

	// Run it!
	myExplorer.run();
});
```

The above will setup a basic DPF handler attached to a canvas element 'View': it may serve as blueprint for all DPF-based web applications.

### Loading the base channel

Basic example to setup a single DPF and loading the base panoramic data (color) in a few lines:

```javascript
var myDPF = new DPF();
myDPF.requestPano("url/of/my/pano"); // request simple pano (e.g. "pano1.jpg")

myExplorer.addDPF( myDPF );
```

or in a shorter, compact form:

```javascript
myExplorer.addDPF( new DPF("url/of/my/pano") );
```

Both the above examples create a new DPF object, request color data (image or video-stream) and add it to the handler.

### Using multiple channels

The next example requests both egocentric color and depth, then we set the depth range in the DPF. Note the depth channel is encoded automatically by the *EgoDepth* module within the **dpfEncoder** tool (see original paper for more details).

```javascript
var myDPF = new DPF(
	"url/of/my/pano",		// Request Color
	"url/of/my/pano-depth"	// Request Depth
	);

myDPF.setDepthRange(1.5, 18.0); // Sample [min,max] range

myExplorer.addDPF( myDPF );
```

Although, in general you won't need to explicitly set ranges or paths by yourself (especially when dealing with multiple DPFs!), but rather load the XML descriptor produced by the **dpfEncoder** tool:

```javascript
myExplorer.parseXML('url/of/my/DPFdescriptor.xml');
```

One line! quite easy!

## Disclaimer

When using this js library, please insert a reference to official page and/or original [paper](https://diglib.eg.org/handle/10.2312/gch20161380). This project is being researched and developed at VHLab, CNR ITABC (Rome, IT).
