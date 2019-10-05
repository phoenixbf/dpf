/*	
    DPF Vertex and Fragment Shaders

	bruno.fanini@gmail.com

===============================================================================
    COMMON
===============================================================================*/

//#define DPF_MOBILE_DEVICE 1

#define DPF_ANN_HASH	0.3 //0.3

#define DPF_RAD_SCALE	100.0
#define DPF_ANN_H		128.0

#ifdef GL_ES
precision mediump float; // mediump
precision mediump int;
#endif


varying vec2 osg_TexCoord0, osg_TexCoord1, osg_TexCoord2;
varying vec3 osg_FragVertex;
varying vec3 vVertexWorld;

uniform vec3 uWorldEyePos;
uniform vec3 uQueryDir;

//uniform vec2 uCanvasRes;
uniform vec3 uFocusPos; // px,py, 3Dmode (1.0 = enabled)

uniform sampler2D baseSampler;          // 0
uniform sampler2D depthSampler;         // 1
uniform sampler2D semanticSampler;      // 2

uniform float time;

uniform float minRad;
uniform float maxRad;

// bool
uniform int bActive;
uniform int bQuadratic;
uniform int bInvertDM;
uniform int bUseComboUnit;
uniform int bAnnotationVision;
uniform int bDepthVision;


// Use Offset (Combo pano single unit)
#ifdef DPF_USE_UNIFIED

    #define DPF_H_COLOR		0.5
    #define DPF_H_DEPTH		0.125
    #define DPF_H_ANN		0.375

    #define DPF_OFFS_COLOR	0.0     // 0.5
    #define DPF_OFFS_DEPTH	0.875   // 0.0
    #define DPF_OFFS_ANN	0.5     // 0.125

    vec2 mapColorUV(vec2 tc){
        vec2 r;
        r.x = tc.x;
        r.y = (tc.y * DPF_H_COLOR) + DPF_OFFS_COLOR;
        return r;
    }
    vec2 mapDepthUV(vec2 tc){
        vec2 r;
        r.x = tc.x;
        r.y = (tc.y * DPF_H_DEPTH) + DPF_OFFS_DEPTH;
        return r;
    }
    vec2 mapAnnUV(vec2 tc){
        vec2 r;
        r.x = tc.x;
        r.y = (tc.y * DPF_H_ANN) + DPF_OFFS_ANN;
        return r;
    }

#endif

// From https://www.shadertoy.com/view/XsfGDn
/*
vec2 filteredUV(vec2 uv, float textureResolution){
	vec2 UV = (uv*textureResolution) + 0.5;
	vec2 iuv = floor( UV );
	vec2 fuv = fract( UV );
	UV = iuv + fuv*fuv*(3.0-2.0*fuv); // fuv*fuv*fuv*(fuv*(fuv*6.0-15.0)+10.0);
	UV = (UV - 0.5)/textureResolution;
	//UV.y = (UV - 0.5)/textureResolution.y;

	return UV;
	//return texture2D( isampler, uv );
}
*/


/*===============================================================================
    VERTEX Shader
===============================================================================*/
#ifdef VERTEX_SH
attribute vec3 Normal;
attribute vec3 Vertex;

attribute vec2 TexCoord0;
//attribute vec2 TexCoord1;

uniform mat3 uModelViewNormalMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uModelViewMatrix;
uniform mat4 uModelMatrix;

uniform float radMult;

float getDepth(){
    float d;

// Note: GL_MAX_VERTEX_TEXTURE_IMAGE_UNITS doesnt allow texfetch on mobile VS
//#ifdef DPF_MOBILE_DEVICE
//    d = maxRad;
//#else

#ifdef DPF_USE_UNIFIED
    d = texture2D(baseSampler, mapDepthUV(osg_TexCoord0)).b;
#else
    d = texture2D(depthSampler, osg_TexCoord1).b;
#endif

    d *= radMult;
    
/*
    if (bInvertDM>0) d = 1.0 - d;
    if (bQuadratic>0){
        if (bQuadratic==1) d = sqrt(d);
        else d *= d;
        }
*/
    d = sqrt(d);

    d = mix(maxRad,minRad, d);
//#endif

    return d;
}


