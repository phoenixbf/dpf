/** @preserve

 	DPF javascript implementation

 	@author Bruno Fanini
	VHLab, CNR ISPC

	When using this JS library, add also reference to EG publication:

	@inproceedings {gch.20161380,
		booktitle = {Eurographics Workshop on Graphics and Cultural Heritage},
		editor = {Chiara Eva Catalano and Livio De Luca},
		title = {{A Framework for Compact and Improved Panoramic VR Dissemination}},
		author = {Fanini, Bruno and D'Annibale, Enzo},
		year = {2016},
		publisher = {The Eurographics Association},
		ISSN = {2312-6124},
		ISBN = {978-3-03868-011-6},
		DOI = {10.2312/gch.20161380}
	}

==================================================================================*/

'use strict';
/*
var OSG = window.OSG;
var osg = OSG.osg;
OSG.globalify(); // All (osgDB, osgGA, etc...)
*/
var OSG         = window.OSG;
var osg         = OSG.osg;
var osgDB       = OSG.osgDB;
var osgViewer   = OSG.osgViewer;
var osgUtil     = OSG.osgUtil;
var osgGA       = OSG.osgGA;
var osgText     = OSG.osgText;
var InputGroups = OSG.osgViewer.InputGroups;


// NB: these values must map to relative shaders defines
const DPF_RAD_SCALE  = 100.0;
const DPF_ANN_HASH   = 0.3; // 0.3 - DO NOT CHANGE

// Default DPF channels (tex units)
const DPF_BASE_UNIT  = 0;
const DPF_DEPTH_UNIT = 1;
const DPF_SEM_UNIT   = 2;

const DPF_RAD2DEG    = (180.0 / Math.PI);
const DPF_DEG2RAD    = (Math.PI / 180.0);

const DPF_X_AXIS = [1.0,0.0,0.0];
const DPF_Y_AXIS = [0.0,1.0,0.0];
const DPF_Z_AXIS = [0.0,0.0,1.0];


//=================================================================================================
// DPF Utils
//=================================================================================================
/*
 * DPF General Utils
 * _@access public
 * _@constructor
 * _@global
 */
var DPFutils = {};

DPFutils.videoExts = [ "mp4", "avi", "ogg", "ogv", "webm", "mpd" ];

/*
 * Gets file extension (lowercase)
 * _@access public
 * _@param {string} filepath - Input file path
 * _@returns {string} Returns lowercase extension.
 */
DPFutils.getFileExtension = function( filepath ){
	return filepath.substr(filepath.lastIndexOf('.')+1).toLowerCase();
};

/*
 * Checks if URL is video
 * _@access public
 * _@param {string} url - Input URL
 * _@returns {string} Returns true if URL is video
 */
DPFutils.isURLvideo = function(url){
	var panoExt = this.getFileExtension(url);

    for (var j = 0; j < DPFutils.videoExts.length; j++) {
        var sCurExtension = DPFutils.videoExts[j];
        if (panoExt == sCurExtension.toLowerCase()) return true;
        }
	return false;
};

// Fallbacks
DPFutils.bkIM     = new window.Image();
DPFutils.bkIM.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNg+A8AAQIBANEay48AAAAASUVORK5CYII=';
DPFutils.wIM      = new window.Image();
DPFutils.wIM.src  = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQIW2P8DwQACgAD/il4QJ8AAAAASUVORK5CYII=';

DPFutils.fallbackBlackTex = new osg.Texture();
DPFutils.fallbackBlackTex.setImage( DPFutils.bkIM );
DPFutils.fallbackBlackTex.setMinFilter( osg.Texture.LINEAR );
DPFutils.fallbackBlackTex.setMagFilter( osg.Texture.LINEAR );
DPFutils.fallbackBlackTex.setWrapS( osg.Texture.REPEAT );
DPFutils.fallbackBlackTex.setWrapT( osg.Texture.REPEAT );

DPFutils.fallbackWhiteTex = new osg.Texture();
DPFutils.fallbackWhiteTex.setImage( DPFutils.wIM );
DPFutils.fallbackWhiteTex.setMinFilter( osg.Texture.LINEAR );
DPFutils.fallbackWhiteTex.setMagFilter( osg.Texture.LINEAR );
DPFutils.fallbackWhiteTex.setWrapS( osg.Texture.REPEAT );
DPFutils.fallbackWhiteTex.setWrapT( osg.Texture.REPEAT );

// Detect mobile device (CHECK if we want external)
DPFutils.detectMobileDevice = function(){
    if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
    || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))){
        return true;
        }

    return false;
};

DPFutils.lerp = function(a,b, t){
	return a + (b - a) * t;
};

// Detect if we are on mobo device
DPFutils._useMobile = DPFutils.detectMobileDevice();



//=================================================================================================
// TODO: Built in Shader
//=================================================================================================
//const DPF_SHADER = ``;



//=================================================================================================
// DPF class
//=================================================================================================
/**
 * @classdesc A DPF object is used as container of omnidirectional data, well-defined in a 3D space by providing position and orientation. One or more {@link DPF}s (a DPF network) are managed by a {@link DPFhandler}. 
 * @class
 * @constructor
 * @param {panourl} - (optional) Request egocentric color
 * @param {depthurl} - (optional) Request egocentric depth
 * @param {annurl} - (optional) Request egocentric semantic-map
 */
var DPF = function(panourl, depthurl, annurl){
	this._uniqueName = "";
	this._position    = [0,0,0];

	//this._orientation = osg.Quat.create();
	this._mOrient = undefined;
	this._vOrient = [0,0,0]; // Euler orientation

	this._mainTrans = new osg.MatrixTransform();
	/*
	this._mainTrans.getOrCreateStateSet().setRenderingHint('TRANSPARENT_BIN');
	this._mainTrans.getOrCreateStateSet().setAttributeAndModes(
		new osg.BlendFunc(), osg.StateAttribute.ON | osg.StateAttribute.OVERRIDE
		);
	*/
/*
	this._mainTrans.getOrCreateStateSet().setAttributeAndModes(
 		new osg.Depth( osg.Depth.LESS ), osg.StateAttribute.ON | osg.StateAttribute.OVERRIDE
		);
*/
	//var iM = osg.Matrix.create();
	//osg.Matrix.makeIdentity( iM );
	//this._mainTrans.setMatrix( iM );

	this._glslProgram = undefined;
	this.initUniforms();
	this._useUnifiedLayout = false;

	this._panoPath       = undefined;
	this._panoPathLow    = undefined;
	this._depthPath      = undefined;
	this._annPath        = undefined;

	this._isPanoVid  = false;
	this._isDepthVid = false;
	this._isAnnVid   = false;

	this._panoVidElem  = undefined;
	this._depthVidElem = undefined;
	this._annVidElem   = undefined;

	//this._shadersPath = "";

	this._depthRange = { min: 0.0, max: (1.0/DPF_RAD_SCALE) };
	this.setDepthRange(20.0, 20.0); // Defaults to constant 20 meters

	this._baseGeom = undefined;
	this._maxBoundSphere = undefined;
	this._baseGeomResolution = 128; //DPFutils._useMobile? 40 : 128;

	this.realizeBaseSphere();

	this._bLoading = [false, false, false]; // C,D,A
	this._bLoaded  = [false, false, false]; // C,D,A

	this._annotationList = []; // Annotations, access by hashID


	if (panourl  !== undefined) this.requestPano(panourl);
	if (depthurl !== undefined) this.requestDepth(depthurl);
	if (annurl   !== undefined) this.requestSemantic(annurl);
};

