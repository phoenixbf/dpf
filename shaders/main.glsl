
#define DPF_ANN_HASH	0.3 //0.3

#define DPF_RAD_SCALE	100.0

#define DPF_ANN_H		128.0
precision mediump float;precision mediump int;varying vec2 osg_TexCoord0,osg_TexCoord1,osg_TexCoord2;varying vec3 osg_FragVertex;uniform sampler2D panoTex;uniform sampler2D depthTex;uniform sampler2D annTex;uniform float time;uniform float minRad;uniform float maxRad;uniform int bActive;uniform int bQuadratic;uniform int bInvertDM;uniform int bUseComboUnit;uniform int bAnnotationVision;uniform int bDepthVision;
#ifdef DPF_USE_UNIFIED

#define DPF_H_COLOR		0.5

#define DPF_H_DEPTH		0.125

#define DPF_H_ANN		0.375

#define DPF_OFFS_COLOR	0.0 // 0.5

#define DPF_OFFS_DEPTH	0.875 // 0.0

#define DPF_OFFS_ANN	0.5 // 0.125
vec2 a(vec2 b){vec2 c;c.x=b.x;c.y=(b.y*DPF_H_COLOR)+DPF_OFFS_COLOR;return c;}vec2 d(vec2 b){vec2 c;c.x=b.x;c.y=(b.y*DPF_H_DEPTH)+DPF_OFFS_DEPTH;return c;}vec2 e(vec2 b){vec2 c;c.x=b.x;c.y=(b.y*DPF_H_ANN)+DPF_OFFS_ANN;return c;}
#endif

#ifdef VERTEX_SH
attribute vec3 Normal;attribute vec3 Vertex;attribute vec2 TexCoord0,TexCoord1,TexCoord2;uniform mat4 uModelViewNormalMatrix;uniform mat4 uProjectionMatrix;uniform mat4 uModelViewMatrix;uniform float radMult;float f(){float g;
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
return g;}void main(){osg_FragVertex=Vertex;osg_TexCoord0=TexCoord0;osg_TexCoord1=TexCoord0;osg_TexCoord2=TexCoord0;vec3 h=normalize(Normal);vec4 i=vec4(Vertex,1.0);i.xyz=(h*f());h=vec3(uModelViewNormalMatrix*vec4(Normal,1.0));i=uModelViewMatrix*i;gl_Position=uProjectionMatrix*i;}
#endif

#ifdef FRAGMENT_SH
uniform float slopeDiscard;uniform vec3 camPos;uniform vec3 panoPos;uniform float visibility;uniform vec2 DOF;uniform int annotationHash;float j(){
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
}int l(float m,vec2 k){if(m<=DPF_ANN_HASH) return 0;float n=j(k);if(n==0.0) return 0;float o=(n*255.0)*DPF_ANN_HASH;float p=floor(m);float q=floor(o);if(abs(p-q)>0.0) return 0;return 1;}vec4 r(float s){int t;
#ifdef DPF_USE_UNIFIED
t=l(s,e(osg_TexCoord2));
#else
t=l(s,osg_TexCoord2);
#endif
if(t==0) return vec4(0,0,0,1);vec4 u;float v=(sin(time*2.0)+1.0);v*=0.5;u=mix(vec4(0,1,0,1),vec4(0,0,1,1),v);return u;}void main(void){vec4 w;float x=(maxRad-minRad)*DPF_RAD_SCALE;float y=(gl_FragCoord.z/gl_FragCoord.w);float z=y/x;
#ifdef DPF_USE_UNIFIED
w=texture2D(panoTex,a(osg_TexCoord0));
#else
#ifdef DPF_MOBILE_DEVICE
w=texture2D(panoTex,osg_TexCoord0);
#else
float A=DOF.y-y;A=abs(A);if(DOF.y<0.2) A=0.0;float B=clamp((A*DOF.x),0.0,5.0);if(DOF.x<=0.0) w=texture2D(panoTex,osg_TexCoord0);else w=texture2D(panoTex,osg_TexCoord0,B);
#endif
#endif
if(bAnnotationVision>0){float C=j();float D=0.0;if(C>0.0) D=0.5;w=vec4(C,(1.0-z),D,1);}if(bDepthVision>0){w=texture2D(depthTex,osg_TexCoord1.xy);float z=(y-minRad)/x;w.g=1.0-z;}float E;
#ifdef DPF_USE_UNIFIED
E=texture2D(panoTex,d(osg_TexCoord1)).r;
#else
E=texture2D(depthTex,osg_TexCoord1).r;
#endif
float F=1.0-E;if(F>=slopeDiscard) F=1.0;else discard;if(visibility<=0.0) discard;if(bAnnotationVision==0){w+=(0.2*r(float(annotationHash)));}w.a=visibility*F;gl_FragColor=w;}
#endif