void main(){
    osg_FragVertex = Vertex;
    osg_TexCoord0 = TexCoord0;
    osg_TexCoord1 = TexCoord0;
    osg_TexCoord2 = TexCoord0;
    
    vec3 normal = normalize(Normal);
    
    //vVertexWorld = Vertex;
    //vVertexWorld = vec3(uModelMatrix * vec4(Vertex, 1.0));
    vec4 vVertex = vec4((normal * getDepth()), 1.0);
    normal = uModelViewNormalMatrix * Normal;

    vVertexWorld = vec3(uModelMatrix * vVertex);

    gl_Position = uProjectionMatrix * (uModelViewMatrix * vVertex ); //* vVertexWorld;
}
#endif




/*===============================================================================
    FRAGMENT Shader
===============================================================================*/
#ifdef FRAGMENT_SH

uniform float slopeDiscard;
//uniform vec3 camPos;
//uniform vec3 panoPos;

uniform float visibility;
uniform vec2 DOF;           // (weight, dist)
uniform vec4 dimColor;

uniform vec4 annActiveColor;
uniform vec4 annInactiveColor;

//uniform vec2 vCanvasSize;

uniform int annotationHash; // highlighted annotation hash



float getAnnotationNormalizedValue(){
#ifdef DPF_USE_UNIFIED
    return texture2D(baseSampler, mapAnnUV(osg_TexCoord0)).g;
#else
    return texture2D(semanticSampler, osg_TexCoord2).g;
#endif
}

float getAnnotationNormalizedValue(vec2 coords){
#ifdef DPF_USE_UNIFIED
    return texture2D(baseSampler,coords).g;
#else
    return texture2D(semanticSampler,coords).g;
#endif
}

/*
vec4 hashColor(float m){
    float n=6.0;
    float o=mod(m,n);
    int p=int(o);
    float q=0.2;
    if (p==0) return vec4(q,q,1.0,1.0);
    if (p==1) return vec4(q,1.0,q,1.0);
    if (p==2) return vec4(1.0,q,q,1.0);
    if (p==3) return vec4(q,1.0,1.0,1.0);
    if (p==4) return vec4(1.0,1.0,q,1.0);
    if (p==5) return vec4(1.0,q,1.0,1.0);
}


vec3 colSaturate(vec3 rgb, float t){
    const vec3 u = vec3(0.2125,0.7154,0.0721);
    vec3 v = vec3(dot(rgb,u));
    return mix(v,rgb, t);
}

vec3 colContrast(vec3 rgb,float x){
    return ((rgb-0.5)*x) + 0.5;
}
*/

//
int maskAnnotation(float hashedvalue, vec2 coords){
	if (hashedvalue <= DPF_ANN_HASH) return 0;

	float baseAnn  = getAnnotationNormalizedValue(coords);
	if (baseAnn == 0.0) return 0;

	float baseHash = (baseAnn * 255.0) * DPF_ANN_HASH;

	float A = floor(hashedvalue);
	float B = floor(baseHash);

	if ( abs(A-B) > 0.0) return 0;

	return 1;
}

vec4 AnnotationColor(float hashedint){
//vec4 E(float m){
    int b;
    float aV = 0.0;
    vec4 C = vec4(0,0,0,0);
    
#ifdef DPF_USE_UNIFIED
    b = maskAnnotation(hashedint, mapAnnUV(osg_TexCoord2));
    aV = texture2D(semanticSampler, mapAnnUV(osg_TexCoord2)).r;
#else
    b = maskAnnotation(hashedint, osg_TexCoord2);
    aV = texture2D(semanticSampler, osg_TexCoord2).r;
#endif

    //float aT = (0.3 * sin(time*2.0));
    float aInactivePeriod = sin(time*2.0);
    vec4 aIC = (annInactiveColor + aInactivePeriod);

    if ( b == 0 ){
        if (aV > 0.0) C += (aIC * annInactiveColor.a); // weight
        
        return C; // No annotation
        }
    
    float f = (sin(time*8.0) + 1.0);
    f *= 0.5;

    f *= annActiveColor.a; // weight

    //C = mix(vec4(0,1,0, 1), vec4(0,0,1, 1), f);
    C = (annActiveColor * f); //hashColor(hashedint);

    //C = mix(C*0.3, C*0.8, f);
    return C;
}