// DPF METHODS
//===============================================
DPF.prototype = {

/**
 * Set a unique ID string (e.g.: "spot1")
 * @param {string} id - Input id string
 */
setUniqueName: function( id ){
	this._uniqueName = id;
},

/**
 * Return the DPF unique ID string (e.g.: "spot1")
 * @returns {string}
 */
getUniqueName: function(){
	return this._uniqueName;
},

setPanoPath: function( path, lowpath ){
	this._panoPath = path;

	if (lowpath !== undefined) this._panoPathLow = lowpath;

	if (DPFutils.isURLvideo(path)){
		this._isPanoVid = true;
		console.log("Detected pano video stream");
		}
	},
getPanoPath: function(){ return this._panoPath; },

setDepthPath: function( path ){
	this._depthPath = path;
	if (DPFutils.isURLvideo(path)){
		this._isDepthVid = true;
		console.log("Detected depth video stream");
		}
},
getDepthPath: function(){ return this._depthPath; },

setSemanticPath: function( path ){
	this._annPath = path;
},
getSemanticPath: function(){
	return this._annPath;
},

/**
 * Returns true if any of the requested maps is still loading on this DPF
 * @returns {bool}
 */
isLoading: function(){	// if this DPF is currently loading C, D or A
	return (this._bLoading[0] || this._bLoading[1] || this._bLoading[2]);
},

/*
setVisibility: function(b){
	if (this._mainTrans === undefined) return;

	if (b)	this._mainTrans.setNodeMask(0xf);
	else 	this._mainTrans.setNodeMask(0x0);
},
*/

// Position and Orientation
/**
 * Set DPF position in virtual space
 * @param {vec3} p - Input position as vec3 (e.g.: [0,0,0])
 */
setPosition: function( p ){
	this._position = p;
	this.updateMatrixTransform();
},


/**
 * Get DPF position in virtual space
 * @returns {vec3} position as vec3 (e.g.: [0,0,0])
 */
getPosition: function(){
	return this._position;
},


/**
 * Set DPF orientation from Quaternion
 * @param {vec4} q - Input orientation as vec4 (e.g.: [0,0,0,0])
 */
setOrientationFromQuaternion: function( q ){
	this._orientation = q;
	this.updateMatrixTransform();
},


/**
 * Set DPF orientation from Euler vector (rx, ry, rz)
 * @param {vec3} v - Input orientation as vec3 of radians (e.g.: [0, 0, 1.5])
 */
setOrientationFromEulerVector: function( v ){
	this._mOrient = osg.mat4.create(); //osg.Matrix.create();

	var Rx = osg.mat4.create(); //osg.Matrix.create();
	//osg.Matrix.makeRotate( v[0], 1.0, 0.0, 0.0, Rx );
	osg.mat4.rotate(Rx, Rx, v[0], DPF_X_AXIS);

	var Ry = osg.mat4.create(); //osg.Matrix.create();
	//osg.Matrix.makeRotate( v[1], 0.0, 1.0, 0.0, Ry );
	osg.mat4.rotate(Ry, Ry, v[1], DPF_Y_AXIS);

	var Rz = osg.mat4.create(); //osg.Matrix.create();
	//osg.Matrix.makeRotate( v[2], 0.0, 0.0, 1.0, Rz ); // +Math.PI (OLD encoder)
	osg.mat4.rotate(Rz, Rz, v[2], DPF_Z_AXIS); // +Math.PI (OLD encoder)

	this._mOrient = Rx;
	osg.mat4.multiply(this._mOrient, this._mOrient, Ry);
	osg.mat4.multiply(this._mOrient, this._mOrient, Rz);
	//osg.Matrix.preMult( this._mOrient, Ry );
	//osg.Matrix.preMult( this._mOrient, Rz );
	////osg.Matrix.postMult( Ry, this._mOrient );
	////osg.Matrix.postMult( Rz, this._mOrient );

	this._vOrient[0] = v[0];
	this._vOrient[1] = v[1];
	this._vOrient[2] = v[2];

/*
	var c1 = Math.cos( v[0] / 2 );
    var c2 = Math.cos( v[1] / 2 );
    var c3 = Math.cos( v[2] / 2 );
    var s1 = Math.sin( v[0] / 2 );
    var s2 = Math.sin( v[1] / 2 );
    var s3 = Math.sin( v[2] / 2 );

	this._orientation[0] = s1 * c2 * c3 + c1 * s2 * s3;
    this._orientation[1] = c1 * s2 * c3 - s1 * c2 * s3;
    this._orientation[2] = c1 * c2 * s3 + s1 * s2 * c3;
    this._orientation[3] = c1 * c2 * c3 - s1 * s2 * s3;
*/

	this.updateMatrixTransform();

	//console.log("Euler orientation: " + v);
	//console.log("Orientation Matrix: " + this._mOrient);
},

/**
 * Return orientation as Euler vec3 (e.g.: [0, 0, 1.5])
 * @returns {vec3}
 */
getOrientation: function(){
	return this._vOrient;
},

getTransNode: function(){
	return this._mainTrans;
},

/**
 * Set DPF depth range (min, max) when using depth map
 * @param {float} min - min distance
 * @param {float} max - max distance
 */
setDepthRange: function( min, max ){
	this._depthRange.min = min/DPF_RAD_SCALE;
	this._depthRange.max = max/DPF_RAD_SCALE;

	this._mainTrans.getOrCreateStateSet().getUniform('minRad').setFloat( this._depthRange.min );
	this._mainTrans.getOrCreateStateSet().getUniform('maxRad').setFloat( this._depthRange.max );

	this._dErr = ((max-min)/256.0).toFixed(3);
	console.log("- DPF max depth error: "+this._dErr);

	//var bs = new osg.BoundingSphere();
	//bs.set( this._position, max);

/*	NOT NEEDED? - CHECK
	if (this._maxBoundSphere !== undefined) delete this._maxBoundSphere;
	this._maxBoundSphere = osg.createTexturedSphere(max*1.5, 32,32, 0.0);
	var material = new osg.Material();
	material.setTransparency( 0.0 );
	material.setDiffuse( [1,1,1, 0.0] );
	this._maxBoundSphere.getOrCreateStateSet().setAttributeAndModes( material );
	this._maxBoundSphere.setCullingActive( false );
	this._maxBoundSphere.getOrCreateStateSet().setAttributeAndModes( new osg.CullFace( 'DISABLE' ) );
*/
},


/**
 * Get DPF depth range [min, max]
 * @returns {vec2}
 */
getDepthRange: function(){
	var dr = [ 	(this._depthRange.min * DPF_RAD_SCALE),
				(this._depthRange.max * DPF_RAD_SCALE) ];
	return dr;
},

/**
 * Set Depth multiplier
 * @param {float} m - A value between 0.0 (no depth) and 1.0 (original depth)
 */
setDepthMultiplier: function(m){
	this._mainTrans.getOrCreateStateSet().getUniform('radMult').setFloat( m );
},

/**
 * Get Depth multiplier
 * @returns {float}
 */
getDepthMultiplier: function(){
	return this._mainTrans.getOrCreateStateSet().getUniform('radMult').getInternalArray()[0];
},

getDepthErrorAtDistance: function(d){
	var dMin = this._depthRange.min * DPF_RAD_SCALE;
	var dMax = this._depthRange.max * DPF_RAD_SCALE;

	if (d <= dMin) return 0.0;
	if (d > dMax)  return this._dErr;

	var t = (d-dMin)/(dMax-dMin); // [0,1]

	var e = this._dErr;
	if (this.getQuadraticDepth()) e *= (t*t);
	else e *= t;

	return e.toFixed(6);
},

setVisibility: function( p ){ // [0,1]
	if (p >= 1.0) this._mainTrans.setNodeMask(0xf);
	else this._mainTrans.setNodeMask(0x0);

	this._mainTrans.getOrCreateStateSet().getUniform('visibility').setFloat( p );
},
getVisibility: function(){
	return this._mainTrans.getOrCreateStateSet().getUniform('visibility').getInternalArray()[0];
},

// Internal use?
setDiscardFactor: function( p ){ // [0,1]
	this._mainTrans.getOrCreateStateSet().getUniform('slopeDiscard').setFloat( p );
},
getDiscardFactor: function(){
	return this._mainTrans.getOrCreateStateSet().getUniform('slopeDiscard').getInternalArray()[0];
},

setQuadraticDepth: function(b){
	this._mainTrans.getOrCreateStateSet().getUniform('bQuadratic').setInt( b );
},
toggleQuadraticDepth: function(){
	var q = this._mainTrans.getOrCreateStateSet().getUniform('bQuadratic').getInternalArray()[0];
	if (q === 1) this._mainTrans.getOrCreateStateSet().getUniform('bQuadratic').setInt( 0 );
	else this._mainTrans.getOrCreateStateSet().getUniform('bQuadratic').setInt( 1 );
},
getQuadraticDepth: function(){
	return this._mainTrans.getOrCreateStateSet().getUniform('bQuadratic').getInternalArray()[0];
},

toggleInvertDepth: function(){
	var q = this._mainTrans.getOrCreateStateSet().getUniform('bInvertDM').getInternalArray()[0];
	if (q === 1) this._mainTrans.getOrCreateStateSet().getUniform('bInvertDM').setInt( 0 );
	else this._mainTrans.getOrCreateStateSet().getUniform('bInvertDM').setInt( 1 );
},
getInvertDepth: function(){
	return this._mainTrans.getOrCreateStateSet().getUniform('bInvertDM').getInternalArray()[0];
},

// GLSL Program
setGLSLprogram: function( program ){
	if (program === undefined) return;
	//if (this._glslProgram !== undefined) return;

	this._glslProgram = program;
	this._mainTrans.getOrCreateStateSet().setAttributeAndModes( program );
},
getGLSLprogram: function(){
	return this._glslProgram;
},


initUniforms: function(){
	//if (this._mainTrans === undefined) this._mainTrans = new osg.MatrixTransform();

	var tSS = this._mainTrans.getOrCreateStateSet();

	// FIXME: WARN if add all uniforms, they override upper apply
/*
	tSS.addUniform( osg.Uniform.createInt1( DPF_BASE_UNIT,  'baseSampler' ));
	tSS.addUniform( osg.Uniform.createInt1( DPF_DEPTH_UNIT, 'depthSampler' ));
	tSS.addUniform( osg.Uniform.createInt1( DPF_SEM_UNIT,   'semanticSampler' ));
*/
	//tSS.addUniform( osg.Uniform.createFloat1( 0.0, 'time' ));
	//tSS.addUniform( osg.Uniform.createInt1( 0, 'annotationHash' ));
	tSS.addUniform( osg.Uniform.createInt1( 0, 'bDepthVision' ));

	//tSS.addUniform( osg.Uniform.createFloat4(this._DIMcolor, 'dimColor' ));
	//tSS.addUniform( osg.Uniform.createFloat4(this._annActiveColor, 'annActiveColor' ));
	//tSS.addUniform( osg.Uniform.createFloat4(this._annInactiveColor, 'annInactiveColor' ));

	//tSS.addUniform( osg.Uniform.createFloat2( [this._DOFweight, 0.0], 'DOF' ));


	tSS.addUniform( osg.Uniform.createFloat1( 0.0, 'minRad' ));
	tSS.addUniform( osg.Uniform.createFloat1( (1.0/DPF_RAD_SCALE), 'maxRad' ));

	tSS.addUniform( osg.Uniform.createFloat1( 1.0, 'radMult' ));
	tSS.addUniform( osg.Uniform.createFloat1( 1.0, 'visibility' ));
	tSS.addUniform( osg.Uniform.createFloat1( 0.0, 'slopeDiscard' )); // 0.0
	//tSS.addUniform( osg.Uniform.createFloat1( 256.0, 'annotationWidth' ));


	//tSS.addUniform( osg.Uniform.createFloat3( [0,0,0], 'camPos'));
	//tSS.addUniform( osg.Uniform.createFloat3( [0,0,0], 'panoPos'));

	//tSS.addUniform( osg.Uniform.createFloat4( osg.vec4.fromValues(0,0,0, 0.5), 'dimColor'));

	// bool
	tSS.addUniform( osg.Uniform.createInt1( 1, 'bQuadratic' ));
	tSS.addUniform( osg.Uniform.createInt1( 0, 'bInvertDM' ));
	tSS.addUniform( osg.Uniform.createInt1( 1, 'bActive' ));
},

// Internal use
updateMatrixTransform: function(){
	var M = osg.mat4.create();

	// Trans (new)
	osg.mat4.translate(M, M, this._position );

	// Local orientation
	if (this._mOrient !== undefined){
		////osg.Matrix.postMult( this._mOrient, M );
		//$osg.Matrix.preMult( M, this._mOrient );
		osg.mat4.multiply(M, M, this._mOrient);
		}

	// Scale
    var S = osg.mat4.create();
    //$osg.Matrix.makeScale( DPF_RAD_SCALE,DPF_RAD_SCALE,DPF_RAD_SCALE, S );
	//osg.mat4.scale(S, S, [DPF_RAD_SCALE,DPF_RAD_SCALE,DPF_RAD_SCALE]);
	osg.mat4.fromScaling( S, [DPF_RAD_SCALE,DPF_RAD_SCALE,DPF_RAD_SCALE]);

	//$osg.Matrix.preMult( M, S );
	osg.mat4.multiply(M, M,S);

	// Trans
/*
	//$osg.Matrix.setTrans(M, this._position[0],this._position[1],this._position[2]);
	//osg.mat4.translate(M, M, this._position );
*/
	console.log("Updated DPF Position: "+this._position);

	this._mainTrans.setMatrix( M );
},

realizeBaseSphere: function(){
	//console.log("Realizing base UV-sphere...");
	this._mainTrans.setCullingActive( false );

	this.updateMatrixTransform();

	// If base uv-sphere already created, skip
	//if (this._baseGeom !== undefined) return;

	this._baseGeom = osg.createTexturedSphere(1.0, this._baseGeomResolution, this._baseGeomResolution);

	this._baseGeom.setCullingActive( false );
	this._baseGeom.getOrCreateStateSet().setAttributeAndModes( new osg.CullFace( 'DISABLE' ) ); // CHECK

	// Local Z-up rotation (fix) and add our child uv-sphere
	var Mrz = osg.mat4.create(); //osg.Matrix.create();
	
	//$osg.Matrix.makeRotate( -Math.PI/2.0, 1.0, 0.0, 0.0, Mrz );
	osg.mat4.rotate(Mrz, Mrz, -Math.PI/2.0, DPF_X_AXIS);

	this._baseGeomT = new osg.MatrixTransform();
	this._baseGeomT.setMatrix(Mrz);
	this._baseGeomT.setCullingActive( false );
	this._baseGeomT.addChild(this._baseGeom);

	//var D = new osg.Depth( osg.Depth.ALWAYS );
	//D.setRange(0.0, 1.0);
	//this._baseGeom.getOrCreateStateSet().setAttributeAndModes( D );

	// Main trans is the upper MAIN Transform node
	this._mainTrans.addChild( this._baseGeomT ); // this._baseGeom
},

/**
 * Request loading of Pano base channel (color), or multiple channels if unified layout option is enabled
 * @param {string} pathurl - If defined, it loads panoramic color or video-stream
 */
requestPano: function( pathurl ){
	var thisDPF = this;
	thisDPF._bLoading[0] = true;

	if (pathurl !== undefined) thisDPF.setPanoPath(pathurl);

	if (thisDPF._panoPath === undefined) return; // no url path, quit

	// Video pano
	if (thisDPF._isPanoVid){
	    thisDPF._panoVidElem = document.createElement('video');
	    thisDPF._panoVidElem.style.display = 'none';

        var image = new osg.ImageStream( thisDPF._panoVidElem );

        thisDPF._panoVidElem.preload     = 'auto';
        thisDPF._panoVidElem.loop        = true;
        thisDPF._panoVidElem.crossOrigin = 'anonymous';
        thisDPF._panoVidElem.src         = thisDPF._panoPath;

        //window.image = image;
        //this._currentImageStream = image;

        image.whenReady().then( function ( imageStream ) {
            var panoTexture = new osg.Texture();
            panoTexture.setImage( image );

            panoTexture.setMinFilter( osg.Texture.LINEAR );  // LINEAR: Do not use mipmaps on video
            panoTexture.setMagFilter( osg.Texture.LINEAR );
            panoTexture.setWrapS( osg.Texture.REPEAT ); // CLAMP_TO_EDGE
            panoTexture.setWrapT( osg.Texture.CLAMP_TO_EDGE );

            // Fix pano flip
            panoTexture.setFlipY( false );

			thisDPF._mainTrans.getOrCreateStateSet().setTextureAttributeAndModes( DPF_BASE_UNIT, panoTexture );
			console.log("Videopano " + thisDPF._panoPath + " loaded.");
			thisDPF._bLoading[0] = false;
			thisDPF._bLoaded[0]  = true;

			imageStream.play();
			thisDPF._isVideoStreamOnPlay = true;

			}.bind( thisDPF ) );
		}

	// Image pano
	else {
		//var panoTexture = new osg.Texture();
		thisDPF._colorTex = new osg.Texture();

		// Texture loader
		var loadPanoColorTexture = function(path, onComplete){
			osgDB.readImageURL( path ).then(
		        function ( data ){
					thisDPF._colorTex.setImage( data );

		            thisDPF._colorTex.setMinFilter( osg.Texture.LINEAR_MIPMAP_LINEAR ); // osg.Texture.LINEAR_MIPMAP_LINEAR // osg.Texture.LINEAR
		            thisDPF._colorTex.setMagFilter( osg.Texture.LINEAR );
		            thisDPF._colorTex.setWrapS( osg.Texture.REPEAT ); // CLAMP_TO_EDGE / REPEAT
		            thisDPF._colorTex.setWrapT( osg.Texture.CLAMP_TO_EDGE );

		            // Fix pano flip
		            thisDPF._colorTex.setFlipY( false );

					thisDPF._mainTrans.getOrCreateStateSet().setTextureAttributeAndModes( DPF_BASE_UNIT, thisDPF._colorTex );
					console.log("Pano texture " + path + " loaded.");
					thisDPF._bLoading[0] = false;
					thisDPF._bLoaded[0]  = true;

					onComplete();
					});
			};
/*
		if (thisDPF._panoPathLow.length > 0){
			loadPanoColorTexture(
				thisDPF._panoPathLow, function(){
					loadPanoColorTexture(thisDPF._panoPath, function(){
						thisDPF._bLoading[0] = false;
						})
					});
			}
		else
*/
			loadPanoColorTexture(
				thisDPF._panoPath,
				function(){
					thisDPF._bLoading[0] = false;
					thisDPF._bLoaded[0]  = true;
					});

		}
},

requestColor: function(pathurl){ return this.requestPano( pathurl ); },

/**
 * Request loading of egocentric depth channel
 * @param {string} pathurl  - If defined, it loads egocentric depth map or video-stream
 */
requestDepth: function( pathurl ){
	if (this._useUnifiedLayout) return; // Nothing to load on unified layout

	var thisDPF = this;
	thisDPF._bLoading[1] = true;

	if (pathurl !== undefined) thisDPF.setDepthPath(pathurl);

	if (thisDPF._depthPath === undefined) return; // no url path, quit

	// Video pano
	if (thisDPF._isDepthVid){
	    thisDPF._depthVidElem = document.createElement('video');
	    thisDPF._depthVidElem.style.display = 'none';

        var image = new osg.ImageStream( thisDPF._depthVidElem );

        thisDPF._depthVidElem.preload     = 'auto';
        thisDPF._depthVidElem.loop        = true;
        thisDPF._depthVidElem.crossOrigin = 'anonymous';
        thisDPF._depthVidElem.src         = thisDPF._depthPath;

        //window.image = image;
        //this._currentImageStream = image;

        image.whenReady().then( function ( imageStream ) {
            var depthTexture = new osg.Texture();
            depthTexture.setImage( image );

	        depthTexture.setMinFilter( osg.Texture.LINEAR ); // Do not use mipmaps on video
	        depthTexture.setMagFilter( osg.Texture.LINEAR );
	        depthTexture.setWrapS( osg.Texture.REPEAT ); // CLAMP_TO_EDGE
	        depthTexture.setWrapT( osg.Texture.CLAMP_TO_EDGE );

            // Fix pano flip
            depthTexture.setFlipY( false );

			thisDPF._mainTrans.getOrCreateStateSet().setTextureAttributeAndModes( DPF_DEPTH_UNIT, depthTexture );
			console.log("VideoDepth " + thisDPF._depthPath + " loaded.");
			thisDPF._bLoading[1] = false;
			thisDPF._bLoaded[1]  = true;

			imageStream.play();
			thisDPF._isVideoStreamOnPlay = true;

			}.bind( thisDPF ) );
		}

	// Image pano
	else {
		osgDB.readImageURL( thisDPF._depthPath ).then(
	        function ( data ){
	            var depthTexture = new osg.Texture();
				depthTexture.setImage( data );

	            depthTexture.setMinFilter( osg.Texture.LINEAR_MIPMAP_LINEAR ); // LINEAR_MIPMAP_LINEAR // osg.Texture.LINEAR
	            depthTexture.setMagFilter( osg.Texture.LINEAR ); // osg.Texture.LINEAR
				
	            depthTexture.setWrapS( osg.Texture.REPEAT ); // CLAMP_TO_EDGE / REPEAT
	            depthTexture.setWrapT( osg.Texture.CLAMP_TO_EDGE );

	            // Fix pano flip
	            depthTexture.setFlipY( false );

				thisDPF._mainTrans.getOrCreateStateSet().setTextureAttributeAndModes( DPF_DEPTH_UNIT, depthTexture );
				console.log("Depth texture " + thisDPF._depthPath + " loaded.");
				thisDPF._bLoading[1] = false;
				thisDPF._bLoaded[1]  = true;
				});
			}
},

/**
 * Request loading of egocentric semantic channel
 * @param {string} pathurl - If defined, it loads egocentric semantic map
 */
requestSemantic: function( pathurl ){
	if (this._useUnifiedLayout) return; // Nothing to load on unified layout

	var thisDPF = this;
	thisDPF._bLoading[2] = true;

	if (pathurl !== undefined) thisDPF.setSemanticPath(pathurl);

	if (thisDPF._annPath === undefined) return; // no url path, quit

	osgDB.readImageURL( thisDPF._annPath ).then(
        function ( data ){
            var annTexture = new osg.Texture();

			// Avoid PageSpeed optimization
			var im = data.getImage();
			im.setAttribute("data-pagespeed-no-transform", "true");
			im.setAttribute("pagespeed-no-transform", "true");
			//console.log( im );

			annTexture.setImage( data );

            annTexture.setMinFilter( 'NEAREST' ); // osg.Texture.LINEAR
            annTexture.setMagFilter( 'NEAREST' );
            annTexture.setWrapS( osg.Texture.REPEAT ); // CLAMP_TO_EDGE / REPEAT
            annTexture.setWrapT( osg.Texture.CLAMP_TO_EDGE );

            // Fix pano flip
            annTexture.setFlipY( false );

			thisDPF._mainTrans.getOrCreateStateSet().setTextureAttributeAndModes( DPF_SEM_UNIT, annTexture );
			console.log("Annotation texture " + thisDPF._annPath + " loaded.");
			thisDPF._bLoading[2] = false;
			thisDPF._bLoaded[2]  = true;
			});
},

/**
 * Play ALL egocentric video-streams for this {@link DPF}
 */
playVideoStreams: function(){
	if (this._panoVidElem !== undefined)  this._panoVidElem.play();
	if (this._depthVidElem !== undefined) this._depthVidElem.play();
	if (this._annVidElem !== undefined)   this._annVidElem.play();
	this._isVideoStreamOnPlay = true;
},

/**
 * Pause ALL egocentric video-streams for this {@link DPF}
 */
pauseVideoStreams: function(){
	if (this._panoVidElem !== undefined)  this._panoVidElem.pause();
	if (this._depthVidElem !== undefined) this._depthVidElem.pause();
	if (this._annVidElem !== undefined)   this._annVidElem.pause();
	this._isVideoStreamOnPlay = false;
},

/**
 * Returns TRUE if egocentric video-streams are playing for this {@link DPF}
 * @returns {bool}
 */
isPlayingVideoStreams: function(){
	return this._isVideoStreamOnPlay;
},

/**
 * Play or Pause ALL egocentric video-streams for this {@link DPF}
 */
playOrPauseVideoStreams: function(){
	if (this._isVideoStreamOnPlay) this.pauseVideoStreams();
	else this.playVideoStreams();
},

/**
 * Syncronize ALL panoramic video-streams for this DPF
 */
syncVideoStreams: function(){
	if (this._panoVidElem === undefined) return;

	var t = this._panoVidElem.currentTime;

	if (this._depthVidElem !== undefined)
		this._depthVidElem.currentTime = t;
	if (this._annVidElem !== undefined)
		this._annVidElem.currentTime = t;
},

/**
 * Creates and register a new annotation by providing hash-ID and hover and select functions.
 * @param {integer} hashID - The hash-ID to be registered
 * @param {function} onHover - Function when user will hover this annotation (optional)
 * @param {function} onSelect - Function when user will select this annotation (optional)
 */
registerAnnotation: function(hashID, onHover, onSelect){
	var A = new DPFannotation(this, hashID);

	if (onHover  !== undefined) A.onHover  = onHover;  //A.setOnHover(onHover);
	if (onSelect !== undefined) A.onSelect = onSelect; //A.setOnSelect(onSelect);

	//this._annotationList.push(A);
	this._annotationList[hashID] = A;
},

/**
 * Creates and register annotation hover by providing hash-ID and on hover function
 * @param {integer} hashID - The hash-ID to be registered
 * @param {function} onHover - Function when user will hover this annotation
 */
onHoverAnnotation: function(hashID, onHover){
	if (this._annotationList[hashID] === undefined) 
		this._annotationList[hashID] = new DPFannotation(this, hashID);

	this._annotationList[hashID].onHover = onHover;
},

/**
 * Creates and register annotation select by providing hash-ID and on select function
 * @param {integer} hashID - The hash-ID to be registered
 * @param {function} onSelect - Function when user will select this annotation
 */
onSelectAnnotation: function(hashID, onSelect){
	if (this._annotationList[hashID] === undefined) 
		this._annotationList[hashID] = new DPFannotation(this, hashID);

	this._annotationList[hashID].onSelect = onSelect;
},

};

