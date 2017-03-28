
#define DPF_ANN_HASH	0.3 //0.3

#define DPF_RAD_SCALE	100.0

#define DPF_ANN_H		128.0

#ifdef GL_ES
precision mediump float;precision mediump int;
#endif
varying vec2 osg_TexCoord0,osg_TexCoord1,osg_TexCoord2;varying vec3 osg_FragVertex;uniform sampler2D panoTex;uniform sampler2D depthTex;uniform sampler2D annTex;uniform float time;uniform float minRad;uniform float maxRad;uniform int bActive;uniform int bQuadratic;uniform int bInvertDM;uniform int bUseComboUnit;uniform int bAnnotationVision;uniform int bDepthVision;
#ifdef DPF_USE_UNIFIED

#define DPF_H_COLOR		0.5

#define DPF_H_DEPTH		0.125

#define DPF_H_ANN		0.375

#define DPF_OFFS_COLOR	0.0     // 0.5

#define DPF_OFFS_DEPTH	0.875   // 0.0

#define DPF_OFFS_ANN	0.5     // 0.125
vec2 a(vec2 b){vec2 c;c.x=b.x;c.y=(b.y*DPF_H_COLOR)+DPF_OFFS_COLOR;return c;}vec2 d(vec2 b){vec2 c;c.x=b.x;c.y=(b.y*DPF_H_DEPTH)+DPF_OFFS_DEPTH;return c;}vec2 e(vec2 b){vec2 c;c.x=b.x;c.y=(b.y*DPF_H_ANN)+DPF_OFFS_ANN;return c;}
#endif

#ifdef VERTEX_SH
attribute vec3 Normal;attribute vec3 Vertex;attribute vec2 TexCoord0;uniform mat3 uModelViewNormalMatrix;uniform mat4 uProjectionMatrix;uniform mat4 uModelViewMatrix;uniform float radMult;float f(){float g;
#ifdef DPF_MOBILE_DEVICE
g=maxRad;
#else
#ifdef DPF_USE_UNIFIED
g=texture2D(panoTex,d(osg_TexCoord0)).b;
#else
g=texture2D(depthTex,osg_TexCoord1).b;
#endif
g*=radMult;if(bInvertDM>0) g=1.0-g;if(bQuadratic>0){if(bQuadratic==1) g=sqrt(g);else g*=g;}g=mix(maxRad,minRad,g);
#endif
return g;}void main(){osg_FragVertex=Vertex;osg_TexCoord0=TexCoord0;osg_TexCoord1=TexCoord0;osg_TexCoord2=TexCoord0;vec3 h=normalize(Normal);vec4 i=vec4(Vertex,1.0);i.xyz=(h*f());h=uModelViewNormalMatrix*Normal;i=uModelViewMatrix*i;gl_Position=uProjectionMatrix*i;}
#endif

#ifdef FRAGMENT_SH
uniform float slopeDiscard;uniform vec3 camPos;uniform vec3 panoPos;uniform float visibility;uniform vec2 DOF;uniform vec4 dimColor;uniform int annotationHash;float j(){
#ifdef DPF_USE_UNIFIED
return texture2D(panoTex,e(osg_TexCoord0)).g;
#else
return texture2D(annTex,osg_TexCoord2).g;
#endif
}float j(vec2 k){
#ifdef DPF_USE_UNIFIED
return texture2D(panoTex,k).g;
#else
return texture2D(annTex,k).g;
#endif
}vec4 l(float m){float n=6.0;float o=mod(m,n);int p=int(o);float q=0.2;if(p==0) return vec4(q,q,1.0,1.0);if(p==1) return vec4(q,1.0,q,1.0);if(p==2) return vec4(1.0,q,q,1.0);if(p==3) return vec4(q,1.0,1.0,1.0);if(p==4) return vec4(1.0,1.0,q,1.0);if(p==5) return vec4(1.0,q,1.0,1.0);}vec3 r(vec3 s,float t){const vec3 u=vec3(0.2125,0.7154,0.0721);vec3 v=vec3(dot(s,u));return mix(v,s,t);}vec3 w(vec3 s,float x){return ((s-0.5)*x)+0.5;}int y(float z,vec2 k){if(z<=DPF_ANN_HASH) return 0;float A=j(k);if(A==0.0) return 0;float B=(A*255.0)*DPF_ANN_HASH;float C=floor(z);float D=floor(B);if(abs(C-D)>0.0) return 0;return 1;}vec4 E(float F){int G;
#ifdef DPF_USE_UNIFIED
G=y(F,e(osg_TexCoord2));
#else
G=y(F,osg_TexCoord2);
#endif
if(G==0) return vec4(0,0,0,0);vec4 H;float I=(sin(time*8.0)+1.0);I*=0.5;H=l(F);H=mix(H*0.3,H*0.8,I);return H;}void main(void){vec4 J;float K=(maxRad-minRad)*DPF_RAD_SCALE;float L=(gl_FragCoord.z/gl_FragCoord.w);float M=L/K;
#ifdef DPF_USE_UNIFIED
J=texture2D(panoTex,a(osg_TexCoord0));
#else
#ifdef DPF_MOBILE_DEVICE
J=texture2D(panoTex,osg_TexCoord0);
#else
float N=DOF.y-L;N=abs(N);if(DOF.y<0.2) N=0.0;float O=clamp((N*DOF.x),0.0,5.0);if(DOF.x<=0.0) J=texture2D(panoTex,osg_TexCoord0);else J=texture2D(panoTex,osg_TexCoord0,O);
#endif
#endif
float P=j();if(bAnnotationVision>0){float Q=0.0;if(P>0.0) Q=0.5;J=vec4(P,(1.0-M),Q,1);}if(bDepthVision>0){J=texture2D(depthTex,osg_TexCoord1.xy);float R=(L-minRad)/K;J.g=1.0-R;}float S;
#ifdef DPF_USE_UNIFIED
S=texture2D(panoTex,d(osg_TexCoord1)).r;
#else
S=texture2D(depthTex,osg_TexCoord1).r;
#endif
float t=1.0-S;if(t>=slopeDiscard) t=1.0;else discard;if(visibility<=0.0) discard;if(bAnnotationVision==0){float T=float(annotationHash);vec4 U=E(T);J+=(0.2*U);float V=min(dimColor.a,1.0-U.a);J=mix(J,dimColor,V);}J.a=visibility*t;gl_FragColor=J;}
#endif