// MAIN
//==================
void main(void){
    vec4 col;

    float dRange = (maxRad-minRad)*DPF_RAD_SCALE;
    float dFrag  = (gl_FragCoord.z/gl_FragCoord.w);
    float D      = dFrag/dRange;

#ifdef DPF_USE_UNIFIED
    col = texture2D(baseSampler, mapColorUV(osg_TexCoord0) );
#else
#ifdef DPF_MOBILE_DEVICE
    col = texture2D(baseSampler,osg_TexCoord0);
#else
    float dofDD = DOF.y - dFrag;
    dofDD = abs(dofDD);
    if (DOF.y < 0.2) dofDD=0.0;

    float dofV = clamp((dofDD*DOF.x), 0.0, 5.0);

    if (DOF.x <= 0.0) col = texture2D(baseSampler,osg_TexCoord0);
    else col = texture2D(baseSampler, osg_TexCoord0, dofV);
#endif

#endif

    float aN = getAnnotationNormalizedValue();

    if(bAnnotationVision>0){
        float aB = 0.0;
        if(aN>0.0) aB = 0.5;

        col = vec4(aN, (1.0-D), aB, 1);
        }
        
    if(bDepthVision>0){
        col = texture2D(depthSampler, osg_TexCoord1.xy);

        float dd = (dFrag-minRad)/dRange;
        col.g = 1.0-dd;
        }
    
    float s;

#ifdef DPF_USE_UNIFIED
    s = texture2D(baseSampler, mapDepthUV(osg_TexCoord1)).r;
#else
    s = texture2D(depthSampler, osg_TexCoord1).r;
#endif


#if 0
    float t = 1.0-s;
    //t *= t;

    if (t >= slopeDiscard) t = 1.0;
    //else t += (1.0-slopeDiscard);
    else discard;

    if (visibility<=0.0) discard;
#endif

    //=============================== Highlight Annotation pass
    vec4 focCol = vec4(0.2,0.2,0.2, 0.0);

    if(bAnnotationVision==0){
        float h = float(annotationHash);
        vec4 annCol = AnnotationColor(h);

        col += (0.2 * annCol);

        float T = min(dimColor.a, 1.0-annCol.a);

        col = mix(col,dimColor, T);

        if (annotationHash > 0) focCol = annCol*0.5;


        //=========================== Pointer pass
        focCol += col;

        if (uFocusPos.z > 0.0){
            vec3 vv = normalize(uWorldEyePos - vVertexWorld);
            float pArea = abs(dot(vv,uQueryDir));
            float discSize = 0.002 / dFrag; //(dFrag * dFrag);

            float pT = smoothstep(1.0-discSize,1.0, pArea);

            col = mix(col, focCol, pT);
            } 
#ifndef DPF_MOBILE_DEVICE 
        else {

            float dFoc = distance(gl_FragCoord.xy, uFocusPos.xy);
            float rT = 100.0 / dFrag; // disc size

            dFoc = clamp(dFoc, 0.0, rT) / rT;
            dFoc *= dFoc;
            col = mix(focCol, col, dFoc );

            }
#endif

        //=========================== Alpha pass
        //t = clamp(t, 0.0,1.0);
        
        
        col.a = visibility; // * t; /// mix(0.0,t, visibility);
        }


/*
#ifndef DPF_MOBILE_DEVICE
    focCol += col;

    vec2 foc2D = vec2(uFocusPos.x * uCanvasRes.x, uFocusPos.y * uCanvasRes.y);

    float dFoc = distance(gl_FragCoord.xy, foc2D);
    
    float rT = 100.0 / dFrag; // disc size

    dFoc = clamp(dFoc, 0.0, rT) / rT;
    dFoc *= dFoc;
    col = mix(focCol, col, dFoc );
#endif
*/

    // Finalize
    gl_FragColor = col;
}
#endif