//=================================================================================================
// DPF Annotation class
//=================================================================================================
/**
 * @classdesc DPF annotation object is associated with a {@link DPF} and an hash-ID
 * @param {object} dpf - The {@link DPF} being associated with this annotation
 * @param {integer} hashID - The hash-ID
 * @class
 * @constructor
 */
var DPFannotation = function( dpf, hashID){
	var thisANN = this;

	thisANN.dpf    = dpf;
	thisANN.hashID = hashID;

	// Built-in Hover (is being replaced by user-provided)
	thisANN.onHover = function(){
		console.log("Hovering annotation #" + thisANN.hashID);
		};

	// Built-in Select (is being replaced by user-provided)
	thisANN.onSelect = function(){
		console.log("Selected annotation #" + thisANN.hashID);
		};
};


/* DEPRECATED
DPFannotation.prototype = {

setOnHover: function(onHover){
	this.onHover = onHover;
},

setOnSelect: function(onSelect){
	this.onSelect = onSelect;
},

};
*/

//=================================================================================================
// DPF UPDATE CALLBACK class
//=================================================================================================
var DPFupdateCallback = function(dpfhandler){
	this._dpfh = dpfhandler;

	// handy computational vars
	this._tReqNorm = 0.0;

	this._vD = osg.vec3.create();
	this._vE = osg.vec3.create();

	this._focP = osg.vec3.create();

	this._distTarg = Number.MAX_VALUE;
	this._distView = Number.MAX_VALUE;
	this._bView    = false;
};

