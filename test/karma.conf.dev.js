/*jslint eqeq:true,node:true,es5:true,white:true,plusplus:true,nomen:true,unparam:true,devel:true,regexp:true */
"use strict";

/** karma conf to use during continuous testing */

module.exports=function(config){
    require('./karma.conf')(config);
    config.set({    coverageReporter: {
        type:'text',
        dir:'coverage/'
    }});
};

