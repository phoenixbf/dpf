
#ifdef __DESKTOP_GLSL__
varying vec2 texCoord0,texCoord1,texCoord2;
#else
precision mediump float;precision mediump int;attribute vec3 Normal;attribute vec3 Vertex;attribute vec2 TexCoord0;attribute vec2 TexCoord1;attribute vec2 TexCoord2;varying vec2 osg_TexCoord0;varying vec2 osg_TexCoord1;varying vec2 osg_TexCoord2;varying vec3 osg_FragVertex;uniform mat4 uModelViewNormalMatrix;uniform mat4 uProjectionMatrix;uniform mat4 uModelViewMatrix;
#endif
uniform sampler2D panoTex;uniform sampler2D depthTex;uniform sampler2D annTex;uniform float minRad;uniform float maxRad;uniform float radMult;uniform float time;uniform int bQuadratic;uniform int bInvertDM;uniform int bActive;uniform int bUseComboUnit;
#ifdef DPF_USE_COMBO

#define DPF_H_COLOR		0.5

#define DPF_H_DEPTH		0.125

#define DPF_H_ANN		0.375

#define DPF_OFFS_COLOR	0.0 // 0.5

#define DPF_OFFS_DEPTH	0.875 // 0.0

#define DPF_OFFS_ANN	0.5 // 0.125
vec2 a(vec2 b){vec2 c;c.x=b.x;c.y=(b.y*DPF_H_COLOR)+DPF_OFFS_COLOR;return c;}vec2 d(vec2 b){vec2 c;c.x=b.x;c.y=(b.y*DPF_H_DEPTH)+DPF_OFFS_DEPTH;return c;}vec2 e(vec2 b){vec2 c;c.x=b.x;c.y=(b.y*DPF_H_ANN)+DPF_OFFS_ANN;return c;}
#endif
float f(){float g;
#ifdef __DESKTOP_GLSL__
#ifdef DPF_USE_COMBO
g=texture2D(panoTex,d(texCoord0)).b;
#else
g=texture2D(depthTex,texCoord1).b;
#endif
#else
#ifdef DPF_USE_COMBO
#ifdef DPF_MOBILE_DEVICE
g=1.0;
#else
g=texture2D(panoTex,d(osg_TexCoord0)).b;
#endif
#else
#ifdef DPF_MOBILE_DEVICE
g=1.0;
#else
g=texture2D(depthTex,osg_TexCoord1).b;
#endif
#endif
#endif
g*=radMult;if(bInvertDM>0) g=1.0-g;if(bQuadratic>0){if(bQuadratic==1) g=sqrt(g);else g*=g;}g=mix(maxRad,minRad,g);return g;}void main(){
#ifdef __DESKTOP_GLSL__
texCoord0=gl_MultiTexCoord0.xy;texCoord1=gl_MultiTexCoord0.xy;texCoord2=gl_MultiTexCoord0.xy;gl_TexCoord[0]=gl_TextureMatrix[0]*gl_MultiTexCoord0;gl_TexCoord[1]=gl_TextureMatrix[0]*gl_MultiTexCoord0;gl_TexCoord[2]=gl_TextureMatrix[0]*gl_MultiTexCoord0;vec3 h=normalize(gl_Normal);vec4 i=gl_Vertex;
#else
osg_FragVertex=Vertex;osg_TexCoord0=TexCoord0;osg_TexCoord1=TexCoord0;osg_TexCoord2=TexCoord0;vec3 h=normalize(Normal);vec4 i=vec4(Vertex,1.0);
#endif
i.xyz=(h*f());
#ifdef __DESKTOP_GLSL__
h=normalize(gl_NormalMatrix*h);i=gl_ModelViewProjectionMatrix*i;
#else
h=vec3(uModelViewNormalMatrix*vec4(Normal,1.0));i=uModelViewMatrix*i;
#endif
#ifdef __DESKTOP_GLSL__
gl_Position=i;
#else
gl_Position=uProjectionMatrix*i;
#endif
}