/** @lends DPFupdateCallback.prototype */
DPFupdateCallback.prototype = {
    update: function ( node, nv ){
		var DPFh = this._dpfh;

        DPFh._time = nv.getFrameStamp().getSimulationTime();
        var dt = (DPFh._time - DPFh._time);
        if ( dt < 0 ) return true;

		// Sync DPF Handler internal time
		DPFh._ssGlobal.getUniform('time').setFloat( DPFh._time );

		// DOF
		DPFh._ssGlobal.getUniform('DOF').setFloat2( [DPFh._DOFweight, DPFh._hoverAnnDepth] );

		// If no DPFs, quit
		if (DPFh._dpfList.length == 0) return true;
		//console.log("tick");

		// DIM
		if (DPFh._tDIMreq > 0.0) DPFh._handleDIM();

		// Updates eye+target
		DPFh._manip.getEyePosition(DPFh._eyePos);
		DPFh._manip.getTarget(DPFh._targPos);

		// Updates targ&pos delta2 (for query RTT)
		// TODO: use lastQuat instead!
		DPFh._targD2 = 1000.0 * osg.vec3.squaredDistance(DPFh._targPos, DPFh._lastTargPos);
		DPFh._posD2  = 1000.0 * osg.vec3.squaredDistance(DPFh._eyePos, DPFh._lastEyePos);

		// aRTT canRead tolerances
		(DPFh._targD2 > 0.002 || DPFh._posD2 > 0.01)? DPFh._bRTTcanRead = false : DPFh._bRTTcanRead = true;

		DPFh._lastTargPos[0] = DPFh._targPos[0];
		DPFh._lastTargPos[1] = DPFh._targPos[1];
		DPFh._lastTargPos[2] = DPFh._targPos[2];
		DPFh._lastEyePos[0] = DPFh._eyePos[0];
		DPFh._lastEyePos[1] = DPFh._eyePos[1];
		DPFh._lastEyePos[2] = DPFh._eyePos[2];

        // Updates direction
        osg.vec3.sub( DPFh._direction, DPFh._targPos, DPFh._eyePos);
        osg.vec3.normalize( DPFh._direction, DPFh._direction );
		//console.log(DPFh._direction);

		//$osg.vec3.add(DPFh._eyePos,DPFh._manip._direction, DPFh._targPos);
		//osg.vec3.add(DPFh._targPos, DPFh._eyePos,DPFh._manip._direction);
		osg.vec3.add(DPFh._targPos, DPFh._eyePos, DPFh._direction);


		// Update 3D pointer
		// TODO: not needed, since we moved to GPU
		//DPFh._update3Dpointer();


		DPFh._ssGlobal.getUniform('uWorldEyePos').setFloat3(DPFh._eyePos);
		DPFh._ssGlobal.getUniform('uQueryDir').setFloat3(DPFh._direction);


/*
		if (DPFh._pointerTrans !== undefined){
			var pp   = osg.vec3.create();
			var dd   = DPFh._hoverAnnDepth; // * 0.98;

			var xdir = [dd, dd, dd];

			xdir[0] = xdir[0] * DPFh._direction[0];
			xdir[1] = xdir[1] * DPFh._direction[1];
			xdir[2] = xdir[2] * DPFh._direction[2];

			//$osg.vec3.add(DPFh._eyePos, xdir, pp);
			osg.vec3.add(pp, DPFh._eyePos, xdir);

			//osg.Matrix.setTrans(DPFh._pointerTrans.getMatrix(), pp[0],pp[1],pp[2]);
			DPFh._pointerTrans.setPosition( pp );
			}
*/

		// Loop all DPFs
		//var distTarg = 999999.0;
		//var distView = 999999.0;
		this._distTarg = Number.MAX_VALUE;
		this._distView = Number.MAX_VALUE;
		this._bView    = false;

		var numDPFs = DPFh._dpfList.length;

		for (var i = 0; i < numDPFs; i++){
			var dpf    = DPFh._dpfList[i];
			var dpfPos = dpf.getPosition().slice(0);

			osg.vec3.transformMat4(dpfPos, dpfPos, DPFh._dpfNetworkM);

			dpf.setVisibility(0.0);
			//dpf.setDiscardFactor(0.97);

			// DPF in view
			osg.vec3.sub(this._vE, DPFh._eyePos, dpfPos);
			var de = osg.vec3.squaredDistance(DPFh._eyePos, dpfPos);

			if (de > 1.0){
				osg.vec3.normalize(this._vE,this._vE);
				var ang = osg.vec3.dot( DPFh._direction, this._vE );
				//var ang = Math.abs( Math.acos( osg.vec3.dot( DPFh._manip._direction, vE ) ));
				//ang *= DPF_RAD2DEG;
				// Acceptance cone for candidates should be < -0.9 or -0.8
				//if (ang < -0.9 && (i!=DPFh._inviewDPFid)) DPFh._inviewDPFid = i; //bView = true;
				if (ang < -0.8 && (de < this._distView)){
					DPFh._inviewDPFid = i;
					this._distView    = de;
					}
				}
/*
			var de = osg.vec3.squaredDistance(vE);
			if (de < distEye){
				distEye = de;

				osg.vec3.normalize(vE,vE);
				var ang = Math.abs( Math.acos( osg.vec3.dot( DPFh._manip._direction, vE ) ));
				ang *= DPF_RAD2DEG;
				// Acceptance cone for candidates should be < -0.9 or -0.8
				if (ang < 10.0 && (i!=DPFh._inviewDPFid)) DPFh._inviewDPFid = i; //bView = true;

				//if (i === 0) console.log(ang);
				}
*/
			////osg.vec3.sub(DPFh._eyePos, dpfPos, vD); // DPFh._targPos (unsing target offset)
			//var focP = osg.vec3.create();

/*
			osg.vec3.lerp(this._focP, DPFh._eyePos, DPFh._pointerTrans.getPosition(), 0.0); // 0.02
			osg.vec3.sub(this._vD, this._focP, dpfPos);

			var d = osg.vec3.squaredDistance(this._focP, dpfPos);
*/
			if (de < this._distTarg){    // d
				this._distTarg    = de;  // d
				DPFh._activeDPF   = dpf;
				DPFh._activeDPFid = i;
				}
			}

		// Closest is visible
		DPFh._activeDPF.setVisibility(1.0);

		// Preload (on demand)
		DPFh._preloadDPF(DPFh._activeDPF);

		//console.log("In view: "+DPFh._inviewDPFid);

		// Insight
		if (DPFh._inviewDPFid >=0 && numDPFs>1) DPFh._updateInsightDPF();

		// Handle location transitions
		if (DPFh._tMoveReq >= 0.0){
			this._tReqNorm = (DPFh._time - DPFh._tMoveReq) / DPFh._tMoveDur;
			//console.log("T: "+T);

			// End
			if (this._tReqNorm >= 1.0){
				DPFh._tMoveReq = -1.0;

				DPFh._eyePos[0] = DPFh._reqTo[0];
				DPFh._eyePos[1] = DPFh._reqTo[1];
				DPFh._eyePos[2] = DPFh._reqTo[2];

				DPFh._targPos[0] = DPFh._eyePos[0] + DPFh._direction[0];
				DPFh._targPos[1] = DPFh._eyePos[1] + DPFh._direction[1];
				DPFh._targPos[2] = DPFh._eyePos[2] + DPFh._direction[2];

				DPFh._inviewDPFid = -1;
				DPFh._insightTrans.setNodeMask(0x0);

				if (DPFh.onTransitionEnded) DPFh.onTransitionEnded();
				}
			
			else {
				this._tReqNorm = (1.0 - Math.cos(this._tReqNorm * Math.PI)) / 2.0;
				//osg.vec3.lerp(t, DPFh._reqFrom , DPFh._reqTo, []);
				//var lerP = osg.vec3.create();
				//$osg.vec3.lerp(T, DPFh._reqFrom , DPFh._reqTo, lerP);
				
				//osg.vec3.lerp(lerP, DPFh._reqFrom , DPFh._reqTo, T);
				osg.vec3.lerp(DPFh._eyePos, DPFh._reqFrom , DPFh._reqTo, this._tReqNorm);

				////DPFh._manip.setEyePosition( lerP );
				//DPFh._eyePos = lerP;

				//DPFh._manip.setTarget(DPFh._targPos);
				} 
			}

		// Nav sync
		DPFh._manip.setEyePosition( DPFh._eyePos );
		//DPFh._manip.setTarget( DPFh._targPos );

		//console.log(DPFh._targPos);


		// Gamepads
		DPFh._handleGamepads();

		// Hook on custom onTick() if defined
		if (DPFh.onTick !== undefined) DPFh.onTick();


		// Update GUI elements
/*
		if (!DPFh._vrState){
			var hashDistEl = document.getElementById( 'annotationDist' );
			if (hashDistEl !== null) hashDistEl.innerHTML = DPFh._hoverAnnDepth.toFixed(3);
			}
*/
        return true;
    }
};

//=================================================================================================
// DPF HANDLER class
//=================================================================================================
/**
 * DPF handler manages the whole network of {@link DPF}s in the 3D space. When the object is created, internal data is initialized and scene graphs are constructed.
 * @param {object} canvas - The canvas element the handler is attached to
 * @param {object} viewer - An existing viewer (optional)
 * @class
 * @constructor
 */
var DPFhandler = function(canvas, viewer){
	if (canvas === undefined){
		console.log("Canvas not valid");
		return;
		}

	this._canvas = canvas;

	this._useMobile = DPFutils._useMobile; //false;
	this._useDeviceOrientation = false;

	//this._updateDTmsec = 20; // (DEPRECATED)

	if (viewer === undefined) this._viewer = undefined;
	else this._viewer = viewer;

	this._dpfList  = [];
	
	this._root = new osg.Node();
	this._root.setName( 'root' );

	this._dpfNetworkT = new osg.MatrixTransform(); // main group
	this._dpfNetworkM = osg.mat4.create();
	this._dpfNetworkT.setMatrix( this._dpfNetworkM );

	// Visible pass
	this._stdVisionGroup = new osg.Node();
	this._stdVisionGroup.getOrCreateStateSet().setAttributeAndModes( new osg.CullFace( osg.CullFace.FRONT ), osg.StateAttribute.ON | osg.StateAttribute.OVERRIDE );
	this._stdVisionGroup.getOrCreateStateSet().setAttributeAndModes( new osg.Depth( osg.Depth.ENABLE ), osg.StateAttribute.ON | osg.StateAttribute.OVERRIDE );
	this._stdVisionGroup.getOrCreateStateSet().setAttributeAndModes( new osg.BlendFunc(), osg.StateAttribute.ON | osg.StateAttribute.OVERRIDE );
	this._stdVisionGroup.getOrCreateStateSet().setRenderingHint('TRANSPARENT_BIN');
	//this._stdVisionGroup.getOrCreateStateSet().setBinNumber(11);

	// Semantic pass
	this._annVisionGroup = new osg.MatrixTransform();
	this._annVisionGroup.setMatrix( this._dpfNetworkM );
	this._annVisionGroup.getOrCreateStateSet().setAttributeAndModes( new osg.Depth( osg.Depth.ENABLE ), osg.StateAttribute.ON | osg.StateAttribute.OVERRIDE );
	this._annVisionGroup.getOrCreateStateSet().setAttributeAndModes( new osg.CullFace( osg.CullFace.FRONT ), osg.StateAttribute.ON | osg.StateAttribute.OVERRIDE );
	this._annVisionGroup.getOrCreateStateSet().setAttributeAndModes( new osg.BlendFunc(), osg.StateAttribute.OFF | osg.StateAttribute.OVERRIDE );
	this._annVisionGroup.getOrCreateStateSet().setRenderingHint('OPAQUE_BIN');

	this.setupFallbacks();

/*
	this._annVisionGroup.getOrCreateStateSet().setAttributeAndModes(
		new osg.Depth( osg.Depth.LESS ),
		osg.StateAttribute.ON | osg.StateAttribute.OVERRIDE
		);
*/


	this._dpfNetworkT.addChild(this._stdVisionGroup);

	// Global uniforms
	this._initGlobalUniforms();

	this.resetDIM();

	// Annotation
	this._annXYquery = [0.5, 0.5];
	this._create3Dpointer();
	this._bRTTcanRead = true;

	this._aEnabled = true;

	// User event handling
	this.onHoverAnnotation   = undefined;
	this.onLeaveAnnotation   = undefined;
	this.onSelectAnnotation  = undefined;
	this.onTransitionRequest = undefined;
	this.onTransitionEnded   = undefined;

	// Insight
	this.createInsightPointer(0.1, [0.5,2.0,0.5, 1.0] );

	this.onTick = undefined;

/*
	this._dpfNetworkT.getOrCreateStateSet().setAttributeAndModes(
		new osg.Depth( osg.Depth.LESS ),
		osg.StateAttribute.PROTECTED
		);
*/
	this._root.addChild(this._dpfNetworkT);

	this._shadersPath = undefined;
	this._glslProgram = undefined;

	this._eyePos    = osg.vec3.fromValues(0.0,0.0,0.0);
	this._targPos   = osg.vec3.fromValues(0.0,1.0,0.0);
	this._direction = osg.vec3.fromValues(0.0,1.0,0.0);
	this._fov       = 60.0;

	this._lastTargPos = osg.vec3.fromValues(0.0,0.0,0.0);
	this._lastEyePos  = osg.vec3.fromValues(0.0,0.0,0.0);

	// Transitions
	this._reqFrom  = osg.vec3.create();
	this._reqTo    = osg.vec3.create();
	this._tMoveReq = -1.0;
	this._tMoveDur = 3.0;

	this._activeDPF   = undefined;
	this._activeDPFid = -1;
	this._inviewDPFid  = -1;

	//this.setupFallbacks();

	this._bDepthVision = false;

	// WebVR
	this._vrState = false;
	this._vrNode  = undefined;
};

