
#define DPF_ANN_HASH	0.3 //0.3

#define DPF_RAD_SCALE	100.0

#define DPF_ANN_H		128.0

#ifdef GL_ES
precision mediump float;precision mediump int;
#endif
varying vec2 osg_TexCoord0,osg_TexCoord1,osg_TexCoord2;varying vec3 osg_FragVertex;varying vec4 vVertexWorld;uniform vec3 uWorldEyePos;uniform vec3 uViewDir;uniform sampler2D panoTex;uniform sampler2D depthTex;uniform sampler2D annTex;uniform float time;uniform float minRad;uniform float maxRad;uniform int bActive;uniform int bQuadratic;uniform int bInvertDM;uniform int bUseComboUnit;uniform int bAnnotationVision;uniform int bDepthVision;
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
return g;}void main(){osg_FragVertex=Vertex;osg_TexCoord0=TexCoord0;osg_TexCoord1=TexCoord0;osg_TexCoord2=TexCoord0;vec3 h=normalize(Normal);vVertexWorld=vec4(Vertex,1.0);vVertexWorld.xyz=(h*f());h=uModelViewNormalMatrix*Normal;gl_Position=uProjectionMatrix*(uModelViewMatrix*vVertexWorld);}
#endif

#ifdef FRAGMENT_SH
uniform float slopeDiscard;uniform float visibility;uniform vec2 DOF;uniform vec4 dimColor;uniform int annotationHash;float i(){
#ifdef DPF_USE_UNIFIED
return texture2D(panoTex,e(osg_TexCoord0)).g;
#else
return texture2D(annTex,osg_TexCoord2).g;
#endif
}float i(vec2 j){
#ifdef DPF_USE_UNIFIED
return texture2D(panoTex,j).g;
#else
return texture2D(annTex,j).g;
#endif
}vec4 k(float l){float m=6.0;float n=mod(l,m);int o=int(n);float p=0.2;if(o==0) return vec4(p,p,1.0,1.0);if(o==1) return vec4(p,1.0,p,1.0);if(o==2) return vec4(1.0,p,p,1.0);if(o==3) return vec4(p,1.0,1.0,1.0);if(o==4) return vec4(1.0,1.0,p,1.0);if(o==5) return vec4(1.0,p,1.0,1.0);}vec3 q(vec3 r,float s){const vec3 t=vec3(0.2125,0.7154,0.0721);vec3 u=vec3(dot(r,t));return mix(u,r,s);}vec3 v(vec3 r,float w){return ((r-0.5)*w)+0.5;}int x(float y,vec2 j){if(y<=DPF_ANN_HASH) return 0;float z=i(j);if(z==0.0) return 0;float A=(z*255.0)*DPF_ANN_HASH;float B=floor(y);float C=floor(A);if(abs(B-C)>0.0) return 0;return 1;}vec4 D(float E){int F;
#ifdef DPF_USE_UNIFIED
F=x(E,e(osg_TexCoord2));
#else
F=x(E,osg_TexCoord2);
#endif
if(F==0) return vec4(0,0,0,0);vec4 G;float H=(sin(time*8.0)+1.0);H*=0.5;G=vec4(0.2,1.0,0.2,1.0);G=mix(G*0.3,G*0.8,H);return G;}void main(void){vec4 I;float J=(maxRad-minRad)*DPF_RAD_SCALE;float K=(gl_FragCoord.z/gl_FragCoord.w);float L=K/J;
#ifdef DPF_USE_UNIFIED
I=texture2D(panoTex,a(osg_TexCoord0));
#else
#ifdef DPF_MOBILE_DEVICE
I=texture2D(panoTex,osg_TexCoord0);
#else
float M=DOF.y-K;M=abs(M);if(DOF.y<0.2) M=0.0;float N=clamp((M*DOF.x),0.0,5.0);if(DOF.x<=0.0) I=texture2D(panoTex,osg_TexCoord0);else I=texture2D(panoTex,osg_TexCoord0,N);
#endif
#endif
float O=i();if(bAnnotationVision>0){float P=0.0;if(O>0.0) P=0.5;I=vec4(O,(1.0-L),P,1);}if(bDepthVision>0){I=texture2D(depthTex,osg_TexCoord1.xy);float Q=(K-minRad)/J;I.g=1.0-Q;}float R;
#ifdef DPF_USE_UNIFIED
R=texture2D(panoTex,d(osg_TexCoord1)).r;
#else
R=texture2D(depthTex,osg_TexCoord1).r;
#endif
float s=1.0-R;if(s>=slopeDiscard) s=1.0;else discard;if(visibility<=0.0) discard;if(bAnnotationVision==0){float S=float(annotationHash);vec4 T=D(S);I+=(0.2*T);float U=min(dimColor.a,1.0-T.a);I=mix(I,dimColor,U);}I.a=visibility*s;gl_FragColor=I;}
#endif
