
#define DPF_ANN_HASH	0.3 //0.3

#define DPF_RAD_SCALE	100.0

#define DPF_ANN_H		128.0

#ifdef GL_ES
precision mediump float;precision mediump int;
#endif
varying vec2 osg_TexCoord0,osg_TexCoord1,osg_TexCoord2;varying vec3 osg_FragVertex;varying vec3 vVertexWorld;uniform vec3 uWorldEyePos;uniform vec3 uQueryDir;uniform vec3 uFocusPos;uniform sampler2D baseSampler;uniform sampler2D depthSampler;uniform sampler2D semanticSampler;uniform float time;uniform float minRad;uniform float maxRad;uniform int bActive;uniform int bQuadratic;uniform int bInvertDM;uniform int bUseComboUnit;uniform int bAnnotationVision;uniform int bDepthVision;
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
attribute vec3 Normal;attribute vec3 Vertex;attribute vec2 TexCoord0;uniform mat3 uModelViewNormalMatrix;uniform mat4 uProjectionMatrix;uniform mat4 uModelViewMatrix;uniform mat4 uModelMatrix;uniform float radMult;float f(){float g;
#ifdef DPF_MOBILE_DEVICE
g=maxRad;
#else
#ifdef DPF_USE_UNIFIED
g=texture2D(baseSampler,d(osg_TexCoord0)).b;
#else
g=texture2D(depthSampler,osg_TexCoord1).b;
#endif
g*=radMult;if(bInvertDM>0) g=1.0-g;if(bQuadratic>0){if(bQuadratic==1) g=sqrt(g);else g*=g;}g=mix(maxRad,minRad,g);
#endif
return g;}void main(){osg_FragVertex=Vertex;osg_TexCoord0=TexCoord0;osg_TexCoord1=TexCoord0;osg_TexCoord2=TexCoord0;vec3 h=normalize(Normal);vec4 i=vec4((h*f()),1.0);h=uModelViewNormalMatrix*Normal;vVertexWorld=vec3(uModelMatrix*i);gl_Position=uProjectionMatrix*(uModelViewMatrix*i);}
#endif

#ifdef FRAGMENT_SH
uniform float slopeDiscard;uniform float visibility;uniform vec2 DOF;uniform vec4 dimColor;uniform vec4 annActiveColor;uniform vec4 annInactiveColor;uniform int annotationHash;float j(){
#ifdef DPF_USE_UNIFIED
return texture2D(baseSampler,e(osg_TexCoord0)).g;
#else
return texture2D(semanticSampler,osg_TexCoord2).g;
#endif
}float j(vec2 k){
#ifdef DPF_USE_UNIFIED
return texture2D(baseSampler,k).g;
#else
return texture2D(semanticSampler,k).g;
#endif
}vec4 l(float m){float n=6.0;float o=mod(m,n);int p=int(o);float q=0.2;if(p==0) return vec4(q,q,1.0,1.0);if(p==1) return vec4(q,1.0,q,1.0);if(p==2) return vec4(1.0,q,q,1.0);if(p==3) return vec4(q,1.0,1.0,1.0);if(p==4) return vec4(1.0,1.0,q,1.0);if(p==5) return vec4(1.0,q,1.0,1.0);}vec3 r(vec3 s,float t){const vec3 u=vec3(0.2125,0.7154,0.0721);vec3 v=vec3(dot(s,u));return mix(v,s,t);}vec3 w(vec3 s,float x){return ((s-0.5)*x)+0.5;}int y(float z,vec2 k){if(z<=DPF_ANN_HASH) return 0;float A=j(k);if(A==0.0) return 0;float B=(A*255.0)*DPF_ANN_HASH;float C=floor(z);float D=floor(B);if(abs(C-D)>0.0) return 0;return 1;}vec4 E(float F){int G;float H=0.0;vec4 I=vec4(0,0,0,0);
#ifdef DPF_USE_UNIFIED
G=y(F,e(osg_TexCoord2));H=texture2D(semanticSampler,e(osg_TexCoord2)).r;
#else
G=y(F,osg_TexCoord2);H=texture2D(semanticSampler,osg_TexCoord2).r;
#endif
float J=sin(time*2.0);vec4 K=(annInactiveColor+J);if(G==0){if(H>0.0) I+=(K*annInactiveColor.a);return I;}float L=(sin(time*8.0)+1.0);L*=0.5;L*=annActiveColor.a;I=(annActiveColor*L);return I;}void main(void){vec4 M;float N=(maxRad-minRad)*DPF_RAD_SCALE;float O=(gl_FragCoord.z/gl_FragCoord.w);float P=O/N;
#ifdef DPF_USE_UNIFIED
M=texture2D(baseSampler,a(osg_TexCoord0));
#else
#ifdef DPF_MOBILE_DEVICE
M=texture2D(baseSampler,osg_TexCoord0);
#else
float Q=DOF.y-O;Q=abs(Q);if(DOF.y<0.2) Q=0.0;float R=clamp((Q*DOF.x),0.0,5.0);if(DOF.x<=0.0) M=texture2D(baseSampler,osg_TexCoord0);else M=texture2D(baseSampler,osg_TexCoord0,R);
#endif
#endif
float S=j();if(bAnnotationVision>0){float T=0.0;if(S>0.0) T=0.5;M=vec4(S,(1.0-P),T,1);}if(bDepthVision>0){M=texture2D(depthSampler,osg_TexCoord1.xy);float U=(O-minRad)/N;M.g=1.0-U;}float V;
#ifdef DPF_USE_UNIFIED
V=texture2D(baseSampler,d(osg_TexCoord1)).r;
#else
V=texture2D(depthSampler,osg_TexCoord1).r;
#endif
float t=1.0-V;if(t>=slopeDiscard) t=1.0;else discard;if(visibility<=0.0) discard;vec4 W=vec4(0.2,0.2,0.2,0.0);if(bAnnotationVision==0){float X=float(annotationHash);vec4 Y=E(X);M+=(0.2*Y);float Z=min(dimColor.a,1.0-Y.a);M=mix(M,dimColor,Z);if(annotationHash>0) W=Y*0.5;W+=M;if(uFocusPos.z>0.0){vec3 ba=normalize(uWorldEyePos-vVertexWorld);float bb=abs(dot(ba,uQueryDir));float bc=0.002/O;float bd=smoothstep(1.0-bc,1.0,bb);M=mix(M,W,bd);}else{
#ifndef DPF_MOBILE_DEVICE 
float be=distance(gl_FragCoord.xy,uFocusPos.xy);float bf=100.0/O;be=clamp(be,0.0,bf)/bf;be*=be;M=mix(W,M,be);
#endif
}M.a=visibility*t;}gl_FragColor=M;}
#endif