/** @lends DPFhandler.prototype */
DPFhandler.prototype = {

/*
_updateGLSLcanvasSize: function(){
	if (this._canvas === undefined) return;

	this._ssGlobal.getUniform('vCanvasSize').setFloat2( [this._canvas.clientWidth, this._canvas.clientHeight] );
},
*/

_initGlobalUniforms: function(){

	this._ssGlobal = this._dpfNetworkT.getOrCreateStateSet();
	this._ssVis    = this._stdVisionGroup.getOrCreateStateSet();
	this._ssAnn    = this._annVisionGroup.getOrCreateStateSet();

	this._DIMweight = 0.0; // low DIM by default
	this._DIMcolor         = osg.vec4.fromValues(0,0,0, this._DIMweight);
	
	this._annActiveColor   = osg.vec4.fromValues(0.0,1.0,0.0, 0.5);
	this._annInactiveColor = osg.vec4.fromValues(1.0,1.0,1.0, 0.3);
	
	this._tDIMdur   = 1.0;

	this._DOFweight = 0.0; // no DOF by Default

	this._vPointerDir = osg.vec3.create();

	this._useUnifiedLayout = false;

	// Global
	this._ssGlobal.addUniform( osg.Uniform.createInt1( DPF_BASE_UNIT,  'baseSampler' ));
	this._ssGlobal.addUniform( osg.Uniform.createInt1( DPF_DEPTH_UNIT, 'depthSampler' ));
	this._ssGlobal.addUniform( osg.Uniform.createInt1( DPF_SEM_UNIT,   'semanticSampler' ));

	this._ssGlobal.addUniform( osg.Uniform.createFloat1( 0.0, 'time' ));
	this._ssGlobal.addUniform( osg.Uniform.createInt1( 0, 'annotationHash' ));
	this._ssGlobal.addUniform( osg.Uniform.createInt1( 0, 'bDepthVision' ));

	this._ssGlobal.addUniform( osg.Uniform.createFloat4(this._DIMcolor, 'dimColor' ));
	this._ssGlobal.addUniform( osg.Uniform.createFloat4(this._annActiveColor, 'annActiveColor' ));
	this._ssGlobal.addUniform( osg.Uniform.createFloat4(this._annInactiveColor, 'annInactiveColor' ));

	this._ssGlobal.addUniform( osg.Uniform.createFloat2( [this._DOFweight, 0.0], 'DOF' ));

	this._ssGlobal.addUniform( osg.Uniform.createFloat3(osg.vec3.create(), 'uQueryDir' ));
	this._ssGlobal.addUniform( osg.Uniform.createFloat3(osg.vec3.create(), 'uWorldEyePos' ));

	// TODO: remove
	//this._ssGlobal.addUniform( osg.Uniform.createFloat2(osg.vec2.create(), 'uCanvasRes' ));
	this._ssGlobal.addUniform( osg.Uniform.createFloat3(osg.vec3.create(), 'uFocusPos' ));

	// Visible pass
	this._ssVis.addUniform( osg.Uniform.createInt1( 0, 'bAnnotationVision' ));
	//this._ssVis.addUniform( osg.Uniform.createInt1( 0, 'annotationHash' ));
	//this._ssVis.addUniform( osg.Uniform.createFloat1( 0.0, 'time' ));
	//this._ssVis.addUniform( osg.Uniform.createFloat4(this._DIMcolor, 'dimColor' ));
	//this._ssVis.addUniform( osg.Uniform.createFloat2( [this._DOFweight, 0.0], 'DOF' ));

	// Annotation pass
	this._ssAnn.addUniform( osg.Uniform.createInt1( 1, 'bAnnotationVision' ));
	//this._ssAnn.addUniform( osg.Uniform.createInt1( 0, 'bDepthVision' ));
},

// TODO: remove
_updateCanvasSize: function(){
	if (this._canvas === undefined) return;
	if (this._ssGlobal === undefined) return;

	this._ssGlobal.getUniform('uCanvasRes').setFloat2( [this._canvas.width, this._canvas.height] );
},

/**
 * Once the DPF handler is configured, this starts the handler. Internal viewer is initialized, listeners attached and update callbacks registered.
 */
run: function(){
	if (this._canvas === undefined){
		console.log("ERROR: you must provide a canvas element");
		return;
		}

	if (this._viewer === undefined){
		this._viewer = new osgViewer.Viewer( this._canvas, {
			'antialias': true, // true fixes VR issues
			//'stats': true,
			//'overrideDevicePixelRatio': 1, // if specified override the device pixel ratio
			//'enableFrustumCulling': false,
			'alpha': true,
			//'scrollwheel': false,
			//'webgl2': true,
			});
		}

	this._viewer.init(); // check if this is ok on already inited viewer

	// Camera manipulator setup
	this._manip = new osgGA.FirstPersonManipulator({ inputManager: this._viewer.getInputManager() }); //new osgGA.FirstPersonManipulator();
	this._manip.setNode( this._dpfNetworkT );
	this._manip.setEyePosition( osg.vec3.fromValues(0.0,0.0,0.0) );
	this._manip.setTarget( osg.vec3.fromValues(0.0,1.0,0.0) );
	//this._manip.setDelay( 1.0 );
	
	var step = 0.5;
	this._manip._stepFactor = step;
	this._manip.setStepFactor(step);

	this._manip.computeHomePosition = function(){}; // voids key-space home
	
	
	this._viewer.setLightingMode( osgViewer.View.LightingMode.NO_LIGHT );
	this._viewer.setSceneData( this._root );
	this._viewer.setManipulator( this._manip );
	this._manip.setNode( this._dpfNetworkT );

	this.setFOV(this._fov);

	this._viewer.run();

	// NearFar Ratios
	this._NFR = 0.0003;
	this._viewer.getCamera().setNearFarRatio( this._NFR );

	// Init Annotation RTT
	this._aRTTsize = [256,256];
	this._hoverAnn = 0;
	this.initRTT();

	// Once RTT is setup, init HUD
	this.initHUD();

	// Init Timer
	this._time = 0; // new osg.Timer();

	// Attach Listeners
	this._attachListeners();

	//console.log(this._canvas.height);
	//this._updateGLSLcanvasSize();

/* TODO: remove
	if (this._canvas){
		var DPFh = this;

		//window.addEventListener("resize", DPFh._updateCanvasSize, false );
		$( window ).resize(function() {
			DPFh._updateCanvasSize();
			});

		this._updateCanvasSize();
		//console.log(this._ssGlobal.getUniform('uCanvasRes'));
		}
*/
},

// Positional GamePads
_handlePositionalGamepad: function(gamepad){
	//console.log("Handle Gamepad");

	if ("hand" in gamepad){

		// Left
		if (gamepad.hand === "left"){
			
			}

		// Right
		if (gamepad.hand === "right"){
			
			}
		}
},

_handleGamepads: function(){
	this.gamepads = navigator.getGamepads();

    for (var i = 0; i < this.gamepads.length; ++i){
        var gamepad = this.gamepads[i];

        // The array may contain undefined gamepads, so check for that as
        // well as a non-null pose.
        if (gamepad){
			
			for (var j = 0; j < gamepad.buttons.length; ++j) {
				if (gamepad.buttons[j].pressed){
					//console.log("GM: Pressed button "+j);

					// 3 = A, 4 = B
					if (j === 3) this.home();
					else this.goNextDPFinView(1.0);        
					}
				}
			}
        }
},


useDeviceOrientation: function(b){
	if (this._viewer === undefined) return;

	this._useDeviceOrientation = b;
	//this._viewer.getEventProxy().DeviceOrientation.setEnable( b );
	this._viewer.getInputManager().setEnable(InputGroups.FPS_MANIPULATOR_DEVICEORIENTATION, b);

	if (b) this._annXYquery = [0.5,0.5];
},

toggleDepthVision: function(){
	var q = this._ssGlobal.getUniform('bDepthVision').getInternalArray()[0];
	if (q === 1){
		this._ssGlobal.getUniform('bDepthVision').setInt( 0 );
		this._bDepthVision = false;
		}
	else {
		this._ssGlobal.getUniform('bDepthVision').setInt( 1 );
		this._bDepthVision = true;
		}
},

// [INTERNAL] Handle DIM animation
_handleDIM: function(){
	this._tDIM = (this._time - this._tDIMreq) / this._tDIMdur;

	if (this._tDIM >= 1.0){
		this._tDIMreq = -1.0;

		this._DIMcolor[3] = this._DIMweight;
		this._ssGlobal.getUniform('dimColor').setFloat4( this._DIMcolor );
		return;
		}
	
	// Animate DIM
	this._DIMcolor[3] = this._DIMweight * this._tDIM;

	this._ssGlobal.getUniform('dimColor').setFloat4( this._DIMcolor );
},

requestDIManimation: function(/*duration*/){
	if (this._DIMweight <= 0.0) return;
	//this._tDIMdur = (duration === undefined)? 1.0 : duration;

	this._tDIMreq = this._time;
},

resetDIM: function(){
	this._tDIMreq     = -1.0;
	this._DIMcolor[3] = 0.0;
	this._ssGlobal.getUniform('dimColor').setFloat4( this._DIMcolor );
},

setDIMcolor: function( col ){
	this._DIMcolor[0] = col[0];
	this._DIMcolor[1] = col[1];
	this._DIMcolor[2] = col[2];
},

/**
 * Set Annotation active color
 * @param {vec4} color - Color (additive overlay), alpha represents weight
 */
setAnnotationActiveColor( col ){
	this._annActiveColor[0] = col[0];
	this._annActiveColor[1] = col[1];
	this._annActiveColor[2] = col[2];
	this._annActiveColor[3] = col[3];

	this._ssGlobal.getUniform('annActiveColor').setFloat4(this._annActiveColor);
},

/**
 * Set Annotation inactive color
 * @param {vec4} color - Color (additive overlay), alpha represents weight. Default [1.0,1.0,1.0, 0.3]
 */
setAnnotationInactiveColor( col ){
	this._annInactiveColor[0] = col[0];
	this._annInactiveColor[1] = col[1];
	this._annInactiveColor[2] = col[2];
	this._annInactiveColor[3] = col[3];

	this._ssGlobal.getUniform('annInactiveColor').setFloat4(this._annInactiveColor);
},

setDIMweight: function( w ){
	this._DIMweight = w;
},

/**
 * Orient the whole DPF Network
 * @param {float} rx - Rotation around X axis (radians)
 * @param {float} ry - Rotation around Y axis (radians)
 * @param {float} rz - Rotation around Z axis (radians)
 */
orientNetwork: function(rx, ry, rz){

	osg.mat4.rotate(this._dpfNetworkM, this._dpfNetworkM, rx, DPF_X_AXIS);
	osg.mat4.rotate(this._dpfNetworkM, this._dpfNetworkM, ry, DPF_Y_AXIS);
	osg.mat4.rotate(this._dpfNetworkM, this._dpfNetworkM, rz, DPF_Z_AXIS);

	//console.log(this._dpfNetworkM);
},

translateNetwork: function(dx,dy,dz){
	// TODO:
},

/**
 * Go smoothly to the next DPF in view
 * @param {float} duration - The optional duration in seconds (take care in VR transitions!)
 */
goNextDPFinView: function(duration){
	if (this.getNumDPFs() < 2) return;

	var nID = this._inviewDPFid;
	if (nID < 0) return;

	var d = (duration === undefined)? 1.0 : duration;
	this.requestTransitionToDPF(this.getDPF(nID), d);
},

// Internal use
_triggerAnnSelect: function(){
	if (this._activeDPF === undefined) return;
	if (this._hoverAnn === 0) return;

	if (this.onSelectAnnotation !== undefined) this.onSelectAnnotation();

	var A = this._activeDPF._annotationList[this._hoverAnn];
	if (A === undefined || A.onSelect === undefined) return;

	A.onSelect();
},

// Attach Event Listeners
_attachListeners: function(){
	var thisDPFH = this;

	var modFOV = function(delta){
		var f = thisDPFH._fov + delta;
		if (f > 120.0) f = 120.0;
		if (f < 20.0)  f = 20.0;
		thisDPFH.setFOV(f);
		};

	// Keyboard
	$(function() {
		$(document).keydown(function(e) {
	    	if (e.keyCode == 32) { // home (space)
				thisDPFH.home();
				//console.log('space');
	    		}
	    	if (e.keyCode == 107) { // +
				if (!thisDPFH._vrState){
					modFOV(0.5);
					}
/*
				if (thisDPFH._activeDPF !== undefined){
		    		var m = thisDPFH._activeDPF.getDepthMultiplier();
		    		m += 0.02;
		    		if (m > 1.0) m = 1.0;
		    		thisDPFH._activeDPF.setDepthMultiplier(m);
					}
*/
	    		}
	    	if (e.keyCode == 109) { // -
				if (!thisDPFH._vrState){
					modFOV(-0.5);
					}
/*
				if (thisDPFH._activeDPF !== undefined){
		    		var m = thisDPFH._activeDPF.getDepthMultiplier();
		    		m -= 0.02;
		    		if (m < 0.0) m = 0.0;
		    		thisDPFH._activeDPF.setDepthMultiplier(m);
					}
*/
	    		}
	    	if (e.keyCode == 86){ // v
				thisDPFH.toggleVR();
	    		}
	    	if (e.keyCode == 73){ // i
				if (thisDPFH._activeDPF !== undefined){
					thisDPFH._activeDPF.toggleInvertDepth();
					}
	    		}
	    	if (e.keyCode == 75){ // k
				if (thisDPFH._activeDPF !== undefined){
					thisDPFH.toggleDepthVision();
					}
	    		}

	    	if (e.keyCode == 81){ // q
				if (thisDPFH._activeDPF !== undefined){
					thisDPFH._activeDPF.toggleQuadraticDepth();
					}
	    		}
	    	if (e.keyCode == 80){ // p
				if (thisDPFH._activeDPF !== undefined){
					thisDPFH._activeDPF.playOrPauseVideoStreams();
					}
	    		}
	    	if (e.keyCode == 88){ // x
				thisDPFH.toggleDebugCam();
	    		}
	    	if (e.keyCode == 102){ // numpad right
				thisDPFH.goNextDPFinView(1.0);
	    		}
				
	  		});
		});

	// Updates 2D query
	var sync2Dq = function(evt){
		if (thisDPFH._useDeviceOrientation || thisDPFH._vrState) return; // skip

		//console.log(window.devicePixelRatio);

		var mx = evt.clientX * ( thisDPFH._canvas.width / thisDPFH._canvas.clientWidth );
		var my = ( thisDPFH._canvas.clientHeight - evt.clientY ) * ( thisDPFH._canvas.height / thisDPFH._canvas.clientHeight );

		mx = (mx / thisDPFH._canvas.width); //.toFixed( 3 );
		my = (my / thisDPFH._canvas.height); //.toFixed( 3 );

		//console.log(mx +" "+ my);

		thisDPFH._annXYquery[0] = mx;
		thisDPFH._annXYquery[1] = my;

		thisDPFH._ssGlobal.getUniform('uFocusPos').setFloat3([
			evt.clientX * window.devicePixelRatio, 
			thisDPFH._canvas.height - (evt.clientY*window.devicePixelRatio), 
			0.0
			]);
		//console.log(evt.clientX,evt.clientX);
		};


	// (Multi)-Touch
	Hammer(thisDPFH._canvas).on("tap", function(e){
		//console.log("tap");
		if (thisDPFH._useMobile) return;

		/*if (thisDPFH._hoverAnn > 0)*/ thisDPFH._triggerAnnSelect();
		});	  

	Hammer(thisDPFH._canvas).on("doubletap", function(e){
		thisDPFH.goNextDPFinView(1.0);

		if (thisDPFH._useMobile) thisDPFH._triggerAnnSelect();
		});


	// Pointer (CHECK on all MOBILE BROWSERS)
	thisDPFH._bDragging    = false;
    thisDPFH._bPointerDown = false;

	var pointerDown = function(evt){
        thisDPFH._bDragging    = false;
        thisDPFH._bPointerDown = true;

		sync2Dq(evt);
		};
	
	var pointerMove = function(evt){
        if (thisDPFH._bPointerDown){
            thisDPFH._bDragging = true;
            //if (!bNoteInsertMode) canvas.className = 'canvas grabHandCursor';
			}

		if (thisDPFH._useMobile) return;
		//console.log(thisDPFH._bDragging);

		if (thisDPFH._vrState) return;
		if (thisDPFH._useDeviceOrientation) return;

		sync2Dq(evt);	
		};
	
	var pointerUp = function(evt){
        thisDPFH._bDragging    = false;
        thisDPFH._bPointerDown = false;
		};
	
	var pointerOut = function(evt){
		thisDPFH._bDragging    = false;
        thisDPFH._bPointerDown = false;
		};

	thisDPFH._canvas.addEventListener("pointerdown", pointerDown);
	thisDPFH._canvas.addEventListener("pointermove", pointerMove);
	thisDPFH._canvas.addEventListener("pointerup",   pointerUp);
	thisDPFH._canvas.addEventListener("pointerout",  pointerOut);

	// FF
	thisDPFH._canvas.addEventListener("mousedown", pointerDown);
	thisDPFH._canvas.addEventListener("mousemove", pointerMove);
	thisDPFH._canvas.addEventListener("mouseup",   pointerUp);
	thisDPFH._canvas.addEventListener("mouseout",  pointerOut);

/*
	thisDPFH._bDragging  = false;
    thisDPFH._bMouseDown = false;

    // Determine mouse drag status (used for notes pass-through, env rotate, etc..)
    $("#View").mousedown( function(evt){
        thisDPFH._bDragging  = false;
        thisDPFH._bMouseDown = true;

		sync2Dq(evt);
    })
    .mousemove( function( evt ) {
        if (thisDPFH._bMouseDown){
            thisDPFH._bDragging = true;
            //if (!bNoteInsertMode) canvas.className = 'canvas grabHandCursor';
			}

		if (thisDPFH._useMobile) return;
		//console.log(thisDPFH._bDragging);

		if (thisDPFH._vrState) return;
		if (thisDPFH._useDeviceOrientation) return;

		sync2Dq(evt);
	})
    .mouseup( function(){
        thisDPFH._bDragging  = false;
        thisDPFH._bMouseDown = false;
        //if (!bNoteInsertMode) canvas.className = 'canvas openHandCursor';
    })
    .mouseout( function(){
        thisDPFH._bDragging  = false;
        thisDPFH._bMouseDown = false;
        //if (!bNoteInsertMode) canvas.className = 'canvas openHandCursor';
    });
*/

/*
	thisDPFH._canvas.addEventListener('click', function(evt) {
		//console.log("tap");

		thisDPFH._triggerAnnSelect();

	  	}, false);
*/


	// Register update
	//window.setInterval(function(){ return thisDPFH.update(); }, thisDPFH._updateDTmsec);
	var updCB = new DPFupdateCallback( thisDPFH );
	//thisDPFH._dpfNetworkT.addUpdateCallback( updCB );
	thisDPFH._root.addUpdateCallback( updCB );
},


/**
 * Preloads image-data for all DPFs
 */
preloadAll: function(){
	for (var d = 0; d < this._dpfList.length; d++) this._preloadDPF(this._dpfList[d]);
},

_create3Dpointer: function(){
	var thisDPFH = this;
	thisDPFH._hoverAnnDepth = 1.0;

	this._pointerModel = osg.createTexturedSphere(0.03, 20,20);

	var material = new osg.Material();
	material.setTransparency( 1.0 );
	material.setDiffuse( [1,1,1, 1.0] );
	this._pointerModel.getOrCreateStateSet().setAttributeAndModes( material );
	this._pointerModel.getOrCreateStateSet().setTextureAttributeAndModes( 0, DPFutils.fallbackWhiteTex);
	this._pointerModel.getOrCreateStateSet().setRenderingHint('TRANSPARENT_BIN');
	this._pointerModel.getOrCreateStateSet().setBinNumber(12);
	this._pointerModel.getOrCreateStateSet().setAttributeAndModes( new osg.BlendFunc(), osg.StateAttribute.ON );

/*
	thisDPFH._pointerModel = osg.createTexturedQuadGeometry( -0.5, -0.5, 0,
            1.0, 0, 0,
            0, 1.0, 0 );

	osgDB.readImageURL( 'res/pointer.png' ).then(
        function ( data ){
            var pointerTex = new osg.Texture();
			pointerTex.setImage( data );

            pointerTex.setMinFilter( osg.Texture.LINEAR_MIPMAP_LINEAR ); // osg.Texture.LINEAR
            pointerTex.setMagFilter( osg.Texture.LINEAR );

			thisDPFH._pointerModel.getOrCreateStateSet().setTextureAttributeAndModes( 0, pointerTex);
			});

	thisDPFH._pointerModel.getOrCreateStateSet().setRenderingHint('TRANSPARENT_BIN');
	thisDPFH._pointerModel.getOrCreateStateSet().setBinNumber(11);
	thisDPFH._pointerModel.getOrCreateStateSet().setAttributeAndModes( new osg.BlendFunc(), osg.StateAttribute.ON );
	thisDPFH._pointerModel.getOrCreateStateSet().setAttributeAndModes( new osg.Depth( osg.Depth.ALWAYS ), osg.StateAttribute.ON );
*/

	thisDPFH._pointerTrans = new osg.AutoTransform();
	thisDPFH._pointerTrans.setPosition([0,0,0]);
	thisDPFH._pointerTrans.setAutoRotateToScreen(true);
	thisDPFH._pointerTrans.addChild(thisDPFH._pointerModel);

	thisDPFH._pointerPos = osg.vec3.create();

	thisDPFH._dpfNetworkT.addChild(thisDPFH._pointerTrans);
	
	thisDPFH._pointerTrans.setNodeMask(0x0);
},

// [INTERNAL] Updates 3D pointer
// TODO: remove since not needed?
_update3Dpointer: function(){

	this._pointerPos[0] = this._hoverAnnDepth * this._direction[0];// * 0.9;
	this._pointerPos[1] = this._hoverAnnDepth * this._direction[1];// * 0.9;
	this._pointerPos[2] = this._hoverAnnDepth * this._direction[2];// * 0.9;

	this._pointerPos[0] += this._eyePos[0];
	this._pointerPos[1] += this._eyePos[1];
	this._pointerPos[2] += this._eyePos[2];

	this._pointerTrans.setPosition( this._pointerPos );
},

// Insight Pointer. TODO: move to each DPF?
createInsightPointer: function(radius, color){
	this._insightModel = osg.createTexturedSphere(radius, 15,15); // 0.2

	var material = new osg.Material();
	//material.setTransparency( 0.5 );
	//material.setDiffuse( [0,1,0, 1.0] );
	material.setDiffuse( color ); // this is multiplied w/ texture

	this._insightModel.getOrCreateStateSet().setAttributeAndModes( material );
	this._insightModel.getOrCreateStateSet().setTextureAttributeAndModes( 0, DPFutils.fallbackWhiteTex);
	this._insightModel.getOrCreateStateSet().setRenderingHint('TRANSPARENT_BIN');
	//this._insightModel.getOrCreateStateSet().setBinNumber(12);
	this._insightModel.getOrCreateStateSet().setAttributeAndModes( new osg.BlendFunc(), osg.StateAttribute.ON );

	this._insightModel.getOrCreateStateSet().setAttributeAndModes( new osg.Depth( osg.Depth.ALWAYS ), osg.StateAttribute.OVERRIDE | osg.StateAttribute.ON );

	this._insightTrans = new osg.AutoTransform();
	this._insightTrans.setPosition([0,0,0]);

	this._insightTrans.setAutoRotateToScreen(true);
	//this._insightTrans.setAutoScaleToScreen(true);

	this._insightTrans.addChild(this._insightModel);
	this._dpfNetworkT.addChild(this._insightTrans);

	this._insightTrans.setNodeMask(0x0);
},

_updateInsightDPF: function(){
	var dpf = this._dpfList[this._inviewDPFid];
	if (dpf === undefined) return;

	//dpf.setVisibility(1.0);

	// Preload
	this._preloadDPF(dpf);

	//dpf.setVisibility(0.9);
	this._insightTrans.setPosition(dpf._position);
	this._insightTrans.setNodeMask(0xf);
	
	this._insightModel.getOrCreateStateSet().setTextureAttributeAndModes( DPF_BASE_UNIT, dpf._colorTex );
},



initRTT: function(){
	if (this._viewer.getCamera() === undefined) return;

	// RTT Camera
	this._aRTT = new osg.Camera();
	this._aRTT.addChild(this._annVisionGroup);

	this._aRTT.setName( 'rttCamera' );
	this._aRTT.setClearColor( osg.vec4.create( [ 0.0, 0.0, 0.0, 1.0 ] ) );
	this._aRTT.setViewMatrix(this._viewer.getCamera().getViewMatrix());
	this._aRTT.setProjectionMatrix(this._viewer.getCamera().getProjectionMatrix());

    this._aRTT.setRenderOrder( osg.Camera.PRE_RENDER, 0 ); // osg.Camera.PRE_RENDER
    this._aRTT.setReferenceFrame( osg.Transform.ABSOLUTE_RF );
    this._aRTT.setViewport( new osg.Viewport( 0, 0, this._aRTTsize[0], this._aRTTsize[1] ) );

	// Attach the target texture to RTT camera
    this._aRTTttex = new osg.Texture();
    this._aRTTttex.setTextureSize( this._aRTTsize[0], this._aRTTsize[1] );
	this._aRTTttex.setInternalFormat( osg.Texture.RGB ); // osg.Texture.RGB
    this._aRTTttex.setMinFilter( 'NEAREST' ); // NEAREST_MIPMAP_NEAREST
    this._aRTTttex.setMagFilter( 'NEAREST' );

    this._aRTT.attachTexture( osg.FrameBufferObject.COLOR_ATTACHMENT0, this._aRTTttex );
	this._aRTT.attachRenderBuffer( osg.FrameBufferObject.DEPTH_ATTACHMENT, osg.FrameBufferObject.DEPTH_COMPONENT16 );

    this._aRTTquad = osg.createTexturedQuadGeometry( 5, 50, 0,
            this._aRTTsize[0], 0, 0,
            0, this._aRTTsize[1], 0 );
    this._aRTTquad.getOrCreateStateSet().setTextureAttributeAndModes( 0, this._aRTTttex );

	this._root.addChild(this._aRTT); // so we traverse RTT cam

	// canvas 2D
	var thisDPFH = this;
	thisDPFH._aRTTcanvasElem = document.createElement('canvas');
	thisDPFH._aRTTctx = thisDPFH._aRTTcanvasElem.getContext( '2d' );
    thisDPFH._aRTTcanvasElem.width  = thisDPFH._aRTTsize[0];
    thisDPFH._aRTTcanvasElem.height = thisDPFH._aRTTsize[1];

	var rowSize  = thisDPFH._aRTTcanvasElem.width  * 4; // 4
	var colSize  = thisDPFH._aRTTcanvasElem.height * 4;
	var buffSize = rowSize * thisDPFH._aRTTcanvasElem.height;

	thisDPFH._aRTTpixels = new Uint8Array( buffSize );


	var freqPoll = (thisDPFH._useMobile)? 0.5 : 0.1;
	var gl = undefined;
	thisDPFH._tLastRTT = 0.0;

	// on RTT cam frame completed
	var aRTTendFrame = function( state ){
		if (!thisDPFH._aEnabled) return;
		if (thisDPFH._bDepthVision) return;
		//if (thisDPFH._aRTTcanvasElem === undefined) return;
		if (!thisDPFH._bRTTcanRead) return;

		if ((thisDPFH._time - thisDPFH._tLastRTT) < freqPoll) return;

		if (thisDPFH._bDragging) return; // while dragging, skip

		// FB sync
		gl = state.getGraphicContext();
        if (gl.checkFramebufferStatus( gl.FRAMEBUFFER ) !== gl.FRAMEBUFFER_COMPLETE) return;

		gl.readPixels( 0, 0, thisDPFH._aRTTcanvasElem.width, thisDPFH._aRTTcanvasElem.height, gl.RGBA, gl.UNSIGNED_BYTE, thisDPFH._aRTTpixels );
		thisDPFH._tLastRTT = thisDPFH._time;



		var qX = Math.floor( thisDPFH._aRTTcanvasElem.width  * thisDPFH._annXYquery[0] );
		var qY = Math.floor( thisDPFH._aRTTcanvasElem.height * thisDPFH._annXYquery[1] );

		var base = (qY * rowSize) + (qX*4);

		var av = thisDPFH._aRTTpixels[ base ]; 		// OK
		var d  = thisDPFH._aRTTpixels[ base + 1 ]; 	// OK

		// Depth
		if (thisDPFH._activeDPF){
			thisDPFH._dNorm = d / 255.0; // [0,1]
			//thisDPFH._dNorm = Math.sqrt(thisDPFH._dNorm);

			var dr = thisDPFH._activeDPF.getDepthRange();

			thisDPFH._hoverAnnDepth = DPFutils.lerp(dr[1],dr[0], thisDPFH._dNorm);
			thisDPFH._hoverAnnDepth -= dr[0];

			//thisDPFH._hoverAnnDepth = (dr[1] + thisDPFH._dNorm*(dr[0] - dr[1])) - dr[0];
			//thisDPFH._hoverAnnDepth = ((thisDPFH._dNorm)*(dr[1] - dr[0])) + dr[0];
			}

		// Semantic layer
		var hash = Math.floor(av * DPF_ANN_HASH);

		// On change hover
		if (hash !== thisDPFH._hoverAnn){
			thisDPFH._hoverAnn = hash;
			thisDPFH._onChangeAnnotation();
			}
		//console.log("Read aRTT pixels"+ av);
		};

	thisDPFH._aRTT.setFinalDrawCallback( aRTTendFrame );
},

/**
 * Get hash-ID of hovered annotation (0 = none)
 * @returns {integer}
 */
getHoveredAnnotationID: function(){
	return this._hoverAnn;
},

_onChangeAnnotation: function(){
	this._ssGlobal.getUniform('annotationHash').setInt( this._hoverAnn );

	// Some annotation is hovered/pointed
	if (this._hoverAnn > 0){
		if (this.onHoverAnnotation !== undefined) this.onHoverAnnotation();
		//console.log("Hovering Annotation HASH: " + this._hoverAnn);

		//this.requestDIManimation();

		// Annotations events
		var A = this._activeDPF._annotationList[this._hoverAnn];
		if (A !== undefined){
			if (A.onHover !== undefined) A.onHover();
			}

/*
		for (var a = 0; a < this._activeDPF._annotationList.length; a++){
			var A = this._activeDPF._annotationList[a];
			if (A.hashID === this._hoverAnn && A.onHover !== undefined){
				A.onHover();
				}
			}
*/		
		if (!this._vrState) this._canvas.style.cursor = "pointer";
		}

	// No annotation hovered
	else {
		//this.resetDIM();
		if (!this._vrState) this._canvas.style.cursor = "auto";

		if (this.onLeaveAnnotation !== undefined) this.onLeaveAnnotation();
		}
},

initHUD: function(){
	if (this._canvas === undefined) return;

	// HUD Camera
	this._HUD = new osg.Camera();
	//this._HUD.setClearColor( osg.Vec4.create( [ 0.0, 0.0, 0.0, 1.0 ] ) );

    //osg.Matrix.makeOrtho( 0, this._canvas.width, 0, this._canvas.height, -5, 5, this._HUD.getProjectionMatrix() );
	osg.mat4.ortho(this._HUD.getProjectionMatrix(), 0, this._canvas.width, 0, this._canvas.height, -5, 5);

    //$osg.Matrix.makeTranslate( 25, 25, 0, this._HUD.getViewMatrix() );
	osg.mat4.translate(this._HUD.getViewMatrix(), this._HUD.getViewMatrix(), [25.0, 25.0, 0.0]);
    
	this._HUD.setRenderOrder( osg.Camera.NESTED_RENDER, 0 );
    this._HUD.setReferenceFrame( osg.Transform.ABSOLUTE_RF );

	// TODO: disable BLEND
	//this._HUD.getOrCreateStateSet().

	// add rendered RTT quad to HUD
	if (this._aRTTquad !== undefined) this._HUD.addChild( this._aRTTquad ); // add rendered RTT quad

	this._root.addChild(this._HUD);

	this.toggleDebugCam(false);
},

toggleDebugCam: function(b){
	if (b === undefined){
		if (this._aRTTquad.getNodeMask() === 0xf) 
			this._aRTTquad.setNodeMask(0x0);
		else 
			this._aRTTquad.setNodeMask(0xf);

		//console.log(this._aRTTquad.getNodeMask());
		return;
		}

	if (b) this._aRTTquad.setNodeMask(0xf);
	else this._aRTTquad.setNodeMask(0x0);
},


// Internal use
setupShaders: function(glsldata){
	if (glsldata === undefined) glsldata = DPF_SHADER;

	//console.log(glsldata);

	if (this._useUnifiedLayout) glsldata = "#define DPF_USE_UNIFIED 1\n" + glsldata;
	if (this._useMobile)        glsldata = "#define DPF_MOBILE_DEVICE 1\n" + glsldata;

	glsldata += '\n';

	var program = new osg.Program(
		new osg.Shader( 'VERTEX_SHADER', "#define VERTEX_SH 1\n" + glsldata ),
		new osg.Shader( 'FRAGMENT_SHADER', "#define FRAGMENT_SH 1\n" + glsldata )
		);

	this._glslProgram = program;
	this.onGLSLprogramLoaded();
},


/**
 * Load GLSL main shader (./main.glsl) from input path.
 * @param {string} path - Input path of shaders folder
 * @param {object} options - (optional). E.g: '{ useUnifiedLayout: true, useMobile: false }'
 * @param {function} onSuccess - Execute this function on successful load
 */
loadShadersFromPath: function(path, options, onSuccess){
	var thisDPFH = this;

	thisDPFH._shadersPath = path;

	// Defaults
	thisDPFH._useUnifiedLayout = false;

	// Read options
	if (options !== undefined && options.useUnifiedLayout !== undefined) thisDPFH._useUnifiedLayout = options.useUnifiedLayout;
	//if (options !== undefined && options.useMobile !== undefined) thisDPFH._useMobile = options.useMobile;

	$.get( path + "/main.glsl", function(glsldata){
/*
		if (thisDPFH._useUnifiedLayout) glsldata = "#define DPF_USE_UNIFIED 1\n" + glsldata;
		if (thisDPFH._useMobile)        glsldata = "#define DPF_MOBILE_DEVICE 1\n" + glsldata;

		glsldata += '\n';

		var program = new osg.Program(
			new osg.Shader( 'VERTEX_SHADER', "#define VERTEX_SH 1\n" + glsldata ),
			new osg.Shader( 'FRAGMENT_SHADER', "#define FRAGMENT_SH 1\n" + glsldata )
			);

		thisDPFH._glslProgram = program;
		thisDPFH.onGLSLprogramLoaded();
*/
		thisDPFH.setupShaders(glsldata);

		if (onSuccess !== undefined) onSuccess(); 
		}, "text");
},

onGLSLprogramLoaded: function(){
	if (this._glslProgram === undefined) return;

	for (var i = 0; i < this._dpfList.length; i++){
		this._dpfList[i].setGLSLprogram(this._glslProgram);
		if (this._useUnifiedLayout) this._dpfList[i]._useUnifiedLayout = true;
		}

	console.log('GLSL Program Loaded');
},

setupFallbacks: function(){
	// Visible Group
	this._stdVisionGroup.getOrCreateStateSet().setTextureAttributeAndModes( DPF_BASE_UNIT, DPFutils.fallbackWhiteTex);
	this._stdVisionGroup.getOrCreateStateSet().setTextureAttributeAndModes( DPF_DEPTH_UNIT, DPFutils.fallbackBlackTex );
	this._stdVisionGroup.getOrCreateStateSet().setTextureAttributeAndModes( DPF_SEM_UNIT, DPFutils.fallbackBlackTex );

	// Annotation vision fallbacks
	this._annVisionGroup.getOrCreateStateSet().setTextureAttributeAndModes( DPF_BASE_UNIT, DPFutils.fallbackBlackTex );
	this._annVisionGroup.getOrCreateStateSet().setTextureAttributeAndModes( DPF_DEPTH_UNIT, DPFutils.fallbackBlackTex );
	this._annVisionGroup.getOrCreateStateSet().setTextureAttributeAndModes( DPF_SEM_UNIT, DPFutils.fallbackBlackTex );

	console.log("Fallbacks set");
},

// Not really "home", but snaps to closest DPF
/**
 * Go to local probe home position
 */
home: function(){
	if (this._dpfList.length == 0 || this._dpfList[0] === undefined){
		this._manip.setEyePosition( [0,0,0] );
		this._manip.setTarget( [0,10,0] );
		this._manip.setNode( this._dpfNetworkT );
		return;
		}

	// Set home to first DPF position
	var p;
	if (this._activeDPF === undefined) p = this._dpfList[0].getPosition();
	else p = this._activeDPF.getPosition();

	var pos = [0,0,0];
	osg.vec3.transformMat4(pos, p, this._dpfNetworkM);

	//var t = osg.Vec3.create();
	//osg.Vec3.add(p, [1,0,0], t);

	this._manip.setEyePosition( pos );
	//this._manip.setTarget( t );
	this._manip.setNode( this._dpfNetworkT );
},

goExternalView: function(){
	if (this._activeDPF === undefined) return;

	var p  = this._activeDPF.getPosition();
	var md = this._activeDPF.getDepthRange()[1]; // max

	var E = osg.vec3.create();
	E[0] = p[0] + (md * 1.0);
	E[1] = p[1] + (md * 1.0);
	E[2] = p[2] + (md * 0.5);

	this._manip.setEyePosition( E );
	this._manip.setTarget( p );
},

/**
 * Set camera field-of-view for standard viewer
 * @param {float} f - Field-of-View in degrees (e.g.: 70)
 */
setFOV: function(f){
	this._fov = f;

	if (this._viewer === undefined) return;

	var cam = this._viewer.getCamera();
	if (cam === undefined) return;

	var info = {};
	osg.mat4.getPerspective( info, cam.getProjectionMatrix() );
	//console.log(info);

    //$osg.mat4.makePerspective( f, maincam.aspectRatio, maincam.zNear, maincam.zFar, cam.getProjectionMatrix() );
	osg.mat4.perspective(cam.getProjectionMatrix(), DPF_DEG2RAD * f, info.aspectRatio, info.zNear, info.zFar);
},

/**
 * Get camera field-of-view for standard viewer
 * @returns {float}
 */
getFOV: function(){ return this._fov; },

/**
 * Set DOF weight
 * @param {float} d - E.g.: 0.5
 */
setDOF: function(d){
	this._DOFweight = d;
},

/**
 * Get DOF weight
 * @returns {float}
 */
getDOF: function(){ return this._DOFweight; },

/**
 * Add a DPF to the 3D network
 * @param {object} dpf - see {@link DPF}
 */
addDPF: function( dpf ){
	this._dpfList.push( dpf );

	//this._dpfNetworkT.addChild( dpf.getTransNode() );
	this._stdVisionGroup.addChild( dpf.getTransNode() );
	this._annVisionGroup.addChild( dpf.getTransNode() );

	//if (dpf._maxBoundSphere !== undefined) this._dpfNetworkT.addChild( dpf._maxBoundSphere );

	if (this._glslProgram !== undefined) dpf.setGLSLprogram(this._glslProgram);

	console.log("Added new DPF");
},

/**
 * Get DPF by index
 * @param {integer} i - DPF index
 * @returns {object} - {@link DPF}
 */
getDPF: function(i){
	return this._dpfList[i];
},

/**
 * Get DPF by unique ID string (e.g.: "spot1"). If not found returns undefined
 * @param {string} uname - DPF unique ID string
 * @returns {object} - {@link DPF}
 */
getDPFbyName: function(uname){
	for (var i = 0; i < this._dpfList.length; i++){
		if( this._dpfList[i]._uniqueName === uname) return this._dpfList[i];
		}
	return undefined;
},

/**
 * Get number of current DPFs in this handler
 * @returns {integer}
 */
getNumDPFs: function(){
	return this._dpfList.length;
},

// Internal use
useUnifiedLayout: function(b){
	this._useUnifiedLayout = b;
},
isUsingUnifiedLayout: function(){
	return this._useUnifiedLayout;
},

/**
 * Request camera transition to absolute location in 3D space
 * @param {vec3} pos - Target position
 * @param {float} duration - Duration in seconds
 */
requestTransitionToLocation: function(pos, duration){
	if (this._tMoveReq >= 0.0) return; // already requested

	this._tMoveReq = this._time;
	this._tMoveDur = duration;
	this._reqTo   = pos;
	this._reqFrom = this._eyePos;
	//console.log(this._tMoveDur);
},

/**
 * Returns TRUE if camera is performing a transition.
 * @returns {bool}
 */
duringTransition: function(){
	return (_tMoveReq>=0.0);
},

/**
 * Request camera transition to specific DPF
 * @param {object} dpf - Target {@link DPF}
 * @param {float} duration - Duration in seconds
 */
requestTransitionToDPF: function(dpf, duration){
	if (this._manip === undefined) return;
	if (dpf === undefined) return;
	
	console.log("Requested transition to "+dpf._uniqueName);
	if (this.onTransitionRequest !== undefined) this.onTransitionRequest();

	// Transform wrt network transform
	var pos = [0,0,0];
	osg.vec3.transformMat4(pos, dpf.getPosition(), this._dpfNetworkM);

	if (duration === undefined) this._manip.setEyePosition( pos );
	else this.requestTransitionToLocation( pos, duration );
},

/**
 * Request camera transition to specific DPF, by index
 * @param {integer} i - Target DPF index
 * @param {float} duration - Duration in seconds
 */
requestTransitionToDPFbyIndex: function(i, duration){
	var dpf = this._dpfList[i];
	if (dpf === undefined) return;

	this.requestTransitionToDPF(dpf, duration);
},

/**
 * Request camera transition to specific DPF, by unique ID name
 * @param {string} uname - Target DPF unique ID name
 * @param {float} duration - Duration in seconds
 */
requestTransitionToDPFbyName: function(uname, duration){
	var dpf = this.getDPFbyName(uname);
	if (dpf === undefined) return;

	this.requestTransitionToDPF(dpf, duration);
},

/**
 * Request camera orientation by target x,y,z
 * @param {float} x
 * @param {float} y
 * @param {float} z
 */
requestOrientationByDirection: function(x,y,z){
	if (this._vrState) return; // skip in VR

	this._manip.setTarget( osg.vec3.fromValues(x,y,z) );
	console.log(">>> Requested orientation by direction: "+x+", "+y+", "+z);
},

/**
 * Request camera orientation towards specific DPF - see {@link DPF}
 * @param {object} dpf - Target {@link DPF}
 */
requestOrientationToDPF: function(dpf){
	if (dpf === undefined) return;

	var x = dpf._position[0];
	var y = dpf._position[1];
	var z = dpf._position[2];

	//console.log(">>> Req orientation to DPF: "+dpf._position);

	this.requestOrientationByDirection(x,y,z);
},

/**
 * Request camera orientation towards specific DPF, by unique ID name
 * @param {string} uname - Target DPF unique ID name
 */
requestOrientationToDPFbyName: function(uname){
	//console.log(">>> "+uname);
	var dpf = this.getDPFbyName(uname);

	this.requestOrientationToDPF(dpf);
},


/**
 * Parse XML file to generate a {@link DPF} 3D network. This file is produced by the *"dpfEncoder"* tool. On parsing completion, user can attach a custom function in order to perform several tasks (for instance, to register annotations). 
 * @param {string} xmlurl - URL of XML file
 * @param {function} onParsingCompleted - Execute this function When parsing is completed
 */
parseXML: function( xmlurl, onParsingCompleted){
	var basepath     = xmlurl.substring(0,xmlurl.lastIndexOf("/")+1);
	
	var colorpostfix = undefined; //".jpg";
	var depthpostfix = undefined; //"-d.png";
	var annpostfix   = undefined; //"-a.png";

	var thisDPFH = this;

	console.log("Loading XML: " + xmlurl + "...");

	$.get( xmlurl, function(xml){
		//console.log("--- XML loaded");

		basepath = basepath + $(xml).find("basepath").text();

		var pfixnode = $(xml).find("postfix");
		if (pfixnode !== undefined){
			if (pfixnode.attr('color')!==undefined)      colorpostfix = pfixnode.attr('color');
			if (pfixnode.attr('depth')!==undefined)      depthpostfix = pfixnode.attr('depth');
			if (pfixnode.attr('annotation')!==undefined) annpostfix   = pfixnode.attr('annotation');

			//console.log("C Postfix: "+panopostfix);
			//console.log("D Postfix: "+depthpostfix);
			//console.log("A Postfix: "+annpostfix);
			}

		// For each DPF node
		$(xml).find("DPF").each( function (i) {
			var dpf = new DPF();
			thisDPFH.addDPF( dpf );

			console.log("Parsing DPF...");

			// position
			var posNode = $(this).find("position");
			if (posNode.attr("x")!==undefined && posNode.attr("y")!==undefined && posNode.attr("z")!==undefined)
				dpf.setPosition([
					parseFloat(posNode.attr("x")),
					parseFloat(posNode.attr("y")),
					parseFloat(posNode.attr("z"))
					]);

			// orientation
			var oriNode = $(this).find("orientation");
			if (oriNode.attr("x")!==undefined && oriNode.attr("y")!==undefined && oriNode.attr("z")!==undefined)
				dpf.setOrientationFromEulerVector([
					parseFloat(oriNode.attr("x")),
					parseFloat(oriNode.attr("y")),
					parseFloat(oriNode.attr("z"))
					]);

			// Unique Name
			var nameNode = $(this).find("name");
			if (nameNode !== undefined){
				var name = nameNode.text();
				dpf.setUniqueName(name);

				if (colorpostfix) dpf.setPanoPath( basepath + name + colorpostfix, basepath + "lo_" + name + colorpostfix); // "lo_" not used for now
				if (depthpostfix) dpf.setDepthPath( basepath + name + depthpostfix);
				if (annpostfix)   dpf.setSemanticPath( basepath + name + annpostfix);
				//dpf.setMetadataFolderPath( basepath + "metadata/" + name + "/");

				//console.log("-- PanoPath: "+ dpf.getPanoPath());
				//console.log("-- DepthPath: "+ dpf.getDepthPath());
				//console.log("-- Metadata folder: "+ dpf.getMetadataFolderPath());
				}

			// depth range
			var drNode = $(this).find("depthrange");
			if (drNode !== undefined){
				if (drNode.attr("min")!==undefined && drNode.attr("max")!==undefined)
					dpf.setDepthRange(
						parseFloat(drNode.attr("min")),
						parseFloat(drNode.attr("max"))
						);

				//console.log(dpf.getDepthRange());
				}
			});


		// On XML parsing completed - PRELOAD
/*
		for (var d = 0; d < thisDPFH._dpfList.length; d++){
			thisDPFH.getDPF(d).requestPano();

			if (!thisDPFH._useUnifiedLayout){
				if (depthpostfix) thisDPFH.getDPF(d).requestDepth();
				if (annpostfix)   thisDPFH.getDPF(d).requestSemantic();
				}
			//console.log("Requesting p+d for DPF: "+d);
			}
*/
		thisDPFH.home();

		if (onParsingCompleted !== undefined) onParsingCompleted();

		})
		.fail(	// XML failed to load
			function(){
			console.log("ERROR Loading XML");
		});
},

// Preloads a DPF
_preloadDPF: function(dpf){
	if (dpf === undefined) return;

	if (!dpf._bLoaded[0] && !dpf._bLoading[0]) dpf.requestPano();

	if (!this._useUnifiedLayout){
		if (!dpf._bLoaded[1] && !dpf._bLoading[1]) dpf.requestDepth();
		if (!dpf._bLoaded[2] && !dpf._bLoading[2]) dpf.requestSemantic();
		}
},

/**
 * Returns TRUE if VR mode is enabled
 * @returns {bool}
 */
inVRmode: function(){
	return this._vrState;
},

/**
 * Toggle VR mode (WebVR)
 */
toggleVR: function(){
    var viewer = this._viewer;
    if ( viewer.getVRDisplay() ) viewer.setPresentVR( !this._vrState ).then( this._switchVR.bind(this) );
    else this._switchVR();
},


//toggleVR: function (){
_switchVR: function(){
    var viewer = this._viewer;

    //viewer.setPresentVR( !this._vrState );

    // Enable VR
    if ( !this._vrState ){

        // Detach the model from scene and cache it
        this._root.removeChild( this._dpfNetworkT );

        // If no vrNode (first time vr is toggled), create one
        // The _dpfNetworkT will be attached to it
        if ( !this._vrNode ) {
            if ( navigator.getVRDisplays ) {

				viewer.getInputManager().setEnable(InputGroups.FPS_MANIPULATOR_WEBVR, true);
                //viewer.getEventProxy().WebVR.setEnable( true );
                ////var HMD = viewer._eventProxy.WebVR.getHmd();

				this._vrNode = osgUtil.WebVR.createScene( viewer, this._dpfNetworkT, viewer.getVRDisplay() );
                //this._vrNode = osgUtil.WebVR.createScene( viewer, this._dpfNetworkT, viewer._eventProxy.WebVR.getHmd() );
            	}

            else {
				viewer.getInputManager().setEnable(InputGroups.FPS_MANIPULATOR_DEVICEORIENTATION, true);
                //viewer.getEventProxy().DeviceOrientation.setEnable( true );

                this._vrNode = osgUtil.WebVRCustom.createScene( viewer, this._dpfNetworkT, {
                    isCardboard: true,
                    vResolution: this._canvas.height,
                    hResolution: this._canvas.width
                	});

            }
        }

        // Attach the vrNode to scene instead of the model
        this._root.addChild( this._vrNode );

		// Query center
		this._annXYquery = [0.5,0.5];
		this._ssGlobal.getUniform('uFocusPos').setFloat3( [0.0,0.0, 1.0] ); // z = 1.0 enables 3D query (center)

		//this._pointerTrans.setNodeMask(0xf);
		this.home();

        // Correct way to fix NearFar, we operate on RTT-cameras
        for (var c = 0; c < this._vrNode.children.length; c++) this._vrNode.children[c]._nearFarRatio = this._NFR;
    	}

    // Disable VR
    else {
        //viewer._eventProxy.WebVR.setEnable( false );
        //viewer._eventProxy.DeviceOrientation.setEnable( false );
        viewer.getInputManager().setEnable(InputGroups.FPS_MANIPULATOR_WEBVR, false);
        viewer.getInputManager().setEnable(InputGroups.FPS_MANIPULATOR_DEVICEORIENTATION, false);

        // Detach the vrNode and reattach the modelNode
        this._root.removeChild( this._vrNode );
        this._root.addChild( this._dpfNetworkT );

		//this._pointerTrans.setNodeMask(0x0);
    	}

    this._vrState = !this._vrState;
},

};
