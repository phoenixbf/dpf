
#define DPF_ANN_HASH	0.3 //0.3

#define DPF_RAD_SCALE	100.0

#define DPF_ANN_H		128.0

#ifndef __DESKTOP_GLSL__
precision mediump float;precision mediump int;varying vec2 osg_TexCoord0;varying vec2 osg_TexCoord1;varying vec2 osg_TexCoord2;varying vec3 osg_FragVertex;
#endif
uniform sampler2D panoTex;uniform sampler2D depthTex;uniform sampler2D annTex;uniform float slopeDiscard;uniform float time;uniform vec3 camPos;uniform vec3 panoPos;uniform float minRad;uniform float maxRad;uniform float visibility;uniform int annotationHash;uniform int numAnnotations;uniform float annotationWidth;uniform int bActive;uniform int bAnnotationVision;uniform int bDepthVision;
#ifdef DPF_USE_COMBO

#define DPF_H_COLOR		0.5

#define DPF_H_DEPTH		0.125

#define DPF_H_ANN		0.375

#define DPF_OFFS_COLOR	0.0 // 0.5

#define DPF_OFFS_ANN	0.5 // 0.125

#define DPF_OFFS_DEPTH	0.875 // 0.0
vec2 a(vec2 b){vec2 c;c.x=b.x;c.y=(b.y*DPF_H_COLOR)+DPF_OFFS_COLOR;return c;}vec2 d(vec2 b){vec2 c;c.x=b.x;c.y=(b.y*DPF_H_DEPTH)+DPF_OFFS_DEPTH;return c;}vec2 e(vec2 b){vec2 c;c.x=b.x;c.y=(b.y*DPF_H_ANN)+DPF_OFFS_ANN;return c;}
#endif
float f(){
#ifdef __DESKTOP_GLSL__
#ifdef DPF_USE_COMBO
return texture2D(panoTex,e(gl_TexCoord[0].xy)).g;
#else
return texture2D(annTex,gl_TexCoord[2].xy).g;
#endif
#else
#ifdef DPF_USE_COMBO
return texture2D(panoTex,e(osg_TexCoord0)).g;
#else
return texture2D(annTex,osg_TexCoord2).g;
#endif
#endif
}float f(vec2 g){
#ifdef DPF_USE_COMBO
return texture2D(panoTex,g).g;
#else
return texture2D(annTex,g).g;
#endif
}int h(float i,vec2 g){if(i<=DPF_ANN_HASH) return 0;float j=f(g);if(j==0.0) return 0;float k=(j*255.0)*DPF_ANN_HASH;float l=floor(i);float m=floor(k);if(abs(l-m)>0.0) return 0;return 1;}vec4 n(float o){int p;
#ifdef __DESKTOP_GLSL__
p=h(o,gl_TexCoord[2].xy);
#else
#ifdef DPF_USE_COMBO
p=h(o,e(osg_TexCoord2));
#else
p=h(o,osg_TexCoord2);
#endif
#endif
if(p==0) return vec4(0,0,0,1);vec4 q;float r=(sin(time*2.0)+1.0);r*=0.5;q=mix(vec4(0,1,0,1),vec4(0,0,1,1),r);return q;}void main(void){vec4 s;
#ifdef __DESKTOP_GLSL__ // OpenGL
#ifdef DPF_USE_COMBO
s=texture2D(panoTex,a(gl_TexCoord[0].xy));
#else
s=texture2D(panoTex,gl_TexCoord[0].xy);
#endif
#else	// WebGL
#ifdef DPF_USE_COMBO
s=texture2D(panoTex,a(osg_TexCoord0));
#else
s=texture2D(panoTex,osg_TexCoord0);
#endif
#endif
float t=(maxRad-minRad)*DPF_RAD_SCALE;float u=(gl_FragCoord.z/gl_FragCoord.w);if(bAnnotationVision>0){float v=f();float w=0.0;if(v>0.0) w=0.5;float x=u/t;s=vec4(v,(1.0-x),w,1);}if(bDepthVision>0){
#ifdef __DESKTOP_GLSL__ // OpenGL
s=texture2D(depthTex,gl_TexCoord[1].xy);
#else	// WebGL
s=texture2D(depthTex,osg_TexCoord1.xy);
#endif
float x=(u-minRad)/t;s.g=1.0-x;}float y;
#ifdef __DESKTOP_GLSL__ // OpenGL
y=texture2D(depthTex,gl_TexCoord[1].xy).r;
#else	// WebGL
#ifdef DPF_USE_COMBO
y=texture2D(panoTex,d(osg_TexCoord1)).r;
#else
y=texture2D(depthTex,osg_TexCoord1).r;
#endif
#endif
float z=1.0-y;if(z>=slopeDiscard) z=1.0;else discard;if(visibility<=0.0) discard;if(bAnnotationVision==0){s+=(0.2*n(float(annotationHash)));}s.a=visibility*z;gl_FragColor=s;}