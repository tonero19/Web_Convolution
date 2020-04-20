//Author: Nicola Giaconi
//Last revision: 11/11/2017
//Math functions for Web-based Convolution Demonstrator

//ZERO_PADDING
function zeroPad(x1, x2){
    /*
    This function zero-pads the input arrays
    @input x1: []Number
        input array to be zero-padded
    @input x2: []Number
        input array to be zero-padded
    @return: [2][]Number
        two-dimensional array containing the zero-padded versions of the input arrays
    */
    "use strict";
    x1 = x1.concat(Array(x2.length-1).fill(0));
    x2 = x2.concat(Array(x1.length-1).fill(0));
    return [x1,x2];
}

//FLIPPING ARRAY
function flip(x){
    /*
    This function flips the order of the elements of the input array
    @input x: []Number
        input array to be flipped
    @return: []Number
        index-reversed array of the input array
    */
    "use strict";
    const N = x.length;
    const x_flipped = Array(N);
    for(let i=0 ; i<N ; ++i){
        x_flipped[N-i-1] = x[i];
    }
    return x_flipped;
}

//CONVOLUTION
function conv(x1, x2){
    /*
    This function performs the linear convolution of the input arrays
    @input x1: []Number
        input array to be convolved
    @input x2: []Number
        input array to be convolved
    @return: []Number
        result of the convolution between the input arrays
    */
    "use strict";
    const x = zeroPad(x1,x2);
    x1 = x[0];
    x2 = x[1];
    const N = x[0].length;
    const y = Array(N).fill(0);
    for(let n=0 ; n<N ; ++n){
        for(let k=0 ; k<N ; ++k){
            if(k>n){
                break;
            }
            y[n] += x1[k]*x2[n-k];
        }
    }
    return y;
}

//CORRELATION
function xcorr(x1, x2){
    /*
    This function performs the cross-correlation of the input arrays
    @input x1: []Number
        input array to be cross-correlated
    @input x2: []Number
        input array to be cross-correlated
    @return: []Number
        result of the cross-correlation between the input arrays
    */
    "use strict";
    const x = zeroPad(x1,flip(x2));
    x1 = x[0];
    x2 = x[1];
    const N = x[0].length;
    const y = Array(N).fill(0);
    for(let n=0 ; n<N ; ++n){
        for(let k=0 ; k<N ; ++k){
            if(k>n){
                break;
            }
            y[n] += x1[k]*x2[n-k];
        }
    }
    return y;
}

//ELEM-WISE MULTIPLICATION
function elemWiseMultiplication(x1, x2){
    /*
    This function performs the element-wise multiplication of the input arrays
    @input x1: []Number
        input array
    @input x2: []Number
        input array
    @return: []Number
        result of the operation between the input arrays
    */
    "use strict";
    //flip(x2); //extra: toggle to flip 2nd input array
    const N = x1.length;
    const y = Array(2*N-1).fill(0);
    for(let i=0 ; i<N ; ++i){
        y[Math.floor(N/2)-1+i] = x1[i]*x2[i];
    }
    return y;
}

//RECT FUNCTION
function rect(x, width=1, shift=0){
    /*
    This function returns the rectangular-function of the input array, centered on shift, and of width w.
    @input x: []Number
        input array, argument of the rectangular-function
    @input width: Number
        width parameter of the rectangular-function, default value 1
    @input shift: Number
        shift parameter of the rectangular-function, default value 0
    @return: []Number
        result of applying the rectangular-function to the input array
    */
    const N = x.length;
    const y = Array(N);
    let delta;
    for(let i=0 ; i<N ; ++i){
        delta = Math.abs((x[i]-shift)/width);
        if(delta > 1/2){
            y[i] = 0;
        }
        else if(delta == 1/2){
            y[i] = 1/2;
        }
        else{
            y[i] = 1;
        }
    }
    return y;
}

//TRIANGLE FUNCTION
function tri(x, width=1, shift=0){
    /*
    This function returns the triangle-function of the input array, centered on shift, and of width w.
    @input x: []Number
        input array, argument of the triangular-function
    @input width: Number
        width parameter of the triangular-function, default value 1
    @input shift: Number
        shift parameter of the triangular-function, default value 0
    @return: []Number
        result of applying the triangle-function to the input array
    */
    const N = x.length;
    const y = Array(N);
    let delta;
    for(let i=0 ; i<N ; ++i){
        delta = (x[i]-shift)/width;
        if(Math.abs(delta) > 1/2){
            y[i] = 0;
        }
        else if(delta >= 0 && delta <= 1/2){
            y[i] = 1-2*delta;
        }
        else if(delta < 0 && delta >= -1/2){
            y[i] = 1+2*delta;
        }
    }
    return y;
}

