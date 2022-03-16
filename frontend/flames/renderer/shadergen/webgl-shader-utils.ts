
export interface CloseableBuffers {
    closeBuffers(): void
}

export function initGL(canvas: HTMLCanvasElement): WebGLRenderingContext {
    // @ts-ignore
    window.requestAnimFrame = window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(callback, element) { setTimeout(callback, 1000 / 60); };
    try {
        var webglOptions = { antialias: false, depth: false /*, preserveDrawingBuffer: true*/};

        var gl =  canvas.getContext("webgl", webglOptions) || canvas.getContext("experimental-webgl", webglOptions);

        // @ts-ignore
        gl.viewportWidth = canvas.width;
        // @ts-ignore
        gl.viewportHeight = canvas.height;
        // @ts-ignore
        var ext = gl.getExtension("OES_texture_float");
    } catch (e) {
        console.log(e)
    } finally {
        // @ts-ignore
        if (!gl) {
            console.log("Could not initialise WebGL");
        }

        // @ts-ignore
        return gl;
    }
}


function template(str: string, replacements: any): string{
    for (var prop in replacements) {
        var val = replacements[prop];

        if (typeof val == "number" && String(val).indexOf(".") == -1) {
            val = val + ".0";
        }

        str = str.replace(new RegExp("<%= " + prop + " %>", "g"), val);
    }

    return str;
}

function getFragmentShaderDirect(gl: WebGLRenderingContext, source: string, templateOptions: any) {
    var str = source;

    str = template(str, templateOptions);

    var shader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(shader!, str);
    gl.compileShader(shader!);

    if (!gl.getShaderParameter(shader!, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader!));
        return null;
    }

    return shader;
}

function getVertexShaderDirect(gl: WebGLRenderingContext, source: string, templateOptions: any) {
    var str = source;

    str = template(str, templateOptions);

    var shader = gl.createShader(gl.VERTEX_SHADER);

    gl.shaderSource(shader!, str);
    gl.compileShader(shader!);

    if (!gl.getShaderParameter(shader!, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader!));
        return null;
    }

    return shader;
}

export function compileShaderDirect(gl: WebGLRenderingContext, vs: string, fs: string, templateOptions: any): WebGLProgram {
    var prog = gl.createProgram();

    gl.attachShader(prog!, getVertexShaderDirect(gl, vs, templateOptions)!);
    gl.attachShader(prog!, getFragmentShaderDirect(gl, fs, templateOptions)!);

    gl.linkProgram(prog!);

    if (!gl.getProgramParameter(prog!, gl.LINK_STATUS)) {
        throw new Error("Could not initialise shaders");
    }

    return prog!;
}