//STEP FUNCTION
function step(x, shift=0) {
    /*
    This function returns the step-function of the input array, centered on shift
    @input x: []Number
        input array, argument of the step-function
    @input shift: Number
        shift parameter of the step-function, default value 0
    @return: []Number
        result of applying the step-function to the input array
    */
    const N = x.length;
    const y = Array(N);
    let delta;
    for(let i=0 ; i<N ; ++i){
        delta = x[i]-shift;
        if(delta >= 0){
            y[i] = 1;
        }
        else{
            y[i] = 0;
        }
    }
    return y;
}

//SINC FUNCTION
function sinc(x, width=1, shift=0) {
    /*
    This function returns the sinc-function of the input array, centered on shift, and of width w.
    @input x: []Number
        input array, argument of the sinc-function
    @input width: Number
        width parameter of the sinc-function, default value 1
    @input shift: Number
        shift parameter of the sinc-function, default value 0
    @return: []Number
        result of applying the sinc-function to the input array
    */
    const N = x.length;
    const y = Array(N);
    let delta;
    for(let i=0 ; i<N ; ++i){
        delta = (x[i]-shift)/width;
        if(delta == 0){
            y[i] = 1;
        }
        else{
            y[i] = Math.sin(delta)/delta;
        }
    }
    return y;
}

//NORMALIZED GAUSSIAN FUNCTION
function gaussian(x, vari=1, expect=0) {
    /*
    This function returns the normalised gaussian function of the input array, with variance vari and expectation expect
    @input x: []Number
        input array, argument of the gaussian function
    @input vari: Number
        variance parameter of the gaussian function, default value 1
    @input expect: Number
        expectation parameter of the gaussian function, default value 0
    @return: []Number
        result of applying the gaussian function to the input array
    */
    const N = x.length;
    const y = Array(N);
    for(let i=0;i<N;++i){
        y[i] = Math.exp(-Math.pow((x[i]-expect),2)/(2*vari))/(Math.sqrt(2*Math.PI*vari));
    }
    return y;
}

//DIRAC FUNCTION
function dirac(x, shift=0) {
    /*
    This function returns the dirac-function of the input array, centered on shift
    @input x: []Number
        input array, argument of the dirac-function
    @input shift: Number
        shift parameter of the dirac-function, default value 0
    @return: []Number
        result of applying the dirac-function to the input array
    */
    const N = x.length;
    const y = Array(N);
    let hit = false;
    for(let i=0 ; i<N ; ++i){
        if(x[i]>=shift && hit==false){
            y[i] = 1;
            hit = true;
        }
        else{
            y[i] = 0;
        }
    }
    return y;
}

//DIRAC-COMB FUNCTION
function diracComb(x) {
    /*
    This function returns the dirac-comb function of the input array
    @input x: []Number
        input array, argument of the dirac-comb function
    @return: []Number
        result of applying the dirac-comb function to the input array
    */
    "use strict";
    const N = x.length;
    const y = Array(N);
    let xMin = Math.ceil(Math.min.apply(Math,x));
    for(let i=0 ; i<N ; ++i){
        if(x[i]<xMin){
            y[i] = 0;
        }
        else{
            y[i] = 1;
            ++xMin;
        }
    }
    return y;
}

//ONE-SIDED DECREASING EXPONENTIAL FUNCTION
function oneSidedExp(x, rate=1){
    /*
    This function returns the one-sided exponential function of the input array
    @input x: []Number
        input array, argument of the one-sided exponential function
    @input rate: Number
        decaying rate parameter of the one-sided exponential function, default value 1
    @return: []Number
        result of applying the one-sided exponential function to the input array
    */
    const N = x.length;
    const y = Array(N);
    for(let i=0 ; i<N ; ++i){
        if(x[i]<0){
            y[i] = 0;
        }
        else{
            y[i] = Math.exp(-Math.abs(rate)*x[i]);
        }
    }
    return y;
}
